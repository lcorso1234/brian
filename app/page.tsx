"use client";

import { type FormEvent, useState } from "react";

type Contact = {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  websites: string[];
};

const DEFAULT_CONTACT: Contact = {
  firstName: "Brian",
  lastName: "Bartosz",
  company: "Best-Tronics Mfg., Inc.",
  phone: "708-802-9677",
  email: "brian@best-tronics.com",
  websites: ["https://www.best-tronics.com", "https://www.btpa.com"],
};

function escapeVCardValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function normalizeSmsNumber(value: string) {
  return value.trim().replace(/(?!^\+)[^\d]/g, "");
}

function prettyWebsite(value: string) {
  return value.replace(/^https?:\/\//, "");
}

function parseContactFromLocation() {
  if (typeof window === "undefined") {
    return DEFAULT_CONTACT;
  }

  const params = new URLSearchParams(window.location.search);
  const websites = params.get("websites");

  return {
    firstName: params.get("first") || DEFAULT_CONTACT.firstName,
    lastName: params.get("last") || DEFAULT_CONTACT.lastName,
    company: params.get("company") || DEFAULT_CONTACT.company,
    phone: params.get("phone") || DEFAULT_CONTACT.phone,
    email: params.get("email") || DEFAULT_CONTACT.email,
    websites: websites
      ? websites
          .split(",")
          .map((site) => site.trim())
          .filter(Boolean)
      : DEFAULT_CONTACT.websites,
  };
}

function buildVCard(contact: Contact) {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "PRODID:-//Best-Tronics//Contact Share//EN",
    `N:${escapeVCardValue(contact.lastName)};${escapeVCardValue(contact.firstName)};;;`,
    `FN:${escapeVCardValue(`${contact.firstName} ${contact.lastName}`.trim())}`,
    `ORG:${escapeVCardValue(contact.company)}`,
    `TEL;TYPE=CELL,VOICE:${escapeVCardValue(contact.phone)}`,
    `EMAIL;TYPE=INTERNET,WORK:${escapeVCardValue(contact.email)}`,
    ...contact.websites.map(
      (site) => `URL;TYPE=WORK:${escapeVCardValue(site)}`,
    ),
    `REV:${new Date().toISOString()}`,
    "END:VCARD",
  ];

  // CRLF line endings improve import reliability in iOS Contacts and Samsung Messages previews.
  return `${lines.join("\r\n")}\r\n`;
}

function downloadContact(contact: Contact) {
  const blob = new Blob([buildVCard(contact)], {
    type: "text/vcard;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fileName = `${contact.firstName}_${contact.lastName}_${contact.company}`
    .replace(/[^\w.-]+/g, "_")
    .replace(/_+/g, "_");

  link.href = url;
  link.download = `${fileName}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildShareUrl(contact: Contact) {
  const url = new URL(window.location.origin);

  url.searchParams.set("first", contact.firstName);
  url.searchParams.set("last", contact.lastName);
  url.searchParams.set("company", contact.company);
  url.searchParams.set("phone", contact.phone);
  url.searchParams.set("email", contact.email);
  url.searchParams.set("websites", contact.websites.join(","));

  return url.toString();
}

function isAppleMobileDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isTouchMac =
    /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;

  return isIOS || isTouchMac;
}

function isMobileDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function buildSmsHref(recipientPhone: string, body: string) {
  const number = normalizeSmsNumber(recipientPhone);
  const separator = isAppleMobileDevice() ? "&" : "?";

  return `sms:${number}${separator}body=${encodeURIComponent(body)}`;
}

export default function Home() {
  const [contact, setContact] = useState<Contact>(parseContactFromLocation);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState("");
  const [sharePhone, setSharePhone] = useState(contact.phone);
  const [shareEmail, setShareEmail] = useState(contact.email);
  const [statusMessage, setStatusMessage] = useState("");

  const contactDetails = [
    { label: "First Name", value: contact.firstName },
    { label: "Last Name", value: contact.lastName },
    { label: "Company Name", value: contact.company },
    { label: "Phone Number", value: contact.phone },
    {
      label: "Website(s)",
      value: contact.websites,
    },
    { label: "Email", value: contact.email },
  ];

  const handleSaveContact = () => {
    downloadContact(contact);
    setStatusMessage("Contact download started.");

    if (isMobileDevice()) {
      setShowSharePrompt(true);
    }
  };

  const handleShareByText = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextContact = {
      ...contact,
      phone: sharePhone.trim(),
      email: shareEmail.trim(),
    };
    const shareUrl = buildShareUrl(nextContact);
    const fullName = `${nextContact.firstName} ${nextContact.lastName}`.trim();
    const messageBody = [
      `Save ${fullName} from ${nextContact.company}:`,
      shareUrl,
      "",
      `Phone: ${nextContact.phone}`,
      `Email: ${nextContact.email}`,
    ].join("\n");

    setContact(nextContact);
    setStatusMessage("Opening your SMS app with the contact link prefilled.");
    window.location.href = buildSmsHref(recipientPhone, messageBody);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <main className="relative w-full max-w-md">
        <div
          className="pointer-events-none absolute inset-x-8 -bottom-8 h-24 rounded-full bg-black/70 blur-3xl"
          aria-hidden
        />
        <div className="card-shell relative overflow-hidden rounded-[32px] border border-white/10 px-8 py-10">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(57,255,20,0.35), transparent 45%)",
            }}
          />
          <div className="absolute inset-x-14 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-80" />
          <div className="relative flex flex-col gap-8">
            <header className="space-y-4">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/60">
                <span className="h-1 w-6 rounded-full bg-[var(--accent)]" />
                Best-Tronics
              </div>
              <h1 className="space-y-1 text-3xl font-semibold leading-tight">
                <span className="block text-sm font-medium text-white/70">
                  Cables Assemblies &amp; Contract Manufacturing
                </span>
                <span className="block text-4xl font-semibold">
                  Professional Audio Cables
                </span>
              </h1>
              <p className="text-sm leading-6 text-white/70">
                Save the contact first, then optionally send a text with a
                contact link the recipient can open and import.
              </p>
            </header>

            <section className="space-y-3">
              {contactDetails.map(({ label, value }) => (
                <article
                  key={label}
                  className="flex items-start justify-between gap-4 rounded-3xl border border-white/5 bg-white/5 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-white/55">
                      {label}
                    </p>
                  </div>
                  <div className="text-right text-base font-semibold text-white">
                    {Array.isArray(value) ? (
                      <div className="space-y-1">
                        {value.map((item) => (
                          <p key={item} className="text-sm text-white">
                            {prettyWebsite(item)}
                          </p>
                        ))}
                      </div>
                    ) : (
                      value
                    )}
                  </div>
                </article>
              ))}
            </section>

            <section className="space-y-3">
              <button
                type="button"
                onClick={handleSaveContact}
                className="save-contact-button group flex w-full items-center justify-between gap-4 rounded-3xl border-2 border-[var(--accent)] bg-[var(--accent)]/90 px-6 py-4 text-left text-base font-semibold text-black shadow-[0_20px_45px_rgba(57,255,20,0.55)] transition hover:-translate-y-0.5 hover:bg-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                aria-label={`Download ${contact.firstName} ${contact.lastName} contact card`}
              >
                <span>
                  Save Contact
                  <span className="ml-1 text-sm text-black/70">(vCard)</span>
                </span>
                <svg
                  className="h-6 w-6 transition group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="m18 13-6 6-6-6" />
                </svg>
              </button>

              {statusMessage ? (
                <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
                  {statusMessage}
                </p>
              ) : null}
            </section>

            {showSharePrompt ? (
              <section className="rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.32em] text-white/55">
                    Text This Contact
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    Compose the SMS share
                  </h2>
                  <p className="text-sm leading-6 text-white/70">
                    Samsung Messages and iPhone use slightly different SMS link
                    formats, so this form builds the right version before it
                    opens your messaging app.
                  </p>
                </div>

                <form className="mt-5 space-y-4" onSubmit={handleShareByText}>
                  <label className="block space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                      Recipient Mobile Number
                    </span>
                    <input
                      type="tel"
                      required
                      value={recipientPhone}
                      onChange={(event) => setRecipientPhone(event.target.value)}
                      placeholder="312-555-0100"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-[var(--accent)] focus:bg-white/10"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                      Contact Email
                    </span>
                    <input
                      type="email"
                      required
                      value={shareEmail}
                      onChange={(event) => setShareEmail(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-[var(--accent)] focus:bg-white/10"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                      Contact Phone Number
                    </span>
                    <input
                      type="tel"
                      required
                      value={sharePhone}
                      onChange={(event) => setSharePhone(event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/30 focus:border-[var(--accent)] focus:bg-white/10"
                    />
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      className="flex-1 rounded-2xl border border-[var(--accent)] bg-[var(--accent)] px-4 py-3 text-base font-semibold text-black transition hover:-translate-y-0.5"
                    >
                      Open Text Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSharePrompt(false)}
                      className="rounded-2xl border border-white/10 px-4 py-3 text-base font-semibold text-white/75 transition hover:border-white/30 hover:text-white"
                    >
                      Maybe Later
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            <footer className="space-y-1 border-t border-white/5 pt-5 text-center text-sm tracking-[0.32em] text-white/65">
              <p>BUILT IN AMERICA, ON EARTH.</p>
              <p className="font-serif text-[13px] italic tracking-wide text-white/80">
                Making relationships built to last, the American Way.
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

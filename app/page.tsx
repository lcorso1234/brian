"use client";

export default function Home() {
  const websites = ["www.best-tronics.com", "www.btpa.com"];

  const contactDetails = [
    { label: "First Name", value: "Brian" },
    { label: "Last Name", value: "Bartosz" },
    { label: "Company Name", value: "Best-Tronics Mfg., Inc." },
    { label: "Phone Number", value: "708-802-9677" },
    {
      label: "Website(s)",
      value: websites,
    },
    { label: "Email", value: "brian@best-tronics.com" },
  ];

  const handleSaveContact = () => {
    const vCardContent = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Bartosz;Brian;;;",
      "FN:Brian Bartosz",
      "ORG:Best-Tronics Mfg., Inc.",
      "EMAIL;TYPE=PREF,WORK:brian@best-tronics.com",
      ...websites.map((site) => `URL:${site}`),
      "END:VCARD",
    ].join("\n");

    const blob = new Blob([vCardContent], {
      type: "text/vcard;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Brian_Bartosz_Best-Tronics.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                            {item}
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
                aria-label="Download Brian Bartosz contact card"
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
            </section>

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

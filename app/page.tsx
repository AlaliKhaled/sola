import ClientScene from "@/components/ClientScene";
import FlavorShowcase from "@/components/FlavorShowcase";
import ReservePour from "@/components/ReservePour";
import Reveal from "@/components/Reveal";

const faqs = [
  {
    q: "What exactly is in a can of SOLA?",
    a: "Spring water, lightly sparkled, with pressed fruit and steeped herbs — plus a touch of cane sugar. Five ingredients or fewer, all printed on the can. Never flavour syrups or anything you can't pronounce.",
  },
  {
    q: "How sweet is it, really?",
    a: "Barely. Each can is around 40 calories with a single touch of cane sugar — lightly sweet, never cloying. It's built to taste like the fruit and herbs, not like dessert.",
  },
  {
    q: "Where can I buy it?",
    a: "Direct from us by the case, delivered chilled to your door. We're also rolling out to independent cafés and grocers — join the list below and we'll tell you when SOLA lands near you.",
  },
  {
    q: "How is the mixed case delivered?",
    a: "Twelve cans — four of each flavour — packed cold and shipped in fully recyclable trays. Free delivery on your first case.",
  },
];

const promises = [
  {
    title: "Real botanicals",
    body: "Pressed fruit and steeped herbs — never flavour syrups.",
    icon: (
      <path d="M12 2c3 4 6 6 6 10a6 6 0 1 1-12 0c0-4 3-6 6-10Z" />
    ),
  },
  {
    title: "40 calories",
    body: "A touch of cane sugar. Lightly sweet, never cloying.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8M12 8v8" />
      </>
    ),
  },
  {
    title: "Nothing to hide",
    body: "Five ingredients or fewer. Every one of them on the can.",
    icon: (
      <>
        <path d="m9 12 2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-cream text-espresso">
      {/* ---------- header ---------- */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="font-display text-2xl tracking-tight">SOLA</span>
        <nav className="hidden items-center gap-9 text-sm text-espresso-soft sm:flex">
          <a className="transition-colors hover:text-espresso" href="#flavors">
            Flavours
          </a>
          <a className="transition-colors hover:text-espresso" href="#reserve">
            Reserve
          </a>
          <a className="transition-colors hover:text-espresso" href="#story">
            Our story
          </a>
          <a className="transition-colors hover:text-espresso" href="#faq">
            FAQ
          </a>
          <a className="transition-colors hover:text-espresso" href="#join">
            Join
          </a>
        </nav>
        <a
          href="#shop"
          className="cursor-pointer rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          Shop
        </a>
      </header>

      {/* ---------- hero ---------- */}
      <section className="relative grid min-h-screen grid-cols-1 items-center gap-4 px-6 pt-24 sm:px-10 lg:grid-cols-2 lg:pt-0">
        <div className="order-2 max-w-xl lg:order-1">
          <p className="mb-5 flex items-center gap-2 text-xs font-medium tracking-[0.3em] text-terracotta">
            <span className="h-px w-8 bg-terracotta" />
            SPARKLING BOTANICALS
          </p>
          <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            Soda,
            <br />
            but grown up.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-espresso-soft">
            Real fruit, steeped herbs and spring water — gently sparkling,
            barely sweet. Something to slow down with.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#shop"
              className="cursor-pointer rounded-full bg-terracotta px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-deep"
            >
              Try the mixed case
            </a>
            <a
              href="#flavors"
              className="cursor-pointer rounded-full border border-espresso/20 px-7 py-3.5 text-sm font-medium text-espresso transition-colors hover:border-espresso/50"
            >
              Meet the flavours
            </a>
          </div>
        </div>

        <div className="order-1 h-[46vh] w-full lg:order-2 lg:h-screen">
          <ClientScene />
        </div>
      </section>

      {/* ---------- promises strip ---------- */}
      <section className="border-y border-espresso/10 bg-cream-deep">
        <Reveal className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-3 sm:px-10">
          {promises.map((p) => (
            <div key={p.title} className="flex flex-col gap-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-terracotta"
                aria-hidden="true"
              >
                {p.icon}
              </svg>
              <h3 className="font-display text-xl">{p.title}</h3>
              <p className="text-sm leading-relaxed text-espresso-soft">
                {p.body}
              </p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ---------- flavours (scroll-driven cinematic showcase) ---------- */}
      <FlavorShowcase />

      {/* ---------- reserve bottle (live R3F pour, scrubbed on scroll) ---------- */}
      <ReservePour />

      {/* ---------- story ---------- */}
      <section
        id="story"
        className="bg-espresso px-6 py-28 text-cream sm:px-10"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 text-xs font-medium tracking-[0.3em] text-terracotta">
              OUR STORY
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              Born from a slow
              <br />
              afternoon.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-cream/75">
            <p>
              SOLA started in a small kitchen, steeping rosemary and blood
              orange because the fridge was full of drinks that tried too hard.
            </p>
            <p>
              We wanted something quieter — lightly sparkling, honestly
              flavoured, with nothing you can&apos;t pronounce. Four years
              later, that&apos;s still the whole brief.
            </p>
            <a
              href="#shop"
              className="inline-flex cursor-pointer items-center gap-2 pt-2 text-sm font-medium text-terracotta transition-colors hover:text-cream"
            >
              Read the full story
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section
        id="faq"
        className="border-t border-espresso/10 bg-cream-deep px-6 py-24 sm:px-10"
      >
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs font-medium tracking-[0.3em] text-terracotta">
              GOOD TO KNOW
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              Questions,
              <br />
              answered.
            </h2>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-espresso-soft">
              Everything you might want to know before your first sip. Still
              curious? Drop us a line — we read every message.
            </p>
          </div>

          <Reveal className="flex flex-col" y={24} stagger={0.1}>
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group border-b border-espresso/15 py-5 [&_svg]:open:rotate-45"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left font-display text-xl leading-snug marker:hidden">
                  {f.q}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-5 w-5 shrink-0 text-terracotta transition-transform duration-300"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </summary>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-espresso-soft">
                  {f.a}
                </p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------- join us ---------- */}
      <section
        id="join"
        className="relative overflow-hidden bg-espresso px-6 py-28 text-cream sm:px-10"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07] select-none"
          aria-hidden="true"
        >
          <div className="whitespace-nowrap text-center font-display text-[13vw] leading-[0.9]">
            Join us · Join us
          </div>
          <div className="whitespace-nowrap text-center font-display text-[13vw] leading-[0.9]">
            Join us · Join us
          </div>
        </div>

        <div className="relative mx-auto max-w-2xl text-center" id="shop">
          <p className="mb-5 text-xs font-medium tracking-[0.3em] text-terracotta">
            JOIN THE SOLA LIST
          </p>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            Taste the whole range.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-cream/70">
            A mixed case of twelve — four of each flavour — delivered chilled to
            your door. Join the list for first dibs, new flavours and the
            occasional good thing.
          </p>
          <form
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
            aria-label="Join the SOLA list"
          >
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@email.com"
              className="w-full rounded-full border border-cream/20 bg-cream/5 px-6 py-3.5 text-sm text-cream placeholder:text-cream/40 focus:border-terracotta focus:outline-none"
            />
            <button
              type="submit"
              className="cursor-pointer rounded-full bg-terracotta px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-deep"
            >
              Get first dibs
            </button>
          </form>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer
        id="stockists"
        className="border-t border-espresso/10 px-6 py-12 sm:px-10"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-display text-xl">SOLA</span>
          <p className="text-sm text-espresso-soft">
            © {new Date().getFullYear()} SOLA Drinks Co. · Sparkling botanicals.
          </p>
          <div className="flex gap-6 text-sm text-espresso-soft">
            <a className="transition-colors hover:text-espresso" href="#">
              Instagram
            </a>
            <a className="transition-colors hover:text-espresso" href="#">
              Stockists
            </a>
            <a className="transition-colors hover:text-espresso" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

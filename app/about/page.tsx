"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ───────────────────────────────────────────
   ANIMATION HELPERS
   ─────────────────────────────────────────── */

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.15 } },
};

/* Gold particles */
function GoldParticles({ count = 25 }: { count?: number }) {
  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 2,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            backgroundColor: "rgba(201, 169, 110, 0.08)",
          }}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 0.08, 0.08, 0] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* Gold divider */
function GoldDivider({ inView }: { inView: boolean }) {
  return (
    <div className="w-24 h-px mx-auto my-8 overflow-hidden">
      <motion.div
        className="h-full"
        style={{ backgroundColor: "#c9a96e" }}
        initial={{ width: 0 }}
        animate={inView ? { width: "100%" } : { width: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
      />
    </div>
  );
}

/* Eyebrow label */
function Eyebrow({
  text,
  inView,
  delay = 0,
}: {
  text: string;
  inView: boolean;
  delay?: number;
}) {
  return (
    <motion.span
      className="font-mono text-sm uppercase block"
      style={{ color: "#c9a96e" }}
      initial={{ letterSpacing: "0.1em", opacity: 0 }}
      animate={
        inView
          ? { letterSpacing: "0.2em", opacity: 1 }
          : { letterSpacing: "0.1em", opacity: 0 }
      }
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
}

/* Magnetic CTA button */
function MagneticButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxMove = 8;
    const x = ((e.clientX - centerX) / (rect.width / 2)) * maxMove;
    const y = ((e.clientY - centerY) / (rect.height / 2)) * maxMove;
    setPosition({ x, y });
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      className="relative inline-flex items-center justify-center px-12 py-5 rounded-full font-mono text-sm uppercase overflow-hidden"
      style={{
        letterSpacing: "0.2em",
        backgroundColor: "#f28fb5",
        color: "#0d0b17",
        x: position.x,
        y: position.y,
      }}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      animate={{ scale: [1, 1.04, 1] }}
      transition={{
        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10 font-bold">{children}</span>
    </motion.a>
  );
}

/* Card shimmer */
function CardShimmer({ inView }: { inView: boolean }) {
  const [hasShimmered, setHasShimmered] = useState(false);
  useEffect(() => {
    if (inView && !hasShimmered) setHasShimmered(true);
  }, [inView, hasShimmered]);
  if (!hasShimmered) return null;
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-y-0 w-32"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)",
        }}
        initial={{ left: "-10%" }}
        animate={{ left: "110%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.div>
  );
}

/* Drifting background glow */
function DriftingGlow() {
  return (
    <>
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(83, 74, 183, 0.15) 0%, transparent 60%)",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 50%", "50% 100%", "0% 0%"],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none opacity-20"
        animate={{
          background: [
            "radial-gradient(ellipse 60% 40% at 30% 30%, rgba(242, 143, 181, 0.1) 0%, transparent 50%)",
            "radial-gradient(ellipse 60% 40% at 70% 60%, rgba(242, 143, 181, 0.1) 0%, transparent 50%)",
            "radial-gradient(ellipse 60% 40% at 40% 70%, rgba(242, 143, 181, 0.1) 0%, transparent 50%)",
            "radial-gradient(ellipse 60% 40% at 30% 30%, rgba(242, 143, 181, 0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </>
  );
}

/* ───────────────────────────────────────────
   NAVIGATION
   ─────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Problem", href: "/#problem" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Sample Brief", href: "/#sample-brief" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Pricing", href: "/#pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "mailto:kyle@sendlore.com" },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(13, 11, 23, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(42, 35, 64, 0.5)" : "1px solid transparent",
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <span
            className="font-serif text-2xl font-light tracking-wide"
            style={{ color: "#e8e4f4" }}
          >
            L
            <span style={{ color: "#f28fb5" }}>O</span>
            R
            <span style={{ color: "#c9a96e" }}>E</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono text-xs uppercase transition-colors duration-200 hover:text-[#f28fb5]"
              style={{ letterSpacing: "0.15em", color: "#9890ab" }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/intake"
            className="font-mono text-xs font-bold uppercase px-6 py-2.5 rounded-full transition-all duration-200 hover:scale-105"
            style={{
              letterSpacing: "0.15em",
              backgroundColor: "#f28fb5",
              color: "#0d0b17",
            }}
          >
            Build Your Brief
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <motion.span
            className="w-5 h-px block"
            style={{ backgroundColor: "#e8e4f4" }}
            animate={mobileOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className="w-5 h-px block"
            style={{ backgroundColor: "#e8e4f4" }}
            animate={mobileOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <motion.div
        className="md:hidden overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: mobileOpen ? "auto" : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-6 pb-6 flex flex-col gap-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-mono text-sm uppercase py-2 transition-colors hover:text-[#f28fb5]"
              style={{ letterSpacing: "0.15em", color: "#9890ab" }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/intake"
            onClick={() => setMobileOpen(false)}
            className="font-mono text-sm font-bold uppercase px-5 py-3 rounded-full text-center"
            style={{
              letterSpacing: "0.15em",
              backgroundColor: "#f28fb5",
              color: "#0d0b17",
            }}
          >
            Build Your Brief
          </a>
        </div>
      </motion.div>
    </motion.nav>
  );
}

/* ───────────────────────────────────────────
   SECTIONS
   ─────────────────────────────────────────── */

function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden"
      style={{ backgroundColor: "#0d0b17" }}
    >
      <GoldParticles />
      <CardShimmer inView={inView} />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp}>
          <Eyebrow text="About LORE" inView={inView} />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-serif text-5xl md:text-7xl font-light leading-tight mt-6 mb-8"
          style={{ color: "#e8e4f4" }}
        >
          The Story Behind{" "}
          <span style={{ color: "#c9a96e" }}>LORE</span>
        </motion.h1>

        <GoldDivider inView={inView} />

        <motion.p
          variants={fadeUp}
          className="font-sans text-lg md:text-xl font-light"
          style={{ color: "#d2cfe0" }}
        >
          How one question about standing out in a crowded inbox became a platform that transforms cold outreach into unforgettable experiences.
        </motion.p>
      </motion.div>
    </section>
  );
}

function OriginSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 overflow-hidden"
      style={{ backgroundColor: "#110d1f" }}
    >
      <GoldParticles count={15} />
      <CardShimmer inView={inView} />

      <motion.div
        className="max-w-4xl mx-auto relative z-10"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp} className="mb-16">
          <Eyebrow text="The Origin" inView={inView} />
        </motion.div>

        <div className="space-y-8">
          <motion.p
            variants={fadeUp}
            className="font-serif text-3xl md:text-4xl font-light leading-relaxed"
            style={{ color: "#e8e4f4" }}
          >
            I was preparing to reach out to a C-level executive about a role. I had the resume. I had the experience. I had the pitch.
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="font-sans text-lg font-light leading-relaxed"
            style={{ color: "#d2cfe0" }}
          >
            But I realized something that changed everything: in today&apos;s AI-saturated, spam-filled job market, a cold email or LinkedIn DM just wasn&apos;t going to cut it. Everyone was sending AI-generated resumes and cover letters. Everyone sounded the same. Everyone got ignored.
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="font-sans text-lg font-light leading-relaxed"
            style={{ color: "#d2cfe0" }}
          >
            So I asked myself a different question:{" "}
            <span style={{ color: "#c9a96e" }}>
              What if instead of sending a pitch, you sent an experience?
            </span>{" "}
            What if you could show someone you&apos;ve done real homework on them—their company, their challenges, their opportunities—and present it in a way that&apos;s impossible to ignore?
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="font-sans text-lg font-light leading-relaxed"
            style={{ color: "#d2cfe0" }}
          >
            That was the moment LORE was born.
          </motion.p>

          <GoldDivider inView={inView} />

          <motion.p
            variants={fadeUp}
            className="font-serif text-2xl md:text-3xl font-light leading-relaxed"
            style={{ color: "#e8e4f4" }}
          >
            LORE transforms cold outreach into cinematic intelligence briefs—hyper-researched, beautifully designed web experiences built for one person. Not a template. Not a pitch. An experience.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

function WhyItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    {
      stat: "1–5%",
      label: "Average cold email reply rate",
      context: "Most cold outreach gets ignored. Templated pitches hit the delete button before they&apos;re ever read.",
      source: "Backlinko, Woodpecker industry reports",
      color: "#f28fb5",
    },
    {
      stat: "80%",
      label: "Of B2B buyers prefer personalized outreach",
      context: "Decision-makers actively reward the people who do homework—and ignore the ones who don&apos;t.",
      source: "Salesforce State of the Connected Customer",
      color: "#c9a96e",
    },
    {
      stat: "6x",
      label: "Higher response rates for personalized messages",
      context: "Tailored outreach that references real details about the recipient consistently outperforms generic templates by a wide margin.",
      source: "Experian, HubSpot benchmarks",
      color: "#7B6FD4",
    },
    {
      stat: "90%",
      label: "Of hiring managers value research over resumes",
      context: "Recruiters and executives say candidates who demonstrate deep knowledge of the company stand out more than those with perfect credentials.",
      source: "LinkedIn Global Talent Trends",
      color: "#f28fb5",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 overflow-hidden"
      style={{ backgroundColor: "#0d0b17" }}
    >
      <GoldParticles count={18} />

      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp} className="text-center mb-6">
          <Eyebrow text="Why LORE Works" inView={inView} />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-4xl md:text-5xl font-light leading-tight text-center mb-6"
          style={{ color: "#e8e4f4" }}
        >
          Cold email is{" "}
          <em className="italic font-normal" style={{ color: "#f28fb5" }}>
            broken.
          </em>
          <br />
          Research{" "}
          <em className="italic font-normal" style={{ color: "#c9a96e" }}>
            wins.
          </em>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-sans text-lg font-light text-center max-w-2xl mx-auto mb-16"
          style={{ color: "#9890ab" }}
        >
          The numbers tell a clear story: generic outreach fails, and decision-makers reward the people who show they&apos;ve done their homework.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="p-8 rounded-xl border"
              style={{
                backgroundColor: "rgba(20, 15, 35, 0.6)",
                borderColor: "rgba(201, 169, 110, 0.15)",
              }}
            >
              <div
                className="font-serif text-5xl md:text-6xl font-light mb-3"
                style={{ color: s.color }}
              >
                {s.stat}
              </div>
              <div
                className="font-mono text-xs uppercase mb-4"
                style={{ letterSpacing: "0.15em", color: "#d2cfe0" }}
              >
                {s.label}
              </div>
              <p
                className="font-sans text-base font-light leading-relaxed mb-3"
                style={{ color: "#9890ab" }}
                dangerouslySetInnerHTML={{ __html: s.context }}
              />
              <p
                className="font-mono text-[10px] uppercase"
                style={{ letterSpacing: "0.15em", color: "#6b6380" }}
              >
                Source: {s.source}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          variants={fadeUp}
          className="font-serif text-2xl md:text-3xl font-light italic text-center mt-16 max-w-3xl mx-auto leading-relaxed"
          style={{ color: "#e8e4f4" }}
        >
          LORE was built for the way decision-makers{" "}
          <span style={{ color: "#c9a96e" }}>actually</span> want to be reached.
        </motion.p>
      </motion.div>
    </section>
  );
}

function MissionSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 overflow-hidden"
      style={{ backgroundColor: "#0f0b1a" }}
    >
      <GoldParticles count={15} />
      <CardShimmer inView={inView} />

      <motion.div
        className="max-w-4xl mx-auto relative z-10"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp} className="mb-16">
          <Eyebrow text="The Mission" inView={inView} />
        </motion.div>

        <motion.div variants={fadeUp} className="text-center">
          <h2
            className="font-serif text-4xl md:text-6xl font-light leading-tight"
            style={{ color: "#e8e4f4" }}
          >
            Make Every First Impression{" "}
            <span style={{ color: "#f28fb5" }}>Unforgettable</span>
          </h2>
        </motion.div>

        <GoldDivider inView={inView} />

        <motion.p
          variants={fadeUp}
          className="font-sans text-lg font-light text-center max-w-2xl mx-auto"
          style={{ color: "#d2cfe0" }}
        >
          LORE is for anyone who refuses to be another message in the inbox: job seekers who want to stand out, salespeople who want to break through, and creators who want to land dream partnerships.
        </motion.p>
      </motion.div>
    </section>
  );
}

function PhilosophySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const pillars = [
    {
      title: "Research Over Templates",
      description: "Deep insight beats generic copy. Every brief is custom, specific, and earned.",
      accent: "#c9a96e",
    },
    {
      title: "Experience Over Pitch",
      description: "Show, don't tell. A beautifully designed brief demonstrates your effort in a way words alone cannot.",
      accent: "#f28fb5",
    },
    {
      title: "One-to-One Over Mass",
      description: "Personalization at scale isn't personal. One perfectly crafted brief beats a thousand template emails.",
      accent: "#534AB7",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 overflow-hidden"
      style={{ backgroundColor: "#110d1f" }}
    >
      <GoldParticles count={15} />
      <CardShimmer inView={inView} />

      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp} className="mb-16 text-center">
          <Eyebrow text="The Philosophy" inView={inView} />
          <h2
            className="font-serif text-4xl md:text-5xl font-light mt-6"
            style={{ color: "#e8e4f4" }}
          >
            Why LORE Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              className="p-8 rounded-xl border"
              style={{
                borderColor: `${pillar.accent}33`,
                backgroundColor: "rgba(30, 21, 53, 0.3)",
              }}
            >
              <div
                className="w-3 h-3 rounded-full mb-6"
                style={{ backgroundColor: pillar.accent }}
              />
              <h3
                className="font-serif text-2xl font-light mb-4"
                style={{ color: pillar.accent }}
              >
                {pillar.title}
              </h3>
              <p
                className="font-sans text-base font-light"
                style={{ color: "#d2cfe0" }}
              >
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
      style={{ backgroundColor: "#0d0b17" }}
    >
      <GoldParticles count={40} />
      <CardShimmer inView={inView} />

      <motion.div
        className="relative z-10 max-w-2xl mx-auto"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp}>
          <Eyebrow text="Ready?" inView={inView} />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-4xl md:text-6xl font-light mt-6 mb-6"
          style={{ color: "#e8e4f4" }}
        >
          Ready to send something{" "}
          <span style={{ color: "#c9a96e" }}>unforgettable?</span>
        </motion.h2>

        <GoldDivider inView={inView} />

        <motion.p
          variants={fadeUp}
          className="font-sans text-xl font-light max-w-xl mx-auto mb-12"
          style={{ color: "#d2cfe0" }}
        >
          Start building your intelligence brief today. No subscription required.
        </motion.p>

        <motion.div variants={fadeUp}>
          <MagneticButton href="/intake">
            Build Your Brief
          </MagneticButton>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="font-mono text-xs uppercase mt-8"
          style={{ letterSpacing: "0.15em", color: "#9890ab" }}
        >
          Everything you need to get started
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ───────────────────────────────────────────
   PAGE
   ─────────────────────────────────────────── */

export default function About() {
  return (
    <main
      className="relative hide-scrollbar"
      style={{ backgroundColor: "#0d0b17" }}
    >
      <Navbar />
      <DriftingGlow />
      <HeroSection />
      <OriginSection />
      <WhyItWorksSection />
      <MissionSection />
      <PhilosophySection />
      <CTASection />

      {/* Footer */}
      <footer
        className="py-12 text-center border-t"
        style={{ borderColor: "#2a2340", backgroundColor: "#0d0b17" }}
      >
        <p
          className="font-mono text-xs uppercase"
          style={{ letterSpacing: "0.2em", color: "#9890ab" }}
        >
          &copy; {new Date().getFullYear()} LORE &mdash; Intelligence
          Briefs
        </p>
        <a
          href="mailto:kyle@sendlore.com"
          className="inline-block mt-4 font-mono text-xs uppercase transition-colors duration-200 hover:text-[#f28fb5]"
          style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
        >
          kyle@sendlore.com
        </a>
      </footer>
    </main>
  );
}

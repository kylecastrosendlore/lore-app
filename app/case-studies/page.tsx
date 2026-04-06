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
   CASE STUDY CARD
   ─────────────────────────────────────────── */

interface CaseStudy {
  id: string;
  name: string;
  type: "Job Seeker" | "Sales" | "Influencer";
  situation: string;
  company: string;
  brief: string;
  results: { metric: string; value: string }[];
  quote: string;
  color: string; // #f28fb5 for pink, #c9a96e for gold
}

function CaseStudyCard({
  study,
  index,
}: {
  study: CaseStudy;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="relative rounded-xl border p-8 md:p-10 overflow-hidden group"
      style={{
        borderColor: "#2a2340",
        backgroundColor: "rgba(30, 21, 53, 0.3)",
      }}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
    >
      <CardShimmer inView={inView} />

      {/* Badge */}
      <motion.div
        className="inline-flex items-center gap-2 mb-6"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span
          className="font-mono text-xs uppercase px-3 py-1 rounded-full"
          style={{
            letterSpacing: "0.15em",
            backgroundColor: `${study.color}20`,
            color: study.color,
          }}
        >
          {study.type}
        </span>
      </motion.div>

      {/* Name & Company */}
      <motion.div variants={fadeUp} initial="initial" animate={inView ? "animate" : "initial"}>
        <h3 className="font-serif text-2xl md:text-3xl font-light mb-2" style={{ color: "#e8e4f4" }}>
          {study.name}
        </h3>
        <p className="font-mono text-sm mb-6" style={{ color: "#c9a96e" }}>
          {study.company}
        </p>
      </motion.div>

      {/* Situation & Brief */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate={inView ? "animate" : "initial"}
        className="mb-8"
      >
        <p className="font-sans text-sm md:text-base font-light mb-4" style={{ color: "#d2cfe0" }}>
          <span style={{ color: "#9890ab" }} className="font-mono text-xs uppercase mr-2">
            Situation
          </span>
          {study.situation}
        </p>

        <p className="font-sans text-sm md:text-base font-light" style={{ color: "#d2cfe0" }}>
          <span style={{ color: "#9890ab" }} className="font-mono text-xs uppercase mr-2">
            What They Did
          </span>
          {study.brief}
        </p>
      </motion.div>

      {/* Results Grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 p-6 rounded-lg"
        style={{ backgroundColor: "rgba(201, 169, 110, 0.05)" }}
        variants={fadeUp}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        {study.results.map((result, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{
              delay: 0.3 + i * 0.1,
              type: "spring",
              stiffness: 80,
              damping: 20,
            }}
          >
            <div
              className="font-serif text-lg md:text-2xl font-light mb-1"
              style={{ color: study.color }}
            >
              {result.value}
            </div>
            <div
              className="font-mono text-xs uppercase"
              style={{ letterSpacing: "0.15em", color: "#b8b4c8" }}
            >
              {result.metric}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quote */}
      <motion.blockquote
        className="border-l-2 pl-6"
        style={{ borderColor: study.color }}
        variants={fadeUp}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <p className="font-sans italic text-base md:text-lg font-light mb-2" style={{ color: "#e8e4f4" }}>
          "{study.quote}"
        </p>
        <p className="font-mono text-xs uppercase" style={{ letterSpacing: "0.15em", color: "#9890ab" }}>
          — {study.name}
        </p>
      </motion.blockquote>
    </motion.div>
  );
}

/* ───────────────────────────────────────────
   PAGE SECTIONS
   ─────────────────────────────────────────── */

function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-32"
    >
      <CardShimmer inView={inView} />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp} className="mb-8">
          <Eyebrow text="Real Results" inView={inView} />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-serif text-5xl md:text-7xl font-light leading-tight mb-6"
          style={{ color: "#e8e4f4" }}
        >
          How LORE Changed{" "}
          <span style={{ color: "#f28fb5" }}>Everything</span>
        </motion.h1>

        <GoldDivider inView={inView} />

        <motion.p
          variants={fadeUp}
          className="font-sans text-lg md:text-2xl font-light max-w-2xl mx-auto"
          style={{ color: "#d2cfe0" }}
        >
          From job seekers to enterprise salespeople to creators — LORE briefs
          opened doors that traditional outreach couldn't.
        </motion.p>
      </motion.div>
    </section>
  );
}

function CaseStudiesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const cases: CaseStudy[] = [
    {
      id: "marcus",
      name: "Marcus Chen",
      type: "Job Seeker",
      situation:
        "Marcus had 5 years of marketing experience but was losing out to hundreds of other qualified candidates. His cold LinkedIn messages were getting ignored.",
      company: "Bloom Cosmetics",
      brief:
        "Instead of a standard cold message, Marcus created a LORE brief analyzing Bloom's content strategy. He identified that only 6% of their content was video, and provided a comprehensive roadmap showing how to increase that to 40% with projected engagement metrics.",
      results: [
        { metric: "Response Time", value: "24 hrs" },
        { metric: "Interview Secured", value: "Week 1" },
        { metric: "Offer Received", value: "Week 3" },
      ],
      quote:
        "My LORE brief showed I understood their business better than any resume could. It was a conversation starter, not a job application. They called me within a day.",
      color: "#f28fb5",
    },
    {
      id: "ava",
      name: "Ava Rodriguez",
      type: "Sales",
      situation:
        "Ava's SaaS company sold supply chain optimization software, but breaking into Fortune 500 accounts meant fighting through gatekeepers and generic pitch decks that never got opened.",
      company: "Fortune 500 Operations",
      brief:
        "Ava didn't send a pitch deck. She sent a personalized intelligence brief mapping the prospect's specific supply chain inefficiencies using public data, then showed exactly how her product would solve them—with projected cost savings and ROI.",
      results: [
        { metric: "Gatekeeper Bypass", value: "Direct VP" },
        { metric: "Deal Closed", value: "$240K" },
        { metric: "Timeline", value: "6 weeks" },
      ],
      quote:
        "Every VP of Operations wants proof that someone understands their business. LORE made me look like an insider before we even met. The deal was half-closed before our first call.",
      color: "#c9a96e",
    },
    {
      id: "jordan",
      name: "Jordan Park",
      type: "Influencer",
      situation:
        "Jordan had 180K engaged followers in fitness and wellness, but brand deals came in piecemeal. Working with premium athletic brands required proving value beyond follower count.",
      company: "Stride Athletics",
      brief:
        "Jordan sent a LORE brief to Stride Athletics that went beyond pitch deck basics—detailed audience demographics, engagement benchmarks vs. industry standards, and a complete 6-month content collaboration roadmap with specific deliverables and cross-promotion strategy.",
      results: [
        { metric: "Deal Value", value: "$45K" },
        { metric: "Contract Length", value: "6 months" },
        { metric: "Ambassador Status", value: "Secured" },
      ],
      quote:
        "I went from pitching performance metrics to telling a story about why Stride's community needed what I was offering. LORE turned me from an influencer into a strategic partner.",
      color: "#f28fb5",
    },
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24"
      style={{ backgroundColor: "#110d1f" }}
    >
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          variants={stagger}
          initial="initial"
          animate={inView ? "animate" : "initial"}
          className="grid grid-cols-1 gap-8 md:gap-10"
        >
          {cases.map((study, index) => (
            <CaseStudyCard key={study.id} study={study} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-24"
      style={{ backgroundColor: "#0f0b1a" }}
    >
      <CardShimmer inView={inView} />

      <motion.div
        className="relative z-10 max-w-2xl mx-auto"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp} className="mb-6">
          <Eyebrow text="Ready for Your Moment?" inView={inView} />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-4xl md:text-6xl font-light mb-6"
          style={{ color: "#e8e4f4" }}
        >
          Your{" "}
          <span style={{ color: "#c9a96e" }}>breakthrough</span> is waiting.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-sans text-lg font-light mb-10"
          style={{ color: "#d2cfe0" }}
        >
          Build a cinematic brief that turns cold outreach into conversations.
        </motion.p>

        <motion.div variants={fadeUp}>
          <MagneticButton href="/intake">Build Your Brief</MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ───────────────────────────────────────────
   MAIN PAGE
   ─────────────────────────────────────────── */

export default function CaseStudiesPage() {
  return (
    <main className="relative overflow-hidden" style={{ backgroundColor: "#0d0b17" }}>
      <DriftingGlow />
      <div className="relative z-20">
        <Navbar />
        <HeroSection />
        <CaseStudiesSection />
        <CTASection />
      </div>
    </main>
  );
}

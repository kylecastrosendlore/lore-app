"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/* ───────────────────────────────────────────
   ANIMATION HELPERS — same DNA as the briefs
   ─────────────────────────────────────────── */

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.15 } },
};

/* Typewriter — word-by-word like the briefs */
function useTypewriter(
  text: string,
  speed: number = 80,
  inView: boolean,
  delay: number = 0
) {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    let timeoutId: NodeJS.Timeout;
    const startTyping = () => {
      const words = text.split(" ");
      let currentIndex = 0;
      const typeWord = () => {
        if (currentIndex < words.length) {
          setDisplayText(words.slice(0, currentIndex + 1).join(" "));
          currentIndex++;
          timeoutId = setTimeout(typeWord, speed);
        } else {
          setTimeout(() => setShowCursor(false), 500);
        }
      };
      typeWord();
    };
    timeoutId = setTimeout(startTyping, delay);
    return () => clearTimeout(timeoutId);
  }, [text, speed, inView, delay]);

  return { displayText, showCursor };
}

/* Gold particles floating upward */
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

/* Gold divider that draws itself */
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

/* Scroll cue */
function ScrollCue() {
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 3, duration: 0.6 }}
    >
      <span
        className="font-mono text-xs uppercase"
        style={{ letterSpacing: "0.2em", color: "#9890ab" }}
      >
        Scroll
      </span>
      <motion.div
        className="w-px h-8"
        style={{
          background: "linear-gradient(to bottom, #c9a96e, transparent)",
        }}
        animate={{ scaleY: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
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

/* Card shimmer on scroll-in */
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

/* Slot machine number hook */
function useSlotMachine(target: number, duration: number = 800, inView: boolean) {
  const [displayValue, setDisplayValue] = useState(0);
  const [scale, setScale] = useState(1);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      if (progress < 0.8) {
        setDisplayValue(Math.floor(Math.random() * target * 2));
      } else {
        setDisplayValue(target);
        const bounceProgress = (progress - 0.8) / 0.2;
        const bounce = Math.sin(bounceProgress * Math.PI) * 0.1;
        setScale(1 + bounce);
      }
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setScale(1);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration, inView]);

  return { displayValue, scale };
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
    { label: "Problem", href: "#problem" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Sample Brief", href: "#sample-brief" },
    { label: "Pricing", href: "#pricing" },
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
        <a href="#" className="flex items-center gap-3 group">
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
   SECTION COMPONENTS
   ─────────────────────────────────────────── */

function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const { displayText, showCursor } = useTypewriter(
    "Inboxes are graveyards for cold emails.",
    80,
    inView,
    500
  );

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden"
    >
      <GoldParticles />
      <CardShimmer inView={inView} />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        {/* Big LORE brand */}
        <motion.div variants={fadeUp} className="mb-10">
          <motion.h2
            className="font-serif text-6xl md:text-8xl font-light tracking-wide mb-3"
            style={{ color: "#e8e4f4" }}
            animate={{
              textShadow: [
                "0 0 20px rgba(242, 143, 181, 0)",
                "0 0 40px rgba(242, 143, 181, 0.15)",
                "0 0 20px rgba(242, 143, 181, 0)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            L
            <span style={{ color: "#f28fb5" }}>O</span>
            R
            <span style={{ color: "#c9a96e" }}>E</span>
          </motion.h2>
          <Eyebrow text="Intelligence Briefs" inView={inView} />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="font-serif text-5xl md:text-7xl font-light leading-tight mb-8"
          style={{ color: "#e8e4f4" }}
        >
          {displayText}
          {showCursor && (
            <motion.span
              className="inline-block w-[3px] h-[1em] ml-1 align-middle"
              style={{ backgroundColor: "#f28fb5" }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </motion.h1>

        <GoldDivider inView={inView} />

        <motion.p
          variants={fadeUp}
          className="font-sans text-xl md:text-2xl font-light max-w-xl mx-auto mb-12"
          style={{ color: "#d2cfe0" }}
        >
          Job seeker or hiring manager &mdash; LORE replaces forgettable
          outreach with cinematic briefs that get opened, read, and remembered.
        </motion.p>

        <motion.div variants={fadeUp}>
          <MagneticButton href="/intake">
            Build Your Brief
          </MagneticButton>
        </motion.div>
      </motion.div>

      <ScrollCue />
    </section>
  );
}

function ProblemSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { value: "97%", label: "of cold outreach is never opened" },
    { value: "3 sec", label: "before your message gets deleted" },
    { value: "142%", label: "more replies with tailored outreach vs. mass blasts", source: true },
  ];

  return (
    <section
      id="problem"
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24"
      style={{ backgroundColor: "#110d1f" }}
    >
      <CardShimmer inView={inView} />
      <motion.div
        className="relative z-10 max-w-4xl mx-auto"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp}>
          <Eyebrow text="The Problem" inView={inView} />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-4xl md:text-6xl font-light mt-6 mb-6"
          style={{ color: "#e8e4f4" }}
        >
          Your outreach is{" "}
          <span style={{ color: "#f28fb5" }}>invisible.</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-sans text-xl font-light max-w-2xl mx-auto mb-16"
          style={{ color: "#d2cfe0" }}
        >
          Same resume to 200 companies. Same InMail to 200 candidates.
          Everyone sounds the same. Everyone gets ignored.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="p-8 rounded-xl border"
              style={{
                borderColor: "#2a2340",
                backgroundColor: "rgba(30, 21, 53, 0.5)",
              }}
            >
              <motion.div
                className="font-serif text-4xl md:text-5xl font-light mb-3"
                style={{ color: "#f28fb5" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={
                  inView
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                transition={{
                  delay: 0.3 + i * 0.15,
                  type: "spring",
                  stiffness: 80,
                  damping: 20,
                }}
              >
                {stat.value}
              </motion.div>
              <div
                className="font-mono text-xs uppercase"
                style={{ letterSpacing: "0.15em", color: "#b8b4c8" }}
              >
                {stat.label}
              </div>
              {stat.source && (
                <div
                  className="font-mono text-[10px] uppercase mt-2"
                  style={{ color: "#7B6FD4" }}
                >
                  Woodpecker.co 20M email study
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function SolutionSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24"
      style={{ backgroundColor: "#0f0b1a" }}
    >
      <CardShimmer inView={inView} />
      <motion.div
        className="relative z-10 max-w-4xl mx-auto"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp}>
          <Eyebrow text="The LORE Way" inView={inView} />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-4xl md:text-6xl font-light mt-6 mb-6"
          style={{ color: "#e8e4f4" }}
        >
          Not a message.{" "}
          <span style={{ color: "#c9a96e" }}>An experience.</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-sans text-xl font-light max-w-2xl mx-auto mb-16"
          style={{ color: "#d2cfe0" }}
        >
          A cinematic, scroll-driven page built for one person. This is how you stand out.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {[
            {
              icon: "01",
              title: "Hyper-Researched",
              desc: "Real data on the person, their company, and growth signals — not a template.",
            },
            {
              icon: "02",
              title: "Cinematic Design",
              desc: "Scroll-driven animations, self-drawing charts. Spotify Wrapped meets intelligence.",
            },
            {
              icon: "03",
              title: "AI-Powered Intelligence",
              desc: "Our proprietary engine analyzes footprints and generates insights in minutes.",
            },
            {
              icon: "04",
              title: "Delivered as a Link",
              desc: "One URL. No attachments. No spam filters. Opens instantly.",
            },
            {
              icon: "05",
              title: "Emails That Convert",
              desc: "AI-generated subject lines and drafts. 80% more clicks than generic sends.",
            },
            {
              icon: "06",
              title: "Find Their Contact Info",
              desc: "Don\u2019t have their email? Our Contact ID engine finds verified emails and phone numbers so your brief actually lands.",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="p-8 rounded-xl border text-left"
              style={{
                borderColor: "#2a2340",
                backgroundColor: "rgba(30, 21, 53, 0.3)",
              }}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              animate={
                inView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: i % 2 === 0 ? -30 : 30 }
              }
              transition={{
                delay: 0.2 + i * 0.12,
                type: "spring",
                stiffness: 60,
                damping: 18,
              }}
            >
              <span
                className="font-mono text-sm font-bold"
                style={{ color: "#c9a96e" }}
              >
                {feature.icon}
              </span>
              <h3
                className="font-serif text-2xl md:text-3xl font-light mt-3 mb-3"
                style={{ color: "#e8e4f4" }}
              >
                {feature.title}
              </h3>
              <p
                className="font-sans text-base font-light leading-relaxed"
                style={{ color: "#d2cfe0" }}
              >
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      num: "01",
      title: "Tell us who",
      desc: "Name, company, and what you\u2019re after. Takes 60 seconds.",
    },
    {
      num: "02",
      title: "We research everything",
      desc: "AI-powered deep dive into their company, role, and digital footprint.",
    },
    {
      num: "03",
      title: "Brief + email generated",
      desc: "Cinematic brief with real data, plus subject lines and email copy that convert.",
    },
    {
      num: "04",
      title: "Send & stand out",
      desc: "One link. One page built just for them. Instantly unforgettable.",
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24"
      style={{ backgroundColor: "#130d20" }}
    >
      <CardShimmer inView={inView} />
      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp}>
          <Eyebrow text="How It Works" inView={inView} />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-4xl md:text-6xl font-light mt-6 mb-16"
          style={{ color: "#e8e4f4" }}
        >
          Four steps to{" "}
          <span style={{ color: "#f28fb5" }}>unforgettable.</span>
        </motion.h2>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="flex items-start gap-6 text-left py-8"
              style={{
                borderBottom:
                  i < steps.length - 1 ? "1px solid #2a2340" : "none",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={
                inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
              }
              transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
            >
              <span
                className="font-mono text-3xl font-bold shrink-0 mt-1"
                style={{ color: "#c9a96e" }}
              >
                {step.num}
              </span>
              <div>
                <h3
                  className="font-serif text-2xl md:text-3xl font-light mb-2"
                  style={{ color: "#e8e4f4" }}
                >
                  {step.title}
                </h3>
                <p
                  className="font-sans text-lg font-light leading-relaxed"
                  style={{ color: "#d2cfe0" }}
                >
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ───────────────────────────────────────────
   SAMPLE BRIEF — mini version of Bloom brief
   ─────────────────────────────────────────── */

/* Mini doughnut chart for sample brief — Bloom content mix */
function MiniDoughnut() {
  const segments = [
    { percent: 61, color: "#f28fb5", offset: 0 },
    { percent: 33, color: "#c9a96e", offset: 61 },
    { percent: 6, color: "#534AB7", offset: 94 },
  ];
  const circumference = 2 * Math.PI * 40;

  return (
    <svg viewBox="0 0 100 100" className="w-40 h-40 md:w-48 md:h-48 mx-auto">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1535" strokeWidth="10" />
      {segments.map((seg, i) => (
        <motion.circle
          key={`doughnut-${i}`}
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={seg.color}
          strokeWidth="10"
          strokeLinecap="butt"
          strokeDasharray={`${(seg.percent / 100) * circumference} ${circumference}`}
          strokeDashoffset={-(seg.offset / 100) * circumference}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 + i * 0.2 }}
        />
      ))}
    </svg>
  );
}

function SampleBriefSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  /* Bloom company stats — Marcus researched these */
  const stat1 = useSlotMachine(11, 800, inView);
  const stat2 = useSlotMachine(6, 800, inView);
  const stat3 = useSlotMachine(340, 800, inView);
  const stat4 = useSlotMachine(3, 800, inView);

  return (
    <section
      id="sample-brief"
      ref={ref}
      className="relative py-24 px-6 overflow-hidden"
      style={{ backgroundColor: "#0b0d1a" }}
    >
      <CardShimmer inView={inView} />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp}>
          <Eyebrow text="See It In Action" inView={inView} />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-4xl md:text-6xl font-light mt-6 mb-4"
          style={{ color: "#e8e4f4" }}
        >
          A real LORE brief.{" "}
          <span style={{ color: "#f28fb5" }}>Live.</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-sans text-xl font-light max-w-xl mx-auto mb-16"
          style={{ color: "#d2cfe0" }}
        >
          Marcus applied for Head of Video Strategy at Bloom.
          Instead of a resume, he sent this.
        </motion.p>

        {/* Scrollable brief preview */}
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border max-w-4xl mx-auto relative"
          style={{
            borderColor: "#2a2340",
            backgroundColor: "#0d0b17",
            height: "70vh",
          }}
        >
          {/* Scroll container */}
          <div
            className="overflow-y-auto h-full rounded-2xl"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#2a2340 #0d0b17",
            }}
          >
            {/* ─── Card 1: Hero — Marcus's opening ─── */}
            <div
              className="p-8 md:p-16 text-center min-h-[70vh] flex flex-col items-center justify-center"
              style={{
                background:
                  "radial-gradient(ellipse at center, #1e1535 0%, #0d0b17 70%)",
              }}
            >
              <div
                className="inline-block mb-6 px-5 py-2.5 border rounded-full"
                style={{ borderColor: "#c9a96e" }}
              >
                <span
                  className="font-mono text-xs uppercase"
                  style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
                >
                  A brief for Jenna, from Marcus Chen
                </span>
              </div>
              <h3
                className="font-serif text-3xl md:text-5xl font-light leading-tight mb-4"
                style={{ color: "#e8e4f4" }}
              >
                Jenna &mdash; I didn&apos;t send a resume.{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>
                  I built this instead.
                </em>
              </h3>
              <GoldDivider inView={inView} />
              <p
                className="font-sans text-lg font-light max-w-lg mx-auto"
                style={{ color: "#d2cfe0" }}
              >
                My application for Head of Video Strategy at Bloom &mdash;
                what you&apos;ve built, the biggest opportunity, and my first 90 days.
              </p>
              <div className="mt-12">
                <motion.div
                  className="w-px h-8 mx-auto"
                  style={{ background: "linear-gradient(to bottom, #c9a96e, transparent)" }}
                  animate={{ scaleY: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="font-mono text-xs uppercase" style={{ letterSpacing: "0.2em", color: "#9890ab" }}>
                  Scroll
                </span>
              </div>
            </div>

            {/* ─── Card 2: Stats — Marcus did his homework ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center"
              style={{ backgroundColor: "#110d1f" }}
            >
              <span
                className="font-mono text-sm uppercase block mb-10"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                I Did My Homework
              </span>
              <div className="grid grid-cols-2 gap-6 md:gap-8 w-full max-w-lg">
                {[
                  { val: stat1, suffix: "", label: "Years Building" },
                  { val: stat2, suffix: "", label: "Brands Launched" },
                  { val: stat3, suffix: "K", label: "Avg Followers" },
                  { val: stat4, suffix: "", label: "Acquisitions" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-6 border rounded-lg text-center"
                    style={{ borderColor: "#2a2340", backgroundColor: "rgba(13, 11, 23, 0.5)" }}
                  >
                    <motion.div
                      className="font-serif text-4xl md:text-5xl font-light"
                      style={{ color: "#f28fb5", transform: `scale(${s.val.scale})` }}
                    >
                      {s.val.displayValue}{s.suffix}
                    </motion.div>
                    <div
                      className="font-mono text-xs uppercase mt-2"
                      style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Card 3: Growth — Bloom's trajectory ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center"
              style={{ backgroundColor: "#0f0b1a" }}
            >
              <span
                className="font-mono text-sm uppercase block mb-4"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                Your Growth Story
              </span>
              <h4
                className="font-serif text-2xl md:text-4xl font-light mb-10 text-center"
                style={{ color: "#e8e4f4" }}
              >
                Bloom grew without paid media.{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>
                  Imagine what video does.
                </em>
              </h4>
              <div className="w-full max-w-lg">
                <svg viewBox="0 0 400 160" className="w-full">
                  {[0, 1, 2, 3].map((i) => (
                    <line key={`g-${i}`} x1="0" y1={i * 40 + 20} x2="400" y2={i * 40 + 20} stroke="#2a2340" strokeWidth="1" />
                  ))}
                  {["2022", "2023", "2024", "2025"].map((yr, i) => (
                    <text key={yr} x={i * 120 + 20} y="155" fill="#6b6480" fontSize="9" fontFamily="monospace">{yr}</text>
                  ))}
                  <motion.path
                    d="M 20 120 Q 100 110 180 80 T 380 20"
                    fill="none" stroke="#f28fb5" strokeWidth="2.5" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                  />
                  <motion.path
                    d="M 20 130 Q 100 125 180 100 T 380 40"
                    fill="none" stroke="#c9a96e" strokeWidth="2.5" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
                  />
                </svg>
                <div className="flex gap-6 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#f28fb5" }} />
                    <span className="font-mono text-xs uppercase" style={{ letterSpacing: "0.15em", color: "#d2cfe0" }}>Instagram</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#c9a96e" }} />
                    <span className="font-mono text-xs uppercase" style={{ letterSpacing: "0.15em", color: "#d2cfe0" }}>Email List</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Card 4: Gap Analysis — Where Marcus fits in ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center"
              style={{ backgroundColor: "#130d20" }}
            >
              <span
                className="font-mono text-sm uppercase block mb-4"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                Where I Fit In
              </span>
              <h4
                className="font-serif text-2xl md:text-4xl font-light mb-10 text-center"
                style={{ color: "#e8e4f4" }}
              >
                Strong foundation.{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>This is where I come in.</em>
              </h4>

              {/* What Bloom has built — compact */}
              <div className="w-full max-w-2xl mb-8">
                <div className="p-5 border rounded-lg" style={{ borderColor: "#2a2340" }}>
                  <span className="font-mono text-xs uppercase block mb-3" style={{ letterSpacing: "0.2em", color: "#c9a96e" }}>
                    What Bloom Has Built
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {["340K organic followers", "Trusted editorial voice", "Engaged community", "Email list of superfans"].map((item) => (
                      <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-sans font-light" style={{ borderColor: "#2a2340", color: "#d2cfe0" }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#c9a96e" }} />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Where Marcus makes impact — detailed strategy cards */}
              <div className="w-full max-w-2xl">
                <span className="font-mono text-sm uppercase block mb-5 text-center" style={{ letterSpacing: "0.2em", color: "#f28fb5" }}>
                  Where I Can Make Impact
                </span>
                <div className="space-y-4">
                  {[
                    {
                      action: "Launch a short-form video engine",
                      how: "Repurpose top 50 posts into Reels/TikToks — no new photoshoots.",
                      metric: "+35% reach",
                      why: "Short-form video = 35–48% higher reach in 90 days (Meta, 2025).",
                    },
                    {
                      action: "Build a creator collab pipeline",
                      how: "Formalize partnerships with 20 micro-creators already tagging Bloom.",
                      metric: "2–3x engagement",
                      why: "Creator collabs drive 2–3x higher engagement than branded content.",
                    },
                    {
                      action: "Video-to-product conversion",
                      how: "Shoppable links in every Reel and Story → Bloom's product catalog.",
                      metric: "$40K+/mo",
                      why: "340K followers × 2.8% conversion × $42 AOV = $40K+/mo revenue.",
                    },
                    {
                      action: "Video analytics dashboard",
                      how: "Instagram + TikTok + Shopify → one real-time ROI dashboard.",
                      metric: "Full attribution",
                      why: "Bloom's listing cites 'data-driven' as core — this delivers it.",
                    },
                  ].map((item, i) => (
                    <div
                      key={item.action}
                      className="p-5 border rounded-lg text-left"
                      style={{ borderColor: "rgba(242, 143, 181, 0.2)", backgroundColor: "rgba(242, 143, 181, 0.03)" }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h5 className="font-serif text-xl font-light" style={{ color: "#e8e4f4" }}>
                          {item.action}
                        </h5>
                        <span className="font-mono text-xs uppercase shrink-0 px-3 py-1.5 rounded-full border font-bold" style={{ letterSpacing: "0.1em", color: "#f28fb5", borderColor: "rgba(242, 143, 181, 0.3)" }}>
                          {item.metric}
                        </span>
                      </div>
                      <p className="font-sans text-base font-light leading-relaxed mb-2" style={{ color: "#d2cfe0" }}>
                        <span style={{ color: "#c9a96e" }}>How:</span> {item.how}
                      </p>
                      <p className="font-sans text-sm font-light leading-relaxed" style={{ color: "#9890ab" }}>
                        <span style={{ color: "#7B6FD4" }}>Why:</span> {item.why}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Card 5: The Opportunity — why 6% is a problem ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: "#0b0d1a" }}
            >
              <span
                className="font-mono text-sm uppercase block mb-4"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                The Opportunity
              </span>
              <div className="mb-2">
                <span className="font-serif text-7xl md:text-9xl font-light" style={{ color: "#f28fb5" }}>6%</span>
              </div>
              <p className="font-serif text-2xl md:text-3xl mb-6" style={{ color: "#e8e4f4" }}>
                video. For a brand with{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>340K followers.</em>
              </p>

              <div className="flex flex-col md:flex-row items-center gap-8 mb-8 w-full max-w-2xl">
                <div className="shrink-0">
                  <MiniDoughnut />
                </div>
                <div className="text-left space-y-3">
                  {[
                    { label: "Static (61%)", color: "#f28fb5", note: "Algorithm deprioritizes static in 2026" },
                    { label: "Written (33%)", color: "#c9a96e", note: "Good for SEO, doesn't drive social reach" },
                    { label: "Video (6%)", color: "#534AB7", note: "Algorithm's #1 format — barely used" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: item.color }} />
                      <div>
                        <span className="font-mono text-xs uppercase block" style={{ letterSpacing: "0.1em", color: item.color }}>{item.label}</span>
                        <span className="font-sans text-sm font-light" style={{ color: "#9890ab" }}>{item.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full max-w-2xl p-6 border rounded-lg text-left" style={{ borderColor: "#2a2340", backgroundColor: "rgba(30, 21, 53, 0.3)" }}>
                <span className="font-mono text-xs uppercase block mb-2" style={{ letterSpacing: "0.1em", color: "#c9a96e" }}>Why this matters now</span>
                <p className="font-sans text-base font-light leading-relaxed" style={{ color: "#d2cfe0" }}>
                  Bloom&apos;s listing says{" "}
                  <span style={{ color: "#f28fb5" }}>&ldquo;transform to video-first.&rdquo;</span>{" "}
                  The team knows 6% isn&apos;t enough. I&apos;ve done this before — with numbers to prove it.
                </p>
              </div>
            </div>

            {/* ─── Card 6: The Execution Plan — how Marcus would fix it ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center"
              style={{ backgroundColor: "#100b18" }}
            >
              <span
                className="font-mono text-sm uppercase block mb-4"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                My Execution Plan
              </span>
              <h4
                className="font-serif text-2xl md:text-4xl font-light mb-4 text-center"
                style={{ color: "#e8e4f4" }}
              >
                6% → 40%.{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>Here&apos;s exactly how.</em>
              </h4>
              <p className="font-sans text-base font-light mb-10 text-center max-w-lg" style={{ color: "#9890ab" }}>
                90-day rollout. Existing content. No new hires in Phase 1.
              </p>
              <div className="w-full max-w-2xl space-y-4">
                {[
                  {
                    phase: "Days 1–30",
                    title: "Audit + Quick Wins",
                    actions: [
                      "Identify top 20 posts that convert to Reels",
                      "Launch 3x/week short-form cadence",
                      "Set up unified analytics dashboard",
                    ],
                    outcome: "15 Reels live · Baseline metrics set",
                    color: "#c9a96e",
                  },
                  {
                    phase: "Days 31–60",
                    title: "Scale + Collaborate",
                    actions: [
                      "Formalize 10 micro-creator partnerships",
                      "Launch weekly long-form video series",
                      "A/B test shoppable links on top Reels",
                    ],
                    outcome: "20% video mix · First creator collabs live",
                    color: "#f28fb5",
                  },
                  {
                    phase: "Days 61–90",
                    title: "Optimize + Prove ROI",
                    actions: [
                      "Double down on top 3 formats, cut underperformers",
                      "Launch shoppable video storefront",
                      "Present Video ROI Report to leadership",
                    ],
                    outcome: "40% video mix · Revenue attribution · Repeatable playbook",
                    color: "#534AB7",
                  },
                ].map((phase) => (
                  <div
                    key={phase.phase}
                    className="p-5 border rounded-lg text-left"
                    style={{ borderColor: "#2a2340", backgroundColor: "rgba(30, 21, 53, 0.3)" }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-xs uppercase px-3 py-1.5 rounded-full border font-bold" style={{ letterSpacing: "0.1em", color: phase.color, borderColor: phase.color }}>
                        {phase.phase}
                      </span>
                      <h5 className="font-serif text-xl font-light" style={{ color: "#e8e4f4" }}>{phase.title}</h5>
                    </div>
                    <ul className="space-y-2 mb-3">
                      {phase.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-2" style={{ backgroundColor: phase.color }} />
                          <span className="font-sans text-base font-light leading-relaxed" style={{ color: "#d2cfe0" }}>{action}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t" style={{ borderColor: "#2a2340" }}>
                      <span className="font-mono text-xs uppercase font-bold" style={{ letterSpacing: "0.1em", color: phase.color }}>
                        {phase.outcome}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Card 7: Track Record — proof Marcus has done this before ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center"
              style={{ backgroundColor: "#0d0b17" }}
            >
              <span
                className="font-mono text-sm uppercase block mb-4"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                Proof It Works
              </span>
              <h4
                className="font-serif text-2xl md:text-4xl font-light mb-4 text-center"
                style={{ color: "#e8e4f4" }}
              >
                Same playbook.{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>Meridian Media.</em>
              </h4>
              <p className="font-sans text-base font-light mb-10 text-center max-w-lg" style={{ color: "#9890ab" }}>
                180K followers. Zero video. Here&apos;s what happened in 6 months.
              </p>

              <div className="w-full max-w-lg space-y-6 mb-8">
                {[
                  { label: "Engagement Lift", display: "312%", value: 100, color: "#f28fb5", context: "1.2% → 4.9% avg engagement" },
                  { label: "Audience Growth", display: "89%", value: 89, color: "#c9a96e", context: "180K → 340K in 6 months" },
                  { label: "Conversion Lift", display: "4.2x", value: 84, color: "#534AB7", context: "Video CTAs vs static posts" },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-mono text-xs uppercase" style={{ letterSpacing: "0.15em", color: "#d2cfe0" }}>{bar.label}</span>
                      <span className="font-serif text-2xl font-light" style={{ color: bar.color }}>{bar.display}</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden mb-2" style={{ backgroundColor: "#1e1535" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: bar.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${bar.value}%` }}
                        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                      />
                    </div>
                    <p className="font-sans text-sm font-light" style={{ color: "#9890ab" }}>{bar.context}</p>
                  </div>
                ))}
              </div>

              <div className="w-full max-w-lg p-5 border rounded-lg text-center" style={{ borderColor: "rgba(201, 169, 110, 0.3)", backgroundColor: "rgba(201, 169, 110, 0.05)" }}>
                <p className="font-sans text-base font-light" style={{ color: "#d2cfe0" }}>
                  Meridian&apos;s video now drives{" "}
                  <span className="font-serif text-xl" style={{ color: "#c9a96e" }}>$52K/month</span>{" "}
                  in revenue. Same audience size. Same playbook.
                </p>
              </div>

              <p className="font-mono text-xs uppercase mt-4" style={{ letterSpacing: "0.1em", color: "#9890ab" }}>
                Meridian Media · Head of Video · 2023–2025
              </p>
            </div>

            {/* ─── Card 8: Marcus's CTA ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center text-center"
              style={{
                background: "radial-gradient(ellipse at center, #1e1535 0%, #0d0b17 70%)",
              }}
            >
              <h4
                className="font-serif text-3xl md:text-5xl font-light leading-tight mb-4"
                style={{ color: "#e8e4f4" }}
              >
                I didn&apos;t want to be another resume{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>in the pile.</em>
              </h4>
              <GoldDivider inView={inView} />
              <p
                className="font-sans text-lg font-light max-w-lg mx-auto mb-10"
                style={{ color: "#d2cfe0" }}
              >
                Bloom deserves better than a cold application. Let&apos;s talk video-first.
              </p>
              <motion.button
                className="px-10 py-5 rounded-full font-mono text-sm uppercase"
                style={{
                  letterSpacing: "0.2em",
                  backgroundColor: "#f28fb5",
                  color: "#0d0b17",
                }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                whileHover={{ scale: 1.06 }}
              >
                <span className="font-bold">Let&apos;s Talk, Jenna</span>
              </motion.button>
              <div className="mt-12">
                <span className="font-mono text-xs uppercase" style={{ letterSpacing: "0.2em", color: "#c9a96e" }}>
                  LORE Intelligence Brief &mdash; Built by Marcus Chen
                </span>
              </div>
            </div>
          </div>

          {/* Top + bottom fade overlays */}
          <div
            className="absolute top-0 left-0 right-0 h-8 pointer-events-none rounded-t-2xl z-20"
            style={{ background: "linear-gradient(to bottom, #0d0b17, transparent)" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none rounded-b-2xl z-20"
            style={{ background: "linear-gradient(to top, #0d0b17, transparent)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

function PricingSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Single Brief",
      price: "$29",
      period: "one-time",
      desc: "Perfect for a high-stakes outreach to one person.",
      features: [
        "One cinematic intelligence brief",
        "AI-generated email + subject line",
        "Shareable link, no attachments",
        "Contact ID available as add-on ($1.99)",
      ],
      accent: "#c9a96e",
      highlight: false,
    },
    {
      name: "Unlimited",
      price: "$99",
      period: "/month",
      desc: "For serious job seekers and sales pros who outreach weekly.",
      features: [
        "Unlimited intelligence briefs",
        "AI-generated email + subject lines",
        "Contact ID included free",
        "Priority generation speed",
        "Cancel anytime",
      ],
      accent: "#f28fb5",
      highlight: true,
    },
    {
      name: "5-Pack",
      price: "$99",
      period: "one-time",
      desc: "Five briefs at a discount. Ideal for a targeted campaign.",
      features: [
        "Five cinematic intelligence briefs",
        "AI-generated emails + subject lines",
        "Shareable links, no attachments",
        "Contact ID available as add-on ($1.99)",
      ],
      accent: "#7B6FD4",
      highlight: false,
    },
  ];

  return (
    <section
      id="pricing"
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24"
      style={{ backgroundColor: "#0f0b1a" }}
    >
      <CardShimmer inView={inView} />
      <motion.div
        className="relative z-10 max-w-5xl mx-auto text-center"
        variants={stagger}
        initial="initial"
        animate={inView ? "animate" : "initial"}
      >
        <motion.div variants={fadeUp}>
          <Eyebrow text="Pricing" inView={inView} />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-4xl md:text-6xl font-light mt-6 mb-6"
          style={{ color: "#e8e4f4" }}
        >
          Invest in being{" "}
          <span style={{ color: "#c9a96e" }}>unforgettable.</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="font-sans text-xl font-light max-w-2xl mx-auto mb-16"
          style={{ color: "#d2cfe0" }}
        >
          Every plan includes a cinematic brief, AI-written email copy, and a shareable link. No templates. No fluff.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className="relative p-8 rounded-2xl border text-left flex flex-col"
              style={{
                borderColor: plan.highlight
                  ? "rgba(242, 143, 181, 0.4)"
                  : "#2a2340",
                backgroundColor: plan.highlight
                  ? "rgba(242, 143, 181, 0.05)"
                  : "rgba(30, 21, 53, 0.3)",
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={
                inView
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 30 }
              }
              transition={{
                delay: 0.3 + i * 0.15,
                type: "spring",
                stiffness: 60,
                damping: 18,
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-mono text-xs uppercase"
                  style={{
                    letterSpacing: "0.15em",
                    backgroundColor: "#f28fb5",
                    color: "#0d0b17",
                    fontWeight: 700,
                  }}
                >
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className="font-serif text-2xl font-light mb-1"
                  style={{ color: "#e8e4f4" }}
                >
                  {plan.name}
                </h3>
                <p
                  className="font-sans text-sm font-light"
                  style={{ color: "#9890ab" }}
                >
                  {plan.desc}
                </p>
              </div>

              <div className="mb-6">
                <span
                  className="font-serif text-5xl font-light"
                  style={{ color: plan.accent }}
                >
                  {plan.price}
                </span>
                <span
                  className="font-mono text-sm ml-2"
                  style={{ color: "#9890ab" }}
                >
                  {plan.period}
                </span>
              </div>

              <div className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-2"
                      style={{ backgroundColor: plan.accent }}
                    />
                    <span
                      className="font-sans text-base font-light"
                      style={{ color: "#d2cfe0" }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="/intake"
                className="block text-center px-6 py-4 rounded-full font-mono text-sm uppercase transition-all duration-200"
                style={{
                  letterSpacing: "0.15em",
                  backgroundColor: plan.highlight
                    ? plan.accent
                    : "transparent",
                  color: plan.highlight ? "#0d0b17" : plan.accent,
                  border: plan.highlight
                    ? "none"
                    : `1px solid ${plan.accent}`,
                  fontWeight: plan.highlight ? 700 : 400,
                }}
              >
                Get Started
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          className="mt-12 p-6 rounded-xl border text-center max-w-2xl mx-auto"
          style={{
            borderColor: "rgba(201, 169, 110, 0.2)",
            backgroundColor: "rgba(201, 169, 110, 0.03)",
          }}
        >
          <h4
            className="font-serif text-xl font-light mb-2"
            style={{ color: "#c9a96e" }}
          >
            Need their contact info?
          </h4>
          <p
            className="font-sans text-base font-light"
            style={{ color: "#d2cfe0" }}
          >
            Our Contact ID engine finds verified emails and phone numbers.
            Just <span style={{ color: "#c9a96e" }}>$1.99</span> per lookup
            — or <span style={{ color: "#f28fb5" }}>free with Unlimited</span>.
            Only charged if we find a match.
          </p>
        </motion.div>
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
          <Eyebrow text="Get Started" inView={inView} />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-serif text-4xl md:text-6xl font-light mt-6 mb-6"
          style={{ color: "#e8e4f4" }}
        >
          Ready to be{" "}
          <span style={{ color: "#c9a96e" }}>remembered?</span>
        </motion.h2>

        <GoldDivider inView={inView} />

        <motion.p
          variants={fadeUp}
          className="font-sans text-xl font-light max-w-xl mx-auto mb-12"
          style={{ color: "#d2cfe0" }}
        >
          Build your first intelligence brief in minutes. Give them something they&apos;ve never seen before.
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
          No subscription required &bull; Brief + email copy included
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ───────────────────────────────────────────
   PAGE
   ─────────────────────────────────────────── */

export default function Home() {
  return (
    <main
      className="relative hide-scrollbar"
      style={{ backgroundColor: "#0d0b17" }}
    >
      <Navbar />
      <DriftingGlow />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <SampleBriefSection />
      <PricingSection />
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

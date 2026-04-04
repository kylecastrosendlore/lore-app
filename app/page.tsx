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
      className="font-mono text-[10px] uppercase block"
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
        className="font-mono text-[10px] uppercase"
        style={{ letterSpacing: "0.2em", color: "#6b6480" }}
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
      className="relative inline-flex items-center justify-center px-10 py-4 rounded-full font-mono text-xs uppercase overflow-hidden"
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
        <motion.div variants={fadeUp} className="mb-12">
          <Eyebrow text="Intelligence Briefs" inView={inView} />
          <h2
            className="font-mono text-sm uppercase mt-3 font-bold"
            style={{ letterSpacing: "0.3em", color: "#e8e4f4" }}
          >
            LORE
          </h2>
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
          className="font-sans text-lg md:text-xl font-light max-w-xl mx-auto mb-12"
          style={{ color: "#b8b4c8" }}
        >
          Whether you&apos;re a job seeker trying to land the interview or a
          hiring manager sourcing top talent &mdash; LORE replaces forgettable
          outreach with cinematic intelligence briefs that get opened, read,
          and remembered.
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
          className="font-sans text-lg font-light max-w-2xl mx-auto mb-16"
          style={{ color: "#b8b4c8" }}
        >
          Job seekers send the same resume to 200 companies. Hiring managers
          blast the same InMail to 200 candidates. Everyone sounds the same.
          Everyone gets ignored.
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
                className="font-mono text-[10px] uppercase"
                style={{ letterSpacing: "0.15em", color: "#6b6480" }}
              >
                {stat.label}
              </div>
              {stat.source && (
                <div
                  className="font-mono text-[8px] uppercase mt-2"
                  style={{ color: "#534AB7" }}
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
          className="font-sans text-lg font-light max-w-2xl mx-auto mb-16"
          style={{ color: "#b8b4c8" }}
        >
          A LORE brief is a cinematic, scroll-driven intelligence page built
          for one person. Whether it&apos;s a hiring manager you want to
          impress or a candidate you need to land &mdash; this is how you
          stand out.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {[
            {
              icon: "01",
              title: "Hyper-Researched",
              desc: "Real data on the person, their company, market position, and growth signals \u2014 woven into a narrative that shows you did the work. Not a template. Not a mass blast.",
            },
            {
              icon: "02",
              title: "Cinematic Design",
              desc: "Full-screen cards with scroll-driven animations, charts that draw themselves, and a visual language that commands attention. Spotify Wrapped meets executive intelligence.",
            },
            {
              icon: "03",
              title: "AI-Powered Intelligence",
              desc: "Our proprietary AI engine analyzes digital footprints, enriches public data, and generates insights no template could ever produce. All in minutes.",
            },
            {
              icon: "04",
              title: "Delivered as a Link",
              desc: "One URL. No attachments. No spam filters. A living, breathing page that opens instantly and makes the recipient feel like the only person in the room.",
            },
            {
              icon: "05",
              title: "Email & Subject Lines That Convert",
              desc: "Every brief comes with AI-generated outreach copy \u2014 subject lines and email drafts engineered to maximize open rates. Personalized outreach gets 80% more link clicks than generic sends.",
            },
            {
              icon: "06",
              title: "Tailored, Not Templated",
              desc: "Studies show personalized outreach generates 142% more replies than mass emails. LORE briefs are built one-to-one, researched individually, and impossible to mistake for a blast.",
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
                className="font-mono text-xs font-bold"
                style={{ color: "#c9a96e" }}
              >
                {feature.icon}
              </span>
              <h3
                className="font-serif text-2xl font-light mt-3 mb-3"
                style={{ color: "#e8e4f4" }}
              >
                {feature.title}
              </h3>
              <p
                className="font-sans text-sm font-light leading-relaxed"
                style={{ color: "#b8b4c8" }}
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
      desc: "Fill out a quick intake form \u2014 whether it\u2019s the hiring manager at your dream company or a candidate you\u2019re recruiting. Name, company, and what you\u2019re after.",
    },
    {
      num: "02",
      title: "We research everything",
      desc: "Our AI engine enriches public data, analyzes their company, market position, and digital footprint \u2014 building a complete intelligence profile in minutes.",
    },
    {
      num: "03",
      title: "Brief + outreach generated",
      desc: "You get a cinematic intelligence brief with real data and visualizations, plus AI-written email copy and subject lines designed to maximize opens and clicks.",
    },
    {
      num: "04",
      title: "Send & stand out",
      desc: "Drop your brief link in a LinkedIn DM or use the generated email. Your recipient opens a page built just for them \u2014 and you\u2019re instantly unforgettable.",
    },
  ];

  return (
    <section
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
                className="font-mono text-2xl font-bold shrink-0 mt-1"
                style={{ color: "#c9a96e" }}
              >
                {step.num}
              </span>
              <div>
                <h3
                  className="font-serif text-2xl font-light mb-2"
                  style={{ color: "#e8e4f4" }}
                >
                  {step.title}
                </h3>
                <p
                  className="font-sans text-sm font-light leading-relaxed"
                  style={{ color: "#b8b4c8" }}
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

/* Mini doughnut chart for sample brief */
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

  const stat1 = useSlotMachine(11, 800, inView);
  const stat2 = useSlotMachine(6, 800, inView);
  const stat3 = useSlotMachine(340, 800, inView);
  const stat4 = useSlotMachine(3, 800, inView);

  return (
    <section
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
          className="font-sans text-lg font-light max-w-xl mx-auto mb-16"
          style={{ color: "#b8b4c8" }}
        >
          This is what your recipient sees &mdash; a cinematic page built
          entirely around them. Scroll through it.
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
            {/* ─── Card 1: Hero ─── */}
            <div
              className="p-8 md:p-16 text-center min-h-[70vh] flex flex-col items-center justify-center"
              style={{
                background:
                  "radial-gradient(ellipse at center, #1e1535 0%, #0d0b17 70%)",
              }}
            >
              <div
                className="inline-block mb-6 px-4 py-2 border rounded-full"
                style={{ borderColor: "#c9a96e" }}
              >
                <span
                  className="font-mono text-[10px] uppercase"
                  style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
                >
                  Built exclusively for Jenna
                </span>
              </div>
              <h3
                className="font-serif text-3xl md:text-5xl font-light leading-tight mb-4"
                style={{ color: "#e8e4f4" }}
              >
                Jenna &mdash; Bloom built a brand{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>
                  the world found on its own.
                </em>
              </h3>
              <GoldDivider inView={inView} />
              <p
                className="font-sans text-base font-light max-w-lg mx-auto"
                style={{ color: "#b8b4c8" }}
              >
                This is your cinematic intelligence brief &mdash; a look at
                what you&apos;ve built, where the gaps live, and what comes
                next.
              </p>
              <div className="mt-12">
                <motion.div
                  className="w-px h-8 mx-auto"
                  style={{ background: "linear-gradient(to bottom, #c9a96e, transparent)" }}
                  animate={{ scaleY: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.2em", color: "#6b6480" }}>
                  Scroll
                </span>
              </div>
            </div>

            {/* ─── Card 2: Stats ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center"
              style={{ backgroundColor: "#110d1f" }}
            >
              <span
                className="font-mono text-[10px] uppercase block mb-10"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                The Builder
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
                      className="font-mono text-[9px] uppercase mt-2"
                      style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Card 3: Growth ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center"
              style={{ backgroundColor: "#0f0b1a" }}
            >
              <span
                className="font-mono text-[10px] uppercase block mb-4"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                Growth Trajectory
              </span>
              <h4
                className="font-serif text-2xl md:text-4xl font-light mb-10 text-center"
                style={{ color: "#e8e4f4" }}
              >
                A brand that grew{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>
                  without paid media.
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
                    <span className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.15em", color: "#b8b4c8" }}>Instagram</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#c9a96e" }} />
                    <span className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.15em", color: "#b8b4c8" }}>Email List</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Card 4: Gap Analysis ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center"
              style={{ backgroundColor: "#130d20" }}
            >
              <span
                className="font-mono text-[10px] uppercase block mb-4"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                The Analysis
              </span>
              <h4
                className="font-serif text-2xl md:text-4xl font-light mb-10 text-center"
                style={{ color: "#e8e4f4" }}
              >
                Strong foundation.{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>Room to run.</em>
              </h4>
              <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl text-left">
                <div className="p-6 border rounded-lg" style={{ borderColor: "#2a2340" }}>
                  <span className="font-mono text-[10px] uppercase block mb-4" style={{ letterSpacing: "0.2em", color: "#c9a96e" }}>
                    What Bloom Has Built
                  </span>
                  <ul className="space-y-3">
                    {["340K organic followers", "Trusted editorial voice", "Engaged community", "Email list of superfans"].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#c9a96e" }} />
                        <span className="font-sans text-sm font-light" style={{ color: "#b8b4c8" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 border rounded-lg" style={{ borderColor: "rgba(242, 143, 181, 0.3)", backgroundColor: "rgba(242, 143, 181, 0.05)" }}>
                  <span className="font-mono text-[10px] uppercase block mb-4" style={{ letterSpacing: "0.2em", color: "#f28fb5" }}>
                    Where the Gap Lives
                  </span>
                  <ul className="space-y-3">
                    {["No video strategy", "Untapped paid channels", "Missing product line", "Zero B2B partnerships"].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#f28fb5" }} />
                        <span className="font-sans text-sm font-light" style={{ color: "#b8b4c8" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ─── Card 5: Content Mix ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: "#0b0d1a" }}
            >
              <span
                className="font-mono text-[10px] uppercase block mb-4"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                Content Analysis
              </span>
              <div className="mb-2">
                <span className="font-serif text-6xl md:text-8xl font-light" style={{ color: "#f28fb5" }}>6%</span>
              </div>
              <p className="font-serif text-xl md:text-2xl mb-10" style={{ color: "#e8e4f4" }}>
                video. For a brand with{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>340K followers.</em>
              </p>
              <MiniDoughnut />
              <div className="flex gap-6 mt-6 justify-center flex-wrap">
                {[
                  { label: "Static (61%)", color: "#f28fb5" },
                  { label: "Written (33%)", color: "#c9a96e" },
                  { label: "Video (6%)", color: "#534AB7" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.15em", color: "#b8b4c8" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Card 6: Market Position ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center"
              style={{ backgroundColor: "#100b18" }}
            >
              <span
                className="font-mono text-[10px] uppercase block mb-4"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                Market Position
              </span>
              <h4
                className="font-serif text-2xl md:text-4xl font-light mb-10 text-center"
                style={{ color: "#e8e4f4" }}
              >
                Positioned at the{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>intersection of growth.</em>
              </h4>
              <div className="w-full max-w-lg space-y-6">
                {[
                  { label: "Creator Economy", value: 78, color: "#f28fb5" },
                  { label: "Wellness Market", value: 64, color: "#c9a96e" },
                  { label: "D2C Beauty", value: 52, color: "#534AB7" },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-[9px] uppercase" style={{ letterSpacing: "0.15em", color: "#b8b4c8" }}>{bar.label}</span>
                      <span className="font-serif text-xl font-light" style={{ color: bar.color }}>{bar.value}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1e1535" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: bar.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${bar.value}%` }}
                        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="font-mono text-[8px] uppercase mt-6" style={{ letterSpacing: "0.1em", color: "#6b6480" }}>
                Source: Market Analysis 2026
              </p>
            </div>

            {/* ─── Card 7: Three Plays ─── */}
            <div
              className="p-8 md:p-16 min-h-[70vh] flex flex-col items-center justify-center"
              style={{ backgroundColor: "#0d0f1a" }}
            >
              <span
                className="font-mono text-[10px] uppercase block mb-4"
                style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
              >
                The Playbook
              </span>
              <h4
                className="font-serif text-2xl md:text-4xl font-light mb-10 text-center"
                style={{ color: "#e8e4f4" }}
              >
                Three moves that{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>change everything.</em>
              </h4>
              <div className="w-full max-w-lg space-y-8 text-left">
                {[
                  { num: "01", title: "Launch a video-first content arm", desc: "Transform the 6% into 40%. Short-form for discovery, long-form for depth. The algorithm rewards video \u2014 Bloom should too." },
                  { num: "02", title: "Build the product constellation", desc: "340K followers waiting to buy. Digital products first, physical goods second. Capture the intent that's already there." },
                  { num: "03", title: "Open the partnership layer", desc: "B2B is the unlock. Brands want access to Bloom's audience. Create the infrastructure to say yes." },
                ].map((play) => (
                  <div key={play.num} className="relative pl-6 border-l-2" style={{ borderColor: "#c9a96e" }}>
                    <span className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.2em", color: "#c9a96e" }}>{play.num}</span>
                    <h5 className="font-serif text-xl font-light mt-1 mb-2" style={{ color: "#e8e4f4" }}>{play.title}</h5>
                    <p className="font-sans text-sm font-light leading-relaxed" style={{ color: "#6b6480" }}>{play.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Card 8: Brief CTA ─── */}
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
                Ready to turn insight{" "}
                <em className="font-normal italic" style={{ color: "#f28fb5" }}>into action?</em>
              </h4>
              <GoldDivider inView={inView} />
              <p
                className="font-sans text-base font-light max-w-lg mx-auto mb-10"
                style={{ color: "#b8b4c8" }}
              >
                This brief is just the beginning. Let&apos;s build the
                strategy that takes Bloom from where it is to where it should
                be.
              </p>
              <motion.button
                className="px-8 py-4 rounded-full font-mono text-xs uppercase"
                style={{
                  letterSpacing: "0.2em",
                  backgroundColor: "#f28fb5",
                  color: "#0d0b17",
                }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                whileHover={{ scale: 1.06 }}
              >
                <span className="font-bold">Let&apos;s Talk Strategy</span>
              </motion.button>
              <div className="mt-12">
                <span className="font-mono text-[10px] uppercase" style={{ letterSpacing: "0.2em", color: "#c9a96e" }}>
                  LORE Intelligence Brief
                </span>
              </div>
            </div>
          </div>

          {/* Top + bottom fade overlays for the scroll container */}
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
          className="font-sans text-lg font-light max-w-xl mx-auto mb-12"
          style={{ color: "#b8b4c8" }}
        >
          Whether you&apos;re chasing your dream job or recruiting the perfect
          candidate &mdash; build your first LORE intelligence brief in
          minutes and give them something they&apos;ve never seen before.
        </motion.p>

        <motion.div variants={fadeUp}>
          <MagneticButton href="/intake">
            Build Your Brief
          </MagneticButton>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="font-mono text-[10px] uppercase mt-8"
          style={{ letterSpacing: "0.15em", color: "#6b6480" }}
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
      <DriftingGlow />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <SampleBriefSection />
      <CTASection />

      {/* Footer */}
      <footer
        className="py-12 text-center border-t"
        style={{ borderColor: "#2a2340", backgroundColor: "#0d0b17" }}
      >
        <p
          className="font-mono text-[10px] uppercase"
          style={{ letterSpacing: "0.2em", color: "#6b6480" }}
        >
          &copy; {new Date().getFullYear()} LORE &mdash; Intelligence
          Briefs
        </p>
      </footer>
    </main>
  );
}

"use client";

/* ───────────────────────────────────────────
   BriefShell — the locked React renderer for
   structured BriefContent. All layout, motion,
   typography, and visual decisions live here.
   Claude only provides content; this file owns
   everything else.

   Modeled on the Plaid reference (structure +
   info density) crossbred with Jenna (chart
   moments + simplicity + generous whitespace).
   ─────────────────────────────────────────── */

import { motion } from "framer-motion";
import type {
  AccentKey,
  BriefContent,
  StatCard,
  FitBullet,
  ActionCard,
  ChartData,
  BigStat,
  PullQuote,
} from "@/lib/brief-content";

/* ── Accent system ──
   Three locked hue families. Shell owns the hex values so Claude
   can never drift off-brand. Each accent carries a base, a muted
   border, a soft background tint, and a light glow. */

interface AccentPalette {
  base: string;       // Primary accent (italic headlines, numbers, CTAs)
  soft: string;       // Lighter tint for subtle fills
  border: string;     // Muted border with low opacity
  bg: string;         // Very subtle background tint for cards
  glow: string;       // Radial glow color for hero
  bodyMuted: string;  // Muted body text that still reads on dark
  bodyStrong: string; // Primary body text
}

const PALETTES: Record<AccentKey, AccentPalette> = {
  blue: {
    base: "#7aa6ff",
    soft: "#9fbdff",
    border: "rgba(122, 166, 255, 0.22)",
    bg: "rgba(122, 166, 255, 0.05)",
    glow: "rgba(122, 166, 255, 0.12)",
    bodyMuted: "#a6a4bf",
    bodyStrong: "#e8e4f4",
  },
  rose: {
    base: "#f28fb5",
    soft: "#f7aac6",
    border: "rgba(242, 143, 181, 0.25)",
    bg: "rgba(242, 143, 181, 0.05)",
    glow: "rgba(242, 143, 181, 0.12)",
    bodyMuted: "#b0a6b8",
    bodyStrong: "#ede6ef",
  },
  gold: {
    base: "#d4b376",
    soft: "#e3c48a",
    border: "rgba(212, 179, 118, 0.25)",
    bg: "rgba(212, 179, 118, 0.05)",
    glow: "rgba(212, 179, 118, 0.12)",
    bodyMuted: "#aea48f",
    bodyStrong: "#ede7d9",
  },
  emerald: {
    base: "#6ec7a5",
    soft: "#8fd7ba",
    border: "rgba(110, 199, 165, 0.25)",
    bg: "rgba(110, 199, 165, 0.05)",
    glow: "rgba(110, 199, 165, 0.12)",
    bodyMuted: "#9db0a7",
    bodyStrong: "#e2ece7",
  },
  violet: {
    base: "#b49bff",
    soft: "#c9b7ff",
    border: "rgba(180, 155, 255, 0.25)",
    bg: "rgba(180, 155, 255, 0.05)",
    glow: "rgba(180, 155, 255, 0.12)",
    bodyMuted: "#a9a4c0",
    bodyStrong: "#e8e4f4",
  },
};

const BG = "#0a0814"; // near-black with warm purple undertone, matches Plaid + Jenna refs

/* ── Utility: render text with {{i}}...{{/i}} italic spans ── */
function RichText({ text, accent }: { text: string; accent: string }) {
  const parts: Array<{ italic: boolean; text: string }> = [];
  let remaining = text;
  while (remaining.length > 0) {
    const open = remaining.indexOf("{{i}}");
    if (open === -1) {
      parts.push({ italic: false, text: remaining });
      break;
    }
    if (open > 0) parts.push({ italic: false, text: remaining.slice(0, open) });
    const close = remaining.indexOf("{{/i}}", open + 5);
    if (close === -1) {
      parts.push({ italic: false, text: remaining.slice(open + 5) });
      break;
    }
    parts.push({ italic: true, text: remaining.slice(open + 5, close) });
    remaining = remaining.slice(close + 6);
  }
  return (
    <>
      {parts.map((p, i) =>
        p.italic ? (
          <em key={i} style={{ color: accent, fontStyle: "italic" }}>
            {p.text}
          </em>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}

/* ── Fade-in wrapper — visible by default, motion opt-in ── */
function FadeIn({
  children,
  delay = 0,
  y = 40,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Section eyebrow label (mono, all-caps, accent) ── */
function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      className="font-mono text-[13px] uppercase mb-5"
      style={{ letterSpacing: "0.22em", color }}
    >
      {children}
    </div>
  );
}

/* ── Section headline (bold white + italic accent) ── */
function SectionHeadline({
  bold,
  italic,
  accent,
  strong,
}: {
  bold: string;
  italic: string;
  accent: string;
  strong: string;
}) {
  return (
    <h2
      className="font-serif font-normal mb-6"
      style={{
        color: strong,
        fontSize: "clamp(2rem, 4.5vw, 2.75rem)",
        lineHeight: 1.15,
        letterSpacing: "-0.01em",
      }}
    >
      {bold}{" "}
      <em style={{ color: accent, fontStyle: "italic" }}>{italic}</em>
    </h2>
  );
}

/* ── Intro paragraph under section headlines ── */
function Intro({ text, muted }: { text: string; muted: string }) {
  return (
    <p
      className="font-sans font-light mb-12"
      style={{
        color: muted,
        fontSize: "17px",
        lineHeight: 1.65,
        maxWidth: "640px",
      }}
    >
      {text}
    </p>
  );
}

/* ═══ HERO ═══
   Mirrors the Plaid reference: header pill, serif bold+italic headline,
   subhead paragraph, divider, byline row, scroll hint. */
function Hero({ content, p }: { content: BriefContent; p: AccentPalette }) {
  return (
    <section
      className="relative px-6 md:px-10 pt-32 md:pt-40 pb-28 md:pb-40"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${p.glow} 0%, transparent 70%)`,
      }}
    >
      <div className="max-w-[820px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mb-10 px-5 py-2 rounded-full border font-mono uppercase"
          style={{
            borderColor: p.border,
            color: p.base,
            fontSize: "11px",
            letterSpacing: "0.2em",
          }}
        >
          {content.hero.headerPill}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-normal mb-10"
          style={{
            color: p.bodyStrong,
            fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
          }}
        >
          {content.hero.headlineBold}{" "}
          <em style={{ color: p.base, fontStyle: "italic" }}>
            {content.hero.headlineItalic}
          </em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="font-sans font-light mx-auto mb-12"
          style={{
            color: p.bodyMuted,
            fontSize: "17px",
            lineHeight: 1.7,
            maxWidth: "560px",
          }}
        >
          {content.hero.subhead}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 80 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mx-auto mb-8"
          style={{ height: "1px", background: p.border }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="font-mono uppercase"
          style={{
            color: p.bodyMuted,
            fontSize: "11px",
            letterSpacing: "0.22em",
          }}
        >
          {content.hero.byline}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-20 font-mono uppercase"
          style={{
            color: p.bodyMuted,
            fontSize: "10px",
            letterSpacing: "0.3em",
          }}
        >
          Scroll
          <div
            className="mx-auto mt-3"
            style={{
              width: "1px",
              height: "30px",
              background: `linear-gradient(to bottom, ${p.base}, transparent)`,
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ═══ STAT CARD ═══ (used in Mirror + Gap) */
function StatCardEl({ card, p }: { card: StatCard; p: AccentPalette }) {
  return (
    <div
      className="p-7 rounded-lg border flex flex-col h-full"
      style={{
        borderColor: p.border,
        background: p.bg,
      }}
    >
      <div
        className="font-mono uppercase mb-5"
        style={{
          color: p.base,
          fontSize: "11px",
          letterSpacing: "0.2em",
          lineHeight: 1.5,
        }}
      >
        {card.eyebrow}
      </div>
      <div
        className="font-serif mb-2"
        style={{
          color: p.base,
          fontSize: "42px",
          lineHeight: 1,
          fontWeight: 500,
        }}
      >
        {card.value}
      </div>
      {card.valueLabel && (
        <div
          className="font-mono uppercase mb-5"
          style={{
            color: p.bodyStrong,
            fontSize: "11px",
            letterSpacing: "0.15em",
            lineHeight: 1.5,
          }}
        >
          {card.valueLabel}
        </div>
      )}
      <p
        className="font-sans font-light flex-1"
        style={{
          color: p.bodyMuted,
          fontSize: "15px",
          lineHeight: 1.65,
        }}
      >
        {card.body}
      </p>
      {card.citation && (
        <div
          className="font-mono uppercase mt-5 pt-4"
          style={{
            color: p.bodyMuted,
            fontSize: "10px",
            letterSpacing: "0.15em",
            opacity: 0.7,
            borderTop: `1px solid ${p.border}`,
          }}
        >
          {card.citation}
        </div>
      )}
    </div>
  );
}

/* ═══ BIG STAT ═══ (Jenna-style giant solo stat) */
function BigStatEl({ stat, p }: { stat: BigStat; p: AccentPalette }) {
  return (
    <div className="text-center py-12">
      <div
        className="font-mono uppercase mb-6"
        style={{
          color: p.bodyMuted,
          fontSize: "11px",
          letterSpacing: "0.28em",
        }}
      >
        {stat.label}
      </div>
      <div
        className="font-serif mb-6 leading-none"
        style={{
          color: p.base,
          fontSize: "clamp(5rem, 14vw, 10rem)",
          fontWeight: 500,
          textShadow: `0 0 80px ${p.glow}`,
        }}
      >
        {stat.value}
      </div>
      <p
        className="font-sans font-light mx-auto"
        style={{
          color: p.bodyStrong,
          fontSize: "17px",
          maxWidth: "480px",
          lineHeight: 1.6,
        }}
      >
        {stat.caption}
      </p>
    </div>
  );
}

/* ═══ PULL QUOTE ═══ */
function PullQuoteEl({ q, p }: { q: PullQuote; p: AccentPalette }) {
  return (
    <blockquote
      className="mt-16 pl-6 font-serif italic"
      style={{
        borderLeft: `2px solid ${p.base}`,
        color: p.bodyStrong,
        fontSize: "20px",
        lineHeight: 1.55,
        maxWidth: "700px",
      }}
    >
      <RichText text={q.text} accent={p.base} />
      {q.attribution && (
        <div
          className="font-mono uppercase mt-4 not-italic"
          style={{
            color: p.bodyMuted,
            fontSize: "10px",
            letterSpacing: "0.2em",
          }}
        >
          {q.attribution}
        </div>
      )}
    </blockquote>
  );
}

/* ═══ SVG CHARTS ═══ — shell draws, never Claude */
function Chart({ data, p }: { data: ChartData; p: AccentPalette }) {
  if (data.type === "bar") return <BarChart data={data} p={p} />;
  if (data.type === "donut") return <DonutChart data={data} p={p} />;
  return <LineChart data={data} p={p} />;
}

function BarChart({
  data,
  p,
}: {
  data: Extract<ChartData, { type: "bar" }>;
  p: AccentPalette;
}) {
  const width = 680;
  const height = 320;
  const padL = 60;
  const padR = 20;
  const padT = 30;
  const padB = 60;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxVal = Math.max(...data.bars.map((b) => b.value));
  const barW = (chartW / data.bars.length) * 0.6;
  const barGap = (chartW / data.bars.length) * 0.4;

  return (
    <div className="mt-8">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ maxWidth: "820px" }}
      >
        {/* Y axis */}
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={padT + chartH}
          stroke={p.border}
          strokeWidth="1"
        />
        {/* X axis */}
        <line
          x1={padL}
          y1={padT + chartH}
          x2={padL + chartW}
          y2={padT + chartH}
          stroke={p.border}
          strokeWidth="1"
        />
        {/* Y label */}
        <text
          x={-height / 2}
          y={18}
          transform="rotate(-90)"
          textAnchor="middle"
          fill={p.bodyMuted}
          fontSize="10"
          fontFamily="var(--font-mono)"
          letterSpacing="1.5"
          style={{ textTransform: "uppercase" }}
        >
          {data.yLabel}
        </text>
        {/* X label */}
        <text
          x={padL + chartW / 2}
          y={height - 8}
          textAnchor="middle"
          fill={p.bodyMuted}
          fontSize="10"
          fontFamily="var(--font-mono)"
          letterSpacing="1.5"
          style={{ textTransform: "uppercase" }}
        >
          {data.xLabel}
        </text>
        {data.bars.map((bar, i) => {
          const h = (bar.value / maxVal) * chartH;
          const x = padL + i * (barW + barGap) + barGap / 2;
          const y = padT + chartH - h;
          return (
            <g key={i}>
              <motion.rect
                initial={{ height: 0, y: padT + chartH }}
                whileInView={{ height: h, y }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 1,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                x={x}
                width={barW}
                fill={p.base}
                rx="2"
              />
              <text
                x={x + barW / 2}
                y={padT + chartH - h - 10}
                textAnchor="middle"
                fill={p.base}
                fontSize="14"
                fontFamily="var(--font-serif)"
              >
                {bar.value}
              </text>
              <text
                x={x + barW / 2}
                y={padT + chartH + 20}
                textAnchor="middle"
                fill={p.bodyMuted}
                fontSize="10"
                fontFamily="var(--font-mono)"
                letterSpacing="1"
                style={{ textTransform: "uppercase" }}
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
      {data.citation && (
        <div
          className="font-mono uppercase text-center mt-4"
          style={{
            color: p.bodyMuted,
            fontSize: "10px",
            letterSpacing: "0.18em",
            opacity: 0.7,
          }}
        >
          {data.citation}
        </div>
      )}
    </div>
  );
}

function DonutChart({
  data,
  p,
}: {
  data: Extract<ChartData, { type: "donut" }>;
  p: AccentPalette;
}) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 110;
  const stroke = 28;
  const total = data.slices.reduce((s, x) => s + x.value, 0);
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const colors = [p.base, p.soft, p.bodyMuted, p.border, p.bodyStrong, p.soft];

  return (
    <div className="mt-10 flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={p.border}
          strokeWidth={stroke}
        />
        {data.slices.map((slice, i) => {
          const frac = slice.value / total;
          const dash = frac * circumference;
          const startOffset = offset;
          offset += dash;
          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-startOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            />
          );
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-5 mt-6">
        {data.slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: colors[i % colors.length] }}
            />
            <span
              className="font-mono uppercase"
              style={{
                color: p.bodyMuted,
                fontSize: "11px",
                letterSpacing: "0.15em",
              }}
            >
              {slice.label} ({slice.value}%)
            </span>
          </div>
        ))}
      </div>
      {data.citation && (
        <div
          className="font-mono uppercase mt-6"
          style={{
            color: p.bodyMuted,
            fontSize: "10px",
            letterSpacing: "0.18em",
            opacity: 0.7,
          }}
        >
          {data.citation}
        </div>
      )}
    </div>
  );
}

function LineChart({
  data,
  p,
}: {
  data: Extract<ChartData, { type: "line" }>;
  p: AccentPalette;
}) {
  const width = 680;
  const height = 320;
  const padL = 60;
  const padR = 20;
  const padT = 30;
  const padB = 60;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const maxVal = Math.max(...data.yValues);
  const minVal = Math.min(...data.yValues, 0);
  const range = maxVal - minVal || 1;
  const points = data.yValues.map((v, i) => {
    const x = padL + (i / (data.yValues.length - 1 || 1)) * chartW;
    const y = padT + chartH - ((v - minVal) / range) * chartH;
    return { x, y };
  });
  const path = points.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ");
  const pathLen = 2000; // approx, browser will clip

  return (
    <div className="mt-8">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ maxWidth: "820px" }}>
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke={p.border} strokeWidth="1" />
        <line x1={padL} y1={padT + chartH} x2={padL + chartW} y2={padT + chartH} stroke={p.border} strokeWidth="1" />
        <text
          x={-height / 2}
          y={18}
          transform="rotate(-90)"
          textAnchor="middle"
          fill={p.bodyMuted}
          fontSize="10"
          fontFamily="var(--font-mono)"
          letterSpacing="1.5"
          style={{ textTransform: "uppercase" }}
        >
          {data.yLabel}
        </text>
        <text
          x={padL + chartW / 2}
          y={height - 8}
          textAnchor="middle"
          fill={p.bodyMuted}
          fontSize="10"
          fontFamily="var(--font-mono)"
          letterSpacing="1.5"
          style={{ textTransform: "uppercase" }}
        >
          {data.xLabel}
        </text>
        <motion.path
          d={path}
          fill="none"
          stroke={p.base}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ strokeDasharray: pathLen, strokeDashoffset: pathLen }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        {points.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="3" fill={p.base} />
        ))}
        {data.xLabels.map((lbl, i) => (
          <text
            key={i}
            x={padL + (i / (data.xLabels.length - 1 || 1)) * chartW}
            y={padT + chartH + 20}
            textAnchor="middle"
            fill={p.bodyMuted}
            fontSize="10"
            fontFamily="var(--font-mono)"
            letterSpacing="1"
            style={{ textTransform: "uppercase" }}
          >
            {lbl}
          </text>
        ))}
      </svg>
      {data.citation && (
        <div
          className="font-mono uppercase text-center mt-4"
          style={{
            color: p.bodyMuted,
            fontSize: "10px",
            letterSpacing: "0.18em",
            opacity: 0.7,
          }}
        >
          {data.citation}
        </div>
      )}
    </div>
  );
}

/* ═══ FIT COLUMN ═══ */
function FitColumn({
  title,
  bullets,
  p,
  side,
}: {
  title: string;
  bullets: FitBullet[];
  p: AccentPalette;
  side: "left" | "right";
}) {
  return (
    <div
      className="p-7 rounded-lg border"
      style={{ borderColor: p.border, background: p.bg }}
    >
      <div
        className="font-mono uppercase mb-6 pb-4"
        style={{
          color: p.base,
          fontSize: "11px",
          letterSpacing: "0.2em",
          borderBottom: `1px solid ${p.border}`,
        }}
      >
        {title}
      </div>
      <ul className="space-y-5">
        {bullets.map((b, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: side === "left" ? -16 : 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: i * 0.09, ease: "easeOut" }}
            className="flex gap-3"
          >
            <span
              className="mt-2 flex-shrink-0 rounded-full"
              style={{ width: "5px", height: "5px", background: p.base }}
            />
            <div>
              <span
                className="font-sans font-medium"
                style={{ color: p.bodyStrong, fontSize: "16px", lineHeight: 1.6 }}
              >
                {b.lead}
              </span>
              <span
                className="font-sans font-light"
                style={{ color: p.bodyMuted, fontSize: "16px", lineHeight: 1.6 }}
              >
                {b.rest ? ` — ${b.rest}` : ""}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ═══ ACTION CARD ═══ (Playbook section) */
function ActionCardEl({
  action,
  index,
  p,
}: {
  action: ActionCard;
  index: number;
  p: AccentPalette;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="pl-7"
      style={{ borderLeft: `2px solid ${p.base}` }}
    >
      <div
        className="font-mono mb-3"
        style={{
          color: p.base,
          fontSize: "11px",
          letterSpacing: "0.22em",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>
      <h3
        className="font-serif mb-4"
        style={{
          color: p.bodyStrong,
          fontSize: "26px",
          lineHeight: 1.25,
          fontWeight: 500,
        }}
      >
        <RichText text={action.headline} accent={p.base} />
      </h3>
      <p
        className="font-sans font-light mb-4"
        style={{ color: p.bodyMuted, fontSize: "16px", lineHeight: 1.7 }}
      >
        {action.body}
      </p>
      <div
        className="font-mono uppercase"
        style={{
          color: p.base,
          fontSize: "11px",
          letterSpacing: "0.15em",
          opacity: 0.85,
        }}
      >
        ↳ {action.receipt}
      </div>
    </motion.div>
  );
}

/* ═══ THE MAIN SHELL ═══ */
export default function BriefShell({
  content,
  isOwner,
}: {
  content: BriefContent;
  isOwner: boolean;
}) {
  const p = PALETTES[content.accent] || PALETTES.blue;
  const mailto = `mailto:${content.meta.senderEmail}?subject=${encodeURIComponent(
    "Re: " + content.hero.headerPill
  )}`;

  return (
    <div style={{ background: BG, color: p.bodyStrong, minHeight: "100vh" }}>
      {/* Sticky header bar */}
      <div
        className="sticky top-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between backdrop-blur-md"
        style={{
          background: "rgba(10, 8, 20, 0.8)",
          borderBottom: `1px solid ${p.border}`,
        }}
      >
        <div
          className="font-serif"
          style={{ color: p.bodyStrong, fontSize: "16px", letterSpacing: "0.05em" }}
        >
          <span style={{ fontWeight: 600 }}>{content.hero.byline.split("·")[0]?.trim() || "LORE"}</span>
        </div>
        <a
          href={mailto}
          className="font-mono uppercase px-4 py-2 rounded-full transition-opacity hover:opacity-80"
          style={{
            background: p.base,
            color: BG,
            fontSize: "10px",
            letterSpacing: "0.2em",
            textDecoration: "none",
          }}
        >
          Reply to this
        </a>
      </div>

      <Hero content={content} p={p} />

      {/* Section divider */}
      <div className="px-6 md:px-10">
        <div className="max-w-[820px] mx-auto" style={{ borderTop: `1px solid ${p.border}` }} />
      </div>

      {/* ═══ 01 — THE MIRROR ═══ */}
      <section className="px-6 md:px-10 py-28 md:py-36">
        <div className="max-w-[820px] mx-auto">
          <FadeIn>
            <Eyebrow color={p.base}>{content.mirror.eyebrow}</Eyebrow>
            <SectionHeadline
              bold={content.mirror.headlineBold}
              italic={content.mirror.headlineItalic}
              accent={p.base}
              strong={p.bodyStrong}
            />
            <Intro text={content.mirror.intro} muted={p.bodyMuted} />
          </FadeIn>

          {content.mirror.bigStat && (
            <FadeIn delay={0.1}>
              <BigStatEl stat={content.mirror.bigStat} p={p} />
            </FadeIn>
          )}

          {content.mirror.cards && content.mirror.cards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {content.mirror.cards.map((c, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <StatCardEl card={c} p={p} />
                </FadeIn>
              ))}
            </div>
          )}

          {content.mirror.pullQuote && (
            <FadeIn delay={0.2}>
              <PullQuoteEl q={content.mirror.pullQuote} p={p} />
            </FadeIn>
          )}
        </div>
      </section>

      <div className="px-6 md:px-10">
        <div className="max-w-[820px] mx-auto" style={{ borderTop: `1px solid ${p.border}` }} />
      </div>

      {/* ═══ 02 — THE GAP ═══ */}
      <section className="px-6 md:px-10 py-28 md:py-36">
        <div className="max-w-[820px] mx-auto">
          <FadeIn>
            <Eyebrow color={p.base}>{content.gap.eyebrow}</Eyebrow>
            <SectionHeadline
              bold={content.gap.headlineBold}
              italic={content.gap.headlineItalic}
              accent={p.base}
              strong={p.bodyStrong}
            />
            <Intro text={content.gap.intro} muted={p.bodyMuted} />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {content.gap.cards.map((c, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <StatCardEl card={c} p={p} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <Chart data={content.gap.chart} p={p} />
          </FadeIn>
        </div>
      </section>

      <div className="px-6 md:px-10">
        <div className="max-w-[820px] mx-auto" style={{ borderTop: `1px solid ${p.border}` }} />
      </div>

      {/* ═══ 03 — THE FIT ═══ */}
      <section className="px-6 md:px-10 py-28 md:py-36">
        <div className="max-w-[820px] mx-auto">
          <FadeIn>
            <Eyebrow color={p.base}>{content.fit.eyebrow}</Eyebrow>
            <SectionHeadline
              bold={content.fit.headlineBold}
              italic={content.fit.headlineItalic}
              accent={p.base}
              strong={p.bodyStrong}
            />
            <Intro text={content.fit.intro} muted={p.bodyMuted} />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FadeIn delay={0.1}>
              <FitColumn
                title={content.fit.leftColumnTitle}
                bullets={content.fit.leftBullets}
                p={p}
                side="left"
              />
            </FadeIn>
            <FadeIn delay={0.2}>
              <FitColumn
                title={content.fit.rightColumnTitle}
                bullets={content.fit.rightBullets}
                p={p}
                side="right"
              />
            </FadeIn>
          </div>
        </div>
      </section>

      <div className="px-6 md:px-10">
        <div className="max-w-[820px] mx-auto" style={{ borderTop: `1px solid ${p.border}` }} />
      </div>

      {/* ═══ 04 — THE PLAYBOOK ═══ */}
      <section className="px-6 md:px-10 py-28 md:py-36">
        <div className="max-w-[820px] mx-auto">
          <FadeIn>
            <Eyebrow color={p.base}>{content.playbook.eyebrow}</Eyebrow>
            <SectionHeadline
              bold={content.playbook.headlineBold}
              italic={content.playbook.headlineItalic}
              accent={p.base}
              strong={p.bodyStrong}
            />
            <Intro text={content.playbook.intro} muted={p.bodyMuted} />
          </FadeIn>

          <div className="space-y-14 mt-8">
            {content.playbook.actions.map((a, i) => (
              <ActionCardEl key={i} action={a} index={i} p={p} />
            ))}
          </div>
        </div>
      </section>

      <div className="px-6 md:px-10">
        <div className="max-w-[820px] mx-auto" style={{ borderTop: `1px solid ${p.border}` }} />
      </div>

      {/* ═══ CLOSE ═══ */}
      <section className="px-6 md:px-10 py-28 md:py-36 text-center">
        <div className="max-w-[680px] mx-auto">
          <FadeIn>
            <div
              className="font-mono uppercase mb-6"
              style={{
                color: p.base,
                fontSize: "11px",
                letterSpacing: "0.25em",
              }}
            >
              {content.close.eyebrow}
            </div>
            <h2
              className="font-serif font-normal mb-8"
              style={{
                color: p.bodyStrong,
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                lineHeight: 1.2,
              }}
            >
              {content.close.headlineBold}{" "}
              <em style={{ color: p.base, fontStyle: "italic" }}>
                {content.close.headlineItalic}
              </em>
            </h2>
            <p
              className="font-sans font-light mx-auto mb-10"
              style={{
                color: p.bodyMuted,
                fontSize: "17px",
                lineHeight: 1.7,
                maxWidth: "560px",
              }}
            >
              {content.close.body}
            </p>
            <a
              href={mailto}
              className="inline-block font-mono uppercase px-8 py-4 rounded-full transition-opacity hover:opacity-85"
              style={{
                background: p.base,
                color: BG,
                fontSize: "12px",
                letterSpacing: "0.2em",
                textDecoration: "none",
              }}
            >
              {content.close.ctaText}
            </a>
            <div
              className="font-mono uppercase mt-5"
              style={{
                color: p.bodyMuted,
                fontSize: "10px",
                letterSpacing: "0.22em",
              }}
            >
              {content.close.ctaSubtext}
            </div>

            {/* Contact row */}
            <div
              className="mt-14 pt-8 font-mono uppercase flex flex-wrap justify-center gap-x-6 gap-y-2"
              style={{
                borderTop: `1px solid ${p.border}`,
                color: p.bodyMuted,
                fontSize: "10px",
                letterSpacing: "0.18em",
              }}
            >
              <span>{content.meta.senderEmail}</span>
              {content.meta.senderPhone && <span>·</span>}
              {content.meta.senderPhone && <span>{content.meta.senderPhone}</span>}
              {content.meta.senderLinkedIn && <span>·</span>}
              {content.meta.senderLinkedIn && <span>{content.meta.senderLinkedIn}</span>}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 md:px-10 py-6 flex items-center justify-between"
        style={{ borderTop: `1px solid ${p.border}` }}
      >
        <div
          className="font-mono uppercase"
          style={{
            color: p.bodyMuted,
            fontSize: "10px",
            letterSpacing: "0.2em",
          }}
        >
          Generated by LORE
        </div>
        <div
          className="font-mono uppercase"
          style={{
            color: p.bodyMuted,
            fontSize: "10px",
            letterSpacing: "0.2em",
            opacity: 0.7,
          }}
        >
          {content.meta.docTitle}
        </div>
      </footer>

      {/* Owner-only email panel — NEVER rendered for recipients */}
      {isOwner && (
        <section
          className="px-6 md:px-10 py-16"
          style={{
            background: "rgba(0,0,0,0.35)",
            borderTop: `1px solid ${p.border}`,
          }}
        >
          <div className="max-w-[820px] mx-auto">
            <div
              className="font-mono uppercase mb-3 text-center"
              style={{
                color: p.base,
                fontSize: "11px",
                letterSpacing: "0.25em",
              }}
            >
              Owner-only · Your outreach copy
            </div>
            <p
              className="font-sans font-light text-center mb-8"
              style={{ color: p.bodyMuted, fontSize: "14px", maxWidth: "520px", margin: "0 auto 2rem" }}
            >
              This email copy is visible only to you. When you share your brief
              link, recipients will never see this panel.
            </p>

            <div className="mb-6">
              <div
                className="font-mono uppercase mb-2"
                style={{
                  color: p.bodyMuted,
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                }}
              >
                Subject Line
              </div>
              <div
                className="p-4 rounded-lg font-sans"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${p.border}`,
                  color: p.bodyStrong,
                  fontSize: "15px",
                }}
              >
                {content.email.subject}
              </div>
            </div>

            <div>
              <div
                className="font-mono uppercase mb-2"
                style={{
                  color: p.bodyMuted,
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                }}
              >
                Email Body
              </div>
              <pre
                className="p-4 rounded-lg font-sans whitespace-pre-wrap"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${p.border}`,
                  color: p.bodyStrong,
                  fontSize: "15px",
                  lineHeight: 1.65,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {content.email.body}
              </pre>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

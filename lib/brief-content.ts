/* ───────────────────────────────────────────
   BriefContent — the contract between Claude
   and the Brief Shell. Claude generates ONLY
   content slots. All layout, motion, CSS,
   typography, and responsive behavior lives
   in components/BriefShell.tsx.

   Modeled on the Plaid + Jenna reference briefs:
   Plaid's structure + info density, Jenna's
   chart moments + simplicity.
   ─────────────────────────────────────────── */

/* Hue-matched accent families keyed off user type.
   The shell owns the actual hex values; Claude just
   picks a key. This prevents Claude from inventing
   off-brand colors per brief. */
export type AccentKey =
  | "blue"     // job_seeker default — cornflower, matches Plaid ref
  | "rose"     // influencer_brand, creative — matches Jenna ref
  | "gold"     // salesperson — warm auth
  | "emerald"  // hiring_manager — calm confidence
  | "violet";  // custom/fallback

export interface HeroBlock {
  /* Header pill above the headline. Short, all-caps. Example:
     "A CANDIDACY BRIEF — PREPARED FOR EMILY HAAHR, CCO · PLAID" */
  headerPill: string;

  /* Headline split. boldHalf renders in white serif, italicHalf
     renders in the accent color as italic serif. Together they
     form one sentence. Max 22 words total combined. */
  headlineBold: string;
  headlineItalic: string;

  /* One short paragraph under the headline. Plain text, no markup.
     Max 55 words. Muted color. */
  subhead: string;

  /* The byline row. "KYLE CASTRO · CES OPERATIONS LEADER · NASHVILLE, TN" */
  byline: string;
}

/* A single big stat moment à la Jenna's "6%" or "18".
   Used sparingly for maximum impact. */
export interface BigStat {
  /* The number/value, already formatted. "$2.1M", "6%", "18", "$100M+" */
  value: string;
  /* Small eyebrow label above. All-caps mono. Max 5 words. */
  label: string;
  /* One-line caption below, plain prose. Max 16 words. */
  caption: string;
}

/* A compact stat card with eyebrow + big number + body + citation.
   Used in rows of 3 for Mirror and Gap sections. */
export interface StatCard {
  /* Mono eyebrow, all-caps. Max 8 words. */
  eyebrow: string;
  /* Big serif number. Already formatted. "$2.1M", "74%", "6-9" */
  value: string;
  /* Small label directly under the number. Max 10 words. */
  valueLabel: string;
  /* Body prose explaining the number. Max 45 words. */
  body: string;
  /* Citation footer in mono. "GARTNER CUSTOMER SERVICE RESEARCH, 2024"
     Empty string means no citation shown. */
  citation: string;
}

/* A named bullet for the Fit two-column comparison.
   Shown as: "• Bold lead — rest of line in muted." */
export interface FitBullet {
  /* The bold leading phrase. Max 10 words. */
  lead: string;
  /* The muted rest. Max 20 words. */
  rest: string;
}

/* One of three executable actions in the Playbook section.
   Modeled on Jenna's "Three moves that change everything." */
export interface ActionCard {
  /* Action index label. "01", "02", "03" — the shell provides this;
     Claude does not need to set it. */
  /* The action headline. Bold + italic mix. Example:
     "Launch a video-first content arm" where "video-first" is the
     italic accent. Use {{i}}...{{/i}} to mark the italic span. */
  headline: string;
  /* 2-sentence max description of HOW and WHY. Max 45 words. */
  body: string;
  /* Short receipt/proof line. Max 20 words. Mono. */
  receipt: string;
}

/* Chart data. The shell renders these as SVG — Claude never writes SVG.
   Shell picks sizing, colors, labels based on accent key. */
export type ChartData =
  | {
      type: "bar";
      /* X-axis label. Max 6 words. */
      xLabel: string;
      /* Y-axis label. Max 6 words. */
      yLabel: string;
      /* Each bar = { label, value }. Max 8 bars. */
      bars: { label: string; value: number }[];
      /* Optional citation below the chart. */
      citation?: string;
    }
  | {
      type: "donut";
      /* Each slice. Max 6 slices. Values should sum to ~100. */
      slices: { label: string; value: number }[];
      citation?: string;
    }
  | {
      type: "line";
      xLabel: string;
      yLabel: string;
      /* X-axis tick labels in order. Max 12 points. */
      xLabels: string[];
      /* Y values in order, same length as xLabels. */
      yValues: number[];
      citation?: string;
    };

/* Pull quote / blockquote section, à la Plaid's italic block.
   Used as a transition between Mirror and Gap. */
export interface PullQuote {
  /* The quote body. 1-3 sentences. Max 60 words.
     Use {{i}}...{{/i}} for emphasis spans in the accent color. */
  text: string;
  /* Small attribution line below. Optional. "— OBSERVED PATTERN" */
  attribution?: string;
}

/* Section 01 — The Mirror.
   "Here is what you have already built / who you already are." */
export interface MirrorSection {
  eyebrow: string;        // "01 — THE MIRROR"
  headlineBold: string;
  headlineItalic: string;
  intro: string;          // Short lead paragraph. Max 45 words.
  /* Choose one visual mode:
     - "cards": 3-4 StatCards (Plaid-style credential cards)
     - "bigStat": 1 giant BigStat (Jenna's "18 years" moment) */
  cards?: StatCard[];     // 3-4 cards when mode is cards
  bigStat?: BigStat;      // one stat when mode is bigStat
  /* Optional pull quote shown after cards/stat. */
  pullQuote?: PullQuote;
}

/* Section 02 — The Gap.
   "Here is the cost / the opportunity / what's missing." */
export interface GapSection {
  eyebrow: string;        // "02 — THE GAP"
  headlineBold: string;
  headlineItalic: string;
  intro: string;          // Max 45 words.
  /* 3 cited stat cards — always 3 for Gap, to drive the point home. */
  cards: StatCard[];
  /* Exactly one chart to visualize the gap. Jenna-style moment. */
  chart: ChartData;
}

/* Section 03 — The Fit.
   Two-column: "What they need" / "What I have built." */
export interface FitSection {
  eyebrow: string;        // "03 — THE FIT"
  headlineBold: string;
  headlineItalic: string;
  intro: string;          // Max 45 words.
  leftColumnTitle: string;  // e.g. "WHAT PLAID NEEDS"
  rightColumnTitle: string; // e.g. "WHAT KYLE HAS BUILT"
  leftBullets: FitBullet[];  // 3-5 bullets
  rightBullets: FitBullet[]; // matching count, parallel order
}

/* Section 04 — The Playbook.
   "Three moves I'll execute" — always exactly 3 actions. */
export interface PlaybookSection {
  eyebrow: string;        // "04 — THE PLAYBOOK"
  headlineBold: string;
  headlineItalic: string;
  intro: string;          // Max 45 words.
  actions: [ActionCard, ActionCard, ActionCard];
}

/* Close section — the CTA and contact row. */
export interface CloseSection {
  eyebrow: string;        // "KYLE CASTRO · CES OPERATIONS LEADER"
  headlineBold: string;   // "Not a cover letter."
  headlineItalic: string; // "A brief from someone who already thinks this way."
  body: string;           // 2-3 sentence close. Max 50 words.
  ctaText: string;        // "REPLY TO KYLE"
  ctaSubtext: string;     // "JUST REPLY IF IT RESONATES"
}

/* Email copy — shown ONLY in owner view (sender's private panel).
   Never rendered to recipients. */
export interface EmailCopy {
  subject: string;
  body: string; // plain text, line breaks preserved
}

/* The full contract. This is exactly what Claude returns as JSON,
   and exactly what the shell consumes. */
export interface BriefContent {
  /* Schema version, for forward-compat. Start at 1. */
  version: 1;

  /* Visual accent family. Shell owns the actual colors. */
  accent: AccentKey;

  /* Meta shown in footer + document title. */
  meta: {
    /* "A Candidacy Brief for Plaid" — shown in footer + <title>. */
    docTitle: string;
    /* Sender's email for the mailto: Reply CTA. Must be valid. */
    senderEmail: string;
    /* Sender's phone (optional). "(615) 555-5555" */
    senderPhone?: string;
    /* Sender's LinkedIn (optional). "linkedin.com/in/kylecastro" */
    senderLinkedIn?: string;
  };

  hero: HeroBlock;
  mirror: MirrorSection;
  gap: GapSection;
  fit: FitSection;
  playbook: PlaybookSection;
  close: CloseSection;

  /* Owner-only. Never serialized to public viewers by the shell. */
  email: EmailCopy;
}

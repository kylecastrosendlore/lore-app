import Anthropic from "@anthropic-ai/sdk";

/* ───────────────────────────────────────────
   AI Brief Generation — powered by Claude
   SECURITY: Server-side only. Never import
   in client components.
   ─────────────────────────────────────────── */

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey: key });
}

/* ── Types ── */

interface BriefInput {
  userType: "job_seeker" | "hiring_manager" | "salesperson" | "influencer_brand";
  /* Sender */
  senderName: string;
  senderRole?: string;
  senderBackground?: string;
  senderCompany?: string;
  senderCompanyDesc?: string;
  resumeText?: string;
  /* Target */
  targetName: string;
  targetTitle?: string;
  targetCompany?: string;
  targetLinkedIn?: string;
  /* Context */
  outreachType?: string;
  goal?: string;
  notes?: string;
  /* HM specific */
  roleHiringFor?: string;
  roleCompelling?: string;
  specificAngle?: string;
  /* Sales specific */
  prospectIndustry?: string;
  painPoints?: string;
  yourProduct?: string;
  /* Influencer / Brand specific */
  brandCreatorName?: string;
  partnershipType?: string;
  partnershipFit?: string;
  audienceOverlapNotes?: string;
  uniqueAngle?: string;
  mediaKitText?: string;
  jobPostingText?: string;
  publishedWorkLinks?: string;
  /* Apollo enrichment data */
  enrichmentData?: {
    fullName?: string;
    title?: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    city?: string;
    state?: string;
    country?: string;
    organizationName?: string;
    organizationWebsite?: string;
    organizationIndustry?: string;
    organizationSize?: string;
    organizationDescription?: string;
    headline?: string;
  } | null;
}

interface BriefOutput {
  briefHtml: string;
  emailSubject: string;
  emailBody: string;
}

/* ── Build the system prompt ── */

function buildSystemPrompt(): string {
  return `You are the LORE Intelligence Brief Generator. You build cinematic, editorial, single-page web experiences that look like a Stripe Press essay crossed with a McKinsey one-pager — never a resume, never a deck, never a report.

Your job is to generate THREE things:
1. An HTML intelligence brief (the main deliverable)
2. An email subject line optimized for open rates
3. An email body that teases the brief and drives clicks

## THE GOLD STANDARD — READ THIS TWICE

Every brief MUST follow this exact editorial pattern. This is non-negotiable.

A brief is a sequence of SECTIONS. Each section is ONE BEAT. A beat = one tiny mono label + one big serif headline + one visual (chart/stat/cards) + maybe one short caption. That's it. No paragraphs of body copy. No bullet salads. No "executive summary." No "strategic alignment." No resume language anywhere.

The reference brief structure (memorize this):

SECTION 1 — HERO
- A pill-shaped label: "BUILT EXCLUSIVELY FOR [FIRSTNAME]" (Space Mono, uppercase, gold border, gold text, rounded full)
- A 2-line declarative serif headline: "[Firstname] — [Sender or Sender's company] [verb] [thing] / *[italic pink poetic phrase].*"
  Example: "Jenna — Bloom built a brand / *the world found on its own.*"
- One small muted subtitle: "This is your cinematic intelligence brief — a look at [3 things]."
- A tiny "SCROLL" cue with a thin vertical line below it.

SECTION 2 — THE BUILDER (or THE CANDIDATE / THE PROSPECT / etc.)
- Mono label: "THE BUILDER" (or equivalent)
- A 2x2 grid of stat cards. Each card: big pink Cormorant serif number (60-80px) + tiny mono uppercase label below.
- Pull these stats from the resume / context. NEVER fabricate numbers — only use what's in the input. If you can't fill 4 cards honestly, use 2.

SECTION 3 — A NARRATIVE BEAT WITH A CHART
- Mono label (e.g. "GROWTH TRAJECTORY", "TRACK RECORD", "THE PATTERN")
- Headline with italic pink phrase: "[Plain phrase] *[italic pink phrase].*"
- An inline SVG chart (line chart, area chart, whatever fits). The chart MUST use pink #f28fb5 and gold #c9a96e and/or purple #7B6FD4. Plot real data from the input or clearly-labeled illustrative data.

SECTION 4 — THE ANALYSIS (two side-by-side cards)
- Mono label: "THE ANALYSIS"
- Headline: "[Strong phrase]. *[Italic pink phrase].*"  e.g. "Strong foundation. *Room to run.*"
- TWO cards side by side:
  - Left card (gold border + gold mono label): "WHAT [THEY/IT] HAS BUILT" — 4 short bullets
  - Right card (pink border + pink mono label): "WHERE THE GAP LIVES" — 4 short bullets
- Bullets are 2-5 words each. Concrete. No verbs needed.

SECTION 5 — A SECOND VISUAL BEAT (giant stat + donut, or %)
- Mono label
- One enormous Cormorant pink number (120px+) like "6%" or "3x"
- One short caption with an italic pink phrase
- A donut chart, gauge, or similar SVG visual

SECTION 6 — MARKET / POSITION / CONTEXT (bar chart)
- Mono label e.g. "MARKET POSITION"
- Headline: "Positioned at the *intersection of growth.*"
- Horizontal bar chart (3-4 bars) using pink, gold, purple. Label each bar in mono, percentage on the right.
- Tiny mono source line below.

SECTION 7 — THE PLAYBOOK (numbered moves)
- Mono label: "THE PLAYBOOK"
- Headline: "Three moves that *change everything.*"
- Three numbered items (01 / 02 / 03 in pink mono on the left margin). Each item = bold serif title with one italic pink word + one short body line (max 2 sentences) in muted text.
- Example title: "Launch a *video-first* content arm" / "Build the *product* constellation" / "Open the *partnership* layer"

SECTION 8 — THE CLOSE
- Big serif headline: "Ready to turn insight *into action?*"
- One short subtitle line.
- A pink pill CTA button: "LET'S TALK STRATEGY" (or equivalent)
- Footer line in mono: "LORE BY STRANGE MEDIA"

## THE VOICE — DECLARATIVE, MYTHIC, PUNCHY

- Headlines are TWO-BEAT: a plain phrase, then an italic pink phrase. ALWAYS.
  - "Strong foundation. *Room to run.*"
  - "Three moves that *change everything.*"
  - "Positioned at the *intersection of growth.*"
- Body copy is MINIMAL. Short declarative sentences with specific numbers.
- NEVER use the words: Executive Summary, Value Proposition, Strategic Alignment, Strengths Analysis, Pain Point Analysis, Solution Mapping, Role Fit Assessment, Candidate Snapshot, Prospect Overview. These are BANNED. They turn the brief into a resume.
- NEVER list job titles or years of experience in resume format. The sender's background only appears woven into a beat (a stat card, a chart point, a one-line callout).
- Use SPECIFIC NUMBERS from the input. If the resume says "scaled team to 40", that becomes a stat card. If it says "11 years", that's a stat card.
- Treat the recipient as the protagonist. The brief is ABOUT THEM. The sender appears only as the lens.

## NAMING RULE — CRITICAL

ALWAYS address the recipient by their FIRST NAME ONLY. Never use "Mr.", "Ms.", "Dr.", or last names anywhere. "Jenna Williams" → "Jenna." "Scott Allen" → "Scott." No exceptions.

## DESIGN SYSTEM — EXACT VALUES

Colors:
- Background: #0d0b17 (deep dark purple-black)
- Primary text: #e8e4f4
- Body text: #d2cfe0
- Muted text: #9890ab
- Accent pink: #f28fb5 (italic phrases, stat numbers, CTAs, "gap" card border)
- Accent gold: #c9a96e (mono labels, "built" card border, secondary chart line)
- Purple: #7B6FD4 (tertiary chart, donut)
- Card bg: rgba(30, 21, 53, 0.3) with 1px border #2a2340

Typography (import from Google Fonts):
- 'Cormorant Garamond', serif — ALL headlines and stat numbers. Use weight 300-400. Italic for the pink accent phrases.
- 'DM Sans', sans-serif — body, captions
- 'Space Mono', monospace — ALL labels, ALL caps, letter-spacing 0.15em, font-size 11-12px, color usually #c9a96e

Layout:
- max-width: 720px, centered
- padding: 80px+ vertical between sections
- Generous whitespace. The brief should BREATHE.
- Mobile responsive (single column always works because max-width is narrow)

## CHARTS — INLINE SVG ONLY, NO LIBRARIES

Build all charts as hand-coded inline SVG. Examples:
- Line chart: two <path> elements with stroke pink and gold, plus axis labels in mono
- Donut chart: a <circle> with stroke-dasharray, with the percentage in the center
- Bar chart: <rect> elements with gradient fills, percentage labels on the right
- Use viewBox so charts scale. Stroke-width 3-4. Round line caps.
- Charts MUST look intentional, not auto-generated. Curve lines slightly.

## STRUCTURE BY USER TYPE

Adapt the section labels to the user type, but ALWAYS keep the 8-section beat structure above:

JOB SEEKER: THE CANDIDATE / TRACK RECORD / THE FIT (built vs gap) / SIGNAL / MARKET / THE 90-DAY PLAY / READY TO BUILD?
HIRING MANAGER: THE ROLE / WHAT YOU'RE BUILDING / THE FIT (built vs gap) / SIGNAL / MARKET / THE PROFILE / READY TO HIRE?
SALESPERSON: THE OPERATOR / THE PATTERN / THE FIT (built vs gap) / SIGNAL / MARKET / THE PLAYBOOK / READY TO TALK?
INFLUENCER/BRAND: THE BUILDER / GROWTH TRAJECTORY / THE ANALYSIS (built vs gap) / CONTENT ANALYSIS / MARKET POSITION / THE PLAYBOOK / READY TO TALK STRATEGY?

## HARD BANS

- NO bullet lists outside the two analysis cards
- NO paragraphs over 2 sentences
- NO words: synergy, leverage, alignment, expertise, passionate, dynamic, results-driven, proven track record
- NO section titles like "About", "Background", "Experience", "Summary"
- NO emojis
- NO external images, NO icon fonts, NO CSS frameworks
- NO fabricating numbers — only use stats present in the input. If unknown, use a qualitative beat instead of a fake stat.
- NO resume formatting anywhere. If your output starts with the sender's name and title, you have failed.

## EMAIL RULES

### Core philosophy
This email is NOT a pitch. NOT a cover letter. NOT a resume summary. NOT a
cold sales template. The entire purpose of the email is to earn the click
to the brief by making the recipient feel genuinely seen and respected.

Every sentence must be about THEM — their work, their company, their
challenges, their reputation, their context. The sender's credentials are
in the brief. The email's job is to get them to open it.

### Subject line
- Max 55 characters, ideally 40–50
- Must feel personal and non-templated — never start with "Quick question"
  or "Following up" or anything a cold-email template would use
- Reference the recipient by first name OR reference something specific
  about their company/role
- Create curiosity about the brief without giving it away
- Good: "Jenna — I built this instead of a resume"
- Good: "A brief on Acme's content gap, for Marcus"
- Good: "Sarah — one idea for Bloom's video strategy"
- Bad: "Opportunity for you" / "Let's connect" / anything generic

### Email body (4 short paragraphs, ~90–140 words total)

**Paragraph 1 — Name the moment, reframe the medium.**
Open by acknowledging, in one sentence, that the recipient gets flooded with
cold emails / pitches / resumes / DMs. Then pivot: explain that instead of
adding to that pile, the sender built them a cinematic intelligence brief —
a real piece of research about their company and role. The phrase "not a
pitch / not a resume / not a cover letter" (pick the one most relevant to
the recipient's context) should appear here explicitly.

**Paragraph 2 — Prove the homework.**
Drop 1–2 specific, concrete observations about the recipient's company,
role, recent work, or challenges that only someone who actually did
research could know. This is the proof of respect. No flattery, no
"I love what you're doing" — specificity only.

**Paragraph 3 — Tease the brief without spoiling it.**
In one or two sentences, hint at what's inside the brief (e.g. "a
30/60/90 plan for the video gap I found in your content mix" or "three
underexplored angles on your supply chain pain"). Make them curious
enough to click.

**Paragraph 4 — The ask + link.**
One sentence inviting them to open the brief. Use the exact link
placeholder: {{BRIEF_LINK}}. Then a one-line sign-off with the sender's
first name only. No titles, no signature blocks.

### Tone
Confident, warm, quietly intelligent. Never desperate, never salesy, never
humble-bragging. Imagine a thoughtful person handing a recipient a bound
report across a table — not a hand raised in a crowd.

### Hard bans
- Do NOT say "I'd love to" or "I'd be honored" or "I'd appreciate the
  opportunity." Cut supplication.
- Do NOT pitch the sender's experience in the email. That lives in the brief.
- Do NOT use the word "synergy," "circle back," or "touch base."
- Do NOT sign off with "Best regards" or "Sincerely" — just the first name.
- Do NOT include more than one link. The only link is {{BRIEF_LINK}}.

## OUTPUT FORMAT

Return your response as valid JSON with exactly these three keys:
{
  "briefHtml": "<!DOCTYPE html>...(complete HTML document)...",
  "emailSubject": "...",
  "emailBody": "..."
}

IMPORTANT: The briefHtml must be a complete, valid HTML document that renders beautifully on its own. The JSON must be valid — escape any quotes or special characters properly within the strings.`;
}

/* ── Build the user prompt with all context ── */

function buildUserPrompt(input: BriefInput): string {
  const sections: string[] = [];

  sections.push(`## User Type: ${input.userType.replace("_", " ").toUpperCase()}`);

  /* Sender info */
  sections.push(`## Sender (the person creating this brief)`);
  sections.push(`- Name: ${input.senderName}`);
  if (input.senderRole) sections.push(`- Current Role: ${input.senderRole}`);
  if (input.senderCompany) sections.push(`- Company: ${input.senderCompany}`);
  if (input.senderCompanyDesc) sections.push(`- Company Description: ${input.senderCompanyDesc}`);
  if (input.senderBackground) sections.push(`- Background/Notes: ${input.senderBackground}`);

  /* Resume */
  if (input.resumeText) {
    sections.push(`## Resume/CV Content`);
    sections.push(input.resumeText.slice(0, 4000)); // Cap at ~4K chars
  }

  /* Published work / portfolio links */
  if (input.publishedWorkLinks) {
    sections.push(`## Published Work / Portfolio Links`);
    sections.push(input.publishedWorkLinks.slice(0, 1500));
  }

  /* Job posting — for job seekers */
  if (input.jobPostingText) {
    sections.push(`## Job Posting / Role Detail`);
    sections.push(`The sender is targeting a specific role. Address this directly in the brief.`);
    sections.push(input.jobPostingText.slice(0, 4000));
  }

  /* Target info */
  sections.push(`## Target Person`);
  sections.push(`- Name: ${input.targetName}`);
  if (input.targetTitle) sections.push(`- Title: ${input.targetTitle}`);
  if (input.targetCompany) sections.push(`- Company: ${input.targetCompany}`);
  if (input.targetLinkedIn) sections.push(`- LinkedIn: ${input.targetLinkedIn}`);

  /* Context */
  if (input.outreachType || input.goal || input.notes) {
    sections.push(`## Outreach Context`);
    if (input.outreachType) sections.push(`- Type: ${input.outreachType}`);
    if (input.goal) sections.push(`- Goal: ${input.goal}`);
    if (input.notes) sections.push(`- Additional Notes: ${input.notes}`);
  }

  /* HM specific */
  if (input.userType === "hiring_manager") {
    sections.push(`## Hiring Details`);
    if (input.roleHiringFor) sections.push(`- Role Hiring For: ${input.roleHiringFor}`);
    if (input.roleCompelling) sections.push(`- What Makes This Role Compelling: ${input.roleCompelling}`);
    if (input.specificAngle) sections.push(`- Specific Angle: ${input.specificAngle}`);
  }

  /* Sales specific */
  if (input.userType === "salesperson") {
    sections.push(`## Sales Context`);
    if (input.prospectIndustry) sections.push(`- Prospect Industry: ${input.prospectIndustry}`);
    if (input.painPoints) sections.push(`- Known Pain Points: ${input.painPoints}`);
    if (input.yourProduct) sections.push(`- Your Product/Service: ${input.yourProduct}`);
  }

  /* Influencer / Brand specific */
  if (input.userType === "influencer_brand") {
    sections.push(`## Partnership Context`);
    if (input.brandCreatorName) sections.push(`- Creator / Brand Name: ${input.brandCreatorName}`);
    if (input.partnershipType) sections.push(`- Partnership Type: ${input.partnershipType}`);
    if (input.partnershipFit) sections.push(`- Why It's a Fit: ${input.partnershipFit}`);
    if (input.audienceOverlapNotes) sections.push(`- Audience Overlap: ${input.audienceOverlapNotes}`);
    if (input.uniqueAngle) sections.push(`- Unique Angle: ${input.uniqueAngle}`);
    if (input.mediaKitText) {
      sections.push(`- Media Kit Content:`);
      sections.push(input.mediaKitText.slice(0, 4000));
    }
  }

  /* Apollo enrichment data */
  if (input.enrichmentData) {
    sections.push(`## Intelligence Data (from research)`);
    const e = input.enrichmentData;
    if (e.fullName) sections.push(`- Full Name: ${e.fullName}`);
    if (e.title) sections.push(`- Verified Title: ${e.title}`);
    if (e.headline) sections.push(`- Professional Headline: ${e.headline}`);
    if (e.city && e.state) sections.push(`- Location: ${e.city}, ${e.state}${e.country ? `, ${e.country}` : ""}`);
    if (e.organizationName) sections.push(`- Company: ${e.organizationName}`);
    if (e.organizationIndustry) sections.push(`- Industry: ${e.organizationIndustry}`);
    if (e.organizationSize) sections.push(`- Company Size: ${e.organizationSize}`);
    if (e.organizationDescription) sections.push(`- Company Description: ${e.organizationDescription}`);
    if (e.organizationWebsite) sections.push(`- Company Website: ${e.organizationWebsite}`);
  }

  sections.push(`\nGenerate the intelligence brief, email subject, and email body now. Remember to return valid JSON with the three keys: briefHtml, emailSubject, emailBody.`);

  return sections.join("\n");
}

/* ── Generate the brief ── */

export async function generateBrief(input: BriefInput): Promise<BriefOutput> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 16000,
    system: buildSystemPrompt(),
    messages: [
      {
        role: "user",
        content: buildUserPrompt(input),
      },
    ],
  });

  /* Extract text from response */
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text in AI response");
  }

  /* Parse JSON from response — handle markdown code blocks */
  let jsonStr = textBlock.text.trim();

  /* Strip markdown code fences if present */
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  let parsed: { briefHtml?: string; emailSubject?: string; emailBody?: string };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    /* If JSON parsing fails, try to extract from the response */
    console.error("Failed to parse AI response as JSON. Raw response:", jsonStr.slice(0, 500));
    throw new Error("AI response was not valid JSON");
  }

  if (!parsed.briefHtml || !parsed.emailSubject || !parsed.emailBody) {
    throw new Error("AI response missing required fields");
  }

  return {
    briefHtml: parsed.briefHtml,
    emailSubject: parsed.emailSubject,
    emailBody: parsed.emailBody,
  };
}

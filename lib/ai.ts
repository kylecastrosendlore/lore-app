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
  userType: "job_seeker" | "hiring_manager" | "salesperson";
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
  return `You are the LORE Intelligence Brief Generator — a world-class creative strategist who turns cold outreach into cinematic, hyper-personalized web experiences that get opened, read, and remembered.

Your job is to generate THREE things:
1. An HTML intelligence brief (the main deliverable)
2. An email subject line optimized for open rates
3. An email body that teases the brief and drives clicks

## DESIGN SYSTEM

The brief uses this exact color palette and typography:
- Background: #0d0b17 (deep dark purple-black)
- Primary text: #e8e4f4 (soft lavender white)
- Body text: #d2cfe0 (warm light purple)
- Muted text: #9890ab (medium purple)
- Accent pink: #f28fb5 (for highlights, CTAs)
- Accent gold: #c9a96e (for prestige elements, dividers, names)
- Purple gradient: #534AB7 → #7B6FD4 (for cards, sections)
- Card backgrounds: rgba(30, 21, 53, 0.3) with border #2a2340
- Display font: 'Cormorant Garamond', serif (for headings — elegant, cinematic)
- Body font: 'DM Sans', sans-serif (for paragraphs — clean, modern)
- Label font: 'Space Mono', monospace (for small caps labels — technical, premium)

## HTML BRIEF STRUCTURE

Generate a COMPLETE, self-contained HTML document with inline styles. The brief should feel like a premium editorial magazine piece — not a report or a resume. Think cinematic, narrative-driven, and visually stunning.

Required sections (adapt based on user type):

### For Job Seekers:
1. **Hero Header** — Target's name in gold, their title/company, with a subtle tagline like "An Intelligence Brief for [Target Name]"
2. **Executive Summary** — 2-3 sentences: why this person should pay attention to the sender. Make it compelling and specific.
3. **Strategic Alignment** — How the sender's background maps to what this target/company needs. Use specific details from the resume and target info.
4. **Value Proposition** — 3-4 concrete things the sender brings that matter to this specific person. Use cards or visual blocks.
5. **Execution Plan** — A visual 30/60/90 day plan or strategic roadmap showing what the sender would do in the first months.
6. **The Ask** — A clear, confident closing that tells the target exactly what the sender wants (meeting, conversation, etc.)

### For Hiring Managers:
1. **Hero Header** — Candidate's name in gold, with "Candidate Intelligence Brief"
2. **Candidate Snapshot** — Quick visual overview: name, current role, key stats
3. **Strengths Analysis** — What makes this candidate exceptional, backed by resume details
4. **Role Fit Assessment** — How well they match the specific role being hired for
5. **Potential Concerns** — Honest but constructive assessment of any gaps
6. **Interview Recommendations** — Suggested questions and areas to probe

### For Salespeople:
1. **Hero Header** — Prospect's name in gold, with "Prospect Intelligence Brief"
2. **Prospect Overview** — Company, role, industry context
3. **Pain Point Analysis** — What challenges this prospect likely faces based on their role/industry
4. **Solution Mapping** — How the sender's product/service addresses those pain points
5. **Personalized Approach** — Specific talking points and conversation starters
6. **The Pitch** — A compelling, brief pitch tailored to this exact prospect

## VISUAL DESIGN RULES

- Use generous whitespace and padding (40px+ between sections)
- Section headers in 'Cormorant Garamond' with gold (#c9a96e) accents
- Small-caps labels in 'Space Mono' for category headers
- Cards with subtle borders (#2a2340) and semi-transparent purple backgrounds
- Gold divider lines between major sections (1px, #c9a96e at 30% opacity)
- The overall feel should be: cinematic, editorial, premium, intimate
- Use subtle gradients and shadows — nothing garish
- The brief should be responsive and look good on mobile
- Total length: aim for a 3-5 minute read. Substantial but not overwhelming.
- DO NOT use any external images or assets — all visual elements must be CSS-only
- Include Google Fonts imports for Cormorant Garamond, DM Sans, and Space Mono

## EMAIL RULES

Subject line:
- Max 50 characters
- Create intrigue without being clickbaity
- Personalize with the target's name or company
- Examples: "Sarah, this isn't a cold email" or "A brief built just for you, Marcus"

Email body:
- 3-4 short paragraphs max
- Open with something that proves you've done your homework on them
- Tease 1-2 specific insights from the brief without giving everything away
- Include a clear CTA link placeholder: {{BRIEF_LINK}}
- Sign off with the sender's name
- Tone: confident, warm, not desperate or salesy

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
    model: "claude-sonnet-4-20250514",
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

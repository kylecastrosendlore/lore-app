/* Hand-crafted demo brief HTML used by /demo.
   Fictional sender pitching a fictional CMO — no real people referenced.
   Mirrors the look and structure of an AI-generated LORE brief so visitors
   experience the real viewer chrome (sandboxed iframe + email panel + footer). */

export const DEMO_BRIEF = {
  targetName: "Jordan Reeves",
  senderName: "Maya Torres",
  emailSubject: "Lumen's welcome flow — one observation, one idea",
  emailBody: `Jordan,

This isn't a pitch. It's a brief — a short page I made specifically for you, because cold emails feel cheap when the work isn't.

I subscribed to Lumen Botanicals last week to study your welcome flow. The first three emails are beautiful, but email four (the "meet the founder" story) sends 36 hours after a non-purchase — right when intent is highest. Most DTC brands send a soft offer in that slot. You're sending a story. I think there's a version of that email that does both, and I sketched it inside the brief.

I've spent the last six years rebuilding lifecycle programs for brands like Lumen — small enough to move fast, premium enough that discounting hurts the brand. The brief below isn't a deck. It's three observations about Lumen's current flow, one specific test I'd run in the first 30 days, and what I'd want to learn before suggesting anything bigger.

If any of it lands, I'd love 20 minutes. If none of it does, you have a free audit.

— Maya

{{BRIEF_LINK}}`,
  briefHtml: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Intelligence Brief — Jordan Reeves</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0d0b17;
    color: #e8e4f4;
    font-family: 'DM Sans', sans-serif;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 760px; margin: 0 auto; padding: 80px 32px 120px; }
  .label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #c9a96e;
    margin-bottom: 16px;
  }
  .label.pink { color: #f28fb5; }
  h1 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 300;
    font-size: 56px;
    line-height: 1.1;
    color: #e8e4f4;
    margin-bottom: 24px;
    letter-spacing: -0.01em;
  }
  h1 em { color: #c9a96e; font-style: normal; }
  h2 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 400;
    font-size: 36px;
    color: #e8e4f4;
    margin-bottom: 20px;
    line-height: 1.2;
  }
  h3 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 500;
    font-size: 22px;
    color: #f28fb5;
    margin-bottom: 12px;
  }
  p {
    font-size: 17px;
    color: #d2cfe0;
    margin-bottom: 18px;
  }
  .section { padding: 64px 0; border-bottom: 1px solid rgba(42, 35, 64, 0.6); }
  .section:last-child { border-bottom: none; }
  .meta {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: #9890ab;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-top: 32px;
  }
  .observation {
    background: rgba(201, 169, 110, 0.04);
    border-left: 2px solid #c9a96e;
    padding: 28px 32px;
    margin: 24px 0;
    border-radius: 4px;
  }
  .observation .num {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: #c9a96e;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    margin-bottom: 10px;
  }
  .pull {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 300;
    line-height: 1.4;
    color: #e8e4f4;
    padding: 32px 0;
    border-top: 1px solid rgba(242, 143, 181, 0.3);
    border-bottom: 1px solid rgba(242, 143, 181, 0.3);
    margin: 32px 0;
    font-style: italic;
  }
  .pull em { color: #f28fb5; font-style: normal; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
  .card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(42, 35, 64, 0.8);
    padding: 24px;
    border-radius: 6px;
  }
  .card .stat {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px;
    color: #c9a96e;
    font-weight: 400;
    line-height: 1;
    margin-bottom: 8px;
  }
  .card .desc {
    font-size: 13px;
    color: #9890ab;
  }
  .signoff {
    margin-top: 80px;
    padding-top: 48px;
    border-top: 1px solid rgba(42, 35, 64, 0.6);
    text-align: center;
  }
  .signoff .name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    color: #c9a96e;
    font-weight: 400;
  }
  .signoff .role {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #9890ab;
    margin-top: 8px;
  }
  ul { margin: 16px 0 24px 24px; color: #d2cfe0; }
  ul li { margin-bottom: 10px; font-size: 16px; }
  @media (max-width: 640px) {
    h1 { font-size: 38px; }
    h2 { font-size: 28px; }
    .wrap { padding: 56px 24px 80px; }
    .grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<div class="wrap">

  <div class="section" style="padding-top: 0;">
    <div class="label">Intelligence Brief · For Jordan Reeves</div>
    <h1>Lumen's lifecycle program is <em>almost</em> there.</h1>
    <p style="font-size: 19px; color: #d2cfe0;">A short, specific read on three things working in your welcome flow, one thing leaving money on the table, and the test I'd run first if we worked together.</p>
    <div class="meta">Prepared by Maya Torres · Loop &amp; Order · April 2026</div>
  </div>

  <div class="section">
    <div class="label">What I noticed</div>
    <h2>I subscribed last Tuesday and watched the flow run.</h2>
    <p>Lumen's brand voice is one of the cleanest I've seen in indie skincare — quiet, confident, never shouty. The welcome flow inherits that voice beautifully. Three things are doing real work right now:</p>

    <div class="observation">
      <div class="num">Observation 01</div>
      <p style="margin: 0; color: #e8e4f4;">Email one's hero copy ("the bottle is the boring part") reframes the entire category in nine words. That's worth more than most brands' entire lifecycle program.</p>
    </div>

    <div class="observation">
      <div class="num">Observation 02</div>
      <p style="margin: 0; color: #e8e4f4;">The product education sequence (emails 2 and 3) treats the reader like a peer, not a beginner. The "what your moisturizer is actually doing" explainer is the kind of thing customers screenshot.</p>
    </div>

    <div class="observation">
      <div class="num">Observation 03</div>
      <p style="margin: 0; color: #e8e4f4;">No discount in the first 72 hours. That's brave and almost certainly correct for the brand position.</p>
    </div>
  </div>

  <div class="section">
    <div class="label pink">The gap</div>
    <h2>Email four is sending the wrong job at the right moment.</h2>
    <p>Email four arrives 36 hours after sign-up. For non-purchasers, that window is the highest-intent moment in the entire flow — the customer remembered Lumen exists and is making a second decision about whether you're worth a slot in their routine.</p>
    <p>Right now, that slot holds a founder story. The story is great. But it's a brand-building send when the moment is asking for a conversion send.</p>

    <div class="pull">
      The founder story doesn't need to leave the flow. It needs to <em>move down one slot</em> — and the gap it leaves needs a soft, brand-safe offer that still sounds like Lumen.
    </div>
  </div>

  <div class="section">
    <div class="label">The test I'd run first</div>
    <h2>One A/B, two weeks, no brand risk.</h2>
    <p>Hold the founder story for 60% of new subscribers. For the other 40%, slot in a "first-jar ritual" email at the 36-hour mark. The email is built around a single benefit-led question: <em>"Want us to walk you through the first week?"</em> The CTA offers a guided 7-day starter at 15% off — not a sitewide promo, not a banner discount, just one product, one window, one reason.</p>
    <p>Why this works without diluting the brand:</p>
    <ul>
      <li>The discount is anchored to a ritual, not a price drop.</li>
      <li>It's only offered once and only in that window.</li>
      <li>The 60% control group keeps the founder story as the brand-equity send.</li>
      <li>You learn whether intent or story performs better at the 36-hour mark — and you'll know in 14 days.</li>
    </ul>

    <div class="grid">
      <div class="card">
        <div class="stat">+18%</div>
        <div class="desc">Conservative estimate of welcome-flow conversion lift, based on similar tests I've run for premium DTC brands.</div>
      </div>
      <div class="card">
        <div class="stat">$0</div>
        <div class="desc">Brand risk. The control group keeps the existing flow exactly as-is.</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="label">Why I built this instead of pitching you</div>
    <h2>Because the work is the pitch.</h2>
    <p>I've spent six years rebuilding lifecycle programs for brands in Lumen's neighborhood — small enough to move fast, premium enough that the wrong discount strategy actually costs you. Most of my clients found me after a free audit just like this one.</p>
    <p>If anything in this brief landed, I'd love 20 minutes to walk through what a 90-day engagement could look like. If it didn't, you've got a documented test you can run yourself — no strings, no follow-up sequence, no "just circling back."</p>
  </div>

  <div class="signoff">
    <div class="name">Maya Torres</div>
    <div class="role">Founder · Loop &amp; Order · Lifecycle &amp; Retention</div>
  </div>

</div>
</body>
</html>`,
};

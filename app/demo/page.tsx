"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DEMO_BRIEF } from "@/lib/demo-brief";

/* ───────────────────────────────────────────
   /demo
   Public, free, hand-crafted sample brief.
   No database, no payment, no token gate.
   Mirrors /brief/[id] viewer chrome so visitors
   experience exactly what their target would see.
   ─────────────────────────────────────────── */

export default function DemoBrief() {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [iframeHeight, setIframeHeight] = useState(3000);

  /* Listen for height messages from the sandboxed iframe */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== "null" && event.origin !== window.location.origin) return;
      const data = event.data;
      if (data && data.type === "lore:resize" && typeof data.height === "number") {
        setIframeHeight(Math.min(Math.max(data.height + 50, 600), 20000));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ backgroundColor: "#0d0b17" }} className="min-h-screen">
      {/* Top bar */}
      <div
        className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
        style={{
          backgroundColor: "rgba(13, 11, 23, 0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(42, 35, 64, 0.5)",
        }}
      >
        <a href="/" className="flex items-center gap-2">
          <span className="font-serif text-lg font-light" style={{ color: "#e8e4f4" }}>
            L<span style={{ color: "#f28fb5" }}>O</span>R<span style={{ color: "#c9a96e" }}>E</span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          <span
            className="font-mono text-[10px] uppercase px-3 py-1 rounded-full hidden sm:inline-block"
            style={{
              letterSpacing: "0.15em",
              color: "#c9a96e",
              border: "1px solid rgba(201, 169, 110, 0.4)",
              backgroundColor: "rgba(201, 169, 110, 0.06)",
            }}
          >
            Sample Brief
          </span>
          <button
            onClick={() => setShowEmail(!showEmail)}
            className="font-mono text-xs uppercase px-4 py-2 rounded-full border transition-all duration-200 hover:border-[#c9a96e] hover:text-[#c9a96e]"
            style={{ letterSpacing: "0.1em", color: "#9890ab", borderColor: "#2a2340" }}
          >
            {showEmail ? "Hide Email" : "View Email Copy"}
          </button>
        </div>
      </div>

      {/* Demo banner */}
      <div
        className="px-6 py-4 text-center"
        style={{ borderBottom: "1px solid rgba(42, 35, 64, 0.5)", backgroundColor: "rgba(201, 169, 110, 0.04)" }}
      >
        <p className="font-sans text-sm" style={{ color: "#d2cfe0" }}>
          This is a sample LORE brief for a fictional target.{" "}
          <a href="/intake" className="underline transition-colors hover:text-[#c9a96e]" style={{ color: "#c9a96e" }}>
            Build your own &rarr;
          </a>
        </p>
      </div>

      {/* Email copy panel */}
      {showEmail && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
          style={{ borderBottom: "1px solid #2a2340" }}
        >
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-mono text-xs uppercase"
                  style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
                >
                  Subject Line
                </span>
                <button
                  onClick={() => copyToClipboard(DEMO_BRIEF.emailSubject, "subject")}
                  className="font-mono text-xs uppercase px-3 py-1 rounded-full border transition-all hover:border-[#c9a96e]"
                  style={{ color: copied === "subject" ? "#c9a96e" : "#9890ab", borderColor: "#2a2340" }}
                >
                  {copied === "subject" ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="font-sans text-lg" style={{ color: "#e8e4f4" }}>
                {DEMO_BRIEF.emailSubject}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-mono text-xs uppercase"
                  style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
                >
                  Email Body
                </span>
                <button
                  onClick={() => copyToClipboard(DEMO_BRIEF.emailBody, "body")}
                  className="font-mono text-xs uppercase px-3 py-1 rounded-full border transition-all hover:border-[#c9a96e]"
                  style={{ color: copied === "body" ? "#c9a96e" : "#9890ab", borderColor: "#2a2340" }}
                >
                  {copied === "body" ? "Copied!" : "Copy"}
                </button>
              </div>
              <div
                className="font-sans text-base whitespace-pre-wrap leading-relaxed"
                style={{ color: "#d2cfe0" }}
              >
                {DEMO_BRIEF.emailBody}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* The actual brief HTML — same sandboxed iframe pattern as the real viewer */}
      <div className="w-full">
        <iframe
          srcDoc={`${DEMO_BRIEF.briefHtml}
<script>
  (function () {
    function report() {
      var h = Math.max(
        document.body ? document.body.scrollHeight : 0,
        document.documentElement ? document.documentElement.scrollHeight : 0
      );
      try { parent.postMessage({ type: "lore:resize", height: h }, "*"); } catch (e) {}
    }
    window.addEventListener("load", report);
    window.addEventListener("resize", report);
    if (window.ResizeObserver && document.body) {
      new ResizeObserver(report).observe(document.body);
    }
    setTimeout(report, 300);
    setTimeout(report, 1500);
  })();
</script>`}
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
          className="w-full border-0"
          style={{ minHeight: "100vh", height: `${iframeHeight}px` }}
          title={`Sample LORE Intelligence Brief for ${DEMO_BRIEF.targetName}`}
        />
      </div>

      {/* CTA footer — this is where the demo earns its rent */}
      <div
        className="py-16 px-6 text-center"
        style={{ borderTop: "1px solid #2a2340" }}
      >
        <p
          className="font-mono text-xs uppercase mb-6"
          style={{ letterSpacing: "0.18em", color: "#c9a96e" }}
        >
          Ready for one of your own?
        </p>
        <h2
          className="font-serif text-3xl md:text-4xl font-light mb-4 max-w-2xl mx-auto"
          style={{ color: "#e8e4f4" }}
        >
          Build a brief for{" "}
          <span style={{ color: "#c9a96e" }}>your</span> target in 5 minutes.
        </h2>
        <p
          className="font-sans text-lg mb-8 max-w-xl mx-auto"
          style={{ color: "#d2cfe0" }}
        >
          Hand them this instead of a cold email, a resume, or a deck. Watch what happens.
        </p>
        <a
          href="/intake"
          className="inline-block font-mono text-xs uppercase px-8 py-4 rounded-full transition-all duration-200"
          style={{
            letterSpacing: "0.18em",
            color: "#0d0b17",
            backgroundColor: "#c9a96e",
          }}
        >
          Start Building &rarr;
        </a>
        <p className="font-mono text-xs uppercase mt-6" style={{ letterSpacing: "0.15em", color: "#9890ab" }}>
          $14.99 single &middot; $49 unlimited &middot; cancel anytime
        </p>
      </div>
    </div>
  );
}

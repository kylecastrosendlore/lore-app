"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

/* ───────────────────────────────────────────
   /brief/[id]
   Brief viewer — polls for generation status
   then displays the cinematic HTML brief.
   ─────────────────────────────────────────── */

interface BriefData {
  id: string;
  status: string;
  targetName: string;
  senderName: string;
  userType: string;
  briefHtml: string | null;
  emailSubject: string | null;
  emailBody: string | null;
  contactIdStatus: string | null;
}

export default function BriefViewer() {
  const params = useParams();
  const searchParams = useSearchParams();
  const briefId = params.id as string;
  const accessToken = searchParams.get("t") || "";
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [dots, setDots] = useState("");
  const [iframeHeight, setIframeHeight] = useState(3000);

  /* Listen for height messages from the sandboxed iframe */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      /* sandboxed iframes without allow-same-origin post from "null" origin */
      if (event.origin !== "null" && event.origin !== window.location.origin) return;
      const data = event.data;
      if (data && data.type === "lore:resize" && typeof data.height === "number") {
        setIframeHeight(Math.min(Math.max(data.height + 50, 600), 20000));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  /* Animated dots while generating */
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const [generationTriggered, setGenerationTriggered] = useState(false);

  /* Trigger generation if the brief is paid but not yet generating */
  const triggerGeneration = useCallback(async () => {
    if (generationTriggered) return;
    setGenerationTriggered(true);
    try {
      await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefId }),
      });
    } catch {
      console.error("Failed to trigger generation");
    }
  }, [briefId, generationTriggered]);

  /* Poll for brief status */
  const fetchBrief = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/briefs/${briefId}${accessToken ? `?t=${encodeURIComponent(accessToken)}` : ""}`
      );
      const data = await res.json();

      if (!res.ok) {
        /* 403 = payment not yet confirmed by webhook — keep polling */
        if (res.status === 403) return;
        setError(data.error || "Failed to load brief");
        return;
      }

      setBrief(data);

      /* If brief is paid but hasn't started generating, trigger it */
      if (
        data.status === "draft" &&
        !generationTriggered
      ) {
        triggerGeneration();
      }
    } catch {
      setError("Network error loading brief");
    }
  }, [briefId, accessToken, generationTriggered, triggerGeneration]);

  useEffect(() => {
    if (!briefId) return;
    fetchBrief();

    /* Poll every 5 seconds if brief is still generating */
    const interval = setInterval(() => {
      if (brief?.status === "ready" || brief?.status === "error") return;
      fetchBrief();
    }, 5000);

    return () => clearInterval(interval);
  }, [briefId, fetchBrief, brief?.status]);

  /* Copy to clipboard */
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  /* ── Loading / generating state ── */
  if (!brief || brief.status === "generating" || brief.status === "draft") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: "#0d0b17" }}
      >
        <motion.div
          className="w-16 h-16 rounded-full mb-8"
          style={{
            border: "2px solid rgba(201, 169, 110, 0.3)",
            borderTopColor: "#c9a96e",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        <h1
          className="font-serif text-3xl md:text-4xl font-light mb-4"
          style={{ color: "#e8e4f4" }}
        >
          Crafting your{" "}
          <span style={{ color: "#c9a96e" }}>intelligence brief</span>
        </h1>

        <p
          className="font-sans text-lg mb-8"
          style={{ color: "#d2cfe0" }}
        >
          Our AI is researching, analyzing, and designing your brief{dots}
        </p>

        <div
          className="font-mono text-xs uppercase"
          style={{ letterSpacing: "0.15em", color: "#9890ab" }}
        >
          This usually takes 1–2 minutes
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || brief.status === "error") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ backgroundColor: "#0d0b17" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-8"
          style={{ backgroundColor: "rgba(242, 143, 181, 0.15)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f28fb5" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        <h1 className="font-serif text-3xl font-light mb-4" style={{ color: "#e8e4f4" }}>
          Something went wrong
        </h1>
        <p className="font-sans text-lg mb-8" style={{ color: "#d2cfe0" }}>
          {error || "Brief generation encountered an error. Please contact support."}
        </p>
        <a
          href="mailto:kyle@sendlore.com"
          className="font-mono text-xs uppercase transition-colors hover:text-[#c9a96e]"
          style={{ letterSpacing: "0.15em", color: "#9890ab" }}
        >
          Contact kyle@sendlore.com
        </a>
      </div>
    );
  }

  /* ── Brief ready — show it! ── */
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
          <button
            onClick={() => copyToClipboard(typeof window !== "undefined" ? window.location.href : "", "link")}
            className="font-mono text-xs uppercase px-4 py-2 rounded-full border transition-all duration-200"
            style={{
              letterSpacing: "0.1em",
              color: copied === "link" ? "#0d0b17" : "#0d0b17",
              backgroundColor: copied === "link" ? "#c9a96e" : "#f28fb5",
              borderColor: "transparent",
            }}
          >
            {copied === "link" ? "Link copied!" : "Copy shareable link"}
          </button>
          <button
            onClick={() => {
              setShowEmail(true);
              setTimeout(() => {
                document.getElementById("email-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 50);
            }}
            className="font-mono text-xs uppercase px-4 py-2 rounded-full border transition-all duration-200 hover:border-[#c9a96e] hover:text-[#c9a96e]"
            style={{ letterSpacing: "0.1em", color: "#9890ab", borderColor: "#2a2340" }}
          >
            Subject Line + Email ↓
          </button>
        </div>
      </div>

      {/* The actual brief HTML — sandboxed (no allow-same-origin, no top-nav)
          so AI-generated content can't touch parent cookies, storage, or DOM.
          Height is reported back via postMessage from an injected resize script. */}
      {brief.briefHtml && (
        <div className="w-full">
          <iframe
            srcDoc={`${brief.briefHtml}
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
            title={`Intelligence Brief for ${brief.targetName}`}
          />
        </div>
      )}

      {/* Email copy panel — sits below the brief, revealed by top-bar button */}
      {brief.emailSubject && brief.emailBody && (
        <div
          id="email-panel"
          className="px-6 py-16"
          style={{ borderTop: "1px solid #2a2340", backgroundColor: "rgba(20, 14, 38, 0.4)" }}
        >
          <div className="max-w-3xl mx-auto">
            {!showEmail ? (
              <div className="text-center">
                <span
                  className="font-mono text-xs uppercase block mb-4"
                  style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
                >
                  Need words too?
                </span>
                <h2
                  className="font-serif text-3xl md:text-4xl font-light mb-6"
                  style={{ color: "#e8e4f4" }}
                >
                  Generate the <span style={{ color: "#f28fb5", fontStyle: "italic" }}>subject line and email.</span>
                </h2>
                <button
                  onClick={() => setShowEmail(true)}
                  className="font-mono text-xs uppercase px-6 py-3 rounded-full transition-all duration-200"
                  style={{
                    letterSpacing: "0.1em",
                    color: "#0d0b17",
                    backgroundColor: "#f28fb5",
                  }}
                >
                  Generate Subject Line + Email
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-10">
                  <span
                    className="font-mono text-xs uppercase block mb-3"
                    style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
                  >
                    Your outreach copy
                  </span>
                  <h2
                    className="font-serif text-3xl md:text-4xl font-light"
                    style={{ color: "#e8e4f4" }}
                  >
                    Subject line + <span style={{ color: "#f28fb5", fontStyle: "italic" }}>email body.</span>
                  </h2>
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-mono text-xs uppercase"
                      style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
                    >
                      Subject Line
                    </span>
                    <button
                      onClick={() => copyToClipboard(brief.emailSubject!, "subject")}
                      className="font-mono text-xs uppercase px-3 py-1 rounded-full border transition-all hover:border-[#c9a96e]"
                      style={{ color: copied === "subject" ? "#c9a96e" : "#9890ab", borderColor: "#2a2340" }}
                    >
                      {copied === "subject" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="font-sans text-lg" style={{ color: "#e8e4f4" }}>
                    {brief.emailSubject}
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
                      onClick={() => copyToClipboard(brief.emailBody!, "body")}
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
                    {brief.emailBody}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Big Copy Link block — paste this URL into your email */}
      <div
        className="py-16 px-6 text-center"
        style={{ borderTop: "1px solid #2a2340" }}
      >
        <span
          className="font-mono text-xs uppercase block mb-4"
          style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
        >
          Your shareable brief link
        </span>
        <h2
          className="font-serif text-3xl md:text-4xl font-light mb-3"
          style={{ color: "#e8e4f4" }}
        >
          Paste this in your email <span style={{ color: "#f28fb5", fontStyle: "italic" }}>and send it.</span>
        </h2>
        <p
          className="font-sans text-base mb-8 max-w-xl mx-auto"
          style={{ color: "#9890ab" }}
        >
          Anyone with this link can view the brief. Drop it into the email body above (we already wrote one for you).
        </p>

        <div
          className="max-w-2xl mx-auto p-4 rounded-xl border flex items-center justify-between gap-3 mb-4"
          style={{
            borderColor: "#2a2340",
            backgroundColor: "rgba(30, 21, 53, 0.4)",
          }}
        >
          <code
            className="font-mono text-xs md:text-sm truncate text-left flex-1"
            style={{ color: "#d2cfe0" }}
          >
            {typeof window !== "undefined" ? window.location.href : ""}
          </code>
          <button
            onClick={() => copyToClipboard(typeof window !== "undefined" ? window.location.href : "", "link-bottom")}
            className="font-mono text-xs uppercase px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap"
            style={{
              letterSpacing: "0.1em",
              color: "#0d0b17",
              backgroundColor: copied === "link-bottom" ? "#c9a96e" : "#f28fb5",
            }}
          >
            {copied === "link-bottom" ? "Copied!" : "Copy link"}
          </button>
        </div>

        <p className="font-mono text-xs uppercase mt-8" style={{ letterSpacing: "0.15em", color: "#9890ab" }}>
          Crafted by LORE &mdash; Intelligence Briefs
        </p>
        <a
          href="/"
          className="inline-block mt-3 font-mono text-xs uppercase transition-colors hover:text-[#f28fb5]"
          style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
        >
          Build another brief &rarr;
        </a>
      </div>
    </div>
  );
}

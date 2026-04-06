"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

/* ───────────────────────────────────────────
   /payment/success
   Shown after a successful Stripe checkout.
   Shows a brief confirmation then redirects
   to /brief/[id] where polling + viewing happens.
   ─────────────────────────────────────────── */

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const briefId = searchParams.get("brief_id");
  const token = searchParams.get("t");
  const briefUrl = briefId
    ? `/brief/${briefId}${token ? `?t=${encodeURIComponent(token)}` : ""}`
    : null;
  const [dots, setDots] = useState("");

  /* Animated dots */
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  /* Auto-redirect to the brief viewer after a short delay */
  useEffect(() => {
    if (!briefUrl) return;
    const timer = setTimeout(() => {
      router.push(briefUrl);
    }, 3000); // 3 seconds — enough time to see the confirmation
    return () => clearTimeout(timer);
  }, [briefUrl, router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#0d0b17" }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-8"
        style={{ backgroundColor: "rgba(201, 169, 110, 0.15)" }}
      >
        <motion.svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c9a96e"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        </motion.svg>
      </motion.div>

      <motion.h1
        className="font-serif text-3xl md:text-5xl font-light mb-4"
        style={{ color: "#e8e4f4" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Payment <span style={{ color: "#c9a96e" }}>Confirmed</span>
      </motion.h1>

      <motion.p
        className="font-sans text-lg max-w-md mb-8"
        style={{ color: "#d2cfe0" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Your intelligence brief is being crafted. Redirecting you now{dots}
      </motion.p>

      <motion.div
        className="font-mono text-sm uppercase px-6 py-3 rounded-full mb-8"
        style={{
          letterSpacing: "0.15em",
          color: "#c9a96e",
          border: "1px solid rgba(201, 169, 110, 0.3)",
          backgroundColor: "rgba(201, 169, 110, 0.05)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Preparing your brief{dots}
      </motion.div>

      {briefUrl && (
        <motion.a
          href={briefUrl}
          className="font-mono text-xs uppercase transition-colors hover:text-[#f28fb5]"
          style={{ letterSpacing: "0.15em", color: "#9890ab" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Click here if not redirected automatically &rarr;
        </motion.a>
      )}
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#0d0b17" }}
        >
          <p className="font-mono text-sm" style={{ color: "#9890ab" }}>
            Loading...
          </p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

"use client";

import { motion } from "framer-motion";

/* ───────────────────────────────────────────
   /payment/cancel
   Shown when a user cancels Stripe checkout.
   Lets them go back to the intake form.
   ─────────────────────────────────────────── */

export default function PaymentCancel() {
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
        style={{ backgroundColor: "rgba(242, 143, 181, 0.15)" }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f28fb5"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </motion.div>

      <motion.h1
        className="font-serif text-3xl md:text-5xl font-light mb-4"
        style={{ color: "#e8e4f4" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Payment <span style={{ color: "#f28fb5" }}>Cancelled</span>
      </motion.h1>

      <motion.p
        className="font-sans text-lg max-w-md mb-8"
        style={{ color: "#d2cfe0" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        No worries — your brief data has been saved. You can come back anytime
        to complete your purchase.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <a
          href="/intake"
          className="font-mono text-sm font-bold uppercase px-8 py-3 rounded-full transition-all duration-200 hover:scale-105"
          style={{
            letterSpacing: "0.15em",
            backgroundColor: "#f28fb5",
            color: "#0d0b17",
          }}
        >
          Try Again
        </a>

        <a
          href="/"
          className="font-mono text-sm uppercase px-8 py-3 rounded-full transition-all duration-200 hover:scale-105"
          style={{
            letterSpacing: "0.15em",
            color: "#e8e4f4",
            border: "1px solid rgba(232, 228, 244, 0.2)",
          }}
        >
          Back to Home
        </a>
      </motion.div>

      <motion.p
        className="mt-12 font-mono text-xs"
        style={{ color: "#9890ab" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Questions?{" "}
        <a
          href="mailto:kyle@sendlore.com"
          className="transition-colors hover:text-[#c9a96e]"
          style={{ color: "#c9a96e" }}
        >
          kyle@sendlore.com
        </a>
      </motion.p>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ───────────────────────────────────────────
   TYPES
   ─────────────────────────────────────────── */

type UserType = "job_seeker" | "hiring_manager" | "salesperson" | "influencer_brand" | null;

interface FormData {
  /* Shared — sender info */
  senderName: string;
  senderEmail: string;
  senderRole: string;
  senderBackground: string;
  senderCompany: string;
  senderCompanyDesc: string;
  /* Resume (job seeker uploads their own, HM uploads candidate's) */
  resumeText: string;
  resumeFileName: string;
  /* Target / candidate / prospect */
  targetName: string;
  targetTitle: string;
  targetCompany: string;
  targetLinkedIn: string;
  /* Context */
  outreachType: string;
  goal: string;
  notes: string;
  /* Hiring manager specific */
  roleHiringFor: string;
  roleCompelling: string;
  specificAngle: string;
  /* Salesperson specific */
  prospectIndustry: string;
  painPoints: string;
  yourProduct: string;
  /* Influencer/Brand specific */
  brandCreatorName: string;
  partnershipType: string;
  partnershipFit: string;
  audienceOverlapNotes: string;
  uniqueAngle: string;
  mediaKitText: string;
  mediaKitFileName: string;
  /* Job seeker — target role intel */
  jobPostingText: string;
  publishedWorkLinks: string;
  /* Contact enrichment opt-in */
  wantsContactEnrichment: boolean;
}

const emptyForm: FormData = {
  senderName: "",
  senderEmail: "",
  senderRole: "",
  senderBackground: "",
  senderCompany: "",
  senderCompanyDesc: "",
  resumeText: "",
  resumeFileName: "",
  targetName: "",
  targetTitle: "",
  targetCompany: "",
  targetLinkedIn: "",
  outreachType: "",
  goal: "",
  notes: "",
  roleHiringFor: "",
  roleCompelling: "",
  specificAngle: "",
  prospectIndustry: "",
  painPoints: "",
  yourProduct: "",
  brandCreatorName: "",
  partnershipType: "",
  partnershipFit: "",
  audienceOverlapNotes: "",
  uniqueAngle: "",
  mediaKitText: "",
  mediaKitFileName: "",
  jobPostingText: "",
  publishedWorkLinks: "",
  wantsContactEnrichment: false,
};

/* Step configs per user type */
const STEP_CONFIG: Record<
  Exclude<UserType, null>,
  { titles: string[]; total: number }
> = {
  job_seeker: {
    titles: ["Resume", "About You", "Target", "Context", "Preview", "Review"],
    total: 6,
  },
  hiring_manager: {
    titles: ["Candidate Resume", "About You", "The Role", "Preview", "Review"],
    total: 5,
  },
  salesperson: {
    titles: ["About You", "Prospect", "Context", "Preview", "Review"],
    total: 5,
  },
  influencer_brand: {
    titles: ["Media Kit", "About You", "Partnership", "Target", "Preview", "Review"],
    total: 6,
  },
};

/* ───────────────────────────────────────────
   REUSABLE COMPONENTS
   ─────────────────────────────────────────── */

function ProgressBar({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  const pct = ((step + 1) / total) * 100;
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="flex justify-between mb-3">
        <span
          className="font-mono text-xs uppercase"
          style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
        >
          Step {step + 1} of {total}
        </span>
        <span
          className="font-mono text-xs uppercase"
          style={{ letterSpacing: "0.15em", color: "#9890ab" }}
        >
          {Math.round(pct)}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "#1e1535" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "#c9a96e" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function HelperTip({
  text,
  linkText,
  linkUrl,
  prominent = false,
}: {
  text: string;
  linkText?: string;
  linkUrl?: string;
  prominent?: boolean;
}) {
  if (prominent && linkText && linkUrl) {
    return (
      <div
        className="mt-3 p-4 rounded-lg flex items-start gap-3"
        style={{
          backgroundColor: "rgba(242, 143, 181, 0.08)",
          border: "1px solid rgba(242, 143, 181, 0.35)",
        }}
      >
        <span
          className="font-mono text-[10px] uppercase mt-1 flex-shrink-0"
          style={{ letterSpacing: "0.18em", color: "#f28fb5" }}
        >
          Tip
        </span>
        <p
          className="font-sans text-sm leading-relaxed"
          style={{ color: "#e8e4f4" }}
        >
          {text}{" "}
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline transition-colors"
            style={{ color: "#f28fb5", textUnderlineOffset: "3px" }}
          >
            {linkText} →
          </a>
        </p>
      </div>
    );
  }
  return (
    <p
      className="font-sans text-xs mt-2"
      style={{ color: "#9890ab" }}
    >
      {text}
    </p>
  );
}

/* Compact 3-tip card. Used to coach users on what makes a great brief
   without overwhelming the form with prose. */
function ProTipsBox({
  title = "Tips for the strongest brief",
  tips,
}: {
  title?: string;
  tips: { headline: string; detail: string }[];
}) {
  return (
    <div
      className="mt-4 mb-2 p-5 rounded-lg"
      style={{
        backgroundColor: "rgba(201, 169, 110, 0.05)",
        border: "1px solid rgba(201, 169, 110, 0.25)",
      }}
    >
      <div
        className="font-mono text-[10px] uppercase mb-3"
        style={{ letterSpacing: "0.18em", color: "#c9a96e" }}
      >
        {title}
      </div>
      <ul className="space-y-2.5">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="font-mono text-[10px] mt-1 flex-shrink-0"
              style={{ color: "#c9a96e", letterSpacing: "0.1em" }}
            >
              0{i + 1}
            </span>
            <div>
              <div
                className="font-sans text-sm font-medium"
                style={{ color: "#e8e4f4" }}
              >
                {tip.headline}
              </div>
              <div
                className="font-sans text-xs mt-0.5 leading-relaxed"
                style={{ color: "#9890ab" }}
              >
                {tip.detail}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: string;
}) {
  return (
    <div className="mb-5">
      <label className="block mb-2">
        <span
          className="font-mono text-xs uppercase"
          style={{ letterSpacing: "0.15em", color: "#d2cfe0" }}
        >
          {label}
          {required && <span style={{ color: "#f28fb5" }}> *</span>}
        </span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-lg font-sans text-base outline-none transition-all duration-200 border"
        style={{
          backgroundColor: "rgba(30, 21, 53, 0.5)",
          borderColor: error ? "#f28fb5" : "#2a2340",
          color: "#e8e4f4",
        }}
        onFocus={(e) =>
          (e.target.style.borderColor = error ? "#f28fb5" : "#c9a96e")
        }
        onBlur={(e) =>
          (e.target.style.borderColor = error ? "#f28fb5" : "#2a2340")
        }
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans text-sm mt-1.5"
          style={{ color: "#f28fb5" }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
}) {
  return (
    <div className="mb-5">
      <label className="block mb-2">
        <span
          className="font-mono text-xs uppercase"
          style={{ letterSpacing: "0.15em", color: "#d2cfe0" }}
        >
          {label}
          {required && <span style={{ color: "#f28fb5" }}> *</span>}
        </span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3.5 rounded-lg font-sans text-base outline-none transition-all duration-200 border resize-none"
        style={{
          backgroundColor: "rgba(30, 21, 53, 0.5)",
          borderColor: error ? "#f28fb5" : "#2a2340",
          color: "#e8e4f4",
        }}
        onFocus={(e) =>
          (e.target.style.borderColor = error ? "#f28fb5" : "#c9a96e")
        }
        onBlur={(e) =>
          (e.target.style.borderColor = error ? "#f28fb5" : "#2a2340")
        }
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans text-sm mt-1.5"
          style={{ color: "#f28fb5" }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function RadioGroup({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="mb-5">
      <label className="block mb-3">
        <span
          className="font-mono text-xs uppercase"
          style={{ letterSpacing: "0.15em", color: "#d2cfe0" }}
        >
          {label}
          <span style={{ color: "#f28fb5" }}> *</span>
        </span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-4 py-3 rounded-lg font-sans text-base text-left transition-all duration-200 border"
            style={{
              borderColor:
                value === opt.value
                  ? "#c9a96e"
                  : error
                  ? "rgba(242, 143, 181, 0.4)"
                  : "#2a2340",
              backgroundColor:
                value === opt.value
                  ? "rgba(201, 169, 110, 0.1)"
                  : "rgba(30, 21, 53, 0.5)",
              color: value === opt.value ? "#c9a96e" : "#d2cfe0",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans text-sm mt-1.5"
          style={{ color: "#f28fb5" }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────
   RESUME UPLOAD COMPONENT
   ─────────────────────────────────────────── */

function ResumeUpload({
  resumeText,
  resumeFileName,
  onTextChange,
  onFileRead,
  error,
  ownerLabel,
  kind = "resume",
  acceptAttr = ".pdf,.docx,.doc,.txt",
  acceptHint = "PDF, DOCX, or TXT",
  pastePlaceholder = "Paste your resume content here...",
}: {
  resumeText: string;
  resumeFileName: string;
  onTextChange: (v: string) => void;
  onFileRead: (text: string, fileName: string) => void;
  error?: string;
  ownerLabel: string;
  kind?: string;
  acceptAttr?: string;
  acceptHint?: string;
  pastePlaceholder?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [mode, setMode] = useState<"upload" | "paste">(
    resumeText && !resumeFileName ? "paste" : "upload"
  );

  const [parseError, setParseError] = useState<string | null>(null);

  const readFile = useCallback(
    async (file: File) => {
      setIsReading(true);
      setParseError(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          setParseError(data.error || "Could not read that file. Try pasting instead.");
        } else {
          onFileRead(data.text, data.fileName || file.name);
        }
      } catch {
        setParseError("Could not read that file. Try pasting instead.");
      } finally {
        setIsReading(false);
      }
    },
    [onFileRead]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) readFile(file);
    },
    [readFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
    },
    [readFile]
  );

  return (
    <div className="mb-5">
      <label className="block mb-2">
        <span
          className="font-mono text-xs uppercase"
          style={{ letterSpacing: "0.15em", color: "#d2cfe0" }}
        >
          {ownerLabel} {kind}
          <span style={{ color: "#f28fb5" }}> *</span>
        </span>
      </label>

      {/* Toggle tabs */}
      <div className="flex gap-2 mb-4">
        {(["upload", "paste"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="font-mono text-xs uppercase px-4 py-2 rounded-full border transition-all duration-200"
            style={{
              letterSpacing: "0.1em",
              color: mode === m ? "#c9a96e" : "#9890ab",
              borderColor: mode === m ? "#c9a96e" : "#2a2340",
              backgroundColor:
                mode === m ? "rgba(201, 169, 110, 0.1)" : "transparent",
            }}
          >
            {m === "upload" ? "Upload file" : "Paste text"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div
          className="relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer"
          style={{
            borderColor: isDragging
              ? "#c9a96e"
              : error
              ? "#f28fb5"
              : "#2a2340",
            backgroundColor: isDragging
              ? "rgba(201, 169, 110, 0.05)"
              : "rgba(30, 21, 53, 0.3)",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptAttr}
            onChange={handleFileSelect}
            className="hidden"
          />

          {isReading ? (
            <div>
              <motion.div
                className="w-8 h-8 border-2 rounded-full mx-auto mb-3"
                style={{
                  borderColor: "#c9a96e",
                  borderTopColor: "transparent",
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <p
                className="font-sans text-base"
                style={{ color: "#c9a96e" }}
              >
                Reading file...
              </p>
            </div>
          ) : resumeFileName ? (
            <div>
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: "rgba(201, 169, 110, 0.15)" }}
              >
                <span className="text-xl">&#10003;</span>
              </div>
              <p
                className="font-sans text-base font-medium mb-1"
                style={{ color: "#c9a96e" }}
              >
                {resumeFileName}
              </p>
              <p
                className="font-sans text-sm"
                style={{ color: "#9890ab" }}
              >
                Click or drag to replace
              </p>
            </div>
          ) : (
            <div>
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: "rgba(30, 21, 53, 0.5)" }}
              >
                <span
                  className="text-2xl"
                  style={{ color: "#9890ab" }}
                >
                  &#8593;
                </span>
              </div>
              <p
                className="font-sans text-base mb-1"
                style={{ color: "#d2cfe0" }}
              >
                Drag &amp; drop or click to upload
              </p>
              <p
                className="font-sans text-sm"
                style={{ color: "#9890ab" }}
              >
                {acceptHint}
              </p>
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={resumeText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={pastePlaceholder}
          rows={10}
          className="w-full px-4 py-3.5 rounded-lg font-sans text-base outline-none transition-all duration-200 border resize-none"
          style={{
            backgroundColor: "rgba(30, 21, 53, 0.5)",
            borderColor: error ? "#f28fb5" : "#2a2340",
            color: "#e8e4f4",
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = error ? "#f28fb5" : "#c9a96e")
          }
          onBlur={(e) =>
            (e.target.style.borderColor = error ? "#f28fb5" : "#2a2340")
          }
        />
      )}

      {(error || parseError) && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans text-sm mt-2"
          style={{ color: "#f28fb5" }}
        >
          {parseError || error}
        </motion.p>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────
   USER TYPE SELECTION
   ─────────────────────────────────────────── */

function UserTypeSelection({
  onSelect,
}: {
  onSelect: (type: UserType) => void;
}) {
  const cards = [
    {
      type: "job_seeker" as UserType,
      title: "I'm a Job Seeker",
      desc: "Stand out to a hiring manager with a cinematic brief instead of a cold resume.",
      icon: "01",
    },
    {
      type: "hiring_manager" as UserType,
      title: "I'm a Hiring Manager",
      desc: "Turn incoming resumes into visual intelligence briefs for faster, smarter hiring.",
      icon: "02",
    },
    {
      type: "salesperson" as UserType,
      title: "I'm in Sales",
      desc: "Research any prospect and generate a personalized pitch brief + outreach email.",
      icon: "03",
    },
    {
      type: "influencer_brand" as UserType,
      title: "Influencer/Brand",
      desc: "Pitch partnerships and collaborations with data-driven intel on audience fit and opportunities.",
      icon: "04",
    },
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#0d0b17" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link
        href="/"
        className="absolute top-6 left-6 font-mono text-xs uppercase transition-colors hover:text-[#f28fb5]"
        style={{ letterSpacing: "0.15em", color: "#9890ab" }}
      >
        &larr; Back
      </Link>

      <motion.div
        className="text-center max-w-xl mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span
          className="font-mono text-sm uppercase block mb-6"
          style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
        >
          Build Your Brief
        </span>
        <h1
          className="font-serif text-4xl md:text-5xl font-light mb-4"
          style={{ color: "#e8e4f4" }}
        >
          How are you using LORE?
        </h1>
        <p
          className="font-sans text-lg font-light"
          style={{ color: "#9890ab" }}
        >
          This determines your brief flow.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
        {cards.map((card, i) => (
          <motion.button
            key={card.type}
            onClick={() => onSelect(card.type)}
            className="p-7 rounded-xl border text-left transition-all duration-200 group"
            style={{
              borderColor: "#2a2340",
              backgroundColor: "rgba(30, 21, 53, 0.3)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12 }}
            whileHover={{
              borderColor: "#c9a96e",
              backgroundColor: "rgba(201, 169, 110, 0.05)",
              scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span
              className="font-mono text-sm font-bold block mb-4"
              style={{ color: "#c9a96e" }}
            >
              {card.icon}
            </span>
            <h3
              className="font-serif text-xl md:text-2xl font-light mb-2"
              style={{ color: "#e8e4f4" }}
            >
              {card.title}
            </h3>
            <p
              className="font-sans text-base font-light"
              style={{ color: "#9890ab" }}
            >
              {card.desc}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────
   STEP COMPONENTS — JOB SEEKER
   ─────────────────────────────────────────── */

function JS_StepResume({
  formData,
  setField,
  onFileRead,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  onFileRead: (text: string, fileName: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        Your resume
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Upload a file or paste your resume. We use this to voice your brief
        authentically.
      </p>
      <ResumeUpload
        resumeText={formData.resumeText}
        resumeFileName={formData.resumeFileName}
        onTextChange={(v) => setField("resumeText", v)}
        onFileRead={onFileRead}
        error={errors.resumeText}
        ownerLabel="Your"
      />
      <HelperTip
        prominent
        text="No resume handy? Harvard's free resume guide has gold-standard sample formats."
        linkText="Open Harvard's resume guide"
        linkUrl="https://hwpi.harvard.edu/files/ocs/files/undergrad_resumes_and_cover_letters.pdf"
      />
      <HelperTip
        prominent
        text="Or pull straight from LinkedIn: open your profile → Resources (under your photo) → Save to PDF. Two clicks, full export."
        linkText="Open LinkedIn"
        linkUrl="https://www.linkedin.com/in/me/"
      />
      <ProTipsBox
        title="Make your resume work harder"
        tips={[
          {
            headline: "Use the X / Y / Z formula",
            detail: 'Did "X" to accomplish "Y" measured by "Z." Specifics beat adjectives every time.',
          },
          {
            headline: "Quantify everything you can",
            detail: "Numbers, percentages, dollars, time saved, audience size. Concrete > vague.",
          },
          {
            headline: 'Own it — say "I," not "we"',
            detail: "Take credit for what you actually drove. Hiring managers can't pitch a team.",
          },
        ]}
      />
    </div>
  );
}

function JS_StepAboutYou({
  formData,
  setField,
  errors,
  starDrafted,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
  starDrafted?: boolean;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        About you
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Quick details so we can personalize your brief.
      </p>
      <TextInput
        label="Full name"
        value={formData.senderName}
        onChange={(v) => setField("senderName", v)}
        placeholder="Marcus Chen"
        required
        error={errors.senderName}
      />
      <TextInput
        label="Your current role"
        value={formData.senderRole}
        onChange={(v) => setField("senderRole", v)}
        placeholder="Head of Video Strategy"
        required
        error={errors.senderRole}
      />
      <div id="star-field-wrapper">
      {starDrafted && (
        <div
          className="mb-2 px-3 py-2 rounded-md font-mono text-[11px] uppercase tracking-wider"
          style={{
            background: "rgba(242, 143, 181, 0.08)",
            border: "1px solid rgba(242, 143, 181, 0.35)",
            color: "#f28fb5",
            letterSpacing: "0.12em",
          }}
        >
          ✨ Drafted from your resume — edit the ACTION line to add the HOW
        </div>
      )}
      <TextArea
        label="Your 1–2 greatest accomplishments — use STAR (Situation, Task, Action, Result) + numbers"
        value={formData.senderBackground}
        onChange={(v) => setField("senderBackground", v)}
        placeholder={`Pick one or two. Walk us through what you actually DID — the action is the part that sells you.

Example:
SITUATION — Customer onboarding at a Series B fintech took 14 days, driving 22% churn in the first 60 days.
TASK — I owned cutting time-to-value without adding headcount.
ACTION — I rebuilt the flow end-to-end: replaced 6 manual handoffs with a self-serve setup wizard, wrote 11 in-product tooltips that killed our top support tickets, and built a Slack alert that pinged me the moment any account stalled past day 3.
RESULT — Onboarding dropped from 14 days to 3. Churn fell from 22% to 7%. We retained $400K in ARR that would've walked.`}
        rows={11}
      />
      </div>

      <TextArea
        label="Links to published work, portfolio, or projects (optional)"
        value={formData.publishedWorkLinks}
        onChange={(v) => setField("publishedWorkLinks", v)}
        placeholder="Drop URLs, one per line — articles, GitHub, case studies, talks, side projects, anything that shows your work."
        rows={3}
      />
      <HelperTip text="The more we can see, the sharper the brief. Real work beats job titles." />
      <HelperTip
        prominent
        text="Need inspiration on how to write strong accomplishments? Harvard's free resume guide has gold-standard examples."
        linkText="Open Harvard's resume guide"
        linkUrl="https://hwpi.harvard.edu/files/ocs/files/undergrad_resumes_and_cover_letters.pdf"
      />
      <ProTipsBox
        title="How to make this hit"
        tips={[
          {
            headline: "Pick one or two — not a list",
            detail: "Depth beats breadth. One story you owned end-to-end is worth ten bullet points.",
          },
          {
            headline: "STAR = Situation, Task, Action, Result",
            detail: "The ACTION is the part that sells you — go deep on HOW you did it, not just what happened. 'I rebuilt onboarding' is weak. 'I replaced 6 manual handoffs with a self-serve wizard, wrote 11 in-product tooltips, and built a Slack alert for stalled accounts' is strong.",
          },
          {
            headline: "Quantify the outcome",
            detail: "Numbers, %, time saved, revenue moved, users impacted. Even rough estimates land harder than adjectives.",
          },
          {
            headline: "Use 'I' not 'we' — extreme ownership",
            detail: "If it was a team win, name your specific role: 'I led,' 'I built,' 'I shipped.'",
          },
        ]}
      />
    </div>
  );
}

function JS_StepTarget({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        The role and the person
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Drop the job posting and the company. The contact is optional — we can find one for you.
      </p>

      <TextInput
        label="Their company"
        value={formData.targetCompany}
        onChange={(v) => setField("targetCompany", v)}
        placeholder="Bloom"
        required
        error={errors.targetCompany}
      />

      <TextArea
        label="Paste the job posting or paste the link"
        value={formData.jobPostingText}
        onChange={(v) => setField("jobPostingText", v)}
        placeholder="Paste the full job description here, or just drop the URL. The more detail we have on the role, the sharper the brief."
        rows={5}
      />
      <HelperTip text="A real posting beats a vague title every time — the brief will speak directly to what they're hiring for." />

      <TextInput
        label="Contact's full name (optional)"
        value={formData.targetName}
        onChange={(v) => setField("targetName", v)}
        placeholder="Jenna Williams"
        error={errors.targetName}
      />

      <TextInput
        label="Their job title (optional)"
        value={formData.targetTitle}
        onChange={(v) => setField("targetTitle", v)}
        placeholder="VP of Content"
      />

      <TextInput
        label="LinkedIn URL (optional)"
        value={formData.targetLinkedIn}
        onChange={(v) => setField("targetLinkedIn", v)}
        placeholder="https://linkedin.com/in/..."
        type="url"
      />
      <HelperTip text="Drop their LinkedIn URL — we run it through our research database (Apollo) to pull verified intel: title, company, headline, industry, size. We never scrape LinkedIn directly. Best-effort: works ~80% of the time." />

      {/* Contact fetch addon — inline at the moment of friction */}
      <button
        type="button"
        onClick={() =>
          setField("wantsContactEnrichment", !formData.wantsContactEnrichment)
        }
        className="w-full text-left mt-4 mb-2 p-5 rounded-lg border transition-all duration-200"
        style={{
          borderColor: formData.wantsContactEnrichment
            ? "#c9a96e"
            : "rgba(201, 169, 110, 0.25)",
          backgroundColor: formData.wantsContactEnrichment
            ? "rgba(201, 169, 110, 0.08)"
            : "rgba(201, 169, 110, 0.03)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0"
            style={{
              borderColor: "#c9a96e",
              backgroundColor: formData.wantsContactEnrichment
                ? "#c9a96e"
                : "transparent",
            }}
          >
            {formData.wantsContactEnrichment && (
              <span style={{ color: "#0d0b17", fontSize: 12, fontWeight: 700 }}>
                ✓
              </span>
            )}
          </div>
          <div className="flex-1">
            <div
              className="font-sans text-sm font-medium mb-1"
              style={{ color: "#e8e4f4" }}
            >
              Don&rsquo;t have a contact? We&rsquo;ll find one for you.{" "}
              <span style={{ color: "#c9a96e" }}>+$1.99</span>
            </div>
            <div
              className="font-sans text-xs leading-relaxed"
              style={{ color: "#9890ab" }}
            >
              We&rsquo;ll surface the most relevant hiring manager or decision-maker at the company, with verified contact info.
            </div>
          </div>
        </div>
      </button>

      <ProTipsBox
        title="How to pick the right target"
        tips={[
          {
            headline: "Aim above the recruiter",
            detail: "Hiring managers reply; gatekeepers filter. The contact fetch defaults to the right level.",
          },
          {
            headline: "Drop the real job posting",
            detail: "A pasted JD turns the brief into a direct response to their actual ask, not a guess.",
          },
          {
            headline: "Specificity beats volume",
            detail: "One sharp target with a real role beats five guesses every time.",
          },
        ]}
      />
    </div>
  );
}

function JS_StepContext({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        The context
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Help us tailor the tone and strategy.
      </p>
      <RadioGroup
        label="Outreach type"
        options={[
          { value: "cold", label: "Cold outreach" },
          { value: "warm", label: "Warm intro" },
          { value: "referral", label: "Referral" },
          { value: "followup", label: "Following up" },
        ]}
        value={formData.outreachType}
        onChange={(v) => setField("outreachType", v)}
        error={errors.outreachType}
      />
      <RadioGroup
        label="Your goal"
        options={[
          { value: "job_opportunity", label: "Job opportunity" },
          { value: "explore_role", label: "Explore a role" },
          { value: "coffee_chat", label: "Coffee chat" },
          { value: "network", label: "Networking" },
        ]}
        value={formData.goal}
        onChange={(v) => setField("goal", v)}
        error={errors.goal}
      />
      <HelperTip text="Be specific — 'Get a 15-min call' is better than 'network'." />

      <TextArea
        label="Anything specific to mention? (optional)"
        value={formData.notes}
        onChange={(v) => setField("notes", v)}
        placeholder="A shared connection, a project you admire, a recent milestone..."
        rows={3}
      />
      <HelperTip text="Anything else that makes this outreach unique? Inside connections, shared interests, recent news?" />
    </div>
  );
}

/* ───────────────────────────────────────────
   STEP COMPONENTS — HIRING MANAGER
   ─────────────────────────────────────────── */

function HM_StepResume({
  formData,
  setField,
  onFileRead,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  onFileRead: (text: string, fileName: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        Candidate&apos;s resume
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Upload or paste the candidate&apos;s resume. We&apos;ll transform it
        into a visual intelligence brief.
      </p>
      <ResumeUpload
        resumeText={formData.resumeText}
        resumeFileName={formData.resumeFileName}
        onTextChange={(v) => setField("resumeText", v)}
        onFileRead={onFileRead}
        error={errors.resumeText}
        ownerLabel="Candidate's"
      />
      <HelperTip
        prominent
        text="No resume? Pull theirs from LinkedIn: open their profile → More → Save to PDF. Two clicks."
        linkText="Open LinkedIn"
        linkUrl="https://www.linkedin.com"
      />
      <ProTipsBox
        title="Get the most out of their resume"
        tips={[
          {
            headline: "Use their full, latest version",
            detail: "More signal = better brief. A one-pager hides the texture we need.",
          },
          {
            headline: "Don't pre-edit it",
            detail: "Even the messy bits help us find the angle. We'll surface what matters.",
          },
          {
            headline: "Add their LinkedIn if you have it",
            detail: "It catches things resumes miss — recent projects, mutual connections, recs.",
          },
        ]}
      />
      <TextInput
        label="Candidate's full name"
        value={formData.targetName}
        onChange={(v) => setField("targetName", v)}
        placeholder="Alex Rivera"
        required
        error={errors.targetName}
      />
      <TextInput
        label="Candidate's LinkedIn (optional)"
        value={formData.targetLinkedIn}
        onChange={(v) => setField("targetLinkedIn", v)}
        placeholder="https://linkedin.com/in/..."
        type="url"
      />
      <HelperTip text="We run their LinkedIn through our research database (Apollo) to pull verified intel: title, company, headline, industry. We never scrape LinkedIn directly. Best-effort — works ~80% of the time." />
    </div>
  );
}

function HM_StepAboutYou({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        About you
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        So we know who&apos;s receiving the brief.
      </p>
      <TextInput
        label="Your full name"
        value={formData.senderName}
        onChange={(v) => setField("senderName", v)}
        placeholder="Jenna Williams"
        required
        error={errors.senderName}
      />
      <TextInput
        label="Your current role"
        value={formData.senderRole}
        onChange={(v) => setField("senderRole", v)}
        placeholder="VP of Content"
        required
        error={errors.senderRole}
      />
      <TextInput
        label="Your company"
        value={formData.senderCompany}
        onChange={(v) => setField("senderCompany", v)}
        placeholder="Bloom"
        required
        error={errors.senderCompany}
      />
    </div>
  );
}

function HM_StepRole({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        The role
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        What position is this candidate being considered for?
      </p>
      <TextInput
        label="Role you're hiring for"
        value={formData.roleHiringFor}
        onChange={(v) => setField("roleHiringFor", v)}
        placeholder="Head of Video Strategy"
        required
        error={errors.roleHiringFor}
      />
      <TextArea
        label="What makes this role compelling?"
        value={formData.roleCompelling}
        onChange={(v) => setField("roleCompelling", v)}
        placeholder="The actual reason a top candidate would say yes — not the job description boilerplate."
        rows={4}
      />
      <ProTipsBox
        title="Sell the role, not the listing"
        tips={[
          {
            headline: "Lead with the unfair opportunity",
            detail: "Budget, autonomy, scope, the team they'd build. What can they only get here?",
          },
          {
            headline: "Name the impact, not the duties",
            detail: '"Own the entire video org" beats "manage a team of 5 and report to the CMO."',
          },
          {
            headline: "Be honest about the hard parts",
            detail: "Top candidates trust honesty. Naming the challenge makes the upside believable.",
          },
        ]}
      />
      <RadioGroup
        label="Outreach type"
        options={[
          { value: "cold", label: "Cold outreach" },
          { value: "warm", label: "Warm / inbound" },
        ]}
        value={formData.outreachType}
        onChange={(v) => setField("outreachType", v)}
        error={errors.outreachType}
      />
      <TextArea
        label="Specific angle or hook? (optional)"
        value={formData.specificAngle}
        onChange={(v) => setField("specificAngle", v)}
        placeholder="Something about the candidate that caught your eye..."
        rows={2}
      />
    </div>
  );
}

/* ───────────────────────────────────────────
   STEP COMPONENTS — SALESPERSON
   ─────────────────────────────────────────── */

function SP_StepAboutYou({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        About you
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        So we can personalize your outreach.
      </p>
      <TextInput
        label="Full name"
        value={formData.senderName}
        onChange={(v) => setField("senderName", v)}
        placeholder="Sarah Kim"
        required
        error={errors.senderName}
      />
      <TextInput
        label="Your current role"
        value={formData.senderRole}
        onChange={(v) => setField("senderRole", v)}
        placeholder="Account Executive"
        required
        error={errors.senderRole}
      />
      <TextInput
        label="Your company"
        value={formData.senderCompany}
        onChange={(v) => setField("senderCompany", v)}
        placeholder="Acme Inc."
        required
        error={errors.senderCompany}
      />
      <TextArea
        label="What does your product/service do?"
        value={formData.yourProduct}
        onChange={(v) => setField("yourProduct", v)}
        placeholder="1-2 sentences about what you sell and the problem it solves..."
        required
        error={errors.yourProduct}
        rows={3}
      />
      <HelperTip text="Focus on the outcome or transformation your product delivers." />
    </div>
  );
}

function SP_StepProspect({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        Your prospect
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Tell us who you&apos;re pitching. We&apos;ll research them and build
        your brief.
      </p>
      <TextInput
        label="Prospect's full name"
        value={formData.targetName}
        onChange={(v) => setField("targetName", v)}
        placeholder="David Chen"
        required
        error={errors.targetName}
      />
      <HelperTip text="The more specific, the better. Full name + title helps us research them." />

      <TextInput
        label="Their title"
        value={formData.targetTitle}
        onChange={(v) => setField("targetTitle", v)}
        placeholder="CTO"
        required
        error={errors.targetTitle}
      />

      <TextInput
        label="Their company"
        value={formData.targetCompany}
        onChange={(v) => setField("targetCompany", v)}
        placeholder="Notion"
        required
        error={errors.targetCompany}
      />

      <TextInput
        label="LinkedIn URL (optional)"
        value={formData.targetLinkedIn}
        onChange={(v) => setField("targetLinkedIn", v)}
        placeholder="https://linkedin.com/in/..."
        type="url"
      />
      <HelperTip text="We run their LinkedIn through our research database (Apollo) to pull verified intel: title, company, headline, industry, size. We never scrape LinkedIn directly. Best-effort — works ~80% of the time." />
      <TextInput
        label="Industry (optional)"
        value={formData.prospectIndustry}
        onChange={(v) => setField("prospectIndustry", v)}
        placeholder="SaaS, Healthcare, Fintech..."
      />

      <ProTipsBox
        title="Pick a prospect worth the brief"
        tips={[
          {
            headline: "Aim at the economic buyer, not the champion",
            detail: "The person who signs off. Champions are useful later — the brief should land with whoever controls budget.",
          },
          {
            headline: "Make sure there's a real trigger",
            detail: "New funding, a leadership change, a product launch, a teardown post. No trigger, no reason to reply.",
          },
          {
            headline: "Use exact title + LinkedIn URL",
            detail: "Generic titles pull generic intel. Precision here is what gives the brief teeth.",
          },
        ]}
      />
    </div>
  );
}

function SP_StepContext({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        The pitch
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Context for your outreach strategy and email generation.
      </p>
      <RadioGroup
        label="Outreach type"
        options={[
          { value: "cold", label: "Cold outreach" },
          { value: "warm", label: "Warm intro" },
          { value: "referral", label: "Referral" },
          { value: "followup", label: "Following up" },
        ]}
        value={formData.outreachType}
        onChange={(v) => setField("outreachType", v)}
        error={errors.outreachType}
      />
      <RadioGroup
        label="Your goal"
        options={[
          { value: "book_demo", label: "Book a demo" },
          { value: "intro_call", label: "Intro call" },
          { value: "send_proposal", label: "Send proposal" },
          { value: "build_relationship", label: "Build relationship" },
        ]}
        value={formData.goal}
        onChange={(v) => setField("goal", v)}
        error={errors.goal}
      />
      <HelperTip text="Be specific — 'Book a 30-min demo' is better than 'build relationship'." />

      <TextArea
        label="Known pain points or triggers? (optional)"
        value={formData.painPoints}
        onChange={(v) => setField("painPoints", v)}
        placeholder="A specific signal you've spotted — funding round, leadership change, product launch, public quote, tech migration."
        rows={4}
      />
      <ProTipsBox
        title="What turns a guess into a brief"
        tips={[
          {
            headline: "Cite a real signal, not a hunch",
            detail: 'A linked tweet, a press release, a podcast quote. Specifics let us reference the source.',
          },
          {
            headline: "Tie the pain to a date",
            detail: '"Just raised Series B" gives us a why-now. "They need a CRM" doesn\'t.',
          },
          {
            headline: "One sharp pain beats five soft ones",
            detail: "We'd rather build the brief around one undeniable observation than a checklist.",
          },
        ]}
      />
      <TextArea
        label="Specific angle or hook? (optional)"
        value={formData.specificAngle}
        onChange={(v) => setField("specificAngle", v)}
        placeholder="Mutual connection, recent announcement, shared interest..."
        rows={2}
      />
    </div>
  );
}

/* ───────────────────────────────────────────
   STEP COMPONENTS — INFLUENCER/BRAND
   ─────────────────────────────────────────── */

function IB_StepMediaKit({
  formData,
  setField,
  onFileRead,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  onFileRead: (text: string, fileName: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        Your media kit
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Upload your media kit or paste the highlights. This is the proof
        layer of your brief — followers, engagement, audience, past wins.
      </p>
      <ResumeUpload
        resumeText={formData.mediaKitText}
        resumeFileName={formData.mediaKitFileName}
        onTextChange={(v) => setField("mediaKitText", v)}
        onFileRead={onFileRead}
        error={errors.mediaKitText}
        ownerLabel="Your"
        kind="media kit"
        acceptAttr=".pdf,.docx,.doc,.txt"
        acceptHint="PDF, DOCX, or TXT (the standard media kit format)"
        pastePlaceholder={`No media kit yet? Paste your stats here. Example:

Instagram: 48,200 followers · 4.7% engagement
TikTok: 112,000 followers · avg 38k views per post
Audience: 68% women, 25–34, US + UK
Past collabs: Glossier (sold-out drop), Olipop (+22% trial CVR)
Rate: $1,800 per Reel, $3,500 per integrated bundle`}
      />
      <ProTipsBox
        title="What makes a media kit pitch-ready"
        tips={[
          {
            headline: "Lead with engagement, not follower count",
            detail: "Brands have learned the hard way that 50k engaged > 500k passive. Show your rate.",
          },
          {
            headline: "Name 1–2 past collabs with real numbers",
            detail: 'Sold out, +X% conversion, Y million impressions. Specifics turn a pitch into proof.',
          },
          {
            headline: "Spell out who your audience is",
            detail: "Top demo, age range, location, what they buy. Brands fund partnerships that match their ICP.",
          },
        ]}
      />
    </div>
  );
}

function IB_StepAboutYou({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        About you
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Tell us about your brand or creator profile.
      </p>
      <TextInput
        label="Brand or creator name"
        value={formData.brandCreatorName}
        onChange={(v) => setField("brandCreatorName", v)}
        placeholder="Your Brand Name"
        required
        error={errors.brandCreatorName}
      />
      <TextInput
        label="Your current role"
        value={formData.senderRole}
        onChange={(v) => setField("senderRole", v)}
        placeholder="Founder, Content Creator, Brand Manager"
        required
        error={errors.senderRole}
      />
      <TextInput
        label="Your email"
        value={formData.senderEmail}
        onChange={(v) => setField("senderEmail", v)}
        placeholder="you@brand.com"
        type="email"
        required
        error={errors.senderEmail}
      />
    </div>
  );
}

function IB_StepPartnership({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        Partnership details
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        What kind of collaboration are you pitching?
      </p>
      <RadioGroup
        label="Partnership type"
        options={[
          { value: "sponsorship", label: "Sponsorship" },
          { value: "collaboration", label: "Collaboration" },
          { value: "ambassador", label: "Ambassador/Affiliate" },
          { value: "other", label: "Other" },
        ]}
        value={formData.partnershipType}
        onChange={(v) => setField("partnershipType", v)}
        error={errors.partnershipType}
      />
      <TextArea
        label="What makes this partnership a fit?"
        value={formData.partnershipFit}
        onChange={(v) => setField("partnershipFit", v)}
        placeholder="The specific reason this isn't a generic pitch — shared values, audience overlap, a moment in the brand's arc you can speak to."
        required
        error={errors.partnershipFit}
        rows={4}
      />
      <ProTipsBox
        title="What makes a partnership pitch land"
        tips={[
          {
            headline: "Prove you actually use it",
            detail: "One real moment with the product beats any audience deck.",
          },
          {
            headline: "Quantify what you bring",
            detail: "Audience size, engagement rate, average view, conversion on past collabs. Concrete > vibes.",
          },
          {
            headline: "Lead with their goal, not yours",
            detail: "Brands fund partnerships that solve a problem they already had. Name that problem.",
          },
        ]}
      />

      <TextArea
        label="Audience overlap notes (optional)"
        value={formData.audienceOverlapNotes}
        onChange={(v) => setField("audienceOverlapNotes", v)}
        placeholder="Audience demographics, interests, platform overlap..."
        rows={3}
      />
    </div>
  );
}

function IB_StepTarget({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string | boolean) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        Target partner
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Which brand, company, or creator are you pitching to?
      </p>
      <TextInput
        label="Company or brand name"
        value={formData.targetCompany}
        onChange={(v) => setField("targetCompany", v)}
        placeholder="Brand Name"
        required
        error={errors.targetCompany}
      />
      <TextInput
        label="Contact name (optional)"
        value={formData.targetName}
        onChange={(v) => setField("targetName", v)}
        placeholder="Full name of contact person"
      />
      <TextInput
        label="Their title (optional)"
        value={formData.targetTitle}
        onChange={(v) => setField("targetTitle", v)}
        placeholder="Partnerships Manager, CMO, CEO"
      />
      <TextInput
        label="LinkedIn URL (optional)"
        value={formData.targetLinkedIn}
        onChange={(v) => setField("targetLinkedIn", v)}
        placeholder="https://linkedin.com/in/..."
        type="url"
      />
      <HelperTip text="We run their LinkedIn through our research database (Apollo) to pull verified intel: brand, role, company size, industry, past positioning. We never scrape LinkedIn directly. Best-effort — works ~80% of the time." />

      <TextArea
        label="Specific angle or unique value prop? (optional)"
        value={formData.uniqueAngle}
        onChange={(v) => setField("uniqueAngle", v)}
        placeholder="Why now? Recent milestone, shared values, trending topic..."
        rows={2}
      />
      <HelperTip text="What makes THIS partnership pitch stand out?" />

      <ProTipsBox
        title="Pick a partner worth the pitch"
        tips={[
          {
            headline: "Target brands whose audience overlaps yours",
            detail: "Not brands you admire — brands whose customer is already your viewer. Overlap is the whole game.",
          },
          {
            headline: "Aim at partnerships or brand, not press",
            detail: "PR inboxes are graveyards. Partnerships managers have budget and KPIs and actually read pitches.",
          },
          {
            headline: "Time it to something real",
            detail: "A new product drop, a campaign launch, a seasonal push. A reason-to-believe beats a cold ask every time.",
          },
        ]}
      />
    </div>
  );
}

/* ───────────────────────────────────────────
   REVIEW STEP (shared across all flows)
   ─────────────────────────────────────────── */

/* ───────────────────────────────────────────
   BRIEF PREVIEW — a teaser before payment
   ─────────────────────────────────────────── */

function StepPreview({
  userType,
  formData,
}: {
  userType: Exclude<UserType, null>;
  formData: FormData;
}) {
  const targetLabel =
    userType === "hiring_manager"
      ? "candidate"
      : userType === "influencer_brand"
      ? "partner"
      : "prospect";
  /* First name only — never use last name in the brief preview */
  const firstName = (raw: string) => raw.split(/[\s,]+/)[0] || raw;
  const recipientName = formData.targetName
    ? firstName(formData.targetName)
    : formData.targetCompany || "your target";
  const senderName = firstName(
    formData.brandCreatorName || formData.senderName || "You"
  );

  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        Brief preview
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Here&apos;s a taste of what LORE is building for you.
      </p>

      {/* Mini brief preview card */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: "#2a2340",
          backgroundColor: "#0d0b17",
        }}
      >
        {/* Preview header */}
        <div
          className="p-8 md:p-12 text-center"
          style={{
            background:
              "radial-gradient(ellipse at center, #1e1535 0%, #0d0b17 70%)",
          }}
        >
          <div
            className="inline-block mb-5 px-4 py-2 border rounded-full"
            style={{ borderColor: "#c9a96e" }}
          >
            <span
              className="font-mono text-xs uppercase"
              style={{ letterSpacing: "0.2em", color: "#c9a96e" }}
            >
              {userType === "job_seeker"
                ? `A brief for ${recipientName}`
                : userType === "hiring_manager"
                ? `${recipientName} — Candidate Brief`
                : userType === "influencer_brand"
                ? `Partnership Brief: ${recipientName}`
                : `Intel brief: ${recipientName}`}
            </span>
          </div>
          <h3
            className="font-serif text-2xl md:text-4xl font-light leading-tight mb-3"
            style={{ color: "#e8e4f4" }}
          >
            {userType === "job_seeker" ? (
              <>
                {recipientName} &mdash; I didn&apos;t send a resume.{" "}
                <em
                  className="font-normal italic"
                  style={{ color: "#f28fb5" }}
                >
                  I built this instead.
                </em>
              </>
            ) : userType === "hiring_manager" ? (
              <>
                Why {recipientName} stands out{" "}
                <em
                  className="font-normal italic"
                  style={{ color: "#f28fb5" }}
                >
                  for this role.
                </em>
              </>
            ) : userType === "influencer_brand" ? (
              <>
                {recipientName},{" "}
                <em
                  className="font-normal italic"
                  style={{ color: "#f28fb5" }}
                >
                  why we&rsquo;re a perfect fit.
                </em>
              </>
            ) : (
              <>
                {recipientName},{" "}
                <em
                  className="font-normal italic"
                  style={{ color: "#f28fb5" }}
                >
                  this was built for you.
                </em>
              </>
            )}
          </h3>
          <div className="w-16 h-px mx-auto my-5" style={{ backgroundColor: "#c9a96e" }} />
          <p
            className="font-sans text-base font-light max-w-md mx-auto"
            style={{ color: "#9890ab" }}
          >
            {userType === "job_seeker"
              ? `A cinematic look at what ${senderName} brings to ${formData.targetCompany || "the team"}.`
              : userType === "hiring_manager"
              ? `A visual intelligence brief on ${recipientName} for the ${formData.roleHiringFor || "open"} role.`
              : userType === "influencer_brand"
              ? `Partnership research and pitch for ${recipientName}.`
              : `Personalized research and pitch for ${recipientName} at ${formData.targetCompany || "their company"}.`}
          </p>
        </div>

        {/* Teaser sections — first one unlocked as a real taste */}
        <div className="px-8 md:px-12 pb-8 space-y-4">
          {/* UNLOCKED preview block — real cinematic sample */}
          <div
            className="p-6 md:p-8 rounded-lg border relative overflow-hidden"
            style={{
              borderColor: "rgba(201, 169, 110, 0.4)",
              backgroundColor: "rgba(30, 21, 53, 0.5)",
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#c9a96e" }}
                />
                <span
                  className="font-mono text-xs uppercase"
                  style={{ letterSpacing: "0.1em", color: "#c9a96e" }}
                >
                  01 — The Mirror · Sample
                </span>
              </div>
              <span
                className="font-mono text-[10px] uppercase px-2 py-1 rounded-full"
                style={{
                  letterSpacing: "0.12em",
                  color: "#0d0b17",
                  backgroundColor: "#c9a96e",
                }}
              >
                Free taste
              </span>
            </div>

            {/* Headline using the formula */}
            <h4
              className="font-serif text-2xl md:text-3xl font-light leading-tight mb-2"
              style={{ color: "#e8e4f4" }}
            >
              Sixteen years building the ops layer.{" "}
              <em className="italic font-normal" style={{ color: "#f28fb5" }}>
                Not inheriting it. Building it.
              </em>
            </h4>
            <p className="font-sans text-sm mb-6" style={{ color: "#9890ab" }}>
              {senderName} hasn&rsquo;t just worked in CES — {senderName} has built it from zero, three times.
            </p>

            {/* Stat cards row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div
                className="p-3 rounded-md"
                style={{ backgroundColor: "rgba(13, 11, 23, 0.6)", border: "1px solid #2a2340" }}
              >
                <div
                  className="font-serif text-2xl md:text-3xl font-light"
                  style={{ color: "#c9a96e" }}
                >
                  $2.1M
                </div>
                <div
                  className="font-mono text-[9px] uppercase mt-1"
                  style={{ letterSpacing: "0.1em", color: "#9890ab" }}
                >
                  Co-sell ARR
                </div>
              </div>
              <div
                className="p-3 rounded-md"
                style={{ backgroundColor: "rgba(13, 11, 23, 0.6)", border: "1px solid #2a2340" }}
              >
                <div
                  className="font-serif text-2xl md:text-3xl font-light"
                  style={{ color: "#f28fb5" }}
                >
                  78%
                </div>
                <div
                  className="font-mono text-[9px] uppercase mt-1"
                  style={{ letterSpacing: "0.1em", color: "#9890ab" }}
                >
                  Churn drop
                </div>
              </div>
              <div
                className="p-3 rounded-md"
                style={{ backgroundColor: "rgba(13, 11, 23, 0.6)", border: "1px solid #2a2340" }}
              >
                <div
                  className="font-serif text-2xl md:text-3xl font-light"
                  style={{ color: "#c9a96e" }}
                >
                  4,000+
                </div>
                <div
                  className="font-mono text-[9px] uppercase mt-1"
                  style={{ letterSpacing: "0.1em", color: "#9890ab" }}
                >
                  Devs enabled
                </div>
              </div>
            </div>

            {/* Inline SVG bar chart */}
            <div className="mb-5">
              <div
                className="font-mono text-[10px] uppercase mb-3"
                style={{ letterSpacing: "0.12em", color: "#c9a96e" }}
              >
                Onboarding time, before vs after
              </div>
              <svg viewBox="0 0 320 90" className="w-full" style={{ maxHeight: "90px" }}>
                {/* Before bar */}
                <text x="0" y="22" fill="#9890ab" fontSize="9" fontFamily="monospace">BEFORE</text>
                <rect x="60" y="14" width="240" height="14" fill="#2a2340" rx="2" />
                <rect x="60" y="14" width="240" height="14" fill="#9890ab" rx="2" />
                <text x="305" y="24" fill="#e8e4f4" fontSize="10" fontFamily="serif">14d</text>
                {/* After bar */}
                <text x="0" y="58" fill="#9890ab" fontSize="9" fontFamily="monospace">AFTER</text>
                <rect x="60" y="50" width="240" height="14" fill="#2a2340" rx="2" />
                <rect x="60" y="50" width="51" height="14" fill="#f28fb5" rx="2" />
                <text x="116" y="60" fill="#f28fb5" fontSize="10" fontFamily="serif">3d</text>
                {/* Caption */}
                <text x="0" y="84" fill="#9890ab" fontSize="8" fontFamily="monospace">
                  CRUNCHBASE FILINGS, 2024
                </text>
              </svg>
            </div>

            {/* Executed line */}
            <div
              className="p-3 rounded-md flex items-start gap-3"
              style={{
                backgroundColor: "rgba(242, 143, 181, 0.08)",
                border: "1px solid rgba(242, 143, 181, 0.25)",
              }}
            >
              <span
                className="font-mono text-[10px] flex-shrink-0 mt-0.5"
                style={{ color: "#f28fb5", letterSpacing: "0.1em" }}
              >
                EXECUTED
              </span>
              <p className="font-sans text-sm leading-snug" style={{ color: "#e8e4f4" }}>
                <span style={{ color: "#f28fb5" }}>{senderName}</span> rebuilt
                onboarding end-to-end — replaced 6 manual handoffs with a self-serve
                wizard, retained $400K in ARR.
              </p>
            </div>

            <p className="font-sans text-xs mt-4" style={{ color: "#9890ab" }}>
              Your full brief turns this into 5 sections of cinematic, personalized intel — with motion, citations, and a custom color scheme matched to {formData.targetCompany || "the target"}&rsquo;s industry.
            </p>
          </div>

          {/* Locked sections */}
          {[
            { label: "Research & Intelligence", color: "#c9a96e" },
            { label: "Gap Analysis & Strategy", color: "#f28fb5" },
            { label: "Execution Plan", color: "#534AB7" },
          ].map((section) => (
            <div
              key={section.label}
              className="p-5 rounded-lg border relative overflow-hidden"
              style={{
                borderColor: "#2a2340",
                backgroundColor: "rgba(30, 21, 53, 0.3)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: section.color }}
                />
                <span
                  className="font-mono text-xs uppercase"
                  style={{ letterSpacing: "0.1em", color: section.color }}
                >
                  {section.label}
                </span>
              </div>
              {/* Blurred placeholder lines */}
              <div className="space-y-2" style={{ filter: "blur(6px)", userSelect: "none" }}>
                <div className="h-3 rounded-full w-full" style={{ backgroundColor: "rgba(232, 228, 244, 0.08)" }} />
                <div className="h-3 rounded-full w-4/5" style={{ backgroundColor: "rgba(232, 228, 244, 0.06)" }} />
                <div className="h-3 rounded-full w-3/5" style={{ backgroundColor: "rgba(232, 228, 244, 0.04)" }} />
              </div>
              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-[#0d0b17]/40">
                <span
                  className="font-mono text-xs uppercase px-3 py-1.5 rounded-full border"
                  style={{
                    letterSpacing: "0.1em",
                    color: "#9890ab",
                    borderColor: "#2a2340",
                    backgroundColor: "rgba(13, 11, 23, 0.8)",
                  }}
                >
                  Unlocks after payment
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Email preview teaser */}
        <div className="px-8 md:px-12 pb-8">
          <div
            className="p-5 rounded-lg border"
            style={{
              borderColor: "rgba(201, 169, 110, 0.3)",
              backgroundColor: "rgba(201, 169, 110, 0.05)",
            }}
          >
            <span
              className="font-mono text-xs uppercase block mb-2"
              style={{ letterSpacing: "0.1em", color: "#c9a96e" }}
            >
              Also included
            </span>
            <p className="font-sans text-base" style={{ color: "#d2cfe0" }}>
              AI-generated subject line + email copy optimized for open rates
            </p>
          </div>
        </div>
      </div>

      <p
        className="font-sans text-sm font-light text-center mt-6"
        style={{ color: "#9890ab" }}
      >
        Your full brief, email copy, and subject line unlock on the next step.
      </p>
    </div>
  );
}

/* ───────────────────────────────────────────
   PRICING TIER SELECTOR
   ─────────────────────────────────────────── */

function PricingSelector({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (plan: string) => void;
}) {
  const plans = [
    {
      id: "one_off",
      name: "Single Brief",
      price: "$9",
      period: "one-time",
      desc: "One cinematic brief + email copy",
      features: ["1 intelligence brief", "AI subject line + email", "1 round of revisions"],
      color: "#9890ab",
    },
    {
      id: "subscription",
      name: "Unlimited",
      price: "$24",
      period: "/month",
      desc: "For active job hunts",
      features: ["Unlimited briefs", "Unlimited contact fetches", "AI subject line + email", "1 round of revisions each", "Cancel anytime"],
      popular: true,
      color: "#f28fb5",
    },
    {
      id: "pack_five",
      name: "5-Pack",
      price: "$29",
      period: "one-time",
      desc: "Five briefs, use anytime",
      features: ["5 briefs (use anytime)", "AI subject line + email", "1 round of revisions each", "Never expires"],
      color: "#c9a96e",
    },
  ];

  return (
    <div className="mt-8">
      <span
        className="font-mono text-xs uppercase block mb-5 text-center"
        style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
      >
        Choose your plan
      </span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onChange(plan.id)}
            className="p-5 rounded-xl border text-left transition-all duration-200 relative"
            style={{
              borderColor:
                selected === plan.id
                  ? plan.color
                  : "#2a2340",
              backgroundColor:
                selected === plan.id
                  ? `rgba(${plan.color === "#f28fb5" ? "242,143,181" : plan.color === "#c9a96e" ? "201,169,110" : "152,144,171"}, 0.08)`
                  : "rgba(30, 21, 53, 0.3)",
            }}
          >
            {plan.popular && (
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase px-3 py-1 rounded-full"
                style={{
                  letterSpacing: "0.1em",
                  backgroundColor: "#f28fb5",
                  color: "#0d0b17",
                }}
              >
                Most popular
              </span>
            )}
            <div className="mb-3">
              <span
                className="font-mono text-xs uppercase block mb-1"
                style={{ letterSpacing: "0.1em", color: plan.color }}
              >
                {plan.name}
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className="font-serif text-3xl font-light"
                  style={{ color: "#e8e4f4" }}
                >
                  {plan.price}
                </span>
                <span
                  className="font-sans text-sm"
                  style={{ color: "#9890ab" }}
                >
                  {plan.period}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              {plan.features.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <span
                    className="shrink-0 mt-1"
                    style={{ color: plan.color }}
                  >
                    &#10003;
                  </span>
                  <span
                    className="font-sans text-sm"
                    style={{ color: "#d2cfe0" }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   REVIEW STEP
   ─────────────────────────────────────────── */

function StepReview({
  userType,
  formData,
  onEdit,
  selectedPlan,
  onPlanChange,
  onEmailChange,
  emailError,
  onContactToggle,
  onApplyStarDraft,
}: {
  userType: Exclude<UserType, null>;
  formData: FormData;
  onEdit: (step: number) => void;
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
  onEmailChange: (email: string) => void;
  emailError?: string;
  onContactToggle: (value: boolean) => void;
  onApplyStarDraft?: (draft: string) => void;
}) {
  /* ── STAR auto-suggest (job_seeker only) ─────────────
     Calls /api/extract-star once on mount when we have
     resume + target signal. Cached in component state
     so re-renders don't re-bill. ─────────────────────── */
  const eligibleForStar =
    userType === "job_seeker" &&
    !!formData.resumeText.trim() &&
    (!!formData.targetTitle.trim() || !!formData.targetCompany.trim()) &&
    !!onApplyStarDraft;

  const [starState, setStarState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [starDraft, setStarDraft] = useState<string>("");
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!eligibleForStar || fetchedRef.current) return;
    fetchedRef.current = true;
    setStarState("loading");
    fetch("/api/extract-star", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeText: formData.resumeText,
        targetTitle: formData.targetTitle,
        targetCompany: formData.targetCompany,
        senderName: formData.senderName,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (j?.starDraft) {
          setStarDraft(j.starDraft);
          setStarState("ready");
        } else {
          setStarState("error");
        }
      })
      .catch(() => setStarState("error"));
  }, [
    eligibleForStar,
    formData.resumeText,
    formData.targetTitle,
    formData.targetCompany,
    formData.senderName,
  ]);

  const buildSections = () => {
    if (userType === "job_seeker") {
      return [
        {
          title: "Resume",
          step: 0,
          fields: [
            {
              label: "File",
              value: formData.resumeFileName || "(Pasted text)",
            },
            {
              label: "Length",
              value: formData.resumeText
                ? `${formData.resumeText.split(/\s+/).filter(Boolean).length} words captured`
                : "",
            },
          ],
        },
        {
          title: "About You",
          step: 1,
          fields: [
            { label: "Name", value: formData.senderName },
            { label: "Role", value: formData.senderRole },
            { label: "Background", value: formData.senderBackground },
          ],
        },
        {
          title: "Target",
          step: 2,
          fields: [
            { label: "Name", value: formData.targetName },
            { label: "Title", value: formData.targetTitle },
            { label: "Company", value: formData.targetCompany },
            { label: "LinkedIn", value: formData.targetLinkedIn },
          ],
        },
        {
          title: "Context",
          step: 3,
          fields: [
            { label: "Outreach", value: formData.outreachType },
            { label: "Goal", value: formData.goal },
            { label: "Notes", value: formData.notes },
          ],
        },
      ];
    }

    if (userType === "hiring_manager") {
      return [
        {
          title: "Candidate Resume",
          step: 0,
          fields: [
            { label: "Candidate", value: formData.targetName },
            {
              label: "File",
              value: formData.resumeFileName || "(Pasted text)",
            },
            {
              label: "Length",
              value: formData.resumeText
                ? `${formData.resumeText.split(/\s+/).filter(Boolean).length} words captured`
                : "",
            },
          ],
        },
        {
          title: "About You",
          step: 1,
          fields: [
            { label: "Name", value: formData.senderName },
            { label: "Role", value: formData.senderRole },
            { label: "Company", value: formData.senderCompany },
          ],
        },
        {
          title: "The Role",
          step: 2,
          fields: [
            { label: "Hiring For", value: formData.roleHiringFor },
            { label: "Compelling", value: formData.roleCompelling },
            { label: "Outreach", value: formData.outreachType },
            { label: "Angle", value: formData.specificAngle },
          ],
        },
      ];
    }

    if (userType === "salesperson") {
      return [
        {
          title: "About You",
          step: 0,
          fields: [
            { label: "Name", value: formData.senderName },
            { label: "Role", value: formData.senderRole },
            { label: "Company", value: formData.senderCompany },
            { label: "Product", value: formData.yourProduct },
          ],
        },
        {
          title: "Prospect",
          step: 1,
          fields: [
            { label: "Name", value: formData.targetName },
            { label: "Title", value: formData.targetTitle },
            { label: "Company", value: formData.targetCompany },
            { label: "Industry", value: formData.prospectIndustry },
            { label: "LinkedIn", value: formData.targetLinkedIn },
          ],
        },
        {
          title: "Context",
          step: 2,
          fields: [
            { label: "Outreach", value: formData.outreachType },
            { label: "Goal", value: formData.goal },
            { label: "Pain Points", value: formData.painPoints },
            { label: "Angle", value: formData.specificAngle },
          ],
        },
      ];
    }

    /* influencer_brand */
    return [
      {
        title: "Media Kit",
        step: 0,
        fields: [
          { label: "File", value: formData.mediaKitFileName || (formData.mediaKitText ? "Pasted stats" : "") },
        ],
      },
      {
        title: "About You",
        step: 1,
        fields: [
          { label: "Brand/Creator", value: formData.brandCreatorName },
          { label: "Role", value: formData.senderRole },
          { label: "Email", value: formData.senderEmail },
        ],
      },
      {
        title: "Partnership",
        step: 2,
        fields: [
          { label: "Type", value: formData.partnershipType },
          { label: "Fit", value: formData.partnershipFit },
          { label: "Audience Overlap", value: formData.audienceOverlapNotes },
        ],
      },
      {
        title: "Target Partner",
        step: 3,
        fields: [
          { label: "Company/Brand", value: formData.targetCompany },
          { label: "Contact", value: formData.targetName },
          { label: "Title", value: formData.targetTitle },
          { label: "LinkedIn", value: formData.targetLinkedIn },
          { label: "Unique Angle", value: formData.uniqueAngle },
        ],
      },
    ];
  };

  const sections = buildSections();

  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        Review your brief
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Everything look good? Edit any section before proceeding.
      </p>

      {eligibleForStar && starState !== "error" && (
        <div
          className="mb-6 p-4 rounded-xl border flex items-center justify-between gap-4"
          style={{
            borderColor: "rgba(242, 143, 181, 0.35)",
            background:
              "linear-gradient(90deg, rgba(242,143,181,0.06), rgba(201,169,110,0.04))",
          }}
        >
          <div className="flex-1 min-w-0">
            <div
              className="font-mono text-[11px] uppercase mb-1"
              style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
            >
              ✨ {starState === "loading" ? "Scanning your resume…" : "We found 2 wins from your resume that map to this role"}
            </div>
            <div
              className="font-sans text-sm font-light"
              style={{ color: "#9890ab" }}
            >
              {starState === "loading"
                ? "Picking the bullets that matter most for this target."
                : "One click drops a STAR draft into your About You step. You edit the ACTION line to add the HOW."}
            </div>
          </div>
          <button
            type="button"
            disabled={starState !== "ready"}
            onClick={() => onApplyStarDraft && onApplyStarDraft(starDraft)}
            className="font-mono text-xs uppercase px-4 py-2.5 rounded-full border transition-all duration-200 whitespace-nowrap"
            style={{
              letterSpacing: "0.12em",
              color: starState === "ready" ? "#fff" : "#9890ab",
              borderColor: starState === "ready" ? "#f28fb5" : "#2a2340",
              background: starState === "ready" ? "#f28fb5" : "transparent",
              cursor: starState === "ready" ? "pointer" : "wait",
              opacity: starState === "ready" ? 1 : 0.6,
            }}
          >
            {starState === "ready" ? "Use as my STAR draft →" : "Drafting…"}
          </button>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="p-6 rounded-xl border"
            style={{
              borderColor: "#2a2340",
              backgroundColor: "rgba(30, 21, 53, 0.3)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="font-mono text-xs uppercase"
                style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
              >
                {section.title}
              </span>
              <button
                onClick={() => onEdit(section.step)}
                className="font-mono text-xs uppercase px-3 py-1 rounded-full border transition-all duration-200 hover:border-[#c9a96e] hover:text-[#c9a96e]"
                style={{
                  letterSpacing: "0.1em",
                  color: "#9890ab",
                  borderColor: "#2a2340",
                }}
              >
                Edit
              </button>
            </div>
            <div className="space-y-2">
              {section.fields
                .filter((f) => f.value)
                .map((field) => (
                  <div key={field.label} className="flex gap-4">
                    <span
                      className="font-sans text-sm shrink-0 w-28"
                      style={{ color: "#9890ab" }}
                    >
                      {field.label}
                    </span>
                    <span
                      className="font-sans text-base break-words"
                      style={{ color: "#e8e4f4" }}
                    >
                      {field.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Email for receipt + brief delivery */}
      <div
        className="mt-8 p-6 rounded-xl border"
        style={{
          borderColor: emailError ? "#f28fb5" : "#2a2340",
          backgroundColor: "rgba(30, 21, 53, 0.3)",
        }}
      >
        <label
          className="font-mono text-xs uppercase block mb-3"
          style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
        >
          Email for delivery
        </label>
        <p
          className="font-sans text-sm mb-4"
          style={{ color: "#9890ab" }}
        >
          We&apos;ll send your brief and receipt here.
        </p>
        <input
          type="email"
          value={formData.senderEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@email.com"
          className="w-full px-4 py-3 rounded-lg text-base font-sans outline-none transition-all duration-200 focus:ring-2 focus:ring-[#c9a96e]"
          style={{
            backgroundColor: "rgba(13, 11, 23, 0.6)",
            color: "#e8e4f4",
            border: `1px solid ${emailError ? "#f28fb5" : "#2a2340"}`,
          }}
        />
        {emailError && (
          <p className="mt-2 text-sm" style={{ color: "#f28fb5" }}>
            {emailError}
          </p>
        )}
      </div>

      {/* Contact enrichment opt-in */}
      <div
        className="mt-8 p-6 rounded-xl border transition-all duration-200"
        style={{
          borderColor: formData.wantsContactEnrichment
            ? "#c9a96e"
            : "rgba(201, 169, 110, 0.3)",
          backgroundColor: formData.wantsContactEnrichment
            ? "rgba(201, 169, 110, 0.08)"
            : "rgba(30, 21, 53, 0.3)",
        }}
      >
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.wantsContactEnrichment}
            onChange={(e) => onContactToggle(e.target.checked)}
            className="mt-1 w-5 h-5 rounded accent-[#c9a96e] cursor-pointer shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="font-mono text-xs uppercase"
                style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
              >
                Find their email &amp; phone
              </span>
              <span
                className="font-mono text-[10px] uppercase px-2 py-0.5 rounded-full"
                style={{
                  letterSpacing: "0.12em",
                  color: "#0d0b17",
                  backgroundColor: "#c9a96e",
                }}
              >
                Optional
              </span>
            </div>
            <p
              className="font-sans text-base font-light mb-2"
              style={{ color: "#e8e4f4" }}
            >
              Let LORE look up{" "}
              <span style={{ color: "#f28fb5" }}>
                {formData.targetName || "your contact"}
              </span>
              &rsquo;s direct work email and phone number so your brief lands
              where it counts.
            </p>
            <p
              className="font-sans text-sm font-light"
              style={{ color: "#9890ab" }}
            >
              Included free on{" "}
              <span style={{ color: "#c9a96e" }}>Unlimited</span>. One lookup
              credit is included with Single Brief and 5-Pack. Results are
              best-effort &mdash; we&rsquo;ll tell you if we can&rsquo;t find
              verified contact info.
            </p>
          </div>
        </label>
      </div>

      {/* Pricing tiers */}
      <PricingSelector selected={selectedPlan} onChange={onPlanChange} />
    </div>
  );
}

/* ───────────────────────────────────────────
   MAIN INTAKE PAGE
   ─────────────────────────────────────────── */

export default function IntakePage() {
  const [userType, setUserType] = useState<UserType>(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPlan, setSelectedPlan] = useState("one_off");
  const [starDrafted, setStarDrafted] = useState(false);

  const applyStarDraft = (draft: string) => {
    setFormData((prev) => ({ ...prev, senderBackground: draft }));
    setStarDrafted(true);
    // Jump back to About You step (step 1 for job_seeker)
    setStep(1);
    setTimeout(() => {
      const wrap = document.getElementById("star-field-wrapper");
      if (wrap) wrap.scrollIntoView({ behavior: "smooth", block: "center" });
      const ta = wrap?.querySelector<HTMLTextAreaElement>("textarea");
      if (ta) ta.focus();
    }, 80);
  };

  const config = userType ? STEP_CONFIG[userType] : null;
  const totalSteps = config?.total ?? 0;

  const setField = (key: keyof FormData, val: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleFileRead = (text: string, fileName: string) => {
    setFormData((prev) => ({
      ...prev,
      resumeText: text,
      resumeFileName: fileName,
    }));
    if (errors.resumeText) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.resumeText;
        return next;
      });
    }
  };

  const handleMediaKitFileRead = (text: string, fileName: string) => {
    setFormData((prev) => ({
      ...prev,
      mediaKitText: text,
      mediaKitFileName: fileName,
    }));
    if (errors.mediaKitText) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.mediaKitText;
        return next;
      });
    }
  };

  /* ── Validation per user-type + step ── */
  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (userType === "job_seeker") {
      if (step === 0 && !formData.resumeText.trim())
        e.resumeText = "Upload or paste your resume";
      if (step === 1) {
        if (!formData.senderName.trim()) e.senderName = "Name is required";
        if (!formData.senderRole.trim()) e.senderRole = "Role is required";
      }
      if (step === 2) {
        if (!formData.targetCompany.trim())
          e.targetCompany = "Company is required";
        if (!formData.targetName.trim() && !formData.wantsContactEnrichment) {
          e.targetName = "Add a contact, or check the box below to have us find one";
        }
      }
      if (step === 3) {
        if (!formData.outreachType) e.outreachType = "Select an outreach type";
        if (!formData.goal) e.goal = "Select a goal";
      }
    }

    if (userType === "hiring_manager") {
      if (step === 0) {
        if (!formData.resumeText.trim())
          e.resumeText = "Upload or paste the candidate's resume";
        if (!formData.targetName.trim()) e.targetName = "Candidate name is required";
      }
      if (step === 1) {
        if (!formData.senderName.trim()) e.senderName = "Name is required";
        if (!formData.senderRole.trim()) e.senderRole = "Role is required";
        if (!formData.senderCompany.trim())
          e.senderCompany = "Company is required";
      }
      if (step === 2) {
        if (!formData.roleHiringFor.trim())
          e.roleHiringFor = "Role is required";
        if (!formData.outreachType) e.outreachType = "Select an outreach type";
      }
    }

    if (userType === "salesperson") {
      if (step === 0) {
        if (!formData.senderName.trim()) e.senderName = "Name is required";
        if (!formData.senderRole.trim()) e.senderRole = "Role is required";
        if (!formData.senderCompany.trim())
          e.senderCompany = "Company is required";
        if (!formData.yourProduct.trim())
          e.yourProduct = "Product description is required";
      }
      if (step === 1) {
        if (!formData.targetName.trim()) e.targetName = "Name is required";
        if (!formData.targetTitle.trim()) e.targetTitle = "Title is required";
        if (!formData.targetCompany.trim())
          e.targetCompany = "Company is required";
      }
      if (step === 2) {
        if (!formData.outreachType) e.outreachType = "Select an outreach type";
        if (!formData.goal) e.goal = "Select a goal";
      }
    }

    if (userType === "influencer_brand") {
      if (step === 0 && !formData.mediaKitText.trim())
        e.mediaKitText = "Upload or paste your media kit (or paste your stats)";
      if (step === 1) {
        if (!formData.brandCreatorName.trim()) e.brandCreatorName = "Brand/creator name is required";
        if (!formData.senderRole.trim()) e.senderRole = "Role is required";
        if (!formData.senderEmail.trim()) e.senderEmail = "Email is required";
      }
      if (step === 2) {
        if (!formData.partnershipType) e.partnershipType = "Select a partnership type";
        if (!formData.partnershipFit.trim()) e.partnershipFit = "Partnership fit description is required";
      }
      if (step === 3) {
        if (!formData.targetCompany.trim())
          e.targetCompany = "Target company/brand is required";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProceedToPayment = async () => {
    console.log("[LORE] Proceed to Payment clicked", { selectedPlan, email: formData.senderEmail });
    if (isSubmitting) {
      console.log("[LORE] Already submitting, ignoring click");
      return;
    }

    /* Validate email before proceeding */
    if (!formData.senderEmail.trim() || !formData.senderEmail.includes("@")) {
      console.log("[LORE] Email validation failed");
      setErrors((prev) => ({ ...prev, senderEmail: "Valid email is required" }));
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      alert("Please enter a valid email in the 'Email for delivery' field above before proceeding.");
      return;
    }

    setIsSubmitting(true);

    try {
      /* Step 1: Save brief to Supabase */
      console.log("[LORE] Saving brief to /api/briefs...");
      const briefRes = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType,
          senderName: formData.senderName,
          senderEmail: formData.senderEmail,
          senderRole: formData.senderRole,
          senderBackground: formData.senderBackground,
          senderCompany: formData.senderCompany,
          senderCompanyDesc: formData.senderCompanyDesc,
          resumeText: formData.resumeText,
          resumeFileName: formData.resumeFileName,
          targetName: formData.targetName,
          targetTitle: formData.targetTitle,
          targetCompany: formData.targetCompany,
          targetLinkedIn: formData.targetLinkedIn,
          outreachType: formData.outreachType,
          goal: formData.goal,
          notes: formData.notes,
          roleHiringFor: formData.roleHiringFor,
          roleCompelling: formData.roleCompelling,
          specificAngle: formData.specificAngle,
          prospectIndustry: formData.prospectIndustry,
          painPoints: formData.painPoints,
          yourProduct: formData.yourProduct,
          brandCreatorName: formData.brandCreatorName,
          partnershipType: formData.partnershipType,
          partnershipFit: formData.partnershipFit,
          audienceOverlapNotes: formData.audienceOverlapNotes,
          uniqueAngle: formData.uniqueAngle,
          mediaKitText: formData.mediaKitText,
          mediaKitFileName: formData.mediaKitFileName,
          jobPostingText: formData.jobPostingText,
          publishedWorkLinks: formData.publishedWorkLinks,
          plan: selectedPlan,
          contactIdRequested: formData.wantsContactEnrichment,
        }),
      });

      const briefData = await briefRes.json();
      console.log("[LORE] /api/briefs response", { status: briefRes.status, data: briefData });

      if (!briefRes.ok) {
        alert(`Save failed (HTTP ${briefRes.status}): ${briefData.error || "Unknown error"}`);
        setIsSubmitting(false);
        return;
      }

      /* Step 2: Create Stripe Checkout session and redirect */
      console.log("[LORE] Creating Stripe checkout session...");
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefId: briefData.briefId,
          plan: selectedPlan,
          email: formData.senderEmail,
        }),
      });

      const checkoutData = await checkoutRes.json();
      console.log("[LORE] /api/checkout response", { status: checkoutRes.status, data: checkoutData });

      if (!checkoutRes.ok) {
        alert(`Checkout failed (HTTP ${checkoutRes.status}): ${checkoutData.error || "Unknown error"}`);
        setIsSubmitting(false);
        return;
      }

      if (!checkoutData.url) {
        alert("Checkout returned no URL. Stripe may not be configured. Please contact kyle@sendlore.com.");
        setIsSubmitting(false);
        return;
      }

      /* Redirect to Stripe Checkout */
      console.log("[LORE] Redirecting to Stripe:", checkoutData.url);
      window.location.href = checkoutData.url;
    } catch (err) {
      console.error("[LORE] Proceed to Payment error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Network/JS error: ${msg}\n\nOpen DevTools → Console for full details.`);
      setIsSubmitting(false);
    }
  };

  /* ── Render step content ── */
  const renderStep = () => {
    if (!userType) return null;

    /* Job Seeker: Resume(0) → About(1) → Target(2) → Context(3) → Preview(4) → Review(5) */
    if (userType === "job_seeker") {
      if (step === 0)
        return <JS_StepResume formData={formData} setField={setField} onFileRead={handleFileRead} errors={errors} />;
      if (step === 1)
        return <JS_StepAboutYou formData={formData} setField={setField} errors={errors} starDrafted={starDrafted} />;
      if (step === 2)
        return <JS_StepTarget formData={formData} setField={setField} errors={errors} />;
      if (step === 3)
        return <JS_StepContext formData={formData} setField={setField} errors={errors} />;
      if (step === 4)
        return <StepPreview userType={userType} formData={formData} />;
      if (step === 5)
        return <StepReview userType={userType} formData={formData} onEdit={(s) => setStep(s)} selectedPlan={selectedPlan} onPlanChange={setSelectedPlan} onEmailChange={(v) => setField("senderEmail", v)} emailError={errors.senderEmail} onContactToggle={(v) => setField("wantsContactEnrichment", v)} onApplyStarDraft={applyStarDraft} />;
    }

    /* Hiring Manager: Resume(0) → About(1) → Role(2) → Preview(3) → Review(4) */
    if (userType === "hiring_manager") {
      if (step === 0)
        return <HM_StepResume formData={formData} setField={setField} onFileRead={handleFileRead} errors={errors} />;
      if (step === 1)
        return <HM_StepAboutYou formData={formData} setField={setField} errors={errors} />;
      if (step === 2)
        return <HM_StepRole formData={formData} setField={setField} errors={errors} />;
      if (step === 3)
        return <StepPreview userType={userType} formData={formData} />;
      if (step === 4)
        return <StepReview userType={userType} formData={formData} onEdit={(s) => setStep(s)} selectedPlan={selectedPlan} onPlanChange={setSelectedPlan} onEmailChange={(v) => setField("senderEmail", v)} emailError={errors.senderEmail} onContactToggle={(v) => setField("wantsContactEnrichment", v)} />;
    }

    /* Salesperson: About(0) → Prospect(1) → Context(2) → Preview(3) → Review(4) */
    if (userType === "salesperson") {
      if (step === 0)
        return <SP_StepAboutYou formData={formData} setField={setField} errors={errors} />;
      if (step === 1)
        return <SP_StepProspect formData={formData} setField={setField} errors={errors} />;
      if (step === 2)
        return <SP_StepContext formData={formData} setField={setField} errors={errors} />;
      if (step === 3)
        return <StepPreview userType={userType} formData={formData} />;
      if (step === 4)
        return <StepReview userType={userType} formData={formData} onEdit={(s) => setStep(s)} selectedPlan={selectedPlan} onPlanChange={setSelectedPlan} onEmailChange={(v) => setField("senderEmail", v)} emailError={errors.senderEmail} onContactToggle={(v) => setField("wantsContactEnrichment", v)} />;
    }

    /* Influencer/Brand: MediaKit(0) → About(1) → Partnership(2) → Target(3) → Preview(4) → Review(5) */
    if (userType === "influencer_brand") {
      if (step === 0)
        return <IB_StepMediaKit formData={formData} setField={setField} onFileRead={handleMediaKitFileRead} errors={errors} />;
      if (step === 1)
        return <IB_StepAboutYou formData={formData} setField={setField} errors={errors} />;
      if (step === 2)
        return <IB_StepPartnership formData={formData} setField={setField} errors={errors} />;
      if (step === 3)
        return <IB_StepTarget formData={formData} setField={setField} errors={errors} />;
      if (step === 4)
        return <StepPreview userType={userType} formData={formData} />;
      if (step === 5)
        return <StepReview userType={userType} formData={formData} onEdit={(s) => setStep(s)} selectedPlan={selectedPlan} onPlanChange={setSelectedPlan} onEmailChange={(v) => setField("senderEmail", v)} emailError={errors.senderEmail} onContactToggle={(v) => setField("wantsContactEnrichment", v)} />;
    }

    return null;
  };

  /* Show type selection first */
  if (!userType) {
    return <UserTypeSelection onSelect={setUserType} />;
  }

  const isReviewStep = step === totalSteps - 1;

  return (
    <div
      className="min-h-screen px-6 py-12 md:py-20"
      style={{ backgroundColor: "#0d0b17" }}
    >
      {/* Top bar */}
      <div className="max-w-2xl mx-auto mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl tracking-wide"
          style={{ color: "#e8e4f4" }}
        >
          L<span style={{ color: "#f28fb5" }}>O</span>R
          <span style={{ color: "#c9a96e" }}>E</span>
        </Link>
        <button
          onClick={() => {
            setUserType(null);
            setStep(0);
            setFormData(emptyForm);
            setErrors({});
            setSelectedPlan("one_off");
          }}
          className="font-mono text-xs uppercase transition-colors hover:text-[#f28fb5]"
          style={{ letterSpacing: "0.15em", color: "#9890ab" }}
        >
          Start over
        </button>
      </div>

      {/* Progress */}
      <ProgressBar step={step} total={totalSteps} />

      {/* Step pills */}
      <div className="max-w-2xl mx-auto mb-10 flex gap-2 overflow-x-auto">
        {config!.titles.map((title, i) => (
          <span
            key={title}
            className="font-mono text-xs uppercase px-3 py-1.5 rounded-full border whitespace-nowrap"
            style={{
              letterSpacing: "0.1em",
              color:
                i === step ? "#c9a96e" : i < step ? "#9890ab" : "#3d3555",
              borderColor:
                i === step ? "#c9a96e" : i < step ? "#2a2340" : "#1e1535",
              backgroundColor:
                i === step ? "rgba(201, 169, 110, 0.1)" : "transparent",
            }}
          >
            {title}
          </span>
        ))}
      </div>

      {/* Form content */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${userType}-${step}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div
          className="flex items-center justify-between mt-10 pt-6 border-t"
          style={{ borderColor: "#2a2340" }}
        >
          <button
            onClick={handleBack}
            className="font-mono text-sm uppercase px-6 py-3 rounded-full border transition-all duration-200 hover:border-[#c9a96e] hover:text-[#c9a96e]"
            style={{
              letterSpacing: "0.15em",
              color: step === 0 ? "#3d3555" : "#9890ab",
              borderColor: step === 0 ? "#1e1535" : "#2a2340",
              pointerEvents: step === 0 ? "none" : "auto",
            }}
          >
            &larr; Back
          </button>

          {!isReviewStep ? (
            <button
              onClick={handleNext}
              className="font-mono text-sm uppercase px-8 py-3 rounded-full font-bold transition-all duration-200 hover:scale-105"
              style={{
                letterSpacing: "0.15em",
                backgroundColor: "#f28fb5",
                color: "#0d0b17",
              }}
            >
              Next &rarr;
            </button>
          ) : (
            <motion.button
              type="button"
              onClick={handleProceedToPayment}
              disabled={isSubmitting}
              className="font-mono text-sm uppercase px-8 py-3 rounded-full font-bold transition-all duration-200"
              style={{
                letterSpacing: "0.15em",
                backgroundColor: isSubmitting ? "#6b6480" : "#c9a96e",
                color: "#0d0b17",
                opacity: isSubmitting ? 0.7 : 1,
              }}
              animate={isSubmitting ? {} : { scale: [1, 1.03, 1] }}
              transition={{
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              whileHover={isSubmitting ? {} : { scale: 1.05 }}
              whileTap={isSubmitting ? {} : { scale: 0.98 }}
            >
              {isSubmitting ? "Saving..." : "Proceed to Payment"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

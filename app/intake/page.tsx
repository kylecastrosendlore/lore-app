"use client";

import { useState, useRef, useCallback } from "react";
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
    titles: ["About You", "Partnership", "Target", "Preview", "Review"],
    total: 5,
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

function HelperTip({ text }: { text: string }) {
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
}: {
  resumeText: string;
  resumeFileName: string;
  onTextChange: (v: string) => void;
  onFileRead: (text: string, fileName: string) => void;
  error?: string;
  ownerLabel: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [mode, setMode] = useState<"upload" | "paste">(
    resumeText && !resumeFileName ? "paste" : "upload"
  );

  const readFile = useCallback(
    async (file: File) => {
      setIsReading(true);

      /* For .txt files, read directly */
      if (file.name.endsWith(".txt")) {
        const text = await file.text();
        onFileRead(text, file.name);
        setIsReading(false);
        return;
      }

      /* For .pdf and .docx, read raw text content client-side.
         Full parsing happens server-side in later phases. */
      const text = await file.text().catch(() => "");
      if (text && text.length > 50) {
        onFileRead(text, file.name);
      } else {
        /* Binary file — store as base64 for server-side parsing later */
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1] || "";
          onFileRead(`[FILE:${file.name}:${base64.slice(0, 100)}...]`, file.name);
        };
        reader.readAsDataURL(file);
      }
      setIsReading(false);
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
          {ownerLabel} resume
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
            accept=".pdf,.docx,.doc,.txt"
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
                PDF, DOCX, or TXT
              </p>
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={resumeText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Paste your resume content here..."
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

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans text-sm mt-2"
          style={{ color: "#f28fb5" }}
        >
          {error}
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
        label="Current role or title"
        value={formData.senderRole}
        onChange={(v) => setField("senderRole", v)}
        placeholder="Head of Video Strategy"
        required
        error={errors.senderRole}
      />
      <TextArea
        label="What should they know about you that's NOT on your resume?"
        value={formData.senderBackground}
        onChange={(v) => setField("senderBackground", v)}
        placeholder="A specific moment you owned an outcome. A passion project. The thing you'd lead with if you had 30 seconds in an elevator."
        rows={4}
      />
      <ProTipsBox
        title="What makes this section land"
        tips={[
          {
            headline: "Lead with one specific story",
            detail: "Not a list. One moment where you owned an outcome from start to finish.",
          },
          {
            headline: "Quantify the result",
            detail: "Even rough numbers — 'cut load time in half,' 'shipped in 6 weeks instead of 6 months.'",
          },
          {
            headline: "Tell us the why, not the what",
            detail: "Why you took the swing, why it mattered, why you're uniquely suited to this role.",
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
        Who are you reaching out to?
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        The hiring manager or contact at your target company.
      </p>
      <TextInput
        label="Contact's full name"
        value={formData.targetName}
        onChange={(v) => setField("targetName", v)}
        placeholder="Jenna Williams"
        required
        error={errors.targetName}
      />
      <HelperTip text="The more specific, the better. Full name + title helps us research them." />

      <TextInput
        label="Their job title"
        value={formData.targetTitle}
        onChange={(v) => setField("targetTitle", v)}
        placeholder="VP of Content"
        required
        error={errors.targetTitle}
      />

      <TextInput
        label="Their company"
        value={formData.targetCompany}
        onChange={(v) => setField("targetCompany", v)}
        placeholder="Bloom"
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
      <HelperTip text="This helps us gather intel on their background and interests." />
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
        label="Your role"
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
        label="Your role"
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
      <HelperTip text="This helps us gather intel on their background and interests." />
      <TextInput
        label="Industry (optional)"
        value={formData.prospectIndustry}
        onChange={(v) => setField("prospectIndustry", v)}
        placeholder="SaaS, Healthcare, Fintech..."
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
        label="Your role or title"
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
      <HelperTip text="This helps us gather intel on their brand positioning and past partnerships." />

      <TextArea
        label="Specific angle or unique value prop? (optional)"
        value={formData.uniqueAngle}
        onChange={(v) => setField("uniqueAngle", v)}
        placeholder="Why now? Recent milestone, shared values, trending topic..."
        rows={2}
      />
      <HelperTip text="What makes THIS partnership pitch stand out?" />
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
  const recipientName = formData.targetName || formData.targetCompany || "your target";
  const senderName = formData.brandCreatorName || formData.senderName || "You";

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

        {/* Blurred teaser sections */}
        <div className="px-8 md:px-12 pb-8 space-y-4">
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
      price: "$14.99",
      period: "one-time",
      desc: "One cinematic brief + email copy",
      features: ["1 intelligence brief", "AI subject line + email", "1 round of revisions"],
      color: "#9890ab",
    },
    {
      id: "subscription",
      name: "Unlimited",
      price: "$49.99",
      period: "/month",
      desc: "Unlimited briefs, cancel anytime",
      features: ["Unlimited briefs", "AI subject line + email", "1 round of revisions each", "Cancel anytime"],
      popular: true,
      color: "#f28fb5",
    },
    {
      id: "pack_five",
      name: "5-Pack",
      price: "$59.99",
      period: "one-time",
      desc: "5 briefs + 1 free (6 total)",
      features: ["6 briefs (5 + 1 free)", "AI subject line + email", "1 round of revisions each", "Best per-brief value"],
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
}: {
  userType: Exclude<UserType, null>;
  formData: FormData;
  onEdit: (step: number) => void;
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
  onEmailChange: (email: string) => void;
  emailError?: string;
  onContactToggle: (value: boolean) => void;
}) {
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
              label: "Preview",
              value: formData.resumeText
                ? formData.resumeText.slice(0, 120) + "..."
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
              label: "Preview",
              value: formData.resumeText
                ? formData.resumeText.slice(0, 120) + "..."
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
        title: "About You",
        step: 0,
        fields: [
          { label: "Brand/Creator", value: formData.brandCreatorName },
          { label: "Role", value: formData.senderRole },
          { label: "Email", value: formData.senderEmail },
        ],
      },
      {
        title: "Partnership",
        step: 1,
        fields: [
          { label: "Type", value: formData.partnershipType },
          { label: "Fit", value: formData.partnershipFit },
          { label: "Audience Overlap", value: formData.audienceOverlapNotes },
        ],
      },
      {
        title: "Target Partner",
        step: 2,
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
        if (!formData.targetName.trim()) e.targetName = "Name is required";
        if (!formData.targetTitle.trim()) e.targetTitle = "Title is required";
        if (!formData.targetCompany.trim())
          e.targetCompany = "Company is required";
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
      if (step === 0) {
        if (!formData.brandCreatorName.trim()) e.brandCreatorName = "Brand/creator name is required";
        if (!formData.senderRole.trim()) e.senderRole = "Role is required";
        if (!formData.senderEmail.trim()) e.senderEmail = "Email is required";
      }
      if (step === 1) {
        if (!formData.partnershipType) e.partnershipType = "Select a partnership type";
        if (!formData.partnershipFit.trim()) e.partnershipFit = "Partnership fit description is required";
      }
      if (step === 2) {
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
    if (isSubmitting) return;

    /* Validate email before proceeding */
    if (!formData.senderEmail.trim() || !formData.senderEmail.includes("@")) {
      setErrors((prev) => ({ ...prev, senderEmail: "Valid email is required" }));
      return;
    }

    setIsSubmitting(true);

    try {
      /* Step 1: Save brief to Supabase */
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
          plan: selectedPlan,
          contactIdRequested: formData.wantsContactEnrichment,
        }),
      });

      const briefData = await briefRes.json();

      if (!briefRes.ok) {
        alert(briefData.error || "Something went wrong saving your brief.");
        setIsSubmitting(false);
        return;
      }

      /* Step 2: Create Stripe Checkout session and redirect */
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

      if (!checkoutRes.ok) {
        alert(checkoutData.error || "Failed to start checkout. Please try again.");
        setIsSubmitting(false);
        return;
      }

      /* Redirect to Stripe Checkout */
      window.location.href = checkoutData.url;
    } catch {
      alert("Network error. Please check your connection and try again.");
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
        return <JS_StepAboutYou formData={formData} setField={setField} errors={errors} />;
      if (step === 2)
        return <JS_StepTarget formData={formData} setField={setField} errors={errors} />;
      if (step === 3)
        return <JS_StepContext formData={formData} setField={setField} errors={errors} />;
      if (step === 4)
        return <StepPreview userType={userType} formData={formData} />;
      if (step === 5)
        return <StepReview userType={userType} formData={formData} onEdit={(s) => setStep(s)} selectedPlan={selectedPlan} onPlanChange={setSelectedPlan} onEmailChange={(v) => setField("senderEmail", v)} emailError={errors.senderEmail} onContactToggle={(v) => setField("wantsContactEnrichment", v)} />;
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

    /* Influencer/Brand: About(0) → Partnership(1) → Target(2) → Preview(3) → Review(4) */
    if (userType === "influencer_brand") {
      if (step === 0)
        return <IB_StepAboutYou formData={formData} setField={setField} errors={errors} />;
      if (step === 1)
        return <IB_StepPartnership formData={formData} setField={setField} errors={errors} />;
      if (step === 2)
        return <IB_StepTarget formData={formData} setField={setField} errors={errors} />;
      if (step === 3)
        return <StepPreview userType={userType} formData={formData} />;
      if (step === 4)
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

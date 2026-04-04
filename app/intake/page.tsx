"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ───────────────────────────────────────────
   TYPES
   ─────────────────────────────────────────── */

type UserType = "job_seeker" | "hiring_manager" | "salesperson" | null;

interface FormData {
  /* Shared — sender info */
  senderName: string;
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
}

const emptyForm: FormData = {
  senderName: "",
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
};

/* Step configs per user type */
const STEP_CONFIG: Record<
  Exclude<UserType, null>,
  { titles: string[]; total: number }
> = {
  job_seeker: {
    titles: ["Resume", "About You", "Target", "Context", "Review"],
    total: 5,
  },
  hiring_manager: {
    titles: ["Candidate Resume", "About You", "The Role", "Review"],
    total: 4,
  },
  salesperson: {
    titles: ["About You", "Prospect", "Context", "Review"],
    total: 4,
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
  setField: (key: keyof FormData, val: string) => void;
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
    </div>
  );
}

function JS_StepAboutYou({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string) => void;
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
        label="Professional background"
        value={formData.senderBackground}
        onChange={(v) => setField("senderBackground", v)}
        placeholder="2-3 sentences about your experience and what makes you stand out..."
        rows={3}
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
  setField: (key: keyof FormData, val: string) => void;
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
    </div>
  );
}

function JS_StepContext({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string) => void;
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
      <TextArea
        label="Anything specific to mention? (optional)"
        value={formData.notes}
        onChange={(v) => setField("notes", v)}
        placeholder="A shared connection, a project you admire, a recent milestone..."
        rows={3}
      />
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
  setField: (key: keyof FormData, val: string) => void;
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
  setField: (key: keyof FormData, val: string) => void;
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
  setField: (key: keyof FormData, val: string) => void;
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
        placeholder="Why would someone want this role? Growth opportunity, team, mission..."
        rows={3}
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
  setField: (key: keyof FormData, val: string) => void;
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
    </div>
  );
}

function SP_StepProspect({
  formData,
  setField,
  errors,
}: {
  formData: FormData;
  setField: (key: keyof FormData, val: string) => void;
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
  setField: (key: keyof FormData, val: string) => void;
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
      <TextArea
        label="Known pain points or triggers? (optional)"
        value={formData.painPoints}
        onChange={(v) => setField("painPoints", v)}
        placeholder="Recent funding round, hiring spree, tech migration, competitor switch..."
        rows={3}
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
   REVIEW STEP (shared across all flows)
   ─────────────────────────────────────────── */

function StepReview({
  userType,
  formData,
  onEdit,
}: {
  userType: Exclude<UserType, null>;
  formData: FormData;
  onEdit: (step: number) => void;
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

    /* salesperson */
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

      {/* Price */}
      <div
        className="mt-8 p-6 rounded-xl border text-center"
        style={{
          borderColor: "rgba(201, 169, 110, 0.3)",
          backgroundColor: "rgba(201, 169, 110, 0.05)",
        }}
      >
        <span
          className="font-mono text-xs uppercase block mb-2"
          style={{ letterSpacing: "0.15em", color: "#c9a96e" }}
        >
          Your LORE Brief
        </span>
        <div className="flex items-center justify-center gap-3">
          <span
            className="font-serif text-4xl font-light"
            style={{ color: "#e8e4f4" }}
          >
            $29
          </span>
          <span
            className="font-sans text-base font-light"
            style={{ color: "#9890ab" }}
          >
            one-time
          </span>
        </div>
        <p
          className="font-sans text-sm font-light mt-2"
          style={{ color: "#9890ab" }}
        >
          Cinematic brief + AI-generated email &amp; subject line
        </p>
      </div>
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

  const config = userType ? STEP_CONFIG[userType] : null;
  const totalSteps = config?.total ?? 0;

  const setField = (key: keyof FormData, val: string) => {
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

  const handleProceedToPayment = () => {
    alert(
      "Payment integration coming in Phase 5! Your brief data has been captured."
    );
  };

  /* ── Render step content ── */
  const renderStep = () => {
    if (!userType) return null;

    if (userType === "job_seeker") {
      if (step === 0)
        return (
          <JS_StepResume
            formData={formData}
            setField={setField}
            onFileRead={handleFileRead}
            errors={errors}
          />
        );
      if (step === 1)
        return (
          <JS_StepAboutYou
            formData={formData}
            setField={setField}
            errors={errors}
          />
        );
      if (step === 2)
        return (
          <JS_StepTarget
            formData={formData}
            setField={setField}
            errors={errors}
          />
        );
      if (step === 3)
        return (
          <JS_StepContext
            formData={formData}
            setField={setField}
            errors={errors}
          />
        );
      if (step === 4)
        return (
          <StepReview
            userType={userType}
            formData={formData}
            onEdit={(s) => setStep(s)}
          />
        );
    }

    if (userType === "hiring_manager") {
      if (step === 0)
        return (
          <HM_StepResume
            formData={formData}
            setField={setField}
            onFileRead={handleFileRead}
            errors={errors}
          />
        );
      if (step === 1)
        return (
          <HM_StepAboutYou
            formData={formData}
            setField={setField}
            errors={errors}
          />
        );
      if (step === 2)
        return (
          <HM_StepRole
            formData={formData}
            setField={setField}
            errors={errors}
          />
        );
      if (step === 3)
        return (
          <StepReview
            userType={userType}
            formData={formData}
            onEdit={(s) => setStep(s)}
          />
        );
    }

    if (userType === "salesperson") {
      if (step === 0)
        return (
          <SP_StepAboutYou
            formData={formData}
            setField={setField}
            errors={errors}
          />
        );
      if (step === 1)
        return (
          <SP_StepProspect
            formData={formData}
            setField={setField}
            errors={errors}
          />
        );
      if (step === 2)
        return (
          <SP_StepContext
            formData={formData}
            setField={setField}
            errors={errors}
          />
        );
      if (step === 3)
        return (
          <StepReview
            userType={userType}
            formData={formData}
            onEdit={(s) => setStep(s)}
          />
        );
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
              className="font-mono text-sm uppercase px-8 py-3 rounded-full font-bold transition-all duration-200"
              style={{
                letterSpacing: "0.15em",
                backgroundColor: "#c9a96e",
                color: "#0d0b17",
              }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Proceed to Payment
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

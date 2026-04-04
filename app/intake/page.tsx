"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ───────────────────────────────────────────
   TYPES
   ─────────────────────────────────────────── */

type UserType = "job_seeker" | "hiring_manager" | null;

interface FormData {
  /* Sender */
  senderName: string;
  senderRole: string;
  senderBackground: string;
  /* Also for hiring manager */
  senderCompany: string;
  senderCompanyDesc: string;
  /* Target */
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
}

const emptyForm: FormData = {
  senderName: "",
  senderRole: "",
  senderBackground: "",
  senderCompany: "",
  senderCompanyDesc: "",
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
};

/* ───────────────────────────────────────────
   ANIMATION VARIANTS
   ─────────────────────────────────────────── */

const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/* ───────────────────────────────────────────
   REUSABLE COMPONENTS
   ─────────────────────────────────────────── */

function ProgressBar({ step, total }: { step: number; total: number }) {
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
   USER TYPE SELECTION
   ─────────────────────────────────────────── */

function UserTypeSelection({
  onSelect,
}: {
  onSelect: (type: UserType) => void;
}) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#0d0b17" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 font-mono text-xs uppercase transition-colors hover:text-[#f28fb5]"
        style={{ letterSpacing: "0.15em", color: "#9890ab" }}
      >
        &larr; Back
      </Link>

      <motion.div
        className="text-center max-w-xl"
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
          Who are you reaching out to?
        </h1>
        <p
          className="font-sans text-lg font-light mb-12"
          style={{ color: "#9890ab" }}
        >
          This determines what questions we ask and how your brief is built.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {[
          {
            type: "job_seeker" as UserType,
            title: "I'm a Job Seeker",
            desc: "I want to stand out to a hiring manager at a company I'm targeting.",
            icon: "🎯",
          },
          {
            type: "hiring_manager" as UserType,
            title: "I'm a Hiring Manager",
            desc: "I want to recruit a specific candidate with a personalized pitch.",
            icon: "🔍",
          },
        ].map((card, i) => (
          <motion.button
            key={card.type}
            onClick={() => onSelect(card.type)}
            className="p-8 rounded-xl border text-left transition-all duration-200 group"
            style={{
              borderColor: "#2a2340",
              backgroundColor: "rgba(30, 21, 53, 0.3)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            whileHover={{
              borderColor: "#c9a96e",
              backgroundColor: "rgba(201, 169, 110, 0.05)",
              scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-3xl block mb-4">{card.icon}</span>
            <h3
              className="font-serif text-2xl font-light mb-2"
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
   STEP COMPONENTS
   ─────────────────────────────────────────── */

function StepAboutYou({
  userType,
  formData,
  setField,
  errors,
}: {
  userType: UserType;
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
        {userType === "job_seeker"
          ? "Tell us who you are so we can voice your brief authentically."
          : "Tell us about you and your company."}
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
        placeholder={
          userType === "job_seeker"
            ? "Head of Video Strategy"
            : "VP of Marketing"
        }
        required
        error={errors.senderRole}
      />
      {userType === "hiring_manager" && (
        <>
          <TextInput
            label="Your company"
            value={formData.senderCompany}
            onChange={(v) => setField("senderCompany", v)}
            placeholder="Bloom"
            required
            error={errors.senderCompany}
          />
          <TextArea
            label="What does your company do?"
            value={formData.senderCompanyDesc}
            onChange={(v) => setField("senderCompanyDesc", v)}
            placeholder="Wellness brand with 340K organic followers..."
            rows={2}
          />
        </>
      )}
      <TextArea
        label="Professional background"
        value={formData.senderBackground}
        onChange={(v) => setField("senderBackground", v)}
        placeholder={
          userType === "job_seeker"
            ? "2-3 sentences about your experience and what you bring..."
            : "1-2 sentences about your background (optional)"
        }
        required={userType === "job_seeker"}
        error={errors.senderBackground}
        rows={3}
      />
    </div>
  );
}

function StepTarget({
  userType,
  formData,
  setField,
  errors,
}: {
  userType: UserType;
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
        {userType === "job_seeker"
          ? "Tell us about the hiring manager or contact at your target company."
          : "Tell us about the candidate you want to recruit."}
      </p>

      <TextInput
        label={
          userType === "job_seeker"
            ? "Contact's full name"
            : "Candidate's full name"
        }
        value={formData.targetName}
        onChange={(v) => setField("targetName", v)}
        placeholder={
          userType === "job_seeker" ? "Jenna Williams" : "Alex Rivera"
        }
        required
        error={errors.targetName}
      />
      <TextInput
        label={
          userType === "job_seeker"
            ? "Their job title"
            : "Candidate's current title"
        }
        value={formData.targetTitle}
        onChange={(v) => setField("targetTitle", v)}
        placeholder={
          userType === "job_seeker"
            ? "VP of Content"
            : "Senior Software Engineer"
        }
        required
        error={errors.targetTitle}
      />
      <TextInput
        label={
          userType === "job_seeker"
            ? "Their company"
            : "Candidate's current company"
        }
        value={formData.targetCompany}
        onChange={(v) => setField("targetCompany", v)}
        placeholder={userType === "job_seeker" ? "Bloom" : "Stripe"}
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

function StepContext({
  userType,
  formData,
  setField,
  errors,
}: {
  userType: UserType;
  formData: FormData;
  setField: (key: keyof FormData, val: string) => void;
  errors: Record<string, string>;
}) {
  const outreachOptions = [
    { value: "cold", label: "Cold outreach" },
    { value: "warm", label: "Warm intro" },
    { value: "referral", label: "Referral" },
    { value: "followup", label: "Following up" },
  ];

  const goalOptionsJobSeeker = [
    { value: "coffee_chat", label: "Coffee chat" },
    { value: "job_opportunity", label: "Job opportunity" },
    { value: "explore_role", label: "Explore a role" },
    { value: "network", label: "Networking" },
  ];

  const goalOptionsHiring = [
    { value: "recruit", label: "Recruit for a role" },
    { value: "explore_interest", label: "Gauge interest" },
    { value: "coffee_chat", label: "Coffee chat" },
    { value: "network", label: "Build relationship" },
  ];

  return (
    <div>
      <h2
        className="font-serif text-3xl md:text-4xl font-light mb-2"
        style={{ color: "#e8e4f4" }}
      >
        {userType === "job_seeker" ? "The context" : "The opportunity"}
      </h2>
      <p
        className="font-sans text-base font-light mb-8"
        style={{ color: "#9890ab" }}
      >
        Help us tailor the tone and strategy of your brief.
      </p>

      <RadioGroup
        label="Outreach type"
        options={outreachOptions}
        value={formData.outreachType}
        onChange={(v) => setField("outreachType", v)}
        error={errors.outreachType}
      />

      <RadioGroup
        label="Your goal"
        options={
          userType === "job_seeker" ? goalOptionsJobSeeker : goalOptionsHiring
        }
        value={formData.goal}
        onChange={(v) => setField("goal", v)}
        error={errors.goal}
      />

      {userType === "hiring_manager" && (
        <>
          <TextInput
            label="Role you're hiring for"
            value={formData.roleHiringFor}
            onChange={(v) => setField("roleHiringFor", v)}
            placeholder="Senior Frontend Engineer"
            required
            error={errors.roleHiringFor}
          />
          <TextArea
            label="What makes this role compelling?"
            value={formData.roleCompelling}
            onChange={(v) => setField("roleCompelling", v)}
            placeholder="Why would someone want this role? What's exciting about it?"
            rows={3}
          />
        </>
      )}

      <TextArea
        label="Anything specific to mention? (optional)"
        value={userType === "hiring_manager" ? formData.specificAngle : formData.notes}
        onChange={(v) =>
          setField(
            userType === "hiring_manager" ? "specificAngle" : "notes",
            v
          )
        }
        placeholder={
          userType === "job_seeker"
            ? "A shared connection, a project you admire, a recent company milestone..."
            : "A specific angle or hook to personalize the pitch..."
        }
        rows={3}
      />
    </div>
  );
}

function StepReview({
  userType,
  formData,
  onEdit,
}: {
  userType: UserType;
  formData: FormData;
  onEdit: (step: number) => void;
}) {
  const sections = [
    {
      title: "About You",
      step: 0,
      fields:
        userType === "job_seeker"
          ? [
              { label: "Name", value: formData.senderName },
              { label: "Role", value: formData.senderRole },
              { label: "Background", value: formData.senderBackground },
            ]
          : [
              { label: "Name", value: formData.senderName },
              { label: "Role", value: formData.senderRole },
              { label: "Company", value: formData.senderCompany },
              { label: "Company Description", value: formData.senderCompanyDesc },
              { label: "Background", value: formData.senderBackground },
            ],
    },
    {
      title:
        userType === "job_seeker"
          ? "Reaching Out To"
          : "Candidate",
      step: 1,
      fields: [
        { label: "Name", value: formData.targetName },
        { label: "Title", value: formData.targetTitle },
        { label: "Company", value: formData.targetCompany },
        { label: "LinkedIn", value: formData.targetLinkedIn },
      ],
    },
    {
      title: "Context",
      step: 2,
      fields:
        userType === "job_seeker"
          ? [
              { label: "Outreach Type", value: formData.outreachType },
              { label: "Goal", value: formData.goal },
              { label: "Notes", value: formData.notes },
            ]
          : [
              { label: "Outreach Type", value: formData.outreachType },
              { label: "Goal", value: formData.goal },
              { label: "Role Hiring For", value: formData.roleHiringFor },
              { label: "What Makes It Compelling", value: formData.roleCompelling },
              { label: "Specific Angle", value: formData.specificAngle },
            ],
    },
  ];

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
        Everything look good? You can edit any section before proceeding.
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
                      className="font-sans text-sm shrink-0 w-32"
                      style={{ color: "#9890ab" }}
                    >
                      {field.label}
                    </span>
                    <span
                      className="font-sans text-base"
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

      {/* Price display */}
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
  const totalSteps = 4;

  const setField = (key: keyof FormData, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    /* Clear error on edit */
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.senderName.trim())
        newErrors.senderName = "Name is required";
      if (!formData.senderRole.trim())
        newErrors.senderRole = "Role is required";
      if (userType === "job_seeker" && !formData.senderBackground.trim())
        newErrors.senderBackground = "Background is required";
      if (userType === "hiring_manager" && !formData.senderCompany.trim())
        newErrors.senderCompany = "Company is required";
    }

    if (step === 1) {
      if (!formData.targetName.trim())
        newErrors.targetName = "Name is required";
      if (!formData.targetTitle.trim())
        newErrors.targetTitle = "Title is required";
      if (!formData.targetCompany.trim())
        newErrors.targetCompany = "Company is required";
    }

    if (step === 2) {
      if (!formData.outreachType)
        newErrors.outreachType = "Select an outreach type";
      if (!formData.goal) newErrors.goal = "Select a goal";
      if (userType === "hiring_manager" && !formData.roleHiringFor.trim())
        newErrors.roleHiringFor = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    if (step < totalSteps - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleProceedToPayment = () => {
    /* Phase 5 — Stripe integration */
    alert(
      "Payment integration coming in Phase 5! Your brief data has been captured."
    );
  };

  /* Show user type selection if not chosen */
  if (!userType) {
    return <UserTypeSelection onSelect={setUserType} />;
  }

  const stepTitles = ["About You", "Target", "Context", "Review"];

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

      {/* Step label pills */}
      <div className="max-w-2xl mx-auto mb-10 flex gap-2 overflow-x-auto">
        {stepTitles.map((title, i) => (
          <span
            key={title}
            className="font-mono text-xs uppercase px-3 py-1.5 rounded-full border whitespace-nowrap"
            style={{
              letterSpacing: "0.1em",
              color: i === step ? "#c9a96e" : i < step ? "#9890ab" : "#3d3555",
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
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {step === 0 && (
              <StepAboutYou
                userType={userType}
                formData={formData}
                setField={setField}
                errors={errors}
              />
            )}
            {step === 1 && (
              <StepTarget
                userType={userType}
                formData={formData}
                setField={setField}
                errors={errors}
              />
            )}
            {step === 2 && (
              <StepContext
                userType={userType}
                formData={formData}
                setField={setField}
                errors={errors}
              />
            )}
            {step === 3 && (
              <StepReview
                userType={userType}
                formData={formData}
                onEdit={(s) => setStep(s)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t" style={{ borderColor: "#2a2340" }}>
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

          {step < totalSteps - 1 ? (
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
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
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

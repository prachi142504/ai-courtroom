"use client";

import { useState } from "react";

type CaseData = {
  id: number;
  situation: string;
  legal_issue?: string;
  claimant_arguments?: string[] | string | Record<string, string>;
  respondent_arguments?: string[] | string | Record<string, string>;
  evidence?: string[] | string | Record<string, string>;
  reasoning?: string;
  verdict?: string;
  verdict_explanation?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [situation, setSituation] = useState("");
  const [caseId, setCaseId] = useState<number | null>(null);
  const [caseData, setCaseData] = useState<CaseData | null>(null);

  const [screen, setScreen] = useState<
    "home" | "hearing" | "verdict"
  >("home");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fileCase() {
    if (!situation.trim()) {
      setError("Please describe your situation before filing the case.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/cases/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          situation: situation.trim(),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Could not create the case.");
      }

      const data: CaseData = await response.json();

      setCaseId(data.id);
      setCaseData(data);
      setScreen("hearing");
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the courtroom server. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  async function analyzeCase() {
    if (!caseId) {
      setError("No case ID was found.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/cases/${caseId}/analyze`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "AI analysis failed.");
      }

      const data: CaseData = await response.json();

      setCaseData(data);
      setScreen("verdict");
    } catch (err) {
      console.error(err);

      setError(
        "The AI examination failed. Please check the backend terminal."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetCourtroom() {
    setSituation("");
    setCaseId(null);
    setCaseData(null);
    setError("");
    setLoading(false);
    setScreen("home");
  }

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#242321]">
      {/* Top accent */}
      <div className="h-1 bg-[#711f2d]" />

      {/* Background texture */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(#242321 0.7px, transparent 0.7px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 border-b border-black/10 bg-[#f4f1eb]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <button
            onClick={resetCourtroom}
            className="group flex items-center gap-4 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center border border-[#242321] bg-[#242321] text-[#d6b46a] transition-all duration-300 group-hover:bg-[#711f2d]">
              <span className="font-serif text-lg">AC</span>
            </div>

            <div>
              <p className="font-serif text-lg font-bold tracking-wide">
                AI COURTROOM
              </p>

              <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.28em] text-[#817c73]">
                Digital Justice Laboratory
              </p>
            </div>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#78936c]" />
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#817c73]">
                System Online
              </span>
            </div>

            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#817c73]">
              Experimental Court
            </span>
          </div>
        </div>
      </nav>

      {/* ERROR */}
      {error && (
        <div className="relative z-30 mx-auto mt-6 max-w-4xl px-6">
          <div className="border-l-4 border-[#711f2d] bg-[#711f2d]/8 px-5 py-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#711f2d]">
              System Notice
            </p>

            <p className="mt-1 text-sm text-[#5b5550]">{error}</p>
          </div>
        </div>
      )}

      {/* HOME */}
      {screen === "home" && (
        <HomeScreen
          situation={situation}
          setSituation={setSituation}
          loading={loading}
          onFile={fileCase}
        />
      )}

      {/* HEARING */}
      {screen === "hearing" && (
        <HearingScreen
          caseId={caseId}
          situation={situation}
          loading={loading}
          onAnalyze={analyzeCase}
        />
      )}

      {/* VERDICT */}
      {screen === "verdict" && caseData && (
        <VerdictScreen
          caseData={caseData}
          onReset={resetCourtroom}
        />
      )}

      <footer className="relative z-10 border-t border-black/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 md:flex-row">
          <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-[#817c73]">
            AI COURTROOM · EXPERIMENTAL PROJECT
          </p>

          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#b08d57]">
            AI-Assisted Case Analysis
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   HOME SCREEN
========================================================= */

function HomeScreen({
  situation,
  setSituation,
  loading,
  onFile,
}: {
  situation: string;
  setSituation: (value: string) => void;
  loading: boolean;
  onFile: () => void;
}) {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-10 lg:pt-28">
      <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT */}
        <div className="max-w-2xl">
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-10 bg-[#b08d57]" />

            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.38em] text-[#711f2d]">
              Digital Courtroom · Est. 2026
            </p>
          </div>

          <h1 className="font-serif text-6xl font-bold leading-[0.92] tracking-[-0.04em] sm:text-7xl lg:text-[6.5rem]">
            Your story.
            <br />
            <span className="italic text-[#711f2d]">
              Your case.
            </span>
          </h1>

          <p className="mt-8 max-w-xl font-serif text-lg leading-8 text-[#666159] lg:text-xl">
            Present a real-life situation and let AI examine the
            facts, competing arguments, available evidence and
            produce a structured courtroom-style assessment.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <FeaturePill text="Neutral analysis" />
            <FeaturePill text="Evidence review" />
            <FeaturePill text="Both sides considered" />
          </div>
        </div>

        {/* CASE FORM */}
        <div className="relative">
          <div className="absolute -right-3 -top-3 h-full w-full border border-[#b08d57]/40" />

          <div className="relative border border-black/15 bg-[#fbf9f5] shadow-[14px_14px_0px_rgba(113,31,45,0.10)]">
            {/* Form header */}
            <div className="flex items-start justify-between border-b border-black/10 px-7 py-6 lg:px-9">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#711f2d]">
                  New Case
                </p>

                <h2 className="mt-2 font-serif text-2xl font-bold">
                  Statement of Facts
                </h2>
              </div>

              <div className="text-right">
                <p className="font-mono text-[8px] uppercase tracking-widest text-[#817c73]">
                  CASE SERIES
                </p>

                <p className="mt-1 font-mono text-xs text-[#b08d57]">
                  AC-2026
                </p>
              </div>
            </div>

            {/* Form body */}
            <div className="p-7 lg:p-9">
              <label className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#5f5a52]">
                Describe what happened
              </label>

              <div className="relative mt-3">
                <textarea
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="Example: My brother broke my PlayStation 4 Pro during an argument..."
                  className="min-h-[235px] w-full resize-none border border-black/15 bg-[#f4f1eb] p-5 font-serif text-lg leading-8 text-[#292724] outline-none transition-all duration-300 placeholder:text-[#aaa49a] focus:border-[#b08d57] focus:bg-white focus:shadow-[4px_4px_0px_rgba(176,141,87,0.18)]"
                />

                <div className="absolute bottom-3 right-4 font-mono text-[8px] uppercase tracking-widest text-[#918b82]">
                  {situation.length} characters
                </div>
              </div>

              <div className="mt-5 flex gap-3 border-l-2 border-[#b08d57] bg-[#f4f1eb] px-4 py-3">
                <p className="font-mono text-[8px] uppercase leading-5 tracking-[0.12em] text-[#777169]">
                  Be factual and specific. The AI will only consider
                  information you provide.
                </p>
              </div>

              <div className="mt-7 flex items-center justify-between gap-5">
                <p className="hidden max-w-xs text-[10px] leading-5 text-[#817c73] sm:block">
                  Educational and experimental use only. This
                  assessment does not constitute legal advice.
                </p>

                <button
                  onClick={onFile}
                  disabled={loading}
                  className="group ml-auto flex items-center gap-4 bg-[#711f2d] px-7 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#fbf9f5] transition-all duration-300 hover:-translate-y-1 hover:bg-[#242321] hover:shadow-[6px_6px_0px_#b08d57] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border border-white/40 border-t-white" />
                      Filing
                    </>
                  ) : (
                    <>
                      File My Case
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROCESS */}
      <div className="mt-24 border-y border-black/10">
        <div className="grid md:grid-cols-3">
          <ProcessStep
            number="01"
            title="FILE"
            description="Describe the situation and submit the facts."
          />

          <ProcessStep
            number="02"
            title="EXAMINE"
            description="AI evaluates the available facts, arguments and evidence."
          />

          <ProcessStep
            number="03"
            title="ASSESS"
            description="Receive a structured courtroom-style conclusion."
          />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   HEARING SCREEN
========================================================= */

function HearingScreen({
  caseId,
  situation,
  loading,
  onAnalyze,
}: {
  caseId: number | null;
  situation: string;
  loading: boolean;
  onAnalyze: () => void;
}) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 lg:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <StatusLabel text="Case Successfully Filed" />

        <h1 className="mt-6 font-serif text-5xl font-bold leading-tight md:text-7xl">
          The Court Has
          <br />
          <span className="italic text-[#711f2d]">
            Received Your Statement
          </span>
        </h1>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-[#817c73]">
          CASE AC-{caseId?.toString().padStart(4, "0")}
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-4xl">
        <div className="relative border border-black/15 bg-[#fbf9f5] shadow-[12px_12px_0px_rgba(113,31,45,0.10)]">
          <div className="flex items-center justify-between border-b border-black/10 px-7 py-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-[#711f2d]">
              Statement Entered Into Record
            </p>

            <span className="font-mono text-[9px] text-[#b08d57]">
              #{caseId}
            </span>
          </div>

          <div className="p-8 lg:p-12">
            <blockquote className="border-l-2 border-[#b08d57] pl-6 font-serif text-2xl leading-10 text-[#403d38]">
              “{situation}”
            </blockquote>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-2xl">
        {loading ? (
          <ExaminationLoader />
        ) : (
          <div className="border border-black/10 bg-[#242321] px-8 py-12 text-center text-[#f4f1eb]">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-[#d6b46a]">
              Examination Ready
            </p>

            <h2 className="mt-4 font-serif text-3xl">
              The court is ready to examine the case.
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#aaa69e]">
              The AI will review the submitted facts and generate
              a neutral assessment.
            </p>

            <button
              onClick={onAnalyze}
              className="mt-8 bg-[#711f2d] px-8 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#8a2939] hover:shadow-[6px_6px_0px_#b08d57]"
            >
              Begin AI Examination
              <span className="ml-4">→</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   VERDICT SCREEN
========================================================= */

function VerdictScreen({
  caseData,
  onReset,
}: {
  caseData: CaseData;
  onReset: () => void;
}) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 lg:px-10">
      <div className="mx-auto max-w-4xl text-center">
        <StatusLabel text="Judgment Record" />

        <h1 className="mt-6 font-serif text-5xl font-bold leading-tight md:text-7xl">
          The Court Has
          <br />
          <span className="italic text-[#711f2d]">
            Considered The Evidence
          </span>
        </h1>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-[#817c73]">
          CASE AC-{caseData.id.toString().padStart(4, "0")}
        </p>
      </div>

      <div className="mx-auto mt-14 max-w-5xl">
        {/* VERDICT */}
        <div className="relative border-2 border-[#b08d57] bg-[#fbf9f5] p-2 shadow-[14px_14px_0px_rgba(113,31,45,0.13)]">
          <div className="border border-black/10 px-7 py-10 text-center md:px-12 md:py-14">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-[#817c73]">
              AI ASSESSMENT
            </p>

            <div className="mx-auto mt-7 max-w-4xl border-y border-[#b08d57]/50 py-9">
              <p className="font-serif text-2xl font-bold leading-relaxed text-[#711f2d] md:text-4xl">
                {caseData.verdict || "The case remains inconclusive."}
              </p>
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-xs leading-6 text-[#817c73]">
              This is an AI-generated educational assessment,
              not an official legal judgment.
            </p>
          </div>
        </div>

        {/* MAIN ANALYSIS */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <AnalysisCard
            title="Legal Issue"
            content={caseData.legal_issue}
          />

          <AnalysisCard
            title="AI Reasoning"
            content={caseData.reasoning}
          />
        </div>

        {/* WHY */}
        <div className="mt-6">
          <AnalysisCard
            title="Why This Verdict?"
            content={
              caseData.verdict_explanation ||
              "No additional explanation was provided."
            }
          />
        </div>

        {/* ARGUMENTS */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <ListCard
            title="Claimant Arguments"
            items={caseData.claimant_arguments}
          />

          <ListCard
            title="Respondent Arguments"
            items={caseData.respondent_arguments}
          />
        </div>

        {/* EVIDENCE */}
        <div className="mt-6">
          <ListCard
            title="Evidence Considered"
            items={caseData.evidence}
          />
        </div>

        {/* ACTIONS */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={onReset}
            className="border border-[#242321] px-8 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-1 hover:bg-[#242321] hover:text-white"
          >
            File Another Case
          </button>

          <button
            onClick={() =>
              navigator.clipboard?.writeText(
                `AI Courtroom Case #${caseData.id}\n\n${caseData.verdict}`
              )
            }
            className="border border-[#b08d57] px-8 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#711f2d] transition-all duration-300 hover:-translate-y-1 hover:bg-[#b08d57] hover:text-[#242321]"
          >
            Copy Judgment
          </button>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center font-mono text-[8px] uppercase leading-5 tracking-[0.15em] text-[#817c73]">
          AI COURTROOM IS AN EXPERIMENTAL EDUCATIONAL PROJECT.
          RESULTS SHOULD NOT BE CONSIDERED LEGAL ADVICE.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatusLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-px w-8 bg-[#b08d57]" />

      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.38em] text-[#711f2d]">
        {text}
      </p>

      <span className="h-px w-8 bg-[#b08d57]" />
    </div>
  );
}

function FeaturePill({ text }: { text: string }) {
  return (
    <span className="border border-black/10 bg-[#fbf9f5] px-4 py-2 font-mono text-[8px] uppercase tracking-[0.14em] text-[#706b63]">
      {text}
    </span>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group border-b border-black/10 p-7 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 lg:p-9">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold text-[#b08d57]">
          {number}
        </span>

        <span className="font-mono text-[8px] uppercase tracking-widest text-[#a09a90]">
          STEP
        </span>
      </div>

      <h3 className="mt-8 font-serif text-2xl font-bold transition-colors group-hover:text-[#711f2d]">
        {title}
      </h3>

      <p className="mt-3 max-w-xs text-sm leading-6 text-[#817c73]">
        {description}
      </p>
    </div>
  );
}

function ExaminationLoader() {
  return (
    <div className="relative overflow-hidden border border-[#b08d57]/40 bg-[#242321] px-8 py-14 text-center text-[#f4f1eb]">
      <div className="absolute left-0 top-0 h-px w-full overflow-hidden bg-white/10">
        <div className="h-full w-1/3 animate-[loadingBar_1.8s_ease-in-out_infinite] bg-[#d6b46a]" />
      </div>

      <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#d6b46a]/50">
        <div className="h-6 w-6 animate-spin border-2 border-[#d6b46a]/20 border-t-[#d6b46a]" />
      </div>

      <p className="mt-7 font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-[#d6b46a]">
        AI Examination In Session
      </p>

      <h2 className="mt-4 font-serif text-3xl">
        Examining the case...
      </h2>

      <p className="mt-3 text-sm text-[#aaa69e]">
        Reviewing arguments, evidence and reasoning.
      </p>

      <div className="mx-auto mt-8 flex max-w-sm justify-center gap-2">
        <span className="h-1 w-1 animate-pulse rounded-full bg-[#d6b46a]" />
        <span className="h-1 w-1 animate-pulse rounded-full bg-[#d6b46a] [animation-delay:200ms]" />
        <span className="h-1 w-1 animate-pulse rounded-full bg-[#d6b46a] [animation-delay:400ms]" />
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% {
            transform: translateX(-150%);
          }

          50% {
            transform: translateX(150%);
          }

          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
}

function AnalysisCard({
  title,
  content,
}: {
  title: string;
  content?: string;
}) {
  return (
    <div className="group border border-black/10 bg-[#e9e3d8] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_5px_0px_rgba(176,141,87,0.25)]">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#711f2d]">
          {title}
        </p>

        <span className="h-1.5 w-1.5 rounded-full bg-[#b08d57]" />
      </div>

      <p className="mt-5 text-sm leading-7 text-[#4d4942]">
        {content || "No information available."}
      </p>
    </div>
  );
}

function ListCard({
  title,
  items,
}: {
  title: string;
  items:
    | string[]
    | string
    | Record<string, string>
    | null
    | undefined;
}) {
  const normalizedItems = normalizeItems(items);

  return (
    <div className="border border-black/10 bg-[#fbf9f5] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[5px_5px_0px_rgba(113,31,45,0.10)]">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#711f2d]">
          {title}
        </p>

        <span className="font-mono text-[8px] text-[#b08d57]">
          {normalizedItems.length.toString().padStart(2, "0")}
        </span>
      </div>

      <div className="mt-6">
        {normalizedItems.length > 0 ? (
          normalizedItems.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex gap-4 border-b border-black/10 py-4 first:pt-0 last:border-0 last:pb-0"
            >
              <span className="shrink-0 font-mono text-[10px] font-bold text-[#b08d57]">
                {String(index + 1).padStart(2, "0")}
              </span>

              <p className="text-sm leading-6 text-[#4d4942]">
                {item}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#817c73]">
            No information available.
          </p>
        )}
      </div>
    </div>
  );
}

function normalizeItems(
  value:
    | string[]
    | string
    | Record<string, string>
    | null
    | undefined
): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => parseValue(item));
  }

  if (typeof value === "object") {
    return Object.values(value).flatMap((item) =>
      parseValue(item)
    );
  }

  return parseValue(value);
}

function parseValue(value: unknown): string[] {
  if (typeof value !== "string") {
    return [String(value)];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }

    if (parsed && typeof parsed === "object") {
      return Object.values(parsed).map(String);
    }

    return [String(parsed)];
  } catch {
    return [value];
  }
}
"use client";

import { useEffect, useMemo, useState } from "react";

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

type Screen = "home" | "examine" | "verdict";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function Home() {
  const [situation, setSituation] = useState("");
  const [caseId, setCaseId] = useState<number | null>(null);
  const [caseData, setCaseData] = useState<CaseData | null>(null);

  const [screen, setScreen] = useState<Screen>("home");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fileCase() {
    if (!situation.trim()) {
      setError("Describe the situation before beginning the case.");
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
        throw new Error(message || "Unable to create case.");
      }

      const data: CaseData = await response.json();

      setCaseId(data.id);
      setCaseData(data);
      setScreen("examine");
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
        throw new Error(message || "AI examination failed.");
      }

      const data: CaseData = await response.json();

      setCaseData(data);
      setScreen("verdict");
    } catch (err) {
      console.error(err);
      setError(
        "The AI examination failed. Check the backend terminal for details."
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
    <main className="min-h-screen overflow-x-hidden bg-[#08090b] text-[#f4f1e8] selection:bg-[#d7a84b] selection:text-black">
      <Background />

      <Header
        caseId={caseId}
        screen={screen}
        onHome={resetCourtroom}
      />

      <ProgressBar screen={screen} />

      {error && <ErrorNotice message={error} />}

      {screen === "home" && (
        <HomeScreen
          situation={situation}
          setSituation={setSituation}
          loading={loading}
          onFile={fileCase}
        />
      )}

      {screen === "examine" && (
        <ExaminationScreen
          caseId={caseId}
          situation={situation}
          loading={loading}
          onAnalyze={analyzeCase}
          onBack={resetCourtroom}
        />
      )}

      {screen === "verdict" && caseData && (
        <VerdictScreen
          caseData={caseData}
          onReset={resetCourtroom}
        />
      )}

      <Footer />
    </main>
  );
}

/* =========================================================
   BACKGROUND
========================================================= */

function Background() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-[-20rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[#d7a84b]/[0.035] blur-[120px]" />

        <div className="absolute right-[-15rem] top-[30%] h-[30rem] w-[30rem] rounded-full bg-[#7c2533]/[0.06] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,.4)_100%)]" />
      </div>
    </>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({
  caseId,
  screen,
  onHome,
}: {
  caseId: number | null;
  screen: Screen;
  onHome: () => void;
}) {
  return (
    <header className="relative z-20 border-b border-white/[0.08] bg-[#08090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <button
          onClick={onHome}
          className="group flex items-center gap-3 text-left"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#d7a84b]/30 bg-[#111318]">
            <div className="absolute inset-0 bg-[#d7a84b]/10 opacity-0 transition-opacity group-hover:opacity-100" />

            <span className="relative font-mono text-[11px] font-bold tracking-tight text-[#d7a84b]">
              AC
            </span>
          </div>

          <div>
            <div className="font-mono text-[12px] font-bold tracking-[0.22em]">
              AI COURTROOM
            </div>

            <div className="mt-0.5 hidden font-mono text-[8px] uppercase tracking-[0.25em] text-[#6f737c] sm:block">
              Intelligent Case Analysis
            </div>
          </div>
        </button>

        <div className="flex items-center gap-4">
          {caseId && (
            <div className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-[#686c74] sm:block">
              CASE{" "}
              <span className="text-[#d7a84b]">
                #{caseId.toString().padStart(4, "0")}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-emerald-300/80">
              {screen === "examine" ? "Analysis Active" : "System Online"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressBar({ screen }: { screen: Screen }) {
  const active =
    screen === "home" ? 1 : screen === "examine" ? 2 : 3;

  return (
    <div className="relative z-10 border-b border-white/[0.06]">
      <div className="mx-auto flex max-w-7xl items-center px-5 sm:px-8 lg:px-10">
        {[
          ["01", "FILE"],
          ["02", "EXAMINE"],
          ["03", "ASSESS"],
        ].map(([number, label], index) => {
          const step = index + 1;
          const completed = step < active;
          const current = step === active;

          return (
            <div
              key={label}
              className="flex flex-1 items-center"
            >
              <div
                className={`flex items-center gap-2 py-3 pr-5 font-mono text-[8px] uppercase tracking-[0.2em] transition-colors ${
                  current || completed
                    ? "text-[#d7a84b]"
                    : "text-[#4e5259]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    current
                      ? "border-[#d7a84b] bg-[#d7a84b]/10"
                      : completed
                        ? "border-[#d7a84b]/40 bg-[#d7a84b]/5"
                        : "border-white/10"
                  }`}
                >
                  {completed ? "✓" : number}
                </span>

                <span className="hidden sm:inline">{label}</span>
              </div>

              {index < 2 && (
                <div
                  className={`h-px flex-1 ${
                    completed
                      ? "bg-[#d7a84b]/30"
                      : "bg-white/[0.06]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="relative z-30 mx-auto max-w-5xl px-5 pt-6 sm:px-8">
      <div className="flex gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.05] p-4">
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-400/40 font-mono text-[9px] text-red-300">
          !
        </div>

        <div>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-red-300">
            System Notice
          </p>

          <p className="mt-1 text-sm text-[#a4a6ab]">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HOME
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
    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 lg:px-10 lg:pb-32 lg:pt-24">
      <div className="grid items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Hero */}

        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d7a84b]" />

            <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-[#777b83]">
              AI-Powered Legal Analysis · 2026
            </span>
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.045em] text-[#f4f1e8] sm:text-6xl lg:text-[5.5rem]">
            Turn your story
            <br />
            into a{" "}
            <span className="text-[#d7a84b]">
              case.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-7 text-[#858991] sm:text-lg">
            Describe a real-life dispute. AI will examine the
            facts, separate the competing positions, identify
            available evidence and produce a structured
            courtroom-style assessment.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            <MiniFeature
              number="01"
              title="Facts"
              description="Your story"
            />

            <MiniFeature
              number="02"
              title="Evidence"
              description="What supports it"
            />

            <MiniFeature
              number="03"
              title="Assessment"
              description="AI conclusion"
            />
          </div>
        </div>

        {/* Case composer */}

        <CaseComposer
          situation={situation}
          setSituation={setSituation}
          loading={loading}
          onFile={onFile}
        />
      </div>

      <div className="mt-20 border-t border-white/[0.07] pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#50545b]">
            Experimental intelligence system
          </p>

          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#50545b]">
            Educational use only · Not legal advice
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MINI FEATURE
========================================================= */

function MiniFeature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-all hover:border-[#d7a84b]/20 hover:bg-[#d7a84b]/[0.025]">
      <div className="font-mono text-[8px] text-[#d7a84b]">
        {number}
      </div>

      <div className="mt-5 text-sm font-medium text-[#ddd9cf]">
        {title}
      </div>

      <div className="mt-1 text-[10px] leading-4 text-[#666a72]">
        {description}
      </div>
    </div>
  );
}

/* =========================================================
   CASE COMPOSER
========================================================= */

function CaseComposer({
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
    <div className="relative">
      <div className="absolute -inset-3 rounded-[2rem] bg-[#d7a84b]/[0.025] blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111318]/95 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d7a84b]/25 bg-[#d7a84b]/[0.05]">
              <span className="font-mono text-[9px] text-[#d7a84b]">
                +
              </span>
            </div>

            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#d5d2ca]">
                New Case
              </p>

              <p className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.18em] text-[#555960]">
                Case intake terminal
              </p>
            </div>
          </div>

          <div className="font-mono text-[8px] text-[#555960]">
            AC-2026
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <label className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#777b83]">
            Statement of facts
          </label>

          <div className="relative mt-4">
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              maxLength={5000}
              placeholder="Tell us what happened..."
              className="min-h-[280px] w-full resize-none rounded-xl border border-white/[0.08] bg-[#08090b] p-5 pb-12 text-[15px] leading-7 text-[#e5e1d8] outline-none placeholder:text-[#4e5259] transition-all focus:border-[#d7a84b]/40 focus:bg-[#0a0b0e] focus:ring-1 focus:ring-[#d7a84b]/10"
            />

            <div className="absolute bottom-4 right-4 font-mono text-[8px] tracking-wider text-[#50545b]">
              {situation.length.toString().padStart(4, "0")} / 5000
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span className="mt-0.5 text-[#d7a84b]">i</span>

            <p className="text-[10px] leading-5 text-[#666a72]">
              Give the system factual details. AI only considers
              information submitted with this case and does not
              independently verify your claims.
            </p>
          </div>

          <button
            onClick={onFile}
            disabled={loading}
            className="group mt-5 flex w-full items-center justify-between rounded-xl border border-[#d7a84b]/30 bg-[#d7a84b] px-5 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#08090b] transition-all hover:bg-[#e5bb61] hover:shadow-[0_0_30px_rgba(215,168,75,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>
              {loading ? "Opening case..." : "Begin case analysis"}
            </span>

            <span className="text-lg transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EXAMINATION
========================================================= */

function ExaminationScreen({
  caseId,
  situation,
  loading,
  onAnalyze,
  onBack,
}: {
  caseId: number | null;
  situation: string;
  loading: boolean;
  onAnalyze: () => void;
  onBack: () => void;
}) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-14 sm:px-8 lg:px-10 lg:pt-20">
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        {/* Left status */}

        <div className="rounded-2xl border border-white/[0.08] bg-[#111318]/80 p-7">
          <div className="flex items-center justify-between">
            <StatusTag text="Case received" />

            <span className="font-mono text-[8px] text-[#555960]">
              #{caseId?.toString().padStart(4, "0")}
            </span>
          </div>

          <h1 className="mt-10 text-4xl font-semibold tracking-[-0.04em] text-[#f4f1e8] sm:text-5xl">
            Ready for
            <br />
            <span className="text-[#d7a84b]">
              examination.
            </span>
          </h1>

          <p className="mt-6 text-sm leading-6 text-[#777b83]">
            Your statement has been entered into the case
            record. The analysis engine will examine the
            available facts, arguments and evidence.
          </p>

          <div className="mt-10 space-y-3">
            <AnalysisStage
              number="01"
              title="Facts"
              status="ready"
            />

            <AnalysisStage
              number="02"
              title="Arguments"
              status="ready"
            />

            <AnalysisStage
              number="03"
              title="Evidence"
              status="ready"
            />

            <AnalysisStage
              number="04"
              title="Assessment"
              status="pending"
            />
          </div>

          <button
            onClick={onBack}
            className="mt-10 font-mono text-[8px] uppercase tracking-[0.18em] text-[#555960] transition-colors hover:text-[#d7a84b]"
          >
            ← Cancel and return
          </button>
        </div>

        {/* Right analysis */}

        <div className="rounded-2xl border border-white/[0.08] bg-[#0d0f12]">
          <div className="border-b border-white/[0.07] px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[#d7a84b]">
                Statement on record
              </p>

              <span className="font-mono text-[8px] uppercase tracking-wider text-[#555960]">
                SEC. 01
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <blockquote className="border-l border-[#d7a84b]/40 pl-5 text-lg leading-8 text-[#b9b6ae] sm:text-xl">
              “{situation}”
            </blockquote>

            <div className="mt-10 border-t border-white/[0.06] pt-7">
              {loading ? (
                <ActiveExamination />
              ) : (
                <ReadyForExamination onAnalyze={onAnalyze} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusTag({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

      <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-emerald-300/80">
        {text}
      </span>
    </div>
  );
}

function AnalysisStage({
  number,
  title,
  status,
}: {
  number: string;
  title: string;
  status: "ready" | "pending";
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-3">
      <span
        className={`font-mono text-[8px] ${
          status === "ready"
            ? "text-[#d7a84b]"
            : "text-[#50545b]"
        }`}
      >
        {number}
      </span>

      <span className="flex-1 text-xs text-[#aaaeb5]">
        {title}
      </span>

      <span
        className={`font-mono text-[7px] uppercase tracking-wider ${
          status === "ready"
            ? "text-emerald-400/70"
            : "text-[#50545b]"
        }`}
      >
        {status === "ready" ? "Ready" : "Pending"}
      </span>
    </div>
  );
}

function ReadyForExamination({
  onAnalyze,
}: {
  onAnalyze: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#d7a84b]/25 bg-[#d7a84b]/[0.04]">
          <span className="absolute inset-2 animate-ping rounded-full border border-[#d7a84b]/10" />

          <span className="relative h-2 w-2 rounded-full bg-[#d7a84b] shadow-[0_0_18px_rgba(215,168,75,.5)]" />
        </div>

        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#d7a84b]">
            Examination ready
          </p>

          <p className="mt-1 text-sm text-[#737780]">
            Analysis engine is standing by.
          </p>
        </div>
      </div>

      <button
        onClick={onAnalyze}
        className="group mt-8 flex w-full items-center justify-between rounded-xl border border-[#d7a84b]/30 bg-[#d7a84b] px-5 py-4 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#08090b] transition-all hover:bg-[#e5bb61] hover:shadow-[0_0_30px_rgba(215,168,75,0.12)]"
      >
        <span>Run AI examination</span>

        <span className="text-lg transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
}

function ActiveExamination() {
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#d7a84b]/30">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d7a84b]/15 border-t-[#d7a84b]" />
        </div>

        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#d7a84b]">
            Examination in progress
          </p>

          <p className="mt-1 text-sm text-[#737780]">
            Reviewing facts, arguments and evidence...
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <LoadingLine text="Parsing statement" />
        <LoadingLine text="Identifying competing positions" />
        <LoadingLine text="Evaluating available evidence" />
        <LoadingLine text="Generating assessment" />
      </div>

      <div className="mt-8 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div className="h-full w-1/3 animate-[scan_2s_ease-in-out_infinite] rounded-full bg-[#d7a84b]" />
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateX(-120%);
          }
          50% {
            transform: translateX(200%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>
    </div>
  );
}

function LoadingLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#d7a84b]" />

      <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#676b73]">
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   VERDICT
========================================================= */

function VerdictScreen({
  caseData,
  onReset,
}: {
  caseData: CaseData;
  onReset: () => void;
}) {
  const evidence = normalizeItems(caseData.evidence);
  const claimant = normalizeItems(caseData.claimant_arguments);
  const respondent = normalizeItems(caseData.respondent_arguments);

  const evidenceScore = calculateEvidenceScore(
    evidence,
    claimant,
    respondent,
    caseData.verdict
  );

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 lg:px-10 lg:pt-20">
      {/* Verdict hero */}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-[#d7a84b]/20 bg-[#111318]/90 p-7 shadow-2xl shadow-black/30 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusTag text="Final assessment" />

            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#555960]">
              CASE #{caseData.id.toString().padStart(4, "0")}
            </span>
          </div>

          <div className="mt-12">
            <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#6d7179]">
              AI VERDICT
            </p>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#f4f1e8] sm:text-5xl lg:text-6xl">
              {caseData.verdict ||
                "The case remains inconclusive."}
            </h1>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <VerdictBadge
              label="Assessment basis"
              value={
                evidence.length > 0
                  ? "Available evidence"
                  : "Limited information"
              }
            />

            <VerdictBadge
              label="Case status"
              value="AI assessed"
            />
          </div>

          <p className="mt-8 max-w-2xl text-xs leading-6 text-[#656971]">
            This is an AI-generated educational assessment,
            not an official legal judgment or legal advice.
          </p>
        </div>

        <EvidenceMeter score={evidenceScore} />
      </div>

      {/* Main analysis */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DarkAnalysisCard
          number="01"
          title="Legal Issue"
          content={caseData.legal_issue}
        />

        <DarkAnalysisCard
          number="02"
          title="AI Reasoning"
          content={caseData.reasoning}
        />
      </div>

      <div className="mt-6">
        <DarkAnalysisCard
          number="03"
          title="Why This Assessment?"
          content={
            caseData.verdict_explanation ||
            "No additional explanation was provided."
          }
        />
      </div>

      {/* Arguments */}

      <div className="mt-14">
        <SectionHeading
          eyebrow="Case analysis"
          title="Two sides of the record"
          description="The system separates submitted information into competing positions rather than treating one account as automatically correct."
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ArgumentPanel
            type="Claimant"
            description="Arguments supporting the claim"
            items={claimant}
            accent="gold"
          />

          <ArgumentPanel
            type="Respondent"
            description="Arguments opposing or qualifying the claim"
            items={respondent}
            accent="red"
          />
        </div>
      </div>

      {/* Evidence */}

      <div className="mt-14">
        <SectionHeading
          eyebrow="Evidence"
          title="What the AI considered"
          description="Information identified as relevant to the assessment."
        />

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111318]">
          {evidence.length > 0 ? (
            evidence.map((item, index) => (
              <EvidenceRow
                key={`evidence-${index}`}
                index={index}
                text={item}
              />
            ))
          ) : (
            <div className="p-8 text-sm text-[#656971]">
              No supporting evidence was provided.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}

      <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.07] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onReset}
          className="rounded-xl border border-white/[0.1] bg-white/[0.02] px-6 py-3.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#b1b3b8] transition-all hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
        >
          ← File another case
        </button>

        <button
          onClick={() => {
            const report = [
              "AI COURTROOM",
              `Case #${caseData.id}`,
              "",
              "AI VERDICT",
              caseData.verdict || "Inconclusive",
              "",
              "LEGAL ISSUE",
              caseData.legal_issue || "Not provided.",
              "",
              "AI REASONING",
              caseData.reasoning || "Not provided.",
              "",
              "EVIDENCE",
              ...evidence.map((item, index) => `${index + 1}. ${item}`),
            ].join("\n");

            navigator.clipboard?.writeText(report);
          }}
          className="group rounded-xl border border-[#d7a84b]/25 bg-[#d7a84b]/[0.05] px-6 py-3.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[#d7a84b] transition-all hover:bg-[#d7a84b] hover:text-[#08090b]"
        >
          Copy assessment
          <span className="ml-3 transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>

      <p className="mt-10 text-center font-mono text-[7px] uppercase leading-5 tracking-[0.18em] text-[#454950]">
        AI COURTROOM · EXPERIMENTAL EDUCATIONAL PROJECT ·
        RESULTS SHOULD NOT BE CONSIDERED LEGAL ADVICE
      </p>
    </section>
  );
}

/* =========================================================
   VERDICT COMPONENTS
========================================================= */

function VerdictBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3">
      <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-[#50545b]">
        {label}
      </p>

      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#a9abb0]">
        {value}
      </p>
    </div>
  );
}

function EvidenceMeter({ score }: { score: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d0f12] p-7 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#666a72]">
            Evidence strength
          </p>

          <p className="mt-2 text-sm text-[#8b8e95]">
            Based only on submitted information
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d7a84b]/20 bg-[#d7a84b]/[0.04]">
          <span className="font-mono text-[9px] text-[#d7a84b]">
            AI
          </span>
        </div>
      </div>

      <div className="mt-12 flex items-end gap-3">
        <span className="text-7xl font-semibold tracking-[-0.06em] text-[#f4f1e8]">
          {score}
        </span>

        <span className="mb-2 font-mono text-sm text-[#555960]">
          / 100
        </span>
      </div>

      <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-[#d7a84b] transition-all duration-1000"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between font-mono text-[7px] uppercase tracking-[0.16em] text-[#4f535a]">
        <span>Insufficient</span>
        <span>Moderate</span>
        <span>Strong</span>
      </div>

      <div className="mt-8 border-t border-white/[0.06] pt-5">
        <p className="text-[10px] leading-5 text-[#5f636a]">
          This indicator reflects the amount and quality of
          information available to the AI. It is not a legal
          probability of winning.
        </p>
      </div>
    </div>
  );
}

function DarkAnalysisCard({
  number,
  title,
  content,
}: {
  number: string;
  title: string;
  content?: string;
}) {
  return (
    <article className="group rounded-2xl border border-white/[0.08] bg-[#111318] p-7 transition-all duration-300 hover:border-[#d7a84b]/15 hover:bg-[#13151a] sm:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[8px] text-[#d7a84b]">
            {number}
          </span>

          <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-[#777b83]">
            {title}
          </span>
        </div>

        <span className="h-1.5 w-1.5 rounded-full bg-[#d7a84b]/60" />
      </div>

      <p className="mt-7 text-sm leading-7 text-[#a3a6ad]">
        {content || "No information available."}
      </p>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-[#d7a84b]">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#eeeae0]">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-[#656971]">
        {description}
      </p>
    </div>
  );
}

function ArgumentPanel({
  type,
  description,
  items,
  accent,
}: {
  type: string;
  description: string;
  items: string[];
  accent: "gold" | "red";
}) {
  const accentClass =
    accent === "gold"
      ? "text-[#d7a84b] border-[#d7a84b]/20"
      : "text-[#c96a72] border-[#c96a72]/20";

  return (
    <div className={`overflow-hidden rounded-2xl border bg-[#111318] ${accentClass}`}>
      <div className="border-b border-white/[0.06] px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-mono text-[9px] font-bold uppercase tracking-[0.22em] ${accent === "gold" ? "text-[#d7a84b]" : "text-[#c96a72]"}`}>
              {type}
            </p>

            <p className="mt-1 text-xs text-[#5f636a]">
              {description}
            </p>
          </div>

          <span className="font-mono text-[9px] text-[#50545b]">
            {items.length.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <div>
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${type}-${index}`}
              className="flex gap-4 border-b border-white/[0.05] px-6 py-5 last:border-0"
            >
              <span className="shrink-0 font-mono text-[8px] text-[#50545b]">
                {String(index + 1).padStart(2, "0")}
              </span>

              <p className="text-sm leading-6 text-[#9b9ea5]">
                {item}
              </p>
            </div>
          ))
        ) : (
          <div className="px-6 py-7 text-sm text-[#5f636a]">
            No information provided.
          </div>
        )}
      </div>
    </div>
  );
}

function EvidenceRow({
  index,
  text,
}: {
  index: number;
  text: string;
}) {
  return (
    <div className="group flex items-start gap-5 border-b border-white/[0.05] px-6 py-5 last:border-0 sm:px-7">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#d7a84b]/15 bg-[#d7a84b]/[0.03]">
        <span className="font-mono text-[8px] text-[#d7a84b]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="flex-1">
        <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-[#50545b]">
          Supporting information
        </p>

        <p className="mt-2 text-sm leading-6 text-[#9da0a7]">
          {text}
        </p>
      </div>

      <span className="mt-1 hidden h-1.5 w-1.5 rounded-full bg-emerald-400/70 sm:block" />
    </div>
  );
}

/* =========================================================
   FOOTER
========================================================= */

function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p className="font-mono text-[7px] uppercase tracking-[0.2em] text-[#454950]">
          AI COURTROOM · INTELLIGENT CASE ANALYSIS
        </p>

        <p className="font-mono text-[7px] uppercase tracking-[0.2em] text-[#454950]">
          Experimental system · 2026
        </p>
      </div>
    </footer>
  );
}

/* =========================================================
   HELPERS
========================================================= */

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

function calculateEvidenceScore(
  evidence: string[],
  claimant: string[],
  respondent: string[],
  verdict?: string
) {
  let score = 25;

  score += Math.min(evidence.length * 12, 35);
  score += Math.min(claimant.length * 5, 15);
  score += Math.min(respondent.length * 3, 10);

  if (verdict) {
    const lower = verdict.toLowerCase();

    if (
      lower.includes("stronger case") ||
      lower.includes("liable") ||
      lower.includes("responsible")
    ) {
      score += 10;
    }

    if (
      lower.includes("inconclusive") ||
      lower.includes("insufficient")
    ) {
      score -= 10;
    }
  }

  return Math.max(10, Math.min(100, score));
}
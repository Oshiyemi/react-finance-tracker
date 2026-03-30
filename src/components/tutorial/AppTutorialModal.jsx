import { useEffect, useState } from "react";
import { CircleHelp, CircleSlash2 } from "lucide-react";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useAuthStore } from "@/state/useAuthStore";
import {
  completeTutorial,
  dismissTutorial,
  loadTutorialState,
  saveTutorialState,
} from "@/services/storage";

const TUTORIAL_OPEN_EVENT = "fintrack:tutorial-open";

const slides = [
  {
    title: "Welcome to FinTrack Wealth",
    body: "Track spending, budgets, and monthly progress in one local-first finance workspace.",
  },
  {
    title: "Dashboard at a glance",
    body: "Start on Dashboard for this month's totals, budget status, and your latest transactions.",
  },
  {
    title: "Transactions",
    body: "Add income and expenses quickly, then filter by type, month, and category to review activity.",
  },
  {
    title: "Budgets",
    body: "Set monthly category limits and monitor remaining spend or over-budget alerts in real time.",
  },
  {
    title: "Analytics",
    body: "Use trends and category charts to spot spending patterns and savings performance over time.",
  },
  {
    title: "Guest vs account",
    body: "Guest and account workspaces stay separate on this device. Guest mode becomes read-only after trial expiry.",
  },
  {
    title: "Settings and privacy",
    body: "Export your workspace, manage theme, clear local data, and reopen this tutorial anytime from Settings.",
  },
];

export { TUTORIAL_OPEN_EVENT };

export default function AppTutorialModal() {
  const { hasSession, isReady } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [tutorialState, setTutorialState] = useState(loadTutorialState);

  useEffect(() => {
    function handleOpenRequest() {
      setActiveIndex(0);
      setIsOpen(true);
      setTutorialState(saveTutorialState({ lastOpenedAt: new Date().toISOString() }));
    }

    window.addEventListener(TUTORIAL_OPEN_EVENT, handleOpenRequest);

    return () => {
      window.removeEventListener(TUTORIAL_OPEN_EVENT, handleOpenRequest);
    };
  }, []);

  useEffect(() => {
    if (!isReady || !hasSession || hasAutoOpened) {
      return;
    }

    if (tutorialState.dismissed || tutorialState.completed) {
      setHasAutoOpened(true);
      return;
    }

    setActiveIndex(0);
    setIsOpen(true);
    setHasAutoOpened(true);
    setTutorialState(saveTutorialState({ lastOpenedAt: new Date().toISOString() }));
  }, [hasAutoOpened, hasSession, isReady, tutorialState.completed, tutorialState.dismissed]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => Math.max(current - 1, 0));
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => Math.min(current + 1, slides.length - 1));
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const isLastSlide = activeIndex === slides.length - 1;
  const currentSlide = slides[activeIndex];

  function closeAndPersistDismissal() {
    setIsOpen(false);
    setActiveIndex(0);
    setTutorialState(dismissTutorial());
  }

  function handleFinish() {
    setIsOpen(false);
    setActiveIndex(0);
    setTutorialState(completeTutorial());
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeAndPersistDismissal}
      title="Quick product tour"
      description="7 short steps to learn the app"
      width="max-w-xl"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={closeAndPersistDismissal}>
            <CircleSlash2 className="h-4 w-4" />
            Skip
          </Button>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((current) => Math.max(current - 1, 0))}
            >
              Back
            </Button>
            {isLastSlide ? (
              <Button onClick={handleFinish}>Finish</Button>
            ) : (
              <Button onClick={() => setActiveIndex((current) => current + 1)}>Next</Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            <CircleHelp className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
              Step {activeIndex + 1} of {slides.length}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
              {currentSlide.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{currentSlide.body}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${((activeIndex + 1) / slides.length) * 100}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Tutorial progress markers">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                className={`h-2 w-8 rounded-full transition ${
                  index === activeIndex
                    ? "bg-emerald-500"
                    : "bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
                }`}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                aria-current={index === activeIndex ? "step" : undefined}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}


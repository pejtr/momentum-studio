import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Workflow,
  Users,
  Store,
  CheckCircle2,
  ArrowRight,
  Settings,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  action: string;
  path: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Vítejte v OMNIMATRIX",
    description:
      "Váš QA automation cockpit je připraven. Projděte si v několika krocích klíčové možnosti systému, nebo prohlídku kdykoli přeskočte.",
    icon: Settings,
    action: "Zahájit prohlídku",
    path: "/",
  },
  {
    id: "script",
    title: "Vytvořte první skript",
    description:
      "Sestavte automatizační workflow pomocí vizuálního editoru metodou drag-and-drop. Bez nutnosti psát kód.",
    icon: Workflow,
    action: "Vytvořit skript",
    path: "/scripts",
  },
  {
    id: "profile",
    title: "Nastavte profil",
    description:
      "Vytvořte profily s podporou proxy pro správu identit a paralelní spouštění automatizací.",
    icon: Users,
    action: "Přidat profil",
    path: "/profiles",
  },
  {
    id: "marketplace",
    title: "Prozkoumejte tržiště",
    description:
      "Objevujte a sdílejte automatizační šablony. Publikujte vlastní workflow a budujte vlastní katalog.",
    icon: Store,
    action: "Procházet šablony",
    path: "/marketplace",
  },
  {
    id: "complete",
    title: "Připraveno k práci",
    description:
      "Základní orientaci máte za sebou. Začněte vytvářet, spouštět a vyhodnocovat QA automatizace.",
    icon: CheckCircle2,
    action: "Otevřít dashboard",
    path: "/",
  },
];

const ONBOARDING_KEY = "qa_automation_toolkit_onboarding_completed";

export function Onboarding() {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if onboarding has been completed
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompleted) {
      // Show onboarding after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    const step = ONBOARDING_STEPS[currentStep];
    if (step && step.id !== "welcome" && step.id !== "complete") {
      // Navigate to the feature page
      setLocation(step.path);
    }

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const step = ONBOARDING_STEPS[currentStep];

  if (!step) return null;

  const StepIcon = step.icon;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) setIsOpen(true);
        else handleComplete();
      }}
    >
      <DialogContent className="max-w-2xl lcars-panel border-0 rounded-md text-[#d8efff]">
        <DialogTitle className="sr-only">{step.title}</DialogTitle>
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm text-[#8bcaff] transition-opacity hover:text-[#ff9900] focus:outline-none focus:ring-2 focus:ring-[#ff9900]"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Přeskočit vše</span>
        </button>

        <div className="space-y-6 pt-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8bcaff] font-medium tracking-wide">
              <span>
                Krok {currentStep + 1} z {ONBOARDING_STEPS.length}
              </span>
              <span>{Math.round(progress)} % dokončeno</span>
            </div>
            <Progress value={progress} className="h-1.5 [&>div]:bg-[#ff9900]" />
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-md flex items-center justify-center" style={{background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.35)', boxShadow: '0 0 18px rgba(255,153,0,0.18)'}}>
              <StepIcon className={`h-10 w-10 text-[#ff9900] ${step.id === 'welcome' ? 'animate-spin-slow' : ''}`} />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold lcars-text">{step.title}</h2>
            <p className="text-[#b8dfff] max-w-md mx-auto leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Feature highlights for specific steps */}
          {step.id === "script" && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#ff9900]">10+</div>
                <div className="text-xs text-[#8bcaff] mt-1">Typů akcí</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#4db8ff]">Live</div>
                <div className="text-xs text-[#8bcaff] mt-1">Spolupráce</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#ffcc00]">Export</div>
                <div className="text-xs text-[#8bcaff] mt-1">Do kódu</div>
              </div>
            </div>
          )}

          {step.id === "profile" && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#ff9900]">Multi-účet</div>
                <div className="text-xs text-[#8bcaff] mt-1">
                  Správa profilů
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#4db8ff]">Proxy</div>
                <div className="text-xs text-[#8bcaff] mt-1">
                  SOCKS5, HTTP, HTTPS
                </div>
              </div>
            </div>
          )}

          {step.id === "marketplace" && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary">100+</div>
                <div className="text-xs text-[#8bcaff] mt-1">Šablon</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#4db8ff]">Publikujte</div>
                <div className="text-xs text-[#8bcaff] mt-1">Vlastní workflow</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#ffcc00]">QA</div>
                <div className="text-xs text-[#8bcaff] mt-1">Automatizace</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 border-[#4db8ff]/40 text-[#8bcaff] hover:bg-[#4db8ff]/10 hover:text-[#d8efff]"
            >
              Přeskočit vše
            </Button>
            <Button
              onClick={handleNext}
              className="lcars-button flex-1"
            >
              {step.action}
              {currentStep < ONBOARDING_STEPS.length - 1 && (
                <ArrowRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to reset onboarding (for testing or user request)
export function useResetOnboarding() {
  return () => {
    localStorage.removeItem(ONBOARDING_KEY);
    window.location.reload();
  };
}

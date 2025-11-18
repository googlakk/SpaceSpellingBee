import { Button } from "@/shared/ui/button";
import { Coins, Flame, ChevronLeft, Rocket, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";

interface HeaderProps {
  showBackButton?: boolean;
  backRoute?: string;
  coins?: number;
  streak?: number;
}

export const Header = ({
  showBackButton = false,
  backRoute = "/",
  coins,
  streak,
}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="glass-card backdrop-blur-xl shadow-large sticky top-0 z-50 border-b border-primary/20">
      <div className="container mx-auto px-3 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between">
          {/* Logo - Always visible and clickable */}
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform group cursor-pointer"
          >
            <div className="relative">
              <Rocket className="h-6 w-6 md:h-8 md:w-8 text-primary animate-bounce-subtle group-hover:rotate-12 transition-all" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-accent animate-pulse" />
              </div>
            </div>
            <span className="font-bold text-base md:text-xl hidden sm:inline font-display text-glow-cyan">
              Intellect Pro School
            </span>
          </button>

          {/* Stats and Actions */}
          <div className="flex items-center gap-1.5 md:gap-3">
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(backRoute)}
                className="rounded-full glass-card border-primary/30 hover:border-primary hover:bg-primary/10 h-7 md:h-9 px-2 md:px-3 text-xs md:text-sm"
              >
                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                <span className="hidden md:inline">Back</span>
              </Button>
            )}

            {coins !== undefined && (
              <div className="flex items-center gap-1 md:gap-2 glass-card bg-coin/10 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-coin/30 glow-cyan">
                <Coins className="h-3 w-3 md:h-4 md:w-4 text-coin" />
                <span className="font-bold text-xs md:text-sm text-coin">{coins}</span>
              </div>
            )}
            {streak !== undefined && streak > 0 && (
              <div className="flex items-center gap-1 md:gap-2 glass-card bg-streak/10 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-streak/30">
                <Flame className="h-3 w-3 md:h-4 md:w-4 text-streak animate-pulse" />
                <span className="font-bold text-xs md:text-sm text-streak">{streak}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

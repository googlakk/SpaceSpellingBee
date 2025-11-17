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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Always visible and clickable */}
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="flex items-center gap-3 hover:scale-105 transition-transform group cursor-pointer"
          >
            <div className="relative">
              <Rocket className="h-8 w-8 text-primary animate-bounce-subtle group-hover:rotate-12 transition-all" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              </div>
            </div>
            <span className="font-bold text-xl hidden sm:inline font-display text-glow-cyan">
              Intellect Pro School
            </span>
          </button>

          {/* Stats and Actions */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(backRoute)}
                className="rounded-full glass-card border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}

            {coins !== undefined && (
              <div className="flex items-center gap-2 glass-card bg-coin/10 px-4 py-2 rounded-full border border-coin/30 glow-cyan">
                <Coins className="h-5 w-5 text-coin" />
                <span className="font-bold text-coin">{coins}</span>
              </div>
            )}
            {streak !== undefined && streak > 0 && (
              <div className="flex items-center gap-2 glass-card bg-streak/10 px-4 py-2 rounded-full border border-streak/30">
                <Flame className="h-5 w-5 text-streak animate-pulse" />
                <span className="font-bold text-streak">{streak}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

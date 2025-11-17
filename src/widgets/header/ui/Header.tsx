import { Button } from "@/shared/ui/button";
import { Coins, Flame, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <header className="bg-card/80 backdrop-blur-sm shadow-soft sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(backRoute)}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="text-3xl animate-bounce-slow">🐝</div>
              <span className="font-bold text-xl hidden sm:inline">
                SpellingBee
              </span>
            </div>
          )}

          {!showBackButton && (
            <div className="flex items-center gap-2">
              <div className="text-3xl animate-bounce-slow">🐝</div>
              <span className="font-bold text-xl hidden sm:inline">
                SpellingBee
              </span>
            </div>
          )}

          <div className="flex items-center gap-4">
            {coins !== undefined && (
              <div className="flex items-center gap-2 bg-coin/20 px-4 py-2 rounded-full">
                <Coins className="h-5 w-5 text-coin" />
                <span className="font-bold text-coin">{coins}</span>
              </div>
            )}
            {streak !== undefined && streak > 0 && (
              <div className="flex items-center gap-2 bg-streak/20 px-4 py-2 rounded-full">
                <Flame className="h-5 w-5 text-streak" />
                <span className="font-bold text-streak">{streak}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

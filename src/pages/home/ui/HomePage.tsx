import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router-dom";
import { Rocket, Zap, Trophy, Star } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import { InstallButton } from "@/components/InstallButton";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen md:h-screen gradient-grid-animated overflow-x-hidden overflow-y-auto flex flex-col">

      {/* Header */}
      <header className="relative flex-shrink-0 container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Rocket className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <div>
              <h1 className="text-sm md:text-xl lg:text-2xl font-bold">
                Intellect Pro School
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Spelling Learning Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="text-center max-w-5xl mx-auto flex-1 flex flex-col justify-center">
          {/* Hero Title */}
          <div className="mb-4 md:mb-6">
            <div className="inline-block mb-2 md:mb-4">
              <div className="glass-card rounded-full px-3 md:px-4 py-1 md:py-2 inline-flex items-center gap-1.5 md:gap-2">
                <Star className="h-3 w-3 md:h-4 md:w-4 text-accent" />
                <span className="text-xs md:text-sm font-medium text-accent">Spelling Mastery</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 md:mb-6 leading-tight">
              Master Words
            </h2>

            <p className="text-sm md:text-lg lg:text-xl text-foreground/80 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Master spelling with AI-powered voice technology.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-10 px-4">
            <Button
              size="lg"
              className="rounded-full text-sm md:text-base lg:text-lg px-6 md:px-8 lg:px-10 py-5 md:py-6 lg:py-7 bg-gradient-primary group"
              onClick={() => navigate(ROUTES.TRAINING)}
            >
              <Zap className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              Practice Mode
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full text-sm md:text-base lg:text-lg px-6 md:px-8 lg:px-10 py-5 md:py-6 lg:py-7 group"
              onClick={() => navigate(`${ROUTES.TRAINING}?mode=olympic`)}
            >
              <Trophy className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              Olympic Mode
            </Button>
          </div>

          {/* Install PWA Button */}
          <div className="flex justify-center mb-6 md:mb-10 px-4">
            <InstallButton
              variant="outline"
              size="lg"
              className="rounded-full text-sm md:text-base lg:text-lg px-6 md:px-8 lg:px-10 py-5 md:py-6 lg:py-7 glass-card"
            />
          </div>


        </div>
      </main>

      {/* Footer */}
      <footer className="relative flex-shrink-0 container mx-auto px-3 md:px-4 py-4 md:py-6 text-center">
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
            © 2025 Intellect Pro School
          </p>
          <div className="flex justify-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
            <button className="hover:text-primary transition-colors">Terms</button>
            <span>•</span>
            <button className="hover:text-primary transition-colors">Privacy</button>
            <span>•</span>
            <button
              className="hover:text-primary transition-colors"
              onClick={() => navigate(ROUTES.ADMIN_LOGIN)}
            >
              Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

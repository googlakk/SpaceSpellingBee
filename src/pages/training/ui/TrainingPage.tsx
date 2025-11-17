import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Star, Sparkles } from "lucide-react";
import { Header } from "@/widgets/header/ui/Header";
import { Character } from "@/widgets/character/ui/Character";
import { StatsCards } from "@/widgets/stats-cards/ui/StatsCards";
import { ProgressBar } from "@/features/track-progress/ui/ProgressBar";
import { ROUTES } from "@/shared/config/routes";

export const TrainingPage = () => {
  const navigate = useNavigate();
  const [coins] = useState(1250);
  const [streak] = useState(5);
  const [xp] = useState(65);
  const [level] = useState(7);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header coins={coins} streak={streak} />

      <main className="container mx-auto px-4 py-8">
        {/* Character & Progress */}
        <div className="text-center mb-8">
          <Character state="idle" message="Hi there! Ready to practice?" />
          <p className="text-muted-foreground mb-4">Choose a level to get started!</p>
          
          {/* XP Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level {level}</span>
              <span className="text-sm text-muted-foreground">{xp}% to Level {level + 1}</span>
            </div>
            <ProgressBar current={xp} total={100} />
          </div>
        </div>

        {/* Level Selection */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Choose Your Level
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Junior Level */}
            <Card className="p-8 hover:shadow-medium transition-all hover:-translate-y-1 cursor-pointer group border-2 hover:border-primary">
              <div className="text-center">
                <div className="text-6xl mb-4 group-hover:animate-bounce-slow">🌟</div>
                <h4 className="text-2xl font-bold mb-2">Junior Level</h4>
                <p className="text-muted-foreground mb-4">Perfect for beginners</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Words:</span>
                    <span className="font-medium">500+ words</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <div className="flex gap-1">
                      <Star className="h-4 w-4 fill-coin text-coin" />
                      <Star className="h-4 w-4 fill-coin text-coin" />
                      <Star className="h-4 w-4 text-muted" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your Progress:</span>
                    <span className="font-medium text-accent">45/100 rounds</span>
                  </div>
                </div>

                <Button 
                  className="w-full rounded-full bg-gradient-primary hover:opacity-90"
                  size="lg"
                  onClick={() => navigate(ROUTES.PRACTICE)}
                >
                  Continue Training
                </Button>
              </div>
            </Card>

            {/* Senior Level */}
            <Card className="p-8 hover:shadow-medium transition-all hover:-translate-y-1 cursor-pointer group border-2 hover:border-primary">
              <div className="text-center">
                <div className="text-6xl mb-4 group-hover:animate-bounce-slow">🚀</div>
                <h4 className="text-2xl font-bold mb-2">Senior Level</h4>
                <p className="text-muted-foreground mb-4">For advanced spellers</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Words:</span>
                    <span className="font-medium">1000+ words</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <div className="flex gap-1">
                      <Star className="h-4 w-4 fill-coin text-coin" />
                      <Star className="h-4 w-4 fill-coin text-coin" />
                      <Star className="h-4 w-4 fill-coin text-coin" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Your Progress:</span>
                    <span className="font-medium text-accent">12/120 rounds</span>
                  </div>
                </div>

                <Button 
                  className="w-full rounded-full bg-gradient-primary hover:opacity-90"
                  size="lg"
                  onClick={() => navigate(ROUTES.PRACTICE)}
                >
                  Start Training
                </Button>
              </div>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="mt-8">
            <StatsCards 
              coins={coins}
              streak={streak}
              stars={{ earned: 45, total: 60 }}
              badges={{ earned: 12, total: 50 }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

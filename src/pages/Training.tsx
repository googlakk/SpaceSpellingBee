import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Volume2, 
  Coins, 
  Star, 
  Trophy, 
  Flame,
  ChevronLeft,
  Sparkles
} from "lucide-react";

const Training = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(1250);
  const [streak, setStreak] = useState(5);
  const [xp, setXp] = useState(65);
  const [level, setLevel] = useState(7);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="text-3xl animate-bounce-slow">🐝</div>
              <span className="font-bold text-xl hidden sm:inline">SpellingBee</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-coin/20 px-4 py-2 rounded-full">
                <Coins className="h-5 w-5 text-coin" />
                <span className="font-bold text-coin">{coins}</span>
              </div>
              <div className="flex items-center gap-2 bg-streak/20 px-4 py-2 rounded-full">
                <Flame className="h-5 w-5 text-streak" />
                <span className="font-bold text-streak">{streak}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Character & Progress */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="text-8xl animate-float">🐝</div>
            <div className="absolute -right-2 top-0 text-2xl animate-wiggle">👋</div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Hi there! Ready to practice?</h2>
          <p className="text-muted-foreground mb-4">Choose a level to get started!</p>
          
          {/* XP Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Level {level}</span>
              <span className="text-sm text-muted-foreground">{xp}% to Level {level + 1}</span>
            </div>
            <Progress value={xp} className="h-3 bg-muted" />
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
                  onClick={() => navigate("/practice")}
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
                  onClick={() => navigate("/practice")}
                >
                  Start Training
                </Button>
              </div>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mt-8">
            <Card className="p-4 text-center">
              <div className="text-3xl mb-2">🪙</div>
              <div className="text-2xl font-bold text-coin">{coins}</div>
              <div className="text-xs text-muted-foreground">Total Coins</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-streak">{streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-secondary">45/60</div>
              <div className="text-xs text-muted-foreground">Stars Earned</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-3xl mb-2">🏅</div>
              <div className="text-2xl font-bold text-badge">12/50</div>
              <div className="text-xs text-muted-foreground">Badges</div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Training;

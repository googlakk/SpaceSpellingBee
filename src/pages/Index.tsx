import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Trophy, Star, Zap } from "lucide-react";
import beeHero from "@/assets/bee-hero.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-4xl animate-bounce-slow">🐝</div>
          <h1 className="text-2xl font-bold text-primary">SpellingBee</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full">
            Login
          </Button>
          <Button className="rounded-full bg-gradient-primary hover:opacity-90 transition-opacity">
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Mascot */}
          <div className="relative inline-block mb-8">
            <img 
              src={beeHero} 
              alt="Buzzy the Bee mascot" 
              className="w-64 h-64 md:w-80 md:h-80 object-contain animate-float drop-shadow-2xl"
            />
            <div className="absolute -top-4 -right-4 text-4xl animate-wiggle">✨</div>
            <div className="absolute -bottom-2 -left-4 text-3xl animate-bounce-slow">🌟</div>
          </div>

          {/* Hero Text */}
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Master Spelling Through Play!
          </h2>
          <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-2xl mx-auto">
            Join Buzzy the Bee on an exciting spelling adventure. Learn, practice, and compete with friends!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="rounded-full text-lg px-8 py-6 bg-gradient-primary hover:opacity-90 transition-all hover:scale-105 shadow-medium"
              onClick={() => navigate("/training")}
            >
              <Zap className="mr-2 h-5 w-5" />
              Start Training
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-full text-lg px-8 py-6 hover:scale-105 transition-all"
            >
              <Trophy className="mr-2 h-5 w-5" />
              View Leaderboard
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="bg-card rounded-3xl p-8 shadow-soft hover:shadow-medium transition-all hover:-translate-y-1">
              <div className="text-5xl mb-4 animate-pulse-slow">🎮</div>
              <h3 className="text-xl font-bold mb-2">Gamified Learning</h3>
              <p className="text-muted-foreground">
                Earn coins, unlock badges, and level up as you master new words
              </p>
            </div>

            <div className="bg-card rounded-3xl p-8 shadow-soft hover:shadow-medium transition-all hover:-translate-y-1">
              <div className="text-5xl mb-4 animate-bounce-slow">🔥</div>
              <h3 className="text-xl font-bold mb-2">Streak System</h3>
              <p className="text-muted-foreground">
                Build your streak and unlock special rewards and power-ups
              </p>
            </div>

            <div className="bg-card rounded-3xl p-8 shadow-soft hover:shadow-medium transition-all hover:-translate-y-1">
              <div className="text-5xl mb-4 animate-wiggle">🌍</div>
              <h3 className="text-xl font-bold mb-2">Multi-Language</h3>
              <p className="text-muted-foreground">
                Practice spelling in English and Kyrgyz with native audio
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Words</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">50+</div>
              <div className="text-muted-foreground">Levels</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">100+</div>
              <div className="text-muted-foreground">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-streak mb-2">5K+</div>
              <div className="text-muted-foreground">Students</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>© 2024 SpellingBee Platform. Made with 💛 for young learners</p>
      </footer>
    </div>
  );
};

export default Index;

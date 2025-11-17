import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router-dom";
import { Rocket, Zap, Trophy, Star, Sparkles, Shield, Target, Award } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-cosmic stars-bg overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative container mx-auto px-4 py-6">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Rocket className="h-8 w-8 text-primary animate-bounce-subtle" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-glow-cyan" style={{ fontFamily: 'Orbitron' }}>
                Intellect Pro School
              </h1>
              <p className="text-xs text-muted-foreground">Space Learning Platform</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full border-primary/30 hover:border-primary hover:glow-cyan transition-all"
            >
              Login
            </Button>
            <Button className="rounded-full bg-gradient-primary hover:scale-105 glow-cyan transition-all">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative container mx-auto px-4 py-12">
        <div className="text-center max-w-5xl mx-auto">
          {/* Hero Title */}
          <div className="mb-8 animate-slide-down">
            <div className="inline-block mb-4">
              <div className="glass-card rounded-full px-6 py-2 inline-flex items-center gap-2">
                <Star className="h-4 w-4 text-accent animate-spin-slow" />
                <span className="text-sm font-medium text-accent">New Mission: Spelling Mastery</span>
                <Star className="h-4 w-4 text-accent animate-spin-slow" />
              </div>
            </div>

            <h2 className="text-6xl md:text-7xl font-bold mb-6 text-glow-cyan leading-tight" style={{ fontFamily: 'Orbitron' }}>
              Master Words
              <br />
      
            </h2>

            <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Embark on an <span className="text-primary font-semibold">intergalactic journey</span> of learning.
              Master spelling across galaxies with AI-powered voice technology.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
            <Button
              size="lg"
              className="rounded-full text-lg px-10 py-7 bg-gradient-primary hover:scale-110 glow-cyan transition-all group relative overflow-hidden"
              onClick={() => navigate(ROUTES.TRAINING)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <Zap className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">Launch Training</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full text-lg px-10 py-7 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-110 transition-all group"
              onClick={() => navigate(ROUTES.PRACTICE)}
            >
              <Trophy className="mr-2 h-6 w-6 group-hover:rotate-12 transition-transform" />
              Practice Mode
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {[
              {
                icon: Target,
                title: "Adaptive Missions",
                description: "AI-powered learning paths that adapt to your skill level",
                color: "primary",
                delay: "0s"
              },
              {
                icon: Award,
                title: "Galactic Achievements",
                description: "Unlock badges, ranks, and special rewards as you progress",
                color: "secondary",
                delay: "0.2s"
              },
              {
                icon: Shield,
                title: "Multi-Dimensional",
                description: "Practice in English, Kyrgyz and more with native pronunciation",
                color: "accent",
                delay: "0.4s"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-3xl p-8 hover:glass-card-hover transition-all hover:-translate-y-2 group animate-scale-in"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-${feature.color} mb-6 glow-${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-background" />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Orbitron' }}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

     
        </div>
      </main>

      {/* Footer */}
      <footer className="relative container mx-auto px-4 py-12 text-center">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-muted-foreground mb-4">
            © 2024 Intellect Pro School. Powered by cosmic intelligence.
          </p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <button className="hover:text-primary transition-colors">Terms</button>
            <span>•</span>
            <button className="hover:text-primary transition-colors">Privacy</button>
            <span>•</span>
            <button
              className="hover:text-primary transition-colors"
              onClick={() => navigate(ROUTES.ADMIN_LOGIN)}
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

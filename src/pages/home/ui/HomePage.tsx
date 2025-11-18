import { Button } from "@/shared/ui/button";
import { useNavigate } from "react-router-dom";
import { Rocket, Zap, Trophy, Star, Sparkles, Shield, Target, Award } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";
import { InstallButton } from "@/components/InstallButton";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen md:h-screen bg-gradient-cosmic stars-bg overflow-x-hidden overflow-y-auto flex flex-col">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative flex-shrink-0 container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="glass-card rounded-xl md:rounded-2xl p-2 md:p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <Rocket className="h-6 w-6 md:h-8 md:w-8 text-primary animate-bounce-subtle" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-accent animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-sm md:text-xl lg:text-2xl font-bold text-glow-cyan" style={{ fontFamily: 'Orbitron' }}>
                Intellect Pro School
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Space Learning Platform</p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-primary/30 hover:border-primary hover:glow-cyan transition-all text-xs md:text-sm h-7 md:h-9 px-3 md:px-4"
            >
              Login
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-gradient-primary hover:scale-105 glow-cyan transition-all text-xs md:text-sm h-7 md:h-9 px-3 md:px-4"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="text-center max-w-5xl mx-auto flex-1 flex flex-col justify-center">
          {/* Hero Title */}
          <div className="mb-4 md:mb-6 animate-slide-down">
            <div className="inline-block mb-2 md:mb-4">
              <div className="glass-card rounded-full px-3 md:px-4 py-1 md:py-2 inline-flex items-center gap-1.5 md:gap-2">
                <Star className="h-3 w-3 md:h-4 md:w-4 text-accent animate-spin-slow" />
                <span className="text-xs md:text-sm font-medium text-accent">Spelling Mastery</span>
                <Star className="h-3 w-3 md:h-4 md:w-4 text-accent animate-spin-slow" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 md:mb-6 text-glow-cyan leading-tight" style={{ fontFamily: 'Orbitron' }}>
              Master Words
            </h2>

            <p className="text-sm md:text-lg lg:text-xl text-foreground/80 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Embark on an <span className="text-primary font-semibold">intergalactic journey</span> of learning.
              Master spelling with AI-powered voice technology.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-10 animate-slide-up px-4">
            <Button
              size="lg"
              className="rounded-full text-sm md:text-base lg:text-lg px-6 md:px-8 lg:px-10 py-5 md:py-6 lg:py-7 bg-gradient-primary hover:scale-105 md:hover:scale-110 glow-cyan transition-all group relative overflow-hidden"
              onClick={() => navigate(ROUTES.TRAINING)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <Zap className="mr-2 h-5 w-5 md:h-6 md:w-6 group-hover:rotate-12 transition-transform relative z-10" />
              <span className="relative z-10">Launch Training</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full text-sm md:text-base lg:text-lg px-6 md:px-8 lg:px-10 py-5 md:py-6 lg:py-7 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 md:hover:scale-110 transition-all group"
              onClick={() => navigate(ROUTES.PRACTICE)}
            >
              <Trophy className="mr-2 h-5 w-5 md:h-6 md:w-6 group-hover:rotate-12 transition-transform" />
              Practice Mode
            </Button>
          </div>

          {/* Install PWA Button */}
          <div className="flex justify-center mb-6 md:mb-10 px-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <InstallButton
              variant="outline"
              size="lg"
              className="rounded-full text-sm md:text-base lg:text-lg px-6 md:px-8 lg:px-10 py-5 md:py-6 lg:py-7 border-2 border-secondary/30 hover:border-secondary hover:bg-secondary/10 hover:scale-105 md:hover:scale-110 transition-all group glass-card glow-purple"
            />
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-12 px-4">
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
                className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 hover:glass-card-hover transition-all hover:-translate-y-1 md:hover:-translate-y-2 group animate-scale-in"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-xl md:rounded-2xl bg-gradient-${feature.color} mb-3 md:mb-4 lg:mb-6 glow-${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-background" />
                </div>
                <h3 className="text-base md:text-lg lg:text-2xl font-bold mb-2 md:mb-3" style={{ fontFamily: 'Orbitron' }}>
                  {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative flex-shrink-0 container mx-auto px-3 md:px-4 py-4 md:py-6 text-center">
        <div className="glass-card rounded-xl md:rounded-2xl p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
            © 2024 Intellect Pro School
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

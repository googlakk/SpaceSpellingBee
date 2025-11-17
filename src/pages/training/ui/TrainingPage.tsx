import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Star, Sparkles, ChevronRight, ArrowLeft, Rocket, Target, Zap, Shield, Trophy, Loader2, Flame, Globe } from "lucide-react";
import { Header } from "@/widgets/header/ui/Header";
import { Character } from "@/widgets/character/ui/Character";
import { ProgressBar } from "@/features/track-progress/ui/ProgressBar";
import { ROUTES } from "@/shared/config/routes";
import { supabase, Level, Sublevel, Language } from "@/shared/api/supabase";
import { toast } from "sonner";

export const TrainingPage = () => {
  const navigate = useNavigate();
  const [coins] = useState(1250);
  const [streak] = useState(5);
  const [xp] = useState(65);
  const [playerLevel] = useState(7);

  // New state for language, levels and sublevels
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [sublevels, setSublevels] = useState<Record<string, Sublevel[]>>({});
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLanguages, setLoadingLanguages] = useState(true);

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      loadLevelsAndSublevels(selectedLanguage.id);
    }
  }, [selectedLanguage]);

  const loadLanguages = async () => {
    setLoadingLanguages(true);
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setLanguages(data || []);
    } catch (error) {
      console.error('Error loading languages:', error);
      toast.error('Failed to load languages');
    } finally {
      setLoadingLanguages(false);
    }
  };

  const loadLevelsAndSublevels = async (languageId: string) => {
    setLoading(true);
    try {
      // Load levels for selected language
      const { data: levelsData, error: levelsError } = await supabase
        .from('levels')
        .select('*')
        .eq('language_id', languageId)
        .order('name');

      if (levelsError) throw levelsError;

      setLevels(levelsData || []);

      // Load sublevels for each level
      const sublevelsMap: Record<string, Sublevel[]> = {};
      for (const level of levelsData || []) {
        const { data: sublevelsData, error: sublevelsError } = await supabase
          .from('sublevels')
          .select('*')
          .eq('level_id', level.id)
          .order('order_index');

        if (sublevelsError) throw sublevelsError;
        sublevelsMap[level.id] = sublevelsData || [];
      }

      setSublevels(sublevelsMap);
    } catch (error) {
      console.error('Error loading levels:', error);
      toast.error('Failed to load levels');
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (levelName: string) => {
    switch (levelName) {
      case 'kids': return <Rocket className="h-16 w-16 text-primary" />;
      case 'junior': return <Target className="h-16 w-16 text-secondary" />;
      case 'senior': return <Zap className="h-16 w-16 text-accent" />;
      default: return <Shield className="h-16 w-16 text-primary" />;
    }
  };

  const getLevelDifficulty = (levelName: string) => {
    switch (levelName) {
      case 'kids': return 1;
      case 'junior': return 2;
      case 'senior': return 3;
      default: return 1;
    }
  };

  const handleStartPractice = (sublevelId: string) => {
    // Store selected sublevel in localStorage for practice page
    localStorage.setItem('selected_sublevel_id', sublevelId);
    navigate(ROUTES.PRACTICE);
  };

  if (!selectedLanguage) {
    // Language Selection Screen
    if (loadingLanguages) {
      return (
        <div className="min-h-screen bg-gradient-cosmic stars-bg flex items-center justify-center">
          <div className="text-center glass-card rounded-3xl p-12">
            <Rocket className="h-16 w-16 animate-bounce-subtle mx-auto text-primary mb-6 glow-cyan" />
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-lg text-glow-cyan font-display">Loading Mission Control...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-cosmic stars-bg">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>

        <Header coins={coins} streak={streak} />

        <main className="relative container mx-auto px-4 py-8">
          <div className="text-center mb-8 animate-slide-down">
            <Character state="idle" message="🌍 Choose your mission language!" />
            <p className="text-muted-foreground mb-4">Select a language to begin your cosmic training</p>

            <div className="max-w-md mx-auto glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium font-display">Cadet Level {playerLevel}</span>
                <span className="text-sm text-muted-foreground">{xp}% to Level {playerLevel + 1}</span>
              </div>
              <ProgressBar current={xp} total={100} />
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 justify-center font-display text-glow-cyan">
              <Globe className="h-6 w-6 text-primary animate-spin-slow" />
              Mission Language Selection
              <Globe className="h-6 w-6 text-primary animate-spin-slow" />
            </h3>

            {languages.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center border-error border-2">
                <Shield className="h-16 w-16 mx-auto text-error mb-6 animate-pulse" />
                <h4 className="text-2xl font-bold mb-3 font-display">No Mission Languages Available</h4>
                <p className="text-muted-foreground">
                  No active languages found. Please contact mission control.
                </p>
              </div>
            ) : (
              <div className={`grid gap-8 max-w-2xl mx-auto ${languages.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                {languages.map((language, index) => (
                  <div
                    key={language.id}
                    className="glass-card rounded-3xl p-8 hover:glass-card-hover transition-all hover:-translate-y-2 cursor-pointer group border-2 border-primary/20 hover:border-primary glow-cyan hover:shadow-large animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => setSelectedLanguage(language)}
                  >
                    <div className="text-center">
                      <div className="text-8xl mb-6 group-hover:scale-110 transition-transform filter drop-shadow-lg">
                        {language.flag_emoji}
                      </div>
                      <h4 className="text-3xl font-bold mb-2 font-display text-glow-cyan">{language.native_name}</h4>
                      <p className="text-muted-foreground mb-6">
                        Cosmic Spelling in {language.name}
                      </p>

                      <Button
                        className="w-full rounded-full bg-gradient-primary hover:scale-105 glow-cyan transition-all shadow-large group relative overflow-hidden"
                        size="lg"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        <Rocket className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform relative z-10" />
                        <span className="relative z-10">Launch Mission in {language.name}</span>
                        <ChevronRight className="ml-2 h-4 w-4 relative z-10" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic stars-bg flex items-center justify-center">
        <div className="text-center glass-card rounded-3xl p-12">
          <Target className="h-16 w-16 animate-bounce-subtle mx-auto text-secondary mb-6 glow-purple" />
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-secondary mb-4" />
          <p className="text-lg text-glow-purple font-display">Loading Training Levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic stars-bg">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <Header coins={coins} streak={streak} />

      <main className="relative container mx-auto px-4 py-8">
        {/* Character & Progress */}
        <div className="text-center mb-8 animate-slide-down">
          <Character
            state="idle"
            message={selectedLevel
              ? `🎯 Excellent! Choose your mission from ${selectedLevel.display_name}`
              : "🚀 Cadet, ready for training?"
            }
          />
          <p className="text-muted-foreground mb-4">
            {selectedLevel ? 'Select a mission round to deploy' : 'Choose your difficulty level to begin!'}
          </p>

          {/* XP Progress */}
          <div className="max-w-md mx-auto glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium font-display">Cadet Level {playerLevel}</span>
              <span className="text-sm text-muted-foreground">{xp}% to Level {playerLevel + 1}</span>
            </div>
            <ProgressBar current={xp} total={100} />
          </div>
        </div>

        {/* Back Buttons */}
        <div className="max-w-4xl mx-auto mb-6 flex gap-2">
          {selectedLevel && (
            <Button
              variant="outline"
              onClick={() => setSelectedLevel(null)}
              className="gap-2 glass-card border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Levels
            </Button>
          )}

          {!selectedLevel && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedLanguage(null);
                setLevels([]);
                setSublevels({});
              }}
              className="gap-2 glass-card border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Change Language
            </Button>
          )}
        </div>

        {/* Level or Sublevel Selection */}
        <div className="max-w-4xl mx-auto">
          {!selectedLevel ? (
            // Level Selection
            <>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 justify-center font-display text-glow-purple">
                <Flame className="h-6 w-6 text-secondary animate-pulse" />
                Choose Your Difficulty Level
                <Flame className="h-6 w-6 text-secondary animate-pulse" />
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                {levels.map((level, index) => {
                  const difficulty = getLevelDifficulty(level.name);
                  const sublevelCount = sublevels[level.id]?.length || 0;

                  return (
                    <div
                      key={level.id}
                      className="glass-card rounded-3xl p-8 hover:glass-card-hover transition-all hover:-translate-y-2 cursor-pointer group border-2 border-primary/20 hover:border-primary hover:shadow-large animate-scale-in"
                      style={{ animationDelay: `${index * 0.15}s` }}
                      onClick={() => setSelectedLevel(level)}
                    >
                      <div className="text-center">
                        <div className="mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all inline-block">
                          {getLevelIcon(level.name)}
                        </div>
                        <h4 className="text-2xl font-bold mb-3 font-display text-glow-cyan">{level.display_name}</h4>
                        <p className="text-muted-foreground mb-6">{level.description}</p>

                        <div className="space-y-3 mb-6 glass-card rounded-xl p-4 border border-primary/10">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Mission Rounds:</span>
                            <span className="font-bold text-primary">{sublevelCount} available</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Difficulty:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= difficulty
                                      ? 'fill-accent text-accent'
                                      : 'text-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          className="w-full rounded-full bg-gradient-primary hover:scale-105 glow-cyan transition-all shadow-large group relative overflow-hidden"
                          size="lg"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                          <Target className="mr-2 h-5 w-5 relative z-10" />
                          <span className="relative z-10">Select Level</span>
                          <ChevronRight className="ml-2 h-4 w-4 relative z-10" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            // Sublevel Selection
            <>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 justify-center font-display text-glow-pink">
                <Trophy className="h-6 w-6 text-accent animate-bounce-subtle" />
                {selectedLevel.display_name} - Mission Rounds
                <Trophy className="h-6 w-6 text-accent animate-bounce-subtle" />
              </h3>

              {sublevels[selectedLevel.id]?.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sublevels[selectedLevel.id].map((sublevel, index) => (
                    <div
                      key={sublevel.id}
                      className="glass-card rounded-2xl p-6 hover:glass-card-hover transition-all hover:-translate-y-2 cursor-pointer group border-2 border-accent/20 hover:border-accent hover:shadow-large animate-scale-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleStartPractice(sublevel.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-xs text-accent font-bold mb-1 font-display">MISSION {index + 1}</div>
                          <h4 className="text-lg font-bold text-glow-cyan">{sublevel.display_name}</h4>
                        </div>
                        <div className="glass-card rounded-full p-2 group-hover:bg-accent/20 transition-colors">
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                        </div>
                      </div>

                      {sublevel.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {sublevel.description}
                        </p>
                      )}

                      <Button
                        className="w-full rounded-full bg-gradient-secondary hover:scale-105 glow-pink transition-all shadow-medium group relative overflow-hidden"
                        size="sm"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        <Rocket className="mr-2 h-4 w-4 relative z-10" />
                        <span className="relative z-10">Launch Mission</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-12 text-center border-error border-2">
                  <Shield className="h-16 w-16 mx-auto text-error mb-6 animate-pulse" />
                  <h4 className="text-2xl font-bold mb-3 font-display">No Mission Rounds Available</h4>
                  <p className="text-muted-foreground">
                    This level doesn't have any missions yet. Please check back later or contact mission control.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

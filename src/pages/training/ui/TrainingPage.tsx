import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'practice'; // Default to practice mode
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
        .order('order_index');

      if (levelsError) throw levelsError;

      setLevels(levelsData || []);

      // OPTIMIZED: Load all sublevels in parallel instead of sequentially (N+1 fix)
      if (levelsData && levelsData.length > 0) {
        const levelIds = levelsData.map(level => level.id);

        // Single query to fetch all sublevels at once
        const { data: allSublevelsData, error: sublevelsError } = await supabase
          .from('sublevels')
          .select('*')
          .in('level_id', levelIds)
          .order('order_index');

        if (sublevelsError) throw sublevelsError;

        // Group sublevels by level_id
        const sublevelsMap: Record<string, Sublevel[]> = {};
        for (const level of levelsData) {
          sublevelsMap[level.id] = [];
        }

        for (const sublevel of allSublevelsData || []) {
          if (sublevelsMap[sublevel.level_id]) {
            sublevelsMap[sublevel.level_id].push(sublevel);
          }
        }

        setSublevels(sublevelsMap);
      } else {
        setSublevels({});
      }
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
    navigate(`${ROUTES.PRACTICE}?mode=${mode}`);
  };

  if (!selectedLanguage) {
    // Language Selection Screen
    if (loadingLanguages) {
      return (
        <div className="h-screen gradient-grid-bg flex items-center justify-center">
          <div className="text-center glass-card rounded-2xl md:rounded-3xl p-6 md:p-8 mx-4">
            <Rocket className="h-12 w-12 md:h-16 md:w-16 animate-bounce mx-auto text-indigo-500 mb-4 md:mb-6" />
            <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin mx-auto text-indigo-500 mb-3 md:mb-4" />
            <p className="text-sm md:text-lg text-slate-700 font-semibold">Loading Mission Control...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen gradient-grid-bg flex flex-col overflow-hidden">

        <div className="flex-shrink-0">
          <Header coins={coins} streak={streak} />
        </div>

        <main className="flex-1 relative container mx-auto px-3 md:px-4 py-3 md:py-6 overflow-y-auto">
          <div className="text-center mb-4 md:mb-6 animate-slide-down">
            <div className="hidden md:block mb-4">
              <Character
                state="idle"
                message={mode === 'olympic' ? "🏆 Olympic Mode - Choose your language!" : "🌍 Choose your language!"}
              />
            </div>
            <div className="md:hidden mb-3">
              <div className="inline-block glass-card rounded-xl px-3 py-2 border border-primary/20">
                <p className="text-xs text-foreground font-medium">
                  {mode === 'olympic' ? "🏆 Olympic Mode - Choose your language!" : "🌍 Choose your language!"}
                </p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
              {mode === 'olympic' ? 'Select language for Olympic challenge' : 'Select a language to begin'}
            </p>

            <div className="max-w-md mx-auto glass-card rounded-xl md:rounded-2xl p-2 md:p-3">
              <div className="flex items-center justify-between mb-1.5 md:mb-2">
                <span className="text-xs md:text-sm font-medium font-display">Cadet Level {playerLevel}</span>
                <span className="text-xs md:text-sm text-muted-foreground">{xp}% to Level {playerLevel + 1}</span>
              </div>
              <ProgressBar current={xp} total={100} />
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3 justify-center font-display text-glow-cyan">
              <Globe className="h-4 w-4 md:h-6 md:w-6 text-primary animate-spin-slow" />
              Language Selection
              <Globe className="h-4 w-4 md:h-6 md:w-6 text-primary animate-spin-slow" />
            </h3>

            {languages.length === 0 ? (
              <div className="glass-card rounded-2xl md:rounded-3xl p-6 md:p-12 text-center border-error border-2">
                <Shield className="h-12 w-12 md:h-16 md:w-16 mx-auto text-error mb-4 md:mb-6 animate-pulse" />
                <h4 className="text-lg md:text-2xl font-bold mb-2 md:mb-3 font-display">No Mission Languages Available</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  No active languages found. Please contact mission control.
                </p>
              </div>
            ) : (
              <div className={`grid gap-4 md:gap-6 max-w-2xl mx-auto ${languages.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                {languages.map((language, index) => (
                  <div
                    key={language.id}
                    className="glass-card rounded-2xl md:rounded-3xl p-4 md:p-6 hover:glass-card-hover transition-all cursor-pointer group border-2 border-primary/20 hover:border-primary"
                    onClick={() => setSelectedLanguage(language)}
                  >
                    <div className="text-center">
                      <div className="text-5xl md:text-7xl lg:text-8xl mb-3 md:mb-4 lg:mb-6">
                        {language.flag_emoji}
                      </div>
                      <h4 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{language.native_name}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 lg:mb-6">
                        Spelling in {language.name}
                      </p>

                      <Button
                        className="w-full rounded-full bg-gradient-primary group text-xs md:text-sm lg:text-base"
                        size="lg"
                      >
                        <Rocket className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Launch in {language.name}
                        <ChevronRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
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
      <div className="h-screen gradient-grid-bg flex items-center justify-center">
        <div className="text-center glass-card rounded-2xl md:rounded-3xl p-6 md:p-8 mx-4">
          <Target className="h-12 w-12 md:h-16 md:w-16 animate-bounce mx-auto text-violet-500 mb-4 md:mb-6" />
          <Loader2 className="h-8 w-8 md:h-12 md:w-12 animate-spin mx-auto text-violet-500 mb-3 md:mb-4" />
          <p className="text-sm md:text-lg text-slate-700 font-semibold">Loading Training Levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen gradient-grid-bg flex flex-col overflow-hidden">

      <div className="flex-shrink-0">
        <Header coins={coins} streak={streak} />
      </div>

      <main className="flex-1 relative container mx-auto px-3 md:px-4 py-3 md:py-6 overflow-y-auto">
        {/* Character & Progress */}
        <div className="text-center mb-4 md:mb-6 animate-slide-down">
          <div className="hidden md:block mb-4">
            <Character
              state="idle"
              message={selectedLevel
                ? `🎯 Excellent! Choose a level from ${selectedLevel.display_name}`
                : mode === 'olympic'
                  ? "🏆 Olympic Mode - Ready for the challenge?"
                  : "🚀 Ready to practice?"
              }
            />
          </div>
          <div className="md:hidden mb-3">
            <div className="inline-block glass-card rounded-xl px-3 py-2 border border-primary/20">
              <p className="text-xs text-foreground font-medium">
                {selectedLevel
                  ? `🎯 ${selectedLevel.display_name}`
                  : mode === 'olympic'
                    ? "🏆 Olympic Mode"
                    : "🚀 Ready to practice?"}
              </p>
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
            {selectedLevel
              ? 'Select a level to start'
              : mode === 'olympic'
                ? 'Choose your Olympic difficulty level'
                : 'Choose your difficulty level'}
          </p>

          {/* XP Progress */}
          <div className="max-w-md mx-auto glass-card rounded-xl md:rounded-2xl p-2 md:p-3">
            <div className="flex items-center justify-between mb-1.5 md:mb-2">
              <span className="text-xs md:text-sm font-medium font-display">Cadet Level {playerLevel}</span>
              <span className="text-xs md:text-sm text-muted-foreground">{xp}% to Level {playerLevel + 1}</span>
            </div>
            <ProgressBar current={xp} total={100} />
          </div>
        </div>

        {/* Back Buttons */}
        <div className="max-w-4xl mx-auto mb-3 md:mb-4 flex gap-2">
          {selectedLevel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLevel(null)}
              className="gap-1 md:gap-2 glass-card border-primary/30 hover:border-primary hover:bg-primary/10 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Back to Levels</span>
              <span className="sm:hidden">Levels</span>
            </Button>
          )}

          {!selectedLevel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedLanguage(null);
                setLevels([]);
                setSublevels({});
              }}
              className="gap-1 md:gap-2 glass-card border-primary/30 hover:border-primary hover:bg-primary/10 text-xs md:text-sm h-8 md:h-9 px-2 md:px-3"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Change Language</span>
              <span className="sm:hidden">Language</span>
            </Button>
          )}
        </div>

        {/* Level or Sublevel Selection */}
        <div className="max-w-4xl mx-auto">
          {!selectedLevel ? (
            // Level Selection
            <>
              <h3 className="text-base md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3 justify-center font-display text-glow-purple">
                {mode === 'olympic' ? (
                  <>
                    <Trophy className="h-4 w-4 md:h-6 md:w-6 text-accent animate-pulse" />
                    <span className="hidden sm:inline">Olympic Mode - Choose Difficulty</span>
                    <span className="sm:hidden">Olympic Difficulty</span>
                    <Trophy className="h-4 w-4 md:h-6 md:w-6 text-accent animate-pulse" />
                  </>
                ) : (
                  <>
                    <Flame className="h-4 w-4 md:h-6 md:w-6 text-secondary animate-pulse" />
                    <span className="hidden sm:inline">Choose Your Difficulty Level</span>
                    <span className="sm:hidden">Difficulty Level</span>
                    <Flame className="h-4 w-4 md:h-6 md:w-6 text-secondary animate-pulse" />
                  </>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {levels.map((level, index) => {
                  const difficulty = getLevelDifficulty(level.name);
                  const sublevelCount = sublevels[level.id]?.length || 0;

                  return (
                    <div
                      key={level.id}
                      className="bg-gradient-to-br from-white/95 to-slate-100/90 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 hover:scale-[1.02] transition-all cursor-pointer group border border-white/30 shadow-xl"
                      onClick={() => setSelectedLevel(level)}
                    >
                      <div className="text-center">
                        <div className="mb-3 md:mb-4 lg:mb-6 inline-block">
                          <div className="[&>svg]:h-10 [&>svg]:w-10 md:[&>svg]:h-12 md:[&>svg]:w-12 lg:[&>svg]:h-16 lg:[&>svg]:w-16">
                            {getLevelIcon(level.name)}
                          </div>
                        </div>
                        <h4 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 text-slate-800">{level.display_name}</h4>
                        <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4 lg:mb-6">{level.description}</p>

                        <div className="space-y-2 md:space-y-3 mb-3 md:mb-4 lg:mb-6 bg-slate-50/80 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 border border-slate-200">
                          <div className="flex items-center justify-between text-xs md:text-sm">
                            <span className="text-slate-600">Rounds:</span>
                            <span className="font-bold text-indigo-600">{sublevelCount}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs md:text-sm">
                            <span className="text-slate-600">Difficulty:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 md:h-4 md:w-4 ${star <= difficulty
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <Button
                          className="w-full rounded-full bg-gradient-primary group text-xs md:text-sm lg:text-base"
                          size="lg"
                        >
                          {mode === 'olympic' ? (
                            <>
                              <Trophy className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                              Enter Olympic
                              <ChevronRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                            </>
                          ) : (
                            <>
                              <Target className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                              Select Level
                              <ChevronRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                            </>
                          )}
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
              <h3 className="text-base md:text-xl lg:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3 justify-center">
                <Trophy className="h-4 w-4 md:h-6 md:w-6 text-accent" />
                <span className="text-center">{selectedLevel.display_name} Levels</span>
                <Trophy className="h-4 w-4 md:h-6 md:w-6 text-accent" />
              </h3>

              {sublevels[selectedLevel.id]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {sublevels[selectedLevel.id].map((sublevel, index) => (
                    <div
                      key={sublevel.id}
                      className="bg-gradient-to-br from-white/95 to-slate-100/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 hover:scale-[1.02] transition-all cursor-pointer group border border-white/30 shadow-xl"
                      onClick={() => handleStartPractice(sublevel.id)}
                    >
                      <div className="flex items-start justify-between mb-2 md:mb-3">
                        <div className="flex-1">
                          <div className="text-[10px] md:text-xs text-indigo-600 font-bold mb-1">LEVEL {index + 1}</div>
                          <h4 className="text-sm md:text-base lg:text-lg font-bold text-slate-800">{sublevel.display_name}</h4>
                        </div>
                        <div className="bg-slate-100 rounded-full p-1.5 md:p-2 group-hover:bg-indigo-100 transition-colors">
                          <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      </div>

                      {sublevel.description && (
                        <p className="text-xs md:text-sm text-slate-600 mb-3 md:mb-4">
                          {sublevel.description}
                        </p>
                      )}

                      <Button
                        className="w-full rounded-full bg-gradient-secondary group text-xs md:text-sm"
                        size="sm"
                      >
                        {mode === 'olympic' ? (
                          <>
                            <Trophy className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                            Start Olympic
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                            Start Practice
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl md:rounded-3xl p-6 md:p-12 text-center border-error border-2">
                  <Shield className="h-12 w-12 md:h-16 md:w-16 mx-auto text-error mb-4 md:mb-6" />
                  <h4 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">No Levels Available</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    This level doesn't have any sublevels yet.
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

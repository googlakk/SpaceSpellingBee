import { Card } from "@/shared/ui/card";

interface StatsCardsProps {
  coins: number;
  streak: number;
  stars: { earned: number; total: number };
  badges: { earned: number; total: number };
}

export const StatsCards = ({ coins, streak, stars, badges }: StatsCardsProps) => {
  return (
    <div className="grid md:grid-cols-4 gap-4">
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
        <div className="text-2xl font-bold text-secondary">
          {stars.earned}/{stars.total}
        </div>
        <div className="text-xs text-muted-foreground">Stars Earned</div>
      </Card>

      <Card className="p-4 text-center">
        <div className="text-3xl mb-2">🏅</div>
        <div className="text-2xl font-bold text-badge">
          {badges.earned}/{badges.total}
        </div>
        <div className="text-xs text-muted-foreground">Badges</div>
      </Card>
    </div>
  );
};

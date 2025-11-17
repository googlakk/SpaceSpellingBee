import { Progress } from "@/shared/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar = ({ current, total, label }: ProgressBarProps) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          {label || "Progress"}
        </span>
        <span className="text-sm text-muted-foreground">
          {current}/{total}
        </span>
      </div>
      <Progress value={percentage} className="h-3" />
    </div>
  );
};

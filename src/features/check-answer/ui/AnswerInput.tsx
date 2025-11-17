import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Sparkles } from "lucide-react";

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  feedback?: "correct" | "incorrect" | null;
}

export const AnswerInput = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  feedback = null,
}: AnswerInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Type your answer:
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Spell the word..."
        disabled={disabled}
        className={`text-2xl text-center h-16 rounded-2xl border-4 transition-all ${
          feedback === "correct"
            ? "border-success bg-success/10"
            : feedback === "incorrect"
            ? "border-error bg-error/10 animate-shake"
            : "border-primary/30 focus:border-primary"
        }`}
        autoFocus
      />
      <Button
        onClick={onSubmit}
        disabled={!value || disabled}
        className="w-full rounded-full h-14 text-lg bg-gradient-primary hover:opacity-90"
        size="lg"
      >
        Check Answer
      </Button>
    </div>
  );
};

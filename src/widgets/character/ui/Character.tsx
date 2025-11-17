interface CharacterProps {
  state?: "idle" | "happy" | "encouraging" | "celebrating";
  message?: string;
}

export const Character = ({
  state = "idle",
  message,
}: CharacterProps) => {
  const getAnimation = () => {
    switch (state) {
      case "happy":
        return "animate-bounce-slow";
      case "encouraging":
        return "animate-wiggle";
      case "celebrating":
        return "animate-bounce-slow";
      default:
        return "animate-float";
    }
  };

  const getEmoji = () => {
    switch (state) {
      case "happy":
        return { main: "🐝", extra: "🎉", position: "-top-4 -right-4" };
      case "encouraging":
        return { main: "🐝", extra: "💪", position: "-top-4 -right-4" };
      case "celebrating":
        return { main: "🐝", extra: "🏆", position: "-top-4 -right-4" };
      default:
        return { main: "🐝", extra: "👋", position: "-right-2 top-0" };
    }
  };

  const emoji = getEmoji();

  return (
    <div className="text-center">
      <div className="relative inline-block mb-4">
        <div className={`text-9xl transition-all duration-300 ${getAnimation()}`}>
          {emoji.main}
        </div>
        <div className={`absolute ${emoji.position} text-4xl ${state === "idle" ? "animate-wiggle" : "animate-bounce-slow"}`}>
          {emoji.extra}
        </div>
      </div>

      {message && (
        <div className="mt-4">
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>
      )}
    </div>
  );
};

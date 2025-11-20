# Practice Mode vs Olympic Mode

## Overview

The application now has two distinct modes for learning spelling:

### 1. Practice Mode 🎓
**Purpose**: Training mode where students type words they hear

**Flow**:
```
Home Page → Practice Mode button → TrainingPage (level selection) → PracticePage (with input)
```

**Features**:
- ✍️ **Input-based learning**: Students type the word they hear
- 📊 **Immediate feedback**: Shows correct/incorrect after each attempt
- 🎯 **Attempt tracking**: Counts how many tries per word
- ⏭️ **Skip option**: Can skip difficult words
- 📝 **Sequential order**: Words in original order (not shuffled)
- 🎉 **Auto-advance**: Automatically moves to next word after correct answer
- 🎨 **Character states**: Visual feedback (happy, encouraging)

**UI Elements**:
- Large input field for typing
- "Check Answer" button
- Feedback messages (Correct/Try Again)
- Attempts counter
- Skip button
- Audio replay button
- Progress bar

### 2. Olympic Mode 🏆
**Purpose**: Review mode where students just see and hear words

**Flow**:
```
Home Page → Olympic Mode button → PracticePage (display only)
```

**Features**:
- 👁️ **Display-only**: Shows the word without input
- 🔀 **Random order**: Words are shuffled each time
- ⬅️➡️ **Manual navigation**: Previous/Next buttons
- 📋 **Word list**: Can view all words
- 🔊 **Audio focus**: Listen and see the word
- 🎲 **Reshuffle**: Can restart with new random order

**UI Elements**:
- Large word display (5xl-8xl font)
- Previous/Next buttons
- Word list button
- Audio replay button
- Progress bar

---

## Technical Implementation

### URL Parameters

**Practice Mode**:
```
/practice?mode=practice
```

**Olympic Mode**:
```
/practice?mode=olympic
```

### Mode Detection

```typescript
const [searchParams] = useSearchParams();
const mode = searchParams.get('mode') || 'olympic'; // Default to olympic
const isOlympicMode = mode === 'olympic';
```

### State Management

**Practice Mode States**:
```typescript
const [answer, setAnswer] = useState('');
const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
const [attempts, setAttempts] = useState(0);
const [characterState, setCharacterState] = useState<CharacterState>('idle');
```

**Shared States**:
```typescript
const [words, setWords] = useState<Word[]>([]);
const [currentWordIndex, setCurrentWordIndex] = useState(0);
const [isTransitioning, setIsTransitioning] = useState(false);
```

### Word Loading Logic

```typescript
// Load words
if (isOlympicMode) {
  // Shuffle for Olympic Mode
  const shuffled = shuffleArray(data);
  setWords(shuffled);
} else {
  // Keep original order for Practice Mode
  setWords(data);
}
```

### Answer Checking (Practice Mode)

```typescript
const checkAnswer = () => {
  const isCorrect = answer.trim().toLowerCase() === currentWord.word.toLowerCase();
  setFeedback(isCorrect ? 'correct' : 'incorrect');

  if (isCorrect) {
    // Show success, confetti, auto-advance
    setTimeout(() => {
      handleNextWord();
      setAnswer('');
      setFeedback(null);
    }, 1500);
  } else {
    // Show error, encourage retry
    setTimeout(() => {
      setFeedback(null);
    }, 1500);
  }
};
```

### Conditional Rendering

```typescript
{isOlympicMode ? (
  // Olympic Mode: Display word
  <div className="glass-card">
    <p className="text-7xl">{currentWord.word}</p>
  </div>
) : (
  // Practice Mode: Input field
  <div className="glass-card">
    {feedback && <FeedbackMessage />}
    <Input
      value={answer}
      onChange={(e) => setAnswer(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
    />
    <Button onClick={checkAnswer}>Check Answer</Button>
  </div>
)}
```

---

## User Experience Flow

### Practice Mode Journey

1. **Start**: User clicks "Practice Mode" on home page
2. **Select Level**: Choose language → level → sublevel
3. **Listen**: Audio plays automatically (500ms delay)
4. **Type**: Enter the word in the input field
5. **Check**: Click "Check Answer" or press Enter
6. **Feedback**:
   - ✅ Correct: Green checkmark, confetti, auto-advance (1.5s)
   - ❌ Incorrect: Red X, "Try Again" message (1.5s)
7. **Skip**: If stuck, use Skip button
8. **Complete**: After all words, see completion modal

### Olympic Mode Journey

1. **Start**: User clicks "Olympic Mode" on home page
2. **Random Words**: Words load in shuffled order
3. **Review**: See and hear each word
4. **Navigate**: Use Previous/Next to browse
5. **List**: View all words in sidebar
6. **Complete**: After reviewing all, see completion modal
7. **Reshuffle**: Option to restart with new random order

---

## Navigation Controls

### Practice Mode
```
┌─────────────┬───────────┐
│ Skip Button │ List Button │
└─────────────┴───────────┘
```

### Olympic Mode
```
┌─────────┬─────────┬──────────┐
│ Previous │  List   │   Next   │
└─────────┴─────────┴──────────┘
```

---

## Audio Behavior

### Auto-play
- ✅ Both modes auto-play audio when word loads
- ⏱️ 500ms delay for smooth transition
- 🔇 Catches errors silently

### Replay Button
- ✅ Available in both modes
- 🔊 Plays audio on demand
- 📍 Positioned below word/input

---

## Completion Modal

Shows different messages based on mode:

**Practice Mode**:
```
🎉 Great job!
You've completed all 20 words in Practice Mode!
```

**Olympic Mode**:
```
🎉 Great job!
You've reviewed all 20 words in Olympic Mode!
```

**Actions**:
- Restart: Start over (reshuffle in Olympic Mode)
- Return to Levels: Go back to level selection

---

## Performance Optimizations

### Practice Mode
- Input field has `autoFocus` for immediate typing
- Feedback clears automatically after 1.5s
- Character state resets on next word

### Olympic Mode
- Uses transition state for smooth word changes
- Memoized word list items for performance
- Lazy loading with content visibility

---

## Accessibility

### Practice Mode
- Enter key submits answer
- Clear feedback messages
- High contrast input field
- Disabled state during feedback

### Olympic Mode
- Large readable text (5xl-8xl)
- Clear navigation buttons
- Keyboard navigation support

---

## Future Enhancements

### Practice Mode
- [ ] Hint system (show first letter)
- [ ] Difficulty levels (strict/lenient spelling)
- [ ] Voice input option
- [ ] Statistics tracking (accuracy, speed)
- [ ] Personalized review (repeat failed words)

### Olympic Mode
- [ ] Speed control (auto-advance timer)
- [ ] Flashcard mode (hide word, show on click)
- [ ] Quiz mode (multiple choice)
- [ ] Custom shuffle algorithms

---

## Troubleshooting

### Practice Mode Not Working
1. Check URL parameter: `/practice?mode=practice`
2. Verify input field is visible
3. Check browser console for errors

### Olympic Mode Not Shuffling
1. Confirm URL parameter: `/practice?mode=olympic`
2. Check if words load in random order
3. Try reshuffle button

### Audio Not Playing
1. Check browser autoplay policy
2. Verify audio_url in database
3. Fallback to VoiceRSS API

---

**Last Updated**: 2025-01-20
**Version**: 2.0.0
**Modes**: Practice (Training) + Olympic (Review)

# AGENT RESPONSIBILITY ZONES

> [!IMPORTANT]
> This project is currently being modified by multiple AI agents concurrently. Strictly adhere to the zones defined below to avoid conflicts.

## 🤖 Agent 1: TTS & Audio Logic
**Goal**: Integrate `kokoro-js`, manage TTS providers, handle audio playback logic.

### ✅ ALLOWED ZONES (Read/Write)
- `src/shared/api/tts/**`
- `src/services/audio/**` (or similar audio service paths)
- `src/features/play-audio/model/**`
- `src/widgets/admin/audio-**/model/**`

### ⚠️ RESTRICTED ZONES (Read Only / Do Not Modify)
- `src/shared/ui/**` (Do NOT change visual components)
- `src/styles/**`
- `src/app/**`
- `index.css`
- `tailwind.config.ts`

### 🤝 SHARED ZONES (Coordinate Carefully)
- `package.json`: **APPEND ONLY**. Do not remove existing dependencies. Do not reformat the entire file.
- `src/features/play-audio/ui/AudioButton.tsx`:
    - You may modify `onClick` handlers, `useEffect` hooks, and props related to audio state.
    - **DO NOT** change `className`, layout structure, or remove existing `data-testid` / `id` attributes.

---

## 🎨 Agent 2: UI/UX & Design
**Goal**: Improve interface aesthetics, implementation of design system.

### ✅ ALLOWED ZONES (Read/Write)
- `src/shared/ui/**`
- `src/styles/**`
- `src/app/**`
- `index.css`
- `tailwind.config.ts`
- `src/pages/**`

### ⚠️ RESTRICTED ZONES (Read Only / Do Not Modify)
- `src/shared/api/tts/**` (Do NOT touch audio generation logic)
- `src/features/**/model/**` (Do NOT touch business logic/state management)

### 🤝 SHARED ZONES (Coordinate Carefully)
- `package.json`: **APPEND ONLY**.
- `src/features/play-audio/ui/AudioButton.tsx`:
    - You may modify `className`, DOM structure, icons, and visual layout.
    - **DO NOT** remove `onClick` handlers or change the component's interface (props) without checking usage.
    - **DO NOT** remove `id` or `data-*` attributes that might be used by the logic.

---

## 🚨 CONFLICT RESOLUTION
If you need to edit a file in a restricted or shared zone that heavily impacts the other agent:
1. **STOP**.
2. Notify the user to coordinate the change.
3. Check `task.md` or ask the monitoring agent (Antigravity).

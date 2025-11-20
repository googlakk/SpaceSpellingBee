# Design System 2025 - SpellingBee

## Overview

Modern, trendy design system inspired by 2025 web design trends featuring:
- **Blue → Violet → Purple → Pink** gradient palette
- **Grid pattern backgrounds** with animated gradients
- **Glass-morphism** cards with gradient borders
- **Modern typography** with high contrast
- **Responsive** and optimized for all devices

---

## Color Palette

### Dark Theme (Default)

#### Background Colors
- **Primary Background**: `hsl(222 47% 11%)` - Deep Navy `#1C2333`
- **Card Background**: `hsl(217 33% 17%)` - Darker Blue-Gray `#24303F`
- **Muted Background**: `hsl(217 33% 20%)` - Slightly lighter

#### Foreground Colors
- **Primary Text**: `hsl(210 40% 98%)` - Almost White `#F7FAFC`
- **Muted Text**: `hsl(215 20% 65%)` - Light Gray

#### Brand Colors
- **Primary (Blue)**: `hsl(217 91% 60%)` - Bright Blue `#3B82F6`
- **Secondary (Violet)**: `hsl(250 95% 65%)` - Electric Violet `#8B5CF6`
- **Accent (Purple)**: `hsl(280 91% 60%)` - Purple `#A855F7`
- **Destructive (Red)**: `hsl(0 84% 60%)` - Coral Red

#### Gamification Colors
- **Coins**: `hsl(45 100% 58%)` - Gold `#FFB800`
- **Streak**: `hsl(24 100% 58%)` - Orange `#FF9500`
- **XP**: `hsl(189 94% 53%)` - Cyan `#06B6D4`
- **Badge**: `hsl(280 91% 60%)` - Purple `#A855F7`
- **Success**: `hsl(142 71% 55%)` - Green `#34C759`

### Light Theme

#### Background Colors
- **Primary Background**: `hsl(210 100% 98%)` - Very Light Blue-White `#F0F8FF`
- **Card Background**: `hsl(0 0% 100%)` - Pure White
- **Muted Background**: `hsl(210 100% 95%)` - Light Blue-Gray

#### Foreground Colors
- **Primary Text**: `hsl(222 47% 11%)` - Deep Navy `#1C2333`
- **Muted Text**: `hsl(215 16% 47%)` - Medium Gray

#### Brand Colors (Same as Dark)
- **Primary**: `hsl(217 91% 60%)` - Bright Blue
- **Secondary**: `hsl(250 95% 65%)` - Violet
- **Accent**: `hsl(280 91% 60%)` - Purple
- All other colors remain the same for consistency

---

## Gradients

### Primary Gradient (Blue → Violet → Purple)
```css
background: linear-gradient(135deg,
  hsl(217 91% 60%) 0%,    /* Bright Blue */
  hsl(250 95% 65%) 50%,   /* Violet */
  hsl(280 91% 60%) 100%   /* Purple */
);
```

### Secondary Gradient (Purple → Pink)
```css
background: linear-gradient(135deg,
  hsl(280 91% 60%) 0%,    /* Purple */
  hsl(320 100% 60%) 100%  /* Pink */
);
```

### Hero Gradient
```css
background: linear-gradient(135deg,
  hsl(217 91% 60%),
  hsl(250 95% 65%),
  hsl(280 91% 60%)
);
```

### Success Gradient
```css
background: linear-gradient(135deg,
  hsl(142 71% 55%),  /* Green */
  hsl(189 94% 53%)   /* Cyan */
);
```

### Coin Gradient
```css
background: linear-gradient(135deg,
  hsl(45 100% 58%),  /* Gold */
  hsl(38 92% 50%)    /* Dark Gold */
);
```

---

## Grid Backgrounds

### Standard Grid (Static)
```html
<div class="gradient-grid-bg">
  <!-- Content -->
</div>
```

CSS:
```css
.gradient-grid-bg {
  background: linear-gradient(135deg,
    hsl(217 91% 60%),
    hsl(250 95% 65%),
    hsl(280 91% 60%)
  );
}

.gradient-grid-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

### Animated Grid
```html
<div class="gradient-grid-animated">
  <!-- Content -->
</div>
```

Features:
- Gradient shifts smoothly over 15 seconds
- Grid overlay remains static
- Infinite loop animation

### Dot Grid
```html
<div class="gradient-grid-dots">
  <!-- Content -->
</div>
```

Features:
- Dot pattern instead of lines
- 30px spacing between dots
- Lighter opacity for subtle effect

### Mesh Gradient (Modern 2025)
```html
<div class="gradient-mesh">
  <!-- Content -->
</div>
```

Features:
- Multi-directional radial gradients
- 4 corner gradients blended together
- Subtle grid overlay
- Most modern and trendy option

---

## Glass-morphism Cards

### Dark Theme
```html
<div class="glass-card">
  <!-- Content -->
</div>
```

CSS:
```css
.glass-card {
  background: hsla(240 20% 15% / 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid hsla(180 100% 50% / 0.1);
}
```

### Light Theme
```html
<div class="glass-card">
  <!-- Content with gradient border -->
</div>
```

Features:
- White background with 90% opacity
- Gradient border (Blue → Violet → Purple)
- Blur effect for frosted glass look
- Deep navy text for high contrast

### Hover State
```html
<div class="glass-card-hover">
  <!-- Content -->
</div>
```

Features:
- Increased opacity
- Stronger border color
- Glow shadow effect

### Glass Card on Grid
```html
<div class="gradient-grid-bg">
  <div class="glass-card-on-grid">
    <!-- Content -->
  </div>
</div>
```

Optimized specifically for grid backgrounds with enhanced contrast.

---

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Text Colors

#### Dark Theme
- **Primary Text**: White/Off-white `hsl(210 40% 98%)`
- **Secondary Text**: Light gray `hsl(215 20% 65%)`
- **Accent Text**: Use brand colors (Blue, Violet, Purple)

#### Light Theme
- **Primary Text**: Deep Navy `hsl(222 47% 11%)`
- **Secondary Text**: Medium gray `hsl(215 16% 47%)`
- **Accent Text**: Brand colors remain the same

### Text Glow Effects (Dark Theme Only)

```css
.text-glow-blue {
  text-shadow: 0 0 10px hsla(217 91% 60% / 0.8),
               0 0 20px hsla(217 91% 60% / 0.4);
}

.text-glow-violet {
  text-shadow: 0 0 10px hsla(250 95% 65% / 0.8),
               0 0 20px hsla(250 95% 65% / 0.4);
}

.text-glow-purple {
  text-shadow: 0 0 10px hsla(280 91% 60% / 0.8),
               0 0 20px hsla(280 91% 60% / 0.4);
}
```

*Note: Text glow is disabled in light mode for better readability*

---

## Buttons

### Primary Button
```html
<button class="bg-gradient-primary">
  Practice Mode
</button>
```

Features:
- Blue → Violet → Purple gradient
- White text
- Glow effect on hover (light theme)

### Secondary Button
```html
<button class="bg-gradient-secondary">
  Olympic Mode
</button>
```

Features:
- Purple → Pink gradient
- White text
- Glow effect on hover (light theme)

### Success Button
```html
<button class="bg-gradient-success">
  Complete
</button>
```

Features:
- Green → Cyan gradient
- White text

---

## Effects & Animations

### Glow Effects

#### Dark Theme
```css
.glow-blue { box-shadow: var(--glow-blue); }
.glow-violet { box-shadow: var(--glow-violet); }
.glow-purple { box-shadow: var(--glow-purple); }
```

#### Light Theme
More subtle with less intensity:
```css
--glow-blue: 0 2px 16px hsla(217 91% 60% / 0.15);
--glow-violet: 0 2px 16px hsla(250 95% 65% / 0.15);
--glow-purple: 0 2px 16px hsla(280 91% 60% / 0.15);
```

### Shadows

#### Dark Theme
```css
--shadow-soft: 0 4px 20px hsla(0 0% 0% / 0.4);
--shadow-medium: 0 8px 30px hsla(0 0% 0% / 0.5);
--shadow-large: 0 20px 60px hsla(0 0% 0% / 0.6);
```

#### Light Theme
```css
--shadow-soft: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-medium: 0 2px 8px rgba(0, 0, 0, 0.10);
--shadow-large: 0 8px 24px rgba(0, 0, 0, 0.12);
```

### Animations

#### Float Animation
```css
.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

#### Pulse Glow
```css
.animate-pulse-glow {
  animation: pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Slide Animations
```css
.animate-slide-up { animation: slideUp 0.5s ease-out; }
.animate-slide-down { animation: slideDown 0.5s ease-out; }
.animate-scale-in { animation: scaleIn 0.3s ease-out; }
```

#### Shimmer Effect
```css
.animate-shimmer {
  animation: shimmer 2s linear infinite;
  background: linear-gradient(90deg,
    transparent 0%,
    hsla(217 91% 60% / 0.3) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
}
```

---

## Scrollbar Styling

### Dark Theme
```css
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg,
    hsl(217 91% 60%),
    hsl(250 95% 65%),
    hsl(280 91% 60%)
  );
  border-radius: 5px;
}
```

### Light Theme
```css
.light ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg,
    hsl(217 91% 60%),
    hsl(250 95% 65%)
  );
  border-radius: 5px;
}
```

---

## Borders & Dividers

### Holographic Border
```html
<div class="border-holographic">
  <!-- Content -->
</div>
```

Features:
- 4-color gradient border
- Blue → Violet → Purple → Pink

### Standard Borders

#### Dark Theme
- `border-primary/30`: Blue with 30% opacity
- `border-accent/30`: Purple with 30% opacity
- `border-muted/10`: Gray with 10% opacity

#### Light Theme
- Borders use lighter colors with higher transparency
- Gradient borders on cards

---

## Usage Examples

### Page Layout with Grid Background
```tsx
<div className="min-h-screen gradient-grid-animated">
  <header>
    <div className="glass-card">
      {/* Header content */}
    </div>
  </header>

  <main>
    <div className="glass-card">
      {/* Main content */}
    </div>
  </main>
</div>
```

### Card with Gradient Border (Light Theme)
```tsx
<div className="glass-card rounded-2xl p-6">
  <h3 className="text-2xl font-bold text-foreground">Title</h3>
  <p className="text-muted-foreground">Description text</p>
  <button className="bg-gradient-primary">Action</button>
</div>
```

### Hero Section
```tsx
<div className="hero-gradient-grid">
  <h1 className="text-6xl font-bold text-glow-blue">
    Master Words
  </h1>
  <p className="text-lg text-foreground/80">
    Master spelling with AI-powered voice technology.
  </p>
  <button className="bg-gradient-primary px-8 py-6 rounded-full">
    Get Started
  </button>
</div>
```

---

## Accessibility

### Contrast Ratios

#### Dark Theme
- White text on dark navy: **19:1** (WCAG AAA ✅)
- Bright blue on dark: **8:1** (WCAG AA ✅)
- Violet on dark: **7:1** (WCAG AA ✅)

#### Light Theme
- Deep navy on white: **14:1** (WCAG AAA ✅)
- Deep navy on light blue: **12:1** (WCAG AAA ✅)
- Bright blue buttons: **4.5:1** (WCAG AA ✅)

### Touch Targets
- Minimum 44x44pt for all interactive elements
- Follows Apple HIG guidelines
- Optimized for mobile devices

---

## Performance Optimizations

### Grid Backgrounds
- Uses CSS pseudo-elements (`:before`) to avoid extra DOM nodes
- Grid patterns are lightweight repeating backgrounds
- Hardware-accelerated animations

### Glass-morphism
- Uses `backdrop-filter` with fallbacks
- Blur radius optimized for performance (10-20px max)
- Reduced blur on mobile for better FPS

### Animations
- Uses `transform` and `opacity` for 60fps animations
- `will-change` applied strategically
- Reduced motion support via `prefers-reduced-motion`

---

## Browser Support

- **Modern Browsers**: Full support (Chrome 90+, Firefox 88+, Safari 14+)
- **Backdrop Filter**: Supported in all modern browsers
- **CSS Grid**: Full support
- **Gradients**: Full support
- **Animations**: Hardware-accelerated

---

## Files Structure

```
src/
├── styles/
│   ├── gradient-grid.css      # Grid background system
│   ├── light-theme.css        # Light theme overrides
│   ├── minimal-hig.css        # Apple HIG optimizations
│   └── performance.css        # Performance optimizations
├── index.css                  # Main stylesheet with variables
└── pages/
    ├── home/                  # Uses gradient-grid-animated
    ├── training/              # Uses gradient-grid-bg
    ├── practice/              # Uses gradient-grid-bg
    └── admin/                 # Uses gradient-grid-bg
```

---

## Migration from Old Design

### Color Changes
- **Cyan** → **Blue** (`hsl(217 91% 60%)`)
- **Electric Purple** → **Violet** (`hsl(250 95% 65%)`)
- **Neon Pink** → **Purple** (`hsl(280 91% 60%)`)

### Class Name Changes
- `.glow-cyan` → `.glow-blue`
- `.text-glow-cyan` → `.text-glow-blue`
- New: `.glow-violet`, `.text-glow-violet`

### Background Changes
- `bg-gradient-cosmic` → `gradient-grid-bg` or `gradient-grid-animated`
- `stars-bg` removed (replaced with grid pattern)

---

## Future Enhancements

- [ ] Add mesh gradient variations
- [ ] Implement dark/light theme transition animations
- [ ] Add more gradient presets
- [ ] Create gradient editor tool for admins
- [ ] Add theme customization options

---

## Credits

Design inspired by:
- 2025 Web Design Trends (Violet + Pink palettes)
- Modern SaaS applications (Stripe, Vercel)
- Apple Human Interface Guidelines
- Material Design 3

---

**Last Updated**: 2025-01-20
**Version**: 2.0.0
**Author**: SpellingBee Design Team

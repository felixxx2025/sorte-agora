# Design System - SORTE AGORA

## Brand Identity

### Logo Concept

The SORTE AGORA logo represents:
- **Fortune & Speed**: The name translates to "Luck Now"
- **Energy**: Dynamic, modern, trustworthy
- **Premium Feel**: Gold accents on dark background

### Color Palette

#### Primary Colors
```css
--color-primary: #FFD700;        /* Gold - Fortune, Premium */
--color-primary-dark: #FFA500;   /* Orange - Energy, Action */
--color-primary-light: #FFF8DC;  /* Light Gold - Backgrounds */

--color-secondary: #1A1A2E;      /* Dark Navy - Trust, Professional */
--color-secondary-light: #16213E; /* Light Navy - Cards, Sections */
--color-secondary-dark: #0F0F1A; /* Darker Navy - Deep backgrounds */
```

#### Accent Colors
```css
--color-accent-green: #00C853;   /* Success, Wins */
--color-accent-red: #FF1744;     /* Errors, Losses */
--color-accent-blue: #2979FF;    /* Information, Links */
--color-accent-purple: #651FFF;  /* VIP, Premium */
```

#### Neutral Colors
```css
--color-white: #FFFFFF;
--color-gray-50: #F8F9FA;
--color-gray-100: #E9ECEF;
--color-gray-200: #DEE2E6;
--color-gray-300: #CED4DA;
--color-gray-400: #ADB5BD;
--color-gray-500: #6C757D;
--color-gray-600: #495057;
--color-gray-700: #343A40;
--color-gray-800: #212529;
--color-gray-900: #0F0F0F;
```

#### Semantic Colors
```css
--color-success: #00C853;
--color-warning: #FFAB00;
--color-error: #FF1744;
--color-info: #2979FF;
```

### Typography

#### Font Families
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Montserrat', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

#### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

#### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

#### Line Heights
```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Spacing Scale

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-glow: 0 0 20px rgba(255, 215, 0, 0.3);
```

### Transitions

```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
--transition-slower: 500ms ease-in-out;
```

## Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1A1A2E;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 200ms ease;
  box-shadow: 0 4px 6px rgba(255, 215, 0, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 215, 0, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: #FFD700;
  border: 2px solid #FFD700;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 200ms ease;
}

.btn-secondary:hover {
  background: rgba(255, 215, 0, 0.1);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: #FFFFFF;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 200ms ease;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.1);
}
```

### Cards

#### Game Card
```css
.game-card {
  background: linear-gradient(145deg, #16213E 0%, #1A1A2E 100%);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 300ms ease;
  border: 1px solid rgba(255, 215, 0, 0.1);
}

.game-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255, 215, 0, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.game-card__thumbnail {
  aspect-ratio: 16/9;
  object-fit: cover;
}

.game-card__info {
  padding: 1rem;
}

.game-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 0.5rem;
}

.game-card__provider {
  font-size: 0.75rem;
  color: #ADB5BD;
}
```

#### VIP Card
```css
.vip-card {
  background: linear-gradient(135deg, #651FFF 0%, #311B92 100%);
  border-radius: 1rem;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.vip-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Inputs

#### Text Input
```css
.input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: #FFFFFF;
  font-size: 1rem;
  transition: all 200ms ease;
}

.input:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
}

.input::placeholder {
  color: #6C757D;
}
```

### Badges

#### Status Badge
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge--success {
  background: rgba(0, 200, 83, 0.1);
  color: #00C853;
}

.badge--warning {
  background: rgba(255, 171, 0, 0.1);
  color: #FFAB00;
}

.badge--error {
  background: rgba(255, 23, 68, 0.1);
  color: #FF1744;
}

.badge--vip {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1A1A2E;
}
```

### Navigation

#### Sidebar
```css
.sidebar {
  background: #0F0F1A;
  width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 1.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: #ADB5BD;
  text-decoration: none;
  transition: all 200ms ease;
}

.sidebar__link:hover,
.sidebar__link--active {
  background: rgba(255, 215, 0, 0.1);
  color: #FFD700;
}
```

## Layouts

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│  Header (Logo, Search, User Menu, Balance)              │
├──────────┬──────────────────────────────────────────────┤
│          │                                               │
│ Sidebar  │  Main Content Area                           │
│          │                                               │
│ - Casino │  ┌─────────────────────────────────────┐    │
│ - Sports │  │                                     │    │
│ - VIP    │  │  Dynamic Content                    │    │
│ - Wallet │  │                                     │    │
│ - Profile│  │                                     │    │
│          │  └─────────────────────────────────────┘    │
│          │                                               │
└──────────┴──────────────────────────────────────────────┘
```

### Casino Lobby Layout
```
┌─────────────────────────────────────────────────────────┐
│  Filters: [All] [Slots] [Live] [Table] [Jackpot]       │
├─────────────────────────────────────────────────────────┤
│  Featured Games (Carousel)                              │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Game 1  │ │  Game 2  │ │  Game 3  │ │  Game 4  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Game 5  │ │  Game 6  │ │  Game 7  │ │  Game 8  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Sportsbook Layout
```
┌─────────────────────────────────────────────────────────┐
│  Sports: [Football] [Basketball] [Tennis] [More]       │
├──────────┬──────────────────────────────────────────────┤
│ Leagues  │  Live Events                                 │
│          │                                              │
│ - Premier│  ┌──────────────────────────────────────┐   │
│   League │  │ Man City vs Liverpool (LIVE 45')    │   │
│ - La Liga│  │ 1-0 | [1.85] [3.40] [4.20]          │   │
│ - Serie A│  └──────────────────────────────────────┘   │
│          │                                              │
│          │  ┌──────────────────────────────────────┐   │
│          │  │ Real Madrid vs Barcelona (LIVE 78')│   │
│          │  │ 2-1 | [2.10] [3.20] [3.80]          │   │
│          │  └──────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────┘
```

## Animations

### Key Animations

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 300ms ease-in-out;
}
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slideUp 400ms ease-out;
}
```

#### Pulse
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

#### Shine
```css
@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shine::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shine 2s infinite;
}
```

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

## Iconography

### Icon Set
Using Lucide React icons with custom styling:
- Primary color: #FFD700
- Size: 20px (default), 16px (small), 24px (large)
- Stroke width: 2px

### Key Icons
- `crown` - VIP features
- `coins` - Financial/wallet
- `gamepad-2` - Casino
- `trophy` - Sports/competitions
- `shield-check` - Security
- `user` - Profile
- `settings` - Settings
- `log-out` - Logout

## Accessibility

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus States**: Visible focus indicators on all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and roles
- **Touch Targets**: Minimum 44x44px for touch elements

### Focus Styles
```css
.focus-visible:focus {
  outline: 2px solid #FFD700;
  outline-offset: 2px;
}
```

### Skip Links
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #FFD700;
  color: #1A1A2E;
  padding: 8px 16px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

## Dark Mode

The platform uses a dark-first design approach:
- Primary background: #0F0F1A
- Secondary background: #1A1A2E
- Card background: #16213E
- Text primary: #FFFFFF
- Text secondary: #ADB5BD

## Mobile Optimization

### Touch-Friendly
- Minimum touch target: 44x44px
- Spacious padding for touch interactions
- Swipe gestures for carousels
- Bottom navigation for mobile

### Performance
- Lazy loading for images
- Code splitting by route
- Optimized assets (WebP format)
- Service worker for offline support

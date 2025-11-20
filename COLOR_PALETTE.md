# Color Palette - SpellingBee

## Light Theme (Светлая тема)

### Основные цвета из image.png

#### Фон
- **Background**: `hsl(30 20% 96%)` - `#F5F5F0`
  - Светло-бежевый, теплый фон
  - Мягкий для глаз
  - Премиум вид

#### Карточки
- **Glass Card**: `hsl(220 13% 46%)` - `#6B7280`
  - Темно-серые карточки
  - Высокий контраст с фоном
  - Белый текст на карточках
  - Hover: `hsl(220 13% 50%)` - чуть светлее

#### Основные действия (Primary)
- **Primary**: `hsl(217 91% 60%)` - `#3B82F6`
  - Яркий синий (iOS Blue)
  - Для главных кнопок
  - Высокая видимость
  - Hover: `hsl(217 91% 55%)` - чуть темнее

#### Акценты
- **Accent**: `hsl(24 95% 53%)` - `#F97316`
  - Оранжевый
  - Для бейджей и важных элементов
  - Теплый и дружелюбный

#### Текст
- **Foreground**: `hsl(220 13% 18%)` - `#1F2937`
  - Темный текст для основного контента
  - Высокая читаемость
- **Muted**: `hsl(220 9% 46%)` - `#737373`
  - Серый текст для вторичной информации

### Дополнительные цвета

#### Success (Успех)
- `hsl(142 71% 45%)` - Зеленый

#### Error (Ошибка)
- `hsl(0 84% 60%)` - Красный

#### Warning (Предупреждение)
- `hsl(24 95% 53%)` - Оранжевый (как accent)

#### Info (Информация)
- `hsl(200 98% 39%)` - Циан

---

## Dark Theme (Темная тема)

### Основные цвета

#### Фон
- **Background**: `hsl(240 15% 8%)` - `#0A0118`
  - Очень темный фиолетовый
  - OLED true black для экономии батареи
  - Космический вид

#### Карточки
- **Glass Card**: `hsla(240 20% 15% / 0.6)`
  - Полупрозрачные
  - Эффект стекла
  - Backdrop blur

#### Основные действия (Primary)
- **Primary**: `hsl(180 100% 50%)` - `#00FFFF`
  - Неоновый cyan
  - Яркий на темном фоне
  - Футуристичный вид

#### Акценты
- **Accent**: `hsl(320 100% 60%)` - `#FF0099`
  - Неоновый розовый
  - Космический акцент

#### Текст
- **Foreground**: `hsl(210 40% 98%)` - `#FAFAFA`
  - Почти белый
  - Высокий контраст

---

## Цветовые комбинации

### Light Theme Combinations

#### Primary Button
```css
background: hsl(217 91% 60%);  /* Синий */
color: white;
```

#### Secondary Button
```css
background: hsl(220 13% 46%);  /* Темно-серый */
color: white;
```

#### Badge/Tag
```css
background: hsl(24 95% 53%);   /* Оранжевый */
color: white;
```

#### Card on Light Background
```css
background: hsl(220 13% 46%);  /* Темно-серый */
color: white;
border: 1px solid hsl(220 13% 40%);
```

### Dark Theme Combinations

#### Primary Button
```css
background: linear-gradient(135deg,
  hsl(180 100% 50%),  /* Cyan */
  hsl(270 100% 65%)   /* Purple */
);
color: white;
```

#### Glass Card
```css
background: hsla(240 20% 15% / 0.6);
backdrop-filter: blur(20px);
border: 1px solid hsla(180 100% 50% / 0.1);
```

---

## Семантические цвета

### Gamification

#### Light Mode
- **Coins**: `hsl(45 93% 47%)` - Золотой
- **Streak**: `hsl(24 95% 53%)` - Оранжевый
- **XP**: `hsl(200 98% 39%)` - Циан
- **Badge**: `hsl(320 87% 45%)` - Розовый

#### Dark Mode
- **Coins**: `hsl(45 100% 58%)` - Яркое золото
- **Streak**: `hsl(24 100% 58%)` - Огненный оранжевый
- **XP**: `hsl(180 100% 50%)` - Неоновый циан
- **Badge**: `hsl(320 100% 60%)` - Неоновый розовый

---

## Использование в компонентах

### Buttons
```jsx
// Light mode - яркий синий
<Button className="bg-gradient-primary">
  Practice Mode
</Button>

// Light mode - темно-серый
<Button className="bg-gradient-secondary">
  Olympic Mode
</Button>
```

### Cards
```jsx
// Light mode - темно-серая карточка
<div className="glass-card">
  <h3>Title</h3>  {/* Белый текст */}
  <p>Content</p>  {/* Белый текст */}
</div>
```

### Text
```jsx
// Light mode
<h1 className="text-foreground">Title</h1>        // Темный
<p className="text-muted-foreground">Subtitle</p> // Серый
<span className="text-primary">Link</span>        // Синий
<span className="text-accent">Badge</span>        // Оранжевый
```

---

## Accessibility (Доступность)

### Контрастность Light Mode

#### Высокий контраст (WCAG AAA)
- Темный текст на светлом фоне: `18:1`
- Синий на белом: `4.5:1` ✅
- Оранжевый на белом: `3.8:1` ⚠️ (только для больших элементов)

#### Темно-серые карточки
- Белый текст на темно-сером: `7:1` ✅
- Хорошая читаемость

### Контрастность Dark Mode

#### Высокий контраст
- Белый текст на темном фоне: `19:1`
- Cyan на черном: `15:1` ✅
- Розовый на черном: `12:1` ✅

---

## Тени и эффекты

### Light Mode Shadows
```css
/* Мягкая тень */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

/* Средняя тень */
box-shadow: 0 2px 6px rgba(0, 0, 0, 0.10);

/* Большая тень */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
```

### Dark Mode Glows
```css
/* Cyan glow */
box-shadow: 0 0 20px hsla(180 100% 50% / 0.5),
            0 0 40px hsla(180 100% 50% / 0.3);

/* Purple glow */
box-shadow: 0 0 20px hsla(270 100% 65% / 0.5),
            0 0 40px hsla(270 100% 65% / 0.3);
```

---

## Градиенты

### Light Mode
```css
/* Primary gradient */
background: linear-gradient(135deg,
  hsl(217 91% 60%),  /* Синий */
  hsl(220 13% 46%)   /* Серый */
);

/* Secondary gradient */
background: linear-gradient(135deg,
  hsl(220 13% 46%),  /* Серый */
  hsl(24 95% 53%)    /* Оранжевый */
);
```

### Dark Mode
```css
/* Cosmic gradient */
background: linear-gradient(135deg,
  hsl(180 100% 50%),  /* Cyan */
  hsl(270 100% 65%)   /* Purple */
);
```

---

## Рекомендации по использованию

### Light Mode
1. ✅ Используйте темно-серые карточки для группировки контента
2. ✅ Яркий синий для главных действий
3. ✅ Оранжевый для акцентов и бейджей
4. ✅ Светло-бежевый фон для комфорта глаз
5. ⚠️ Избегайте чистого белого (#FFFFFF) для больших областей

### Dark Mode
1. ✅ Используйте неоновые цвета для акцентов
2. ✅ Glow эффекты для важных элементов
3. ✅ True black для экономии батареи на OLED
4. ✅ Полупрозрачность для карточек
5. ⚠️ Не перегружайте glow эффектами

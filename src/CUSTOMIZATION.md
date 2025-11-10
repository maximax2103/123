# 🎨 Руководство по кастомизации

## 📝 Изменение заданий

### Где находится: `/lib/api.ts`

### Функция: `getDefaultTasks()`

```typescript
function getDefaultTasks(): TaskData[] {
  return [
    // =============== ЗАДАНИЕ 1 ===============
    {
      id: 1,
      title: "Подписаться на канал",              // 📝 Название задания
      description: "Подпишитесь на наш канал",     // 📝 Описание
      reward: 500,                                  // 💰 Награда в stars
      type: "social",                               // 🏷️ Тип: social/daily/special
      action_url: "https://t.me/your_channel",     // 🔗 Ссылка на канал
      is_active: true,                              // ✅ Активно
      created_at: new Date().toISOString(),
    },
    
    // =============== ЗАДАНИЕ 2 ===============
    {
      id: 2,
      title: "Вступить в группу",
      description: "Присоединяйтесь к нашей группе",
      reward: 300,
      type: "social",
      action_url: "https://t.me/your_group",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    
    // Добавьте больше заданий...
  ];
}
```

### Типы заданий:

| Тип | Описание | Цвет |
|-----|----------|------|
| `"social"` | Соц. сети (подписки) | 🔵 Синий |
| `"daily"` | Ежедневные задания | 🟢 Зеленый |
| `"special"` | Специальные задания | 🟣 Фиолетовый |

### Примеры заданий:

#### Подписка на канал
```typescript
{
  id: 1,
  title: "Подписаться на новостной канал",
  description: "Следите за нашими обновлениями",
  reward: 500,
  type: "social",
  action_url: "https://t.me/my_news_channel",
  is_active: true,
  created_at: new Date().toISOString(),
}
```

#### Вступление в группу
```typescript
{
  id: 2,
  title: "Вступить в сообщество",
  description: "Присоединяйтесь к обсуждениям",
  reward: 400,
  type: "social",
  action_url: "https://t.me/my_community",
  is_active: true,
  created_at: new Date().toISOString(),
}
```

#### Ежедневный вход
```typescript
{
  id: 3,
  title: "Ежедневный бонус",
  description: "Заходите каждый день",
  reward: 100,
  type: "daily",
  // Без action_url - просто нажать кнопку
  is_active: true,
  created_at: new Date().toISOString(),
}
```

#### Специальное задание
```typescript
{
  id: 4,
  title: "Пригласить 5 друзей",
  description: "Получите бонус за 5 рефералов",
  reward: 1000,
  type: "special",
  is_active: true,
  created_at: new Date().toISOString(),
}
```

---

## 💰 Изменение наград

### Где находится: `/lib/database.types.ts`

### Награды за события:

```typescript
export const REWARDS = {
  REFERRAL: 500,        // 💰 За каждого реферала
  DAILY_LOGIN: 100,     // 💰 За ежедневный вход
} as const;
```

### Примеры изменений:

```typescript
// Щедрая реферальная программа
export const REWARDS = {
  REFERRAL: 1000,       // Увеличено до 1000
  DAILY_LOGIN: 200,     // Увеличено до 200
}

// Или экономная
export const REWARDS = {
  REFERRAL: 250,        // Уменьшено до 250
  DAILY_LOGIN: 50,      // Уменьшено до 50
}
```

---

## 📊 Изменение системы уровней

### Где находится: `/lib/database.types.ts`

### Таблица уровней:

```typescript
export const LEVELS = [
  { level: 1, required_exp: 0 },
  { level: 2, required_exp: 500 },
  { level: 3, required_exp: 1000 },
  { level: 4, required_exp: 2000 },
  { level: 5, required_exp: 3000 },
  { level: 6, required_exp: 5000 },
  { level: 7, required_exp: 7500 },
  { level: 8, required_exp: 10000 },
  { level: 9, required_exp: 15000 },
  { level: 10, required_exp: 20000 },
];
```

### Пример: Быстрая прогрессия

```typescript
export const LEVELS = [
  { level: 1, required_exp: 0 },
  { level: 2, required_exp: 100 },      // Легче
  { level: 3, required_exp: 300 },      // Легче
  { level: 4, required_exp: 600 },      // Легче
  { level: 5, required_exp: 1000 },     // Легче
  { level: 6, required_exp: 1500 },
  { level: 7, required_exp: 2500 },
  { level: 8, required_exp: 4000 },
  { level: 9, required_exp: 6000 },
  { level: 10, required_exp: 10000 },
];
```

### Пример: Медленная прогрессия

```typescript
export const LEVELS = [
  { level: 1, required_exp: 0 },
  { level: 2, required_exp: 1000 },     // Сложнее
  { level: 3, required_exp: 3000 },     // Сложнее
  { level: 4, required_exp: 6000 },     // Сложнее
  { level: 5, required_exp: 10000 },    // Сложнее
  { level: 6, required_exp: 15000 },
  { level: 7, required_exp: 25000 },
  { level: 8, required_exp: 40000 },
  { level: 9, required_exp: 60000 },
  { level: 10, required_exp: 100000 },
];
```

---

## 🎨 Изменение цветов и темы

### Где находится: `/styles/globals.css`

### Основные цвета (темная тема):

```css
.dark {
  --background: oklch(0.145 0 0);         /* 🌑 Фон */
  --foreground: oklch(0.985 0 0);         /* 📝 Текст */
  --primary: oklch(0.985 0 0);            /* 🎯 Основной цвет */
  --secondary: oklch(0.269 0 0);          /* 🔘 Вторичный */
  --muted: oklch(0.269 0 0);              /* 🔇 Приглушенный */
  --accent: oklch(0.269 0 0);             /* ✨ Акцент */
  --border: oklch(0.269 0 0);             /* 📏 Границы */
}
```

### Пример: Синяя тема

```css
.dark {
  --background: #0a0e27;                  /* Темно-синий фон */
  --foreground: #e8eaf6;                  /* Светлый текст */
  --primary: #5c6bc0;                     /* Синий основной */
  --secondary: #283593;                   /* Темно-синий */
  --accent: #7986cb;                      /* Светло-синий акцент */
  --border: #1a237e;                      /* Синие границы */
}
```

### Пример: Фиолетовая тема

```css
.dark {
  --background: #1a0033;                  /* Темно-фиолетовый */
  --foreground: #f3e5f5;                  /* Светлый текст */
  --primary: #ab47bc;                     /* Фиолетовый */
  --secondary: #6a1b9a;                   /* Темно-фиолетовый */
  --accent: #ce93d8;                      /* Светло-фиолетовый */
  --border: #4a148c;                      /* Границы */
}
```

### Пример: Зеленая тема

```css
.dark {
  --background: #0d1f12;                  /* Темно-зеленый */
  --foreground: #e8f5e9;                  /* Светлый текст */
  --primary: #66bb6a;                     /* Зеленый */
  --secondary: #2e7d32;                   /* Темно-зеленый */
  --accent: #81c784;                      /* Светло-зеленый */
  --border: #1b5e20;                      /* Границы */
}
```

---

## 🔗 Изменение реферальной ссылки

### Где находится: `/components/ReferralTab.tsx`

### Строка 19:

```typescript
// БЫЛО:
const botUsername = "your_bot";

// СТАЛО:
const botUsername = "mytaskbot";  // Ваш username без @
```

### Формат ссылки:

```
https://t.me/{botUsername}?start=ref{userId}
```

### Пример:
- Bot: `@mytaskbot`
- User ID: `123456`
- Ссылка: `https://t.me/mytaskbot?start=ref123456`

---

## 📝 Изме��ение текстов интерфейса

### Заголовки вкладок

#### TasksTab.tsx (строки 127-131)
```typescript
<h2>Задания</h2>                          // Заголовок
<p className="text-muted-foreground">
  Выполняйте задания и получайте награды  // Подзаголовок
</p>
```

#### ReferralTab.tsx (строки 59-63)
```typescript
<h2>Реферальная система</h2>
<p className="text-muted-foreground">
  Приглашайте друзей и получайте бонусы
</p>
```

#### ProfileTab.tsx (строки 68-72)
```typescript
<h2>Профиль</h2>
<p className="text-muted-foreground">
  Ваша статистика и достижения
</p>
```

### Названия вкладок

#### App.tsx (строки 55-78)
```typescript
<span className="text-xs">Задания</span>    // Вкладка 1
<span className="text-xs">Рефералы</span>   // Вкладка 2
<span className="text-xs">Профиль</span>    // Вкладка 3
```

---

## 🎁 Добавление нового задания

### Шаг 1: Откройте `/lib/api.ts`

### Шаг 2: Найдите `getDefaultTasks()`

### Шаг 3: Добавьте новое задание:

```typescript
{
  id: 6,  // ⚠️ Уникальный ID (следующий после 5)
  title: "Ваше новое задание",
  description: "Описание того, что нужно сделать",
  reward: 750,  // Награда
  type: "social",  // или "daily", "special"
  action_url: "https://t.me/your_link",  // Опционально
  is_active: true,
  created_at: new Date().toISOString(),
},
```

### Пример: Задание "Поставить лайк посту"

```typescript
{
  id: 6,
  title: "Поставить лайк нашему посту",
  description: "Поддержите нас реакцией ❤️",
  reward: 200,
  type: "social",
  action_url: "https://t.me/channel/123",  // Ссылка на пост
  is_active: true,
  created_at: new Date().toISOString(),
},
```

---

## 🎯 Изменение опыта за задания

### Где находится: `/lib/api.ts`

### Функция: `completeTask()` (строка 149)

```typescript
// Текущая формула: 10% от награды
await updateUserExperience(userId, Math.floor(task.reward / 10));

// Примеры изменений:

// 20% от награды (больше опыта)
await updateUserExperience(userId, Math.floor(task.reward / 5));

// Фиксированный опыт (50 XP за любое задание)
await updateUserExperience(userId, 50);

// Зависит от типа задания
const expReward = task.type === "special" ? 100 : 
                  task.type === "daily" ? 20 : 50;
await updateUserExperience(userId, expReward);
```

---

## 🏆 Добавление достижений (пример)

### Шаг 1: Создайте тип в `/lib/database.types.ts`

```typescript
export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: "tasks" | "referrals" | "level" | "balance";
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    title: "Новичок",
    description: "Выполните первое задание",
    icon: "🎯",
    requirement: 1,
    type: "tasks",
  },
  {
    id: 2,
    title: "Социальный",
    description: "Пригласите 10 друзей",
    icon: "👥",
    requirement: 10,
    type: "referrals",
  },
  {
    id: 3,
    title: "Богач",
    description: "Накопите 10,000 stars",
    icon: "💰",
    requirement: 10000,
    type: "balance",
  },
];
```

### Шаг 2: Создайте компонент `/components/AchievementsCard.tsx`

```typescript
import { Trophy } from "lucide-react";
import { Card } from "./ui/card";
import { ACHIEVEMENTS } from "../lib/database.types";

export function AchievementsCard({ userData }: { userData: UserData }) {
  const checkAchievement = (achievement: Achievement) => {
    switch (achievement.type) {
      case "tasks":
        return userData.tasks_completed >= achievement.requirement;
      case "referrals":
        return userData.referrals_count >= achievement.requirement;
      case "balance":
        return userData.balance >= achievement.requirement;
      case "level":
        return userData.level >= achievement.requirement;
      default:
        return false;
    }
  };

  return (
    <Card className="p-4">
      <h3 className="mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        Достижения
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {ACHIEVEMENTS.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-3 text-center rounded-lg ${
              checkAchievement(achievement)
                ? "bg-green-500/10"
                : "bg-muted opacity-50"
            }`}
          >
            <div className="text-2xl mb-1">{achievement.icon}</div>
            <div className="text-xs">{achievement.title}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

### Шаг 3: Добавьте в ProfileTab.tsx

```typescript
import { AchievementsCard } from "./AchievementsCard";

// В render:
<AchievementsCard userData={userData} />
```

---

## 🔔 Кастомизация уведомлений

### Где находится: Разные компоненты

### Примеры toast уведомлений:

```typescript
// Успех
toast.success("Задание выполнено!", {
  description: "Вы получили 500 stars",
});

// Ошибка
toast.error("Ошибка!", {
  description: "Не удалось выполнить задание",
});

// Информация
toast("Информация", {
  description: "Новое задание доступно",
});

// С эмодзи
toast.success("🎉 Поздравляем!", {
  description: "Вы достигли 5 уровня!",
});
```

---

## 📱 Кастомизация иконок

### Изменение иконок вкладок

#### App.tsx (строки 54-78)

```typescript
// Текущие иконки:
import { ListTodo, Users, UserCircle } from "lucide-react";

// Можно заменить на:
import { Sparkles, Share2, User } from "lucide-react";

// И использовать:
<Sparkles className="w-6 h-6" />  // Задания
<Share2 className="w-6 h-6" />    // Рефералы
<User className="w-6 h-6" />      // Профиль
```

### Все доступные иконки:
- [Lucide Icons](https://lucide.dev/icons/)

---

## 💡 Полезные советы

### 1. Тестирование изменений
После любых изменений:
```bash
# Локально
npm run dev

# На Vercel (автоматически при push)
git add .
git commit -m "Updated tasks"
git push
```

### 2. Резервное копирование
Перед большими изменениями:
```bash
# Создайте копию файла
cp lib/api.ts lib/api.backup.ts
```

### 3. Постепенные изменения
- Меняйте по одному параметру
- Тестируйте после каждого изменения
- Сохраняйте рабочие версии

### 4. Проверка ошибок
- Откройте консоль браузера (F12)
- Проверяйте на ошибки после изменений
- Читайте сообщения об ошибках

---

## ✅ Чек-лист после изменений

- [ ] Код сохранен
- [ ] Нет синтаксических ошибок
- [ ] Проверено локально (`npm run dev`)
- [ ] Задеплоено на Vercel
- [ ] Проверено в Telegram
- [ ] Все функции работают

---

**Готово! Теперь приложение настроено под ваши нужды! 🎉**

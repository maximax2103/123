import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Types
interface UserData {
  user_id: number;
  first_name: string;
  username?: string;
  balance: number;
  level: number;
  experience: number;
  tasks_completed: number;
  referrals_count: number;
  referred_by?: number;
  created_at: string;
  last_active: string;
}

interface TaskData {
  id: number;
  title: string;
  description: string;
  reward: number;
  type: "daily" | "social" | "special";
  action_url?: string;
  is_active: boolean;
  created_at: string;
}

interface UserTask {
  user_id: number;
  task_id: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

interface ReferralData {
  referrer_id: number;
  referred_id: number;
  reward_claimed: boolean;
  created_at: string;
}

const REWARDS = {
  REFERRAL: 500,
};

function calculateLevel(experience: number): { level: number; currentExp: number; nextLevelExp: number } {
  const baseExp = 100;
  const expMultiplier = 1.5;
  
  let level = 1;
  let expForNextLevel = baseExp;
  let totalExpForCurrentLevel = 0;
  
  while (experience >= totalExpForCurrentLevel + expForNextLevel) {
    totalExpForCurrentLevel += expForNextLevel;
    level++;
    expForNextLevel = Math.floor(baseExp * Math.pow(expMultiplier, level - 1));
  }
  
  const currentExp = experience - totalExpForCurrentLevel;
  return { level, currentExp, nextLevelExp: expForNextLevel };
}

function getDefaultTasks(): TaskData[] {
  return [
    {
      id: 1,
      title: "Подписаться на канал",
      description: "Подпишитесь на наш Telegram канал",
      reward: 500,
      type: "social",
      action_url: "https://t.me/your_channel",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Пригласить 5 друзей",
      description: "Пригласите 5 друзей и получите бонус",
      reward: 1000,
      type: "special",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Ежедневный вход",
      description: "Заходите в приложение каждый день",
      reward: 100,
      type: "daily",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 4,
      title: "Поделиться в истории",
      description: "Поделитесь приложением в своей истории",
      reward: 300,
      type: "social",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 5,
      title: "Достичь 10 рефералов",
      description: "Пригласите 10 активных пользователей",
      reward: 2000,
      type: "special",
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Сегодня";
  if (diffInDays === 1) return "Вчера";
  if (diffInDays < 7) return `${diffInDays} дня назад`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} недели назад`;
  return `${Math.floor(diffInDays / 30)} месяца назад`;
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-3d050cd2/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize default tasks
app.post("/make-server-3d050cd2/initialize", async (c) => {
  try {
    const defaultTasks = getDefaultTasks();
    
    for (const task of defaultTasks) {
      const key = `task:${task.id}`;
      const existing = await kv.get(key);
      if (!existing) {
        await kv.set(key, task);
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error initializing app:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get or create user
app.post("/make-server-3d050cd2/users", async (c) => {
  try {
    const { telegramUserId, firstName, username } = await c.req.json();
    const key = `user:${telegramUserId}`;
    
    const existingUser = await kv.get<UserData>(key);
    
    if (existingUser) {
      existingUser.last_active = new Date().toISOString();
      await kv.set(key, existingUser);
      return c.json(existingUser);
    }
    
    const newUser: UserData = {
      user_id: telegramUserId,
      first_name: firstName,
      username: username,
      balance: 0,
      level: 1,
      experience: 0,
      tasks_completed: 0,
      referrals_count: 0,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    };
    
    await kv.set(key, newUser);
    return c.json(newUser);
  } catch (error) {
    console.error("Error getting/creating user:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get user
app.get("/make-server-3d050cd2/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const user = await kv.get<UserData>(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get tasks
app.get("/make-server-3d050cd2/tasks", async (c) => {
  try {
    const tasks = await kv.getByPrefix<TaskData>("task:");
    const activeTasks = tasks.filter(task => task.is_active);
    return c.json(activeTasks);
  } catch (error) {
    console.error("Error getting tasks:", error);
    return c.json(getDefaultTasks());
  }
});

// Get user tasks
app.get("/make-server-3d050cd2/users/:userId/tasks", async (c) => {
  try {
    const userId = c.req.param("userId");
    const key = `user_tasks:${userId}`;
    const userTasks = await kv.get<UserTask[]>(key) || [];
    
    return c.json(userTasks);
  } catch (error) {
    console.error("Error getting user tasks:", error);
    return c.json([]);
  }
});

// Complete task
app.post("/make-server-3d050cd2/users/:userId/tasks/:taskId/complete", async (c) => {
  try {
    const userId = parseInt(c.req.param("userId"));
    const taskId = parseInt(c.req.param("taskId"));
    
    // Получаем задание
    const task = await kv.get<TaskData>(`task:${taskId}`);
    if (!task) {
      return c.json({ success: false, error: "Task not found" }, 404);
    }
    
    // Проверяем, не выполнено ли уже
    const userTasksKey = `user_tasks:${userId}`;
    const userTasks = await kv.get<UserTask[]>(userTasksKey) || [];
    
    const existingTask = userTasks.find(t => t.task_id === taskId);
    if (existingTask?.completed) {
      return c.json({ success: false, error: "Task already completed" }, 400);
    }
    
    // Добавляем выполненное задание
    const completedTask: UserTask = {
      user_id: userId,
      task_id: taskId,
      completed: true,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    
    const updatedTasks = existingTask 
      ? userTasks.map(t => t.task_id === taskId ? completedTask : t)
      : [...userTasks, completedTask];
    
    await kv.set(userTasksKey, updatedTasks);
    
    // Начисляем награду
    const userKey = `user:${userId}`;
    const user = await kv.get<UserData>(userKey);
    
    if (user) {
      user.balance += task.reward;
      user.tasks_completed += 1;
      user.experience += Math.floor(task.reward / 10);
      
      const { level } = calculateLevel(user.experience);
      user.level = level;
      user.last_active = new Date().toISOString();
      
      await kv.set(userKey, user);
      
      return c.json({ success: true, reward: task.reward, user });
    }
    
    return c.json({ success: false, error: "User not found" }, 404);
  } catch (error) {
    console.error("Error completing task:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Process referral
app.post("/make-server-3d050cd2/referrals", async (c) => {
  try {
    const { referrerId, referredId } = await c.req.json();
    
    // Проверяем, не реферил ли уже этот пользователь
    const referredUser = await kv.get<UserData>(`user:${referredId}`);
    if (referredUser?.referred_by) {
      return c.json({ success: false, error: "User already has a referrer" }, 400);
    }
    
    // Обновляем реферала
    if (referredUser) {
      referredUser.referred_by = referrerId;
      await kv.set(`user:${referredId}`, referredUser);
    }
    
    // Создаем запись о реферале
    const referralKey = `referral:${referrerId}:${referredId}`;
    const referral: ReferralData = {
      referrer_id: referrerId,
      referred_id: referredId,
      reward_claimed: false,
      created_at: new Date().toISOString(),
    };
    await kv.set(referralKey, referral);
    
    // Обновляем счетчик рефералов и начисляем награду
    const referrer = await kv.get<UserData>(`user:${referrerId}`);
    if (referrer) {
      referrer.referrals_count += 1;
      referrer.balance += REWARDS.REFERRAL;
      referrer.experience += 50;
      
      const { level } = calculateLevel(referrer.experience);
      referrer.level = level;
      
      await kv.set(`user:${referrerId}`, referrer);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error processing referral:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get referral details
app.get("/make-server-3d050cd2/users/:userId/referrals", async (c) => {
  try {
    const userId = c.req.param("userId");
    const referrals = await kv.getByPrefix<ReferralData>(`referral:${userId}:`);
    
    const sortedReferrals = referrals.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const details = [];
    
    for (const ref of sortedReferrals) {
      const user = await kv.get<UserData>(`user:${ref.referred_id}`);
      if (user) {
        details.push({
          id: user.user_id,
          name: user.first_name,
          earned: REWARDS.REFERRAL,
          date: formatRelativeDate(ref.created_at),
        });
      }
    }
    
    return c.json(details);
  } catch (error) {
    console.error("Error getting referral details:", error);
    return c.json([]);
  }
});

Deno.serve(app.fetch);

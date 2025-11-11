// API функции для работы с backend через KV store

import * as kv from "../utils/supabase/kv_store";
import { UserData, TaskData, UserTask, ReferralData, REWARDS, calculateLevel } from "./database.types";

// ==================== ПОЛЬЗОВАТЕЛИ ====================

export async function getOrCreateUser(telegramUserId: number, firstName: string, username?: string): Promise<UserData> {
  const key = `user:${telegramUserId}`;
  
  try {
    const existingUser = await kv.get<UserData>(key);
    
    if (existingUser) {
      // Обновляем last_active
      existingUser.last_active = new Date().toISOString();
      await kv.set(key, existingUser);
      return existingUser;
    }
    
    // Создаем нового пользователя
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
    return newUser;
  } catch (error) {
    console.error("Error getting/creating user:", error);
    throw error;
  }
}

export async function updateUserBalance(userId: number, amount: number): Promise<UserData | null> {
  const key = `user:${userId}`;
  
  try {
    const user = await kv.get<UserData>(key);
    if (!user) return null;
    
    user.balance += amount;
    user.last_active = new Date().toISOString();
    
    await kv.set(key, user);
    return user;
  } catch (error) {
    console.error("Error updating user balance:", error);
    throw error;
  }
}

export async function updateUserExperience(userId: number, exp: number): Promise<UserData | null> {
  const key = `user:${userId}`;
  
  try {
    const user = await kv.get<UserData>(key);
    if (!user) return null;
    
    user.experience += exp;
    const { level } = calculateLevel(user.experience);
    user.level = level;
    user.last_active = new Date().toISOString();
    
    await kv.set(key, user);
    return user;
  } catch (error) {
    console.error("Error updating user experience:", error);
    throw error;
  }
}

// ==================== ЗАДАНИЯ ====================

export async function getTasks(): Promise<TaskData[]> {
  try {
    const tasks = await kv.getByPrefix<TaskData>("task:");
    return tasks.filter(task => task.is_active);
  } catch (error) {
    console.error("Error getting tasks:", error);
    return getDefaultTasks();
  }
}

export async function initializeDefaultTasks(): Promise<void> {
  const defaultTasks = getDefaultTasks();
  
  try {
    for (const task of defaultTasks) {
      const key = `task:${task.id}`;
      const existing = await kv.get(key);
      if (!existing) {
        await kv.set(key, task);
      }
    }
  } catch (error) {
    console.error("Error initializing tasks:", error);
  }
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

export async function getUserTasks(userId: number): Promise<Map<number, UserTask>> {
  const key = `user_tasks:${userId}`;
  
  try {
    const userTasks = await kv.get<UserTask[]>(key);
    const tasksMap = new Map<number, UserTask>();
    
    if (userTasks) {
      userTasks.forEach(task => tasksMap.set(task.task_id, task));
    }
    
    return tasksMap;
  } catch (error) {
    console.error("Error getting user tasks:", error);
    return new Map();
  }
}

export async function completeTask(userId: number, taskId: number): Promise<{ success: boolean; reward: number; user?: UserData }> {
  try {
    // Получаем задание
    const task = await kv.get<TaskData>(`task:${taskId}`);
    if (!task) {
      return { success: false, reward: 0 };
    }
    
    // Проверяем, не выполнено ли уже
    const userTasksKey = `user_tasks:${userId}`;
    const userTasks = await kv.get<UserTask[]>(userTasksKey) || [];
    
    const existingTask = userTasks.find(t => t.task_id === taskId);
    if (existingTask?.completed) {
      return { success: false, reward: 0 };
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
    const updatedUser = await updateUserBalance(userId, task.reward);
    if (updatedUser) {
      updatedUser.tasks_completed += 1;
      await kv.set(`user:${userId}`, updatedUser);
      
      // Добавляем опыт
      await updateUserExperience(userId, Math.floor(task.reward / 10));
    }
    
    return { success: true, reward: task.reward, user: updatedUser || undefined };
  } catch (error) {
    console.error("Error completing task:", error);
    return { success: false, reward: 0 };
  }
}

// ==================== РЕФЕРАЛЫ ====================

export async function processReferral(referrerId: number, referredId: number): Promise<boolean> {
  try {
    // Проверяем, не реферил ли уже этот пользователь
    const referredUser = await kv.get<UserData>(`user:${referredId}`);
    if (referredUser?.referred_by) {
      return false; // Уже имеет реферера
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
    
    // Обновляем счетчик рефералов
    const referrer = await kv.get<UserData>(`user:${referrerId}`);
    if (referrer) {
      referrer.referrals_count += 1;
      await kv.set(`user:${referrerId}`, referrer);
    }
    
    // Начисляем награду реферу
    await updateUserBalance(referrerId, REWARDS.REFERRAL);
    await updateUserExperience(referrerId, 50);
    
    return true;
  } catch (error) {
    console.error("Error processing referral:", error);
    return false;
  }
}

export async function getUserReferrals(userId: number): Promise<ReferralData[]> {
  try {
    const referrals = await kv.getByPrefix<ReferralData>(`referral:${userId}:`);
    return referrals.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error("Error getting user referrals:", error);
    return [];
  }
}

export async function getReferralDetails(userId: number): Promise<Array<{ id: number; name: string; earned: number; date: string }>> {
  try {
    const referrals = await getUserReferrals(userId);
    const details = [];
    
    for (const ref of referrals) {
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
    
    return details;
  } catch (error) {
    console.error("Error getting referral details:", error);
    return [];
  }
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

// Инициализация приложения
export async function initializeApp() {
  await initializeDefaultTasks();
}

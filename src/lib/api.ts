// API функции для работы с backend

import { projectId, publicAnonKey } from "../utils/supabase/info";
import { UserData, TaskData, UserTask, REWARDS, calculateLevel, TelegramUser } from "./database.types";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3d050cd2`;

// Хелпер для fetch запросов
async function fetchAPI<T>(endpoint: string, initDataRaw?: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (publicAnonKey) {
    headers["Authorization"] = `Bearer ${publicAnonKey}`;
  }

  if (initDataRaw) {
    headers["X-Telegram-Init-Data"] = initDataRaw; // Новый заголовок для initDataRaw
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

// ==================== ПОЛЬЗОВАТЕЛИ ====================

export async function getOrCreateUser(initDataRaw: string, telegramUserId: number, firstName: string, username?: string): Promise<UserData> {
  try {
    return await fetchAPI<UserData>("/users", initDataRaw, {
      method: "POST",
      body: JSON.stringify({ telegramUserId, firstName, username }),
    });
  } catch (error) {
    console.error("Error getting/creating user:", error);
    throw error;
  }
}

export async function getUser(initDataRaw: string, userId: number): Promise<UserData> {
  try {
    return await fetchAPI<UserData>(`/users/${userId}`, initDataRaw);
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

// ==================== ЗАДАНИЯ ====================

export async function getTasks(initDataRaw: string): Promise<TaskData[]> {
  try {
    return await fetchAPI<TaskData[]>("/tasks", initDataRaw);
  } catch (error) {
    console.error("Error getting tasks:", error);
    return [];
  }
}

export async function getUserTasks(initDataRaw: string, userId: number): Promise<Map<number, UserTask>> {
  try {
    const userTasks = await fetchAPI<UserTask[]>(`/users/${userId}/tasks`, initDataRaw);
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

export async function completeTask(initDataRaw: string, userId: number, taskId: number): Promise<{ success: boolean; reward: number; user?: UserData; error?: string }> {
  try {
    return await fetchAPI<{ success: boolean; reward: number; user?: UserData }>(`/users/${userId}/tasks/${taskId}/complete`, initDataRaw, {
      method: "POST",
    });
  } catch (error) {
    console.error("Error completing task:", error);
    return { success: false, reward: 0, error: String(error) };
  }
}

// ==================== РЕФЕРАЛЫ ====================

export async function processReferral(initDataRaw: string, referrerId: number, referredId: number): Promise<boolean> {
  try {
    const result = await fetchAPI<{ success: boolean }>("/referrals", initDataRaw, {
      method: "POST",
      body: JSON.stringify({ referrerId, referredId }),
    });
    return result.success;
  } catch (error) {
    console.error("Error processing referral:", error);
    return false;
  }
}

export async function getReferralDetails(initDataRaw: string, userId: number): Promise<Array<{ id: number; name: string; earned: number; date: string }>> {
  try {
    return await fetchAPI<Array<{ id: number; name: string; earned: number; date: string }>>(`/users/${userId}/referrals`, initDataRaw);
  } catch (error) {
    console.error("Error getting referral details:", error);
    return [];
  }
}

// Инициализация приложения
export async function initializeApp(initDataRaw: string) {
  try {
    await fetchAPI("/initialize", initDataRaw, { method: "POST" });
  } catch (error) {
    console.error("Error initializing app:", error);
  }
}

import { useEffect, useState } from "react";
import { retrieveLaunchParams, type LaunchParams } from '@telegram-apps/sdk';
import { telegram } from "../lib/telegram"; // Сохраняем для методов API, таких как hapticFeedback

interface TelegramUserAdapted {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUserAdapted | null>(null);
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);
  const [startParam, setStartParam] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { initDataRaw: raw, initData } = retrieveLaunchParams();
    console.log("retrieveLaunchParams result:", { raw, initData });

    if (initData.user) {
      setUser({ // Адаптируем тип LaunchParams['initData']['user'] к TelegramUserAdapted
        id: initData.user.id,
        first_name: initData.user.first_name,
        last_name: initData.user.last_name,
        username: initData.user.username,
        language_code: initData.user.language_code,
        is_premium: initData.user.is_premium,
      });
      setInitDataRaw(raw);
      setStartParam(initData.startParam || null);
    } else {
      console.warn("No Telegram user data found in launch params. Using mock data for development.");
      // В браузере initData.user будет null, используем заглушку
      setUser({
        id: 123456789,
        first_name: "Mock",
        last_name: "User",
        username: "mockuser",
        is_premium: false,
      });
      setInitDataRaw("mock_init_data_raw"); // Для теста
      setStartParam(null);
    }
    setIsLoading(false);
  }, []);

  return {
    user,
    userId: user?.id || null,
    isLoading,
    startParam,
    initDataRaw,
    isAvailable: typeof window !== "undefined" && window.Telegram?.WebApp !== undefined, // Простая проверка наличия WebApp
    hapticFeedback: telegram.hapticFeedback.bind(telegram),
    hapticNotification: telegram.hapticNotification.bind(telegram),
    showAlert: telegram.showAlert.bind(telegram),
    showConfirm: telegram.showConfirm.bind(telegram),
    close: telegram.close.bind(telegram),
    openLink: telegram.openLink.bind(telegram),
    openTelegramLink: telegram.openTelegramLink.bind(telegram),
  };
}

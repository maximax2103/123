import { useEffect, useState } from "react";
import { telegram, TelegramUser } from "../lib/telegram";

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = () => {
      if (telegram.isAvailable()) {
        const tgUser = telegram.getUser();
        setUser(tgUser);
      } else {
        console.warn("Telegram WebApp not available, using mock user");
        setUser(telegram.getMockUser());
      }
      setIsLoading(false);
    };

    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      // Если WebApp уже готов, инициализируем сразу
      if (window.Telegram.WebApp.ready) {
        window.Telegram.WebApp.ready(initializeUser);
      } else {
        // Если ready() не существует (старая версия SDK или что-то еще), пробуем инициализировать сразу
        initializeUser();
      }
    } else {
      // Если window.Telegram не определен, значит мы не в среде Telegram Web App
      console.warn("window.Telegram is not defined, initializing with mock user after a delay.");
      const timer = setTimeout(() => {
        initializeUser();
      }, 500); // Небольшая задержка на случай, если SDK еще загружается
      return () => clearTimeout(timer);
    }

  }, []);

  return {
    user,
    userId: user?.id || null,
    isLoading,
    startParam: telegram.getStartParam(),
    isAvailable: telegram.isAvailable(),
    hapticFeedback: telegram.hapticFeedback.bind(telegram),
    hapticNotification: telegram.hapticNotification.bind(telegram),
    showAlert: telegram.showAlert.bind(telegram),
    showConfirm: telegram.showConfirm.bind(telegram),
    close: telegram.close.bind(telegram),
    openLink: telegram.openLink.bind(telegram),
    openTelegramLink: telegram.openTelegramLink.bind(telegram),
  };
}

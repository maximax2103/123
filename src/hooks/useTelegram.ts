import { useEffect, useState } from "react";
import { telegram, TelegramUser } from "../lib/telegram";

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeTelegram = () => {
      // Проверяем доступность Telegram WebApp
      if (telegram.isAvailable()) {
        console.log("Telegram WebApp is available.");
        const tgUser = telegram.getUser();
        console.log("Telegram User Data:", tgUser);
        setUser(tgUser);
      } else {
        // Для разработки используем mock пользователя
        console.warn("Telegram WebApp not available, using mock user");
        const mockUser = telegram.getMockUser();
        console.log("Mock User Data:", mockUser);
        setUser(mockUser);
      }
      setIsLoading(false);
    };

    if (typeof window !== "undefined" && window.Telegram) {
      // Если Telegram SDK уже загружен
      if (window.Telegram.WebApp.ready) {
        window.Telegram.WebApp.ready(() => {
          initializeTelegram();
        });
      } else {
        // Fallback, если ready уже был вызван или по какой-то причине недоступен (редко)
        initializeTelegram();
      }
    } else {
      // Если Telegram SDK еще не загружен или не определен
      // Можно добавить задержку или другую логику ожидания
      console.warn("window.Telegram is not defined, delaying initialization.");
      const timer = setTimeout(() => {
        initializeTelegram();
      }, 500); // Попытка инициализации через 500мс
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

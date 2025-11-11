import { useEffect, useState } from "react";
import { telegram, TelegramUser } from "../lib/telegram";

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeTelegram = () => {
      console.log("Checking Telegram WebApp availability...");
      console.log("window.Telegram?.WebApp:", window.Telegram?.WebApp);
      console.log("telegram.isAvailable():", telegram.isAvailable());

      if (telegram.isAvailable()) {
        console.log("Telegram WebApp is available.");
        const tgUser = telegram.getUser();
        console.log("Telegram User Data:", tgUser);
        setUser(tgUser);
      } else {
        console.warn("Telegram WebApp not available, using mock user");
        const mockUser = telegram.getMockUser();
        console.log("Mock User Data:", mockUser);
        setUser(mockUser);
      }
      setIsLoading(false);
    };

    if (typeof window !== "undefined" && window.Telegram) {
      console.log("window.Telegram is defined.");
      if (window.Telegram.WebApp.ready) {
        console.log("Waiting for Telegram.WebApp.ready event...");
        window.Telegram.WebApp.ready(() => {
          console.log("Telegram.WebApp is ready.");
          initializeTelegram();
        });
      } else {
        console.warn("Telegram.WebApp.ready event not available, initializing immediately.");
        initializeTelegram();
      }
    } else {
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

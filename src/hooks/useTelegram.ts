import { useEffect, useState } from "react";
import { telegram, TelegramUser } from "../lib/telegram";

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("useTelegram useEffect triggered.");

    const initializeUser = () => {
      console.log("initializeUser called.");
      console.log("Checking telegram.isAvailable():", telegram.isAvailable());
      if (telegram.isAvailable()) {
        const tgUser = telegram.getUser();
        console.log("Telegram WebApp is available. User data:", tgUser);
        setUser(tgUser);
      } else {
        console.warn("Telegram WebApp not available, using mock user.");
        const mockUser = telegram.getMockUser();
        console.log("Mock User Data:", mockUser);
        setUser(mockUser);
      }
      setIsLoading(false);
    };

    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      console.log("window.Telegram.WebApp is defined.");
      if (window.Telegram.WebApp.ready) {
        console.log("window.Telegram.WebApp.ready() is available. Attaching callback.");
        window.Telegram.WebApp.ready(initializeUser);
      } else {
        console.warn("window.Telegram.WebApp.ready() is NOT available. Initializing immediately.");
        initializeUser();
      }
    } else {
      console.warn("window.Telegram or window.Telegram.WebApp is NOT defined. Delaying initialization.");
      const timer = setTimeout(() => {
        initializeUser();
      }, 1000); // Увеличил задержку на всякий случай
      return () => { 
        console.log("Clearing initialization timer.");
        clearTimeout(timer);
      };
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

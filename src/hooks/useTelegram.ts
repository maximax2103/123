import { useEffect, useState } from "react";
import { telegram, TelegramUser } from "../lib/telegram";

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем доступность Telegram WebApp
    if (telegram.isAvailable()) {
      const tgUser = telegram.getUser();
      setUser(tgUser);
    } else {
      // Для разработки используем mock пользователя
      console.warn("Telegram WebApp not available, using mock user");
      setUser(telegram.getMockUser());
    }
    setIsLoading(false);
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

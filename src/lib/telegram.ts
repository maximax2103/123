import { type TelegramUser } from "./database.types";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          query_id?: string;
          user?: TelegramUser;
          auth_date?: number;
          hash?: string;
          start_param?: string;
        };
        version: string;
        platform: string;
        colorScheme: "light" | "dark";
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        BackButton: {
          isVisible: boolean;
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText(text: string): void;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          showProgress(leaveActive?: boolean): void;
          hideProgress(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
        };
        HapticFeedback: {
          impactOccurred(style: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
          notificationOccurred(type: "error" | "success" | "warning"): void;
          selectionChanged(): void;
        };
        ready(): void;
        expand(): void;
        close(): void;
        enableClosingConfirmation(): void;
        disableClosingConfirmation(): void;
        onEvent(eventType: string, callback: () => void): void;
        offEvent(eventType: string, callback: () => void): void;
        sendData(data: string): void;
        openLink(url: string, options?: { try_instant_view?: boolean }): void;
        openTelegramLink(url: string): void;
        showPopup(params: {
          title?: string;
          message: string;
          buttons?: Array<{ id?: string; type?: string; text?: string }>;
        }, callback?: (buttonId: string) => void): void;
        showAlert(message: string, callback?: () => void): void;
        showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
        showScanQrPopup(params: { text?: string }, callback?: (data: string) => boolean): void;
        closeScanQrPopup(): void;
        readTextFromClipboard(callback?: (text: string) => void): void;
      };
    };
  }
}

export const telegram = {
  isAvailable: (): boolean => typeof window !== "undefined" && window.Telegram?.WebApp !== undefined,
  hapticFeedback: (type: "light" | "medium" | "heavy" = "medium") => {
    if (telegram.isAvailable()) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
  },
  hapticNotification: (type: "error" | "success" | "warning") => {
    if (telegram.isAvailable()) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    }
  },
  showAlert: (message: string, callback?: () => void) => {
    if (telegram.isAvailable()) {
      window.Telegram.WebApp.showAlert(message, callback);
    } else {
      alert(message);
      callback?.();
    }
  },
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => {
    if (telegram.isAvailable()) {
      window.Telegram.WebApp.showConfirm(message, callback);
    } else {
      const result = confirm(message);
      callback?.(result);
    }
  },
  close: () => {
    if (telegram.isAvailable()) {
      window.Telegram.WebApp.close();
    }
  },
  openLink: (url: string) => {
    if (telegram.isAvailable()) {
      window.Telegram.WebApp.openLink(url);
    } else {
      window.open(url, "_blank");
    }
  },
  openTelegramLink: (url: string) => {
    if (telegram.isAvailable()) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, "_blank");
    }
  },
  getColorScheme: (): "light" | "dark" => {
    return telegram.isAvailable() ? window.Telegram.WebApp.colorScheme : "dark";
  },
  getPlatform: (): string => {
    return telegram.isAvailable() ? window.Telegram.WebApp.platform : "unknown";
  },
};

// Telegram Web App SDK Integration

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          query_id?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
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
        isClosingConfirmationEnabled: boolean;
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

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export class TelegramWebApp {
  private static instance: TelegramWebApp;
  private tg: typeof window.Telegram.WebApp | null = null;

  private constructor() {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      this.tg = window.Telegram.WebApp;
      this.tg.ready();
      this.tg.expand();
    }
  }

  static getInstance(): TelegramWebApp {
    if (!TelegramWebApp.instance) {
      TelegramWebApp.instance = new TelegramWebApp();
    }
    return TelegramWebApp.instance;
  }

  isAvailable(): boolean {
    return this.tg !== null;
  }

  getUser(): TelegramUser | null {
    return this.tg?.initDataUnsafe?.user || null;
  }

  getUserId(): number | null {
    return this.tg?.initDataUnsafe?.user?.id || null;
  }

  getStartParam(): string | null {
    return this.tg?.initDataUnsafe?.start_param || null;
  }

  getInitData(): string {
    return this.tg?.initData || "";
  }

  showMainButton(text: string, onClick: () => void) {
    if (!this.tg) return;
    this.tg.MainButton.setText(text);
    this.tg.MainButton.show();
    this.tg.MainButton.onClick(onClick);
  }

  hideMainButton() {
    if (!this.tg) return;
    this.tg.MainButton.hide();
  }

  showBackButton(onClick: () => void) {
    if (!this.tg) return;
    this.tg.BackButton.show();
    this.tg.BackButton.onClick(onClick);
  }

  hideBackButton() {
    if (!this.tg) return;
    this.tg.BackButton.hide();
  }

  hapticFeedback(type: "light" | "medium" | "heavy" = "medium") {
    if (!this.tg) return;
    this.tg.HapticFeedback.impactOccurred(type);
  }

  hapticNotification(type: "error" | "success" | "warning") {
    if (!this.tg) return;
    this.tg.HapticFeedback.notificationOccurred(type);
  }

  showAlert(message: string, callback?: () => void) {
    if (!this.tg) {
      alert(message);
      callback?.();
      return;
    }
    this.tg.showAlert(message, callback);
  }

  showConfirm(message: string, callback?: (confirmed: boolean) => void) {
    if (!this.tg) {
      const result = confirm(message);
      callback?.(result);
      return;
    }
    this.tg.showConfirm(message, callback);
  }

  close() {
    if (!this.tg) return;
    this.tg.close();
  }

  openLink(url: string) {
    if (!this.tg) {
      window.open(url, "_blank");
      return;
    }
    this.tg.openLink(url);
  }

  openTelegramLink(url: string) {
    if (!this.tg) {
      window.open(url, "_blank");
      return;
    }
    this.tg.openTelegramLink(url);
  }

  getColorScheme(): "light" | "dark" {
    return this.tg?.colorScheme || "dark";
  }

  getPlatform(): string {
    return this.tg?.platform || "unknown";
  }

  // Функция для тестирования без Telegram (для разработки)
  getMockUser(): TelegramUser {
    return {
      id: 123456789,
      first_name: "Mock User",
      last_name: "",
      username: "mockuser",
      language_code: "ru",
      is_premium: false,
      photo_url: "https://via.placeholder.com/150", // Placeholder image
    };
  }
}

export const telegram = TelegramWebApp.getInstance();

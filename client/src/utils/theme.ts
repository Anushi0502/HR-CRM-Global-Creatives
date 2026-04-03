export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "gcs-hrcrm-theme";

const isThemeMode = (value: string | null | undefined): value is ThemeMode => value === "light" || value === "dark";

const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isThemeMode(stored) ? stored : null;
};

const getSystemTheme = (): ThemeMode => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const getCurrentTheme = (): ThemeMode => {
  if (typeof document === "undefined") {
    return "light";
  }
  const theme = document.documentElement.dataset.theme;
  if (isThemeMode(theme)) {
    return theme;
  }
  return getStoredTheme() ?? getSystemTheme();
};

export const applyTheme = (mode: ThemeMode) => {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.theme = mode;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, mode);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: mode }));
  }
};

export const initTheme = () => {
  if (typeof window === "undefined") {
    return;
  }
  const mode = getStoredTheme() ?? getSystemTheme();
  applyTheme(mode);
};

export const toggleTheme = (): ThemeMode => {
  const next = getCurrentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
};

import { effectScope, ref, watch } from "vue"

export type Theme = "system" | "dark" | "light"

const STORAGE_KEY = "claw-deploy:theme"

// Module-level singleton state — shared across all useTheme() callers
const theme = ref<Theme>(loadTheme())

let systemListenerInitialized = false

function getSystemTheme(): "dark" | "light" {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark"
  }
  return "light"
}

function getEffectiveTheme(): "dark" | "light" {
  if (theme.value === "system") {
    return getSystemTheme()
  }
  return theme.value
}

function applyTheme() {
  const effective = getEffectiveTheme()
  const root = document.documentElement

  if (effective === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "system" || saved === "dark" || saved === "light") {
      return saved as Theme
    }
  } catch {}
  return "system"
}

function saveTheme(value: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {}
}

function handleSystemThemeChange() {
  if (theme.value === "system") {
    applyTheme()
  }
}

// Apply theme immediately on module load to prevent FOUC
if (typeof document !== "undefined") {
  applyTheme()
}

// Register a persistent watch using effectScope so it survives component unmounts
if (typeof window !== "undefined") {
  const scope = effectScope(true) // detached scope, runs independently
  scope.run(() => {
    watch(theme, (value) => {
      saveTheme(value)
      applyTheme()
    })
  })

  // Register system theme change listener once
  if (!systemListenerInitialized && window.matchMedia) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    mql.addEventListener("change", handleSystemThemeChange)
    systemListenerInitialized = true
  }
}

export function useTheme() {
  return {
    theme,
  }
}

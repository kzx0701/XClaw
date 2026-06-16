import { ref, watch, onMounted } from "vue"

export type Theme = "system" | "dark" | "light"

const STORAGE_KEY = "claw-deploy:theme"
const theme = ref<Theme>("system")

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
      return saved
    }
  } catch {}
  return "system"
}

function saveTheme(value: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {}
}

export function useTheme() {
  onMounted(() => {
    theme.value = loadTheme()
    applyTheme()
  })

  watch(theme, (value) => {
    saveTheme(value)
    applyTheme()
  })

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (theme.value === "system") {
        applyTheme()
      }
    })
  }

  return {
    theme,
  }
}

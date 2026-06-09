<template>
  <button type="button" class="xclaw-wordmark" :style="wordmarkStyle" :aria-label="text" @click="$emit('click')">
    <span class="xclaw-wordmark-copy">
      <span class="xclaw-wordmark-x">X</span><span>Claw</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    accentColor?: string;
    fontSize?: string;
    text?: string;
  }>(),
  {
    accentColor: "#0057c2",
    fontSize: "1.5rem",
    text: "XClaw",
  },
);

defineEmits<{
  click: [];
}>();

const wordmarkStyle = computed(() => ({
  "--animation-color": props.accentColor,
  "--fs-size": props.fontSize,
}));
</script>

<style scoped>
.xclaw-wordmark {
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  min-width: 0;
  height: auto;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #201d1d;
  cursor: pointer;
  font-family: var(--font-sans);
  line-height: 1;
  text-align: left;
  transition: opacity 140ms ease;
}

.xclaw-wordmark:hover {
  opacity: 0.82;
}

.xclaw-wordmark:focus-visible {
  outline: 1px solid var(--border);
  outline-offset: 4px;
}

.xclaw-wordmark-copy {
  display: inline-flex;
  align-items: baseline;
  min-width: 0;
  color: #201d1d;
  font-size: var(--fs-size);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.045em;
  white-space: nowrap;
}

.xclaw-wordmark-x {
  color: var(--animation-color);
  letter-spacing: -0.08em;
}
</style>

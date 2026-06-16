<template>
  <section class="workspace-toolbar-panel">
    <div v-if="$slots.search" class="workspace-toolbar-search">
      <slot name="search" />
    </div>

    <div v-if="$slots.actions" class="workspace-toolbar-actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<style scoped>
.workspace-toolbar-panel {
  display: grid;
  gap: 12px;
  margin-inline: -32px;
  padding: 16px 32px;
  border-bottom: 1px solid var(--border);
  background: #fdfcfc;
}

.dark .workspace-toolbar-panel {
  background: var(--background);
}

.workspace-toolbar-search,
.workspace-toolbar-actions {
  display: flex;
  align-items: center;
}

.workspace-toolbar-actions {
  justify-content: flex-start;
}

@media (max-width: 960px) {
  .workspace-toolbar-panel {
    margin-inline: -24px;
    padding-inline: 24px;
  }
}

@media (max-width: 640px) {
  .workspace-toolbar-panel {
    margin-inline: -18px;
    padding-inline: 18px;
  }
}
</style>

<template>
  <NodeViewWrapper 
    as="span" 
    class="tiptap-variable"
    :class="{ 'is-selected': selected }"
    @click="handleClick"
  >
    <span class="variable-content">
      {{ displayText }}
    </span>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'
import { computed } from 'vue'
import type { NodeViewProps } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

const selected = computed(() => props.selected)

const displayText = computed(() => `{{${props.node.attrs.name}}}`)

function handleClick() {
  // Select the node when clicked
  props.editor.commands.setNodeSelection(props.getPos())
}
</script>

<style>
.tiptap-variable {
  display: inline-flex;
  align-items: center;
  background: hsl(270 54% 55% / 0.12);
  color: hsl(270 54% 55%);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875em;
  font-weight: 500;
  border: 1px solid hsl(270 54% 55% / 0.25);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
}

.tiptap-variable:hover {
  background: hsl(270 54% 55% / 0.18);
  border-color: hsl(270 54% 55% / 0.4);
}

.tiptap-variable.is-selected {
  background: hsl(270 54% 55% / 0.25);
  border-color: hsl(270 54% 55%);
  box-shadow: 0 0 0 2px hsl(270 54% 55% / 0.2);
}

.dark .tiptap-variable {
  background: hsl(270 54% 55% / 0.15);
  color: hsl(270 54% 70%);
  border-color: hsl(270 54% 55% / 0.3);
}

.dark .tiptap-variable:hover {
  background: hsl(270 54% 55% / 0.22);
  border-color: hsl(270 54% 55% / 0.5);
}

.dark .tiptap-variable.is-selected {
  background: hsl(270 54% 55% / 0.3);
  border-color: hsl(270 54% 70%);
}

.variable-content {
  display: inline;
}
</style>

<template>
  <div class="tiptap-editor-wrapper">
    <EditorContent 
      :editor="editor" 
      class="tiptap-editor"
      :class="{ 'is-focused': isFocused, 'has-error': hasError }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted, computed } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { VariableExtension } from './VariableExtension'
import { variableSuggestion } from './variableSuggestion'
import type { VariableItem } from './VariableSuggestionList.vue'

const props = withDefaults(defineProps<{
  placeholder?: string
  disabled?: boolean
  hasError?: boolean
  variables?: VariableItem[]
  flowVariables?: string[]
}>(), {
  placeholder: 'Digite aqui...',
  disabled: false,
  hasError: false,
  variables: () => [],
  flowVariables: () => [],
})

// 🚀 defineModel simplifica toda a lógica de v-model e sincronização
const model = defineModel<string>({ default: '' })

const emit = defineEmits<{
  'blur': []
  'focus': []
}>()

const isFocused = ref(false)

// Compute all variables from props
const allVariables = computed<VariableItem[]>(() => {
  const vars: VariableItem[] = [...props.variables]
  
  // Add flow variables
  props.flowVariables.forEach(name => {
    if (!vars.find(v => v.name === name)) {
      vars.push({ name, category: 'flow' })
    }
  })
  
  return vars
})

const editor = useEditor({
  content: parseToHTML(model.value),
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      // Disable features we don't need
      heading: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    VariableExtension,
    variableSuggestion(allVariables),
  ],
  onUpdate: ({ editor }) => {
    const text = parseToText(editor.getHTML())
    model.value = text
  },
  onFocus: () => {
    isFocused.value = true
    emit('focus')
  },
  onBlur: () => {
    isFocused.value = false
    emit('blur')
  },
})

// Sincronizar mudanças externas no model para o editor
watch(model, (newValue) => {
  if (!editor.value) return
  
  const currentText = parseToText(editor.value.getHTML())
  if (newValue !== currentText) {
    editor.value.commands.setContent(parseToHTML(newValue || ''))
  }
})


// Watch for disabled changes
watch(() => props.disabled, (disabled) => {
  editor.value?.setEditable(!disabled)
})

// Convert plain text with {{var}} to HTML
function parseToHTML(text: string): string {
  if (!text) return '<p></p>'
  
  // Replace {{variable}} with our custom node format
  const html = text.replace(
    /\{\{(\w+)\}\}/g,
    '<span data-variable="$1">{{$1}}</span>'
  )
  
  // Wrap in paragraph if needed
  if (!html.startsWith('<p>')) {
    return `<p>${html}</p>`
  }
  
  return html
}

// Convert HTML back to plain text with {{var}}
function parseToText(html: string): string {
  // Create a temporary element to parse HTML
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  // Replace variable nodes with {{name}}
  temp.querySelectorAll('[data-variable]').forEach(el => {
    const name = el.getAttribute('data-variable')
    const textNode = document.createTextNode(`{{${name}}}`)
    el.replaceWith(textNode)
  })
  
  // Get text content, preserving newlines from <p> and <br>
  let text = ''
  temp.querySelectorAll('p').forEach((p, i) => {
    if (i > 0) text += '\n'
    text += p.textContent || ''
  })
  
  if (!text && temp.textContent) {
    text = temp.textContent
  }
  
  return text.trim()
}

// Expose methods
function insertVariable(name: string) {
  editor.value?.commands.insertVariable(name)
}

function focus() {
  editor.value?.commands.focus()
}

defineExpose({
  insertVariable,
  focus,
  editor,
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.tiptap-editor-wrapper {
  position: relative;
  width: 100%;
}

.tiptap-editor {
  min-height: 80px;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--input));
  background: hsl(var(--background));
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.tiptap-editor:hover {
  border-color: hsl(var(--input));
}

.tiptap-editor.is-focused {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
}

.tiptap-editor.has-error {
  border-color: hsl(var(--destructive));
}

.tiptap-editor .ProseMirror {
  outline: none;
  min-height: inherit;
}

.tiptap-editor .ProseMirror p {
  margin: 0;
}

.tiptap-editor .ProseMirror p + p {
  margin-top: 0.5rem;
}

/* Placeholder */
.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  height: 0;
}

/* Variable nodes */
.tiptap-variable {
  display: inline-flex;
  align-items: center;
  background: hsl(270 54% 55% / 0.12);
  color: hsl(270 54% 55%);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
  font-weight: 500;
  border: 1px solid hsl(270 54% 55% / 0.25);
  cursor: pointer;
  user-select: none;
}

.dark .tiptap-variable {
  background: hsl(270 54% 55% / 0.15);
  color: hsl(270 54% 70%);
  border-color: hsl(270 54% 55% / 0.3);
}
</style>

import { VueRenderer } from '@tiptap/vue-3'
import tippy, { type Instance } from 'tippy.js'
import { Extension } from '@tiptap/core'
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion'
import VariableSuggestionList from './VariableSuggestionList.vue'
import type { VariableItem } from './VariableSuggestionList.vue'
import type { ComputedRef, Ref } from 'vue'

export function variableSuggestion(
    variablesRef: ComputedRef<VariableItem[]> | Ref<VariableItem[]>
) {
    return Extension.create({
        name: 'variableSuggestion',

        addOptions() {
            return {
                suggestion: {
                    char: '{{',
                    allowSpaces: false,
                    startOfLine: false,

                    items: ({ query }: { query: string }) => {
                        const variables = variablesRef.value
                        if (!query) return variables.slice(0, 10)

                        return variables
                            .filter(item =>
                                item.name.toLowerCase().includes(query.toLowerCase())
                            )
                            .slice(0, 10)
                    },

                    render: () => {
                        let component: VueRenderer | null = null
                        let popup: Instance[] = []

                        return {
                            onStart: (props: any) => {
                                component = new VueRenderer(VariableSuggestionList, {
                                    props,
                                    editor: props.editor,
                                })

                                if (!props.clientRect) {
                                    return
                                }

                                popup = tippy('body', {
                                    getReferenceClientRect: props.clientRect,
                                    appendTo: () => document.body,
                                    content: component.element,
                                    showOnCreate: true,
                                    interactive: true,
                                    trigger: 'manual',
                                    placement: 'bottom-start',
                                })
                            },

                            onUpdate(props: any) {
                                component?.updateProps(props)

                                if (!props.clientRect) {
                                    return
                                }

                                popup[0]?.setProps({
                                    getReferenceClientRect: props.clientRect,
                                })
                            },

                            onKeyDown(props: any) {
                                if (props.event.key === 'Escape') {
                                    popup[0]?.hide()
                                    return true
                                }

                                return (component?.ref as any)?.onKeyDown?.(props) || false
                            },

                            onExit() {
                                popup[0]?.destroy()
                                component?.destroy()
                            },
                        }
                    },

                    command: ({ editor, range, props }: any) => {
                        // Delete the trigger characters {{
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .insertContent({
                                type: 'variable',
                                attrs: { name: props.name },
                            })
                            .run()
                    },
                } as Partial<SuggestionOptions>,
            }
        },

        addProseMirrorPlugins() {
            return [
                Suggestion({
                    editor: this.editor,
                    ...this.options.suggestion,
                }),
            ]
        },
    })
}

export default variableSuggestion

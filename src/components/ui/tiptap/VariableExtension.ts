import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import VariableNodeView from './VariableNodeView.vue'

export interface VariableOptions {
    HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        variable: {
            /**
             * Insert a variable
             */
            insertVariable: (name: string) => ReturnType
        }
    }
}

export const VariableExtension = Node.create<VariableOptions>({
    name: 'variable',

    group: 'inline',

    inline: true,

    selectable: true,

    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {},
        }
    },

    addAttributes() {
        return {
            name: {
                default: null,
                parseHTML: element => element.getAttribute('data-variable'),
                renderHTML: attributes => {
                    if (!attributes.name) {
                        return {}
                    }
                    return {
                        'data-variable': attributes.name,
                    }
                },
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-variable]',
            },
        ]
    },

    renderHTML({ node, HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(
                this.options.HTMLAttributes,
                HTMLAttributes,
                {
                    'data-variable': node.attrs.name,
                    'class': 'tiptap-variable',
                }
            ),
            `{{${node.attrs.name}}}`,
        ]
    },

    addNodeView() {
        return VueNodeViewRenderer(VariableNodeView)
    },

    addCommands() {
        return {
            insertVariable:
                (name: string) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: { name },
                        })
                    },
        }
    },
})

export default VariableExtension

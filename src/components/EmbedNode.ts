import { Node } from '@tiptap/core';

export interface EmbedOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: { html: string }) => ReturnType;
    };
  }
}

const EmbedNode = Node.create<EmbedOptions>({
  name: 'embed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      html: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-embed-html') || element.innerHTML,
        renderHTML: (attributes: Record<string, any>) => ({
          'data-embed-html': attributes.html,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-embed-html]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-embed': 'true', class: 'embed-wrapper' }];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-embed', 'true');
      dom.setAttribute('data-embed-html', node.attrs.html);
      dom.classList.add('embed-wrapper');
      dom.contentEditable = 'false';
      dom.innerHTML = node.attrs.html;
      return { dom };
    };
  },

  addCommands() {
    return {
      setEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { html: options.html },
          });
        },
    };
  },
});

export default EmbedNode;

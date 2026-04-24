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

// Use base64 to avoid HTML attribute encoding issues
function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}
function fromBase64(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return '';
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
        parseHTML: (element: HTMLElement) => {
          const b64 = element.getAttribute('data-embed-b64');
          if (b64) return fromBase64(b64);
          // Fallback: old format
          const raw = element.getAttribute('data-embed-html');
          if (raw) return raw;
          return element.innerHTML;
        },
        renderHTML: (attributes: Record<string, any>) => ({
          'data-embed-b64': toBase64(attributes.html),
        }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-embed-b64]' },
      { tag: 'div[data-embed-html]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-embed': 'true', class: 'embed-wrapper' }];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-embed', 'true');
      dom.classList.add('embed-wrapper');
      dom.contentEditable = 'false';
      dom.innerHTML = node.attrs.html;
      let currentHtml: string = node.attrs.html;
      return {
        dom,
        // Keep the same DOM instance when the node's html attr is unchanged,
        // so embedded iframes (YouTube etc.) aren't reloaded on every doc update.
        update(updated) {
          if (updated.type.name !== 'embed') return false;
          const nextHtml: string = updated.attrs?.html ?? '';
          if (nextHtml !== currentHtml) {
            dom.innerHTML = nextHtml;
            currentHtml = nextHtml;
          }
          return true;
        },
        // iframes (YouTube, FB, etc.) mutate their own subtree as they load.
        // Without this, ProseMirror re-parses those mutations back into the
        // document, which can spiral into a re-render loop and crash Chrome.
        ignoreMutation() {
          return true;
        },
        stopEvent() {
          return true;
        },
      };
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

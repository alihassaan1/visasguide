import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Custom BlockEmbed that stores arbitrary <table> HTML verbatim.
const BlockEmbed: any = Quill.import('blots/block/embed');

class TableBlot extends BlockEmbed {
  static blotName = 'htmlTable';
  static tagName = 'div';
  static className = 'ql-html-table';

  static create(value: string) {
    const node = super.create() as HTMLElement;
    node.setAttribute('contenteditable', 'false');
    node.innerHTML = value || '<table><tr><td>Cell</td></tr></table>';
    return node;
  }

  static value(node: HTMLElement) {
    return node.innerHTML;
  }
}

if (!(Quill as any).imports['formats/htmlTable']) {
  Quill.register(TableBlot, true);
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...'
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const insertTableAtCursor = useCallback((html: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const index = range?.index ?? editor.getLength();
    editor.insertEmbed(index, 'htmlTable', html, 'user');
    editor.insertText(index + 1, '\n', 'user');
    editor.setSelection(index + 2, 0, 'user');
  }, []);

  const insertTablePrompt = () => {
    const rowsStr = window.prompt('Number of rows?', '3');
    const colsStr = window.prompt('Number of columns?', '3');
    const rows = Math.max(1, Math.min(50, parseInt(rowsStr || '3', 10) || 3));
    const cols = Math.max(1, Math.min(20, parseInt(colsStr || '3', 10) || 3));
    let html = '<table><thead><tr>';
    for (let c = 0; c < cols; c++) html += `<th>Header ${c + 1}</th>`;
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += '<td>&nbsp;</td>';
      html += '</tr>';
    }
    html += '</tbody></table>';
    insertTableAtCursor(html);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image', 'video', 'insertTable'],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ['clean'],
      ],
      handlers: {
        insertTable: insertTablePrompt,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background',
    'htmlTable',
  ];

  // Intercept paste: if HTML contains <table>, extract tables and insert them as
  // our htmlTable blot; paste the rest of the HTML with tables removed as normal.
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const root = editor.root as HTMLElement;

    const handlePaste = (e: ClipboardEvent) => {
      const html = e.clipboardData?.getData('text/html');
      if (!html || !/<table[\s>]/i.test(html)) return; // let Quill handle it

      e.preventDefault();

      // Parse the pasted HTML in a detached document.
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // Strip harmful/unnecessary elements.
      doc.querySelectorAll('script,style,meta,link').forEach((n) => n.remove());

      // Collect tables in document order, then remove them from the tree so the
      // remaining HTML pastes cleanly around them.
      const tables: string[] = [];
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
      const tableNodes: HTMLTableElement[] = [];
      let current: Node | null = walker.currentNode;
      while ((current = walker.nextNode())) {
        if ((current as Element).tagName === 'TABLE') {
          tableNodes.push(current as HTMLTableElement);
        }
      }

      // Split the paste into segments separated by table markers.
      const marker = '@@__QUILL_TABLE_MARKER__@@';
      tableNodes.forEach((t) => {
        tables.push(t.outerHTML);
        const placeholder = doc.createElement('p');
        placeholder.textContent = marker;
        t.parentNode?.replaceChild(placeholder, t);
      });

      const remainingHtml = doc.body.innerHTML;
      const parts = remainingHtml.split(marker);

      const range = editor.getSelection(true);
      let index = range?.index ?? editor.getLength();
      if (range && range.length) {
        editor.deleteText(range.index, range.length, 'user');
      }

      parts.forEach((chunk, i) => {
        const trimmed = chunk.replace(/<p>\s*<\/p>/gi, '').trim();
        if (trimmed) {
          editor.clipboard.dangerouslyPasteHTML(index, trimmed, 'user');
          index = editor.getLength() - 1; // move to end of freshly-pasted content
        }
        if (i < tables.length) {
          editor.insertEmbed(index, 'htmlTable', tables[i], 'user');
          index += 1;
          editor.insertText(index, '\n', 'user');
          index += 1;
        }
      });

      editor.setSelection(index, 0, 'user');
    };

    root.addEventListener('paste', handlePaste, true);
    return () => root.removeEventListener('paste', handlePaste, true);
  }, []);

  // Add a table icon to the custom toolbar button once mounted.
  useEffect(() => {
    const btn = document.querySelector('.ql-insertTable') as HTMLElement | null;
    if (btn && !btn.innerHTML.trim()) {
      btn.innerHTML =
        '<svg viewBox="0 0 18 18"><rect x="2" y="3" width="14" height="12" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="7" x2="16" y2="7" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="11" x2="16" y2="11" stroke="currentColor" stroke-width="1.5"/><line x1="7" y1="3" x2="7" y2="15" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="3" x2="11" y2="15" stroke="currentColor" stroke-width="1.5"/></svg>';
      btn.setAttribute('title', 'Insert table');
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .mobile-friendly-editor .ql-container {
          font-size: 14px;
        }
        .mobile-friendly-editor .ql-editor {
          min-height: 400px;
          padding: 12px 15px;
        }
        .mobile-friendly-editor .ql-editor .ql-html-table {
          margin: 12px 0;
          overflow-x: auto;
        }
        .mobile-friendly-editor .ql-editor .ql-html-table table {
          border-collapse: collapse;
          width: 100%;
        }
        .mobile-friendly-editor .ql-editor .ql-html-table th,
        .mobile-friendly-editor .ql-editor .ql-html-table td {
          border: 1px solid #d1d5db;
          padding: 6px 10px;
          text-align: left;
          vertical-align: top;
        }
        .mobile-friendly-editor .ql-editor .ql-html-table th {
          background: #f3f4f6;
          font-weight: 600;
        }
        @media (max-width: 640px) {
          .mobile-friendly-editor .ql-toolbar {
            padding: 8px;
          }
          .mobile-friendly-editor .ql-toolbar button {
            width: 28px !important;
            height: 28px !important;
            padding: 3px !important;
          }
          .mobile-friendly-editor .ql-editor {
            padding: 10px;
            font-size: 16px;
          }
        }
      `}} />
      <div className="rich-text-editor mobile-friendly-editor">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ minHeight: '400px', marginBottom: '60px' }}
        />
      </div>
    </>
  );
};

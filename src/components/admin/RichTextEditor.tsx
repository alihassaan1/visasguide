import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'color', 'background'
  ];

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

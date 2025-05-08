import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TurndownService from 'turndown';

import { 
    
    HiBold, 
    HiItalic, 
    HiListBullet, 
    HiNumberedList as HiListNumbered,
    HiLink, 
    HiDocumentText,
    HiBars3BottomLeft,
    HiBars3CenterLeft,
    HiBars3BottomRight,
    HiMiniBars3,
} from 'react-icons/hi2';


interface TextboxProps {
    content: string;
    onChange: (content: string, markdown?: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    className?: string;
    exportMarkdown?: boolean;
}

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
});

export default function Textbox({ 
    content, 
    onChange, 
    placeholder = 'Start writing...', 
    readOnly = false,
    className = '',
    exportMarkdown = false
}: TextboxProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:text-blue-600 underline',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (exportMarkdown) {
                // Convert HTML to Markdown using Turndown
                const markdown = turndownService.turndown(html);
                onChange(html, markdown);
            } else {
                onChange(html);
            }
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm max-w-none focus:outline-none min-h-[100px] ${className}`,
                placeholder,
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('Enter URL');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            {!readOnly && (
                <div className="border-b border-border bg-background-muted p-2 flex flex-wrap gap-2">
                    <div className="flex gap-1 border-r border-border pr-2">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1.5 rounded hover:bg-border ${editor.isActive('bold') ? 'bg-border' : ''}`}
                            title="Bold"
                        >
                            <HiBold className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1.5 rounded hover:bg-border ${editor.isActive('italic') ? 'bg-border' : ''}`}
                            title="Italic"
                        >
                            <HiItalic className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-1.5 rounded hover:bg-border ${editor.isActive('underline') ? 'bg-border' : ''}`}
                            title="Underline"
                        >
                            <HiDocumentText className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex gap-1 border-r border-border pr-2">
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`p-1.5 rounded hover:bg-border ${editor.isActive('bulletList') ? 'bg-border' : ''}`}
                            title="Bullet List"
                        >
                            <HiListBullet className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`p-1.5 rounded hover:bg-border ${editor.isActive('orderedList') ? 'bg-border' : ''}`}
                            title="Numbered List"
                        >
                            <HiListNumbered className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex gap-1 border-r border-border pr-2">
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={`p-1.5 rounded hover:bg-border ${editor.isActive({ textAlign: 'left' }) ? 'bg-border' : ''}`}
                            title="Align Left"
                        >
                            <HiBars3BottomLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={`p-1.5 rounded hover:bg-border ${editor.isActive({ textAlign: 'center' }) ? 'bg-border' : ''}`}
                            title="Align Center"
                        >
                            <HiMiniBars3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={`p-1.5 rounded hover:bg-border ${editor.isActive({ textAlign: 'right' }) ? 'bg-border' : ''}`}
                            title="Align Right"
                        >
                            <HiBars3BottomRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={addLink}
                        className={`p-1.5 rounded hover:bg-border ${editor.isActive('link') ? 'bg-border' : ''}`}
                        title="Add Link"
                    >
                        <HiLink className="w-4 h-4" />
                    </button>
                </div>
            )}
            <EditorContent editor={editor} className="p-4" />
        </div>
    );
} 
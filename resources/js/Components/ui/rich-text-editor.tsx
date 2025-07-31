import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Quote,
  Code,
  Undo,
  Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  className,
  minHeight = '120px',
  maxHeight = '300px',
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Nhập URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const toolbarButtons = [
    { command: 'bold', icon: Bold, title: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: Italic, title: 'Italic (Ctrl+I)' },
    { command: 'underline', icon: Underline, title: 'Underline (Ctrl+U)' },
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List' },
    { command: 'formatBlock', icon: Quote, title: 'Quote', value: 'blockquote' },
    { command: 'formatBlock', icon: Code, title: 'Code Block', value: 'pre' },
    { command: 'insertLink', icon: Link, title: 'Insert Link', action: insertLink },
    { command: 'undo', icon: Undo, title: 'Undo (Ctrl+Z)' },
    { command: 'redo', icon: Redo, title: 'Redo (Ctrl+Y)' },
  ];

  return (
    <div className={cn('border rounded-md overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (button.action) {
                button.action();
              } else if (button.value) {
                executeCommand(button.command, button.value);
              } else {
                executeCommand(button.command);
              }
            }}
            title={button.title}
            disabled={disabled}
          >
            <button.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        className={cn(
          'p-3 outline-none overflow-y-auto',
          'prose prose-base max-w-none dark:prose-invert',
          'focus:ring-0 text-foreground text-base',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ 
          minHeight,
          maxHeight,
        }}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      
      
    </div>
  );
}

export default RichTextEditor;

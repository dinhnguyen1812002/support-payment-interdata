import React, { useState, useRef } from 'react';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Send, Smile, SendHorizontal } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Components/ui/popover';
import EmojiPicker from 'emoji-picker-react';
import { useComments } from '@/Context/CommentsContext';
import { Separator } from '@/Components/ui/separator';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = 'Write your comment here...',
  buttonText = 'Send',
  autoFocus = false,
}) => {
  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { isLoading, setIsLoading } = useComments();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle Emoji Selection
  const handleEmojiClick = (emojiObject: any) => {
    const emoji = emojiObject.emoji;
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = comment.slice(0, start) + emoji + comment.slice(end);
      setComment(newValue);

      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setComment(prev => prev + emoji);
    }

    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = comment.trim();

    if (!trimmedComment || isLoading) return;

    try {
      setIsLoading(true);
      await onSubmit(trimmedComment);
      setComment('');

      // Focus back to textarea after successful submit
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      // Keep the comment content if submission fails
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col space-y-2 relative">
        <Textarea
          ref={textareaRef}
          value={comment}
          onChange={e => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="min-h-24 resize-none focus:ring-2 focus:ring-blue-500 dark:bg-[#15171C] dark:text-gray-100"
          disabled={isLoading}
          maxLength={2000} // Add character limit
        />

        {/* Character counter */}
        <div className="text-xs text-gray-500 text-right">
          {comment.length}/2000
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  <Smile className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 border-none w-auto"
                side="top"
                sideOffset={5}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  searchDisabled={false}
                  skinTonesDisabled={true}
                />
              </PopoverContent>
            </Popover>

            <span className="text-xs text-gray-400">Ctrl + Enter to send</span>
          </div>

          <Button
            type="submit"
            disabled={!comment.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </div>
            ) : (
              <>
                <SendHorizontal className="w-4 h-4" />
                <Separator
                  orientation="vertical"
                  className="text-white border-white mx-2"
                />
                {buttonText}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;

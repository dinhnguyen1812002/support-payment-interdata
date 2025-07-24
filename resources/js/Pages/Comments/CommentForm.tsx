import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Send, Smile, SendHorizontal, AlertCircle, Info } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Components/ui/popover';
import EmojiPicker from 'emoji-picker-react';
import { useComments } from '@/Context/CommentsContext';
import { Separator } from '@/Components/ui/separator';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
}

// Validation constants
const MIN_COMMENT_LENGTH = 3;
const MAX_COMMENT_LENGTH = 1000;
const SPAM_PATTERNS = [
  /(.)\1{4,}/g, // Repeated characters (5+ times)
  /^[A-Z\s!]{10,}$/g, // All caps with exclamation
];

// Validation functions
const validateComment = (text: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const trimmedText = text.trim();

  // Length validation
  if (trimmedText.length < MIN_COMMENT_LENGTH) {
    errors.push(`Comment must be at least ${MIN_COMMENT_LENGTH} characters long`);
  }

  if (trimmedText.length > MAX_COMMENT_LENGTH) {
    errors.push(`Comment must not exceed ${MAX_COMMENT_LENGTH} characters`);
  }

  // Content validation
  if (trimmedText.length === 0) {
    errors.push('Comment cannot be empty');
  }

  // Check for spam patterns
  const hasSpamPattern = SPAM_PATTERNS.some(pattern => pattern.test(trimmedText));
  if (hasSpamPattern) {
    errors.push('Comment appears to contain spam or excessive repetition');
  }

  // Check for only whitespace or special characters
  if (!/[a-zA-Z0-9]/.test(trimmedText)) {
    errors.push('Comment must contain at least some alphanumeric characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  placeholder = 'Write your comment here...',
  buttonText = 'Send',
  autoFocus = false,
}) => {
  const [comment, setComment] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rate limiting: prevent spam submissions
  const RATE_LIMIT_MS = 3000; // 3 seconds between submissions

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

    if (isLoading) return;

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;

    if (timeSinceLastSubmit < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - timeSinceLastSubmit) / 1000);
      setErrors([`Please wait ${waitTime} seconds before submitting another comment`]);
      setShowErrors(true);
      return;
    }

    // Validate comment
    const validation = validateComment(comment);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setShowErrors(true);
      return;
    }

    // Clear any previous errors
    setErrors([]);
    setShowErrors(false);

    try {
      setIsLoading(true);
      setLastSubmitTime(now); // Update last submit time

      await onSubmit(comment.trim());
      setComment('');

      // Focus back to textarea after successful submit
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setErrors(['Failed to submit comment. Please try again.']);
      setShowErrors(true);
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

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Set the height to scrollHeight to fit the content
    const newHeight = Math.max(96, Math.min(textarea.scrollHeight, 300));
    textarea.style.height = `${newHeight}px`;
  }, [comment]);

  // Handle input change with live validation
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setComment(newValue);

    // Clear errors when user starts typing again
    if (showErrors) {
      setShowErrors(false);
    }

    // Live validation for character count
    if (newValue.length > MAX_COMMENT_LENGTH) {
      setErrors([`Comment must not exceed ${MAX_COMMENT_LENGTH} characters`]);
    } else {
      setErrors([]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col space-y-2 relative">
        <div className="relative">
  <Textarea
    ref={textareaRef}
    value={comment}
    onChange={handleInputChange}
    onKeyDown={handleKeyDown}
    placeholder={placeholder}
    autoFocus={autoFocus}
    className={`min-h-24 max-h-72 resize-none pr-10 focus:ring-2 focus:ring-blue-500 dark:bg-[#15171C] dark:text-gray-100 transition-all duration-200 ${
      showErrors && errors.length > 0 ? 'border-red-500 focus:ring-red-500' : ''
    }`}
    disabled={isLoading}
    maxLength={MAX_COMMENT_LENGTH}
  />

  {/* Emoji icon inside textarea */}
  <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
    <PopoverTrigger asChild>
      <button
        type="button"
        disabled={isLoading}
        className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <Smile className="w-5 h-5" />
      </button>
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
</div>

        {/* Character counter with color indicator */}
        <div className={`text-xs ${
          comment.length > MAX_COMMENT_LENGTH * 0.9
            ? 'text-amber-500'
            : comment.length > MAX_COMMENT_LENGTH
              ? 'text-red-500'
              : 'text-gray-500'
        } text-right`}>
          {comment.length}/{MAX_COMMENT_LENGTH}
        </div>

        {/* Error messages */}
        {showErrors && errors.length > 0 && (
          <Alert variant="destructive" className="py-2 mt-1">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            disabled={
              !comment.trim() ||
              isLoading ||
              comment.length < MIN_COMMENT_LENGTH ||
              comment.length > MAX_COMMENT_LENGTH
            }
            className={`text-white disabled:opacity-50 transition-colors ${
              comment.trim() &&
              comment.length >= MIN_COMMENT_LENGTH &&
              comment.length <= MAX_COMMENT_LENGTH
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
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

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'comment' => [
                'required',
                'string',
                'min:3',
                'max:1000',
                'regex:/[a-zA-Z0-9]/', // Must contain at least one alphanumeric character
                function ($attribute, $value, $fail) {
                    // Check for spam patterns
                    if ($this->containsSpamPatterns($value)) {
                        $fail('The comment appears to contain spam or excessive repetition.');
                    }
                    
                    // Check for rate limiting
                    if ($this->isRateLimited()) {
                        $fail('You are posting comments too frequently. Please wait before posting again.');
                    }
                },
            ],
            'post_id' => [
                'required',
                'string',
                'exists:posts,id'
            ],
            'parent_id' => [
                'nullable',
                'string',
                'exists:comments,id'
            ]
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'comment.required' => 'Comment content is required.',
            'comment.min' => 'Comment must be at least 3 characters long.',
            'comment.max' => 'Comment must not exceed 1000 characters.',
            'comment.regex' => 'Comment must contain at least some alphanumeric characters.',
            'post_id.required' => 'Post ID is required.',
            'post_id.exists' => 'The selected post does not exist.',
            'parent_id.exists' => 'The parent comment does not exist.',
        ];
    }

    /**
     * Check if the comment contains spam patterns
     */
    private function containsSpamPatterns(string $text): bool
    {
        $spamPatterns = [
            '/(.)\1{4,}/', // Repeated characters (5+ times)
            '/^[A-Z\s!]{10,}$/', // All caps with exclamation
            '/(.{1,10})\1{3,}/', // Repeated phrases
        ];

        foreach ($spamPatterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user is rate limited
     */
    private function isRateLimited(): bool
    {
        $user = auth()->user();
        if (!$user) {
            return true;
        }

        // Check if user has posted a comment in the last 3 seconds
        $lastComment = $user->comments()
            ->where('created_at', '>', now()->subSeconds(3))
            ->first();

        return $lastComment !== null;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'comment' => trim($this->comment ?? ''),
        ]);
    }

    /**
     * Get the validated data from the request with additional processing.
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        
        if ($key === null) {
            // Clean and sanitize the comment
            $validated['comment'] = $this->sanitizeComment($validated['comment']);
        }
        
        return $validated;
    }

    /**
     * Sanitize comment content
     */
    private function sanitizeComment(string $comment): string
    {
        // Remove excessive whitespace
        $comment = preg_replace('/\s+/', ' ', $comment);
        
        // Trim whitespace
        $comment = trim($comment);
        
        // Remove potentially harmful content (basic XSS protection)
        $comment = strip_tags($comment);
        
        return $comment;
    }
}

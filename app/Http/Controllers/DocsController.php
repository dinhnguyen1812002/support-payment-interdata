<?php

namespace App\Http\Controllers;

use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Parsedown;

class DocsController extends Controller
{
    public function adminIndex()
    {
        $parsedown = new Parsedown();
        $parsedown->setSafeMode(true); // Enable safe mode for security
        $filesystem = new Filesystem();
        $docsPath = base_path('docs');

        // Ensure docs directory exists
        $files = $this->getDocumentationFiles($docsPath);

        // Prepare file metadata
        $fileContents = [];
        try {
            foreach ($files as $file) {
                $filePath = "{$docsPath}/{$file}";
                if ($filesystem->exists($filePath)) {
                    $content = $filesystem->get($filePath);
                    $preview = mb_substr(strip_tags($parsedown->text($content)), 0, 200) . '...';
                    $fileContents[] = [
                        'name' => $file,
                        'preview' => $preview,
                        'last_modified' => $filesystem->lastModified($filePath),
                        'size' => $this->formatFileSize($filesystem->size($filePath)),
                    ];
                }
            }
        } catch (\Exception $e) {
            return Inertia::render('Admin/Docs/Index', [
                'files' => [],
                'error' => 'Failed to load documentation files: ' . $e->getMessage(),
            ])->with(['error' => 'Error loading documentation']);
        }

        return Inertia::render('Admin/Docs/Index', [
            'files' => $fileContents,
            'error' => null,
        ]);
    }

    public function show($file = null)
    {
        $parsedown = new Parsedown();
        $parsedown->setSafeMode(true);
        $filesystem = new Filesystem();
        $docsPath = base_path('docs');

        // Ensure docs directory exists
        $files = $this->getDocumentationFiles($docsPath);

        // Default to index.md if no file specified
        if (is_null($file)) {
            $file = 'index.md';
        }

        $filePath = base_path("docs/{$file}");

        // Validate file existence and extension
        if (!$filesystem->exists($filePath) || pathinfo($filePath, PATHINFO_EXTENSION) !== 'md') {
            return Inertia::render('Admin/Docs/Show', [
                'files' => $files,
                'content' => '# File Not Found\nThe requested documentation file does not exist.',
                'currentFile' => $file,
                'error' => 'File not found or invalid format',
            ])->with(['error' => 'Document not found']);
        }

        try {
            $content = $parsedown->text($filesystem->get($filePath));
        } catch (\Exception $e) {
            return Inertia::render('Admin/Docs/Show', [
                'files' => $files,
                'content' => '# Error\nFailed to parse the documentation file.',
                'currentFile' => $file,
                'error' => 'Failed to parse document',
            ])->with(['error' => 'Error parsing document']);
        }

        return Inertia::render('Admin/Docs/Show', [
            'files' => $files,
            'content' => $content,
            'currentFile' => $file,
            'error' => null,
        ]);
    }

    protected function getDocumentationFiles($docsPath)
    {
        $filesystem = new Filesystem();
        
        if (!$filesystem->exists($docsPath)) {
            $filesystem->makeDirectory($docsPath, 0755, true);
            $filesystem->put($docsPath . '/index.md', '# Welcome to Documentation');
        }

        return collect($filesystem->files($docsPath))
            ->filter(fn (\SplFileInfo $file) => $file->getExtension() === 'md')
            ->map(fn (\SplFileInfo $file) => $file->getFilename())
            ->sort()
            ->values()
            ->toArray();
    }

    protected function formatFileSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
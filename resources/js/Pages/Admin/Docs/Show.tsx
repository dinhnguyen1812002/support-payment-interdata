import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Loader2, FileText, Download, Edit, Eye, Save } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { route } from 'ziggy-js';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { PageTransition } from '@/Components/ui/page-transition';
import { SidebarProvider, SidebarInset } from '@/Components/ui/sidebar';
import { 
  MDXEditor, 
  headingsPlugin, 
  listsPlugin, 
  quotePlugin, 
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  directivesPlugin,
  toolbarPlugin,
  KitchenSinkToolbar,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface Props {
  files: string[];
  content: string;
  currentFile: string;
}

// Custom toolbar component
const CustomToolbar = () => {
  return (
    <>
      <UndoRedo />
      <Separator />
      <BoldItalicUnderlineToggles />
      <Separator />
      <BlockTypeSelect />
      <Separator />
      <ListsToggle />
      <Separator />
      <CreateLink />
      <InsertImage />
      <Separator />
      <InsertTable />
      <InsertThematicBreak />
    </>
  );
};

export default function DocsShow({ files, content, currentFile: initialFile }: Props) {
  const [currentFile, setCurrentFile] = useState(initialFile);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  // Filter files based on search term
  const filteredFiles = useMemo(() => {
    return files.filter(file => 
      file.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, searchTerm]);

  // Calculate reading time (rough estimate)
  const readingTime = useMemo(() => {
    if (!content) return 0;
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, [content]);

  useEffect(() => {
    setCurrentFile(initialFile);
    setEditedContent(content);
    setIsLoading(false);
    setError(null);
    setIsEditMode(false);
  }, [initialFile, content]);

  const handleFileChange = (value: string) => {
    if (value === currentFile || value === 'no-results') return;
    
    setIsLoading(true);
    setError(null);
    setIsEditMode(false);
    
    router.visit(route('admin.docs.show', { file: value }), {
      onError: (errors) => {
        setError('Failed to load the document. Please try again.');
        setIsLoading(false);
      },
      onFinish: () => {
        setIsLoading(false);
      }
    });
  };

  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would typically make an API call to save the content
      // For now, we'll just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, you would make a POST request to save the file
      // router.post(route('admin.docs.update', { file: currentFile }), {
      //   content: editedContent
      // });
      
      setIsEditMode(false);
    } catch (error) {
      setError('Failed to save the document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // If exiting edit mode, reset content
      setEditedContent(content);
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <SidebarProvider>
      <Head title={`Documentation - ${currentFile}`} />
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title="Documentation" />
        <PageTransition>
          <div className="space-y-6">
            {/* Header with Search and Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {currentFile}
                  </h2>
                  {readingTime > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Estimated reading time: {readingTime} min
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-8 w-full sm:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={currentFile} onValueChange={handleFileChange}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select a file" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredFiles.length > 0 ? (
                      filteredFiles.map((file) => (
                        <SelectItem key={file} value={file}>
                          {file}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-results" disabled>
                        No matching files found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  {isEditMode ? (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleEditMode}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleEditMode}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadMarkdown}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  
                  <Link href={route('admin.docs.index')}>
                    <Button variant="outline">Back to List</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <Card className="shadow-sm">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex flex-col justify-center items-center h-64 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-muted-foreground">Loading document...</p>
                  </div>
                ) : error ? (
                  <div className="text-red-500 p-6 text-center">
                    <div className="mb-2">⚠️</div>
                    <p className="font-medium">{error}</p>
                  </div>
                ) : (
                  <div className="mdx-editor-container">
                    <MDXEditor
                      key={`${currentFile}-${isEditMode}`}
                      markdown={isEditMode ? editedContent : content}
                      onChange={setEditedContent}
                      readOnly={!isEditMode}
                      plugins={[
                        headingsPlugin(),
                        listsPlugin(),
                        quotePlugin(),
                        thematicBreakPlugin(),
                        markdownShortcutPlugin(),
                        linkPlugin(),
                        linkDialogPlugin(),
                        imagePlugin({
                          imageAutocompleteSuggestions: [
                            'https://via.placeholder.com/150',
                            'https://via.placeholder.com/300',
                          ],
                        }),
                        tablePlugin(),
                        codeBlockPlugin({
                          defaultCodeBlockLanguage: 'javascript',
                        }),
                        codeMirrorPlugin({
                          codeBlockLanguages: {
                            js: 'JavaScript',
                            javascript: 'JavaScript',
                            ts: 'TypeScript',
                            typescript: 'TypeScript',
                            tsx: 'TypeScript React',
                            jsx: 'JavaScript React',
                            css: 'CSS',
                            html: 'HTML',
                            json: 'JSON',
                            md: 'Markdown',
                            bash: 'Bash',
                            sh: 'Shell',
                            python: 'Python',
                            py: 'Python',
                            php: 'PHP',
                            sql: 'SQL',
                            yaml: 'YAML',
                            yml: 'YAML',
                            xml: 'XML',
                          },
                        }),
                        diffSourcePlugin({ 
                          viewMode: 'rich-text',
                          diffMarkdown: content 
                        }),
                        frontmatterPlugin(),
                        directivesPlugin(),
                        ...(isEditMode ? [
                          toolbarPlugin({
                            toolbarContents: () => <CustomToolbar />
                          })
                        ] : [])
                      ]}
                      className={`mdx-editor ${isEditMode ? 'edit-mode' : 'view-mode'}`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </SidebarInset>
      


    </SidebarProvider>
  );
}
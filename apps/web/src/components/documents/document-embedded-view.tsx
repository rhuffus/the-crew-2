import { useState, useCallback, useRef, useEffect } from 'react'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  UndoRedo,
  type MDXEditorMethods,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { FileText, Code, Eye, Save, Loader2 } from 'lucide-react'
import type { ProjectDocumentDto, UpdateProjectDocumentDto } from '@the-crew/shared-types'
import { Button } from '@/components/ui/button'
import { useProjectDocument, useUpdateProjectDocument } from '@/hooks/use-project-documents'

type EditorMode = 'visual' | 'source'

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
}

interface DocumentEmbeddedViewProps {
  projectId: string
  documentId: string
}

export function DocumentEmbeddedView({ projectId, documentId }: DocumentEmbeddedViewProps) {
  const { data: doc, isLoading } = useProjectDocument(projectId, documentId)
  const updateMutation = useUpdateProjectDocument(projectId)
  const [mode, setMode] = useState<EditorMode>('visual')
  const [sourceText, setSourceText] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const editorRef = useRef<MDXEditorMethods>(null)
  const initializedRef = useRef(false)
  const prevDocIdRef = useRef(documentId)

  // Reset when switching to a different document
  useEffect(() => {
    if (documentId !== prevDocIdRef.current) {
      prevDocIdRef.current = documentId
      initializedRef.current = false
      setHasChanges(false)
      setMode('visual')
      setSourceText('')
    }
  }, [documentId])

  // Sync doc content when loaded
  useEffect(() => {
    if (doc && !initializedRef.current) {
      setSourceText(doc.bodyMarkdown)
      initializedRef.current = true
    }
  }, [doc])

  const handleVisualChange = useCallback((markdown: string) => {
    setSourceText(markdown)
    setHasChanges(true)
  }, [])

  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value)
    setHasChanges(true)
  }, [])

  const switchMode = useCallback((newMode: EditorMode) => {
    if (newMode === 'visual' && mode === 'source') {
      editorRef.current?.setMarkdown(sourceText)
    } else if (newMode === 'source' && mode === 'visual') {
      const md = editorRef.current?.getMarkdown()
      if (md !== undefined) setSourceText(md)
    }
    setMode(newMode)
  }, [mode, sourceText])

  const handleSave = useCallback(() => {
    if (!doc) return
    const body = mode === 'visual'
      ? (editorRef.current?.getMarkdown() ?? sourceText)
      : sourceText
    const dto: UpdateProjectDocumentDto = {
      bodyMarkdown: body,
      lastUpdatedBy: 'user',
    }
    updateMutation.mutate({ id: documentId, dto }, {
      onSuccess: () => setHasChanges(false),
    })
  }, [doc, documentId, mode, sourceText, updateMutation])

  if (isLoading) {
    return (
      <div data-testid="document-embedded-view" className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div data-testid="document-embedded-view" className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Document not found</p>
      </div>
    )
  }

  return (
    <div data-testid="document-embedded-view" className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
        <h2 className="flex-1 truncate text-sm font-semibold">{doc.title}</h2>
        <DocumentMetaBadges doc={doc} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-1.5">
        <div className="flex rounded-md border border-border">
          <button
            type="button"
            onClick={() => switchMode('visual')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-l-md transition-colors ${
              mode === 'visual' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
            data-testid="mode-visual"
          >
            <Eye className="h-3 w-3" />
            Visual
          </button>
          <button
            type="button"
            onClick={() => switchMode('source')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-r-md transition-colors ${
              mode === 'source' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
            data-testid="mode-source"
          >
            <Code className="h-3 w-3" />
            Source
          </button>
        </div>
        <div className="flex-1" />
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
          data-testid="save-button"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <Save className="h-3 w-3 mr-1" />
          )}
          Save
        </Button>
      </div>

      {/* Editor area — fills remaining height */}
      <div className="flex-1 min-h-0 overflow-auto" data-testid="editor-area">
        {mode === 'visual' ? (
          <MDXEditor
            ref={editorRef}
            markdown={doc.bodyMarkdown}
            onChange={handleVisualChange}
            contentEditableClassName="prose prose-sm max-w-none min-h-full px-4 py-3 focus:outline-none"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <UndoRedo />
                    <BlockTypeSelect />
                    <BoldItalicUnderlineToggles />
                    <ListsToggle />
                  </>
                ),
              }),
            ]}
          />
        ) : (
          <textarea
            value={sourceText}
            onChange={handleSourceChange}
            className="h-full w-full resize-none bg-muted/50 px-4 py-3 font-mono text-sm outline-none focus:ring-1 focus:ring-primary"
            data-testid="source-textarea"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  )
}

function DocumentMetaBadges({ doc }: { doc: ProjectDocumentDto }) {
  return (
    <div className="flex items-center gap-2 shrink-0" data-testid="document-meta">
      <span className={`rounded px-1.5 py-0.5 text-[10px] leading-none ${STATUS_COLORS[doc.status] ?? 'bg-muted text-muted-foreground'}`}>
        {doc.status}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {doc.sourceType}
      </span>
    </div>
  )
}

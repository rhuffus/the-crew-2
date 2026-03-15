import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { DocumentLink } from './document-link'

interface MarkdownContentProps {
  content: string
  projectId: string
}

const DOC_MENTION_REGEX = /@doc:([a-zA-Z0-9_-]+)/g

function preprocessDocMentions(text: string): string {
  return text.replace(DOC_MENTION_REGEX, '[@doc:$1](#doc:$1)')
}

function CustomLink({
  href,
  children,
  projectId,
  ...props
}: ComponentPropsWithoutRef<'a'> & { projectId: string }) {
  if (href?.startsWith('#doc:')) {
    const slug = href.slice(5)
    return <DocumentLink slug={slug} projectId={projectId} />
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline" {...props}>
      {children}
    </a>
  )
}

export function MarkdownContent({ content, projectId }: MarkdownContentProps) {
  const processed = preprocessDocMentions(content)

  return (
    <div className="chat-markdown" data-testid="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => <CustomLink {...props} projectId={projectId} />,
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}

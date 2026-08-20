import { cn } from '@/lib/utils'

export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
  error?: boolean
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div
          aria-hidden="true"
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold leading-none text-primary-foreground"
        >
          {'>'}
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm bg-card text-card-foreground',
          message.error && 'border border-destructive/40 bg-destructive/10 text-foreground',
        )}
      >
        <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex w-full justify-start gap-3">
      <div
        aria-hidden="true"
        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold leading-none text-primary-foreground"
      >
        {'>'}
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-card px-4 py-4">
        <span className="sr-only">Assistant is typing</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-2 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

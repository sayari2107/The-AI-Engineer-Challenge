'use client'

import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { AccentureLogo } from '@/components/accenture-logo'
import { ChatMessage, TypingIndicator, type Message } from '@/components/chat-message'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'What can you help me with?',
  'Summarize the latest tech trends',
  'Draft a client email',
  'Explain generative AI simply',
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  // Auto-grow the textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`
  }, [input])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.error || 'Something went wrong.')
        }

        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: data.reply },
        ])
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: error instanceof Error ? error.message : 'Something went wrong.',
            error: true,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Respect IME composition (CJK input) before submitting on Enter
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <AccentureLogo />
          <span className="hidden text-sm text-muted-foreground sm:inline">| AI Assistant</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
          Online
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          {isEmpty ? (
            <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 text-center">
              <div
                aria-hidden="true"
                className="flex size-16 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground"
              >
                {'>'}
              </div>
              <div className="space-y-2">
                <h1 className="text-balance text-2xl font-semibold sm:text-3xl">
                  How can I help you today?
                </h1>
                <p className="text-pretty text-sm text-muted-foreground">
                  Ask me anything — I&apos;m the Accenture AI assistant.
                </p>
              </div>
              <div className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground transition-colors hover:border-primary/60 hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 py-6">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background px-4 py-4 sm:px-6">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 transition-colors focus-within:border-primary/70">
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Message the Accenture AI assistant..."
              className="max-h-44 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity',
                (!input.trim() || isLoading) && 'cursor-not-allowed opacity-40',
              )}
            >
              <ArrowUp className="size-5" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Responses are generated by AI and may be inaccurate.
          </p>
        </form>
      </div>
    </div>
  )
}

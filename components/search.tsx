'use client';
import * as React from 'react';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Loader2, MessageCircleIcon, RefreshCw, Send, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { buttonVariants } from './ui/button';
import Link from 'fumadocs-core/link';
import { type UIMessage, useChat, type UseChatHelpers } from '@ai-sdk/react';
import type { ProvideLinksToolSchema } from '../lib/inkeep-qa-schema';
import type { z } from 'zod';
import { DefaultChatTransport } from 'ai';
import { Markdown } from './markdown';
import { Presence } from '@radix-ui/react-presence';

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<UIMessage>;
  locale: string;
} | null>(null);

const translations = {
  en: {
    title: 'AI Chat',
    poweredBy: 'Powered by',
    close: 'Close',
    retry: 'Retry',
    clearChat: 'Clear Chat',
    aiAnswering: 'AI is answering...',
    askQuestion: 'Ask a question',
    abortAnswer: 'Abort Answer',
    startChat: 'Start a new chat below.',
  },
  'pt-BR': {
    title: 'Chat com IA',
    poweredBy: 'Powered by',
    close: 'Fechar',
    retry: 'Tentar novamente',
    clearChat: 'Limpar chat',
    aiAnswering: 'A IA está respondendo...',
    askQuestion: 'Faça uma pergunta',
    abortAnswer: 'Interromper resposta',
    startChat: 'Inicie uma conversa abaixo.',
  },
} as const;

const roleName: Record<string, Record<string, string>> = {
  en: {
    user: 'you',
    assistant: 'Obtrace AI',
  },
  'pt-BR': {
    user: 'voce',
    assistant: 'IA da Obtrace',
  },
};

function useT() {
  const { locale } = useAISearchContext();
  return translations[locale as keyof typeof translations] ?? translations.en;
}

export function AISearchPanelHeader({ className, ...props }: ComponentProps<'div'>) {
  const { setOpen } = useAISearchContext();
  const t = useT();

  return (
    <div
      className={cn(
        'sticky top-0 flex items-start gap-2 border rounded-xl bg-fd-secondary text-fd-secondary-foreground shadow-sm',
        className,
      )}
      {...props}
    >
      <div className="px-3 py-2 flex-1">
        <p className="text-sm font-medium mb-2">{t.title}</p>
        <p className="text-xs text-fd-muted-foreground">
          {t.poweredBy}{' '}
          <a href="https://inkeep.com" target="_blank" rel="noreferrer noopener">
            Inkeep AI
          </a>
        </p>
      </div>

      <button
        aria-label={t.close}
        tabIndex={-1}
        className={cn(
          buttonVariants({
            size: 'icon-sm',
            color: 'ghost',
            className: 'text-fd-muted-foreground rounded-full',
          }),
        )}
        onClick={() => setOpen(false)}
      >
        <X />
      </button>
    </div>
  );
}

export function AISearchInputActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const t = useT();
  const isLoading = status === 'streaming';

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === 'assistant' && (
        <button
          type="button"
          className={cn(
            buttonVariants({
              color: 'secondary',
              size: 'sm',
              className: 'rounded-full gap-1.5',
            }),
          )}
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4" />
          {t.retry}
        </button>
      )}
      <button
        type="button"
        className={cn(
          buttonVariants({
            color: 'secondary',
            size: 'sm',
            className: 'rounded-full',
          }),
        )}
        onClick={() => setMessages([])}
      >
        {t.clearChat}
      </button>
    </>
  );
}

const StorageKeyInput = '__ai_search_input';
export function AISearchInput(props: ComponentProps<'form'>) {
  const { status, sendMessage, stop } = useChatContext();
  const { open } = useAISearchContext();
  const t = useT();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (input.trim().length === 0) return;
    void sendMessage({ text: input });
    setInput('');
  };

  useEffect(() => {
    try {
      setInput(localStorage.getItem(StorageKeyInput) ?? '');
    } catch {
      setInput('');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(StorageKeyInput, input);
    } catch {}
  }, [input]);

  useEffect(() => {
    if (open || isLoading) inputRef.current?.focus();
  }, [open, isLoading]);

  return (
    <form
      {...props}
      className={cn('flex items-center gap-3 p-2', props.className)}
      onClick={(event) => event.stopPropagation()}
      onSubmit={onStart}
    >
      <Input
        ref={inputRef}
        value={input}
        placeholder={isLoading ? t.aiAnswering : t.askQuestion}
        className="h-11 px-4"
        disabled={status === 'streaming' || status === 'submitted'}
        onChange={(e) => {
          setInput(e.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onStart(event);
          }
        }}
      />
      {isLoading ? (
        <button
          key="bn"
          type="button"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-fd-border bg-fd-secondary px-4 text-sm font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            stop();
          }}
        >
          <Loader2 className="size-4 animate-spin text-fd-muted-foreground" />
          {t.abortAnswer}
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          aria-label={t.askQuestion}
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fd-primary text-fd-primary-foreground transition-colors hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          disabled={input.length === 0}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onStart(event);
          }}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function List(props: Omit<ComponentProps<'div'>, 'dir'>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    function callback() {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'instant',
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current?.firstElementChild;

    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn('fd-scroll-container overflow-y-auto min-w-0 flex flex-col', props.className)}
    >
      {props.children}
    </div>
  );
}

const Input = React.forwardRef<HTMLInputElement, ComponentProps<'input'>>(function Input(props, ref) {
  return (
    <div className="min-w-0 flex-1 rounded-full border bg-fd-secondary text-fd-secondary-foreground">
      <input
        ref={ref}
        id="nd-ai-input"
        type="text"
        {...props}
        className={cn(
          'w-full rounded-full bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none',
          props.className,
        )}
      />
    </div>
  );
});

function Message({ message, ...props }: { message: UIMessage } & ComponentProps<'div'>) {
  const { locale } = useAISearchContext();
  let markdown = '';
  let links: z.infer<typeof ProvideLinksToolSchema>['links'] = [];

  for (const part of message.parts ?? []) {
    if (part.type === 'text') {
      markdown += part.text;
      continue;
    }

    if (part.type === 'tool-provideLinks' && part.input) {
      links = (part.input as z.infer<typeof ProvideLinksToolSchema>).links;
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()} {...props}>
      <p
        className={cn(
          'mb-1 text-sm font-medium text-fd-muted-foreground',
          message.role === 'assistant' && 'text-fd-primary',
        )}
      >
        {roleName[locale as keyof typeof roleName]?.[message.role] ?? 'unknown'}
      </p>
      <div className="prose text-sm">
        <Markdown text={markdown} />
      </div>
      {links && links.length > 0 && (
        <div className="mt-2 flex flex-row flex-wrap items-center gap-1">
          {links.map((item, i) => (
            <Link
              key={i}
              href={item.url}
              className="block text-xs rounded-lg border p-3 hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-fd-muted-foreground">Reference {item.label}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AISearch({ children, locale = 'en' }: { children: ReactNode; locale?: string }) {
  const [open, setOpen] = useState(false);
  const chat = useChat({
    id: 'search',
    transport: new DefaultChatTransport({
      api: `/api/chat?locale=${encodeURIComponent(locale)}`,
    }),
  });

  return (
    <Context.Provider value={useMemo(() => ({ chat, locale, open, setOpen }), [chat, locale, open])}>
      {children}
    </Context.Provider>
  );
}

export function AISearchTrigger({
  position = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { position?: 'default' | 'float' }) {
  const { open, setOpen } = useAISearchContext();

  return (
    <button
      data-state={open ? 'open' : 'closed'}
      className={cn(
        position === 'float' && [
          'docs-ai-fab transition-all',
        ],
        className,
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = useAISearchContext();
  useHotKey();

  return (
    <>
      <style>
        {`
        @keyframes ask-ai-open {
          from {
            translate: 100% 0;
          }
          to {
            translate: 0 0;
          }
        }
        @keyframes ask-ai-close {
          from {
            width: var(--ai-chat-width);
          }
          to {
            width: 0px;
          }
        }`}
      </style>
      <Presence present={open}>
        <div
          data-state={open ? 'open' : 'closed'}
          className="docs-ai-overlay data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out"
          onClick={() => setOpen(false)}
        />
      </Presence>
      <Presence present={open}>
        <div
          className={cn(
            'docs-ai-sheet',
            open
              ? 'animate-fd-dialog-in lg:animate-[ask-ai-open_200ms]'
              : 'animate-fd-dialog-out lg:animate-[ask-ai-close_200ms]',
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex flex-col size-full p-3">
            <AISearchPanelHeader />
            <AISearchPanelList className="flex-1" />
            <div className="rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm has-focus-visible:shadow-md">
              <AISearchInput />
              <div className="flex items-center gap-1.5 p-1 empty:hidden">
                <AISearchInputActions />
              </div>
            </div>
          </div>
        </div>
      </Presence>
    </>
  );
}

export function AISearchPanelList({ className, style, ...props }: ComponentProps<'div'>) {
  const chat = useChatContext();
  const t = useT();
  const messages = chat.messages.filter((msg) => msg.role !== 'system');

  return (
    <List
      className={cn('py-4 overscroll-contain', className)}
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
        ...style,
      }}
      {...props}
    >
      {messages.length === 0 ? (
        <div className="text-sm text-fd-muted-foreground/80 size-full flex flex-col items-center justify-center text-center gap-2">
          <MessageCircleIcon fill="currentColor" stroke="none" />
          <p onClick={(e) => e.stopPropagation()}>{t.startChat}</p>
        </div>
      ) : (
        <div className="flex flex-col px-3 gap-4">
          {messages.map((item) => (
            <Message key={item.id} message={item} />
          ))}
        </div>
      )}
    </List>
  );
}

export function useHotKey() {
  const { open, setOpen } = useAISearchContext();

  const onKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      e.preventDefault();
    }

    if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true);
      e.preventDefault();
    }
  }, [open, setOpen]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress);
    return () => window.removeEventListener('keydown', onKeyPress);
  }, [onKeyPress]);
}

export function useAISearchContext() {
  return useContext(Context)!;
}

function useChatContext() {
  return useContext(Context)!.chat;
}

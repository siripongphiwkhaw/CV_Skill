import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { z } from 'zod/v4';
import type { Exchange } from '../exchanges';
import { parseReply } from '../lib/parseReply';

interface Props<Input, S extends z.ZodTypeAny> {
  exchange: Exchange<Input, S>;
  input: Input;
  title?: string;
  disabled?: boolean;
  disabledReason?: string;
  /** Shown in green once a reply has been applied, e.g. "Applied · 13 skills". */
  applied?: string | null;
  onResult: (data: z.infer<S>) => void;
}

/**
 * The app's one AI hop: build a prompt, let the user carry it to any Claude
 * chat, and validate what comes back. Nothing is applied until it parses.
 */
export function PromptExchange<Input, S extends z.ZodTypeAny>({
  exchange, input, title, disabled, disabledReason, applied, onResult,
}: Props<Input, S>) {
  const [reply, setReply] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState<'no' | 'yes' | 'failed'>('no');
  const [showPrompt, setShowPrompt] = useState(false);
  const [shake, setShake] = useState(0);
  const reduce = useReducedMotion();

  const prompt = useMemo(() => (disabled ? '' : exchange.buildPrompt(input)), [exchange, input, disabled]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied('yes');
      window.setTimeout(() => setCopied('no'), 2500);
    } catch {
      setCopied('failed');
      setShowPrompt(true);
    }
  };

  const validate = () => {
    const result = parseReply(reply, exchange.schema);
    if (result.ok) {
      setErrors([]);
      setReply('');
      onResult(result.data);
    } else {
      setErrors(result.errors);
      setShake((n) => n + 1);
    }
  };

  return (
    <section className="exchange" aria-label={`Prompt exchange: ${title ?? exchange.title}`}>
      <div className="exchange-title">
        <CopyIcon />
        Prompt exchange · {title ?? exchange.title}
      </div>
      <div className="row">
        <button type="button" className="btn btn-secondary" onClick={copy} disabled={disabled} title={disabled ? disabledReason : undefined}>
          {copied === 'yes' ? 'Copied' : 'Copy prompt'}
        </button>
        <span className="exchange-help">
          {disabled ? disabledReason : 'Paste it into claude.ai or Claude Code, then paste the JSON it returns below.'}
        </span>
      </div>
      {!disabled && (
        <details open={showPrompt} onToggle={(e) => setShowPrompt(e.currentTarget.open)}>
          <summary>{copied === 'failed' ? 'Clipboard blocked — copy the prompt from here' : 'Show the prompt'}</summary>
          <pre>{prompt}</pre>
        </details>
      )}
      <motion.label
        className="field" key={shake}
        animate={shake && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.36, ease: 'easeInOut' }}
      >
        <span>Paste the JSON reply</span>
        <textarea
          className="mono" rows={3} value={reply} disabled={disabled}
          aria-invalid={errors.length > 0 || undefined}
          onChange={(e) => setReply(e.target.value)}
          placeholder='{ "…": … }'
        />
      </motion.label>
      {errors.length > 0 && (
        <ul className="exchange-errors" role="alert">
          {errors.slice(0, 8).map((e, i) => <li key={i}>{e}</li>)}
          {errors.length > 8 && <li>…and {errors.length - 8} more</li>}
        </ul>
      )}
      <div className="row">
        <button type="button" className="btn btn-primary" onClick={validate} disabled={disabled || !reply.trim()}>
          Validate &amp; apply
        </button>
        {applied && (
          <motion.span
            key={applied} className="chip chip-covered"
            initial={reduce ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.35 }}
          >
            {applied}
          </motion.span>
        )}
      </div>
    </section>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

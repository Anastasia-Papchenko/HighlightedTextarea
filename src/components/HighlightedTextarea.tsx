import { useRef, useEffect, useState, FC } from 'react';
import Editor from 'react-simple-code-editor';
import './HighlightedTextarea.scss';
import type { Token, HighlightedTextareaProps, TokenType } from './HighlightedTextarea.types';

const VALID_KEYS = ['TI', 'AB', 'DP', 'URL'];

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    const ch = code[i];

    if (/\s/.test(ch)) {
      let start = i;
      while (i < code.length && /\s/.test(code[i])) i++;
      tokens.push({ type: 'ws', value: code.slice(start, i) });
      continue;
    }
    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'punct', value: ch });
      i++;
      continue;
    }
    if (ch === '=') {
      tokens.push({ type: 'punct', value: ch });
      i++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      const quoteType = ch;
      i++;
      let strContent = '';
      let hasClosing = false;
      while (i < code.length) {
        if (code[i] === '\\' && i + 1 < code.length) {
          strContent += code[i] + code[i + 1];
          i += 2;
        } else if (code[i] === quoteType) {
          hasClosing = true;
          i++; 
          break;
        } else {
          strContent += code[i];
          i++;
        }
      }
      tokens.push({ type: 'quote', value: quoteType });
      if (strContent.length > 0) {
        tokens.push({ type: 'string', value: strContent });
      }
      if (hasClosing) {
        tokens.push({ type: 'quote', value: quoteType });
      }
      continue;
    }


    const upper3 = code.slice(i, i + 3).toUpperCase();
    if (upper3 === 'AND' || upper3 === 'NOT') {
      const before = i === 0 || /\W/.test(code[i - 1]);
      const after = i + 3 >= code.length || /\W/.test(code[i + 3]);
      if (before && after) {
        tokens.push({ type: 'logic', value: upper3 });
        i += 3;
        continue;
      }
    }
    const upper2 = code.slice(i, i + 2).toUpperCase();
    if (upper2 === 'OR') {
      const before = i === 0 || /\W/.test(code[i - 1]);
      const after = i + 2 >= code.length || /\W/.test(code[i + 2]);
      if (before && after) {
        tokens.push({ type: 'logic', value: 'OR' });
        i += 2;
        continue;
      }
    }

    if (/[A-Za-z]/.test(ch)) {
      let start = i;
      while (i < code.length && /[A-Za-z]/.test(code[i])) i++;
      const maybeKey = code.slice(start, i);
      let tempI = i;
      while (tempI < code.length && /\s/.test(code[tempI])) tempI++;
      if (code[tempI] === '=') {
        tempI++;
        while (tempI < code.length && /\s/.test(code[tempI])) tempI++;
        if (code[tempI] === '"' || code[tempI] === "'") {
          const cls: TokenType = VALID_KEYS.includes(maybeKey) ? 'key' : 'key-invalid';
          tokens.push({ type: cls, value: maybeKey });
          continue;
        }
      }
      tokens.push({ type: 'other', value: maybeKey });
      continue;
    }

    let start = i;
    while (
      i < code.length &&
      !/\s/.test(code[i]) &&
      !['(', ')', '=', '"', "'"].includes(code[i])
    ) {
      i++;
    }
    if (start < i) {
      tokens.push({ type: 'other', value: code.slice(start, i) });
    } else {
      tokens.push({ type: 'other', value: ch });
      i++;
    }
  }

  return tokens;
}


function tokensToHtml(tokens: Token[]): string {
  return tokens
    .map(({ type, value }) => {
      switch (type) {
        case 'key':
          return `<span class="token-key">${value}</span>`;
        case 'key-invalid':
          return `<span class="token-key-invalid">${value}</span>`;
        case 'string':
          return `<span class="token-string">${value}</span>`;
        case 'logic':
          return `<span class="token-logic">${value}</span>`;
        case 'punct':
          return `<span class="token-punct">${value}</span>`;
        case 'quote':
          return `<span class="token-quote">${value}</span>`;
        case 'ws':
          return value;
        default:
          return value;
      }
    })
    .join('');
}

export function highlightCode(code: string): string {
  const tokens = tokenize(code);
  return tokensToHtml(tokens);
}


export const HighlightedTextarea: FC<HighlightedTextareaProps> = ({
  value = '',
  onChange,
  placeholder = ''
}) => {
  const [code, setCode] = useState<string>(value);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Находим textarea внутри редактора
    const textarea = editorRef.current?.querySelector('textarea');
    if (!textarea) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const PAIRS: Record<string, string> = {
        '"': '"',
        "'": "'",
        '(': ')',
        '[': ']',
        '{': '}',
      };
      if (Object.keys(PAIRS).includes(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const val = textarea.value;
        const { selectionStart, selectionEnd } = textarea;
        const left = val.slice(0, selectionStart);
        const right = val.slice(selectionEnd);
        const insert = e.key + PAIRS[e.key];
        const newCursor = selectionStart + 1;
        const newCode = left + insert + right;
        setCode(newCode);
        onChange?.(newCode);
        setTimeout(() => {
          textarea.setSelectionRange(newCursor, newCursor);
          textarea.focus();
        }, 0);
      }
    };

    textarea.addEventListener('keydown', handleKeyDown);
    return () => {
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  }, [code, onChange]);

  const handleChange = (newCode: string) => {
    setCode(newCode);
    onChange?.(newCode);
  };

  return (
    <div ref={editorRef}>
      <Editor
        value={code}
        onValueChange={handleChange}
        highlight={highlightCode}
        padding={10}
        className="highlighted-textarea"
        placeholder={placeholder}
        textareaId="highlighted-editor"
        style={{
          fontFamily: 'monospace',
          fontSize: 14,
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          minHeight: 200,
          outline: 'none',
          color: '#aaa',
        }}
      />
    </div>
  );
};
export type TokenType =
  | 'key'
  | 'key-invalid'
  | 'string'
  | 'logic'
  | 'punct'
  | 'quote'
  | 'ws'
  | 'other';

export interface Token {
  type: TokenType;
  value: string;
}

export interface HighlightedTextareaProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
}

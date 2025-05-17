export function validateExpression(expr: string): string | null {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '(') depth++;
    if (ch === ')') {
      depth--;
      if (depth < 0) return 'Лишняя закрывающая скобка';
    }
  }
  if (depth > 0) return 'Не хватает закрывающих скобок';

  if (!expr.trim()) return null; 

  expr = expr
    .replace(/[“”«»„‟❝❞＂]/g, '"')
    .replace(/[‘’‚‛❛❜']+/g, "'");

  const type2Regex = /\b[A-Za-z]{2,5}\s*=\s*(['"])(?:\\.|(?!\1)[^\\])*?\1/g;
  const type2Blocks = expr.match(type2Regex) ?? [];

  const type1Regex = /(['"])(?:\\.|(?!\1)[^\\])*?\1/g;
  const type1Blocks = (expr.replace(type2Regex, '').match(type1Regex) ?? [])

  const hasType1 = type1Blocks.length > 0;
  const hasType2 = type2Blocks.length > 0;
  if (hasType1 && hasType2) {
    return 'Смешение логических блоков без ключа и с ключом запрещено';
  }

  if (!hasType1 && !hasType2) {
    return `Нераспознанный текст: "${expr.trim()}"`;
  }

  let currentRegex: RegExp;
  if (hasType2) {
    currentRegex = /\b[A-Za-z]{2,5}\s*=\s*(['"])(?:\\.|(?!\1)[^\\])*?\1/g;
  } else {
    currentRegex = /(['"])(?:\\.|(?!\1)[^\\])*?\1/g;
  }

  const tokens: {type: 'block'|'op'|'not'|'par'|'other', value: string}[] = [];
  let re = new RegExp(currentRegex.source + '|\\bAND\\b|\\bOR\\b|\\bNOT\\b|[()]', 'gi');
  let m: RegExpExecArray | null;
  let lastIndex = 0;
  while ((m = re.exec(expr)) !== null) {
    if (m.index > lastIndex) {
      const unknown = expr.slice(lastIndex, m.index).trim();
      if (unknown) return `Нераспознанный текст: "${unknown}"`;
    }
    const val = m[0];
    if (/^\bAND\b$/i.test(val) || /^\bOR\b$/i.test(val)) tokens.push({type: 'op', value: val.toUpperCase()});
    else if (/^\bNOT\b$/i.test(val)) tokens.push({type: 'not', value: val.toUpperCase()});
    else if (val === '(' || val === ')') tokens.push({type: 'par', value: val});
    else tokens.push({type: 'block', value: val});
    lastIndex = re.lastIndex;
  }
  if (lastIndex < expr.length && expr.slice(lastIndex).trim())
    return `Нераспознанный текст: "${expr.slice(lastIndex).trim()}"`;

  let expectOp = false; 
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'block') {
      if (expectOp) {
        return 'Между блоками должна быть логическая связка (AND/OR)';
      }
      expectOp = true;
    } else if (t.type === 'op') {
      if (!expectOp) {
        return 'Логическая связка не может идти подряд или стоять в начале';
      }
      expectOp = false;
    } else if (t.type === 'not') {
      if (expectOp) {
        return 'NOT должен стоять только перед логическим блоком';
      }
    }
  }
  if (!expectOp && tokens.length > 1) {
    return 'Выражение не должно заканчиваться логической связкой';
  }

  return null;
}

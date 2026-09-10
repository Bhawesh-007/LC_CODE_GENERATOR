/**
 * Parser module — extracts structured metadata from LeetCode C++ templates.
 * Browser-compatible (no require/module.exports).
 */

function parseParam(paramStr) {
  paramStr = paramStr.trim();
  if (!paramStr) return null;

  let depth = 0;
  let splitIdx = -1;

  for (let i = paramStr.length - 1; i >= 0; i--) {
    const ch = paramStr[i];
    if (ch === '>') depth++;
    else if (ch === '<') depth--;
    else if ((ch === ' ' || ch === '\t') && depth === 0) {
      splitIdx = i;
      break;
    }
  }

  if (splitIdx === -1) {
    return { type: paramStr, name: 'arg' };
  }

  let type = paramStr.substring(0, splitIdx).trim();
  let name = paramStr.substring(splitIdx + 1).trim();

  while (name.startsWith('*') || name.startsWith('&')) {
    type += name[0];
    name = name.substring(1);
  }

  return { type, name };
}

function parseParamList(paramListStr) {
  paramListStr = paramListStr.trim();
  if (!paramListStr) return [];

  const params = [];
  let depth = 0;
  let current = '';

  for (let i = 0; i < paramListStr.length; i++) {
    const ch = paramListStr[i];
    if (ch === '<') depth++;
    else if (ch === '>') depth--;
    else if (ch === ',' && depth === 0) {
      const p = parseParam(current);
      if (p) params.push(p);
      current = '';
      continue;
    }
    current += ch;
  }

  const p = parseParam(current);
  if (p) params.push(p);

  return params;
}

function parseTemplate(template) {
  const classMatch = template.match(/^([\s\S]*?)(class\s+Solution\s*\{[\s\S]*\};)/m);

  let prefix = '';
  let solutionBlock = template;

  if (classMatch) {
    prefix = classMatch[1];
    solutionBlock = classMatch[2];
  }

  const methods = [];
  const bodyMatch = solutionBlock.match(/class\s+Solution\s*\{[\s\S]*?public\s*:([\s\S]*)\};/);

  if (bodyMatch) {
    const body = bodyMatch[1];
    const methodRegex = /^\s*([\w<>&*:\s]+?)\s+(\w+)\s*\(\s*([\s\S]*?)\s*\)\s*\{/gm;
    let match;

    while ((match = methodRegex.exec(body)) !== null) {
      let returnType = match[1].trim();
      const methodName = match[2].trim();
      const paramListStr = match[3].trim();

      if (methodName === 'Solution' || returnType === '' || returnType === 'public' || returnType === 'private') {
        continue;
      }

      const params = parseParamList(paramListStr);
      methods.push({ name: methodName, returnType, params });
    }
  }

  return {
    prefix: prefix.trim(),
    originalTemplate: solutionBlock.trim(),
    methods,
  };
}

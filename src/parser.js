/**
 * Parser module — extracts structured metadata from LeetCode C++ templates.
 *
 * Given a raw LC template string like:
 *   // Definition for singly-linked list.
 *   // class ListNode { ... }
 *   class Solution {
 *   public:
 *       bool isPalindrome(int x) { }
 *   };
 *
 * Produces:
 *   {
 *     prefix: "// Definition for singly-linked list.\n...",
 *     originalTemplate: "<the full class Solution block>",
 *     methods: [{ name: "isPalindrome", returnType: "bool", params: [{ type: "int", name: "x" }] }]
 *   }
 */

/**
 * Parse a single parameter string like "vector<int>& nums" into { type, name }.
 * Handles:
 *   - "int x"
 *   - "vector<int>& nums"
 *   - "const string& s"
 *   - "ListNode* head"
 *   - "vector<vector<int>> matrix"
 *   - "long long n"
 */
function parseParam(paramStr) {
  paramStr = paramStr.trim();
  if (!paramStr) return null;

  // Strategy: walk backwards from end to find the last whitespace that isn't
  // inside angle brackets, then split there.
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
    // No space found — treat entire thing as type with no name
    return { type: paramStr, name: 'arg' };
  }

  let type = paramStr.substring(0, splitIdx).trim();
  let name = paramStr.substring(splitIdx + 1).trim();

  // Handle pointer/reference attached to name: "ListNode *head" or "int &x"
  while (name.startsWith('*') || name.startsWith('&')) {
    type += name[0];
    name = name.substring(1);
  }

  return { type, name };
}

/**
 * Parse the parameter list string (everything between the parentheses).
 * Splits by commas, but respects angle brackets so "vector<pair<int,int>>" doesn't get split.
 */
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

  // Last param
  const p = parseParam(current);
  if (p) params.push(p);

  return params;
}

/**
 * Main parser: takes the full LC template string, returns structured data.
 */
function parseTemplate(template) {
  // 1. Find where "class Solution" begins — everything before is prefix
  const classMatch = template.match(/^([\s\S]*?)(class\s+Solution\s*\{[\s\S]*\};)/m);

  let prefix = '';
  let solutionBlock = template;

  if (classMatch) {
    prefix = classMatch[1];
    solutionBlock = classMatch[2];
  }

  // 2. Extract methods from the Solution class body (everything after "public:")
  const methods = [];
  const bodyMatch = solutionBlock.match(/class\s+Solution\s*\{[\s\S]*?public\s*:([\s\S]*)\};/);

  if (bodyMatch) {
    const body = bodyMatch[1];

    // 3. Match method signatures: returnType methodName(params) {
    const methodRegex = /^\s*([\w<>&*:\s]+?)\s+(\w+)\s*\(\s*([\s\S]*?)\s*\)\s*\{/gm;
    let match;

    while ((match = methodRegex.exec(body)) !== null) {
      let returnType = match[1].trim();
      const methodName = match[2].trim();
      const paramListStr = match[3].trim();

      // Skip constructor-like patterns or access specifiers
      if (methodName === 'Solution' || returnType === '' || returnType === 'public' || returnType === 'private') {
        continue;
      }

      const params = parseParamList(paramListStr);
      methods.push({
        name: methodName,
        returnType,
        params,
      });
    }
  }

  return {
    prefix: prefix.trim(),
    originalTemplate: solutionBlock.trim(),
    methods,
  };
}

module.exports = { parseTemplate, parseParam, parseParamList };

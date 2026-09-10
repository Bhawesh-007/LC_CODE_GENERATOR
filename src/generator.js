/**
 * Generator module — takes parsed metadata and produces a complete runnable C++ file.
 */

const { parseTemplate } = require('./parser');
const {
  LINKED_LIST_HELPERS,
  TREE_HELPERS,
  needsLinkedListHelpers,
  needsTreeHelpers,
  uncommentDefinitions,
} = require('./helpers');

/**
 * Strip const, &, extra spaces from a type to get the base declaration type.
 * "const vector<int>&" → "vector<int>"
 * "int&" → "int"
 */
function baseType(type) {
  return type.replace(/\bconst\b/g, '').replace(/&/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Generate cin code for reading a variable of a given type.
 * Returns an array of C++ code lines (indented with 4 spaces).
 */
function generateInputCode(type, varName) {
  const bt = baseType(type);
  const lines = [];

  // Primitives
  if (['int', 'long long', 'long', 'double', 'float', 'char', 'bool', 'short', 'unsigned int'].includes(bt)) {
    lines.push(`    ${bt} ${varName};`);
    lines.push(`    cin >> ${varName};`);
    return lines;
  }

  // String
  if (bt === 'string') {
    lines.push(`    string ${varName};`);
    lines.push(`    cin >> ${varName};`);
    return lines;
  }

  // vector<vector<T>> — 2D
  const vvMatch = bt.match(/^vector\s*<\s*vector\s*<\s*(.+?)\s*>\s*>$/);
  if (vvMatch) {
    const innerType = vvMatch[1];
    lines.push(`    int ${varName}_rows, ${varName}_cols;`);
    lines.push(`    cin >> ${varName}_rows >> ${varName}_cols;`);
    lines.push(`    vector<vector<${innerType}>> ${varName}(${varName}_rows, vector<${innerType}>(${varName}_cols));`);
    lines.push(`    for(int i = 0; i < ${varName}_rows; i++)`);
    lines.push(`        for(int j = 0; j < ${varName}_cols; j++)`);
    lines.push(`            cin >> ${varName}[i][j];`);
    return lines;
  }

  // vector<T> — 1D
  const vMatch = bt.match(/^vector\s*<\s*(.+?)\s*>$/);
  if (vMatch) {
    const innerType = vMatch[1];
    lines.push(`    int ${varName}_size;`);
    lines.push(`    cin >> ${varName}_size;`);
    lines.push(`    vector<${innerType}> ${varName}(${varName}_size);`);
    lines.push(`    for(int i = 0; i < ${varName}_size; i++) cin >> ${varName}[i];`);
    return lines;
  }

  // ListNode*
  if (bt === 'ListNode*' || bt === 'ListNode *') {
    lines.push(`    int ${varName}_size;`);
    lines.push(`    cin >> ${varName}_size;`);
    lines.push(`    ListNode* ${varName} = buildLinkedList(${varName}_size);`);
    return lines;
  }

  // TreeNode*
  if (bt === 'TreeNode*' || bt === 'TreeNode *') {
    lines.push(`    int ${varName}_size;`);
    lines.push(`    cin >> ${varName}_size;`);
    lines.push(`    vector<int> ${varName}_vals(${varName}_size);`);
    lines.push(`    for(int i = 0; i < ${varName}_size; i++) cin >> ${varName}_vals[i];`);
    lines.push(`    TreeNode* ${varName} = buildTree(${varName}_vals);`);
    return lines;
  }

  // Fallback: try plain cin
  lines.push(`    ${bt} ${varName};`);
  lines.push(`    cin >> ${varName};`);
  return lines;
}

/**
 * Generate cout code for printing a result of a given type.
 * Returns an array of C++ code lines.
 */
function generateOutputCode(type, varName) {
  const bt = baseType(type);
  const lines = [];

  // void — no output
  if (bt === 'void') return lines;

  // Primitives and string
  if (['int', 'long long', 'long', 'double', 'float', 'char', 'bool', 'short', 'unsigned int', 'string'].includes(bt)) {
    lines.push(`    cout << ${varName} << endl;`);
    return lines;
  }

  // vector<vector<T>>
  const vvMatch = bt.match(/^vector\s*<\s*vector\s*<\s*(.+?)\s*>\s*>$/);
  if (vvMatch) {
    lines.push(`    for(auto& row : ${varName}) {`);
    lines.push(`        for(int i = 0; i < (int)row.size(); i++) {`);
    lines.push(`            if(i) cout << " ";`);
    lines.push(`            cout << row[i];`);
    lines.push(`        }`);
    lines.push(`        cout << endl;`);
    lines.push(`    }`);
    return lines;
  }

  // vector<T>
  const vMatch = bt.match(/^vector\s*<\s*(.+?)\s*>$/);
  if (vMatch) {
    lines.push(`    for(int i = 0; i < (int)${varName}.size(); i++) {`);
    lines.push(`        if(i) cout << " ";`);
    lines.push(`        cout << ${varName}[i];`);
    lines.push(`    }`);
    lines.push(`    cout << endl;`);
    return lines;
  }

  // ListNode*
  if (bt === 'ListNode*' || bt === 'ListNode *') {
    lines.push(`    printLinkedList(${varName});`);
    return lines;
  }

  // TreeNode*
  if (bt === 'TreeNode*' || bt === 'TreeNode *') {
    lines.push(`    printTree(${varName});`);
    return lines;
  }

  // Fallback
  lines.push(`    cout << ${varName} << endl;`);
  return lines;
}

/**
 * Main generator function.
 * Takes a raw LC template string, returns a complete runnable C++ file.
 */
function generate(template) {
  const parsed = parseTemplate(template);

  if (parsed.methods.length === 0) {
    throw new Error('No methods found in the Solution class. Please check the template format.');
  }

  const method = parsed.methods[0];
  const parts = [];

  // 1. Headers
  parts.push('#include<bits/stdc++.h>');
  parts.push('using namespace std;');
  parts.push('');

  // 2. Data structure definitions (uncommented from prefix)
  if (parsed.prefix) {
    const uncommented = uncommentDefinitions(parsed.prefix);
    if (uncommented) {
      parts.push(uncommented);
      parts.push('');
    }
  }

  // 3. Original Solution class
  parts.push(parsed.originalTemplate);
  parts.push('');

  // 4. Helper functions (only if needed)
  if (needsLinkedListHelpers(parsed.methods)) {
    parts.push(LINKED_LIST_HELPERS.trim());
    parts.push('');
  }

  if (needsTreeHelpers(parsed.methods)) {
    parts.push(TREE_HELPERS.trim());
    parts.push('');
  }

  // 5. main() function
  parts.push('int main(){');

  // Read input for each parameter
  for (const param of method.params) {
    const inputLines = generateInputCode(param.type, param.name);
    parts.push(...inputLines);
  }

  parts.push('');

  // Create Solution and call method
  parts.push('    Solution sol;');
  const paramNames = method.params.map(p => p.name).join(', ');

  if (baseType(method.returnType) === 'void') {
    parts.push(`    sol.${method.name}(${paramNames});`);
  } else {
    const rt = baseType(method.returnType);
    parts.push(`    ${rt} ans = sol.${method.name}(${paramNames});`);
  }

  // Print output
  const outputLines = generateOutputCode(method.returnType, 'ans');
  if (outputLines.length > 0) {
    parts.push('');
    parts.push(...outputLines);
  }

  parts.push('');
  parts.push('    return 0;');
  parts.push('}');

  return parts.join('\n');
}

module.exports = { generate, generateInputCode, generateOutputCode, baseType };

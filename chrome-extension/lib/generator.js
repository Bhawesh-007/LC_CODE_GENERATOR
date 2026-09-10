/**
 * Generator module — builds complete runnable C++ files.
 * Browser-compatible (no require/module.exports).
 * Depends on: parser.js (parseTemplate), helpers.js (all exports)
 */

function baseType(type) {
  return type.replace(/\bconst\b/g, '').replace(/&/g, '').replace(/\s+/g, ' ').trim();
}

function generateInputCode(type, varName) {
  const bt = baseType(type);
  const lines = [];

  if (['int', 'long long', 'long', 'double', 'float', 'char', 'bool', 'short', 'unsigned int'].includes(bt)) {
    lines.push(`    ${bt} ${varName};`);
    lines.push(`    cin >> ${varName};`);
    return lines;
  }

  if (bt === 'string') {
    lines.push(`    string ${varName};`);
    lines.push(`    cin >> ${varName};`);
    return lines;
  }

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

  const vMatch = bt.match(/^vector\s*<\s*(.+?)\s*>$/);
  if (vMatch) {
    const innerType = vMatch[1];
    lines.push(`    int ${varName}_size;`);
    lines.push(`    cin >> ${varName}_size;`);
    lines.push(`    vector<${innerType}> ${varName}(${varName}_size);`);
    lines.push(`    for(int i = 0; i < ${varName}_size; i++) cin >> ${varName}[i];`);
    return lines;
  }

  if (bt === 'ListNode*' || bt === 'ListNode *') {
    lines.push(`    int ${varName}_size;`);
    lines.push(`    cin >> ${varName}_size;`);
    lines.push(`    ListNode* ${varName} = buildLinkedList(${varName}_size);`);
    return lines;
  }

  if (bt === 'TreeNode*' || bt === 'TreeNode *') {
    lines.push(`    int ${varName}_size;`);
    lines.push(`    cin >> ${varName}_size;`);
    lines.push(`    vector<int> ${varName}_vals(${varName}_size);`);
    lines.push(`    for(int i = 0; i < ${varName}_size; i++) cin >> ${varName}_vals[i];`);
    lines.push(`    TreeNode* ${varName} = buildTree(${varName}_vals);`);
    return lines;
  }

  lines.push(`    ${bt} ${varName};`);
  lines.push(`    cin >> ${varName};`);
  return lines;
}

function generateOutputCode(type, varName) {
  const bt = baseType(type);
  const lines = [];

  if (bt === 'void') return lines;

  if (['int', 'long long', 'long', 'double', 'float', 'char', 'bool', 'short', 'unsigned int', 'string'].includes(bt)) {
    lines.push(`    cout << ${varName} << endl;`);
    return lines;
  }

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

  const vMatch = bt.match(/^vector\s*<\s*(.+?)\s*>$/);
  if (vMatch) {
    lines.push(`    for(int i = 0; i < (int)${varName}.size(); i++) {`);
    lines.push(`        if(i) cout << " ";`);
    lines.push(`        cout << ${varName}[i];`);
    lines.push(`    }`);
    lines.push(`    cout << endl;`);
    return lines;
  }

  if (bt === 'ListNode*' || bt === 'ListNode *') {
    lines.push(`    printLinkedList(${varName});`);
    return lines;
  }

  if (bt === 'TreeNode*' || bt === 'TreeNode *') {
    lines.push(`    printTree(${varName});`);
    return lines;
  }

  lines.push(`    cout << ${varName} << endl;`);
  return lines;
}

function generate(template) {
  const parsed = parseTemplate(template);

  if (parsed.methods.length === 0) {
    throw new Error('No methods found in the Solution class. Please check the template format.');
  }

  const method = parsed.methods[0];
  const parts = [];

  parts.push('#include<bits/stdc++.h>');
  parts.push('using namespace std;');
  parts.push('');

  if (parsed.prefix) {
    const uncommented = uncommentDefinitions(parsed.prefix);
    if (uncommented) {
      parts.push(uncommented);
      parts.push('');
    }
  }

  parts.push(parsed.originalTemplate);
  parts.push('');

  if (needsLinkedListHelpers(parsed.methods)) {
    parts.push(LINKED_LIST_HELPERS.trim());
    parts.push('');
  }

  if (needsTreeHelpers(parsed.methods)) {
    parts.push(TREE_HELPERS.trim());
    parts.push('');
  }

  parts.push('int main(){');

  for (const param of method.params) {
    const inputLines = generateInputCode(param.type, param.name);
    parts.push(...inputLines);
  }

  parts.push('');
  parts.push('    Solution sol;');
  const paramNames = method.params.map(p => p.name).join(', ');

  if (baseType(method.returnType) === 'void') {
    parts.push(`    sol.${method.name}(${paramNames});`);
  } else {
    const rt = baseType(method.returnType);
    parts.push(`    ${rt} ans = sol.${method.name}(${paramNames});`);
  }

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

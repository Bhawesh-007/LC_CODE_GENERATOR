/**
 * Tests for the LC Template Generator.
 * Run with: npm test
 */

const { parseTemplate } = require('../src/parser');
const { generate } = require('../src/generator');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) { console.log(`  ✅ ${testName}`); passed++; }
  else { console.log(`  ❌ ${testName}`); failed++; }
}

function assertIncludes(str, sub, testName) {
  assert(str.includes(sub), testName);
}

// ===================== Parser Tests =====================
console.log('\n📋 Parser Tests\n');

// Simple method
{
  const r = parseTemplate(`class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};`);
  assert(r.methods.length === 1, 'isPalindrome: found 1 method');
  assert(r.methods[0].name === 'isPalindrome', 'isPalindrome: correct name');
  assert(r.methods[0].returnType === 'bool', 'isPalindrome: returns bool');
  assert(r.methods[0].params[0].type === 'int', 'isPalindrome: param type int');
  assert(r.methods[0].params[0].name === 'x', 'isPalindrome: param name x');
}

// Two params + vector
{
  const r = parseTemplate(`class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`);
  assert(r.methods[0].returnType === 'vector<int>', 'twoSum: returns vector<int>');
  assert(r.methods[0].params.length === 2, 'twoSum: 2 params');
  assert(r.methods[0].params[0].type === 'vector<int>&', 'twoSum: param0 type');
  assert(r.methods[0].params[1].type === 'int', 'twoSum: param1 type');
}

// ListNode with prefix
{
  const r = parseTemplate(`// Definition for singly-linked list.\n// class ListNode {\n//     int val;\n//     ListNode *next;\n// };\nclass Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        \n    }\n};`);
  assert(r.prefix.length > 0, 'addTwoNumbers: has prefix');
  assert(r.methods[0].returnType === 'ListNode*', 'addTwoNumbers: returns ListNode*');
  assert(r.methods[0].params.length === 2, 'addTwoNumbers: 2 params');
}

// void return
{
  const r = parseTemplate(`class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        \n    }\n};`);
  assert(r.methods[0].returnType === 'void', 'rotate: returns void');
}

// vector<vector<int>>
{
  const r = parseTemplate(`class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        \n    }\n};`);
  assert(r.methods[0].returnType === 'vector<vector<int>>', 'threeSum: returns 2D vector');
}

// ===================== Generator Tests =====================
console.log('\n🔧 Generator Tests\n');

// G1: isPalindrome — your exact example
{
  const code = generate(`class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};`);
  assertIncludes(code, '#include<bits/stdc++.h>', 'G1: has include');
  assertIncludes(code, 'using namespace std;', 'G1: has using namespace');
  assertIncludes(code, 'class Solution', 'G1: has Solution class');
  assertIncludes(code, 'int main(){', 'G1: has main');
  assertIncludes(code, 'int x;', 'G1: declares x');
  assertIncludes(code, 'cin >> x;', 'G1: reads x');
  assertIncludes(code, 'Solution sol;', 'G1: creates Solution');
  assertIncludes(code, 'bool ans = sol.isPalindrome(x);', 'G1: calls method');
  assertIncludes(code, 'cout << ans << endl;', 'G1: prints result');
  assert(!code.includes('buildLinkedList'), 'G1: no LL helper');
  assert(!code.includes('buildTree'), 'G1: no tree helper');
}

// G2: twoSum — vector I/O
{
  const code = generate(`class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`);
  assertIncludes(code, 'int nums_size;', 'G2: vector size var');
  assertIncludes(code, 'vector<int> nums(nums_size);', 'G2: declares vector');
  assertIncludes(code, 'int target;', 'G2: declares target');
  assertIncludes(code, 'vector<int> ans = sol.twoSum(nums, target);', 'G2: correct call');
}

// G3: void — no cout
{
  const code = generate(`class Solution {\npublic:\n    void rotate(vector<int>& nums, int k) {\n        \n    }\n};`);
  assertIncludes(code, 'sol.rotate(nums, k);', 'G3: void call');
  assert(!code.includes('ans'), 'G3: no ans for void');
}

// G4: LinkedList — helpers injected
{
  const code = generate(`// Definition for singly-linked list.\n// class ListNode {\n//     int val;\n//     ListNode *next;\n//     ListNode() : val(0), next(nullptr) {}\n//     ListNode(int x) : val(x), next(nullptr) {}\n// };\nclass Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        \n    }\n};`);
  assertIncludes(code, 'buildLinkedList', 'G4: has LL builder');
  assertIncludes(code, 'printLinkedList', 'G4: has LL printer');
  assertIncludes(code, 'ListNode* l1 = buildLinkedList(l1_size);', 'G4: builds l1');
  assertIncludes(code, 'printLinkedList(ans);', 'G4: prints result');
}

// G5: TreeNode — helpers injected
{
  const code = generate(`// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n// };\nclass Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        \n    }\n};`);
  assertIncludes(code, 'buildTree', 'G5: has tree builder');
  assertIncludes(code, 'printTree', 'G5: has tree printer');
}

// G6: string param
{
  const code = generate(`class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};`);
  assertIncludes(code, 'string s;', 'G6: declares string');
  assertIncludes(code, 'cin >> s;', 'G6: reads string');
  assertIncludes(code, 'int ans = sol.lengthOfLongestSubstring(s);', 'G6: correct call');
}

// ===================== Sample Output =====================
console.log('\n📄 Sample — isPalindrome\n');
console.log(generate(`class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};`));

// ===================== Summary =====================
console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${'='.repeat(50)}\n`);
process.exit(failed > 0 ? 1 : 0);

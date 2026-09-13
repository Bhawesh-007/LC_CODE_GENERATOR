/**
 * Tests for the Testcase Formatter.
 */

const { formatParamValue, formatTestCase, formatAllTestCases } = require('../chrome-extension/lib/testcase_formatter');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) { console.log(`  ✅ ${testName}`); passed++; }
  else { console.log(`  ❌ ${testName}`); failed++; }
}

function assertEqual(actual, expected, testName) {
  assert(actual === expected, `${testName} (expected: "${expected}", got: "${actual}")`);
}

console.log('\n📋 Testcase Formatter Tests\n');

// 1. Primitive Numbers
{
  assertEqual(formatParamValue('121', 'integer'), '121', 'Integer format');
  assertEqual(formatParamValue('-42', 'int'), '-42', 'Negative int format');
  assertEqual(formatParamValue('3.14', 'double'), '3.14', 'Double format');
}

// 2. Booleans
{
  assertEqual(formatParamValue('true', 'boolean'), '1', 'Bool true -> 1');
  assertEqual(formatParamValue('false', 'bool'), '0', 'Bool false -> 0');
}

// 3. Strings
{
  assertEqual(formatParamValue('"hello world"', 'string'), 'hello world', 'Unquote JSON string');
  assertEqual(formatParamValue('"()[]{}"', 'string'), '()[]{}', 'Parentheses string');
}

// 4. 1D Arrays
{
  assertEqual(formatParamValue('[2,7,11,15]', 'integer[]'), '4 2 7 11 15', '1D array with length prefix');
  assertEqual(formatParamValue('[]', 'vector<int>'), '0', 'Empty array -> 0');
}

// 5. ListNode
{
  assertEqual(formatParamValue('[2,4,3]', 'ListNode'), '3 2 4 3', 'ListNode format');
}

// 6. TreeNode
{
  assertEqual(formatParamValue('[1,null,2,3]', 'TreeNode'), '4 1 -1 2 3', 'TreeNode null mapped to -1');
}

// 7. 2D Array / Matrix
{
  const rawGrid = '[["1","1","0"],["0","1","0"]]';
  const expected = '2 3\n1 1 0\n0 1 0';
  assertEqual(formatParamValue(rawGrid, 'character[][]'), expected, '2D grid rows & cols');
}

// 8. Multi-param testcase (Two Sum)
{
  const rawTestcase = '[2,7,11,15]\n9';
  const params = [
    { name: 'nums', type: 'integer[]' },
    { name: 'target', type: 'integer' }
  ];
  const expected = '4 2 7 11 15\n9';
  assertEqual(formatTestCase(rawTestcase, params), expected, 'Two Sum multi-param format');
}

// 9. Full questionData format
{
  const questionData = {
    metaData: JSON.stringify({
      name: 'twoSum',
      params: [
        { name: 'nums', type: 'integer[]' },
        { name: 'target', type: 'integer' }
      ]
    }),
    exampleTestcaseList: [
      '[2,7,11,15]\n9',
      '[3,2,4]\n6',
      '[3,3]\n6'
    ]
  };

  const results = formatAllTestCases(questionData);
  assert(results.length === 3, 'formatAllTestCases length 3');
  assertEqual(results[0].formatted, '4 2 7 11 15\n9', 'Testcase 1 formatted');
  assertEqual(results[1].formatted, '3 3 2 4\n6', 'Testcase 2 formatted');
  assertEqual(results[2].formatted, '2 3 3\n6', 'Testcase 3 formatted');
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Testcase Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log(`${'='.repeat(50)}\n`);

if (failed > 0) process.exit(1);

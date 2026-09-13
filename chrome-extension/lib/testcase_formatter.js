/**
 * Testcase Formatter module — converts LeetCode test cases and metadata into
 * standard input (cin-ready) format matching the generated C++ main() function.
 *
 * Browser and Node.js compatible.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TestcaseFormatter = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Normalize and format a single parameter value based on its type.
   * @param {string} rawVal - The raw string value from LeetCode testcase
   * @param {string} typeStr - Type from metaData (e.g. "integer[]", "TreeNode", "ListNode", "string")
   *                           or from C++ signature (e.g. "vector<int>", "TreeNode*", "string")
   * @returns {string} Formatted stdin string
   */
  function formatParamValue(rawVal, typeStr) {
    if (rawVal === undefined || rawVal === null) return '';
    rawVal = String(rawVal).trim();
    if (!rawVal) return '';

    const type = (typeStr || '').toLowerCase();

    // 1. 2D Arrays / Matrices
    if (type.includes('[][]') || type.includes('vector<vector<')) {
      try {
        const arr = JSON.parse(rawVal);
        if (Array.isArray(arr)) {
          const rows = arr.length;
          const cols = rows > 0 && Array.isArray(arr[0]) ? arr[0].length : 0;
          const lines = [`${rows} ${cols}`];
          for (let r = 0; r < rows; r++) {
            if (Array.isArray(arr[r])) {
              lines.push(arr[r].map(elem => typeof elem === 'string' ? elem : JSON.stringify(elem)).join(' '));
            }
          }
          return lines.join('\n');
        }
      } catch (e) {
        // fallback if JSON parse fails
      }
    }

    // 2. 1D Arrays & Lists (vector<T>, ListNode, integer[], character[], etc.)
    if (type.includes('[]') || type.includes('vector<') || type.includes('listnode')) {
      try {
        const arr = JSON.parse(rawVal);
        if (Array.isArray(arr)) {
          const size = arr.length;
          const elements = arr.map(elem => typeof elem === 'string' ? elem : JSON.stringify(elem)).join(' ');
          return size > 0 ? `${size} ${elements}` : '0';
        }
      } catch (e) {
        // fallback
      }
    }

    // 3. Binary Trees (TreeNode)
    if (type.includes('treenode')) {
      try {
        const arr = JSON.parse(rawVal);
        if (Array.isArray(arr)) {
          const size = arr.length;
          // In generator.js helper: buildTree uses -1 for null
          const elements = arr.map(x => (x === null || x === 'null') ? -1 : x).join(' ');
          return size > 0 ? `${size} ${elements}` : '0';
        }
      } catch (e) {
        // fallback
      }
    }

    // 4. Boolean
    if (type.includes('bool')) {
      if (rawVal.toLowerCase() === 'true' || rawVal === '1') return '1';
      if (rawVal.toLowerCase() === 'false' || rawVal === '0') return '0';
      return rawVal;
    }

    // 5. String
    if (type.includes('string')) {
      try {
        // If string is JSON encoded with quotes e.g. "\"hello\""
        if (rawVal.startsWith('"') && rawVal.endsWith('"')) {
          return JSON.parse(rawVal);
        }
      } catch (e) {
        return rawVal.replace(/^"|"$/g, '');
      }
      return rawVal;
    }

    // 6. Generic JSON array fallback (if type was unknown but value is a JSON array)
    if (rawVal.startsWith('[')) {
      try {
        const parsed = JSON.parse(rawVal);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && Array.isArray(parsed[0])) {
            // 2D Array
            const rows = parsed.length;
            const cols = parsed[0].length;
            const lines = [`${rows} ${cols}`];
            for (let r = 0; r < rows; r++) {
              lines.push(parsed[r].join(' '));
            }
            return lines.join('\n');
          } else {
            // 1D Array
            return `${parsed.length} ${parsed.join(' ')}`;
          }
        }
      } catch (e) {
        // fallback
      }
    }

    // 7. Primitives (int, float, double, char, etc.)
    return rawVal;
  }

  /**
   * Format a full testcase containing multiple parameters.
   * @param {string} testcaseStr - LeetCode testcase string (lines separated by \n or \r\n)
   * @param {Array<{name: string, type: string}>} params - List of parameters from metaData or parser
   * @returns {string} Formatted stdin string for the entire testcase
   */
  function formatTestCase(testcaseStr, params) {
    if (!testcaseStr) return '';
    const rawLines = testcaseStr.split(/\r?\n/).filter(line => line.trim().length > 0);
    const formattedLines = [];

    params = params || [];

    for (let i = 0; i < rawLines.length; i++) {
      const rawVal = rawLines[i];
      const paramType = params[i] ? params[i].type : '';
      const formatted = formatParamValue(rawVal, paramType);
      if (formatted !== '') {
        formattedLines.push(formatted);
      }
    }

    return formattedLines.join('\n');
  }

  /**
   * Parse and format all testcases from LeetCode question data.
   * @param {Object} questionData - { metaData: string|object, exampleTestcaseList: string[], sampleTestCase: string }
   * @param {Array<{name: string, type: string}>} [fallbackParams] - Params parsed from C++ template if metaData is missing
   * @returns {Array<{ index: number, raw: string, formatted: string }>}
   */
  function formatAllTestCases(questionData, fallbackParams) {
    if (!questionData) return [];

    let params = fallbackParams || [];

    if (questionData.metaData) {
      try {
        const meta = typeof questionData.metaData === 'string'
          ? JSON.parse(questionData.metaData)
          : questionData.metaData;
        if (meta && Array.isArray(meta.params)) {
          params = meta.params;
        }
      } catch (e) {
        // Keep fallbackParams
      }
    }

    let testcaseList = [];
    if (Array.isArray(questionData.exampleTestcaseList) && questionData.exampleTestcaseList.length > 0) {
      testcaseList = questionData.exampleTestcaseList;
    } else if (questionData.sampleTestCase) {
      testcaseList = [questionData.sampleTestCase];
    }

    return testcaseList.map((rawCase, idx) => {
      return {
        index: idx + 1,
        raw: rawCase,
        formatted: formatTestCase(rawCase, params),
      };
    });
  }

  return {
    formatParamValue,
    formatTestCase,
    formatAllTestCases,
  };
});

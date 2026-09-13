/**
 * Popup script — handles button clicks, communicates with content script,
 * calls generator & testcase formatter directly (no server needed),
 * and displays generated code and formatted test cases with one-click copy buttons.
 */

// Firefox uses browser.*, Chrome uses chrome.*
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// DOM elements
const generateBtn = document.getElementById('generateBtn');
const pasteBtn = document.getElementById('pasteBtn');
const pasteSection = document.getElementById('pasteSection');
const pasteArea = document.getElementById('pasteArea');
const generatePasteBtn = document.getElementById('generatePasteBtn');

const tabBar = document.getElementById('tabBar');
const tabCodeBtn = document.getElementById('tabCodeBtn');
const tabTestsBtn = document.getElementById('tabTestsBtn');
const testCaseCountEl = document.getElementById('testCaseCount');

const codeContainer = document.getElementById('codeContainer');
const codeOutput = document.getElementById('codeOutput');
const copyBtn = document.getElementById('copyBtn');

const testcasesContainer = document.getElementById('testcasesContainer');
const testcaseList = document.getElementById('testcaseList');
const copyAllTestsBtn = document.getElementById('copyAllTestsBtn');

const statusEl = document.getElementById('status');

let currentTestcases = [];

// ---- Status helpers ----
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = 'status ' + type;
}

function hideStatus() {
  statusEl.className = 'status';
}

// ---- Tab switching ----
function switchTab(tab) {
  if (tab === 'code') {
    tabCodeBtn.classList.add('active');
    tabTestsBtn.classList.remove('active');
    codeContainer.classList.add('visible');
    testcasesContainer.classList.remove('visible');
  } else {
    tabTestsBtn.classList.add('active');
    tabCodeBtn.classList.remove('active');
    codeContainer.classList.remove('visible');
    testcasesContainer.classList.add('visible');
  }
}

tabCodeBtn.addEventListener('click', () => switchTab('code'));
tabTestsBtn.addEventListener('click', () => switchTab('tests'));

// ---- Show generated code & testcases ----
function displayResults(code, testcases) {
  codeOutput.textContent = code;
  currentTestcases = testcases || [];
  testCaseCountEl.textContent = currentTestcases.length;

  renderTestCases(currentTestcases);

  tabBar.classList.add('visible');
  switchTab('code');
  hideStatus();
}

// ---- Render test case cards ----
function renderTestCases(testcases) {
  testcaseList.innerHTML = '';

  if (!testcases || testcases.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.color = '#888';
    emptyMsg.style.fontSize = '12px';
    emptyMsg.style.padding = '12px 0';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.textContent = 'No test cases found for this problem.';
    testcaseList.appendChild(emptyMsg);
    copyAllTestsBtn.style.display = 'none';
    return;
  }

  copyAllTestsBtn.style.display = 'block';

  testcases.forEach((tc) => {
    const card = document.createElement('div');
    card.className = 'testcase-card';

    const header = document.createElement('div');
    header.className = 'testcase-card-header';

    const title = document.createElement('span');
    title.className = 'testcase-title';
    title.textContent = `Test Case ${tc.index}`;

    const copyCaseBtn = document.createElement('button');
    copyCaseBtn.className = 'copy-btn';
    copyCaseBtn.textContent = '📋 Copy';
    copyCaseBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(tc.formatted).then(() => {
        copyCaseBtn.textContent = '✅ Copied!';
        copyCaseBtn.classList.add('copied');
        setTimeout(() => {
          copyCaseBtn.textContent = '📋 Copy';
          copyCaseBtn.classList.remove('copied');
        }, 2000);
      });
    });

    header.appendChild(title);
    header.appendChild(copyCaseBtn);

    const codeDiv = document.createElement('div');
    codeDiv.className = 'testcase-code';
    codeDiv.textContent = tc.formatted;

    card.appendChild(header);
    card.appendChild(codeDiv);
    testcaseList.appendChild(card);
  });
}

// ---- Generate from LC page (auto-extract) ----
generateBtn.addEventListener('click', async () => {
  generateBtn.disabled = true;
  showStatus('⏳ Extracting template & test cases from page...', 'loading');

  try {
    const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes('leetcode.com/problems/')) {
      showStatus('⚠️ Not on a LeetCode problem page. Use "Paste Code" instead.', 'error');
      generateBtn.disabled = false;
      return;
    }

    // Send message to content script to extract template and questionData
    const response = await browserAPI.tabs.sendMessage(tab.id, { action: 'getProblemData' });

    if (!response || !response.success) {
      showStatus('❌ ' + (response?.error || 'Could not extract template. Try "Paste Code".'), 'error');
      generateBtn.disabled = false;
      return;
    }

    const code = generate(response.template);

    // Parse fallback params from template if needed
    let fallbackParams = [];
    try {
      const parsed = parseTemplate(response.template);
      if (parsed.methods.length > 0) {
        fallbackParams = parsed.methods[0].params;
      }
    } catch (e) {
      // Ignore parse error
    }

    // Format test cases
    const testcases = TestcaseFormatter.formatAllTestCases(response.questionData, fallbackParams);

    displayResults(code, testcases);
    showStatus('✅ Generated template and test cases successfully!', 'success');
  } catch (err) {
    if (err.message.includes('Could not establish connection') || err.message.includes('Receiving end does not exist')) {
      showStatus('❌ Content script not loaded. Refresh the LeetCode page and try again.', 'error');
    } else {
      showStatus('❌ ' + err.message, 'error');
    }
  }

  generateBtn.disabled = false;
});

// ---- Toggle paste section ----
pasteBtn.addEventListener('click', () => {
  pasteSection.classList.toggle('visible');
  if (pasteSection.classList.contains('visible')) {
    pasteArea.focus();
  }
});

// ---- Generate from pasted code ----
generatePasteBtn.addEventListener('click', () => {
  const template = pasteArea.value.trim();

  if (!template) {
    showStatus('⚠️ Paste your LeetCode C++ template first.', 'error');
    return;
  }

  try {
    const code = generate(template);
    displayResults(code, []);
    showStatus('✅ Generated successfully!', 'success');
  } catch (err) {
    showStatus('❌ ' + err.message, 'error');
  }
});

// ---- Copy C++ Code button ----
copyBtn.addEventListener('click', () => {
  const code = codeOutput.textContent;
  navigator.clipboard.writeText(code).then(() => {
    copyBtn.textContent = '✅ Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy';
      copyBtn.classList.remove('copied');
    }, 2000);
  });
});

// ---- Copy All Test Cases button ----
copyAllTestsBtn.addEventListener('click', () => {
  if (currentTestcases.length === 0) return;
  const allFormatted = currentTestcases.map(tc => tc.formatted).join('\n---\n');
  navigator.clipboard.writeText(allFormatted).then(() => {
    copyAllTestsBtn.textContent = '✅ Copied All!';
    copyAllTestsBtn.classList.add('copied');
    setTimeout(() => {
      copyAllTestsBtn.textContent = '📋 Copy All Cases';
      copyAllTestsBtn.classList.remove('copied');
    }, 2000);
  });
});

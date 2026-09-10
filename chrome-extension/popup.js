/**
 * Popup script — handles button clicks, communicates with content script,
 * calls generate() directly (no server needed), and displays the generated code.
 */

// Firefox uses browser.*, Chrome uses chrome.*
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// DOM elements
const generateBtn = document.getElementById('generateBtn');
const pasteBtn = document.getElementById('pasteBtn');
const pasteSection = document.getElementById('pasteSection');
const pasteArea = document.getElementById('pasteArea');
const generatePasteBtn = document.getElementById('generatePasteBtn');
const codeContainer = document.getElementById('codeContainer');
const codeOutput = document.getElementById('codeOutput');
const copyBtn = document.getElementById('copyBtn');
const statusEl = document.getElementById('status');

// ---- Status helpers ----
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = 'status ' + type;
}

function hideStatus() {
  statusEl.className = 'status';
}

// ---- Generate code locally (no server!) ----
function generateCode(template) {
  return generate(template); // calls generate() from lib/generator.js
}

// ---- Show generated code ----
function showCode(code) {
  codeOutput.textContent = code;
  codeContainer.classList.add('visible');
  hideStatus();
}

// ---- Generate from LC page (auto-extract) ----
generateBtn.addEventListener('click', async () => {
  generateBtn.disabled = true;
  showStatus('⏳ Extracting template from editor...', 'loading');

  try {
    // Get the active tab
    const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes('leetcode.com/problems/')) {
      showStatus('⚠️ Not on a LeetCode problem page. Use "Paste Code" instead.', 'error');
      generateBtn.disabled = false;
      return;
    }

    // Send message to content script to extract template
    const response = await browserAPI.tabs.sendMessage(tab.id, { action: 'getTemplate' });

    if (!response || !response.success) {
      showStatus('❌ ' + (response?.error || 'Could not extract template. Try "Paste Code".'), 'error');
      generateBtn.disabled = false;
      return;
    }

    const code = generateCode(response.template);
    showCode(code);
    showStatus('✅ Generated successfully!', 'success');
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
    const code = generateCode(template);
    showCode(code);
    showStatus('✅ Generated successfully!', 'success');
  } catch (err) {
    showStatus('❌ ' + err.message, 'error');
  }
});

// ---- Copy button ----
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

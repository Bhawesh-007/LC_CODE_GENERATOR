/**
 * Popup script — handles button clicks, communicates with content script,
 * calls the backend API, and displays the generated code.
 */

// Firefox uses browser.*, Chrome uses chrome.* — normalize to one
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const API_URL = 'http://localhost:3000';

// DOM elements
const generateBtn = document.getElementById('generateBtn');
const pasteBtn = document.getElementById('pasteBtn');
const pasteSection = document.getElementById('pasteSection');
const pasteArea = document.getElementById('pasteArea');
const generatePasteBtn = document.getElementById('generatePasteBtn');
const codeContainer = document.getElementById('codeContainer');
const codeOutput = document.getElementById('codeOutput');
const copyBtn = document.getElementById('copyBtn');
const status = document.getElementById('status');

// ---- Status helpers ----
function showStatus(message, type) {
  status.textContent = message;
  status.className = 'status ' + type;
}

function hideStatus() {
  status.className = 'status';
}

// ---- Call backend API ----
async function callGenerateAPI(template) {
  const response = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API error');
  }

  return data.code;
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

    showStatus('⏳ Generating runnable template...', 'loading');

    const code = await callGenerateAPI(response.template);
    showCode(code);
    showStatus('✅ Generated successfully!', 'success');
  } catch (err) {
    if (err.message.includes('Could not establish connection') || err.message.includes('Receiving end does not exist')) {
      showStatus('❌ Content script not loaded. Refresh the LeetCode page and try again.', 'error');
    } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      showStatus('❌ Cannot reach server. Make sure it\'s running: npm run dev', 'error');
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
generatePasteBtn.addEventListener('click', async () => {
  const template = pasteArea.value.trim();

  if (!template) {
    showStatus('⚠️ Paste your LeetCode C++ template first.', 'error');
    return;
  }

  generatePasteBtn.disabled = true;
  showStatus('⏳ Generating runnable template...', 'loading');

  try {
    const code = await callGenerateAPI(template);
    showCode(code);
    showStatus('✅ Generated successfully!', 'success');
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      showStatus('❌ Cannot reach server. Make sure it\'s running: npm run dev', 'error');
    } else {
      showStatus('❌ ' + err.message, 'error');
    }
  }

  generatePasteBtn.disabled = false;
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

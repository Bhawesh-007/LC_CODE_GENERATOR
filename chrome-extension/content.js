/**
 * Content script — injected into LeetCode problem pages.
 * Extracts the C++ code template from the Monaco editor.
 *
 * Communicates with popup.js via runtime.onMessage.
 */

// Firefox uses browser.*, Chrome uses chrome.*
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Listen for messages from the popup
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTemplate') {
    // We need to access window.monaco which lives in the page context,
    // not the content script context. So we inject a script into the page.
    extractTemplate()
      .then(template => sendResponse({ success: true, template }))
      .catch(err => sendResponse({ success: false, error: err.message }));

    // Return true to indicate async response
    return true;
  }
});

/**
 * Extract the code template from Monaco editor.
 * Since content scripts can't access page JS objects directly,
 * we inject a script element that reads monaco and passes data back via DOM events.
 */
function extractTemplate() {
  return new Promise((resolve, reject) => {
    // Create a unique event name to avoid collisions
    const eventName = 'lc-template-extract-' + Date.now();

    // Listen for the response from the injected script
    const handler = (e) => {
      document.removeEventListener(eventName, handler);
      const data = JSON.parse(e.detail);
      if (data.error) {
        reject(new Error(data.error));
      } else {
        resolve(data.template);
      }
    };
    document.addEventListener(eventName, handler);

    // Inject a script into the page context to access window.monaco
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        try {
          let template = '';

          // Method 1: Try Monaco editor
          if (window.monaco && window.monaco.editor) {
            const models = window.monaco.editor.getModels();
            if (models && models.length > 0) {
              template = models[0].getValue();
            }
          }

          // Method 2: Fallback — try to find code in the DOM
          if (!template) {
            const codeLines = document.querySelectorAll('.view-lines .view-line');
            if (codeLines.length > 0) {
              template = Array.from(codeLines).map(line => line.textContent).join('\\n');
            }
          }

          if (!template) {
            document.dispatchEvent(new CustomEvent('${eventName}', {
              detail: JSON.stringify({ error: 'Could not find code editor. Make sure you are on a LeetCode problem page with the code editor visible.' })
            }));
            return;
          }

          document.dispatchEvent(new CustomEvent('${eventName}', {
            detail: JSON.stringify({ template: template })
          }));
        } catch(err) {
          document.dispatchEvent(new CustomEvent('${eventName}', {
            detail: JSON.stringify({ error: err.message })
          }));
        }
      })();
    `;
    document.documentElement.appendChild(script);
    script.remove();

    // Timeout after 3 seconds
    setTimeout(() => {
      document.removeEventListener(eventName, handler);
      reject(new Error('Timed out trying to extract template'));
    }, 3000);
  });
}

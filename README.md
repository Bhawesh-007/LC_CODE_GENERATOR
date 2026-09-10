# ⚡ LC Template Generator

A  browser extension that converts LeetCode's rigid C++ templates into **complete, runnable C++ files** — so you can debug locally with custom inputs instead of fighting LeetCode's editor.

**No server needed. No setup. Just install and use.**

## 🎯 The Problem

LeetCode gives you this:

```cpp
class Solution {
public:
    bool isPalindrome(int x) {
        
    }
};
```

You can't run it locally. No `main()`, no input/output, no way to debug with your own test cases.

## ✅ The Solution

This extension converts it into:

```cpp
#include<bits/stdc++.h>
using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        
    }
};

int main(){
    int x;
    cin >> x;

    Solution sol;
    bool ans = sol.isPalindrome(x);

    cout << ans << endl;

    return 0;
}
```

Now you can compile with `g++`, run with your own inputs, add debug prints, and iterate fast.

## 🧠 How It Works

1. **You** open a LeetCode problem in Firefox
2. Click the ⚡ extension icon
3. Click **🚀 Generate Template**
4. Extension extracts the C++ template from the code editor
5. Parser + Generator runs **locally inside the extension** (no server, no internet needed)
6. Copy the generated code → paste into your local editor → compile & run

```
┌──────────────────────────────────────────────────┐
│               Firefox Extension                   │
│                                                  │
│  ┌───────────┐                                   │
│  │content.js │  Extracts C++ template from       │
│  │           │  LeetCode's Monaco editor         │
│  └─────┬─────┘                                   │
│        │                                         │
│        ▼                                         │
│  ┌───────────┐   ┌────────────┐   ┌──────────┐  │
│  │ parser.js │──▶│generator.js│──▶│ popup.js │  │
│  │           │   │            │   │          │  │
│  │ Extracts: │   │ Builds:    │   │ Shows    │  │
│  │ - method  │   │ - #include │   │ code +   │  │
│  │ - return  │   │ - main()   │   │ copy btn │  │
│  │   type    │   │ - cin/cout │   │          │  │
│  │ - params  │   │ - helpers  │   │          │  │
│  └───────────┘   └─────┬──────┘   └──────────┘  │
│                        │                         │
│                 ┌──────▼──────┐                   │
│                 │ helpers.js  │                   │
│                 │             │                   │
│                 │ LinkedList  │                   │
│                 │ Tree build/ │                   │
│                 │ print funcs │                   │
│                 └─────────────┘                   │
│                                                  │
│         Everything runs inside the browser.       │
│              No server. No internet.              │
└──────────────────────────────────────────────────┘
```

## 🚀 Installation

### Option 1: Firefox Manual Install
1. Open Firefox → go to `about:debugging`
2. Click **"This Firefox"**
3. Click **"Load Temporary Add-on..."**
4. Select `chrome-extension/manifest.json`
5. Done! The ⚡ icon appears in your toolbar.

### Option 2: Chrome / Chromium Manual Install
1. Rename or copy `manifest.chrome.json` to `manifest.json` (or use it when loading in Chrome)
2. Open Chrome → go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **"Load unpacked"**
5. Select the `chrome-extension/` directory
6. Done!

## 📖 Usage

### Auto-extract (on LeetCode)
1. Go to any LeetCode problem (e.g. [Two Sum](https://leetcode.com/problems/two-sum/))
2. Make sure **C++** is selected as the language
3. Click the ⚡ extension icon
4. Click **🚀 Generate Template**
5. Click **📋 Copy** → paste into your editor

### Manual paste (anywhere)
1. Click the ⚡ extension icon
2. Click **📋 Paste Code**
3. Paste any LeetCode C++ template into the textarea
4. Click **🚀 Generate from Paste**
5. Click **📋 Copy**

## 📋 Supported Types

| Type | Input (cin) | Output (cout) |
|------|-------------|---------------|
| `int`, `bool`, `char`, `long long`, `double` | `cin >> x;` | `cout << ans;` |
| `string` | `cin >> s;` | `cout << ans;` |
| `vector<int>` | Read size, then loop | Loop print |
| `vector<vector<int>>` | Read rows, cols, nested loop | Nested loop print |
| `ListNode*` | Read size + values → build list | Traverse & print |
| `TreeNode*` | Read level-order values → build tree | Level-order print |
| `void` | — | No output |

## 📁 Project Structure

```
chrome-extension/
├── manifest.json            # Firefox extension config (Manifest V2)
├── manifest.chrome.json     # Chrome extension config (Manifest V3)
├── content.js               # Injected into LC pages — extracts code from Monaco editor
├── popup.html               # Extension popup UI (dark theme)
├── popup.js                 # UI logic — calls generate() directly
├── lib/
│   ├── parser.js            # Parses LC template → { method, returnType, params }
│   ├── helpers.js           # C++ helper strings for LinkedList & Tree
│   └── generator.js         # Assembles complete runnable C++ file
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🧪 Running Tests (for developers)

The backend version includes a test suite:

```bash
cd extension
npm install
npm test    # 40 tests covering all type combinations
```

## 🛠️ Tech Stack

- **Extension**: Manifest V2 (Firefox), vanilla JavaScript
- **Parser**: Regex-based C++ template parsing — no external libraries
- **Zero dependencies** in the extension — everything runs in the browser

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/awesome`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome`)
5. Open a Pull Request

## 📄 License

MIT

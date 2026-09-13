# ⚡ LC Template Generator

A browser extension that converts LeetCode's rigid C++ templates into **complete, runnable C++ files** and extracts **formatted, copiable test cases** — so you can debug locally with custom inputs instead of fighting LeetCode's editor.

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

You can't run it locally. No `main()`, no input/output, and extracting test cases manually into the format expected by `cin` is tedious.

## ✅ The Solution

This extension converts the code into:

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

And simultaneously extracts all problem test cases into **standard input (`cin`) format**:
- **1D Arrays / ListNode**: `4 2 7 11 15` (size + elements)
- **2D Arrays / Grids**: `2 3\n1 1 0\n0 1 0` (rows, cols + rows)
- **Binary Trees**: `4 1 -1 2 3` (level-order size + values with `-1` for null)
- **Multi-argument**: Each parameter on its own line ready for stdin piping!

Now you can compile with `g++`, copy test cases with one click, run with your own inputs, add debug prints, and iterate fast.

## 🧠 How It Works

1. **You** open a LeetCode problem in Firefox / Chrome
2. Click the ⚡ extension icon
3. Click **🚀 Generate Template & Tests**
4. Extension extracts the C++ template and problem metadata from LeetCode
5. Parser + Generator + Testcase Formatter runs **locally inside the extension**
6. Copy the generated code and test cases with one click → paste & debug!

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
2. Make sure **C++** is selected as the language in LeetCode's editor
3. Click the ⚡ extension icon in your browser toolbar
4. Click **🚀 Generate Template & Tests**
5. **Copy C++ Code**: Click **📋 Copy** in the **💻 C++ Code** tab $\to$ paste into your local editor
6. **Copy Test Cases**: Switch to the **🧪 Test Cases** tab:
   - Click **📋 Copy** on any individual test case card to copy that specific case formatted for `cin`
   - Or click **📋 Copy All Cases** to copy all test cases at once

### Manual paste (anywhere)
1. Click the ⚡ extension icon
2. Click **📋 Paste Code**
3. Paste any LeetCode C++ template into the textarea
4. Click **🚀 Generate from Paste**
5. Click **📋 Copy** to grab your runnable code

## 📋 Supported Types & Test Case Formats

| Type | Input (cin) | Output (cout) | Example LC Input $\to$ Formatted `cin` |
|------|-------------|---------------|----------------------------------------|
| `int`, `bool`, `char`, `long long`, `double` | `cin >> x;` | `cout << ans;` | `121` $\to$ `121` / `true` $\to$ `1` |
| `string` | `cin >> s;` | `cout << ans;` | `"()[]{}"` $\to$ `()[]{}` |
| `vector<int>` | Read size, then loop | Loop print | `[2,7,11,15]` $\to$ `4 2 7 11 15` |
| `vector<vector<int>>` | Read rows, cols, nested loop | Nested loop print | `[[1,0],[0,1]]` $\to$ `2 2\n1 0\n0 1` |
| `ListNode*` | Read size + values → build list | Traverse & print | `[2,4,3]` $\to$ `3 2 4 3` |
| `TreeNode*` | Read level-order values → build tree | Level-order print | `[1,null,2]` $\to$ `3 1 -1 2` |
| `void` | — | No output | — |

## 📁 Project Structure

```
chrome-extension/
├── manifest.json            # Firefox extension config (Manifest V2)
├── manifest.chrome.json     # Chrome extension config (Manifest V3)
├── content.js               # Injected into LC pages — extracts code & metadata
├── popup.html               # Extension popup UI (tabbed dark theme)
├── popup.js                 # UI logic — calls generator & testcase formatter
├── lib/
│   ├── parser.js            # Parses LC template → { method, returnType, params }
│   ├── helpers.js           # C++ helper strings for LinkedList & Tree
│   ├── generator.js         # Assembles complete runnable C++ file
│   └── testcase_formatter.js # Formats test cases into cin-ready stdin format
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🧪 Running Tests (for developers)

The project includes an automated test suite covering all parser, generator, and test case formatting features:

```bash
cd extension
npm install
npm test    # 57 tests covering all type combinations & test case formats
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

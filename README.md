# ⚡ LC Template Generator

A browser extension + Node.js backend that converts LeetCode's rigid C++ templates into **complete, runnable C++ files** — so you can debug locally with custom inputs instead of fighting LeetCode's editor.

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

This tool converts it into:

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
2. **Extension** extracts the C++ template from the code editor
3. **Backend** parses the method signature (name, return type, params)
4. **Generator** builds a complete file with `#include`, `main()`, `cin`/`cout` — all auto-generated based on the types
5. **You** copy the code, paste into your local editor, and debug freely

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Firefox Extension                  │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐   │
│  │content.js│───▶│ popup.js │───▶│  popup.html  │   │
│  │          │    │          │    │  (Dark UI)   │   │
│  │Extracts  │    │Calls API │    │  Copy button │   │
│  │template  │    │Shows code│    │              │   │
│  └──────────┘    └────┬─────┘    └──────────────┘   │
│                       │                              │
└───────────────────────┼──────────────────────────────┘
                        │ POST /generate
                        ▼
┌─────────────────────────────────────────────────────┐
│                 Node.js Backend                      │
│                                                     │
│  ┌───────────┐   ┌─────────────┐   ┌────────────┐  │
│  │ server.js │──▶│  parser.js  │──▶│generator.js│  │
│  │           │   │             │   │            │  │
│  │ Express   │   │ Extracts:   │   │ Builds:    │  │
│  │ POST      │   │ - method    │   │ - #include │  │
│  │ /generate │   │ - return    │   │ - main()   │  │
│  │           │   │   type      │   │ - cin/cout │  │
│  │           │   │ - params    │   │ - helpers  │  │
│  └───────────┘   └─────────────┘   └─────┬──────┘  │
│                                          │         │
│                                   ┌──────▼──────┐  │
│                                   │  helpers.js │  │
│                                   │             │  │
│                                   │ LinkedList  │  │
│                                   │ Tree build/ │  │
│                                   │ print funcs │  │
│                                   └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
extension/
├── package.json
├── server.js                        # Express API server
├── src/
│   ├── parser.js                    # Parses LC template → method metadata
│   ├── generator.js                 # Metadata → complete runnable C++ file
│   └── helpers.js                   # C++ helper functions for LinkedList/Tree
├── tests/
│   └── generator.test.js            # 40 test cases
└── chrome-extension/
    ├── manifest.json                # Firefox/Chrome extension config
    ├── content.js                   # Extracts code from LC's Monaco editor
    ├── popup.html                   # Extension popup UI (dark theme)
    ├── popup.js                     # UI logic + API calls
    └── icons/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

## 🚀 Setup

### 1. Install & Start the Backend

```bash
git clone https://github.com/YOUR_USERNAME/lc-template-generator.git
cd lc-template-generator
npm install
npm run dev
```

Server starts at `http://localhost:3000`.

### 2. Load the Extension (Firefox)

1. Open Firefox → go to `about:debugging`
2. Click **"This Firefox"**
3. Click **"Load Temporary Add-on..."**
4. Select `chrome-extension/manifest.json`

### 3. Use It

1. Open any LeetCode problem
2. Click the ⚡ extension icon
3. Click **🚀 Generate Template**
4. Click **📋 Copy** → paste into your local editor → compile & run

## 🔌 API Usage (without extension)

You can also use the API directly:

```bash
curl -s -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"template": "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};"}'
```

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

## 🧪 Running Tests

```bash
npm test
```

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Extension**: Manifest V2 (Firefox compatible), vanilla JS
- **Parser**: Regex-based C++ template parsing (no AST library needed)

## 📄 License

MIT

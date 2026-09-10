/**
 * C++ helper function strings that get injected into generated files
 * when the problem uses data structures like ListNode or TreeNode.
 */

const LINKED_LIST_HELPERS = `
// --- Helper: Build linked list from input ---
ListNode* buildLinkedList(int n) {
    if (n == 0) return nullptr;
    ListNode* head = nullptr;
    ListNode* tail = nullptr;
    for (int i = 0; i < n; i++) {
        int val;
        cin >> val;
        ListNode* node = new ListNode(val);
        if (!head) {
            head = node;
            tail = node;
        } else {
            tail->next = node;
            tail = node;
        }
    }
    return head;
}

// --- Helper: Print linked list ---
void printLinkedList(ListNode* head) {
    while (head) {
        cout << head->val;
        if (head->next) cout << " -> ";
        head = head->next;
    }
    cout << endl;
}
`;

const TREE_HELPERS = `
// --- Helper: Build tree from level-order input (-1 = null) ---
TreeNode* buildTree(vector<int>& vals) {
    if (vals.empty() || vals[0] == -1) return nullptr;
    TreeNode* root = new TreeNode(vals[0]);
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < (int)vals.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (i < (int)vals.size() && vals[i] != -1) {
            curr->left = new TreeNode(vals[i]);
            q.push(curr->left);
        }
        i++;
        if (i < (int)vals.size() && vals[i] != -1) {
            curr->right = new TreeNode(vals[i]);
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

// --- Helper: Print tree in level-order ---
void printTree(TreeNode* root) {
    if (!root) { cout << "null" << endl; return; }
    queue<TreeNode*> q;
    q.push(root);
    bool first = true;
    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();
        if (!first) cout << " ";
        first = false;
        if (curr) {
            cout << curr->val;
            q.push(curr->left);
            q.push(curr->right);
        } else {
            cout << "null";
        }
    }
    cout << endl;
}
`;

/**
 * Check if any method uses ListNode in its params or return type.
 */
function needsLinkedListHelpers(methods) {
  return methods.some(m => {
    const allTypes = [m.returnType, ...m.params.map(p => p.type)];
    return allTypes.some(t => t.includes('ListNode'));
  });
}

/**
 * Check if any method uses TreeNode in its params or return type.
 */
function needsTreeHelpers(methods) {
  return methods.some(m => {
    const allTypes = [m.returnType, ...m.params.map(p => p.type)];
    return allTypes.some(t => t.includes('TreeNode'));
  });
}

/**
 * Uncomment data structure definitions from the prefix.
 * LC provides them as comments like:
 *   // class ListNode {
 *   //     int val;
 *   //     ...
 *   // };
 *
 * We uncomment them so the generated file can actually compile.
 */
function uncommentDefinitions(prefix) {
  if (!prefix) return '';

  const lines = prefix.split('\n');
  const result = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Keep "Definition for..." lines as comments
    if (trimmed.startsWith('// Definition') || trimmed.startsWith('/* Definition') || trimmed.startsWith('/**')) {
      result.push(line);
    } else if (trimmed.startsWith('// ') || trimmed.startsWith('//\t')) {
      // Uncomment: remove the leading "// "
      result.push(line.replace(/^(\s*)\/\/\s?/, '$1'));
    } else if (trimmed === '//') {
      result.push('');
    } else if (trimmed.startsWith('* ') || trimmed === '*/' || trimmed === '*') {
      const content = trimmed.replace(/^\*\s?/, '').replace(/^\*\//, '');
      if (content) result.push(content);
    } else {
      result.push(line);
    }
  }

  return result.join('\n').trim();
}

module.exports = {
  LINKED_LIST_HELPERS,
  TREE_HELPERS,
  needsLinkedListHelpers,
  needsTreeHelpers,
  uncommentDefinitions,
};

# 実装ガイド - Implementation Guide

## 1. 開発環境セットアップ

### 1.1 必要なツール

```
- Node.js 18.x 以上
- npm 9.x 以上
- Git
- Google Account (Workspace推奨)
- VS Code またはお好みのエディタ
```

### 1.2 Google Apps Script セットアップ

```bash
# clasp のインストール
npm install -g @google/clasp

# clasp ログイン
clasp login

# GAS プロジェクト作成
clasp create --title "FamilyAccountingSystem"

# プロジェクトのセットアップ
clasp clone <script-id>
```

---

## 2. ファイル構成

```
family-accounting-system/
├── docs/                          # ドキュメント
│   ├── 00_requirements.md
│   ├── 01_screen_design.md
│   ├── 02_database_design.md
│   ├── 03_api_design.md
│   └── ...
├── src/
│   ├── pwa/                       # フロントエンド (PWA)
│   │   ├── index.html
│   │   ├── css/
│   │   │   ├── style.css
│   │   │   └── responsive.css
│   │   ├── js/
│   │   │   ├── app.js             # メインアプリロジック
│   │   │   ├── api.js             # API通信
│   │   │   ├── store.js           # 状態管理
│   │   │   ├── screens/
│   │   │   │   ├── input.js
│   │   │   │   ├── history.js
│   │   │   │   ├── analytics.js
│   │   │   │   ├── asset.js
│   │   │   │   └── settings.js
│   │   │   ├── components/
│   │   │   │   ├── tabs.js
│   │   │   │   ├── form.js
│   │   │   │   ├── chart.js
│   │   │   │   └── ...
│   │   │   └── utils/
│   │   │       ├── date.js
│   │   │       ├── format.js
│   │   │       └── cache.js
│   │   └── manifest.json
│   │
│   └── gas/                       # バックエンド (Google Apps Script)
│       ├── main.gs                # エントリーポイント
│       ├── api.gs                 # API ハンドラー
│       ├── handlers/
│       │   ├── transactions.gs
│       │   ├── categories.gs
│       │   ├── tags.gs
│       │   ├── stores.gs
│       │   ├── recurring.gs
│       │   ├── accounts.gs
│       │   ├── analytics.gs
│       │   └── data.gs
│       ├── db/
│       │   ├── database.gs        # DB層抽象化
│       │   ├── sheet.gs           # Spreadsheet操作
│       │   └── query.gs           # クエリビルダー
│       ├── models/
│       │   ├── transaction.gs
│       │   ├── category.gs
│       │   └── ...
│       ├── utils/
│       │   ├── validation.gs
│       │   ├── logger.gs
│       │   ├── error.gs
│       │   └── date.gs
│       └── lib/
│           └── uuid.gs            # UUID 生成
│
├── .clasp.json
├── appsscript.json
├── package.json
├── .gitignore
└── README.md
```

---

## 3. ステップバイステップ実装ガイド

### 3.1 フェーズ 1: スプレッドシート初期化

**目標**: DB テーブル作成

1. **Google Spreadsheet を作成**
   ```
   ファイル名: FamilyAccountingSystem
   ```

2. **シート作成**
   ```
   - Transactions
   - Categories
   - Tags
   - Stores
   - RecurringRules
   - Accounts
   - AssetSnapshots
   - Settings
   - Logs
   ```

3. **ヘッダー行を挿入** (各シート)
   
   例 (Transactions):
   ```
   id | type | date | amount | category_id | subcategory_id | store_id | tags | memo | created_at | updated_at | deleted_at | created_by | updated_by
   ```

4. **初期データを挿入** (Categories など)
   
   ```
   id | name | parent_id | icon
   6ba7b810-9dad-11d1-80b4-00c04fd430c8 | 食費 | | 🍽️
   6ba7b811-9dad-11d1-80b4-00c04fd430c8 | スーパー | 6ba7b810-... | 
   ```

**スクリプト自動化** (tools/init-db.gs):
```javascript
function initializeDatabase() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const tables = ['Transactions', 'Categories', 'Tags', 'Stores', ...];
  
  tables.forEach(table => {
    if (!spreadsheet.getSheetByName(table)) {
      spreadsheet.insertSheet(table);
    }
  });
  
  Logger.log('Database initialized');
}
```

---

### 3.2 フェーズ 2: GAS API 実装

**目標**: バックエンド API の完成

#### 3.2.1 DB層実装 (db/database.gs)

```javascript
class Database {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  
  getTable(name) {
    const sheet = this.spreadsheet.getSheetByName(name);
    if (!sheet) throw new Error(`Sheet not found: ${name}`);
    return new Table(sheet);
  }
  
  createRecord(tableName, data) {
    // UUID生成、タイムスタンプ付与、Spreadsheet追記
    const table = this.getTable(tableName);
    return table.insert(data);
  }
  
  getRecords(tableName, query = {}) {
    // フィルター、ソート、ページネーション対応
    const table = this.getTable(tableName);
    return table.find(query);
  }
}
```

#### 3.2.2 エンドポイント実装 (handlers/transactions.gs)

```javascript
function handleTransactionsRequest(request, method) {
  const db = new Database();
  
  switch (method) {
    case 'POST':
      return createTransaction(request.payload, db);
    case 'GET':
      return getTransactions(request.parameters, db);
    case 'PUT':
      return updateTransaction(request.payload, db);
    case 'DELETE':
      return deleteTransaction(request.parameters, db);
    default:
      return error(405, 'METHOD_NOT_ALLOWED');
  }
}

function createTransaction(payload, db) {
  // バリデーション
  const validation = validateTransaction(payload);
  if (!validation.valid) {
    return error(400, 'VALIDATION_ERROR', validation.errors);
  }
  
  // DB操作
  try {
    const transaction = db.createRecord('Transactions', {
      id: generateUUID(),
      type: payload.type,
      date: payload.date,
      amount: payload.amount,
      category_id: payload.category_id,
      // ... その他フィールド
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      created_by: Session.getActiveUser().getEmail()
    });
    
    return success(201, transaction);
  } catch (e) {
    Logger.log(e);
    return error(500, 'INTERNAL_ERROR', { message: e.message });
  }
}
```

#### 3.2.3 エントリーポイント (main.gs)

```javascript
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const endpoint = payload.endpoint;
    const method = payload.method || 'POST';
    
    // ルーティング
    if (endpoint === '/transactions') {
      return handleTransactionsRequest(payload, method);
    } else if (endpoint === '/categories') {
      return handleCategoriesRequest(payload, method);
    }
    // ... その他エンドポイント
    
  } catch (e) {
    Logger.log(e);
    return error(500, 'INTERNAL_ERROR');
  }
}

function doGet(e) {
  const endpoint = e.parameter.endpoint;
  const method = 'GET';
  
  // ルーティング
  if (endpoint === '/transactions') {
    return handleTransactionsRequest(e, method);
  }
  // ...
}
```

---

### 3.3 フェーズ 3: PWA 実装

**目標**: フロントエンド完成

#### 3.3.1 基本構造 (src/pwa/index.html)

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#2196F3">
  <link rel="manifest" href="manifest.json">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/responsive.css">
  <title>家計簿</title>
</head>
<body>
  <div id="app">
    <div class="container">
      <div class="main-content" id="mainContent"></div>
      <nav class="bottom-nav">
        <a href="#" data-tab="input" class="nav-item active">➕</a>
        <a href="#" data-tab="history" class="nav-item">📋</a>
        <a href="#" data-tab="analytics" class="nav-item">📊</a>
        <a href="#" data-tab="asset" class="nav-item">🏦</a>
        <a href="#" data-tab="settings" class="nav-item">⚙️</a>
      </nav>
    </div>
  </div>
  
  <script src="js/utils/date.js"></script>
  <script src="js/utils/format.js"></script>
  <script src="js/api.js"></script>
  <script src="js/store.js"></script>
  <script src="js/screens/input.js"></script>
  <script src="js/screens/history.js"></script>
  <script src="js/screens/analytics.js"></script>
  <script src="js/screens/asset.js"></script>
  <script src="js/screens/settings.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

#### 3.3.2 API通信層 (js/api.js)

```javascript
class API {
  constructor(gasUrl) {
    this.gasUrl = gasUrl;
  }
  
  async request(endpoint, method = 'POST', payload = {}) {
    const requestData = {
      endpoint,
      method,
      ...payload
    };
    
    try {
      const response = await fetch(this.gasUrl, {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    } catch (e) {
      console.error(`API Error [${endpoint}]:`, e);
      throw e;
    }
  }
  
  // 便利メソッド
  async createTransaction(data) {
    return this.request('/transactions', 'POST', data);
  }
  
  async getTransactions(filters) {
    return this.request('/transactions', 'GET', { ...filters });
  }
  
  // ... その他メソッド
}
```

#### 3.3.3 状態管理 (js/store.js)

```javascript
class Store {
  constructor() {
    this.state = {
      transactions: [],
      categories: [],
      tags: [],
      stores: [],
      accounts: [],
      currentTab: 'input',
      currentDate: new Date().toISOString().split('T')[0],
      filter: {}
    };
    
    this.subscribers = [];
  }
  
  getState() {
    return this.state;
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
  }
  
  notify() {
    this.subscribers.forEach(cb => cb(this.state));
  }
}
```

#### 3.3.4 入力画面 (js/screens/input.js)

```javascript
class InputScreen {
  constructor(api, store) {
    this.api = api;
    this.store = store;
  }
  
  render() {
    return `
      <div class="screen input-screen">
        <h2>入力</h2>
        
        <form id="inputForm">
          <div class="form-group">
            <label>収支</label>
            <div class="segment-control">
              <button type="button" class="segment active" value="expense">支出</button>
              <button type="button" class="segment" value="income">収入</button>
            </div>
          </div>
          
          <div class="form-group">
            <label>日付</label>
            <input type="date" id="dateInput" value="${this.store.getState().currentDate}">
          </div>
          
          <div class="form-group">
            <label>金額</label>
            <input type="number" id="amountInput" placeholder="0" min="0">
            <div class="amount-display" id="amountDisplay">¥ 0</div>
          </div>
          
          <div class="form-group">
            <label>カテゴリ</label>
            <select id="categorySelect" required>
              <option value="">選択してください</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>店舗（オプション）</label>
            <input type="text" id="storeInput" placeholder="店舗名" list="stores">
          </div>
          
          <div class="form-group">
            <label>タグ（オプション）</label>
            <div id="tagInput"></div>
          </div>
          
          <div class="form-group">
            <label>メモ（オプション）</label>
            <textarea id="memoInput" placeholder="メモを入力..."></textarea>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">保存</button>
            <button type="reset" class="btn-secondary">破棄</button>
          </div>
        </form>
      </div>
    `;
  }
  
  async onSubmit(e) {
    e.preventDefault();
    
    const data = {
      type: document.querySelector('.segment.active').value,
      date: document.getElementById('dateInput').value,
      amount: parseInt(document.getElementById('amountInput').value),
      category_id: document.getElementById('categorySelect').value,
      // ... その他フィールド
    };
    
    try {
      await this.api.createTransaction(data);
      // フォームリセット、履歴更新など
    } catch (e) {
      alert('保存に失敗しました: ' + e.message);
    }
  }
}
```

---

### 3.4 フェーズ 4: 統合テスト

**目標**: 全機能動作確認

#### 3.4.1 テストチェックリスト

```
入力画面:
  ✓ 必須項目の入力
  ✓ バリデーション
  ✓ 保存
  ✓ 自動リセット

履歴画面:
  ✓ 一覧表示
  ✓ 検索フィルタ
  ✓ 編集
  ✓ 複製
  ✓ 削除

集計画面:
  ✓ 月別表示
  ✓ カテゴリ別表示
  ✓ グラフ表示

資産画面:
  ✓ 残高表示
  ✓ 推移表示

設定画面:
  ✓ カテゴリ管理
  ✓ タグ管理
  ✓ ルール管理
  ✓ データエクスポート
```

---

## 4. デプロイ

### 4.1 GAS デプロイ

```bash
# GAS コードをデプロイ
clasp push

# 新バージョンをデプロイ
clasp deploy -d "v1.0.0"
```

### 4.2 PWA デプロイ

```bash
# ビルド（ミニファイなど）
npm run build

# GitHub Pages または任意の静的ホストにデプロイ
npm run deploy
```

### 4.3 GAS ウェブアプリの公開設定

1. GAS エディタで「デプロイ」をクリック
2. 「新しいデプロイ」から「ウェブアプリ」を選択
3. 実行ユーザー: 自分のアカウント
4. アクセスできるユーザー: 誰でも
5. 「デプロイ」をクリック
6. ウェブアプリ URL を取得

---

## 5. 運用ガイド

### 5.1 定期メンテナンス

```
毎月末:
  ✓ 定期ルール実行
  ✓ 資産残高入力
  ✓ データバックアップ

毎週:
  ✓ ログ確認
  ✓ エラーチェック

毎日:
  ✓ 家計簿入力
```

### 5.2 トラブルシューティング

**API 通信エラー**:
```
1. ネットワーク接続確認
2. GAS URL 確認
3. ブラウザコンソール確認
4. GAS ログ確認 (View > Logs)
```

**データ不整合**:
```
1. Spreadsheet で手動確認
2. Logs テーブルで変更履歴確認
3. 必要に応じて データ修正
```

---

## 6. 参考資料

- [Google Apps Script リファレンス](https://developers.google.com/apps-script)
- [Web API MDN](https://developer.mozilla.org/en-US/docs/Web/API)
- [PWA チュートリアル](https://web.dev/progressive-web-apps/)

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-23

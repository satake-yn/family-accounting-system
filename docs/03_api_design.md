# API設計書 - Google Apps Script API Specification

## 1. API概要

### 1.1 実装プラットフォーム

- **Google Apps Script (GAS)**
- Google Spreadsheet と連携
- PWA (HTML/CSS/JavaScript) からのリクエストに対応
- RESTful な設計思想

### 1.2 認証方式

- Google Account (ユーザーの Google アカウント)
- OAuth 2.0 (GAS の doPost/doGet)
- CORS 対応

### 1.3 通信形式

- **リクエスト**: JSON
- **レスポンス**: JSON
- **エンコーディング**: UTF-8
- **タイムアウト**: 30秒

---

## 2. API エンドポイント一覧

### 2.1 Transactions (取引)

| # | メソッド | エンドポイント | 機能 | 認証 |
|----|---------|---------------|------|------|
| 1 | POST | /transactions | 取引作成 | ✓ |
| 2 | GET | /transactions | 取引一覧 | ✓ |
| 3 | GET | /transactions/:id | 取引詳細 | ✓ |
| 4 | PUT | /transactions/:id | 取引更新 | ✓ |
| 5 | DELETE | /transactions/:id | 取引削除 (論理) | ✓ |
| 6 | POST | /transactions/:id/duplicate | 取引複製 | ✓ |

### 2.2 Categories (カテゴリ)

| # | メソッド | エンドポイント | 機能 | 認証 |
|----|---------|---------------|------|------|
| 1 | POST | /categories | カテゴリ作成 | ✓ |
| 2 | GET | /categories | カテゴリ一覧 | ✓ |
| 3 | GET | /categories/:id | カテゴリ詳細 | ✓ |
| 4 | PUT | /categories/:id | カテゴリ更新 | ✓ |
| 5 | DELETE | /categories/:id | カテゴリ削除 (論理) | ✓ |
| 6 | GET | /categories/tree | 階層構造取得 | ✓ |

### 2.3 Tags (タグ)

| # | メソッド | エンドポイント | 機能 | 認証 |
|----|---------|---------------|------|------|
| 1 | POST | /tags | タグ作成 | ✓ |
| 2 | GET | /tags | タグ一覧 | ✓ |
| 3 | PUT | /tags/:id | タグ更新 | ✓ |
| 4 | DELETE | /tags/:id | タグ削除 (論理) | ✓ |

### 2.4 Stores (店舗)

| # | メソッド | エンドポイント | 機能 | 認証 |
|----|---------|---------------|------|------|
| 1 | POST | /stores | 店舗作成 | ✓ |
| 2 | GET | /stores | 店舗一覧 | ✓ |
| 3 | PUT | /stores/:id | 店舗更新 | ✓ |
| 4 | DELETE | /stores/:id | 店舗削除 (論理) | ✓ |
| 5 | GET | /stores/autocomplete | 店舗オートコンプリート | ✓ |

### 2.5 RecurringRules (定期ルール)

| # | メソッド | エンドポイント | 機能 | 認証 |
|----|---------|---------------|------|------|
| 1 | POST | /recurring-rules | ルール作成 | ✓ |
| 2 | GET | /recurring-rules | ルール一覧 | ✓ |
| 3 | PUT | /recurring-rules/:id | ルール更新 | ✓ |
| 4 | DELETE | /recurring-rules/:id | ルール削除 (論理) | ✓ |
| 5 | POST | /recurring-rules/:id/execute | ルール実行 | ✓ |

### 2.6 Accounts (資産口座)

| # | メソッド | エンドポイント | 機能 | 認証 |
|----|---------|---------------|------|------|
| 1 | POST | /accounts | 口座作成 | ✓ |
| 2 | GET | /accounts | 口座一覧 | ✓ |
| 3 | PUT | /accounts/:id | 口座更新 | ✓ |
| 4 | DELETE | /accounts/:id | 口座削除 (論理) | ✓ |

### 2.7 AssetSnapshots (資産スナップショット)

| # | メソッド | エンドポイント | 機能 | 認証 |
|----|---------|---------------|------|------|
| 1 | POST | /asset-snapshots | スナップショット作成 | ✓ |
| 2 | GET | /asset-snapshots | スナップショット一覧 | ✓ |
| 3 | GET | /asset-snapshots/:account_id | 口座別推移 | ✓ |
| 4 | PUT | /asset-snapshots/:id | スナップショット更新 | ✓ |
| 5 | DELETE | /asset-snapshots/:id | スナップショット削除 (論理) | ✓ |

### 2.8 Analytics (集計)

| # | メソッド | エンドポイント | 機能 | 認証 |
|----|---------|---------------|------|------|
| 1 | GET | /analytics/summary | 集計サマリー | ✓ |
| 2 | GET | /analytics/by-category | カテゴリ別集計 | ✓ |
| 3 | GET | /analytics/by-store | 店舗別集計 | ✓ |
| 4 | GET | /analytics/by-tag | タグ別集計 | ✓ |
| 5 | GET | /analytics/monthly | 月別推移 | ✓ |

### 2.9 DataManagement (データ管理)

| # | メソッド | エンドポイント | 機能 | 認証 |
|----|---------|---------------|------|------|
| 1 | POST | /data/export | エクスポート | ✓ |
| 2 | POST | /data/import | インポート | ✓ |
| 3 | POST | /data/backup | バックアップ作成 | ✓ |
| 4 | GET | /data/logs | ログ一覧 | ✓ |

---

## 3. リクエスト/レスポンス仕様

### 3.1 共通ヘッダー

```
Content-Type: application/json
Authorization: Bearer {token}  # GAS doPost の場合は不要
```

### 3.2 共通レスポンス形式

**成功 (200, 201)**:
```json
{
  "success": true,
  "data": { /* レスポンスデータ */ },
  "meta": {
    "timestamp": "2026-07-23T10:30:45Z",
    "version": "1.0.0"
  }
}
```

**エラー (400, 401, 403, 404, 500)**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "金額は正整数である必要があります",
    "details": { }
  },
  "meta": {
    "timestamp": "2026-07-23T10:30:45Z",
    "request_id": "req_xxx"
  }
}
```

---

## 4. 詳細API仕様

### 4.1 POST /transactions (取引作成)

**リクエスト**:
```json
{
  "type": "expense",
  "date": "2026-07-23",
  "amount": 12500,
  "category_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "subcategory_id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
  "store_id": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
  "tags": ["550e8400-e29b-41d4-a716-446655440001"],
  "memo": "日用品含む"
}
```

**バリデーション**:
```
type: 必須, 'income' | 'expense'
date: 必須, ISO8601形式, 過去1年以内
amount: 必須, 1以上の整数
category_id: 必須, 有効なUUID
subcategory_id: 任意, 有効なUUID または null
store_id: 任意, 有効なUUID または null
tags: 任意, UUID配列 (最大10個)
memo: 任意, 文字列 (最大500文字)
```

**レスポンス (201)**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "expense",
    "date": "2026-07-23",
    "amount": 12500,
    "category_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "subcategory_id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    "store_id": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    "tags": ["550e8400-e29b-41d4-a716-446655440001"],
    "memo": "日用品含む",
    "created_at": "2026-07-23T10:30:45Z",
    "updated_at": "2026-07-23T10:30:45Z"
  }
}
```

**エラーケース**:
- 400: Invalid date format
- 400: Amount must be positive integer
- 404: Category not found
- 500: Internal error

---

### 4.2 GET /transactions (取引一覧)

**クエリパラメータ**:
```
?start_date=2026-07-01
&end_date=2026-07-31
&category_id=6ba7b810-9dad-11d1-80b4-00c04fd430c8
&store_id=6ba7b812-9dad-11d1-80b4-00c04fd430c8
&tag_ids=550e8400-e29b-41d4-a716-446655440001,550e8400-e29b-41d4-a716-446655440002
&min_amount=0
&max_amount=50000
&sort_by=date
&sort_order=desc
&limit=100
&offset=0
```

**レスポンス (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "expense",
      "date": "2026-07-23",
      "amount": 12500,
      /* ... その他フィールド ... */
    }
  ],
  "meta": {
    "total_count": 1250,
    "limit": 100,
    "offset": 0,
    "timestamp": "2026-07-23T10:30:45Z"
  }
}
```

---

### 4.3 GET /analytics/by-category (カテゴリ別集計)

**クエリパラメータ**:
```
?start_date=2026-07-01
&end_date=2026-07-31
&type=expense
```

**レスポンス (200)**:
```json
{
  "success": true,
  "data": [
    {
      "category_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "category_name": "食費",
      "total": 187500,
      "percentage": 31.9,
      "subcategories": [
        {
          "subcategory_id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
          "subcategory_name": "スーパー",
          "total": 95000,
          "percentage": 50.7
        }
      ]
    }
  ],
  "meta": {
    "grand_total": 587900,
    "timestamp": "2026-07-23T10:30:45Z"
  }
}
```

---

### 4.4 POST /recurring-rules/:id/execute (定期ルール実行)

**リクエスト**:
```json
{
  "execution_date": "2026-07-25"
}
```

**レスポンス (201)**:
```json
{
  "success": true,
  "data": {
    "transaction_id": "550e8400-e29b-41d4-a716-446655440000",
    "rule_id": "6ba7b813-9dad-11d1-80b4-00c04fd430c8",
    "status": "executed",
    "created_transaction": {
      /* ... Transactionオブジェクト ... */
    }
  }
}
```

**重複防止ロジック**:
```
- 実行済みルールは last_executed_at を更新
- 同じ日付での二重実行は不可
- 失敗時はロールバック
```

---

### 4.5 POST /data/export (エクスポート)

**リクエスト**:
```json
{
  "format": "csv",
  "include": ["transactions", "categories", "accounts"],
  "date_range": {
    "start_date": "2026-01-01",
    "end_date": "2026-12-31"
  }
}
```

**レスポンス (200)**:
```json
{
  "success": true,
  "data": {
    "file_url": "https://..../export_2026-07-23.zip",
    "file_size": 2097152,
    "record_counts": {
      "transactions": 1245,
      "categories": 15,
      "accounts": 8
    }
  },
  "meta": {
    "export_time": 3.2,
    "timestamp": "2026-07-23T10:30:45Z"
  }
}
```

---

### 4.6 POST /data/import (インポート)

**リクエスト** (multipart/form-data):
```
file: [CSV or JSON file]
mapping: {
  "old_category": "new_category",
  "旧カテゴリ": "給与"
}
dry_run: false
```

**レスポンス (200)**:
```json
{
  "success": true,
  "data": {
    "imported_count": 1245,
    "skipped_count": 0,
    "errors": [],
    "logs": [
      {
        "type": "migration",
        "level": "info",
        "message": "カテゴリ変換完了: 旧カテゴリ → 給与"
      }
    ]
  }
}
```

---

## 5. エラーコード一覧

| コード | HTTP | 説明 | 対処 |
|--------|------|------|------|
| INVALID_REQUEST | 400 | リクエスト形式が正しくない | リクエスト修正 |
| VALIDATION_ERROR | 400 | バリデーションエラー | 入力値確認 |
| UNAUTHORIZED | 401 | 認証エラー | ログイン |
| FORBIDDEN | 403 | アクセス権限なし | 権限確認 |
| NOT_FOUND | 404 | リソースが見つからない | ID確認 |
| CONFLICT | 409 | リソース重複 | 重複チェック |
| INTERNAL_ERROR | 500 | サーバーエラー | サポート問合せ |
| TIMEOUT | 504 | タイムアウト | 再試行 |

---

## 6. 認証・認可

### 6.1 GAS の認証方式

```javascript
// doPost(e) でリクエスト受信
// e.postData.contents で JSON ペイロード
// Session.getActiveUser().getEmail() でユーザー取得
```

### 6.2 ユーザーの確認

- Google Workspace 環境では、ドメイン内の Google Account のみ許可
- 複数ユーザー対応時は、ユーザーごとに Spreadsheet 分離

---

## 7. レート制限

| エンドポイント | 制限 | 単位 |
|--------|------|------|
| 全API | 100 | req/min (ユーザーごと) |
| /data/export | 10 | req/hour |
| /data/import | 10 | req/hour |

---

## 8. 実装ガイドライン

### 8.1 リトライ戦略

```
失敗時のリトライ (PWA側):
- 1回目: 即座に再試行
- 2回目: 1秒後
- 3回目: 2秒後
- 4回目以降: 指数バックオフ (最大30秒)
```

### 8.2 タイムアウト処理

```
GAS 実行時間制限: 6分
PWA 通信タイムアウト: 30秒

大規模データ処理は非同期に
```

### 8.3 ログ出力

```
全リクエスト・レスポンスを Logs テーブルに記録
エラーは詳細情報と共に記録
```

---

## 9. バージョニング

- 現在: v1.0
- URL パスに version 情報は含めない
- 非互換変更時は新しい Spreadsheet を検討

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-23

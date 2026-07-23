# DB設計書 - Database Design Specification

## 1. データベース概要

### 1.1 DBMSとして使用するプラットフォーム

- **Google Spreadsheet** をデータベースとして利用
- スプレッドシートの各シートがテーブルに相当
- Google Apps Script (GAS) で操作
- 表示用シートは作成しない（すべてのデータはRaw Data）

### 1.2 データ管理方針

- **全レコードに UUID を付与**
- **論理削除を採用** (deleted_at フィールド)
- **作成日時・更新日時を保持** (created_at, updated_at)
- **集計結果は保存しない** - JavaScriptで都度計算
- **トランザクション（Transactions）とマスタ（Categories等）を厳密に分離**

---

## 2. テーブル設計

### 2.1 テーブル一覧

| # | テーブル名 | 用途 | 型 | 備考 |
|----|-----------|------|-----|------|
| 1 | Transactions | トランザクション | トランザクション | 主要データ |
| 2 | Categories | カテゴリマスタ | マスタ | 2階層構造 |
| 3 | Tags | タグマスタ | マスタ | 自由形式 |
| 4 | Stores | 店舗マスタ | マスタ | レシート特定用 |
| 5 | RecurringRules | 定期ルール | マスタ | 月末一括登録 |
| 6 | Accounts | 資産口座 | マスタ | 銀行・証券等 |
| 7 | AssetSnapshots | 資産スナップショット | トランザクション | 月末残高 |
| 8 | Settings | システム設定 | マスタ | アプリ設定 |
| 9 | Logs | 操作ログ | ログ | 移行・エラー等 |

---

## 3. テーブル詳細設計

### 3.1 Transactions（トランザクション）

**役割**: 日々の収支記録

| # | カラム名 | 型 | NOT NULL | ユニーク | 説明 |
|----|---------|-----|----------|---------|------|
| 1 | id | UUID | ✓ | ✓ | プライマリキー |
| 2 | type | ENUM | ✓ | | 'income' \| 'expense' |
| 3 | date | DATE | ✓ | | 取引日付 |
| 4 | amount | INTEGER | ✓ | | 金額 (¥、正整数のみ) |
| 5 | category_id | UUID | ✓ | | Categories.id への外部キー |
| 6 | subcategory_id | UUID | | | Categoriesの子への外部キー |
| 7 | store_id | UUID | | | Stores.id への外部キー |
| 8 | tags | JSON | | | [uuid1, uuid2, ...] |
| 9 | memo | TEXT | | | 備考 |
| 10 | created_at | TIMESTAMP | ✓ | | 作成日時 (UTC) |
| 11 | updated_at | TIMESTAMP | ✓ | | 更新日時 (UTC) |
| 12 | deleted_at | TIMESTAMP | | | 論理削除日時 (NULL=有効) |
| 13 | created_by | STRING | ✓ | | 作成者メールアドレス |
| 14 | updated_by | STRING | ✓ | | 更新者メールアドレス |

**例**:
```
id: "550e8400-e29b-41d4-a716-446655440000"
type: "expense"
date: "2026-07-23"
amount: 12500
category_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
subcategory_id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
store_id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8"
tags: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"]
memo: "日用品含む"
created_at: "2026-07-23T10:30:45Z"
updated_at: "2026-07-23T10:30:45Z"
deleted_at: null
created_by: "user@example.com"
updated_by: "user@example.com"
```

### 3.2 Categories（カテゴリマスタ）

**役割**: 2階層カテゴリ管理

| # | カラム名 | 型 | NOT NULL | ユニーク | 説明 |
|----|---------|-----|----------|---------|------|
| 1 | id | UUID | ✓ | ✓ | プライマリキー |
| 2 | name | STRING | ✓ | ✓* | カテゴリ名 |
| 3 | parent_id | UUID | | | 親カテゴリのid (NULL=親) |
| 4 | icon | STRING | | | 絵文字またはアイコンコード |
| 5 | sort_order | INTEGER | | | ソート順 |
| 6 | created_at | TIMESTAMP | ✓ | | 作成日時 |
| 7 | updated_at | TIMESTAMP | ✓ | | 更新日時 |
| 8 | deleted_at | TIMESTAMP | | | 論理削除日時 |

**制約**: (name, parent_id, deleted_at=NULL) でユニーク *

**例**:
```
# 親カテゴリ
id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
name: "食費"
parent_id: null
icon: "🍽️"
sort_order: 1

# 子カテゴリ
id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8"
name: "スーパー"
parent_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
icon: null
sort_order: 1
```

### 3.3 Tags（タグマスタ）

**役割**: 横断分析用タグ管理

| # | カラム名 | 型 | NOT NULL | ユニーク | 説明 |
|----|---------|-----|----------|---------|------|
| 1 | id | UUID | ✓ | ✓ | プライマリキー |
| 2 | name | STRING | ✓ | ✓* | タグ名 |
| 3 | color | STRING | | | カラーコード (#RRGGBB) |
| 4 | created_at | TIMESTAMP | ✓ | | 作成日時 |
| 5 | updated_at | TIMESTAMP | ✓ | | 更新日時 |
| 6 | deleted_at | TIMESTAMP | | | 論理削除日時 |

**制約**: (name, deleted_at=NULL) でユニーク *

**例**:
```
id: "550e8400-e29b-41d4-a716-446655440001"
name: "旅行"
color: "#FF5733"
created_at: "2026-07-01T00:00:00Z"
updated_at: "2026-07-01T00:00:00Z"
deleted_at: null
```

### 3.4 Stores（店舗マスタ）

**役割**: レシート特定用店舗情報

| # | カラム名 | 型 | NOT NULL | ユニーク | 説明 |
|----|---------|-----|----------|---------|------|
| 1 | id | UUID | ✓ | ✓ | プライマリキー |
| 2 | name | STRING | ✓ | ✓* | 店舗名 |
| 3 | category_id | UUID | | | 推奨カテゴリ (参考値) |
| 4 | created_at | TIMESTAMP | ✓ | | 作成日時 |
| 5 | updated_at | TIMESTAMP | ✓ | | 更新日時 |
| 6 | deleted_at | TIMESTAMP | | | 論理削除日時 |
| 7 | last_used_at | TIMESTAMP | | | 最後に使用した日時 |

**制約**: (name, deleted_at=NULL) でユニーク *

**例**:
```
id: "6ba7b812-9dad-11d1-80b4-00c04fd430c8"
name: "オーケー"
category_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
created_at: "2026-06-01T00:00:00Z"
updated_at: "2026-07-23T10:30:00Z"
deleted_at: null
last_used_at: "2026-07-23T10:30:00Z"
```

### 3.5 RecurringRules（定期ルール）

**役割**: 定期収支ルール管理

| # | カラム名 | 型 | NOT NULL | ユニーク | 説明 |
|----|---------|-----|----------|---------|------|
| 1 | id | UUID | ✓ | ✓ | プライマリキー |
| 2 | name | STRING | ✓ | | ルール名 (例: "給料") |
| 3 | type | ENUM | ✓ | | 'income' \| 'expense' |
| 4 | amount | INTEGER | ✓ | | 金額 (正整数) |
| 5 | category_id | UUID | ✓ | | Categories.id |
| 6 | day_of_month | INTEGER | ✓ | | 実行日 (1-31) |
| 7 | is_active | BOOLEAN | ✓ | | 有効フラグ |
| 8 | last_executed_at | TIMESTAMP | | | 最後に実行した日時 |
| 9 | created_at | TIMESTAMP | ✓ | | 作成日時 |
| 10 | updated_at | TIMESTAMP | ✓ | | 更新日時 |
| 11 | deleted_at | TIMESTAMP | | | 論理削除日時 |

**例**:
```
id: "6ba7b813-9dad-11d1-80b4-00c04fd430c8"
name: "給料"
type: "income"
amount: 300000
category_id: "給与のカテゴリID"
day_of_month: 25
is_active: true
last_executed_at: "2026-07-25T00:00:00Z"
created_at: "2026-01-01T00:00:00Z"
updated_at: "2026-07-25T00:00:00Z"
deleted_at: null
```

### 3.6 Accounts（資産口座マスタ）

**役割**: 銀行・証券等資産口座管理

| # | カラム名 | 型 | NOT NULL | ユニーク | 説明 |
|----|---------|-----|----------|---------|------|
| 1 | id | UUID | ✓ | ✓ | プライマリキー |
| 2 | name | STRING | ✓ | ✓* | 口座名 (例: "A銀行") |
| 3 | type | ENUM | ✓ | | 'bank' \| 'securities' \| 'cash' \| 'loan' |
| 4 | initial_balance | INTEGER | | | 初期残高 |
| 5 | created_at | TIMESTAMP | ✓ | | 作成日時 |
| 6 | updated_at | TIMESTAMP | ✓ | | 更新日時 |
| 7 | deleted_at | TIMESTAMP | | | 論理削除日時 |

**制約**: (name, deleted_at=NULL) でユニーク *

**例**:
```
id: "6ba7b814-9dad-11d1-80b4-00c04fd430c8"
name: "A銀行"
type: "bank"
initial_balance: 0
created_at: "2026-01-01T00:00:00Z"
updated_at: "2026-01-01T00:00:00Z"
deleted_at: null
```

### 3.7 AssetSnapshots（資産スナップショット）

**役割**: 月末残高記録

| # | カラム名 | 型 | NOT NULL | ユニーク | 説明 |
|----|---------|-----|----------|---------|------|
| 1 | id | UUID | ✓ | ✓ | プライマリキー |
| 2 | account_id | UUID | ✓ | ✓* | Accounts.id |
| 3 | snapshot_date | DATE | ✓ | | 残高計上日 (月末) |
| 4 | balance | INTEGER | ✓ | | 残高 (¥) |
| 5 | created_at | TIMESTAMP | ✓ | | 作成日時 |
| 6 | updated_at | TIMESTAMP | ✓ | | 更新日時 |
| 7 | deleted_at | TIMESTAMP | | | 論理削除日時 |

**制約**: (account_id, snapshot_date, deleted_at=NULL) でユニーク *

**例**:
```
id: "6ba7b815-9dad-11d1-80b4-00c04fd430c8"
account_id: "6ba7b814-9dad-11d1-80b4-00c04fd430c8"
snapshot_date: "2026-07-31"
balance: 2500000
created_at: "2026-07-31T23:00:00Z"
updated_at: "2026-07-31T23:00:00Z"
deleted_at: null
```

### 3.8 Settings（システム設定）

**役割**: アプリケーション設定

| # | カラム名 | 型 | NOT NULL | ユニーク | 説明 |
|----|---------|-----|----------|---------|------|
| 1 | key | STRING | ✓ | ✓ | 設定キー |
| 2 | value | TEXT | ✓ | | 設定値 (JSON) |
| 3 | type | STRING | ✓ | | 値の型 (string, number, boolean, json) |
| 4 | updated_at | TIMESTAMP | ✓ | | 更新日時 |

**例**:
```
key: "app_version"
value: "1.0.0"
type: "string"
updated_at: "2026-07-23T00:00:00Z"

---

key: "last_data_migration"
value: "{\"date\": \"2026-07-20\", \"records\": 1245}"
type: "json"
updated_at: "2026-07-20T00:00:00Z"
```

### 3.9 Logs（操作ログ）

**役割**: 移行・エラー等の操作履歴

| # | カラム名 | 型 | NOT NULL | 説明 |
|----|---------|-----|----------|------|
| 1 | id | UUID | ✓ | プライマリキー |
| 2 | type | ENUM | ✓ | 'migration' \| 'error' \| 'export' \| 'backup' |
| 3 | level | ENUM | ✓ | 'info' \| 'warning' \| 'error' |
| 4 | message | TEXT | ✓ | ログメッセージ |
| 5 | details | JSON | | 詳細情報 |
| 6 | created_at | TIMESTAMP | ✓ | 作成日時 |

**例**:
```
id: "6ba7b816-9dad-11d1-80b4-00c04fd430c8"
type: "migration"
level: "info"
message: "カテゴリ変換完了"
details: "{\"from\": \"旧カテゴリ\", \"to\": \"新カテゴリ\", \"count\": 45}"
created_at: "2026-07-20T15:30:00Z"
```

---

## 4. 索引設計

### 4.1 必須索引

| テーブル | 索引カラム | 型 | 用途 |
|---------|-----------|-----|------|
| Transactions | date | ASC | 日付範囲検索 |
| Transactions | category_id | ASC | カテゴリ検索 |
| Transactions | store_id | ASC | 店舗検索 |
| Transactions | deleted_at | ASC | 論理削除フィルタ |
| Transactions | created_at | DESC | 最新データ取得 |
| Categories | parent_id | ASC | 子カテゴリ検索 |
| Stores | name | ASC | 店舗名検索 |
| Accounts | type | ASC | 口座タイプ検索 |

---

## 5. データ型定義

### 5.1 ENUM型

```
type (Transactions, RecurringRules):
  - "income" (収入)
  - "expense" (支出)

type (Accounts):
  - "bank" (銀行)
  - "securities" (証券)
  - "cash" (現金)
  - "loan" (ローン)

type (Logs):
  - "migration" (データ移行)
  - "error" (エラー)
  - "export" (エクスポート)
  - "backup" (バックアップ)

level (Logs):
  - "info" (情報)
  - "warning" (警告)
  - "error" (エラー)
```

---

## 6. 関連図 (ER Diagram)

```
Transactions
  ├─ category_id ──→ Categories
  ├─ subcategory_id ──→ Categories
  ├─ store_id ──→ Stores
  └─ tags ──→ Tags[] (JSON配列)

RecurringRules
  └─ category_id ──→ Categories

AssetSnapshots
  └─ account_id ──→ Accounts

Categories
  └─ parent_id ──→ Categories (自己参照)

Stores
  └─ category_id ──→ Categories (推奨値)
```

---

## 7. データ保守方針

### 7.1 論理削除の運用

- **削除時の処理**: `deleted_at` に現在時刻を設定
- **表示時の処理**: `deleted_at IS NULL` でフィルタ
- **復元**: `deleted_at` を `NULL` に戻す
- **完全削除**: 1年以上経過したデータのみ

### 7.2 バックアップ戦略

- Google Spreadsheet はクラウドストレージなので自動バックアップ
- 月1回手動エクスポート（CSV形式）
- エクスポート履歴をLogsテーブルに記録

### 7.3 データ整合性

- 外部キー参照の際は `deleted_at IS NULL` を含める
- 削除時は参照整合性をチェック（削除不可の場合はエラー）
- クリーンアップバッチは月1回実行

---

## 8. スプレッドシート設計

### 8.1 シート名と対応テーブル

| シート名 | テーブル名 | 目的 |
|---------|-----------|------|
| Transactions | Transactions | 取引記録 |
| Categories | Categories | カテゴリマスタ |
| Tags | Tags | タグマスタ |
| Stores | Stores | 店舗マスタ |
| RecurringRules | RecurringRules | 定期ルール |
| Accounts | Accounts | 資産口座 |
| AssetSnapshots | AssetSnapshots | 資産残高 |
| Settings | Settings | システム設定 |
| Logs | Logs | 操作ログ |

### 8.2 ヘッダー行

各シートの1行目にカラム名を記載（GAS読み書き用）

例 (Transactions):
```
id | type | date | amount | category_id | subcategory_id | store_id | tags | memo | created_at | updated_at | deleted_at | created_by | updated_by
```

---

## 9. パフォーマンス考慮

- **行数上限**: 100,000行程度が実用限界
- **カラム数**: 14カラム以下を推奨
- **JSON配列**: 最大100要素程度
- **クエリ最適化**: 日付範囲フィルタを最優先

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-23

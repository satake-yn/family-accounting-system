# 導入チェックリスト - Deployment Checklist

## 1. 事前チェック (Pre-Deployment)

### 1.1 環境準備

- [ ] Google Workspace アカウント準備完了
- [ ] Google Drive に十分なストレージ確認
- [ ] GAS (Google Apps Script) アクセス権限確認
- [ ] PWA ホスト先決定 (GitHub Pages / 他)
- [ ] ドメイン名決定 (オプション)

### 1.2 ドキュメント確認

- [ ] 要件定義書 (00_requirements.md) 確認
- [ ] 画面設計書 (01_screen_design.md) 確認
- [ ] DB設計書 (02_database_design.md) 確認
- [ ] API設計書 (03_api_design.md) 確認
- [ ] 実装ガイド (04_implementation_guide.md) 確認

### 1.3 開発環境

- [ ] Node.js 18.x 以上インストール
- [ ] npm 9.x 以上インストール
- [ ] Git インストール
- [ ] clasp インストール (`npm install -g @google/clasp`)
- [ ] VS Code またはエディタ準備

---

## 2. GAS セットアップ (Google Apps Script)

### 2.1 Spreadsheet 作成

- [ ] Google Drive で新しい Spreadsheet を作成
- [ ] ファイル名: `FamilyAccountingSystem`
- [ ] フォルダ: 専用フォルダに保存
- [ ] 共有設定: 本人のみアクセス可能に設定

### 2.2 シート作成

```
以下のシートを作成し、ヘッダー行を追加:
```

- [ ] **Transactions**
  ```
  id | type | date | amount | category_id | subcategory_id | store_id | tags | memo | created_at | updated_at | deleted_at | created_by | updated_by
  ```

- [ ] **Categories**
  ```
  id | name | parent_id | icon | sort_order | created_at | updated_at | deleted_at
  ```

- [ ] **Tags**
  ```
  id | name | color | created_at | updated_at | deleted_at
  ```

- [ ] **Stores**
  ```
  id | name | category_id | created_at | updated_at | deleted_at | last_used_at
  ```

- [ ] **RecurringRules**
  ```
  id | name | type | amount | category_id | day_of_month | is_active | last_executed_at | created_at | updated_at | deleted_at
  ```

- [ ] **Accounts**
  ```
  id | name | type | initial_balance | created_at | updated_at | deleted_at
  ```

- [ ] **AssetSnapshots**
  ```
  id | account_id | snapshot_date | balance | created_at | updated_at | deleted_at
  ```

- [ ] **Settings**
  ```
  key | value | type | updated_at
  ```

- [ ] **Logs**
  ```
  id | type | level | message | details | created_at
  ```

### 2.3 初期マスタデータ作成

#### Categories (親カテゴリ)

| id | name | parent_id | icon |
|----|------|-----------|------|
| cat_001 | 食費 | NULL | 🍽️ |
| cat_002 | 交通 | NULL | 🚗 |
| cat_003 | 衣服 | NULL | 👕 |
| cat_004 | 娯楽 | NULL | 🎮 |
| cat_005 | 生活 | NULL | 🏠 |
| cat_006 | 医療 | NULL | 🏥 |
| cat_007 | 給料 | NULL | 💰 |
| cat_008 | その他 | NULL | 📌 |

- [ ] 親カテゴリ 8個を作成
- [ ] 各親カテゴリに子カテゴリを作成
  - [ ] 食費 > スーパー / コンビニ / 外食
  - [ ] 交通 > 電車 / ガソリン / タクシー
  - [ ] 等々

#### Accounts (資産口座)

| id | name | type | initial_balance |
|----|------|------|-----------------|
| acc_001 | メイン銀行 | bank | 0 |
| acc_002 | 貯蓄銀行 | bank | 0 |
| acc_003 | 証券口座 | securities | 0 |
| acc_004 | 現金 | cash | 0 |

- [ ] 銀行口座 2〜3個
- [ ] 証券口座 1個
- [ ] 現金管理 1個

### 2.4 GAS プロジェクト作成

```bash
clasp login
clasp create --title "FamilyAccountingSystem"
```

- [ ] clasp ログイン完了
- [ ] `.clasp.json` ファイル生成確認
- [ ] GAS プロジェクト ID 記録

### 2.5 GAS コード実装

GAS フォルダ構成に従って以下を実装:

- [ ] `src/gas/main.gs` - エントリーポイント
- [ ] `src/gas/api.gs` - ルーティング
- [ ] `src/gas/handlers/transactions.gs` - トランザクション API
- [ ] `src/gas/handlers/categories.gs` - カテゴリ API
- [ ] `src/gas/handlers/tags.gs` - タグ API
- [ ] `src/gas/handlers/stores.gs` - 店舗 API
- [ ] `src/gas/handlers/recurring.gs` - 定期ルール API
- [ ] `src/gas/handlers/accounts.gs` - 資産口座 API
- [ ] `src/gas/handlers/analytics.gs` - 集計 API
- [ ] `src/gas/handlers/data.gs` - データ管理 API
- [ ] `src/gas/db/database.gs` - DB層抽象化
- [ ] `src/gas/db/sheet.gs` - Spreadsheet 操作
- [ ] `src/gas/utils/validation.gs` - バリデーション
- [ ] `src/gas/utils/logger.gs` - ロギング
- [ ] `src/gas/lib/uuid.gs` - UUID 生成

### 2.6 GAS デプロイ

```bash
clasp push
clasp deploy -d "v1.0.0 Initial"
```

- [ ] コード push 成功
- [ ] 新バージョン deploy 成功
- [ ] GAS ログ確認（エラーなし）

### 2.7 GAS ウェブアプリ URL 取得

1. GAS エディタで「デプロイ」をクリック
2. 「新しいデプロイ」から「ウェブアプリ」を選択
3. 実行ユーザー: 自分のアカウント
4. アクセスできるユーザー: 「誰でも」を選択
5. デプロイをクリック
6. URL を記録: `https://script.google.com/macros/d/{SCRIPT_ID}/usercontent`

- [ ] ウェブアプリ URL 取得完了
- [ ] URL を `.env` に保存

---

## 3. PWA セットアップ

### 3.1 ファイル構成作成

```
src/pwa/
├── index.html
├── manifest.json
├── css/
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── store.js
│   ├── screens/
│   │   ├── input.js
│   │   ├── history.js
│   │   ├── analytics.js
│   │   ├── asset.js
│   │   └── settings.js
│   ├── components/
│   │   ├── tabs.js
│   │   └── form.js
│   └── utils/
│       ├── date.js
│       └── format.js
└── service-worker.js
```

- [ ] ファイル構成作成完了

### 3.2 HTML・CSS 実装

- [ ] `index.html` 実装
- [ ] `manifest.json` 実装 (PWA マニフェスト)
- [ ] `style.css` 実装 (基本スタイル)
- [ ] `responsive.css` 実装 (iPhone 最適化)
- [ ] `service-worker.js` 実装 (オフライン対応)

### 3.3 JavaScript 実装

- [ ] `api.js` - GAS API 通信
- [ ] `store.js` - 状態管理
- [ ] `screens/input.js` - 入力画面
- [ ] `screens/history.js` - 履歴画面
- [ ] `screens/analytics.js` - 集計画面
- [ ] `screens/asset.js` - 資産画面
- [ ] `screens/settings.js` - 設定画面
- [ ] `utils/date.js` - 日付ユーティリティ
- [ ] `utils/format.js` - フォーマット関数
- [ ] `app.js` - メインアプリロジック

### 3.4 PWA テスト

ローカルサーバーで実行:
```bash
npx http-server src/pwa
```

- [ ] `http://localhost:8080` でアクセス可能
- [ ] Manifest 読み込み成功 (DevTools 確認)
- [ ] Service Worker 登録成功 (DevTools > Application)
- [ ] GAS API との通信成功

### 3.5 iPhone 対応確認

- [ ] iPhone Safari でアクセス
- [ ] ホーム画面に追加可能
- [ ] アプリ起動後、全機能動作確認
- [ ] 片手操作でスムーズに使用可能

---

## 4. 統合テスト (Integration Testing)

### 4.1 入力画面テスト

```
支出入力フロー:
```

- [ ] 金額を30秒以内に入力可能
- [ ] 日付保持機能 (前回設定値)
- [ ] カテゴリドロップダウン表示
- [ ] 店舗オートコンプリート動作
- [ ] タグ複数追加可能
- [ ] メモ入力可能
- [ ] 保存ボタンで GAS API 呼び出し
- [ ] 入力フォーム自動リセット
- [ ] トースト通知表示

```
収入入力フロー:
```

- [ ] セグメント切り替え
- [ ] 収入として保存可能

### 4.2 履歴画面テスト

- [ ] 取引一覧表示
- [ ] 日付でソート可能
- [ ] フィルタ機能動作
  - [ ] 期間フィルタ
  - [ ] カテゴリフィルタ
  - [ ] 金額範囲フィルタ
- [ ] 編集ボタンで編集画面表示
- [ ] 複製ボタンで複製実行
- [ ] 削除ボタンで論理削除実行

### 4.3 集計画面テスト

- [ ] 月別集計表示
- [ ] カテゴリ別集計表示
- [ ] 棒グラフ表示
- [ ] 合計金額表示正確
- [ ] パーセンテージ計算正確

### 4.4 資産画面テスト

- [ ] 資産口座一覧表示
- [ ] 月末残高表示
- [ ] 推移グラフ表示
- [ ] 純資産計算正確

### 4.5 設定画面テスト

- [ ] カテゴリ管理機能
  - [ ] 新規作成
  - [ ] 編集
  - [ ] 削除
- [ ] タグ管理機能
- [ ] 定期ルール管理
  - [ ] 新規作成
  - [ ] 実行
  - [ ] 削除
- [ ] データエクスポート
- [ ] データインポート

### 4.6 エラーハンドリング

- [ ] 通信エラー時の再試行
- [ ] バリデーションエラー表示
- [ ] タイムアウト処理
- [ ] ネットワークオフライン時の処理

---

## 5. パフォーマンス確認

- [ ] 入力から保存完了まで 2秒以内
- [ ] 履歴一覧表示 3秒以内
- [ ] 集計計算 5秒以内
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

---

## 6. セキュリティ確認

- [ ] HTTPS 通信確認
- [ ] CORS ポリシー確認
- [ ] 認証機能 (Google Account) 動作確認
- [ ] 個人情報保護方針確認
- [ ] データ暗号化対応確認

---

## 7. ドキュメント完成

- [ ] README.md 完成
- [ ] CONTRIBUTING.md 作成
- [ ] API ドキュメント (Swagger/OpenAPI)
- [ ] トラブルシューティングガイド
- [ ] FAQ ドキュメント

---

## 8. 本番デプロイ

### 8.1 PWA デプロイ

```bash
npm run build
npm run deploy
```

- [ ] PWA ビルド成功
- [ ] GitHub Pages (またはホスト先) にデプロイ完了
- [ ] HTTPS でアクセス可能
- [ ] ドメイン名でアクセス可能 (オプション)

### 8.2 GAS 本番設定

- [ ] GAS コード最終確認
- [ ] Logs テーブルの初期化
- [ ] Settings の初期値設定
- [ ] 本番環境用デプロイ実行

### 8.3 データバックアップ

- [ ] Spreadsheet 全体の バックアップコピー作成
- [ ] バージョン管理
- [ ] ディザスタリカバリプラン確認

---

## 9. リリース後確認 (Post-Launch)

### 9.1 24時間監視

- [ ] GAS ログ定期確認 (エラーなし)
- [ ] ユーザーサポート問い合わせ対応
- [ ] パフォーマンス監視
- [ ] データ整合性確認

### 9.2 初期運用

- [ ] 定期ルール実行確認
- [ ] データエクスポート確認
- [ ] ユーザーフィードバック収集

### 9.3 改善計画

- [ ] 改善要望リスト作成
- [ ] バグ報告リスト作成
- [ ] 優先度付けとスケジュール化

---

## 10. 運用ガイドライン

### 10.1 毎日

- [ ] 朝: システムヘルスチェック
- [ ] 夜: ログ確認

### 10.2 毎週

- [ ] パフォーマンスレポート確認
- [ ] バグ対応状況確認

### 10.3 毎月

- [ ] 定期ルール実行
- [ ] 資産残高入力
- [ ] データバックアップ
- [ ] ログアーカイブ

---

## 11. チェック完了

すべてのチェック項目を完了後、以下を実行:

```bash
# すべてのドキュメントをコミット
git add .
git commit -m "chore: deployment checklist completed - v1.0.0"
git push origin main

# リリースタグを作成
git tag -a v1.0.0 -m "Family Accounting System v1.0.0"
git push origin v1.0.0
```

- [ ] すべてのチェック項目完了
- [ ] コミット完了
- [ ] リリースタグ作成
- [ ] リリースノート作成

---

**Deployment Date**: 2026-07-23  
**Version**: 1.0.0  
**Status**: Ready for Deployment  
**Last Updated**: 2026-07-23

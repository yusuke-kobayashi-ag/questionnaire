# 研究者向けアンケート結果集積アプリケーション

Next.js + Supabase + Prisma + Vercelで構築された研究者向けアンケートシステムです。

## 機能

### 基本機能
- アンケートの作成・編集・削除
- 複数の質問タイプ対応
  - 単一選択
  - 複数選択
  - テキスト入力
  - 数値入力
  - スライダー
  - 比較スライダー
- オンライン回答受付
- 回答者の基本情報収集（氏名、メールアドレス、性別、年齢）
- 管理者用パスワード認証機能
- 結果の可視化・統計表示
- CSV出力機能

### 技術スタック
- **フロントエンド**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **データベース操作**: Supabase JavaScript Client
- **認証**: 管理者パスワード認証（セッション管理）
- **デプロイ**: Vercel

## セットアップ手順

### 1. 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin authentication
ADMIN_PASSWORD=your_admin_password
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスし、新しいプロジェクトを作成
2. プロジェクトの設定から以下の情報を取得：
   - Project URL
   - API Keys (anon public key, service role key)
   - Database URL

### 3. データベースのセットアップ

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `database-schema.sql`ファイルの内容をコピーして実行
3. テーブルが正常に作成されたことを確認

### 4. 依存関係のインストール

```bash
npm install
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 使用方法

### 管理者としての使用

1. `/admin/login` にアクセス
2. 設定したパスワードでログイン
3. 管理画面でアンケートを作成・管理
4. 結果の確認とCSV出力

### 回答者としての使用

1. `/surveys` にアクセス
2. 利用可能なアンケートを選択
3. 回答者情報を入力
4. 各質問に回答
5. 送信完了

## データベース構造

### Survey（アンケート）
- id, title, description, created_at, is_active

### Question（質問）
- id, survey_id, question_text, question_type, question_order, min_value, max_value, step_value

### Option（選択肢）
- id, question_id, option_text, option_order

### Respondent（回答者）
- id, name, email, gender, age, created_at

### Response（回答）
- id, survey_id, respondent_id, question_id, answer_text, option_id, attempt_number, created_at

## Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. Vercelアカウントでリポジトリをインポート
3. 環境変数を設定
4. デプロイ実行

### 環境変数の設定（Vercel）
Vercelのプロジェクト設定で以下の環境変数を設定：

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
NEXTAUTH_SECRET
NEXTAUTH_URL
```

## 開発時の注意点

1. **認証**: 開発環境では平文パスワードを使用していますが、本番環境ではハッシュ化を推奨
2. **CORS**: Supabaseの設定でVercelのドメインを許可
3. **セッション管理**: 本番環境では Redis など永続化ストレージの使用を検討
4. **エラーハンドリング**: 適切なエラーメッセージとログ記録の実装

## トラブルシューティング

### データベース接続エラー
- 環境変数の値を確認
- Supabaseプロジェクトのステータスを確認
- ネットワーク接続を確認

### 認証エラー
- ADMIN_PASSWORD が正しく設定されているか確認
- セッション管理の設定を確認

### デプロイエラー
- 環境変数がすべて設定されているか確認
- ビルドエラーの詳細を確認
- Vercelのログを確認

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 貢献

バグレポートや機能要求は Issue で受け付けています。
プルリクエストも歓迎します。

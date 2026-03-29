# 資格学習者掲示板アプリ (PoC)

このアプリは、資格試験の学習者が問題ごとに解説や意見を交換できる掲示板プラットフォームです。

## 技術スタック
- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4, Lucide React
- **Backend/DB**: Supabase (Auth, PostgreSQL)
- **State Management**: Zustand
- **Test**: Vitest

## セットアップ手順

### 1. Supabase の準備
1. [Supabase Dashboard](https://supabase.com/dashboard) にログインし、プロジェクト（`xbrnddhedovbpzjqnmtq`）を開きます。
2. **SQL Editor** を開き、`supabase/migrations/20260322_initial_schema.sql` の内容を貼り付けて実行してください。これにより、必要なテーブル、RLSポリシー、および初期データが作成されます。

### 2. 環境変数の設定
プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、以下の内容を設定してください。

```env
NEXT_PUBLIC_SUPABASE_URL=https://xbrnddhedovbpzjqnmtq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
※ `YOUR_SUPABASE_ANON_KEY` は、Supabase の Project Settings > API から取得できる `anon` `public` キーに置き換えてください。

### 3. ローカル開発サーバーの起動

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 4. テストの実行

```bash
npm test
```

## 設計パターンの解説
- **Feature-based Colocation**: 機能ごとにディレクトリを分割し、関連するコンポーネント、ロジック、型をまとめることで保守性を高めています。
- **Progressive Enhancement**: PoCとして、まずはモックデータで動作を確認できるようにしつつ、Supabase と連携可能な設計にしています。
- **Reputation System**: ユーザーの貢献度を可視化するため、ポイントに応じた称号（初学者、中級者など）を付与するロジックを実装しています。

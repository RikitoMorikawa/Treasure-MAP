# Treasure MAP

旅行・登山などのプライベートな思い出を記録するアプリ。

## 技術スタック

- **フロント / API**: Next.js (App Router, Server Actions)
- **DB**: Turso (libSQL) + Drizzle ORM — ローカル開発時は `file:local.db` (SQLite)
- **ホスティング**: Vercel

## 画面

- `/` — ダッシュボード(記録件数)
- `/travels` — 旅行記録(追加・一覧・削除)
- `/climbs` — 登山記録(追加・一覧・削除)

## 開発

```bash
npm install
npx drizzle-kit push   # ローカル local.db にスキーマ反映
npm run dev
```

環境変数なしで動く(ローカル SQLite `local.db` を使用)。

## 本番 (Turso + Vercel)

1. Turso に DB を作成してクレデンシャルを取得:

   ```bash
   turso db create treasure-map
   turso db show treasure-map --url      # → TURSO_DATABASE_URL
   turso db tokens create treasure-map   # → TURSO_AUTH_TOKEN
   ```

2. スキーマを Turso に反映:

   ```bash
   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npx drizzle-kit push
   ```

3. Vercel プロジェクトの環境変数に `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` を設定してデプロイ。

## スキーマ変更

`src/db/schema.ts` を編集後:

```bash
npx drizzle-kit generate   # マイグレーション SQL 生成 (drizzle/)
npx drizzle-kit push       # DB へ反映
```

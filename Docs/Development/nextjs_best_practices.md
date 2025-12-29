# Next.js App Router Best Practices & Guidelines

本プロジェクト「Hariness」における、Next.js App Router (v15+) を使用した開発のベストプラクティスとガイドラインです。
公式ドキュメントおよびモダンなReactパターンに基づき、パフォーマンス、保守性、セキュリティを考慮した実装指針を定めます。

## 1. コンポーネント設計方針 (Server vs Client)

Next.js App Routerでは、**デフォルトで Server Component** として扱われます。必要な場合のみ Client Component (`'use client'`) に切り替えるアプローチを徹底します。

### 1.1 Server Components (推奨・デフォルト)

- **原則**: 可能な限り Server Component を使用する。
- **メリット**: バンドルサイズ削減、初期ロード高速化、SEO向上、セキュアなデータアクセス。
- **用途**:
  - データフェッチ
  - バックエンドリソースへの直接アクセス (DB, API)
  - 機密情報 (API Keyなど) を含む処理
  - インタラクションのないUI描画

### 1.2 Client Components (`'use client'`)

- **原則**: 以下の機能が必要なツリーの**末端（Leaf）**で使用する。ページ全体を `'use client'` にするのは避ける。
- **用途**:
  - イベントリスナー (`onClick`, `onChange`)
  - React Hooks (`useState`, `useEffect`)
  - ブラウザAPIへのアクセス (`window`, `localStorage`)
  - Class Component (非推奨だが互換性のため)
- **パターン**: Server Component の中に Client Component を埋め込む構成にする (Children Pattern)。

```tsx
// ❌ Bad: ページ全体をクライアント化
'use client'
export default function Page() { ... }

// ✅ Good: インタラクション部分だけコンポーネント化
import { InteractiveButton } from './InteractiveButton';
export default function Page() {
  return (
    <div>
      <h1>Server Rendered Title</h1>
      <InteractiveButton />
    </div>
  );
}
```

## 2. データフェッチ (Data Fetching)

### 2.1 Server Componentでのフェッチ

- `useEffect` ではなく、**`async/await` を使用して Server Component 内で直接データを取得**します。
- Supabaseクライアントは `src/lib/supabase/server.ts` を使用します。

```tsx
// ✅ Good
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createClient();
  const { data } = await supabase.from('todos').select();

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

### 2.2 並列データフェッチ (Parallel Data Fetching)

- 複数のデータソースが必要な場合、`await` を直列に並べず、`Promise.all` 等を使用して並列化し、Waterfallを防ぎます。

```tsx
// ❌ Bad: 直列待ち (Waterfall)
const user = await getUser();
const posts = await getPosts();

// ✅ Good: 並列実行
const [user, posts] = await Promise.all([getUser(), getPosts()]);
```

### 2.3 Loading UI & Streaming

- `loading.tsx` や `<Suspense>` を活用し、データ取得中もUIのスケルトンを表示します。
- 遅いデータフェッチがページ全体の表示をブロックしないようにします。

```tsx
import { Suspense } from 'react';
import { PostList } from './PostList';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Page() {
  return (
    <div>
      <h1>Posts</h1>
      <Suspense fallback={<Skeleton />}>
        <PostList />
      </Suspense>
    </div>
  );
}
```

## 3. データ更新 (Mutations / Server Actions)

### 3.1 Server Actions

- API Routes (`app/api/*`) の代わりに **Server Actions** を使用します。
- フォーム送信 (`<form action={...}>`) や、イベントハンドラからの呼び出しに使用します。
- **セキュリティ**: Server Actions は公開APIエンドポイントとして扱われるため、必ず**内部で認証チェックと入力バリデーション**を行います。

```tsx
// actions.ts ('use server')
'use server'

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({ ... });

export async function createTodo(formData: FormData) {
  const supabase = await createClient();
  // 1. 認証チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // 2. バリデーション
  const parse = schema.safeParse(Object.fromEntries(formData));
  if (!parse.success) return { error: parse.error };

  // 3. DB操作
  await supabase.from('todos').insert({ ... });

  // 4. キャッシュ更新
  revalidatePath('/todos');
}
```

### 3.2 楽観的更新 (Optimistic Options)

- `useOptimistic` hook を使用して、サーバーレスポンスを待たずにUIを即時更新し、UXを向上させます。

## 4. ルーティング & レイアウト

### 4.1 Route Groups

- URLパスに影響を与えずにレイアウトを整理するために Route Groups `(group-name)` を活用します。
  - `(auth)`: ログイン、登録画面（共通レイアウトなし、または専用レイアウト）
  - `(main)`: アプリ主要画面（ヘッダー・フッター・サイドバーあり）

### 4.2 Error Handling

- `error.tsx` を定義し、予期せぬエラー発生時にユーザーフレンドリーな画面を表示します。
- `global-error.tsx` はルートレイアウトのエラー捕捉に使用します。

## 5. ステート管理

### 5.1 URL State

- 検索フィルタ、ページネーション、タブ選択などの状態は、`useState` ではなく **URLクエリパラメータ** で管理します。
- これにより、リロードしても状態が維持され、URL共有が可能になります。

### 5.2 Server State vs Client State

- **Server State (DBデータ)**: React Query等は必須ではありません（Server Componentsでフェッチすれば最新）。Server Actions後の `revalidatePath` で更新します。
- **Client State (UI状態)**: モーダル開閉などは `useState` / `useReducer` で管理します。

## 6. パフォーマンス最適化

- **Image Optimization**: `next/image` を必ず使用し、画像の最適化とレイアウトシフト (CLS) を防止します。
- **Font Optimization**: `next/font` を使用してフォントロードを最適化します。
- **Dynamic Imports**: 重いコンポーネントは `next/dynamic` で遅延読み込みします。

## 7. ディレクトリ構成の推奨

本プロジェクトでは `src/` ディレクトリ配下で管理します。

- `src/app`: ルーティングとページ定義のみ。ロジックは薄く保つ。
- `src/components`: UIコンポーネント。Featureベースで分割 (`features/hedgehog/*` など)。
- `src/lib`: 外部サービス接続、ユーティリティ。
- `src/hooks`: 汎用的なカスタムフック。

---

このドキュメントはプロジェクトの進行とともに随時更新されます。
実装に迷った際は、この指針に立ち返ってください。

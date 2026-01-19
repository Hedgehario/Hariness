# Next.js App Router Best Practices & Guidelines

本プロジェクト「Hariness」における、Next.js App Router (v16+) と React 19 を使用した開発のベストプラクティスとガイドラインです。
公式ドキュメントおよびモダンなReactパターンに基づき、パフォーマンス、保守性、セキュリティを考慮した実装指針を定めます。

> **現在のバージョン**: Next.js 16.1.1 / React 19.2.3

---

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
  - React Hooks (`useState`, `useEffect`, `useActionState`, `useOptimistic`)
  - ブラウザAPIへのアクセス (`window`, `localStorage`)
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

---

## 2. データフェッチ (Data Fetching)

### 2.1 Server Componentでのフェッチ

- `useEffect` ではなく、**`async/await` を使用して Server Component 内で直接データを取得**します。
- Supabaseクライアントは `src/lib/supabase/server.ts` を使用します。

```tsx
// ✅ Good
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();
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

---

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
import { revalidatePath, revalidateTag } from 'next/cache';

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
  revalidatePath('/todos');        // パス単位で無効化
  // または
  revalidateTag('todos');          // タグ単位で無効化
}
```

### 3.2 useActionState (React 19)

React 19 で追加された `useActionState` を使用して、Server Actions の状態（ローディング、エラー）を管理します。

```tsx
'use client'

import { useActionState } from 'react';
import { createTodo } from './actions';

export function TodoForm() {
  const [state, formAction, isPending] = useActionState(createTodo, null);

  return (
    <form action={formAction}>
      <input name="title" disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? '保存中...' : '追加'}
      </button>
      {state?.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}
```

### 3.3 useOptimistic (React 19)

`useOptimistic` を使用して、サーバーレスポンスを待たずにUIを即時更新し、UXを向上させます。

```tsx
'use client'

import { useOptimistic } from 'react';
import { deleteTodo } from './actions';

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, removeOptimistic] = useOptimistic(
    todos,
    (state, deletedId: string) => state.filter((t) => t.id !== deletedId)
  );

  async function handleDelete(id: string) {
    removeOptimistic(id);  // 即座にUIから削除
    await deleteTodo(id);  // サーバーで削除（失敗時は自動ロールバック）
  }

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li key={todo.id}>
          {todo.title}
          <button onClick={() => handleDelete(todo.id)}>削除</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 4. ルーティング & ナビゲーション

### 4.1 Route Groups

- URLパスに影響を与えずにレイアウトを整理するために Route Groups `(group-name)` を活用します。
  - `(auth)`: ログイン、登録画面（共通レイアウトなし、または専用レイアウト）
  - `(main)`: アプリ主要画面（ヘッダー・フッター・サイドバーあり）

### 4.2 ナビゲーションフック (`next/navigation`)

App Router では `next/router` ではなく **`next/navigation`** を使用します。

| フック | 用途 | 例 |
|-------|------|-----|
| `usePathname()` | 現在のパスを取得 | `/home` → `/home` |
| `useSearchParams()` | クエリパラメータを取得 | `?tab=graph` → `tab` |
| `useParams()` | 動的ルートパラメータを取得 | `/hedgehogs/[id]` → `id` |
| `useRouter()` | プログラムナビゲーション | `router.push()`, `router.back()` |

```tsx
'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();         // '/records'
  const searchParams = useSearchParams(); // URLSearchParams オブジェクト
  const router = useRouter();

  const tab = searchParams.get('tab');    // 'graph' or null

  return (
    <button onClick={() => router.back()}>戻る</button>
  );
}
```

### 4.3 Error Handling

- `error.tsx` を定義し、予期せぬエラー発生時にユーザーフレンドリーな画面を表示します。
- `global-error.tsx` はルートレイアウトのエラー捕捉に使用します。

---

## 5. キャッシュ戦略

### 5.1 キャッシュ無効化

| 方法 | 用途 | 例 |
|------|------|-----|
| `revalidatePath(path)` | 特定のパスのキャッシュを無効化 | `revalidatePath('/home')` |
| `revalidateTag(tag)` | 特定のタグのキャッシュを無効化 | `revalidateTag('hedgehogs')` |

```tsx
// タグ付きフェッチ
const { data } = await supabase
  .from('hedgehogs')
  .select()
  .then((res) => {
    // Next.js の fetch キャッシュタグを活用する場合
    return res;
  });

// Server Action での無効化
export async function updateHedgehog(id: string, data: UpdateData) {
  await supabase.from('hedgehogs').update(data).eq('id', id);
  revalidateTag('hedgehogs');  // 関連するすべてのキャッシュを無効化
}
```

### 5.2 キャッシュ戦略の指針

- **編集・削除時のみ** `revalidatePath` / `revalidateTag` を呼び出す
- **閲覧のみ**の操作（ページ遷移、戻る）では呼び出さない
- `router.refresh()` は極力使用しない（全ページ再取得となるため）

---

## 6. ステート管理

### 6.1 URL State

- 検索フィルタ、ページネーション、タブ選択などの状態は、`useState` ではなく **URLクエリパラメータ** で管理します。
- これにより、リロードしても状態が維持され、URL共有が可能になります。

```tsx
// ✅ Good: URL でタブ状態を管理
// /records?tab=graph
const tab = searchParams.get('tab') ?? 'list';
```

### 6.2 Server State vs Client State

- **Server State (DBデータ)**: React Query等は必須ではありません（Server Componentsでフェッチすれば最新）。Server Actions後の `revalidatePath` で更新します。
- **Client State (UI状態)**: モーダル開閉などは `useState` / `useReducer` で管理します。

---

## 7. パフォーマンス最適化

### 7.1 基本の最適化

- **Image Optimization**: `next/image` を必ず使用し、画像の最適化とレイアウトシフト (CLS) を防止します。
- **Font Optimization**: `next/font` を使用してフォントロードを最適化します。
- **Dynamic Imports**: 重いコンポーネントは `next/dynamic` で遅延読み込みします。

```tsx
import dynamic from 'next/dynamic';

// Recharts など重いライブラリは動的インポート
const WeightChart = dynamic(
  () => import('./weight-chart').then((mod) => mod.WeightChart),
  { loading: () => <Skeleton />, ssr: false }
);
```

### 7.2 Turbopack (開発時)

Next.js 16 では **Turbopack** が開発サーバーのデフォルトビルドツールです。
高速なHMR（Hot Module Replacement）により、開発体験が大幅に向上しています。

```bash
# Turbopack で開発サーバー起動（デフォルト）
npm run dev
```

---

## 8. ディレクトリ構成の推奨

本プロジェクトでは `src/` ディレクトリ配下で管理します。

```
src/
├── app/                    # ルーティングとページ定義
│   ├── (auth)/             # 認証系ページ（専用レイアウト）
│   ├── (main)/             # メインアプリ（共通レイアウト）
│   └── layout.tsx          # ルートレイアウト
├── components/             # UIコンポーネント
│   ├── ui/                 # 汎用UI（Button, Card, Input）
│   ├── hedgehogs/          # 個体管理系コンポーネント
│   ├── records/            # 健康記録系コンポーネント
│   └── layout/             # レイアウト系（Header, Footer）
├── lib/                    # 外部サービス接続、ユーティリティ
│   └── supabase/           # Supabase クライアント
├── hooks/                  # 汎用的なカスタムフック
└── types/                  # 型定義
```

---

## 9. チェックリスト

新しいページ/機能を実装する際のチェックリストです。

- [ ] **Server Component で実装できるか？** → できる限りサーバーで処理
- [ ] **`'use client'` は末端のみか？** → ページ全体をクライアント化しない
- [ ] **データフェッチは並列化されているか？** → `Promise.all` を活用
- [ ] **`loading.tsx` または `<Suspense>` を配置したか？**
- [ ] **Server Action に認証チェックがあるか？**
- [ ] **Server Action にバリデーションがあるか？** → Zod を使用
- [ ] **キャッシュ無効化は編集時のみか？** → 不要な `revalidate` を避ける

---

**最終更新日**: 2026-01-19

このドキュメントはプロジェクトの進行とともに随時更新されます。
実装に迷った際は、この指針に立ち返ってください。

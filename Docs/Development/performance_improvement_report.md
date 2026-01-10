# パフォーマンス改善報告書

**作成日**: 2026年1月10日  
**対象バージョン**: v0.1.0

---

## 概要

Vercelデプロイ後のモバイル環境において「動作がカクカクする」という問題が報告されたため、パフォーマンス調査および改善を実施しました。

---

## 発見された問題点

### 致命的 (Critical)

| 問題                  | 詳細                                       | 影響                           |
| --------------------- | ------------------------------------------ | ------------------------------ |
| 巨大アイコンファイル  | `icon.png`, `apple-icon.png` が **5.43MB** | 初期ロード大幅遅延             |
| loading.tsx 未実装    | **0件**                                    | 画面遷移時に空白表示           |
| Suspense 未使用       | **0件**                                    | ストリーミングレンダリング不可 |
| router.refresh() 多用 | **9箇所**                                  | 操作ごとに全ページ再取得       |

### 重要 (Major)

| 問題                 | 詳細                        | 影響                   |
| -------------------- | --------------------------- | ---------------------- |
| データフェッチ直列化 | `home/page.tsx` で順次await | ウォーターフォール発生 |
| next/dynamic 未使用  | recharts等を即時ロード      | 初期バンドル肥大化     |

---

## 実施した改善

### Phase 1: 画像圧縮

**対象ファイル**:

- `src/app/icon.png`
- `src/app/apple-icon.png`

**結果**:

- Before: 5.43MB
- After: 496KB
- **削減率: 91%**

**使用ツール**: sharp-cli (512x512にリサイズ)

---

### Phase 2: Loading UI 追加

以下のルートに `loading.tsx` を新規作成:

| ルート      | ファイルパス                          |
| ----------- | ------------------------------------- |
| `/home`     | `src/app/(main)/home/loading.tsx`     |
| `/records`  | `src/app/(main)/records/loading.tsx`  |
| `/calendar` | `src/app/(main)/calendar/loading.tsx` |
| `/hospital` | `src/app/(main)/hospital/loading.tsx` |

**効果**: 画面遷移時にローディングスピナーを表示し、空白画面を防止

---

### Phase 3: データフェッチ並列化

**対象ファイル**: `src/app/(main)/home/page.tsx`

**変更内容**:

```typescript
// Before (順次実行 - ウォーターフォール発生)
const hedgehogs = await getMyHedgehogs();
const reminders = await getMyReminders();
const { hedgehogId } = await searchParams;

// After (並列実行)
const [hedgehogs, reminders, params] = await Promise.all([
  getMyHedgehogs(),
  getMyReminders(),
  searchParams,
]);
```

**効果**: 複数のデータ取得を同時実行し、待機時間を短縮

---

### Phase 4: router.refresh() 削減

楽観的更新 (Optimistic Update) パターンを適用し、8箇所で `router.refresh()` を削除:

| ファイル                  | 変更内容                           |
| ------------------------- | ---------------------------------- |
| `home-reminder-item.tsx`  | 楽観的更新で即時反映               |
| `reminder-list-item.tsx`  | 楽観的更新 + onDeletedコールバック |
| `record-list.tsx`         | ローカルステートで楽観的削除       |
| `hospital-visit-list.tsx` | ローカルステートで楽観的削除       |
| `day-events-sheet.tsx`    | onDeletedコールバックで更新        |
| `hedgehog-form.tsx`       | リダイレクト後のrefresh削除        |
| `event-form.tsx`          | リダイレクト後のrefresh削除        |

**効果**: 操作時の全ページ再取得を防止し、即時UIフィードバックを実現

---

### Phase 5: 動的インポート

**対象ファイル**: `src/components/records/records-container.tsx`

**変更内容**:

```typescript
// Before (静的インポート)
import { WeightChart } from './weight-chart';

// After (動的インポート)
const WeightChart = dynamic(
  () => import('./weight-chart').then((mod) => mod.WeightChart),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);
```

**効果**: rechartsのバンドルを初期ロードから分離し、必要時にのみロード

---

## 期待される効果

| 項目           | Before                   | After                    |
| -------------- | ------------------------ | ------------------------ |
| 初期ロード時間 | 遅い (5MB+ ダウンロード) | 高速 (500KB程度)         |
| 画面遷移体験   | 空白画面が表示される     | ローディングスピナー表示 |
| 操作レスポンス | カクカク・遅延あり       | 滑らか・即時反映         |
| バンドルサイズ | 大きい                   | 分割・軽量化             |

---

## 検証結果

- ✅ `npm run build` 成功 (Exit code: 0)
- ✅ TypeScriptコンパイルエラーなし
- ✅ 全ページの静的解析完了

---

## 今後の改善候補

1. **React Suspense の活用**: 重いコンポーネントを `<Suspense>` でラップしてストリーミング対応
2. **画像最適化の継続**: ユーザーアップロード画像のリサイズ・圧縮
3. **キャッシュ戦略**: Supabaseクエリ結果のキャッシュ検討
4. **Web Vitals モニタリング**: Vercel Analyticsで継続的にパフォーマンス監視

---

## 参考資料

- [Next.js Best Practices](../Design/nextjs_best_practices.md)
- [UI Design Guide](../Design/ui_design_guide.md)

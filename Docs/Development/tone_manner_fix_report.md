# トンマナ修正完了報告書

**作成日**: 2026年1月9日  
**対象**: アプリ全体のUI文言

---

## 概要

`ui_design_guide.md` のトーン＆マナー指針に基づき、「個体」などの技術用語を親しみやすい表現に修正しました。

---

## 変更内容

### UIテキスト変更一覧

| 変更前                             | 変更後                           |
| ---------------------------------- | -------------------------------- |
| 個体を登録する                     | ハリネズミを登録する             |
| 個体情報を編集                     | プロフィールを編集               |
| この個体を削除する                 | この子を削除する                 |
| 対象の個体                         | 記録するハリネズミ               |
| 個体を選択                         | 選んでください                   |
| 個体登録                           | ハリネズミ登録                   |
| 個体情報を更新しました             | プロフィールを更新しました       |
| 個体が登録されていません           | ハリネズミが登録されていません   |
| 個体が選択されていません           | ハリネズミが選択されていません   |
| この個体を編集する権限がありません | この子を編集する権限がありません |

---

## 修正ファイル一覧（14ファイル）

| ファイル                                                  | 修正箇所 |
| --------------------------------------------------------- | -------- |
| `src/app/(main)/home/page.tsx`                            | 3箇所    |
| `src/app/(main)/hedgehogs/[id]/edit/page.tsx`             | 2箇所    |
| `src/app/(main)/hedgehogs/actions.ts`                     | 4箇所    |
| `src/app/(main)/hedgehogs/new/page.tsx`                   | コメント |
| `src/app/(main)/records/page.tsx`                         | 2箇所    |
| `src/app/(main)/records/history/page.tsx`                 | 1箇所    |
| `src/app/(main)/records/history/history-client.tsx`       | 1箇所    |
| `src/app/(main)/records/[id]/entry/record-entry-form.tsx` | 3箇所    |
| `src/app/(main)/hospital/entry/hospital-visit-form.tsx`   | 2箇所    |
| `src/app/(main)/hospital/actions.ts`                      | 1箇所    |
| `src/app/onboarding/profile/page.tsx`                     | 2箇所    |
| `src/components/hedgehogs/hedgehog-form.tsx`              | 1箇所    |
| `src/components/hedgehogs/hedgehog-switcher.tsx`          | 1箇所    |
| `src/components/records/records-container.tsx`            | 1箇所    |
| `src/components/layout/header.tsx`                        | 1箇所    |

---

## 参照ガイドライン

`Docs/Design/ui_design_guide.md` より：

> - **専門用語を避ける**: 「バイタル」「排泄」などの硬い言葉より、「体重」「うんち・おしっこ」など、日常会話に近い言葉を選ぶ
> - **個体名で呼ぶ**: システムメッセージで「ペット」や「個体」ではなく、登録された「お名前」を使用する

---

## 備考

- **Admin画面** (`src/app/admin/`) の「個体情報」表記は、管理者向け機能のため変更対象外としました
- **エラーメッセージ**（「〜に失敗しました」）の改善は今回の対象外

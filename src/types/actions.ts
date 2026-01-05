/**
 * Server Actions の共通レスポンス型
 * @template T 成功時のデータ型 (デフォルトは null)
 */
export type ActionResponse<T = null> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string; // 本来的には ErrorCodeType だが、既存コードとの互換性のため string も許容しつつ、実装時は定数使用を推奨
    message?: string; // 開発者用またはフォールバック用のメッセージ
    meta?: Record<string, unknown>;
  };
};

/**
 * Server Actions の共通レスポンス型
 * @template T 成功時のデータ型 (デフォルトは null)
 */
export type ActionResponse<T = null> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message?: string; // 開発者用またはフォールバック用のメッセージ
    meta?: Record<string, unknown>;
  };
};

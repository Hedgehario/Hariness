// 選択中のハリネズミIDをCookieで管理するユーティリティ

const COOKIE_NAME = 'activeHedgehogId';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1年

/**
 * クライアント側: 選択中のハリネズミIDをCookieに保存
 */
export function setActiveHedgehogId(hedgehogId: string): void {
  document.cookie = `${COOKIE_NAME}=${hedgehogId}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * クライアント側: Cookieから選択中のハリネズミIDを取得
 */
export function getActiveHedgehogIdFromClient(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

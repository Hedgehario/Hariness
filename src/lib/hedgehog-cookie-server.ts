import { cookies } from 'next/headers';

const COOKIE_NAME = 'activeHedgehogId';

/**
 * サーバー側: Cookieから選択中のハリネズミIDを取得
 */
export async function getActiveHedgehogIdFromServer(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

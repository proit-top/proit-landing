type ResponseData = { ok?: boolean; reply?: string; conversationId?: string };
export async function postJSON(endpoint: string, payload: unknown): Promise<ResponseData> {
  if (!endpoint) throw new Error('unavailable');
  const url = new URL(endpoint, window.location.origin);
  if (url.origin !== window.location.origin && url.protocol !== 'https:') throw new Error('unavailable');
  if (url.username || url.password) throw new Error('unavailable');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', body: JSON.stringify(payload), signal: controller.signal });
    if (!response.ok) throw new Error('request');
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('invalid');
    const data = await response.json();
    if (!data || typeof data !== 'object') throw new Error('invalid');
    return data;
  } finally { clearTimeout(timer); }
}
export function friendlyError(error: unknown): string {
  if (error instanceof Error && error.message === 'unavailable') return 'Отправка пока недоступна. Данные не отправлены.';
  if (error instanceof Error && error.name === 'AbortError') return 'Сервис не ответил вовремя. Отправка не подтверждена. Попробуйте позже.';
  return 'Не удалось подтвердить отправку. Текст сохранён в форме. Попробуйте позже.';
}

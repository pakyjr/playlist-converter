export function addQueryStringToURL(url: string | undefined, params: Record<string, string | number | boolean>): string {
  const queryParams = new URLSearchParams();

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      queryParams.append(key, params[key].toString());
    }
  }

  if (url) return `${url}?${queryParams.toString()}`
  return `?${queryParams.toString()}`
}

export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let char of characters) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
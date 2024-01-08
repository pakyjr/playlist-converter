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
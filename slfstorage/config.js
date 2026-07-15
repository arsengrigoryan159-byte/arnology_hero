/**
 * Accept only owner-supplied, absolute HTTPS destinations.
 * @param {unknown} value
 * @returns {string | null}
 */
export function validateExternalUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

const environment = import.meta.env ?? {};

export const externalLinks = Object.freeze({
  app: validateExternalUrl(environment.NEXT_PUBLIC_APP_URL)
});

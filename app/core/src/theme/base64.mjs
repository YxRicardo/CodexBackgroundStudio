// Scan in constant stack space. Repeated regex groups overflow V8's regexp
// stack on multi-megabyte images even when the Base64 is valid.
export function isValidBase64(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length % 4 !== 0) return false;
  let end = value.length;
  if (value.charCodeAt(end - 1) === 61) end--;
  if (value.charCodeAt(end - 1) === 61) end--;
  for (let i = 0; i < end; i++) {
    const c = value.charCodeAt(i);
    if (!((c >= 65 && c <= 90) || (c >= 97 && c <= 122) ||
      (c >= 48 && c <= 57) || c === 43 || c === 47)) return false;
  }
  return true;
}

export function searchObject(obj, key) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key];
  }
  for (const prop in obj) {
    if (typeof obj[prop] === 'object') {
      const result = searchObject(obj[prop], key);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}

/**
 * Create an object composed of the picked object properties
 * @param {number} number
 * @param {number} places
 * @returns {number|null}
 */
const trunc = (num: number, places: number): string | null => {
  const _num = num;
  const with2Decimals = _num?.toString()?.match(`^-?\\d+(?:\\.\\d{0,${places}})?`);
  return with2Decimals ? parseFloat(with2Decimals[0]).toFixed(places) : null;
};

export default trunc;

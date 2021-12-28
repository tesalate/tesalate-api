/**
 * Create an object composed of the picked object properties
 * @param {number} number
 * @param {number} places
 * @returns {number}
 */
const trunc = (number, places) => {
  const num = number;
  const with2Decimals = num.toString().match(`^-?\\d+(?:\\.\\d{0,${places}})?`)[0];
  return parseFloat(with2Decimals).toFixed(places);
};

module.exports = trunc;

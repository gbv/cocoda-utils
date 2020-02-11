/**
 * Generates a random ID.
 */
function generateID() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// adapted from: https://stackoverflow.com/a/22429679/11050851
function hash(str) {
  var FNV1_32A_INIT = 0x811c9dc5
  var hval = FNV1_32A_INIT
  for ( var i = 0; i < str.length; ++i )
  {
    hval ^= str.charCodeAt(i)
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24)
  }
  return ("0000000" + (hval >>> 0).toString(16)).substr(-8)
}

/**
 * Converts a date string to a localized date string.
 *
 * @param {string} dateString a date string (compatible with new Date())
 * @param {boolean} onlyDate if true, the time will be omitted
 */
function dateToString(dateString, onlyDate = false) {
  let date = new Date(dateString)
  let optionsDate = { year: "numeric", month: "short", day: "numeric" }
  let options = Object.assign({ hour: "2-digit", minute: "2-digit", second: "2-digit" }, optionsDate)
  if (date instanceof Date && !isNaN(date)) {
    return onlyDate ? date.toLocaleDateString(undefined, optionsDate) : date.toLocaleString(undefined, options)
  } else {
    return "?"
  }
}

// Create utils singleton, freeze object, and export
const utils = {
  generateID,
  hash,
  dateToString,
}
Object.freeze(utils)
module.exports = utils

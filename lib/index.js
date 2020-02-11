const _ = {
  get: require("lodash/get"),
  isString: require("lodash/isString"),
}

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

/**
 * Returns whether a registry has stored mappings (database) or not (recommendations).
 *
 * @param {object} registry JSKOS registry
 */
function registryStored(registry) {
  const defaultValue = false
  if (!registry) {
    return defaultValue
  }
  if (registry.stored != null) {
    return registry.stored
  }
  let provider = registry.provider
  // If available, use default stored value of provider
  if (provider && provider.constructor && provider.constructor.stored != null) {
    return provider.constructor.stored
  }
  return defaultValue
}

/**
 * Returns the creator URI for an annotation.
 *
 * Use via `annotationsHelper.creatorUri`.
 *
 * @param {object} annotation a JSKOS annotation
 */
function _annotationsHelperCreatorUri(annotation) {
  if (_.isString(annotation.creator)) {
    return annotation.creator
  }
  return annotation.creator && annotation.creator.id
}

/**
 * Returns the craetor name for an annotation.
 *
 * Use via `annotationsHelper.creatorName`.
 *
 * @param {object} annotation a JSKOS annotation
 */
function _annotationsHelperCreatorName(annotation) {
  return _.get(annotation, "creator.name") || ""
}

/**
 * Checks if any of the user URIs matches the annotation's creator URI.
 *
 * Use via `annotationsHelper.creatorMatches`.
 *
 * @param {object} annotation a JSKOS annotation
 * @param {array} uris array of user URIs
 */
function _annotationsHelperCreatorMatches(annotation, uris) {
  return !!(annotation && _.isString(annotation.creator) ? uris && uris.includes(annotation.creator) : uris && annotation.creator && uris.includes(annotation.creator.id))
}

// Create utils singleton, freeze object, and export
const utils = {
  generateID,
  hash,
  dateToString,
  registryStored,
  annotationsHelper: {
    creatorUri: _annotationsHelperCreatorUri,
    creatorName: _annotationsHelperCreatorName,
    creatorMatches: _annotationsHelperCreatorMatches,
  },
}
Object.freeze(utils)
module.exports = utils

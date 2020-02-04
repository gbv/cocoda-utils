const jskos = require("jskos-tools")
const _ = {
  get: require("lodash/get"),
  isString: require("lodash/isString"),
}

/**
 * options that are used in some of utils' methods.
 *
 * Set these with `setOption` and `getOption`.
 *
 * options can have the following properties:
 * - store: a reference to a Vuex store
 * - storePath: necessary for store - the path to the "languages" array in the store
 * - languages: an array for default languages (default: ["en"])
 *
 * Note about reactivity:
 * Reactivity with `prefLabel` and the like can be achieved by passing over the `store` reference with a `storePath` to the languages array. Alternatively, if the `languages` array is reactive (i.e. part of the store or data of a Vue component) AND only gets modified in-place (!), reactivity will be ensured as well.
 */
const options = {
  store: null,
  storePath: "",
  languages: ["en"],
}

/**
 * Method to update an option.
 *
 * @param {string} option name of the option (e.g. "store")
 * @param {*} value new value of the option (type depends on option)
 */
function setOption(option, value) {
  options[option] = value
}

/**
 * Method to return the value of an option.
 *
 * @param {string} option name of the option (e.g. "store")
 */
function getOption(option) {
  return options[option]
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
 * Returns the primary notation for a JSKOS Item. If there is no notation, it will return an empty string.
 * Scheme notations will be uppercased.
 *
 * @param {object} item a JSKOS Item
 * @param {string} type type of item (optional)
 * @param {boolean} adjust whether to adjust the notation according to certain rules (returns a HTML string!) (default: false)
 */
function notation(item, type, adjust = false) {
  let notation
  if (item && item.notation && item.notation.length) {
    notation = item.notation[0]
    if (jskos.isScheme(item) || type == "scheme") {
      notation = notation.toUpperCase()
    }
  } else if (item && item.inScheme && item.inScheme[0] && item.uri) {
    // Try to imply notation from scheme and concept URI
    const scheme = new jskos.ConceptScheme(item && item.inScheme && item.inScheme[0])
    notation = scheme.notationFromUri(item.uri)
  }
  if (!notation) {
    return ""
  }
  // Adjust notation for certain concept schemes -> return HTML as well
  if (adjust) {
    let fill = ""
    // For DDC only: fill notation with trailing zeros
    if (jskos.compare({
      uri : "http://dewey.info/scheme/edition/e23/",
      identifier : [
        "http://bartoc.org/en/node/241",
      ],
    }, _.get(item, "inScheme[0]"))) {
      while (notation.length + fill.length < 3) {
        fill += "0"
      }
    }
    if (fill.length) {
      notation += `<span class='notation-fill text-mediumLightGrey'>${fill}</span>`
    }
  }
  return notation
}

/**
 * Returns a language tag to be used for a language map, null if no language was found in the map.
 *
 * @param {*} languageMap
 * @param {*} language
 * @param {object} options with property `languages` (array of language tags)
 */
function getLanguage(languageMap, language, { languages } = {}) {
  languages = languages || _.get(options.store, options.storePath) || options.languages
  if (!languageMap) {
    return null
  }
  languages = [language].concat(languages)
  for (let language of languages) {
    if (languageMap[language]) {
      return language
    }
  }
  // Fallback for the fallback: iterate through languages and choose the first one found.
  for (let language of Object.keys(languageMap)) {
    if (language != "-") {
      return language
    }
  }
  return null
}

/**
 * Returns the content of a language map for a JSKOS Item.
 *
 * @param {*} item a JSKOS Item
 * @param {string} prop property of interest in the item
 * @param {object} options options object:
 * - `language`: preferred language
 * - will also be passed through to `getLanguages`
 */
function languageMapContent(item, prop, _options = {}) {
  let language = _options && _options.language
  if(!item) {
    return null
  }
  let object
  if (prop) {
    object = item[prop]
  } else {
    object = item
  }
  if (object) {
    language = options.getLanguage(object, language, _options)
    if (language) {
      return object[language]
    }
  }
  return null
}

/**
 * Returns the prefLabel of a JSKOS Item. If there is no label, it will return the URI. If there is no URI, it will return an empty string.
 *
 * For parameters, see also `languageMapContent`.
 *
 * @param {*} item
 * @param {*} language
 * @param {object} options options object:
 * - `fallbackToUri`: return URI if no prefLabel can be found
 * - `language`: preferred language
 * - will also be passed through to `languageMapContent`
 */
function prefLabel(item, _options = {}) {
  let fallbackToUri = _options.fallbackToUri == null ? true : _options.fallbackToUri
  let content = options.languageMapContent(item, "prefLabel", _options)
  if (content) {
    return content
  }
  if (fallbackToUri && item && item.uri) {
    return item.uri
  }
  return ""
}

/**
 * Returns the definition of a JSKOS Item as an array. If there is no definition, an empty array will be returned.
 *
 * @param {*} item
 * @param {object} options options object:
 * - `language`: preferred language
 * - will also be passed through to `languageMapContent`
 */
function definition(item, _options = {}) {
  let content = options.languageMapContent(item, "definition", _options)
  if (!content) {
    return []
  }
  if (_.isString(content)) {
    content = [content]
  }
  return content
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
  setOption,
  getOption,
  generateID,
  hash,
  notation,
  getLanguage,
  languageMapContent,
  prefLabel,
  definition,
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

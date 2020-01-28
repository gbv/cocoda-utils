const jskos = require("jskos-tools")
const _ = {
  get: require("lodash/get"),
  isString: require("lodash/isString"),
}
const defaultLanguages = ["en", "de"]

class CocodaUtils {

  /**
   * Constructor for a new CocodaUtils instance.
   *
   * @param {object} options
   *
   * options can have the following properties:
   * - delay: an object with properties "short", "medium", "long", whose values are objects with properties "show" and "hide" (both integer)
   * - licenseBadges: an object with license URIs as keys and badge image URLs as values
   *
   */
  constructor({ delay, licenseBadges } = {}) {
    this.delay = delay || {
      short: { show: 250, hide: 0 },
      medium: { show: 500, hide: 0 },
      long: { show: 1000, hide: 0 },
    }
    this.licenseBadges = licenseBadges || {
      "http://creativecommons.org/publicdomain/zero/1.0/": "https://mirrors.creativecommons.org/presskit/buttons/80x15/svg/cc-zero.svg",
      "http://creativecommons.org/licenses/by/3.0/": "https://mirrors.creativecommons.org/presskit/buttons/80x15/svg/by.svg",
      "http://creativecommons.org/licenses/by-nc-nd/3.0/": "https://mirrors.creativecommons.org/presskit/buttons/80x15/svg/by-nc-nd.svg",
      "http://creativecommons.org/licenses/by-nc-nd/4.0/": "https://mirrors.creativecommons.org/presskit/buttons/80x15/svg/by-nc-nd.svg",
      "http://creativecommons.org/licenses/by-nc-sa/4.0/": "https://mirrors.creativecommons.org/presskit/buttons/80x15/svg/by-nc-sa.svg",
      "http://creativecommons.org/licenses/by-sa/4.0/": "https://mirrors.creativecommons.org/presskit/buttons/80x15/svg/by-sa.svg",
      "http://opendatacommons.org/licenses/odbl/1.0/": "https://img.shields.io/badge/License-ODbL-lightgrey.svg",
      "http://www.wtfpl.net/": "https://img.shields.io/badge/License-WTFPL-lightgrey.svg",
    }
    // Annotations Helper
    this.annotationsHelper = {
      creatorUri: this._annotationsHelperCreatorUri,
      creatorName: this._annotationsHelperCreatorName,
      creatorMatches: this._annotationsHelperCreatorMatches,
    }
  }

  /**
   * Method to update an option.
   *
   * @param {string} value name of the option (e.g. "delay")
   * @param {*} option new value of the option (type depends on option)
   */
  setOption(option, value) {
    this[option] = value
  }

  /**
   * Method to return the value of an option.
   *
   * @param {string} option name of the option (e.g. "delay")
   */
  getOption(option) {
    return this[option]
  }

  // from https://www.sanwebe.com/2014/04/select-all-text-in-element-on-click
  selectText(el) {
    var sel, range
    if (window.getSelection && document.createRange) {
      sel = window.getSelection()
      if(sel.toString() == "") {
        range = document.createRange()
        range.selectNodeContents(el)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    } else if (document.selection) {
      sel = document.selection.createRange()
      if(sel.text == "") {
        range = document.body.createTextRange()
        range.moveToElementText(el)
        range.select()
      }
    }
  }

  /**
   * Determines whether a concept can be selected depending on the currently selected scheme.
   *
   * @param {object} concept JSKOS concept to be selected
   * @param {object} scheme JSKOS scheme that is currently selected
   */
  canConceptBeSelected(concept, scheme) {
    if (!concept.inScheme || concept.inScheme.length == 0) {
      return false
    }
    let conceptScheme = concept.inScheme[0]
    return scheme == null || jskos.compare(conceptScheme, scheme)
  }

  /**
   * Synchronizes scrolling of header and body in all default tables.
   */
  setupTableScrollSync() {
    let tables = document.getElementsByClassName("table")
    for (let table of tables) {
      let thead = table.getElementsByTagName("thead")[0]
      let tbody = table.getElementsByTagName("tbody")[0]
      tbody.onscroll = () => {
        thead.scrollLeft = tbody.scrollLeft
      }
    }
  }

  /**
   * Generates a random ID.
   */
  generateID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // adapted from: https://stackoverflow.com/a/22429679/11050851
  hash(str) {
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
  notation(item, type, adjust = false) {
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
  getLanguage(languageMap, language, { languages = defaultLanguages }) {
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
   * @param {*} language a language tag, will default to the one in config, then English, then whatever other language is available.
   * @param {object} options options object (will be passed through to getLanguage)
   */
  lmContent(item, prop, language, options) {
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
      language = this.getLanguage(object, language, options)
      if (language) {
        return object[language]
      }
    }
    return null
  }

  /**
   * Returns the prefLabel of a JSKOS Item. If there is no label, it will return the URI. If there is no URI, it will return an empty string.
   *
   * For parameters, see also `lmContent`.
   *
   * @param {*} item
   * @param {*} language
   * @param {object} options options object (property `fallbackToUri`: return URI if no prefLabel can be found, will be passed through to `lmContent`)
   */
  prefLabel(item, language, options = {}) {
    let fallbackToUri = options.fallbackToUri == null ? true : options.fallbackToUri
    let content = this.lmContent(item, "prefLabel", language, options)
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
   * @param {*} language
   * @param {object} options options object (will be passed through to `lmContent`)
   */
  definition(item, language, options) {
    let content = this.lmContent(item, "definition", language, options)
    if (!content) {
      return []
    }
    if (_.isString(content)) {
      content = [content]
    }
    return content
  }

  /**
   * Adds an endpoint to a base URL.
   *
   * @param {string} url base URL
   * @param {string} endpoint name of endpoint
   */
  addEndpoint(url, endpoint) {
    if (url.slice(-1) == "/") {
      url = url.slice(0, -1)
    }
    if (endpoint[0] == "/") {
      endpoint = endpoint.substring(1)
    }
    return url + "/" + endpoint
  }

  /**
   * Converts a date string to a localized date string.
   *
   * @param {string} dateString a date string (compatible with new Date())
   * @param {boolean} onlyDate if true, the time will be omitted
   */
  dateToString(dateString, onlyDate = false) {
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
  registryStored(registry) {
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
   * Returns `true` if the user owns the mapping (i.e. is first creator), `false` if not.
   *
   * @param {*} user a login-server compatible user object
   * @param {*} mapping a JSKOS mapping
   */
  userOwnsMapping(user, mapping) {
    if (!user || !mapping) {
      return false
    }
    return [user.uri].concat(Object.values(user.identities || {}).map(identity => identity.uri)).filter(uri => uri != null).includes(_.get(mapping, "creator[0].uri"))
  }

  /**
   * Returns the creator URI for an annotation.
   *
   * Use via `annotationsHelper.creatorUri`.
   *
   * @param {object} annotation a JSKOS annotation
   */
  _annotationsHelperCreatorUri(annotation) {
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
  _annotationsHelperCreatorName(annotation) {
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
  _annotationsHelperCreatorMatches(annotation, uris) {
    return !!(annotation && _.isString(annotation.creator) ? uris && uris.includes(annotation.creator) : uris && annotation.creator && uris.includes(annotation.creator.id))
  }

}

module.exports = CocodaUtils

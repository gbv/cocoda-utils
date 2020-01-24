class CocodaUtils {

  /**
   * Constructor for a new CocodaUtils instance.
   *
   * @param {object} options
   *
   * options can have the following properties:
   * - langauges: an array of language codes in order of priorities (default ["en"])
   *
   */
  constructor({ languages } = {}) {
    this.languages = languages || ["en"]
  }

  /**
   * Method to update an option.
   *
   * @param {string} value name of the option (e.g. "languages")
   * @param {*} option new value of the option (type depends on option)
   */
  setOption(option, value) {
    this[option] = value
  }

  /**
   * Method to return the value of an option.
   *
   * @param {string} option name of the option (e.g. "languages")
   */
  getOption(option) {
    return this[option]
  }

}

module.exports = CocodaUtils

const assert = require("assert")
const CocodaUtils = require("../")

describe("Basic Mocha String Test", () => {

  it("should initialize a CocodaUtils instance without options", () => {
    const utils = new CocodaUtils()
    assert.equal(utils instanceof CocodaUtils, true, "initialized object is not instance of CocodaUtils")
  })

  it("should have a default values for options", () => {
    const utils = new CocodaUtils()
    assert(Array.isArray(utils.getOption("languages")), "default value for 'languages' is not an array")
  })

  it("should be able to set an option", () => {
    const utils = new CocodaUtils()
    const option = "languages"
    const newValue = ["de", "en", "fr"]
    utils.setOption(option, newValue)
    assert.deepEqual(newValue, utils.getOption(option), "value for option was net set properly")
  })

})

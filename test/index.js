const assert = require("assert")
const CocodaUtils = require("../")

describe("Initialization", () => {

  it("should initialize a CocodaUtils instance without options", () => {
    const utils = new CocodaUtils()
    assert.equal(utils instanceof CocodaUtils, true, "initialized object is not instance of CocodaUtils")
  })

  it("should have a default values for options", () => {
    const utils = new CocodaUtils()
    assert(typeof utils.getOption("delay") === "object", "default value for 'delay' is not an object")
    assert(typeof utils.getOption("licenseBadges") === "object", "default value for 'licenseBadges' is not an object")
  })

  it("should be able to set an option", () => {
    const utils = new CocodaUtils()
    const option = "delay"
    const newValue = { test: 1 }
    utils.setOption(option, newValue)
    assert.deepEqual(newValue, utils.getOption(option), "value for option was net set properly")
  })

})

describe("annotationsHelper", () => {

  it("should return the correct annotation creator URI", () => {
    const utils = new CocodaUtils()
    const tests = [
      {
        annotation: {},
        creatorUri: null,
      },
      {
        annotation: {
          creator: "test:blubb",
        },
        creatorUri: "test:blubb",
      },
      {
        annotation: {
          creator: {
            id: "test:blubb2",
            name: "test",
          },
        },
        creatorUri: "test:blubb2",
      },
    ]
    for (let test of tests) {
      const creatorUri = utils.annotationsHelper.creatorUri(test.annotation)
      assert.equal(creatorUri, test.creatorUri, `did not return the expected creator URI (expected: ${test.creatorUri}, actual: ${creatorUri})`)
    }
  })

  it("should return the correct annotation creator name", () => {
    const utils = new CocodaUtils()
    const tests = [
      {
        annotation: {},
        creatorName: "",
      },
      {
        annotation: {
          creator: "test:blubb",
        },
        creatorName: "",
      },
      {
        annotation: {
          creator: {
            id: "test:blubb2",
            name: "test",
          },
        },
        creatorName: "test",
      },
    ]
    for (let test of tests) {
      const creatorName = utils.annotationsHelper.creatorName(test.annotation)
      assert.equal(creatorName, test.creatorName, `did not return the expected creator name (expected: ${test.creatorName}, actual: ${creatorName})`)
    }
  })

  it("should correctly match annotation creator URI", () => {
    const utils = new CocodaUtils()
    const tests = [
      {
        annotation: {},
        uris: ["test:blubb"],
        result: false,
      },
      {
        annotation: {
          creator: "test:blubb",
        },
        uris: ["test:blubb2"],
        result: false,
      },
      {
        annotation: {
          creator: "test:blubb",
        },
        uris: ["test:blubb"],
        result: true,
      },
      {
        annotation: {
          creator: {
            id: "test:blubb",
            name: "test",
          },
        },
        uris: ["test:blubb2"],
        result: false,
      },
      {
        annotation: {
          creator: {
            id: "test:blubb2",
            name: "test",
          },
        },
        uris: ["test:blubb2"],
        result: true,
      },
    ]
    for (let test of tests) {
      const result = utils.annotationsHelper.creatorMatches(test.annotation, test.uris)
      assert.equal(result, test.result, `did not return the expected creator URI (expected: ${test.result}, actual: ${result})`)
    }
  })

})

/**
 * TODO:
 * - canConceptBeSelected
 * - generateID
 * - hash
 * - notation
 * - getLanguage
 * - lmContent
 * - prefLabel
 * - definition
 * - addEndpoint
 * - dateToString
 * - annotations (helpers)
 * - registryStored
 * - userOwnsMapping
 */

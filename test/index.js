const assert = require("assert")
const utils = require("../")

describe("Initialization", () => {

  it("should have default options", () => {
    assert.deepEqual(utils.getOption("languages"), ["en"], "Default for option `languages` not set properly.")
  })

  it("should be able to set an option", () => {
    const option = "state"
    const newValue = { test: 1 }
    utils.setOption(option, newValue)
    assert.deepEqual(newValue, utils.getOption(option), "value for option was net set properly")
  })

})

describe("annotationsHelper", () => {

  it("should return the correct annotation creator URI", () => {
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
 * - generateID
 * - hash
 * - notation
 * - getLanguage
 * - languageMapContent
 * - prefLabel
 * - definition
 * - dateToString
 * - registryStored
 * - reactivity via store or languages array
 */

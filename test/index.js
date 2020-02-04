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

describe("generateID", () => {

  it("should generate 5000 different random IDs", () => {
    let ids = []
    for (let i = 0; i < 5000; i += 1) {
      let id = utils.generateID()
      assert.ok(!ids.includes(id), "Generated ID should not exist yet")
      assert.ok(id.length >= 18 && id.length <= 25, `Length of ID ${id} not in expected range (expected: between 18 and 25, actual: ${id.length})`)
      ids.push(id)
    }
  })

})

describe("hash", () => {

  it("should generate the same hash for different calls with the same string", () => {
    const hash1 = utils.hash("hello world")
    const hash2 = utils.hash("hello world")
    assert.equal(hash1, hash2, `Hash values should be equal: ${hash1} and ${hash2}`)
  })

  it("should generate two different hashes for two different values", () => {
    const hash1 = utils.hash("hello world")
    const hash2 = utils.hash("hello wolrd")
    assert.notEqual(hash1, hash2, `Hash values should not be equal: ${hash1} and ${hash2}`)
  })

})

describe("notation", () => {

  it("should return the first notation of an item", () => {
    let test = {
      notation: ["1", "2"],
    }
    let notation = utils.notation(test)
    assert.equal(notation, test.notation[0], `Did not return the first notation (expected: ${test.notation[0]}, actual: ${notation})`)
  })

  it("should uppercase the notation for a concept scheme", () => {
    let test1 = {
      notation: ["test"],
    }
    let notation1 = utils.notation(test1, "scheme")
    assert.equal(notation1, test1.notation[0].toUpperCase(), `Notation for scheme should be uppercased: ${notation1}`)

    let test2 = {
      notation: ["test"],
      type: ["http://www.w3.org/2004/02/skos/core#ConceptScheme"],
    }
    let notation2 = utils.notation(test2)
    assert.equal(notation2, test2.notation[0].toUpperCase(), `Notation for scheme should be uppercased: ${notation2}`)
  })

})

describe("prefLabel", () => {

  const test = {
    prefLabel: {
      en: "English label",
      de: "German label",
    },
  }

  it("should return the English label by default", () => {
    assert.equal(utils.prefLabel(test), test.prefLabel.en, "Did not return the expected English label")
  })

  it("should return the German label when providing a preferred language", () => {
    assert.equal(utils.prefLabel(test, { language: "de" }), test.prefLabel.de, "Did not return the expected German label")
  })

  it("should return the German label after setting option", () => {
    utils.setOption("languages", ["de"])
    assert.equal(utils.prefLabel(test), test.prefLabel.de, "Did not return the expected German label")
    // Reset option after test
    utils.setOption("languages", ["en"])
  })

  it("should correctly handle fallbackToUri option", () => {
    // Item without prefLabel
    const test = {
      uri: "test:hello",
    }
    assert.equal(utils.prefLabel(test), test.uri, "Did not fall back to URI as expected")
    assert.equal(utils.prefLabel(test, { fallbackToUri: false }), "", "Did not respect fallbackToUri option")
  })

})

/**
 * TODO:
 * - getLanguage
 * - languageMapContent
 * - definition
 * - dateToString
 * - registryStored
 */

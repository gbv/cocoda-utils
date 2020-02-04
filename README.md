# Cocoda Utilities

[![Build Status](https://travis-ci.com/gbv/cocoda-utils.svg?branch=master)](https://travis-ci.com/gbv/cocoda-utils)
[![GitHub package version](https://img.shields.io/github/package-json/v/gbv/cocoda-utils.svg?label=version)](https://github.com/gbv/cocoda-utils)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)

> Utilities package for [Cocoda](https://github.com/gbv/cocoda)

**Note: This is currently evolving and methods can be removed or changed without notice! If you're not prepared for that, please wait until version 1.0.0.**

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install

```bash
npm i gbv/cocoda-utils
```

We suggest to install it referring to a certain commit and updating only after making sure that everything works (at least until version 1.0.0 is released):

```bash
npm i gbv/cocoda-utils#abc1def
```

**Note:** Replace the commit hash with the desired commit.

## Usage

### Import

`cocoda-utils` exports a singleton, that means that the same object is used anywhere in a project where `cocoda-utils` is imported.

```js
const utils = require("cocoda-utils")
```

Before going further, it is necessary to explain that some of the methods in `cocoda-utils` are language-dependent, which means that if your application supports more than one interface language and the user can possibly switch between these languages, it is necessary to provide a reference either to a reactive `languages` array or to a Vuex store and a path where in the store the `languages` array is.

The `languages` array is just an array of language tags that can occur in [JSKOS language maps](https://gbv.github.io/jskos/jskos.html#language-map), e.g. `["de","en","fr"]`. These languages are used in order of priority.

With [`setOption`](#setoption), the following possible options can be set:
- `store`: reference to a Vuex store where the `language` array resides in (requires `storePath` to work)
- `storePath`: the path in the `store` where the `language` array is (e.g. `"state.langauges"`)
- `languages`: direct reference to an array of languages (see above)

If none of these are set, `["en"]` will be used as default. This means that if there's no English tag available, it will use any other language it can find to return, for example, the `prefLabel` of a JSKOS item. The Vuex store is used over the direct `languages` array.

Note: If `languages` is given and reactivity is required, make sure to modify the array in-place only! Otherwise `cocoda-utils` will still have the old reference to the array.

Note: In theory, `store` doesn't HAVE to be a Vuex store. It could be any kind of object which contains the `languages` array somewhere.

### Methods

#### setOption

Sets one of the options (see [Import](#import)).

```js
utils.setOption("languages", ["de", "en", "fr"])
```

#### getOption

Returns the value of one of the options (see [Import](#import)).

```js
const languages = utils.getOption("languages")
```

#### generateID

Generates a random ID (length between 19 and 22 characters).

```js
const id = utils.generateID() // e.g. "r9fh5pru3x866bihfhy14r"
```

#### hash

Generates a hash value for a string (adapted from [here](https://stackoverflow.com/a/22429679/11050851)).

```js
const hash = utils.hash("hello world") // e.g. "d58b3fa7"
```

#### notation

Returns the notation of a JSKOS item.

```js
// First parameter: JSKOS item
const notation1 = utils.notation(item1) // e.g. "612.112"
// Second parameter: JSKOS type (optional, only necessary for "scheme" if `jskos.isScheme` can't determine the type)
const notation2 = utils.notation(item2, "scheme") // e.g. "DDC"
// Third parameter: adjust (default: false) - this will (currently) adjust DDC concept notations and returns a HTML string!
const notation3 = utils.notation(item3, null, true) // e.g. "1<span class='notation-fill text-mediumLightGrey'>00</span>"
```

#### getLanguage

Returns a valid language tag in a JSKOS language-map. Mostly used by `languageMapContent`, but can be used by itself.

```js
const language = utils.getLanguage(someLanguageMap, preferredLanguage, options)
// someLanguageMap: a JSKOS language map (e.g. `item.prefLabel`)
// preferredLanguage: a preferred language tag (e.g. `"de"`)
// options: an options object, currently supports `languages` to override the priority order for languages used
```

#### languageMapContent

Returns the content of a language-map property of a JSKOS item, using the `languages` priority list. Mostly used by `prefLabel` and `definition`, but can be used by itself for other language maps.

```js
const content = utils.languageMapContent(item, prop, options)
// item: a JSKOS item
// property: a property in the JSKOS item the refers to a language map
// options: an options object that 1. is forwarded to `getLanguage`, and 2. supports the `language` property for a preferred language
```

#### prefLabel

Returns the prefLabel of a JSKOS item according to the language priority list.

```js
const prefLabel = utils.prefLabel(item, options)
// item: a JSKOS item
// options: supports all options of `languageMapContent`, additionally supports the option `fallbackToUri` (default: `true`)
```

#### definition

Returns the definition of a JSKOS item according to the language priority list. Returns an array!

```js
const prefLabel = utils.definition(item, options)
// item:  JSKOS item
// options: supports all options of `languageMapContent`
```

#### dateToString

Converts a date string to a localized date string.

```js
const dateString = utils.dateToString(dateString, onlyDate)
// dateString: a date string (compatible with new Date())
// onlyDate: if true, the time will be omitted (default: false)
```

#### registryStored

Returns whether a registry has stored mappings (database) or not (recommendations).

```js
const stored = utils.registryStored(registry)
// registry: a JSKOS registry
```

#### annotationsHelper.creatorUri

Returns the creator URI for an annotation.

```js
const creatorUri = utils.annotationsHelper.creatorUri(annotation)
```

#### annotationsHelper.creatorName

Returns the craetor name for an annotation.

```js
const creatorName = utils.annotationsHelper.creatorName(annotation)
```

#### annotationsHelper.creatorMatches

Checks if any of the user URIs matches the annotation's creator URI.

```js
const matches = utils.annotationsHelper.creatorMatches(annotation, listOfUris)
```

## Maintainers

- [@stefandesu](https://github.com/stefandesu)
- [@nichtich](https://github.com/nichtich)

## Contribute

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT Copyright (c) 2020 Verbundzentrale des GBV (VZG)

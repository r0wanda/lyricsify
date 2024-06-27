# Lyricsify

### Fork of [lrc-spider](https://www.npmjs.com/package/lrc-spider)

List of changes:
- Uses git (lrc-spider has no repo)
- Exports type declarations
- Replaces [axios](https://github.com/axios/axios) and [node-html-parser](https://github.com/taoqf/node-html-parser) with [got](https://github.com/sindresorhus/got) and [cheerio](https://github.com/cheeriojs/cheerio)
- Other small changes
    - TS-specific `private` keyword changed to JS `#` functions
    - Refactor repeated code
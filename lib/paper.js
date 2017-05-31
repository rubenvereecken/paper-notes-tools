

class Paper {
  constructor(obj) {
    Object.assign(this, obj)
  }

  get sanitizedTitle() {
    let cleanPaperTitle = this.title.match(/[a-zA-Z0-9]+/g).join('_')
    return cleanPaperTitle
  }

  get filename() {
    let cleanPaperTitle = this.sanitizedTitle;
    let year = this.dateRaw.split('/')[0]
    let firstAuthor = this.authors[0].match(/[a-zA-Z]+/g)[0]
    let paperFilename = [year, firstAuthor, cleanPaperTitle].join('-') + '.md'

    paperFilename = paperFilename.toLowerCase()

    return paperFilename
  }

  get arxivUrl() {
    return 'https://arxiv.org/abs/' + this.arxivId;
  }

  toNotes() {
    let fileContents = [
      '# ' + this.title,
      '',
      this.arxivUrl,
      '\n## TLDR',
      '\n## Notes',
      '\n## Thoughts',
    ].join('\n')

    return fileContents
  }
}


module.exports = Paper

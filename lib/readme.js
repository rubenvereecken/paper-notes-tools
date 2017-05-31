
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const markdown = require('markdown').markdown;
const cheerio = require('cheerio');
const md = require('markdown-it')().use(require('markdown-it-header-sections'))
const toMarkdown = require('to-markdown');


String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
}


class Readme {
  static fromFileAsync(file) {
    return fs.readFileAsync(file, 'utf8').then((body) => {
      return new Readme(body);
    })
  }

  constructor(body) {
    // this.html = markdown.toHTML(body);
    this.html = md.render(body);
    // console.log(this.html);
    this.$ = cheerio.load(this.html);
  }

  addPaper(paper, category) {
    category = category.capitalize();
    let year = paper.dateRaw.split('/')[0]

    let $ = this.$;
    // let $paperSection = $($('section > section').get(0))
    let $paperSection = $($('h2').get(0)).parent()
    let $categorySections = $paperSection.children('section')
    // console.log($categorySections.find('h3').text());
    // console.log($categorySections.find('h3[text="Attention"]').get());
    let $categorySection = null;
    $categorySections.find('h3').each((i, el) => {
      // if ($(el).text() == 'Attention')
      // console.log($(el).text());
      if ($(el).text() == category) {
        $categorySection = $(el).parent();
      }
    })

    console.log($($('h2[text="Papers"]')).length);

    if (!$categorySection) {
      $categorySection = $('<section><h3>' + category.capitalize() + '</h3></section>')
      // $categorySection.appendTo($categorySections)
      $categorySections.parent().append($categorySection)
    }

    let $yearSection = null;
    $categorySection.find('h4').each((i, el) => {
      if ($(el).text() == year) {
        $yearSection = $(el).parent();
      }
    })

    if (!($yearSection)) {
      let $yearTitle = $('<h4>' + year + '</h4>')
      let $paperList = $('<ul></ul>')
      $yearSection = $('<section></section>');
      $yearSection.append($yearTitle)
      $yearSection.append($paperList)
      $categorySection.append($yearSection)
    }

    let $paperList = $yearSection.find('ul')

    let $newPaper = $(
      ['<li>',
      '[ ]',
      paper.title,
      '[<a href="' + category.toLowerCase() + '/' + paper.filename + '">notes</a>]',
      '[<a href="' + paper.arxivUrl + '">arXiv</a>]',
      '</li>'].join(' ')
    )

    $paperList.append($newPaper)

    // console.log(($.html()));
    // console.log(this.toMarkdown());
  }

  toMarkdown() {
    return toMarkdown(this.$.html(), {
      converters: [
        {
          filter: 'section',
          replacement: (content) => content
        }
      ],
    }) + '\n'
  }
};

module.exports = Readme

const _ = require('lodash');
const Promise = require('bluebird');

const Scraper = require('./scraper');
const Paper = require('./paper')


class ArxivScraper extends Scraper {
  scrapePage($) {
    let authors = $('meta[name=citation_author]').map((_, el) => $(el).attr('content')).get()
    let title = $('meta[name=citation_title]').attr('content')
    let dateRaw = $('meta[name=citation_date]').attr('content')
    let arxivId = $('meta[name=citation_arxiv_id]').attr('content')

    return new Paper({
      title, authors, dateRaw, arxivId
    });
  }
}


module.exports = ArxivScraper

const cheerio = require('cheerio');
const request = require('request-promise');
const _ = require('lodash');
const Promise = require('bluebird');
const urll = require('url');

// Bunch of promisified functions
const mkdirp = Promise.promisify(require('mkdirp'));
const fs = Promise.promisifyAll(require('fs'));

const sanitizeFilename = (s) => {
  return s.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
}

// TODO this is not doing what it's supposed to do
request.defaults({
  headers: {
    'User-Agent': 'Your friendly researchers',
  }
})

class Scraper {
  constructor(options={}) {
    this.opt = options;
    _.defaults(this.opt, Scraper.defaults)

    let that = this;
    this.done = new Promise((resolve, reject) => {
      if (that.opt.cache) {
        return mkdirp(that.opt.cacheDir)
          .then(resolve);
      } else {
        resolve();
      }
    });
  }

  static get defaults() {
    return {
      cache: true,
      // TODO change cache dir
      cacheDir: __dirname + '/../cache',
    }
  }


  fetch(url) {
    const that = this;

    return request({
      uri: url,
      headers: {
        'User-Agent': 'ibug.doc.ic.ac.uk',
      },
      transform: (body) => {
        if (that.opt.cache) {
          return that.done.then(() => {
            let filename = that.opt.cacheDir + '/' + sanitizeFilename(url);
            return fs.writeFileAsync(filename, body)
          }).then(() => cheerio.load(body));
        } else
          return cheerio.load(body);
      },
    })
  }

  loadOrFetch(url) {
    const that = this;

    let filename = that.opt.cacheDir + '/' + sanitizeFilename(url);

    return fs.statAsync(filename).then((stats) => {
      if (stats.isFile()) { // cache hit
        // console.log('Cache hit');
        return fs.readFileAsync(filename, 'utf8').then((body) => cheerio.load(body))
      } else { // fetch anew
        throw Error('Wot')
        // return that.fetch(url)
      }
    }).catch((err) => {
      // console.log(err.stack)
      console.log('Cache miss');
      return that.fetch(url);
    })
  }

  scrapeURL(url) {
    const that = this;
    const normalizedUrl = urll.parse(url);

    return (that.opt.cache
      ? that.loadOrFetch(url)
      : that.fetch(url))
    .then(that.scrapePage)
    .catch((err) => {
      console.log('Error for url', url);
      console.log(err.stack);
    })

  }

  scrapePage($) {
    throw Error('Not Implemented. Make sure to implement in subclass.')
  }
}

module.exports = Scraper


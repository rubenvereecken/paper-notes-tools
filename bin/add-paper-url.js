#!/usr/bin/env node

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const mkdirp = Promise.promisify(require('mkdirp'));
// const fs = require('fs');
const path = require('path');
const program = require('commander');
// const pkg = require('./package.json');
const util = require('util');

const ArxivScraper = require('../lib/arxiv.js');
const Readme = require('../lib/readme.js');

const crash = (msg) => {
  console.error(msg);
  process.exit(1)
}

(() => {
  // const package = require('../package.json');
  program
    // .version(pkg.version)
    // .description(pkg.description)
    .arguments('<url>')
    .option('-c, --category <cat>', 'Category to write into')
    .option('--no-category', "Just write to the category 'new'")
    .option('-o, --notes <notes-dir>', 'Base deep learning notes directory')
    .option('--dry', 'Print out results without writing')
    .parse(process.argv);

  const url = program.args[0];

  if (!url) {
    console.error('Supply a URL');
    process.exit(1)
  }

  if (!url.match(/^http/)) {
    console.error('... That\'s not a URL')
    process.exit(1)
  }

  if (!url.match(/arxiv/)) {
    console.error('Supports arXiv links only')
    process.exit(1)
  }

  if (!program.notes) program.notes = '.'
  // console.log(program);
  if (program.category === true) {
    console.log('No category supplied. If you just want to use the default category,');
    console.log('run again with `--no-category`');
    process.exit(1)
  }
  if (program.category === false) {
    console.log('Using the default category');
    program.category = 'new';
  }

  let categoryPath = path.join(program.notes, program.category);
  let mainReadmePath = path.join(program.notes, 'README.md')

  let checkNotesDir = fs.statAsync(program.notes)
    .catch(() => crash('Could not find directory ' + program.notes))
  let checkReadme = fs.statAsync(mainReadmePath)
    .catch(() => crash('Could not find main README.md'))

  let checks = [
    checkNotesDir, checkReadme
  ]

  Promise.all(checks).then(() => {
    scraper = new ArxivScraper();

    return Promise.all([
      scraper.scrapeURL(url),
      mkdirp(categoryPath)
    ])
  }).spread((paper) => {
    let newFilename = path.join(categoryPath, paper.filename)

    return Promise.all([
      paper,
      Readme.fromFileAsync(mainReadmePath),
      new Promise((resolve) => {
        if (!program.dry) {
          return fs.writeFileAsync(newFilename, paper.toNotes())
        } else {
          console.log(`>>> Writing notes to file ${newFilename}`);
          console.log('----------------------------------------');
          console.log(paper.toNotes());
          console.log('----------------------------------------\n');
          resolve()
        }
      })
    ])
  }).spread((paper, readme) => {
    readme.addPaper(paper, program.category)
    if (!program.dry) {
      return fs.writeFileAsync(mainReadmePath, readme.toMarkdown())
    } else {
      console.log(`>>> Writing to README.md`);
      console.log('----------------------------------------');
      console.log(readme.toMarkdown());
      console.log('----------------------------------------');
    }

  }).catch((err) => {
    console.error(err);
  })
})();


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
    .command('url', 'Add paper from a url', { isDefault: true })
    .command('md', 'Add paper from a local description [NOT IMPLEMENTED]')
    .parse(process.argv);

})();



/* eslint no-console:0, consistent-return:0 */
const path = require('path');
const fs = require('fs-promise');
const webpack = require('webpack');
const glob = require('glob');

const webpackConfig = require('./webpack.config');

const bundler = webpack(webpackConfig);

// ===========================================================================
// CONFIG
// ===========================================================================
const PATHS = webpackConfig.data.PATHS;

// ===========================================================================
// RUN
// ===========================================================================
(async() => {
  try {
    await clean();
    await copyAssets();
    await build();
    console.log('Done.');
  }
  catch (err) {
    console.error(err.toString());
  }
})();

// ===========================================================================
// TASKS
// ===========================================================================
/**
 * Empty DIST directory
 */
function clean() {
  console.log('Cleaning DIST directory.');
  return fs.emptyDirSync(PATHS.build());
}


/**
 *  Async, copy all non-(js|css) assets to DIST
 */
function copyAssets() {
  console.log('Copying assets.');

  /**
   * Copy in parallel, resolve when all are complete.
   */
  return new Promise((resolve, reject) => {
    const completedStack = []; // track completed copies

    // get files
    glob('src/**/*.!(scss|js)', (err, files) => {
      if (err) {return reject(err);}

      // for each file
      for (const file of files) {
        // copy to DIST, update completed stack
        const fileDest = getDest(file);
        fs.copy(file, fileDest, setComplete(files, fileDest));
      }
    });

    /**
     * Resolve promise when all files are copied
     */
    function setComplete(files, fileDest) {
      return (err, file) => {
        if (err) {return reject(err);}

        // add current file to completed stack
        completedStack.push([ file, fileDest ]);

        // when completed stack matches initial list
        if (completedStack.length === files.length) {
          // resolve promise
          return resolve(completedStack);
        }
      };
    }
  });
}

/**
 * Async, run webpack
 */
function build() {
  console.log('Running webpack build.');
  return new Promise((resolve, reject) => {
    bundler.run((err, stats) => (err ? reject(err) : resolve(stats)));
  });
}

// ===========================================================================
// UTILS
// ===========================================================================

/**
 * Map file locations from source to dist.
 */
function getDest(file) {
  return PATHS.build(file.replace(`sass${path.sep}`, '').replace(`src${path.sep}`, ''));
}

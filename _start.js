/* eslint default-case:0 */
global.watch = true;

const path = require('path');
const fs = require('fs-extra');
const browserSync = require('browser-sync').create();
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const htmlInjector = require('bs-html-injector');
const webpackConfig = require('./webpack.config');

const bundler = webpack(webpackConfig);

// ===========================================================================
// CONFIG
// ===========================================================================
const PATHS = webpackConfig.data.PATHS;
const PROXY_TARGET = webpackConfig.data.PROXY_TARGET;
const bsOptions = {
  files: [
    {
      // scss|js managed by webpack
      match: [ 'src/**/*.!(scss|js)' ],
      // manually sync everything else
      fn: synchronize,
    },
  ],

  proxy: {
    // proxy local WP install
    target: PROXY_TARGET,

    middleware: [
      // converts browsersync into a webpack-dev-server
      webpackDevMiddleware(bundler, {
        publicPath: webpackConfig.output.publicPath,
        noInfo: true,
      }),

      // hot update js && css
      webpackHotMiddleware(bundler),
    ],
  },

  //this gets annoying
  open: false,
};

// setup html injector, only compare differences within outer most div (#page)
// otherwise, it would replace the webpack HMR scripts
browserSync.use(htmlInjector, { restrictions: [ '#page' ] });

// ===========================================================================
// RUN
// ===========================================================================
// clean -> ensure 'style.css' -> run browsersync
fs.emptyDir(PATHS.build(), () => (
    fs.ensureFile(PATHS.build('style.css'), () => (
      browserSync.init(bsOptions)
    ))
  )
);

// ===========================================================================
// UTILS
// ===========================================================================
/**
 * Handle file events, sync updates.
 */
function synchronize(event, file) {
  // copy/remove file
  switch (event) {
    case 'add':
      fs.copy(file, getDest(file));
      break;
    case 'change':
      fs.copy(file, getDest(file));
      break;
    case 'unlink':
      fs.remove(getDest(file));
      break;
    case 'unlinkDir':
      fs.remove(getDest(file));
      break;
  }

  // activate html injector
  if (file.endsWith('php')) {htmlInjector();}
}

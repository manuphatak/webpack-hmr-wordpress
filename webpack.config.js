/* eslint default-case:0 */
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const NPMInstallPlugin = require('npm-install-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const path = require('path');

// ===========================================================================
// CONSTANTS
// ===========================================================================
const THEME_NAME = 'theme_name';
const PROXY_TARGET = 'local.wordpress.dev';
const HOST = 'localhost';
const PORT = 3000;
const PATHS = {
  src: unipath('src'),
  build: unipath(`/home/manu/Code/wordpress-themes/${THEME_NAME}`),
  modules: unipath('node_modules'),
  base: unipath('.'),
};

const LOADER_INCLUDES = [ PATHS.src() ];

const DEVELOPMENT = 'development';
const PRODUCTION = 'production';

// ===========================================================================
// SETUP ENV
// ===========================================================================
const TARGET = process.env.npm_lifecycle_event;
const ENV = getEnv(TARGET);
const WATCH = global.watch || false;

// ===========================================================================
// CONFIG EXPORT
// ===========================================================================
module.exports = {
  entry: getEntry(ENV),

  output: {
    path: PATHS.build(),
    publicPath: ENV === PRODUCTION ? '/' : `//${HOST}:${PORT}/wp-content/themes/${THEME_NAME}/`,
    filename: 'js/[name].js',
    sourceMapFilename: '[file].map',
  },

  module: {
    loaders: getLoaders(ENV),
  },

  devtool: ENV === PRODUCTION ? 'source-map' : 'inline-source-map',

  plugins: getPlugins(ENV),

  target: 'web',

  watch: WATCH,
  data: {
    THEME_NAME,
    PROXY_TARGET,
    PATHS,
  },
};


// ===========================================================================
// CONFIG ENV DEFINITIONS
// ===========================================================================
function getEntry(env) {
  const entry = {};
  entry.main = [ PATHS.src('js', 'main.js') ];
  entry.style = [];
  entry.vendor = Object.keys(require('./package.json').dependencies);

  switch (env) {
    case DEVELOPMENT:
      entry.main.unshift('webpack/hot/only-dev-server');
      entry.main.unshift(`webpack-hot-middleware/client?http://${HOST}:${PORT}`);
      entry.main.push(PATHS.src('sass', 'style.scss'));
      break;

    case PRODUCTION:
      entry.style.push(PATHS.src('sass', 'style.scss'));
      break;
  }
  return entry;
}

function getLoaders(env) {
  const JS_LOADER = {
    test: /\.js$/,
    include: LOADER_INCLUDES,
    loader: 'babel',
    query: {
      cacheDirectory: true,
    },
  };

  const loaders = [
    JS_LOADER,
  ];

  switch (env) {
    case PRODUCTION:
      loaders.push({
        test: /\.s?css$/,
        include: LOADER_INCLUDES,
        loader: ExtractTextPlugin.extract((
          ''
          + 'css'
          + '?sourceMap'
          + '!'
          + 'sass'
          + '?sourceMap'
        )),
      });
      break;

    case DEVELOPMENT:
      loaders.push({
        test: /\.s?css$/,
        includes: LOADER_INCLUDES,
        loaders: [
          'style'
          + '?sourceMap',
          'css'
          + '?sourceMap',
          'sass'
          + '?sourceMap',
        ],
      });
      break;
  }

  return loaders;
}

function getPlugins(env) {
  const plugins = [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(env) }),
  ];

  switch (env) {

    case PRODUCTION:
      plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }));
      break;

    case DEVELOPMENT:
      plugins.push(new NPMInstallPlugin({ save: true }));
      plugins.push(new webpack.HotModuleReplacementPlugin());
      plugins.push(new webpack.NoErrorsPlugin());
      plugins.push(new WriteFilePlugin());
      break;
  }

  plugins.push(new ExtractTextPlugin('[name].css'));

  return plugins;
}

// ===========================================================================
// UTILS
// ===========================================================================
function getEnv(target) {
  switch (target) {
    case 'start':
      return DEVELOPMENT;

    case 'build':
      return PRODUCTION;

    case 'stats':
      return PRODUCTION;

    default:
      return DEVELOPMENT;
  }
}

function unipath(base) {
  return function join(/* ...paths */) {
    // eslint-disable-next-line prefer-rest-params
    const _paths = [ base ].concat(Array.from(arguments));
    return path.resolve(path.join.apply(null, _paths));
  };
}

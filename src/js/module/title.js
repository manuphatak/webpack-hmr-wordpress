const malarkey = require('malarkey');

module.exports = function activate() {
  const elem = document.querySelector('.title');
  const opts = { loop: true };

  activate.handle = malarkey(elem, opts);

  activate.handle
          .delete()
          .type('It Works!!!').pause().delete()
          .type('JS + SASS HMR in WordPress.').pause().delete()
          .type('Hello World').pause();
};

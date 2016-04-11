const activateMalarkey = require('./module/title');
document.addEventListener('DOMContentLoaded', loadingComplete);


function loadingComplete() {
  // eslint-disable-next-line no-console
  console.log('Page Loaded! Activating malarkey.');
  activateMalarkey();
}


if (module.hot) {
  module.hot.accept('./module/title', () => {
    location.reload();
  });
}

/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app'),
  path = require('path'),
  Funnel = require('broccoli-funnel'),
  MergeTrees = require('broccoli-merge-trees'),
  writeFile = require('broccoli-file-creator'),
  md5 = require('md5');

module.exports = function (defaults) {
  // Create a md5 hash for fingerprinting
  const fingerprintHash = md5(Date.now());

  let app = new EmberApp(defaults, {
    fingerprint: {
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'json'],
      customHash: fingerprintHash //use a single hash for all assets
    }
  });

  // ------------------------------------------------------------------------------------------
  // Bootstrap
  // ------------------------------------------------------------------------------------------
  app.import(app.bowerDirectory + '/bootstrap/dist/js/bootstrap.js', { outputFile: 'assets/bootstrap.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/affix.js', { outputFile: 'assets/bootstrap.affix.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/alert.js', { outputFile: 'assets/bootstrap.alert.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/button.js', { outputFile: 'assets/bootstrap.button.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/carousel.js', { outputFile: 'assets/bootstrap.carousel.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/collapse.js', { outputFile: 'assets/bootstrap.collapse.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/dropdown.js', { outputFile: 'assets/bootstrap.dropdown.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/modal.js', { outputFile: 'assets/bootstrap.modal.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/popover.js', { outputFile: 'assets/bootstrap.popover.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/scrollspy.js', { outputFile: 'assets/bootstrap.scrollspy.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/tab.js', { outputFile: 'assets/bootstrap.tab.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/tooltip.js', { outputFile: 'assets/bootstrap.tooltip.js' });
  app.import(app.bowerDirectory + '/bootstrap/js/transition.js', { outputFile: 'assets/bootstrap.transition.js' });
  app.import(app.bowerDirectory + '/bootstrap/dist/css/bootstrap.css');
  app.import(app.bowerDirectory + '/bootstrap/dist/css/bootstrap-theme.css');
  const bootstrapFontsTree = new Funnel(path.join(app.bowerDirectory, 'bootstrap'), {
    srcDir: 'fonts',
    include: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot', '**/*.svg'],
    destDir: 'fonts'
  });

  // ------------------------------------------------------------------------------------------
  // Font Awesome
  // ------------------------------------------------------------------------------------------
  app.import(app.bowerDirectory + '/font-awesome/css/font-awesome.css', { outputFile: 'assets/font-awesome.css' });
  const fontAwesomeFontsTree = new Funnel(path.join(app.bowerDirectory, 'font-awesome'), {
    srcDir: 'fonts',
    include: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot', '**/*.svg'],
    destDir: 'fonts'
  });

  // ------------------------------------------------------------------------------------------
  // leaflet
  // ------------------------------------------------------------------------------------------
  app.import(app.bowerDirectory + '/leaflet/dist/leaflet.js', { outputFile: 'assets/leaflet.js' });
  app.import(app.bowerDirectory + '/leaflet/dist/leaflet.css', { outputFile: 'assets/leaflet.css' });
  const leafletImagesTree = new Funnel(path.join(app.bowerDirectory, 'leaflet', 'dist'), {
    srcDir: 'images',
    include: ['**/*.*'],
    destDir: 'assets/images'
  });

  // ------------------------------------------------------------------------------------------
  // Create a asset-fingerprint.js file which holds the fingerprintHash value 
  // This hash value is used by all the asset loaders to load the assets on-demand 
  // ------------------------------------------------------------------------------------------
  var assetFingerprintTree = writeFile('./assets/assets-fingerprint.js', '(function(_window){ _window.ASSET_FINGERPRINT_HASH = "' + (app.env === 'production' ? fingerprintHash : '') + '"; })(window);');

  return app.toTree(MergeTrees([bootstrapFontsTree, fontAwesomeFontsTree, leafletImagesTree, assetFingerprintTree]));
};

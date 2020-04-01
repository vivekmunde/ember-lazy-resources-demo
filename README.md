# Demo: Ember.js Lazy Assets: Fingerprinting & loading static/dynamic assets on demand

[Ember.js[(https://emberjs.com) is a great framework which offers a robust platform to build large scale ambitious [SPA](https://en.wikipedia.org/wiki/Single-page_application)s. Any large scale [SPA](https://en.wikipedia.org/wiki/Single-page_application) needs many resources, like external javascript libraries, stylesheets, i18n files etc, and these resources keep on growing in their scale and numbers as the application matures with more and more functionality is incorporated. Some or many of these resources can be functionality centric, means they are required on only specific routes/modules. So, the loading of these resources that are not necessary for the initial page load can be deferred until after the initial load. Doing so can help reduce resource contention and improve performance.

**Javascript** & **CSS** files can be loaded on demand by injecting `<script>` & `<link>` tags in the document using JavScript/[jQuery](https://jquery.com). **i18n JSON** files can be loaded on demand using [jQuery AJAX](http://api.jquery.com/jquery.ajax).

### All Is Well. So where is the problem?

## The Problem
#### **Dynamic URLs**
Image urls can be dynamic, like below, which do not get converted into the fingerprinted urls through build process.

	import Ember from 'ember';
	
	export default Ember.Component.extend({
	  theme: 'blue',
	  
	  themeImage: Ember.computed('theme', function() {
	    return `assets/${this.get('theme')}-theme-logo.png`;
	  })
	})

Note: Static URLs like `/assets/default-theme-logo.png` in the code are converted into the fingerprinted URLs like `/assets/default-theme-logo-5fb172473946d1aa9946db935c6a64d2.png` during the build process.

#### **Dynamic Fingerprinting/hashing**
All the assets are fingerprinted by Ember by using broccoli-asset-rev, so that the users always receive the latest code/assets. Each asset gets its own fingerprint/hash generated. The production build under dist directory appears like below.

	dist
	   |__assets
	        |__images/blue-theme-logo-40cfba464935ff80190c3507e84d94b5.png
	        |__bootstrap-c87a4c2c79156714058688911e8c1493.css
	        |__bootstrap-a6614093a8f614bdac2df7cf89676516.js

We can easily note that each resource has been assigned a separate hash.

### ***To load the assets lazily, the app must know the exact fingerprinted path of these resources, it means the asset map should be known to the app for these resources.***

#### **AssetMap.json**
To solve this, the we can enable the asset map generation by setting the `generateAssetMap` to true in *ember-cli-build.js* file.

	var app = new EmberApp({
	  fingerprint: {
	    enabled: true,
	    generateAssetMap: true
	  }
	  . . .
	});

This setting will generate a file *dist/assets/assetMap.json*.

	{
	  "assets": {
	    "assets/images/blue-theme-logo.png": "assets/images/blue-theme-logo-40cfba464935ff80190c3507e84d94b5.png",
	    "assets/bootstrap.css": "assets/bootstrap-c87a4c2c79156714058688911e8c1493.css",
	    "assets/bootstrap.js": "assets/bootstrap-a6614093a8f614bdac2df7cf89676516.js",
	  }
	}

Now this *assepMap.json* can be loaded by the app to know the exact hashed urls of the resources.

## Problems in using assetMap.json
The *assetMap.json* file itself is not fingerprinted. So the app will always use cached *assetMap.json* and not the latest asset map, until the user clears the cache.
Secondly, the *assetMap.json* file, most of the time, is a large file in size to load which will cause more delay in app load. And its really unnecessary to load asset map for all resources when the app need to know the hashed urls of few resources.

## Solution: The other way around
We know that each resource gets its own hash generated during the fingerprinting stage of the build process. The whole purpose of fingerprinting/hashing is to make sure that the users get latest code on their devices.

### *So, I though the other way around, instead of generating separate hash for each resource, can we generate same hash key for each resource? Means, instead of Ember generating the asset map for us, can we supply the fingerprint/hash to Ember? And then by some means make the app aware about the fingerprint/hash used for the resources?*

##### **Yes, Yes, Yes, We can do that!**
In *ember-cli-build.js* we can use [md5](https://www.npmjs.com/package/md5) to generate a fresh fingerprint/hash for each build and [broccoli-file-creator](https://www.npmjs.com/package/broccoli-file-creator) to create a file which will hold this fingerprint value and this file can be loaded along with other assets.

*ember-cli-build.js*

	/* eslint-env node */
	'use strict';
	
	const EmberApp = require('ember-cli/lib/broccoli/ember-app')
	  writeFile = require('broccoli-file-creator'),
	  md5 = require('md5');
	
	module.exports = function (defaults) {
	
	  // ------------------------------------------------------------------------------------------
	  // Create a md5 hash for fingerprinting
	  // Use of Date.now() is a simple way to ensure that each build gets a fresh key for generating a new hash 
	  // Any better approach of supplying a fresh key to md5() is encouraged to use here 
	  // ------------------------------------------------------------------------------------------
	  const fingerprintHash = md5(Date.now());
	
	  let app = new EmberApp(defaults, {
	    fingerprint: {
	      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'json'], // list of extensions to fingerprint
	      customHash: fingerprintHash //use a single fingeprint/hash for all assets
	    }
	  });
	
	  // ------------------------------------------------------------------------------------------
	  // Create a asset-fingerprint.js file which holds the fingerprintHash value 
	  // This hash value is used by all the asset loaders to load the assets on-demand 
	  // ------------------------------------------------------------------------------------------
	  var assetFingerprintTree = writeFile('./assets/assets-fingerprint.js', `(function(_window){ _window.ASSET_FINGERPRINT_HASH = "${(app.env === 'production' ? `-${fingerprintHash}` : '')}"; })(window);`);
	
	  return app.toTree(assetFingerprintTree);
	};

#### **How this works:**
* Generate a hash using [md5](https://www.npmjs.com/package/md5) by supplying a unique key, `Date.now()` is used here.
* Optional: Supply the list of extensions to apply the fingerprinting. Default options are `[‘js’, ‘css’, ‘png’, ‘jpg’, ‘gif’, ‘map’]`. I have added `json` into it so that the build processes all the i18n.json files stored at public directory, because I wanted to load the i18n files on demand.
* Set the customHash equal to the fingerprint/hash generated, which will be used to fingerprint all resources.
NOTE: The hashing is only done in PRODUCTION mode.
* Generate a javascript file *./assets/assets-fingerprint.js* which holds this fingerprint using [broccoli-file-creator](https://www.npmjs.com/package/broccoli-file-creator). This file holds a single line of code (IIFE i.e. Immediately Invoked Function Expression) which sets the fingerprint/hash value in a GLOBAL CONSTANT called `window.ASSET_FINGERPRINT_HASH`. This file gets created under the assets directory and which can be included in the entry file index.html of the app.
* Supply this file to the app tree so that it includes it in the build.

This will fingerprint all resources with the custom hash.

	dist
	   |__assets
	        |__images/blue-theme-logo-2f831104f45bf16ec60764e49269962d.png
	        |__bootstrap-2f831104f45bf16ec60764e49269962d.css
	        |__bootstrap-2f831104f45bf16ec60764e49269962d.js

Now add a `<script>` tag  to load the javascript file *./assets/assets-fingerprint.js*  in the `<body>` tag of the app’s entry file index.html. This *./assets/assets-fingerprint.js* file always gets fingerprinted along with other files and the app should aways have the latest of it.

	  . . .
	  <body>
	    {{content-for "body"}}
	
	    <script src="{{rootURL}}assets/vendor.js"></script>
	    <script src="{{rootURL}}assets/ember-lazy-resources-demo.js"></script>
	    
	    // Javascript which sets the fingerprint value in a GLOBAL CONSTANT
	    <script src="{{rootURL}}assets/assets-fingerprint.js"></script>
	
	    {{content-for "body-footer"}}
	  </body>
	</html>

##### **Yooo hoooo! And now its time to load the resources on demand!**
The app can now easily use the GLOBAL CONSTANT to know the fingerprint/hash to build the exact URL and load the resources on demand.

	import Ember from 'ember';
	
	export default Ember.Component.extend({
	  theme: 'blue',
	  
	  themeImage: Ember.computed('theme', function() {
	    return `assets/${this.get('theme')}-theme-logo${window.ASSET_FINGERPRINT_HASH}.png`;
	  })
	})
	
## Advantages of this approach
* Resources fingerprinting is still intact with fresh hash key for each build and latest copy of then served to end users
* Application knows the exact fingerprint/hash used so that it can load the resources on demand with exact url-with-fingerprint known
* No need of assetMap.json anymore
* The file asset-fingerprint.js is of few bytes, so no extra load time unlike assetMap.json approach

## Lazy Loading Addons
**Javascript**, **CSS** & **i18n** files can be loaded on demand with the help of addons [ember-m-js-loader](https://www.npmjs.com/package/ember-m-js-loader), [ember-m-css-loader](https://www.npmjs.com/package/ember-m-css-loader) & [ember-i18n-loader](https://www.npmjs.com/package/ember-i18n-loader).

Example:

	  i18nLoader: Ember.inject.service('i18n-loader'),
	  mJsLoader: Ember.inject.service('m-js-loader'),
	  mCssLoader: Ember.inject.service('m-css-loader'),
	  beforeModel() {
	    const hash = window.ASSET_FINGERPRINT_HASH;
	    return Ember.RSVP.hash({
	      i18n: this.get('i18nLoader').load(`/locales/${this.get('i18n.locale')}/translations${hash}.js`),
	      leafletJs: this.get('mJsLoader').load(`/assets/leaflet${hash}.js`),
	      leafletCss: this.get('mJsLoader').load(`/assets/leaflet${hash}.css`)
	    });
	  }

Thank you for reading!   

Happy Lazy Coding!


## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd ember-lazy-resources-demo`
* `npm install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `npm run lint:js`
* `npm run lint:js -- --fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

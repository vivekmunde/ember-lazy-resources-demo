export function initialize() {
  const application = arguments[1] || arguments[0];
  application.inject('route', 'mJsLoader', 'service:m-js-loader');
}

export default {
  name: 'js-loader',
  initialize
};

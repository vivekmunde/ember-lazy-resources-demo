export function initialize() {
  const application = arguments[1] || arguments[0];
  application.inject('route', 'jsLoader', 'service:js-loader');
}

export default {
  name: 'js-loader',
  initialize
};

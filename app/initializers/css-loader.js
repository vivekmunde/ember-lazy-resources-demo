export function initialize() {
  const application = arguments[1] || arguments[0];
  application.inject('route', 'mCssLoader', 'service:m-css-loader');
}

export default {
  name: 'css-loader',
  initialize
};

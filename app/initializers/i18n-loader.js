export function initialize() {
  const application = arguments[1] || arguments[0];
  application.inject('route', 'i18nLoader', 'service:i18n-loader');
}

export default {
  name: 'i18n-loader',
  initialize
};

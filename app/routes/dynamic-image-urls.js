import Ember from 'ember';

export default Ember.Route.extend({
    loadTranslations() {
        return this.get('i18nLoader').load({
            url: `/locales/${this.get('i18n.locale')}/dynamic-urls${window.ASSET_FINGERPRINT_HASH}.json`
        });
    },
    beforeModel() {
        return this.loadTranslations();
    }
});

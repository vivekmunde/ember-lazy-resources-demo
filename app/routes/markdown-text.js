import Ember from 'ember';

export default Ember.Route.extend({
    loadTranslations() {
        return this.get('i18nLoader').load({
            url: `/locales/${this.get('i18n.locale')}/markdown-text${window.ASSET_FINGERPRINT_HASH}.json`
        });
    },
    loadShowdownJs() {
        return this.get('mJsLoader').load({
            src: `/assets/showdown${window.ASSET_FINGERPRINT_HASH}.js`
        });
    },
    beforeModel() {
        return Ember.RSVP.hash({
            i18n: this.loadTranslations(),
            showdownJs: this.loadShowdownJs()
        });
    }
});

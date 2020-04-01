import Route from '@ember/routing/route';

export default Route.extend({
    loadTranslations() {
        const locale = (navigator.language || 'en').split('-')[0];
        this.set('i18n.locale', locale);
        return this.get('i18nLoader').load({
            url: `/locales/${locale}/application${window.ASSET_FINGERPRINT_HASH}.json`
        });
    },
    beforeModel() {
        return this.loadTranslations();
    }
});

import Route from '@ember/routing/route';

export default Route.extend({
    loadTranslations() {
        return this.get('i18nLoader').load({
            url: `/locales/${this.get('i18n.locale')}/dynamic-urls${window.ASSET_FINGERPRINT_HASH}.json`
        });
    },
    beforeModel() {
        this.get('mCssLoader').load({
            href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
            integrity: 'sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh',
            crossorigin: 'anonymous'
        });
        return this.loadTranslations();
    }
});

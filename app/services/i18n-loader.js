import Ember from 'ember';

export default Ember.Service.extend({
    i18n: Ember.inject.service('i18n'),
    cache: Ember.A(),
    getFingerprintedPath(i18nFilePath) {
        const hash = window.ASSET_FINGERPRINT_HASH;
        if (Ember.isBlank(hash)) {
            return i18nFilePath;
        }
        let pathSplit = i18nFilePath.split('.');
        let extension = `.${pathSplit[pathSplit.length - 1]}`;
        pathSplit.splice(pathSplit.length - 1, 1, `-${hash}`, extension);
        return pathSplit.join('');
    },
    isCached(i18nFilePath) {
        return this.get('cache').includes(i18nFilePath);
    },
    updateCache(i18nFilePath) {
        this.get('cache').pushObject(i18nFilePath);
    },
    fetchJSON(i18nFilePath) {
        return Ember.$.ajax(
            {
                cache: true,
                url: i18nFilePath
            }
        );
    },
    loadTranslations(i18nFilePath) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            const i18n = this.get('i18n');
            return this.fetchJSON(i18nFilePath)
                .then((json) => {
                    i18n.addTranslations(i18n.locale.split('-')[0], json);
                    resolve();
                }, (error) => {
                    reject(error);
                });
        });
    },
    load(i18nFilePath) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            if (Ember.isBlank(i18nFilePath)) {
                resolve();
                return;
            }
            const i18nFileFingerprintedPath = this.getFingerprintedPath(i18nFilePath);
            if (this.isCached(i18nFileFingerprintedPath)) {
                resolve();
                return;
            }
            return this.loadTranslations(i18nFileFingerprintedPath)
                .then(() => {
                    this.updateCache(i18nFileFingerprintedPath);
                    resolve();
                }, (error) => {
                    reject(error);
                });
        });
    }
});

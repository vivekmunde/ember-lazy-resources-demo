import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel() {
        return this.get('i18nLoader').load('/locales/en/application.json');
    }
});

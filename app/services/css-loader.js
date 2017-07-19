import Ember from 'ember';

export default Ember.Service.extend({
    cache: Ember.A(),
    isCached(href) {
        return this.get('cache').includes(href);
    },
    updateCache(href) {
        this.get('cache').pushObject(href);
    },
    load(href) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            if (Ember.isEmpty(href)) {
                resolve();
                return;
            }
            if (this.isCached(href)) {
                resolve();
                return;
            }
            Ember.$("<link>")
                .appendTo("head")
                .on('load', () => {
                    this.updateCache(href);
                    resolve();
                })
                .on('error', () => {
                    reject();
                })
                .attr({
                    type: 'text/css',
                    rel: 'stylesheet',
                    href: href
                });
        });
    }
});

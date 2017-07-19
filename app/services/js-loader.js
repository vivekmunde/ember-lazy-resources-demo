import Ember from 'ember';

export default Ember.Service.extend({
    cache: Ember.A(),
    isCached(src) {
        return this.get('cache').includes(src);
    },
    updateCache(src) {
        this.get('cache').pushObject(src);
    },
    load(src) {
        return new Ember.RSVP.Promise((resolve, reject) => {
            if (Ember.isEmpty(src)) {
                resolve();
                return;
            }
            if (this.isCached(src)) {
                resolve();
                return;
            }
            Ember.$("<script>")
                .appendTo("body")
                .on('load', () => {
                    this.updateCache(src);
                    resolve();
                })
                .on('error', () => {
                    reject();
                })
                .attr({
                    type: 'text/javascript',
                    src: src
                });
        });
    }
});

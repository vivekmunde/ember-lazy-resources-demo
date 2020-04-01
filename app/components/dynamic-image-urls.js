import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    imageTag: 'amsterdam',
    imageTags: ['amsterdam', 'atlanta', 'austin', 'columbus', 'dc', 'emberconf-2016', 'lts', 'munich', 'nyc', 'releigh', 'sandiego'],
    imageUrl: computed('imageTag', function () {
        return `./images/${this.get('imageTag')}${window.ASSET_FINGERPRINT_HASH}.png`
    }),
    actions: {
        setImageTag(imageTag) {
            this.set('imageTag', imageTag);
        }
    }
});

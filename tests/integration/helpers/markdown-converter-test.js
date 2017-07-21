
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('markdown-converter', 'helper:markdown-converter', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{markdown-converter inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});


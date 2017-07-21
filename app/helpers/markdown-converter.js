import Ember from 'ember';

export function markdownConverter([text]) {
  const converter = new showdown.Converter();
  return Ember.String.htmlSafe(converter.makeHtml(`${text}`));
}

export default Ember.Helper.helper(markdownConverter);

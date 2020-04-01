import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

export function markdownConverter([text]) {
  const converter = new showdown.Converter();
  return htmlSafe(converter.makeHtml(`${text}`));
}

export default helper(markdownConverter);

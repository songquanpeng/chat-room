const {lexer, parser} = require('marked');
const sanitizeHtml = require('sanitize-html');

function md2html(markdown) {
  return sanitizeHtml(parser(lexer(markdown)));
}

module.exports = {
  md2html,
};

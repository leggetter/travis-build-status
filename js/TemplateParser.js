function TemplateParser() {
}

TemplateParser.prototype.parse = function(templateStr, tokens) {
  var regex;
  for(var token in tokens) {
    console.log(token, tokens[token]);
    regex = new RegExp('{{' + token + '}}', 'g');
    templateStr = templateStr.replace(regex, tokens[token]);
  }
  return templateStr;
};
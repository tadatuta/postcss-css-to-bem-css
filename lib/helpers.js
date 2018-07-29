function capitalize (str) {
  return str && str[0].toUpperCase() + str.substr(1)
}

function toCamelCase (str) {
  const wordDelim = '-' // note: hardcode
  return str && str.split(wordDelim).map(capitalize).join('')
}

function toKebabCase (str) {
  return str && str
    .split(/(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('-')
}

module.exports = {
  capitalize,
  toCamelCase,
  toKebabCase
}

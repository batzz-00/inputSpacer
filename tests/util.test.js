const utils = require('../src/utils/util.js')

console.log(utils)

test('removes | from string abc|def and returns abcdef', () => {
  expect(utils.removeDelimiters('abc|def', '|', 2, 1)).toBe('abcdef')
})

test('max length of 3 sets abcdef to abc', () => {
  expect(utils.setMaxLength('abcdef', 3)).toBe('abc')
})

test('adds prefix pre- to the split blocks array', () => {
  let val = [{ text: ['a', 'b'], type: 'text' }]
  let expected = [{ text: ['p', 'r', 'e', '-'], type: 'prefix' }, { text: ['a', 'b'], type: 'text' }]
  expect(utils.setAffixes(val, 'pre-', 'pre-', 1000)).toEqual(expected)
})
// need to add suffixes to this

test('the text abcd should be split into ab c', () => {
  let expected = [{ text: ['a', 'b'], type: 'text' },
    { text: ['|'], type: 'delimiter' },
    { text: ['c', ''], type: 'text' }]
  expect(utils.splitIntoBlocks('abc', 2, 1, '|', 5)).toEqual(expected)
})

test('the block array ab should turn into the string ab', () => {
  let string = [{ text: ['a', 'b'], type: 'text' }]
  expect(utils.turnIntoString(string)).toEqual('ab')
})

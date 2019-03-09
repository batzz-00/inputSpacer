const utils = require('../src/utils/util.js')
//   checkDeletingDelimiter, -- snapshot
//   checkArrowKeys,
//   removeAffixes,
//   filterString,
//   setCursorPosition

/*

  REMOVE DELIMITERS
  Tested:
  - Single delimiter with single blocksize
  - Single delimiter with array blocksize
  - Array of delimiters with single blocksize
  - Array of delimiters with array blocksize
  Untested:
  - Order of removal on delimiters follows delimiter array

*/

test('removes | from string abc|def and returns abcdef - using single blockSize and single delimiter', () => {
  expect(utils.removeDelimiters('abc|def', '|', 2, 1)).toBe('abcdef')
})

test('removes | from string abc|def and returns abcdef - using array blockSize and single delimiter', () => {
  expect(utils.removeDelimiters('abc|def', '|', [2], 1)).toBe('abcdef')
})

test('removes | and :  from string ab|cdefa:d and returns abcdefad - using array blockSize and array delimiter', () => {
  expect(utils.removeDelimiters('ab|cdefa:d', ['|', ':'], [2, 5], 1)).toBe('abcdefad')
})

test('removes : and | from string abc:def| and returns abcdef - using single blockSize and array delimiter', () => {
  expect(utils.removeDelimiters('abc:def|', [':', '|'], 3, 1)).toBe('abcdef')
})

test('keeps : and | in string abc:def| since delimiter array does not match delimiters in input ', () => {
  expect(utils.removeDelimiters('abc:def|', ['|', ':'], 3, 1)).toBe('abc:def|')
})

// delimiters are disallowed anyway, need to makeit so they are allowed as long as the block theyre in isnt using that delimiter

/*

  MAX LENGTH
  Tested:
  - Text input with max input int
  Untested:

*/

test('max length of 3 sets abcdef to abc', () => {
  expect(utils.setMaxLength('abcdef', 3)).toBe('abc')
})

/*

  SETAFFIXES
  Tested:
  - Single delimiter with single blocksize and prefix
  Untested:
  - Single delimiter with array blocksize
  - Array of delimiters with single blocksize
  - Array of delimiters with array blocksize
  - * with prefixes and suffixes

*/

test('adds prefix pre- to the split blocks array', () => {
  let val = [{ text: ['a', 'b'], type: 'text' }]
  let expected = [{ text: ['p', 'r', 'e', '-'], type: 'prefix' }, { text: ['a', 'b'], type: 'text' }]
  expect(utils.setAffixes(val, 'pre-', 'pre-', 1000)).toEqual(expected)
})

/*

  SPLITINTOBLOCKS
  Tested:
  - Single delimiter with single blocksize
  Untested:
  - Single delimiter with array blocksize
  - Array of delimiters with single blocksize
  - Array of delimiters with array blocksize

*/

test('the text abcd should be split into ab c', () => {
  let expected = [{ text: ['a', 'b'], type: 'text' },
    { text: ['|'], type: 'delimiter' },
    { text: ['c', ''], type: 'text' }]
  expect(utils.splitIntoBlocks('abc', 2, 1, '|', 5)).toEqual(expected)
})

/*

  SPLITINTOBLOCKS
  Tested:
  - Text array gets turned into regular text
  Untested:
  - Adding prefixes, suffixes or delimiters returns proper text

*/

test('the block array ab should turn into the string ab', () => {
  let string = [{ text: ['a', 'b'], type: 'text' }]
  expect(utils.turnIntoString(string)).toEqual('ab')
})

/*

  FIX STRING
  Tested:
  - Single delimiter with single blocksize
  Untested:
  - Single delimiter with array blocksize
  - Array of delimiters with single blocksize
  - Array of delimiters with array blocksize

*/

test('using backspace on string ab|cd at postion 2(before delimiter) removes B ', () => {
  expect(utils.fixString('ab|cd', 2, 'backspace', '|', 2, 1)).toBe('a|cd')
})

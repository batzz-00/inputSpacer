import { removeDelimiters,
  fixString,
  checkDeletingDelimiter,
  checkArrowKeys,
  setAffixes,
  turnIntoString,
  removeAffixes,
  filterString,
  setMaxLength,
  splitIntoBlocks,
  setCursorPosition,
  setDelimiters
} from './utils/util'

// const keys = {
//   deleter: [
//     { code: 8, name: 'backspace' },
//     { code: 46, name: 'delete' }
//   ]
// }

// const getKey = (c) => Object.keys(keys).map(keyType => keys[keyType].filter((key, i) => { if (c === key.code) { return keys[keyType][i] } }))[0][0] || null

export default class inputSpacer {
  constructor (element, options = {}) {
    this.setOptions(options)
    this.onInputHandler = this.onInputHandler.bind(this)
    this.onKeyUpHandler = this.onKeyUpHandler.bind(this)
    this.onPasteHandler = this.onPasteHandler.bind(this)
    this.val = ''
    this.displayValue = ''
    this.element = this.setupElement(element)
    this.keys = []
    this.setup()
  }
  setOptions (options) {
    this.options = {
      delimiter: ' ',
      delimiterSize: 1,
      blockSize: 2,
      maxLength: options.blockSize ? options.blockSize.constructor === Array && !options.maxLength ? options.blockSize.reduce((p, n) => p + n) : 0 : options.maxLength || 0,
      blockFormatting: [],
      suffix: null,
      prefix: null,
      ...options
    }
  }
  setupElement (element) {
    if (!element) { throw new Error('[input-spacer] : No input supplied!') }
    element.addEventListener('input', (e) => this.onInputHandler(e.target.value))
    element.addEventListener('keydown', (e) => this.onKeyDownHandler(e))
    element.addEventListener('keyup', (e) => this.onKeyUpHandler(e))
    element.addEventListener('paste', (e) => this.onPasteHandler(e))
    return element
  }
  setup () {
    const { suffix, prefix, maxLength } = this.options
    this.val = setAffixes(this.val, suffix, prefix, maxLength)
    this.val = turnIntoString(this.val)
    this.displayValue = this.val
    this.element.value = this.val
  }
  onPasteHandler (e) {
    this.pasting = true
  }
  onInputHandler (val) {
    const { delimiter, blockSize, delimiterSize, maxLength, suffix, prefix, blockFormatting } = this.options
    const { startSelect, endSelect, lastKey, element } = this
    this.oldVal = this.val
    if (checkDeletingDelimiter(this.val, delimiter, element) === true) {
      this.setString(fixString(this.val, startSelect, lastKey, delimiter, blockSize, delimiterSize, prefix, suffix))
    } else {
      this.setString(val)
    }

  console.clear()
    this.val = removeAffixes(this.val, suffix, prefix)
    this.val = removeDelimiters(this.val, delimiter, blockSize, delimiterSize)
    this.val = setMaxLength(this.val, maxLength)
    this.val = splitIntoBlocks(this.val, blockSize, delimiterSize, delimiter, maxLength, blockFormatting)
    this.val = filterString(this.val, blockSize, blockFormatting)
    this.val = setDelimiters(this.val, blockSize, delimiterSize, delimiter, maxLength)
    this.val = setAffixes(this.val, suffix, prefix, maxLength)
    this.val = turnIntoString(this.val)
    this.element.value = this.val
    setCursorPosition(this.val, lastKey, startSelect, endSelect, delimiter, delimiterSize, blockSize, prefix, element)
  }
  onKeyDownHandler (e) {
    // set event stuff
    this.lastKey = e.key
    this.startSelect = e.target.selectionStart
    this.endSelect = e.target.selectionEnd

    // set keys down
    if (!this.keys.includes(e.keyCode)) { this.keys.push(e.keyCode) }

    // get variables for arrowkeys func
    const { lastKey, startSelect, element, val } = this
    const { delimiter } = this.options
    checkArrowKeys(lastKey, startSelect, element, val, delimiter)

    // handle input
  }
  onKeyUpHandler (e) {
    this.pasting = false
    this.keys.splice(this.keys.indexOf(e.keyCode), 1)
    // this.onInputHandler(e.target.value)
  }
  setString (input) {
    this.oldVal = this.val
    this.val = input
    return this
  }
}

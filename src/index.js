import { removeDelimiters, fixString, checkDeletingDelimiter, checkArrowKeys, setAffixes, turnIntoString, removeAffixes, filterString, blockFormatting, setMaxLength, splitIntoBlocks} from './utils/util'



export default class inputSpacer {
  constructor (element, options = {}) {
    this.setOptions(options)
    this.spaceInput = this.spaceInput.bind(this)
    this.val = ''
    this.displayValue = ''
    this.element = this.setupElement(element)
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
    element.addEventListener('input', (e) => this.spaceInput(e))
    element.addEventListener('keydown', (e) => this.onKeyDownHandler(e))
    return element
  }
  setup () {
    const {suffix, prefix, maxLength} = this.options
    this.val = setAffixes(this.val, suffix, prefix, maxLength)
    this.val = turnIntoString(this.val) 
    this.displayValue = this.val
    this.element.value = this.val
  }
  spaceInput (e) {
    const {delimiter, blockSize, delimiterSize, maxLength, suffix, prefix, blockFormatting} = this.options
    const {startSelect, lastKey, element} = this
    if (checkDeletingDelimiter(this.val, delimiter, element) === true) {
      this.setString(fixString(this.val, startSelect, lastKey, delimiter, blockSize, delimiterSize))
    } else {
      this.setString(e.target.value)
    }

    this.val = removeAffixes(this.val, suffix, prefix)
    this.val = removeDelimiters(this.val, delimiter, blockSize, delimiterSize)
    this.val = filterString(this.val, blockSize, blockFormatting)
    this.val = setMaxLength(this.val, maxLength)
    this.val = splitIntoBlocks(this.val, blockSize, delimiterSize, delimiter, maxLength) 
    this.val = setAffixes(this.val, suffix, prefix, maxLength)
    this.val = turnIntoString(this.val)
    
    this.element.value = this.val
  }
  onKeyDownHandler (e) {
    this.lastKey = e.key
    this.startSelect = e.target.selectionStart
    this.endSelect = e.target.selectionEnd
    const { lastKey, startSelect, element, val } = this
    const { delimiter } = this.options
    checkArrowKeys(lastKey, startSelect, element, val, delimiter)
  }
  setString (input) {
    this.oldVal = this.val
    this.val = input
    return this
  }
  setCursorPosition () {
    const { lastKey, startSelect } = this
    let { delimiter, delimiterSize, blockSize, prefix } = this.options
    const { element } = this
    let cursorBuffer = (cursorMoves[lastKey.toLowerCase()] || cursorMoves['default'])
    let extraBuffer = 0
    let curBlockSize = (blockSize.constructor === Array ? blockSize.filter((b, i) => blockSize.slice(0, i + 1).reduce((p, n) => p + n + delimiterSize, 0) <= this.val.length)
      : new Array(Math.floor(this.val.length / (blockSize + delimiterSize))))
    extraBuffer = prefix ? prefix.length : extraBuffer
    delimiter = delimiter.constructor === Array ? delimiter[curBlockSize.length - 1] || delimiter[delimiter.length - 1] : delimiter
    if (this.val[startSelect + cursorBuffer.buffer] === delimiter) {
      let curIdx = startSelect + cursorBuffer.buffer
      while (true) {
        if (this.val[curIdx] !== delimiter || extraBuffer === delimiterSize) {
          break
        } else {
          curIdx += cursorBuffer.dir
          extraBuffer += cursorBuffer.dir
        }
      }
      // extraBuffer = cursorBuffer.stopAtDelim ? extraBuffer : extraBuffer + cursorBuffer.dir
    }
    if (this.pushCursor) { extraBuffer += this.pushCursor; this.pushCursor = null }
    element.setSelectionRange(startSelect + cursorBuffer.buffer + extraBuffer, startSelect + cursorBuffer.buffer + extraBuffer)
  }
}

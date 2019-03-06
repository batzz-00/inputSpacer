
const dateFormats = {
  m: { size: 2, max: 60, min: 0 }, // minute
  H: { size: 2, max: 24, min: 0 }, // 24 hour
  h: { size: 2, max: 12, min: 0 }, // 12 hour
  s: { size: 2, max: 60, min: 0 },
  ampm: { options: ['AM', 'PM'] }
}

const cursorMoves = {
  backspace: { buffer: -1, dir: -1, stopAtDelim: true },
  delete: { buffer: 0, dir: 1, stopAtDelim: true },
  arrowright: { buffer: 1, dir: 1, stopAtDelim: true },
  arrowleft: { buffer: 1, dir: 1, stopAtDelim: true },
  default: { buffer: 1, dir: 1, stopAtDelim: false }
}

export default class inputSpacer {
  constructor (options = {}) {
    this.setOptions(options)
    this.spaceInput = this.spaceInput.bind(this)
    this.val = ''
    this.displayValue = ''
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
  setup () {
    this
      .setAffixes()
      .turnIntoString()
    this.displayValue = this.val
  }
  spaceInput (e) {
    this.element = e.target
    this.checkInputIsDelimiter()
    if (this.checkDeletingDelimiter() === true) {
      this.setString(this.fixString())
    } else {
      this.setString(e.target.value)
    }
    this
      .removeAffixes()
      .removeDelimiters()
      .filterString()
      .setMaxLength()
      .splitIntoBlocks()
      .setAffixes()
      .turnIntoString()
    this.displayValue = this.val
  }
  checkInputIsDelimiter () {
    const { blockSize, delimiterSize } = this.options
    let { delimiter } = this.options
    let curBlockSize = (blockSize.constructor === Array ? blockSize.filter((b, i) => blockSize.slice(0, i + 1).reduce((p, n) => p + n + delimiterSize, 0) >= this.val.length) : blockSize)
    delimiter = delimiter.constructor === Array ? delimiter[blockSize.length - curBlockSize.length] || delimiter[delimiter.length - 1] : delimiter
    // need to make it so that above works with single blocksize and single delimter
    // fix replace so that it doesnt replace delimiters when putting it stuff into other blocks that have separate delimiters
    if (delimiter.charCodeAt(0) === this.lastKey.charCodeAt(0)) {
      return false
    }
  }
  fixString () {
    const { startSelect } = this
    let { lastKey } = this
    let { delimiter, blockSize, delimiterSize } = this.options
    let curBlockSize = (blockSize.constructor === Array ? blockSize.filter((b, i) => blockSize.slice(0, i + 1).reduce((p, n) => p + n + delimiterSize, 0) >= this.val.length) : blockSize)
    delimiter = delimiter.constructor === Array ? delimiter[blockSize.length - curBlockSize.length] || delimiter[delimiter.length - 1] : delimiter
    delimiter = delimiter.constructor === Array ? delimiter : [delimiter]
    lastKey = lastKey.toLowerCase()
    let directionInformation = cursorMoves[lastKey] ? cursorMoves[lastKey] : cursorMoves.default
    let removeStart = startSelect + directionInformation.dir
    let val = this.val.split('')
    while (delimiter.includes(val[removeStart])) { console.log('eh'); removeStart += directionInformation.dir }
    val.splice(removeStart, 1)
    return val.join('')
  }
  onKeyDownHandler (e) {
    this.lastKey = e.key
    this.startSelect = e.target.selectionStart
    this.endSelect = e.target.selectionEnd
    this.checkArrowKeys()
  }
  checkArrowKeys () {
    let { lastKey, startSelect, element, val } = this
    const { delimiter } = this.options
    lastKey = lastKey.toLowerCase()
    if (!(lastKey === 'arrowright' || lastKey === 'arrowleft')) { return false }
    let dir = lastKey === 'arrowright' ? -1 : 0
    let fix = lastKey === 'arrowright' ? 1 : -1
    let actualPos = startSelect + fix
    if (this.val[actualPos + dir] !== delimiter) { return false }
    while (val[actualPos + fix] === delimiter) { actualPos += fix }
    if (lastKey === 'arrowright') {
      element.setSelectionRange(actualPos, actualPos)
    } else {
      element.setSelectionRange(actualPos + 1, actualPos + 1)
    } // More dynamic way to do tihs? idk
  }
  setString (input) {
    this.oldVal = this.val
    this.val = input
    return this
  }
  removeDelimiters () {
    const { delimiter, blockSize, delimiterSize } = this.options
    let blocks = blockSize.constructor === Array ? blockSize : [blockSize]
    let delimiters = delimiter.constructor === Array ? delimiter : [delimiter]

    let getDelim = (i) => delimiters[i] || delimiters[delimiters.length - 1]
    let getBlockSize = (i) => blocks[i] || blocks[blocks.length - 1]
    let c = 0
    this.val = this.val.split('').reduce((acc, n, idx) => {
      let actualIdx = idx - 1
      c = idx === getBlockSize(c) ? c + 1 : c
      let blockSize = (getBlockSize(c) + delimiterSize)
      let reg = new RegExp(getDelim(Math.floor((actualIdx / blockSize))).replace(getDelim(Math.floor(actualIdx / blockSize)), '\\$&'), 'g')
      let newText = n.replace(reg, '')
      return acc + newText
    }, '')
    return this
  }
  removeAffixes () {
    const { suffix, prefix } = this.options
    if (suffix) {
      this.val = this.val.replace(suffix, '')
    }
    if (prefix) {
      this.val = this.val.substr(prefix.length, this.val.length)
    }
    return this
  }
  filterString () {
    let { blockSize, blockFormatting } = this.options
    const immutableBSize = blockSize
    let count = 0
    let final = ''
    if (blockFormatting.length === 0) {
      return this
    }
    for (let i = 0; i <= this.val.length - 1;) {
      let format = blockFormatting.constructor === Array ? blockFormatting[count] || null : blockFormatting
      blockSize = immutableBSize.constructor === Array ? immutableBSize[count] || immutableBSize[immutableBSize.length - 1] : blockSize
      if (!format) {
        final += this.val.substring(i, i + blockSize)
        count++
        i += blockSize
        continue
      }
      let valid = this.blockFormatter(format, this.val.substring(i, i + blockSize))
      final += valid
      count++
      i += blockSize
    }
    this.val = final
    return this
  }
  setMaxLength () {
    const { maxLength } = this.options
    if (maxLength !== 0) {
      this.val = this.val.substring(0, maxLength)
    }
    return this
  }

  splitIntoBlocks () {
    let { blockSize } = this.options
    const { delimiterSize, delimiter, maxLength } = this.options
    const immutableBSize = blockSize
    let it = 0 // Current index of which the blockOutput is being pushed to (incremented by wto because a space array is added)
    let blockedOutput = []
    let count = 0 // Current index of block being processed from block array
    for (let i = 0; i <= this.val.length; i++) {
      blockSize = immutableBSize.constructor === Array ? immutableBSize[count] || immutableBSize[immutableBSize.length - 1] : blockSize
      let iterableSize = immutableBSize.constructor === Array ? immutableBSize.slice(0, count + 1).reduce((p, n) => p + n) : count * blockSize // Current total of blocks
      let finalLength = immutableBSize.constructor === Array ? maxLength !== 0 ? maxLength : immutableBSize.reduce((p, n) => p + n) : maxLength
      let actualDelimiter = delimiter.constructor === Array ? delimiter[count] || delimiter[delimiter.length - 1] : delimiter
      if ((iterableSize - i) % (blockSize) === 0 && i !== 0 && i !== finalLength) {
        // last check makes sure that a number below the current iterable ( in the case of a block array of [3,1,5]), is not ticked by the modulo operator at the first text
        // has to wait for the total text length (i) to reach at least to the current total (iterableSize)
        blockedOutput.push({ text: new Array(delimiterSize).fill(actualDelimiter), type: 'delimiter' })
        count++
        it += 2
      }
      if (!blockedOutput[it]) { blockedOutput[it] = { text: [], type: 'text' } }
      blockedOutput[it].text.push(this.val.substring(i, i + 1))
    }
    this.blocks = blockedOutput
    this.val = blockedOutput
    return this
  }
  blockFormatter (blockType, blockText) {
    this.illegal = false
    switch (blockType) {
      case 'num':
        return blockText.split('').filter(b => !isNaN(parseInt(b))).join('')
      case 'h':
      case 'm':
        let format = dateFormats[blockType]
        blockText = blockText.split('').reduce((p, n) => p + (isNaN(parseInt(n)) ? '' : n), '') // remove all non number characters
        if (blockText.length === 1) {
          if (parseInt(blockText[0]) > parseInt(String(format.max)[0])) {
            this.startSelect++
            return '0' + blockText
          } else if (parseInt(blockText[0]) < format.min) {
            return format.min
          } else {
            return blockText
          }
        } else {
          if (parseInt(blockText) > format.max) {
            return format.max
          } else if (parseInt(blockText) > format.min) {
            return blockText
          }
        }
        return blockText
    }
  }
  setAffixes () {
    const { suffix, prefix, maxLength } = this.options
    if (suffix) {
      if (maxLength === 0) {
        console.warn('You must have non-zero maxLength property to add a suffix')
      } else {
        // hmm
      }
    }
    if (prefix) {
      this.val = [{ text: prefix.split(''), type: 'prefix' }].concat(this.val)
    }
    return this
  }
  turnIntoString () {
    if (this.val.length !== 0) {
      this.val = this.val.reduce((p, n, i) => { return { text: p.text.concat(n.text) } }).text.join('')
    }
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
  getRawString () {
    return this.rawString
  }
  checkDeletingDelimiter () {
    let { delimiter } = this.options
    const { element } = this
    delimiter = delimiter.constructor === Array ? delimiter : [delimiter]
    if (delimiter.includes(this.val[element.selectionStart])) {
      return true
    }
  }
  getString (idx) {
    return this.val.split('').filter(i => i !== idx).join('')
  }
}

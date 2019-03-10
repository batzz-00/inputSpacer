const cursorMoves = {
  backspace: { buffer: -1, dir: -1, stopAtDelim: true },
  delete: { buffer: 0, dir: 1, stopAtDelim: true },
  arrowright: { buffer: 1, dir: 1, stopAtDelim: true },
  arrowleft: { buffer: 1, dir: 1, stopAtDelim: true },
  default: { buffer: 1, dir: 1, stopAtDelim: false }
}
const dateFormats = {
  M: { size: 2, max: 60, min: 0 }, // minute
  H: { size: 2, max: 24, min: 0 }, // 24 hour
  h: { size: 2, max: 12, min: 0 }, // 12 hour
  s: { size: 2, max: 60, min: 0 },
  d: { size: 2, max: 12, min: 0 }, // day
  m: { size: 2, max: 12, min: 0 }, // month
  y: { size: 2, max: 60, min: 0 }, // year
  ampm: { options: ['AM', 'PM'] }
}

let months = { '1': 31, '2': 28, '3': 31, '4': 30, '5': 31, '6': 30, '7': 31, '8': 31, '9': 30, '10': 31, '11': 30, '12': 31 } // leap years for feb

const formatMinMax = (text, min, max) => {
  if (text.length === 1) {
    if (parseInt(text[0]) > parseInt(String(max)[0])) {
      // this.startSelect++ fix this implement somehow
      return '0' + text
    } else if (parseInt(text[0]) < min) {
      return min
    } else {
      return text
    }
  } else {
    if (parseInt(text) > max) {
      return max
    } else if (parseInt(text) > min) {
      return text
    }
  }
}

const isArray = (array) => Array.isArray(array)
const properRegex = (reg) => new RegExp(reg.replace(reg, '\\$&'), 'g')

export const removeDelimiters = (val, delimiter, blockSize, delimiterSize) => {
  let blocks = blockSize.constructor === Array ? blockSize : [blockSize]
  let delimiters = delimiter.constructor === Array ? delimiter : [delimiter]

  let getDelim = (i) => delimiters[i] || delimiters[delimiters.length - 1]
  let getBlockSize = (i) => blocks[i] || blocks[blocks.length - 1]

  let count = 0
  // console.log(val.split('').reduce((acc, n, idx) => {
  //   // idx--
  //   count = idx === getBlockSize(count) ? count + 1 : count
  //   let blockSize = (getBlockSize(count) + delimiterSize)
  //   let reg = properRegex(getDelim(Math.floor((idx / blockSize))))
  //   return acc + n.replace(reg, '')
  // }, ''))
  return val.split('').reduce((acc, n, idx) => {
    idx--
    count = idx === getBlockSize(count) ? count + 1 : count
    let blockSize = (getBlockSize(count) + delimiterSize)
    let reg = properRegex(getDelim(Math.floor((idx / blockSize))))
    return acc + n.replace(reg, '')
  }, '')
}

export const fixString = (val, startSelect, lastKey, delimiter, blockSize, delimiterSize, prefix, suffix) => {
  prefix = prefix || ''
  suffix = suffix || ''

  let curBlockIdx
  if (isArray(blockSize)) {
    curBlockIdx = blockSize.filter((b, i) => {
      if (blockSize.slice(0, i + 1).reduce((p, n) => p + n) <= (val.length - prefix.length - ((i + 1) * delimiterSize))) { return b }
    }).length
  } else {
    curBlockIdx = Math.floor(val.length / (blockSize + delimiterSize))
  }

  delimiter = isArray(delimiter) ? delimiter[curBlockIdx - 1] || delimiter[delimiter.length - 1] : delimiter
  delimiter = isArray(delimiter) ? delimiter : [delimiter]

  lastKey = lastKey.toLowerCase()

  let directionInformation = cursorMoves[lastKey] ? cursorMoves[lastKey] : cursorMoves.default
  let removeStart = startSelect + directionInformation.dir
  let arr = val.split('')

  while (delimiter.includes(arr[removeStart])) { removeStart += directionInformation.dir }
  arr.splice(removeStart, 1)
  return arr.join('')
}

export const checkInputIsDelimiter = (val, blockSize, delimiterSize, delimiter, lastKey) => {
  let curBlockSize = (blockSize.constructor === Array ? blockSize.filter((b, i) => blockSize.slice(0, i + 1).reduce((p, n) => p + n + delimiterSize, 0) >= val.length) : blockSize)
  delimiter = delimiter.constructor === Array ? delimiter[blockSize.length - curBlockSize.length] || delimiter[delimiter.length - 1] : delimiter
  // need to make it so that above works with single blocksize and single delimter
  // fix replace so that it doesnt replace delimiters when putting it stuff into other blocks that have separate delimiters
  if (delimiter.charCodeAt(0) === lastKey.charCodeAt(0)) {
    return false
  }
}
export const checkDeletingDelimiter = (val, delimiter, element, lastKey) => {
  // if(lastKey !== "Backspace"){return false}
  delimiter = delimiter.constructor === Array ? delimiter : [delimiter]
  if (delimiter.includes(val[element.selectionStart])) {
    return true
  }
}
export const checkArrowKeys = (lastKey, startSelect, element, val, delimiter) => {
  lastKey = lastKey.toLowerCase()
  if (!(lastKey === 'arrowright' || lastKey === 'arrowleft')) { return false }
  let dir = lastKey === 'arrowright' ? -1 : 0
  let fix = lastKey === 'arrowright' ? 1 : -1
  let actualPos = startSelect + fix
  if (val[actualPos + dir] !== delimiter) { return false }
  while (val[actualPos + fix] === delimiter) { actualPos += fix }
  if (lastKey === 'arrowright') {
    element.setSelectionRange(actualPos, actualPos)
  } else {
    element.setSelectionRange(actualPos + 1, actualPos + 1)
  } // More dynamic way to do tihs? idk
}

export const filterString = (val, blockSize, blockFormatting) => {
  let final = []
  if (blockFormatting.length === 0) {
    return val
  }
  for (let i = 0; i <= val.length - 1; i++) {
    let format = isArray(blockFormatting) ? blockFormatting[i] || null : blockFormatting

    // let curBlockSize = isArray(blockSize) ? blockSize[i] || blockSize[blockSize.length - 1] : blockSize
    if (!format) {
      final.push(val[i])
      continue
    }
    let text = val[i]
    text.text = blockFormatter(format, val[i].text.join(''), val).split('')
    final.push(text)
  }
  return final
}

export const setMaxLength = (val, maxLength) => {
  if (maxLength !== 0) {
    val = val.substring(0, maxLength)
  }
  return val
}

export const splitIntoBlocks = (val, blockSize, delimiterSize, delimiter, maxLength, blockFormatting) => {
  let blockedOutput = []
  const immutableBSize = blockSize
  let count = 0 // Current index of block being processed from block array
  for (let i = 0; i <= val.length; i++) {
    blockSize = isArray(immutableBSize) ? immutableBSize[count] || immutableBSize[immutableBSize.length - 1] : blockSize
    let iterableSize = isArray(immutableBSize)  ? immutableBSize.slice(0, count + 1).reduce((p, n) => p + n) : count * blockSize // Current total of blocks
    if ((iterableSize - i) % (blockSize) == 0 && i !== 0) {
      count++
    }
    if (!blockedOutput[count] && val.substring(i, i+1) !== '') {
      blockedOutput[count] = { text: [val.substring(i, i + 1)], type: 'text' }
      if (blockFormatting[count]) { blockedOutput[count]['format'] = blockFormatting[count] }
    } else if(val.substring(i, i+1) !== '') {
      blockedOutput[count].text.push(val.substring(i, i + 1))
    }
  }
  return blockedOutput
}

export const setDelimiters = (val, blockSize, delimiterSize, delimiter, maxLength, blockFormatting) => {
  let newArray = []
  const immutableBSize = blockSize
  // console.log(val)
  let length = val.length
  for (let i = 0; i <= length; i++) {
    blockSize = isArray(immutableBSize) ? immutableBSize[i] || immutableBSize[immutableBSize.length - 1] : blockSize
    let finalLength = isArray(immutableBSize) ? maxLength !== 0 ? maxLength : immutableBSize.reduce((p, n) => p + n) : maxLength
    if (val[i].type === "text" && val[i].text.length === blockSize) {
      console.log('up')
      let actualDelimiter = isArray(delimiter) ? delimiter[i%1] || delimiter[delimiter.length - 1] : delimiter
      val.splice(i+1, 0, { text: new Array(delimiterSize).fill(actualDelimiter), type: 'delimiter' })
      // console.log(val[i])
      // console.log('delim')
      // console.log(JSON.stringify(val))
      // console.log(JSON.stringify(val))
      // i++
    }
      console.log(val)
  }
  return val
}
export const blockFormatter = (blockType, blockText, allBlocks) => {
  switch (blockType) {
    case 'num':
      return blockText.split('').filter(b => !isNaN(parseInt(b))).join('')
    case 'h':
    case 'M':
      let format = dateFormats[blockType]
      blockText = blockText.split('').reduce((p, n) => p + (isNaN(parseInt(n)) ? '' : n), '') // remove all non number characters
      if (blockText.length === 1) {
        if (parseInt(blockText[0]) > parseInt(String(format.max)[0])) {
          // this.startSelect++ fix this implement somehow
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
    case 'd':
      let leap = false
      let daysInMonth = 30
      let monthInput = allBlocks.filter(b => b.format === 'm')
      let yearInput = allBlocks.filter(b => b.format === 'yyyy')
      if (yearInput[0]) {
        if (yearInput[0].text.length === 4) {
          if (yearInput.text % 4 === 0) {
            leap = true
          }
        }
      }
      if (monthInput[0]) {
        let month = monthInput[0].text.join('')
        if (!isNaN(parseInt(month)) && month.toString().length === 2) {
          daysInMonth = leap && month === '2' ? months[month] + 1 : months[month]
        }
      }
      console.log(String(formatMinMax(blockText, 0, daysInMonth)))
      return String(formatMinMax(blockText, 0, daysInMonth))
    case 'm':
      // let yearInput = allBlocks.filter(b => b.format === "yyyy")
      // if(yearInput[0]){
      //   if(yearInput[0].text.length === 4){

      //   }
      // }
      return blockText
    case 'yyyy':
      return blockText
  }
}

export const setAffixes = (val, suffix, prefix, maxLength) => {
  if (suffix) {
    if (maxLength === 0) {
      console.warn('You must have non-zero maxLength property to add a suffix')
    } else {
      // hmm
    }
  }
  if (prefix) {
    val = [{ text: prefix.split(''), type: 'prefix' }].concat(val)
  }
  return val
}

export const turnIntoString = (val) => {
  if (val.length !== 0) {
    val = val.reduce((p, n, i) => { return { text: p.text.concat(n.text) } }).text.join('')
  }
  return val
}

export const removeAffixes = (val, suffix, prefix) => {
  if (suffix) {
    val = val.replace(suffix, '')
  }
  if (prefix) {
    val = val.substr(prefix.length, val.length)
  }
  return val
}

export const setCursorPosition = (val, lastKey, startSelect, endSelect, delimiter, delimiterSize, blockSize, prefix, element) => {
  let cursorBuffer = (cursorMoves[lastKey.toLowerCase()] || cursorMoves['default'])
  let extraBuffer = 0
  let curBlockSize = (blockSize.constructor === Array ? blockSize.filter((b, i) => blockSize.slice(0, i + 1).reduce((p, n) => p + n + delimiterSize, 0) <= val.length)
    : new Array(Math.floor(val.length / (blockSize + delimiterSize))))
  extraBuffer = prefix ? prefix.length : extraBuffer
  delimiter = delimiter.constructor === Array ? delimiter[curBlockSize.length - 1] || delimiter[delimiter.length - 1] : delimiter
  if (val[startSelect + cursorBuffer.buffer] === delimiter) {
    let curIdx = startSelect + cursorBuffer.buffer
    while (true) {
      if (val[curIdx] !== delimiter || extraBuffer === delimiterSize) {
        break
      } else {
        curIdx += cursorBuffer.dir
        extraBuffer += cursorBuffer.dir
      }
    }
    extraBuffer = cursorBuffer.stopAtDelim ? extraBuffer : extraBuffer + cursorBuffer.dir
  }
  // if (this.pushCursor) { extraBuffer += this.pushCursor; this.pushCursor = null }
  element.setSelectionRange(startSelect + cursorBuffer.buffer + extraBuffer, startSelect + cursorBuffer.buffer + extraBuffer)
}

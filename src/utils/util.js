const cursorMoves = {
  backspace: { buffer: -1, dir: -1, stopAtDelim: true },
  delete: { buffer: 0, dir: 1, stopAtDelim: true },
  arrowright: { buffer: 1, dir: 1, stopAtDelim: true },
  arrowleft: { buffer: 1, dir: 1, stopAtDelim: true },
  default: { buffer: 1, dir: 1, stopAtDelim: false }
}
const dateFormats = {
  m: { size: 2, max: 60, min: 0 }, // minute
  H: { size: 2, max: 24, min: 0 }, // 24 hour
  h: { size: 2, max: 12, min: 0 }, // 12 hour
  s: { size: 2, max: 60, min: 0 },
  ampm: { options: ['AM', 'PM'] }
}


export const removeDelimiters = (val, delimiter, blockSize, delimiterSize) =>  {
  let blocks = blockSize.constructor === Array ? blockSize : [blockSize]
  let delimiters = delimiter.constructor === Array ? delimiter : [delimiter]

  let getDelim = (i) => delimiters[i] || delimiters[delimiters.length - 1]
  let getBlockSize = (i) => blocks[i] || blocks[blocks.length - 1]

  let c = 0
  return val.split('').reduce((acc, n, idx) => {
    let actualIdx = idx - 1
    c = idx === getBlockSize(c) ? c + 1 : c
    let blockSize = (getBlockSize(c) + delimiterSize)
    let reg = new RegExp(getDelim(Math.floor((actualIdx / blockSize))).replace(getDelim(Math.floor(actualIdx / blockSize)), '\\$&'), 'g')
    return acc + n.replace(reg, '')
  }, '')
}

export const fixString = (val, startSelect, lastKey, delimiter, blockSize, delimiterSize ) => {
  let curBlockSize = (blockSize.constructor === Array ? blockSize.filter((b, i) => blockSize.slice(0, i + 1).reduce((p, n) => p + n + delimiterSize, 0) >= val.length) : blockSize)
  delimiter = delimiter.constructor === Array ? delimiter[blockSize.length - curBlockSize.length] || delimiter[delimiter.length - 1] : delimiter
  delimiter = delimiter.constructor === Array ? delimiter : [delimiter]
  lastKey = lastKey.toLowerCase()
  let directionInformation = cursorMoves[lastKey] ? cursorMoves[lastKey] : cursorMoves.default
  let removeStart = startSelect + directionInformation.dir
  let arr = val.split('')
  console.log(arr)
  while (delimiter.includes(arr[removeStart])) { removeStart += directionInformation.dir }
  arr.splice(removeStart, 1)
  console.log(arr)
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
export const checkDeletingDelimiter = (val, delimiter, startSelect, lastKey) => {
  // if(lastKey !== "Backspace"){return false}
  delimiter = delimiter.constructor === Array ? delimiter : [delimiter]
  if (delimiter.includes(val[element.startSelect])) {
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
  const immutableBSize = blockSize
  let count = 0
  let final = ''
  if (blockFormatting.length === 0) {
    return valid
  }
  for (let i = 0; i <=val.length - 1;) {
    let format = blockFormatting.constructor === Array ? blockFormatting[count] || null : blockFormatting
    blockSize = immutableBSize.constructor === Array ? immutableBSize[count] || immutableBSize[immutableBSize.length - 1] : blockSize
    if (!format) {
      final += val.substring(i, i + blockSize)
      count++
      i += blockSize
      continue
    }
    let valid = blockFormatter(format, val.substring(i, i + blockSize))
    final += valid
    count++
    i += blockSize
  }
  return val
}

export const setMaxLength = (val, maxLength) => {
  if (maxLength !== 0) {
    val = val.substring(0, maxLength)
  }
  return val
}

export const splitIntoBlocks = (val, blockSize, delimiterSize, delimiter, maxLength) => {
  const immutableBSize = blockSize
  let it = 0 // Current index of which the blockOutput is being pushed to (incremented by wto because a space array is added)
  let blockedOutput = []
  let count = 0 // Current index of block being processed from block array
  for (let i = 0; i <= val.length; i++) {
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
    blockedOutput[it].text.push(val.substring(i, i + 1))
  }
  return blockedOutput
}
export const blockFormatter = (blockType, blockText) => {
  switch (blockType) {
    case 'num':
      return blockText.split('').filter(b => !isNaN(parseInt(b))).join('')
    case 'h':
    case 'm':
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

export const removeAffixes = (val, suffix, prefix ) =>  {
    if (suffix) {
      val = val.replace(suffix, '')
    }
    if (prefix) {
      val = val.substr(prefix.length, val.length)
    }
    return val
  }
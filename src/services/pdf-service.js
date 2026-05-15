import { PDFDocument } from 'pdf-lib'
import CryptoJS from 'crypto-js'

const A4_DIMENSIONS = {
  width: 595.28,
  height: 841.89
}

function arrayBufferToWordArray(arrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer)
  const words = []

  for (let i = 0; i < uint8Array.length; i += 4) {
    let word = 0
    for (let j = 0; j < 4 && i + j < uint8Array.length; j++) {
      word = (word << 8) | uint8Array[i + j]
    }
    words.push(word)
  }

  return CryptoJS.lib.WordArray.create(words, uint8Array.length)
}

export async function superposerImageSurPdf(pdfSource, imageFile, options = {}) {
  let pdfBytes
  if (pdfSource instanceof Blob || pdfSource instanceof File) {
    pdfBytes = await pdfSource.arrayBuffer()
  } else if (typeof pdfSource === 'string') {
    const response = await fetch(pdfSource)
    pdfBytes = await response.arrayBuffer()
  } else {
    pdfBytes = pdfSource
  }

  const pdfDoc = await PDFDocument.load(pdfBytes)
  const imageBytes = await imageFile.arrayBuffer()
  const image = await pdfDoc.embedPng(imageBytes)

  const pages = pdfDoc.getPages()
  const lastPage = pages[pages.length - 1]
  const pageHeight = lastPage.getHeight()
  const pageWidth = lastPage.getWidth()

  const imageRatio = image.height / image.width
  const finalWidth = options.imageWidth || 150
  const finalHeight = finalWidth * imageRatio

  let x, y

  if (options.position) {
    x = options.position.x - finalWidth / 2
    y = options.position.y - finalHeight / 2

    if (options.margin) {
      x += options.margin.x || 0
      y += options.margin.y || 0
    }
  } else {
    x = pageWidth - finalWidth - 20
    y = 20
  }

  if (x < 0) x = 0
  if (y < 0) y = 0
  if (x + finalWidth > pageWidth) x = pageWidth - finalWidth
  if (y + finalHeight > pageHeight) y = pageHeight - finalHeight

  lastPage.drawImage(image, {
    x,
    y,
    width: finalWidth,
    height: finalHeight
  })

  const signedPdfBytes = await pdfDoc.save()
  return new Blob([signedPdfBytes], { type: 'application/pdf' })
}

export function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

export function percentToPdfPosition(percentCoords, options = {}) {
  const {
    fromTop = false,
    pageWidth = A4_DIMENSIONS.width,
    pageHeight = A4_DIMENSIONS.height
  } = options

  const xPercent = typeof percentCoords.x === 'string'
    ? parseFloat(percentCoords.x.replace('%', ''))
    : percentCoords.x

  const yPercent = typeof percentCoords.y === 'string'
    ? parseFloat(percentCoords.y.replace('%', ''))
    : percentCoords.y

  if (isNaN(xPercent) || isNaN(yPercent)) {
    throw new Error('Les coordonnées doivent être des nombres valides')
  }

  if (xPercent < 0 || xPercent > 100 || yPercent < 0 || yPercent > 100) {
    throw new Error('Les pourcentages doivent être entre 0 et 100')
  }

  const x = (xPercent / 100) * pageWidth
  let y = (yPercent / 100) * pageHeight

  if (fromTop) {
    y = pageHeight - y
  }

  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100
  }
}

export function pdfPositionToPercent(pdfPosition, options = {}) {
  const {
    fromTop = false,
    pageWidth = A4_DIMENSIONS.width,
    pageHeight = A4_DIMENSIONS.height
  } = options

  let { x, y } = pdfPosition

  if (fromTop) {
    y = pageHeight - y
  }

  const xPercent = (x / pageWidth) * 100
  const yPercent = (y / pageHeight) * 100

  return {
    x: `${Math.round(xPercent * 100) / 100}%`,
    y: `${Math.round(yPercent * 100) / 100}%`
  }
}

export function encryptText(text, password) {
  if (!text || !password) {
    throw new Error('Le texte et le mot de passe sont requis')
  }
  if (typeof text !== 'string' || typeof password !== 'string') {
    throw new Error('Le texte et le mot de passe doivent être des chaînes de caractères')
  }

  const salt = CryptoJS.lib.WordArray.random(16)
  const iv = CryptoJS.lib.WordArray.random(16)

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256
  })

  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  const result = {
    salt: salt.toString(),
    iv: iv.toString(),
    encrypted: encrypted.toString()
  }

  return btoa(JSON.stringify(result))
}

export function decryptText(encryptedData, password) {
  if (!encryptedData || !password) {
    throw new Error('Les données chiffrées et le mot de passe sont requis')
  }

  const data = JSON.parse(atob(encryptedData))
  const { salt, iv, encrypted } = data

  const key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256
  })

  const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  const plain = decrypted.toString(CryptoJS.enc.Utf8)
  if (!plain) {
    throw new Error('Mot de passe incorrect ou données corrompues')
  }
  return plain
}

export async function generateDocumentHash(blob) {
  const arrayBuffer = await blob.arrayBuffer()
  const wordArray = arrayBufferToWordArray(arrayBuffer)
  const hash = CryptoJS.SHA256(wordArray)
  return hash.toString(CryptoJS.enc.Hex)
}

export async function verifyDocumentIntegrity(documentBlob, storedHash) {
  if (!documentBlob || !storedHash) {
    return { isVerified: false, error: 'Paramètres manquants' }
  }

  const currentHash = await generateDocumentHash(documentBlob)
  return {
    isVerified: currentHash === storedHash.trim().toLowerCase(),
    currentHash,
    storedHash: storedHash.trim().toLowerCase()
  }
}

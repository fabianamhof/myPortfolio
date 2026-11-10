import { zipSync } from 'fflate'
import { $, debounce, downloadBlob, formatBytes, toast } from './common'

/** Most browsers refuse or crash on canvases above ~16.7 megapixels (Safari's limit). */
const MAX_CANVAS_PIXELS = 16_777_216

const EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

interface Result {
  blob: Blob
  url: string
  width: number
  height: number
  mime: string
}

interface Item {
  file: File
  originalUrl: string
  el: HTMLLIElement
  result?: Result
  error?: string
}

const items: Item[] = []
let generation = 0
let avifSupported = false

// --- Encoding ----------------------------------------------------------------

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Encoding failed'))), mime, quality)
  )
}

/** Browsers silently fall back to PNG when they cannot encode a type – detect that. */
async function detectEncoder(mime: string): Promise<boolean> {
  const c = document.createElement('canvas')
  c.width = c.height = 2
  try {
    return (await canvasToBlob(c, mime, 0.5)).type === mime
  } catch {
    return false
  }
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    // Fallback for browsers with limited createImageBitmap support
    const img = new Image()
    img.src = URL.createObjectURL(file)
    try {
      await img.decode()
      return img
    } finally {
      URL.revokeObjectURL(img.src)
    }
  }
}

function settings() {
  return {
    format: $<HTMLSelectElement>('#format').value,
    quality: parseInt($<HTMLInputElement>('#quality').value) / 100,
    maxSize: parseInt($<HTMLSelectElement>('#max-size').value)
  }
}

function targetMime(file: File, format: string): string {
  if (format !== 'original') return format
  if (file.type === 'image/avif' && !avifSupported) return 'image/webp'
  return EXT[file.type] ? file.type : 'image/webp'
}

async function compress(file: File): Promise<Result> {
  const { format, quality, maxSize } = settings()
  const source = await decode(file)
  const srcW = source.width
  const srcH = source.height

  let scale = 1
  if (maxSize > 0) scale = Math.min(1, maxSize / Math.max(srcW, srcH))
  if (srcW * srcH * scale * scale > MAX_CANVAS_PIXELS) scale = Math.sqrt(MAX_CANVAS_PIXELS / (srcW * srcH))
  const width = Math.max(1, Math.round(srcW * scale))
  const height = Math.max(1, Math.round(srcH * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const mime = targetMime(file, format)
  if (mime === 'image/jpeg') {
    // JPEG has no transparency: paint white instead of black behind transparent pixels
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, width, height)
  if ('close' in source) source.close()

  const blob = await canvasToBlob(canvas, mime, quality)
  canvas.width = canvas.height = 0 // free memory early
  return { blob, url: URL.createObjectURL(blob), width, height, mime }
}

// --- Rendering ---------------------------------------------------------------

const template = $<HTMLTemplateElement>('#result-template')
const resultsEl = $('#results')

function outputName(item: Item): string {
  const base = item.file.name.replace(/\.[^.]+$/, '') || 'image'
  return `${base}.${EXT[item.result!.mime]}`
}

function renderItem(item: Item) {
  const el = item.el
  const img = $<HTMLImageElement>('img', el)
  const badge = $('.badge', el)
  const meta = $('.meta', el)
  $('.name', el).textContent = item.file.name
  el.querySelectorAll<HTMLButtonElement>('.compare-btn, .download-btn').forEach((b) => (b.disabled = !item.result))

  if (item.error) {
    img.src = ''
    badge.textContent = 'Error'
    badge.className = 'badge absolute right-2 top-2 rounded-full bg-red-500/80 px-2 py-0.5 text-xs'
    meta.textContent = item.error
    return
  }
  if (!item.result) {
    img.src = item.originalUrl
    img.style.opacity = '0.4'
    badge.textContent = '…'
    meta.textContent = `${formatBytes(item.file.size)} · processing`
    return
  }

  const r = item.result
  const diff = 1 - r.blob.size / item.file.size
  img.src = r.url
  img.style.opacity = '1'
  badge.textContent = diff >= 0 ? `−${Math.round(diff * 100)} %` : `+${Math.round(-diff * 100)} %`
  badge.className = `badge absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold ${
    diff >= 0 ? 'bg-emerald-400 text-slate-900' : 'bg-amber-400 text-slate-900'
  }`
  meta.textContent = `${formatBytes(item.file.size)} → ${formatBytes(r.blob.size)} · ${r.width}×${r.height} · ${EXT[r.mime].toUpperCase()}`
  if (diff < 0) meta.textContent += ' · larger than original, try WebP or lower quality'
}

function renderSummary() {
  const done = items.filter((i) => i.result)
  $('#summary').classList.toggle('hidden', items.length === 0)
  $<HTMLButtonElement>('#zip-btn').disabled = done.length === 0
  const before = done.reduce((s, i) => s + i.file.size, 0)
  const after = done.reduce((s, i) => s + i.result!.blob.size, 0)
  const pending = items.length - done.length - items.filter((i) => i.error).length
  $('#summary-text').textContent =
    done.length === 0
      ? 'Processing…'
      : `${formatBytes(before)} → ${formatBytes(after)} (${before > after ? '−' : '+'}${Math.abs(Math.round((1 - after / before) * 100))} %)` +
        (pending > 0 ? ` · ${pending} pending` : '')
}

async function processAll(list: Item[] = items) {
  const gen = ++generation
  for (const item of list) {
    if (gen !== generation) return // settings changed – a newer run takes over
    try {
      const result = await compress(item.file)
      if (gen !== generation || !items.includes(item)) {
        URL.revokeObjectURL(result.url)
        return
      }
      if (item.result) URL.revokeObjectURL(item.result.url)
      item.result = result
      item.error = undefined
    } catch (e) {
      console.error(e)
      item.error = 'This file could not be read by your browser (e.g. HEIC or a corrupted image).'
    }
    renderItem(item)
    renderSummary()
  }
}

function addFiles(files: ArrayLike<File>) {
  const added: Item[] = []
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue
    const el = template.content.firstElementChild!.cloneNode(true) as HTMLLIElement
    const item: Item = { file, originalUrl: URL.createObjectURL(file), el }
    $('.download-btn', el).addEventListener('click', () => item.result && downloadBlob(item.result.blob, outputName(item)))
    const open = () => item.result && openCompare(item)
    $('.compare-btn', el).addEventListener('click', open)
    $('.thumb', el).addEventListener('click', open)
    items.push(item)
    added.push(item)
    resultsEl.appendChild(el)
    renderItem(item)
  }
  if (added.length === 0) {
    toast('No images found')
    return
  }
  renderSummary()
  // If a run is already in progress, restart it for everything not finished yet
  processAll(items.filter((i) => !i.result && !i.error))
}

function clearAll() {
  generation++
  for (const item of items) {
    URL.revokeObjectURL(item.originalUrl)
    if (item.result) URL.revokeObjectURL(item.result.url)
  }
  items.length = 0
  resultsEl.innerHTML = ''
  renderSummary()
}

// --- Before / after comparison ----------------------------------------------

const dialog = $<HTMLDialogElement>('#compare-dialog')
const compareEl = $('#compare')

function openCompare(item: Item) {
  $<HTMLImageElement>('#cmp-img-before').src = item.originalUrl
  $<HTMLImageElement>('#cmp-img-after').src = item.result!.url
  $('#cmp-before').textContent = formatBytes(item.file.size)
  $('#cmp-after').textContent = formatBytes(item.result!.blob.size)
  compareEl.style.setProperty('--pos', '50%')
  dialog.showModal()
}

let dragging = false
const setPos = (e: PointerEvent) => {
  const r = compareEl.getBoundingClientRect()
  const pos = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))
  compareEl.style.setProperty('--pos', `${pos}%`)
}
compareEl.addEventListener('pointerdown', (e) => {
  dragging = true
  compareEl.setPointerCapture(e.pointerId)
  setPos(e)
})
compareEl.addEventListener('pointermove', (e) => (dragging || e.pointerType === 'mouse') && setPos(e))
compareEl.addEventListener('pointerup', () => (dragging = false))
$('#cmp-close').addEventListener('click', () => dialog.close())
dialog.addEventListener('click', (e) => e.target === dialog && dialog.close())

// --- Wiring ------------------------------------------------------------------

const input = $<HTMLInputElement>('#file-input')
input.addEventListener('change', () => {
  if (input.files) addFiles(input.files)
  input.value = ''
})

const dropzone = $('#dropzone')
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzone.dataset.active = 'true'
})
dropzone.addEventListener('dragleave', () => (dropzone.dataset.active = 'false'))
dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropzone.dataset.active = 'false'
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
})
// Don't navigate away when a file is dropped next to the drop zone
window.addEventListener('dragover', (e) => e.preventDefault())
window.addEventListener('drop', (e) => e.preventDefault())

window.addEventListener('paste', (e) => {
  const files = e.clipboardData?.files
  if (files && files.length) addFiles(files)
})

const reprocess = debounce(() => {
  if (items.length) processAll(items.filter((i) => !i.error))
}, 250)

$<HTMLInputElement>('#quality').addEventListener('input', (e) => {
  $('#quality-value').textContent = (e.target as HTMLInputElement).value
  reprocess()
})
$('#format').addEventListener('change', () => {
  $<HTMLInputElement>('#quality').disabled = $<HTMLSelectElement>('#format').value === 'image/png'
  reprocess()
})
$('#max-size').addEventListener('change', reprocess)
$('#clear-btn').addEventListener('click', clearAll)

$('#zip-btn').addEventListener('click', async () => {
  const done = items.filter((i) => i.result)
  const used = new Set<string>()
  const entries: Record<string, [Uint8Array, { level: 0 }]> = {}
  for (const item of done) {
    let name = outputName(item)
    for (let n = 2; used.has(name); n++) name = outputName(item).replace(/(\.[^.]+)$/, `-${n}$1`)
    used.add(name)
    // Images are already compressed – store them without deflating again
    entries[name] = [new Uint8Array(await item.result!.blob.arrayBuffer()), { level: 0 }]
  }
  downloadBlob(new Blob([zipSync(entries)], { type: 'application/zip' }), 'compressed-images.zip')
})

detectEncoder('image/avif').then((ok) => {
  avifSupported = ok
  const option = $<HTMLOptionElement>('#format option[value="image/avif"]')
  option.disabled = !ok
  option.textContent = ok ? 'AVIF (smallest)' : 'AVIF (not supported by your browser)'
})

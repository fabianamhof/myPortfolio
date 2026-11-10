// Background removal with U²-Netp (Apache-2.0) running locally via ONNX Runtime Web (WASM).
// Pre-/post-processing follows the reference implementation used by rembg.
import type { InferenceSession } from 'onnxruntime-web'
import wasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url'
import { $, debounce, downloadBlob, toast } from './common'

const MODEL_URL = '/models/u2netp.onnx'
const SIZE = 320 // U²-Net input resolution
const MAX_OUTPUT = 4096 // longest side of the result
const MEAN = [0.485, 0.456, 0.406]
const STD = [0.229, 0.224, 0.225]

type Background = 'transparent' | 'color' | 'blur'

let sessionPromise: Promise<InferenceSession> | undefined
let ortModule: typeof import('onnxruntime-web') | undefined

const state = {
  name: 'image',
  source: undefined as HTMLCanvasElement | undefined, // original, scaled to output size
  mask: undefined as Float32Array | undefined, // raw 320×320 prediction, 0..1
  background: 'transparent' as Background,
  busy: false
}

const stage = $('#stage')
const outCanvas = $<HTMLCanvasElement>('#out-canvas')
const beforeImg = $<HTMLImageElement>('#img-before')
const statusEl = $('#status')

function setStatus(text: string, scanning = false) {
  statusEl.textContent = text
  $('#scan').classList.toggle('hidden', !scanning)
}

// --- Model -------------------------------------------------------------------

function loadSession(): Promise<InferenceSession> {
  sessionPromise ??= (async () => {
    // Loaded on demand so the page itself stays light
    ortModule = await import('onnxruntime-web/wasm')
    ortModule.env.wasm.wasmPaths = { wasm: wasmUrl }
    return ortModule.InferenceSession.create(MODEL_URL, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' })
  })()
  sessionPromise.catch(() => (sessionPromise = undefined)) // allow retry after a network error
  return sessionPromise
}

async function predict(source: HTMLCanvasElement): Promise<Float32Array> {
  const session = await loadSession()
  const ort = ortModule!

  const c = document.createElement('canvas')
  c.width = c.height = SIZE
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, SIZE, SIZE)
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE)

  // Normalise by the brightest channel value, then by ImageNet mean/std (NCHW layout)
  let max = 1e-6
  for (let i = 0; i < data.length; i++) if (i % 4 !== 3 && data[i] > max) max = data[i]
  const input = new Float32Array(3 * SIZE * SIZE)
  for (let p = 0; p < SIZE * SIZE; p++) {
    for (let ch = 0; ch < 3; ch++) input[ch * SIZE * SIZE + p] = (data[p * 4 + ch] / max - MEAN[ch]) / STD[ch]
  }

  const feeds = { [session.inputNames[0]]: new ort.Tensor('float32', input, [1, 3, SIZE, SIZE]) }
  const results = await session.run(feeds)
  const pred = results[session.outputNames[0]].data as Float32Array

  // Min-max normalise the prediction to 0..1
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < pred.length; i++) {
    if (pred[i] < lo) lo = pred[i]
    if (pred[i] > hi) hi = pred[i]
  }
  const out = new Float32Array(pred.length)
  const range = hi - lo || 1
  for (let i = 0; i < pred.length; i++) out[i] = (pred[i] - lo) / range
  for (const t of Object.values(results)) t.dispose?.()
  return out
}

// --- Compositing -------------------------------------------------------------

/** Maps the edge slider (0 = soft, 100 = hard) onto the mask values. */
function maskCanvas(mask: Float32Array): HTMLCanvasElement {
  const hardness = parseInt($<HTMLInputElement>('#edge').value) / 100
  const width = 1 - hardness * 0.95 // transition width around 0.5
  const c = document.createElement('canvas')
  c.width = c.height = SIZE
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(SIZE, SIZE)
  for (let i = 0; i < mask.length; i++) {
    const a = Math.min(1, Math.max(0, (mask[i] - 0.5) / width + 0.5))
    img.data[i * 4 + 3] = Math.round(a * 255)
  }
  ctx.putImageData(img, 0, 0)
  return c
}

function composite() {
  const { source, mask } = state
  if (!source || !mask) return
  const w = source.width
  const h = source.height
  outCanvas.width = w
  outCanvas.height = h
  const ctx = outCanvas.getContext('2d')!

  // 1. Cut-out: draw the photo, keep only pixels covered by the (upscaled, smoothed) mask
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(source, 0, 0)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(maskCanvas(mask), 0, 0, w, h)

  // 2. Optional new background behind the subject
  ctx.globalCompositeOperation = 'destination-over'
  if (state.background === 'color') {
    ctx.fillStyle = $<HTMLInputElement>('#bg-color').value
    ctx.fillRect(0, 0, w, h)
  } else if (state.background === 'blur') {
    // Down- and upscaling blurs in every browser (ctx.filter is not universally supported)
    const small = document.createElement('canvas')
    const f = Math.max(w, h) / 48
    small.width = Math.max(1, Math.round(w / f))
    small.height = Math.max(1, Math.round(h / f))
    const sctx = small.getContext('2d')!
    sctx.imageSmoothingQuality = 'high'
    sctx.drawImage(source, 0, 0, small.width, small.height)
    ctx.drawImage(small, 0, 0, w, h)
  }
  ctx.globalCompositeOperation = 'source-over'
}

const recomposite = debounce(composite, 30)

// --- Flow --------------------------------------------------------------------

async function handleFile(file: File) {
  if (!file.type.startsWith('image/')) return toast('Please choose an image')
  if (state.busy) return
  state.busy = true
  $<HTMLButtonElement>('#download-btn').disabled = true

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_OUTPUT / Math.max(bitmap.width, bitmap.height))
    const source = document.createElement('canvas')
    source.width = Math.round(bitmap.width * scale)
    source.height = Math.round(bitmap.height * scale)
    source.getContext('2d')!.drawImage(bitmap, 0, 0, source.width, source.height)
    bitmap.close()

    state.name = file.name.replace(/\.[^.]+$/, '') || 'image'
    state.source = source
    state.mask = undefined

    $('#dropzone').classList.add('hidden')
    $('#workspace').classList.remove('hidden')
    stage.style.aspectRatio = `${source.width} / ${source.height}`
    stage.style.maxWidth = `min(100%, calc(70vh * ${source.width / source.height}))`
    stage.style.setProperty('--pos', '0%')
    beforeImg.src = source.toDataURL('image/jpeg', 0.9)
    outCanvas.width = outCanvas.height = 0

    setStatus(sessionPromise ? 'Removing background…' : 'Loading AI model (4.6 MB, only once)…', true)
    const t0 = performance.now()
    await loadSession()
    setStatus('Removing background…', true)
    state.mask = await predict(source)
    composite()
    animateReveal()
    setStatus(`Done in ${((performance.now() - t0) / 1000).toFixed(1)} s · drag across the image to compare`)
    $<HTMLButtonElement>('#download-btn').disabled = false
  } catch (e) {
    console.error(e)
    setStatus('Something went wrong – your browser may not support this image or WebAssembly.')
  } finally {
    state.busy = false
  }
}

/** Slides the before/after divider across once, then rests on the result. */
function animateReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return stage.style.setProperty('--pos', '0%')
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / 900)
    const eased = 1 - Math.pow(1 - t, 3)
    stage.style.setProperty('--pos', `${100 - eased * 100}%`)
    if (t < 1) requestAnimationFrame(step)
  }
  stage.style.setProperty('--pos', '100%')
  requestAnimationFrame(step)
}

// --- Wiring ------------------------------------------------------------------

const input = $<HTMLInputElement>('#file-input')
input.addEventListener('change', () => {
  if (input.files?.[0]) handleFile(input.files[0])
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
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
})
window.addEventListener('dragover', (e) => e.preventDefault())
window.addEventListener('drop', (e) => {
  e.preventDefault()
  const file = e.dataTransfer?.files[0]
  if (file && !$('#workspace').classList.contains('hidden')) handleFile(file)
})
window.addEventListener('paste', (e) => {
  const file = e.clipboardData?.files[0]
  if (file) handleFile(file)
})

// Before/after divider (the result sits on top, clipped from the left)
let dragging = false
const setPos = (e: PointerEvent) => {
  const r = stage.getBoundingClientRect()
  stage.style.setProperty('--pos', `${Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))}%`)
}
stage.addEventListener('pointerdown', (e) => {
  if (!state.mask) return
  dragging = true
  stage.setPointerCapture(e.pointerId)
  setPos(e)
})
stage.addEventListener('pointermove', (e) => dragging && setPos(e))
stage.addEventListener('pointerup', () => (dragging = false))

document.querySelectorAll<HTMLButtonElement>('#bg-chips .chip').forEach((chip) =>
  chip.addEventListener('click', () => {
    state.background = chip.dataset.bg as Background
    document
      .querySelectorAll<HTMLButtonElement>('#bg-chips .chip')
      .forEach((c) => c.setAttribute('aria-pressed', String(c === chip)))
    $('#color-row').classList.toggle('hidden', state.background !== 'color')
    $('#download-btn').textContent = state.background === 'transparent' ? 'Download PNG' : 'Download JPG'
    composite()
  })
)
$('#bg-color').addEventListener('input', recomposite)
$('#edge').addEventListener('input', recomposite)

$('#download-btn').addEventListener('click', () => {
  const transparent = state.background === 'transparent'
  outCanvas.toBlob(
    (blob) => blob && downloadBlob(blob, `${state.name}-${transparent ? 'cutout.png' : 'new-bg.jpg'}`),
    transparent ? 'image/png' : 'image/jpeg',
    0.92
  )
})

$('#new-btn').addEventListener('click', () => input.click())

// Warm up: start downloading the model as soon as the user shows intent
dropzone.addEventListener('pointerenter', () => loadSession().catch(() => undefined), { once: true })

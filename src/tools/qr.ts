import QRCodeStyling, {
  type CornerDotType,
  type CornerSquareType,
  type DotType,
  type ErrorCorrectionLevel,
  type FileExtension,
  type Options
} from 'qr-code-styling'
import { $, contrastRatio, debounce, downloadBlob, toast } from './common'

type ContentType = 'url' | 'wifi' | 'email' | 'vcard'

const PREVIEW_SIZE = 320
const FALLBACK_DATA = 'https://www.fabianamhof.com'

const state = {
  type: 'url' as ContentType,
  logo: undefined as string | undefined
}

const val = (id: string) => $<HTMLInputElement>(`#${id}`).value.trim()
const checked = (id: string) => $<HTMLInputElement>(`#${id}`).checked

// --- Content encoding -------------------------------------------------------

/** Escapes characters with special meaning in the WIFI: / MECARD format. */
const escWifi = (s: string) => s.replace(/([\\;,:"])/g, '\\$1')
/** Escapes characters with special meaning in vCard values. */
const escVcard = (s: string) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/([,;])/g, '\\$1')

function buildData(): string {
  switch (state.type) {
    case 'url':
      return $<HTMLTextAreaElement>('#url-text').value.trim()
    case 'wifi': {
      const ssid = val('wifi-ssid')
      if (!ssid) return ''
      const enc = val('wifi-enc')
      const pass = enc === 'nopass' ? '' : `P:${escWifi(val('wifi-pass'))};`
      return `WIFI:T:${enc};S:${escWifi(ssid)};${pass}${checked('wifi-hidden') ? 'H:true;' : ''};`
    }
    case 'email': {
      const to = val('mail-to')
      if (!to) return ''
      const params = new URLSearchParams()
      if (val('mail-subject')) params.set('subject', val('mail-subject'))
      const body = $<HTMLTextAreaElement>('#mail-body').value.trim()
      if (body) params.set('body', body)
      // URLSearchParams encodes spaces as "+", mail clients expect %20
      const query = params.toString().replace(/\+/g, '%20')
      return `mailto:${to}${query ? `?${query}` : ''}`
    }
    case 'vcard': {
      const first = val('vc-first')
      const last = val('vc-last')
      if (!first && !last && !val('vc-phone') && !val('vc-email')) return ''
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escVcard(last)};${escVcard(first)};;;`,
        `FN:${escVcard([first, last].filter(Boolean).join(' '))}`
      ]
      if (val('vc-org')) lines.push(`ORG:${escVcard(val('vc-org'))}`)
      if (val('vc-phone')) lines.push(`TEL;TYPE=CELL:${val('vc-phone')}`)
      if (val('vc-email')) lines.push(`EMAIL:${val('vc-email')}`)
      if (val('vc-url')) lines.push(`URL:${val('vc-url')}`)
      lines.push('END:VCARD')
      return lines.join('\n')
    }
  }
}

// --- Options -----------------------------------------------------------------

function buildOptions(size: number): Options {
  const fg = val('fg')
  const useGradient = checked('use-gradient')
  const eclSetting = val('ecl')
  const ecl = (eclSetting === 'auto' ? (state.logo ? 'H' : 'M') : eclSetting) as ErrorCorrectionLevel
  const data = buildData() || FALLBACK_DATA

  return {
    width: size,
    height: size,
    type: 'canvas',
    data,
    margin: Math.round(size * 0.04),
    image: state.logo,
    qrOptions: { errorCorrectionLevel: ecl },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: parseFloat(val('logo-size')),
      margin: Math.round(size * 0.01),
      crossOrigin: 'anonymous'
    },
    dotsOptions: {
      type: val('dot-type') as DotType,
      color: fg,
      gradient: useGradient
        ? {
            type: 'linear',
            rotation: Math.PI / 4,
            colorStops: [
              { offset: 0, color: fg },
              { offset: 1, color: val('fg2') }
            ]
          }
        : undefined
    },
    cornersSquareOptions: { type: val('corner-type') as CornerSquareType, color: val('corner-color') },
    cornersDotOptions: { type: val('corner-dot-type') as CornerDotType, color: val('corner-color') },
    backgroundOptions: { color: checked('transparent-bg') ? 'transparent' : val('bg') }
  }
}

// --- Rendering ---------------------------------------------------------------

const previewEl = $('#qr-preview')
const errorEl = $('#qr-error')
const qr = new QRCodeStyling(buildOptions(PREVIEW_SIZE))
qr.append(previewEl)

function render() {
  const hasData = buildData() !== ''
  previewEl.style.opacity = hasData ? '1' : '0.25'
  document.querySelectorAll<HTMLButtonElement>('[data-download], #copy-btn').forEach((b) => (b.disabled = !hasData))

  try {
    qr.update(buildOptions(PREVIEW_SIZE))
    errorEl.classList.add('hidden')
  } catch (e) {
    errorEl.textContent = 'Too much content for a QR code – please shorten it.'
    errorEl.classList.remove('hidden')
    console.error(e)
  }
  updateWarnings()
}

function updateWarnings() {
  const el = $('#contrast-warning')
  const fg = val('fg')
  const messages: string[] = []
  if (!checked('transparent-bg')) {
    const ratio = Math.min(contrastRatio(fg, val('bg')), contrastRatio(val('corner-color'), val('bg')))
    if (ratio < 3) messages.push(`Low contrast (${ratio.toFixed(1)}:1) – some scanners may fail to read this code.`)
    if (contrastRatio(fg, '#000000') > contrastRatio(val('bg'), '#000000'))
      messages.push('Light code on dark background: not every scanner app supports inverted QR codes.')
  } else {
    messages.push('Transparent background: make sure the surface behind the code is light enough.')
  }
  el.textContent = messages.join(' ')
  el.classList.toggle('hidden', messages.length === 0)
}

const renderSoon = debounce(render, 120)

// --- Export ------------------------------------------------------------------

async function exportBlob(ext: FileExtension): Promise<Blob> {
  const size = parseInt(val('export-size'))
  const opts = buildOptions(size)
  if (ext === 'svg') opts.type = 'svg'
  // JPEG has no alpha channel – fall back to white instead of black
  if (ext === 'jpeg' && checked('transparent-bg')) opts.backgroundOptions = { color: '#ffffff' }
  const raw = await new QRCodeStyling(opts).getRawData(ext)
  if (!raw) throw new Error('Export failed')
  return raw instanceof Blob ? raw : new Blob([raw])
}

document.querySelectorAll<HTMLButtonElement>('[data-download]').forEach((btn) =>
  btn.addEventListener('click', async () => {
    const ext = btn.dataset.download as FileExtension
    try {
      downloadBlob(await exportBlob(ext), `qr-code.${ext === 'jpeg' ? 'jpg' : ext}`)
    } catch (e) {
      console.error(e)
      toast('Export failed')
    }
  })
)

$('#copy-btn').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') throw new Error('Clipboard API unavailable')
    // Passing a promise keeps Safari happy (user activation must not be lost)
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': exportBlob('png') })])
    toast('Copied to clipboard ✓')
  } catch (e) {
    console.error(e)
    toast('Your browser does not allow copying images – please download instead')
  }
})

// --- UI wiring ---------------------------------------------------------------

document.querySelectorAll<HTMLButtonElement>('#type-chips .chip').forEach((chip) =>
  chip.addEventListener('click', () => {
    state.type = chip.dataset.type as ContentType
    document
      .querySelectorAll<HTMLButtonElement>('#type-chips .chip')
      .forEach((c) => c.setAttribute('aria-pressed', String(c === chip)))
    document
      .querySelectorAll<HTMLElement>('[data-form]')
      .forEach((f) => f.classList.toggle('hidden', f.dataset.form !== state.type))
    render()
  })
)

const PRESETS: Record<string, Partial<Record<string, string | boolean>>> = {
  classic: {
    'dot-type': 'square',
    'corner-type': 'square',
    'corner-dot-type': 'square',
    fg: '#000000',
    'corner-color': '#000000',
    bg: '#ffffff',
    'use-gradient': false
  },
  sky: {
    'dot-type': 'rounded',
    'corner-type': 'extra-rounded',
    'corner-dot-type': 'dot',
    fg: '#0b1626',
    fg2: '#2b8fd6',
    'corner-color': '#0e4a7a',
    bg: '#eaf6ff',
    'use-gradient': true
  },
  sunset: {
    'dot-type': 'classy-rounded',
    'corner-type': 'extra-rounded',
    'corner-dot-type': 'dot',
    fg: '#b4235a',
    fg2: '#e2621b',
    'corner-color': '#7c1d43',
    bg: '#fff7ed',
    'use-gradient': true
  },
  forest: {
    'dot-type': 'dots',
    'corner-type': 'dot',
    'corner-dot-type': 'dot',
    fg: '#14532d',
    fg2: '#15803d',
    'corner-color': '#14532d',
    bg: '#f0fdf4',
    'use-gradient': true
  },
  night: {
    'dot-type': 'extra-rounded',
    'corner-type': 'extra-rounded',
    'corner-dot-type': 'square',
    fg: '#1e1b4b',
    fg2: '#7c3aed',
    'corner-color': '#1e1b4b',
    bg: '#ffffff',
    'use-gradient': true
  }
}

document.querySelectorAll<HTMLButtonElement>('#presets .chip').forEach((chip) =>
  chip.addEventListener('click', () => {
    const preset = PRESETS[chip.dataset.preset!]
    for (const [id, value] of Object.entries(preset)) {
      const input = $<HTMLInputElement>(`#${id}`)
      if (typeof value === 'boolean') input.checked = value
      else input.value = value!
    }
    $<HTMLInputElement>('#transparent-bg').checked = false
    syncDisabled()
    render()
  })
)

function syncDisabled() {
  $<HTMLInputElement>('#fg2').disabled = !checked('use-gradient')
  $<HTMLInputElement>('#bg').disabled = checked('transparent-bg')
}

document.querySelectorAll<HTMLInputElement>('main input:not([type=file]), main select, main textarea').forEach((el) => {
  el.addEventListener('input', () => {
    syncDisabled()
    if (el.id === 'export-size') $('#export-size-value').textContent = el.value
    else renderSoon()
  })
})

// Logo upload
const logoInput = $<HTMLInputElement>('#logo-input')
logoInput.addEventListener('change', () => {
  const file = logoInput.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    state.logo = reader.result as string
    $('#logo-label').textContent = file.name.length > 18 ? file.name.slice(0, 16) + '…' : file.name
    $('#logo-remove').classList.remove('hidden')
    render()
  }
  reader.readAsDataURL(file)
})
$('#logo-remove').addEventListener('click', () => {
  state.logo = undefined
  logoInput.value = ''
  $('#logo-label').textContent = 'Upload image'
  $('#logo-remove').classList.add('hidden')
  render()
})

// 3D tilt effect on the preview card
const stage = $('#tilt-stage')
const card = $('#tilt-card')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!reduceMotion) {
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 18}deg) scale(1.02)`
    card.style.setProperty('--gx', `${(x + 0.5) * 100}%`)
    card.style.setProperty('--gy', `${(y + 0.5) * 100}%`)
    card.style.setProperty('--go', '1')
  })
  stage.addEventListener('pointerleave', () => {
    card.style.transform = ''
    card.style.setProperty('--go', '0')
  })
}

syncDisabled()
render()

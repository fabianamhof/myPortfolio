import { initScene } from './scene'

;(async () => {
  await initScene()
  document.getElementById('loading')!.style.display = 'none'
})()

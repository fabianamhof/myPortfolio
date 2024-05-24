import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

const loader = new GLTFLoader();
export async function initScene() {

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  })

  const scene = new THREE.Scene()
  scene.position.y = 0
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
  directionalLight.position.x = 20
  directionalLight.position.y = 50
  directionalLight.position.z = 10
  scene.add(directionalLight)

  const { scene: mountain } = await loader.loadAsync('/snow_mountain/scene.gltf')
  mountain.rotateY(Math.PI / 2)
  scene.add(mountain)

  const { scene: stars } = await loader.loadAsync('/stars/scene.gltf');
  const { materials: starsMaterials } = trasverseObjects(stars);
  starsMaterials.star.transparent = true
  scene.add(stars)

  const {
    scene: clouds,
  } = await loader.loadAsync('/clouds/scene.gltf')
  const {     nodes: cloudNodes,
    materials: cloudMaterials } = trasverseObjects(clouds);
  for (const key in cloudNodes) {
    const node = cloudNodes[key]
    if (node instanceof THREE.Mesh) {
      node.castShadow = true
    }
  }
  for (const cloudMaterial in cloudMaterials) {
    cloudMaterials[cloudMaterial].emissive = new THREE.Color(0.6, 0.6, 0.6)
  }
  cloudNodes.Icosphere001.position.y = 3
  cloudNodes.Icosphere002.position.y = 5
  cloudNodes.Icosphere003.position.y = 4
  cloudNodes.Icosphere004.position.y = 8
  cloudNodes.Icosphere005.position.y = 10
  cloudNodes.Cylinder005.visible = false

  clouds.position.x = 8
  clouds.position.y = 7
  clouds.position.z = -7
  const cloudAnimation = gsap.timeline({
    repeat: -1
  })
  cloudAnimation.to(clouds.position, { z: 7, duration: 20, ease: 'none' })
  Object.values(cloudMaterials).forEach((m) => {
    m.transparent = true

    const materialTimeline = gsap.timeline()
    materialTimeline.to(m, { opacity: 0, duration: 4 }, '16')
    cloudAnimation.add(materialTimeline, '<')
  })
  scene.add(clouds)

  const starsShape = [
    {
      position: new THREE.Vector3(20, 80, 0)
    },
    {
      position: new THREE.Vector3(10, 85, 10)
    },
    {
      position: new THREE.Vector3(0, 81, 20)
    },
    {
      position: new THREE.Vector3(-10, 75, 40)
    },
    {
      position: new THREE.Vector3(-20, 78, 30)
    }
  ]
  const starMaterial = new THREE.MeshBasicMaterial()
  for (let i = 0; i < starsShape.length; i++) {
    const star = starsShape[i]
    const geometry = new THREE.SphereGeometry(0.5)
    const sphere = new THREE.Mesh(geometry, starMaterial)
    sphere.position.set(star.position.x, star.position.y, star.position.z)
    scene.add(sphere)
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(starsShape.map((s) => s.position))
  const line = new THREE.Line(geometry, starMaterial)
  scene.add(line)

  const camera = new THREE.PerspectiveCamera()
  camera.position.x = 25
  camera.position.y = 0
  camera.position.z = 0
  const lookAt = new THREE.Vector3(0, 12, 0)

  gsap.set('#page1', { opacity: 1, display: 'block' })
  gsap.set(starsMaterials.star, { opacity: 0, ease: 'power4.out' })

  gsap
    .timeline({
      scrollTrigger: {
        trigger: '#content',
        start: 'top top',
        scrub: true,
        pin: true,
        end: 'bottom+=6000px'
      }
    })
    .to('#page1', { opacity: 0, display: 'none', ease: 'power4.out' })
    .to('#page2', { opacity: 1, display: 'block', duration: 2, ease: 'power4.in' }, '<')
    .to(
      camera.position,
      {
        x: 4,
        y: 0,
        z: -25,
        duration: 2
      },
      '<'
    )
    .to(
      'body',
      { '--color': 'rgba(156,36,64,1)', '--color2': 'rgba(46,125,152,1)', duration: 2 },
      '<'
    )
    .to(starsMaterials.star, { opacity: 1, duration: 2, ease: 'power4.in' }, '<')
    .to('#page2', { opacity: 0, display: 'none', ease: 'power4.out' }, '>0.5')
    .to('#page3', { opacity: 1, display: 'block', duration: 2, ease: 'power4.in' }, '<')
    .to(
      lookAt,
      {
        x: starsShape[0].position.x,
        y: starsShape[0].position.y - 10,
        z: starsShape[0].position.z,
        duration: 2
      },
      '<'
    )
    .to(
      camera.position,
      {
        x: starsShape[0].position.x,
        y: starsShape[0].position.y,
        z: starsShape[0].position.z - 50,
        duration: 2
      },
      '<'
    )
    .to('body', { '--color': 'rgba(17,29,33,1)', '--color2': 'rgba(17,29,33,1)', duration: 2 }, '<')
    .to('#page3', { opacity: 0, display: 'none', ease: 'power4.out' }, '>0.5')
    .to('#page4', { opacity: 1, display: 'block', duration: 2, ease: 'power4.in' }, '<')
    .to(
      lookAt,
      {
        x: starsShape[1].position.x,
        y: starsShape[1].position.y - 10,
        z: starsShape[1].position.z,
        duration: 2
      },
      '<'
    )
    .to(
      camera.position,
      {
        x: starsShape[1].position.x,
        y: starsShape[1].position.y,
        z: starsShape[1].position.z - 50,
        duration: 2
      },
      '<'
    )
    .to('#page4', { opacity: 0, display: 'none', ease: 'power4.out' }, '>0.5')
    .to('#page5', { opacity: 1, display: 'block', duration: 2, ease: 'power4.in' }, '<')
    .to(
      lookAt,
      {
        x: starsShape[2].position.x,
        y: starsShape[2].position.y - 10,
        z: starsShape[2].position.z,
        duration: 2
      },
      '<'
    )
    .to(
      camera.position,
      {
        x: starsShape[2].position.x,
        y: starsShape[2].position.y,
        z: starsShape[2].position.z - 50,
        duration: 2
      },
      '<'
    )
    .to('#page5', { opacity: 0, display: 'none', ease: 'power4.out' }, '>0.5')
    .to('#page6', { opacity: 1, display: 'block', duration: 2, ease: 'power4.in' }, '<')
    .to(
      lookAt,
      {
        x: starsShape[3].position.x,
        y: starsShape[3].position.y - 10,
        z: starsShape[3].position.z,
        duration: 2
      },
      '<'
    )
    .to(
      camera.position,
      {
        x: starsShape[3].position.x,
        y: starsShape[3].position.y,
        z: starsShape[3].position.z - 50,
        duration: 2
      },
      '<'
    )
    .to('#page6', { opacity: 0, display: 'none', ease: 'power4.out' }, '>0.5')
    .to('#page7', { opacity: 1, display: 'block', duration: 2, ease: 'power4.in' }, '<')
    .to(
      lookAt,
      {
        x: starsShape[4].position.x,
        y: starsShape[4].position.y - 10,
        z: starsShape[4].position.z,
        duration: 2
      },
      '<'
    )
    .to(
      camera.position,
      {
        x: starsShape[4].position.x,
        y: starsShape[4].position.y,
        z: starsShape[4].position.z - 50,
        duration: 2
      },
      '<'
    )
    .to('#page7', { opacity: 0, display: 'none', ease: 'power4.out' }, '>0.5')
    .to('#page8', { opacity: 1, display: 'block', duration: 2, ease: 'power4.in' }, '<')
    .to(
      lookAt,
      {
        x: 0,
        y: 200,
        z: 0,
        duration: 2
      },
      '<'
    )
    .to(
      camera.position,
      {
        x: 0,
        y: 0,
        z: -700,
        duration: 2
      },
      '<'
    )
    .to('#page8', { opacity: 0, display: 'none', ease: 'power4.out' }, '>0.5')
    .to('#page9', { opacity: 1, display: 'block', duration: 2, ease: 'power4.in' }, '<')

  function animate() {
    camera.lookAt(lookAt)

    requestAnimationFrame(animate)

    renderer.render(scene, camera)
  }

  const container = document.getElementById('container')!
  container.appendChild(renderer.domElement)
  updateWidth()
  animate()

  window.onresize = updateWidth

  function updateWidth() {
    const container = document.getElementById('container')!
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
  }
}

export function trasverseObjects(object: THREE.Object3D) {
  const data: {
    nodes: { [key: string]: THREE.Object3D<THREE.Object3DEventMap> },
    materials: { [key: string]: any }
  } = { nodes: {}, materials: {} }
  if (object) {
    object.traverse((obj) => {
      if (obj.name) {
        data.nodes[obj.name] = obj
      }
      if (obj instanceof THREE.Mesh) {
        if (obj.material && !data.materials[obj.material.name]) {
          data.materials[obj.material.name] = obj.material
        }
      }
    })
  }
  return data
}
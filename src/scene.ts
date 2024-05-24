import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

const loader = new GLTFLoader()
export async function initScene() {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  })

  //INIT Scene
  const scene = new THREE.Scene()
  scene.position.y = 0
  //INIT Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
  directionalLight.position.x = 20
  directionalLight.position.y = 50
  directionalLight.position.z = 10
  scene.add(directionalLight)
  //INIT Camera
  const camera = new THREE.PerspectiveCamera()
  camera.position.x = 25
  camera.position.y = 0
  camera.position.z = 0
  const lookAt = new THREE.Vector3(0, 12, 0)
  //INIT Objects
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [clouds, mountain, stars, starConstellation] = await Promise.all([
    initClouds(),
    initMountain(),
    initStars(),
    initStarConstellation()
  ])
  //ANIMATE
  animateOnScroll();

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

  function animateOnScroll() {
    gsap.set('#page1', { opacity: 1, display: 'block' })
    gsap.set(stars.materials.star, { opacity: 0, ease: 'power4.out' })
    const timeline = gsap
    .timeline({
      scrollTrigger: {
        trigger: '#content',
        start: 'top top',
        scrub: true,
        pin: true,
        end: 'bottom+=6000px'
      }
    })

    const pages = document.getElementsByClassName("page");
    for(let i = 1; i < pages.length; i++) {
      timeline
      .to(`#page${i}`, { opacity: 0, display: 'none', ease: 'power4.out' })
      .to(`#page${i+1}`, { opacity: 1, display: 'block', duration: 2, ease: 'power4.in' }, '<')

      if (i === 1) {
        timeline
        .to(camera.position, { x: 4, y: 0, z: -25, duration: 2 }, '<')
        .to('body', { '--color': 'rgba(156,36,64,1)', '--color2': 'rgba(46,125,152,1)', duration: 2 }, '<')
        .to(stars.materials.star, { opacity: 1, duration: 2, ease: 'power4.in' }, '<')
      } else if (i === 2) {
        const p = starConstellation[0]
        timeline
        .to(lookAt, {x: p.x, y: p.y - 10, z: p.z, duration: 2},'<')
        .to(camera.position, { x: p.x, y: p.y, z: p.z - 50, duration: 2 },'<')
        .to('body', { '--color': 'rgba(17,29,33,1)', '--color2': 'rgba(17,29,33,1)', duration: 2 }, '<')
      } else if (i >= 3 && i <= 6) {
        const p = starConstellation[i-2]
        timeline
        .to(lookAt, {x: p.x, y: p.y - 10, z: p.z, duration: 2},'<')
        .to(camera.position, { x: p.x, y: p.y, z: p.z - 50, duration: 2 },'<')
      } else if (i === 7) {
        timeline
        .to(lookAt,{x: 0,y: 200,z: 0,duration: 2},'<')
        .to(camera.position,{x: 0,y: 0,z: -700,duration: 2},'<')
      }
    }
  }

  function updateWidth() {
    const container = document.getElementById('container')!
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
  }

  async function initMountain() {
    const gltf = await loader.loadAsync('/snow_mountain/scene.gltf')
    gltf.scene.rotateY(Math.PI / 2)
    scene.add(gltf.scene)

    return { gltf }
  }

  async function initStars() {
    const gltf = await loader.loadAsync("/stars/scene.gltf")
    const { materials } = trasverseObjects(gltf.scene)
    materials.star.transparent = true
    scene.add(gltf.scene)

    return { gltf, materials }
  }

  async function initClouds() {
    const gltf = await loader.loadAsync("/clouds/scene.gltf")
    gltf.scene.position.x = 8
    gltf.scene.position.y = 7
    gltf.scene.position.z = -7
    const cloudAnimation = gsap.timeline({ repeat: -1 }).to(gltf.scene.position, { z: 30, duration: 30, ease: 'none' })

    const { nodes, materials } = trasverseObjects(gltf.scene)
    nodes.Icosphere001.position.y = 3
    nodes.Icosphere002.position.y = 5
    nodes.Icosphere003.position.y = 4
    nodes.Icosphere004.position.y = 8
    nodes.Icosphere005.position.y = 10
    nodes.Cylinder005.visible = false

    Object.values(materials).forEach((m) => {
      m.emissive = new THREE.Color(0.6, 0.6, 0.6)
      m.transparent = true
      const materialTimeline = gsap.timeline()
      materialTimeline.to(m, { opacity: 0, duration: 4 }, '26')
      cloudAnimation.add(materialTimeline, '<')
    })

    scene.add(gltf.scene)

    return { gltf, materials, nodes }
  }

  async function initStarConstellation() {
    const starConstellation = [
      new THREE.Vector3(20, 80, 0),
      new THREE.Vector3(10, 85, 10),
      new THREE.Vector3(0, 81, 20),
      new THREE.Vector3(-10, 75, 40),
      new THREE.Vector3(-20, 78, 30)
    ]
    const starConstellationMaterial = new THREE.MeshBasicMaterial()
    const sphereGeometry = new THREE.SphereGeometry(0.5)
    starConstellation.forEach((s) => {
      const sphere = new THREE.Mesh(sphereGeometry, starConstellationMaterial)
      sphere.position.set(s.x, s.y, s.z)
      scene.add(sphere)
    })
    const bufferGeometry = new THREE.BufferGeometry().setFromPoints(starConstellation)
    const line = new THREE.Line(bufferGeometry, starConstellationMaterial)
    scene.add(line)

    return starConstellation
  }
}

function trasverseObjects(object: THREE.Object3D) {
  const data: {
    nodes: { [key: string]: THREE.Object3D<THREE.Object3DEventMap> }
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

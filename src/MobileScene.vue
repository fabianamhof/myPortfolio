<script setup lang="ts">
import gsap from 'gsap';
import { useGLTF } from '@tresjs/cientos';
import * as THREE from 'three';
import { onMounted } from 'vue';

const renderer = new THREE.WebGLRenderer({
  alpha: true
});

const scene = new THREE.Scene();
scene.position.y = 0
const camera = new THREE.PerspectiveCamera();
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.x = 20;
directionalLight.position.y = 50;
directionalLight.position.z = 10;
scene.add(directionalLight)

const { scene: mountain } = await useGLTF('/snow_mountain/scene.gltf')
mountain.rotateY(Math.PI / 2)
scene.add(mountain);

const { scene: stars } = await useGLTF('/stars/scene.gltf')
scene.add(stars);

const { scene: clouds, nodes: cloudNodes, materials: cloudMaterials } = await useGLTF('/clouds/scene.gltf')
for (const key in cloudNodes) {
  const node = cloudNodes[key]
  if (node instanceof THREE.Mesh) { node.castShadow = true; }
}
for (const cloudMaterial in cloudMaterials) {
  cloudMaterials[cloudMaterial].emissive = new THREE.Color(0.6,0.6,0.6)
}
cloudNodes.Icosphere001.position.y = 3
cloudNodes.Icosphere002.position.y = 5
cloudNodes.Icosphere003.position.y = 4
cloudNodes.Icosphere004.position.y = 8
cloudNodes.Icosphere005.position.y = 10
cloudNodes.Cylinder005.visible = false;

clouds.position.x = 8
clouds.position.y = 7
clouds.position.z = -7
let cloudAnimation = gsap.timeline({
  repeat: -1,
});
cloudAnimation.to(clouds.position, { z: 7, duration: 20, ease: "none" })
Object.values(cloudMaterials).forEach(m => {
  m.transparent = true;

  const materialTimeline = gsap.timeline();
  materialTimeline.to(m, { opacity: 0, duration: 4 }, "16")
  cloudAnimation.add(materialTimeline, "<");
})
scene.add(clouds)


camera.position.x = 25;
camera.position.y = 0;
camera.position.z = 0;
camera.lookAt(new THREE.Vector3(0, 12, 0))

function animate() {


  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

onMounted(() => {
  const container = document.getElementById("container")!;
  container.appendChild(renderer.domElement);
  updateWidth();
  animate();
})

window.onresize = updateWidth;

function updateWidth() {
  const container = document.getElementById("container")!;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}
</script>

<template>

</template>
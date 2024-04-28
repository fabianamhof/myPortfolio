<script setup>
import { TresCanvas, useRenderLoop } from '@tresjs/core';
import { BasicShadowMap, SRGBColorSpace, NoToneMapping, Vector3, Color, Mesh } from 'three'
import { shallowRef, watch } from 'vue';
import { useGLTF } from '@tresjs/cientos';
import { getCurrentPosition, getPositionBetween } from './positionInfo';

const gl = {
  shadows: true,
  alpha: true,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
  windowSize: true,
}

const { scene: clouds, nodes: cloudNodes, materials: cloudMaterials } = await useGLTF('/clouds/scene.gltf')
const { scene: mountain, nodes: mountainNodes } = await useGLTF('/snow_mountain/scene.gltf')


for (const key in cloudNodes) {
  const node = cloudNodes[key]
  console.log(node)
  if (node instanceof Mesh) { node.castShadow = true; }
}

for (const key in mountainNodes) {
  const node = mountainNodes[key]
  node.receiveShadow = true;
}

console.log(cloudMaterials);
for (const cloudMaterial in cloudMaterials) {
  cloudMaterials[cloudMaterial].emissive = new Color(0.4, 0.4, 0.4)
}

cloudNodes.Icosphere001.position.y = 3
cloudNodes.Icosphere002.position.y = 5
cloudNodes.Icosphere003.position.y = 4
cloudNodes.Icosphere004.position.y = 8
cloudNodes.Icosphere005.position.y = 10
cloudNodes.Cylinder005.visible = false;
console.log(cloudNodes);
const camera = shallowRef();
const cloudsModel = shallowRef();
const mountainModel = shallowRef();
const sun = shallowRef();
const ambientLight = shallowRef();

const { onLoop } = useRenderLoop();

let cloudPath = 0;
onLoop(({ delta, elapsed }) => {
  cloudPath += 0.0005
  if (cloudPath > 1) {
    cloudPath = 0;
  }

  const docHeight = document.documentElement.scrollHeight
  const scrollPosition = window.screenY || document.documentElement.scrollTop
  const scrollPercentage = Math.min(scrollPosition / (docHeight - window.innerHeight), 1)

  const { prevPage } = getCurrentPosition();
  if (prevPage < 3) {
    const scroll_0_3 = getPositionBetween(0, 3)
    const sunX = Math.sin(scroll_0_3 * Math.PI * 2) * 40;
    const sunY = Math.max(Math.cos(scroll_0_3 * Math.PI / 2))
    const sunZ = Math.sin(scroll_0_3 * Math.PI * 2) * 40
    sun.value.position.x = sunX
    sun.value.position.y = sunY * 40
    sun.value.position.z = sunZ
    sun.value.intensity = Math.max(sunY, 0.4) * 3
    ambientLight.value.intensity = Math.max(sunY, 0.4)
    const cameraX = Math.cos(scroll_0_3 * Math.PI / 2) * 20;
    const cameraZ = Math.sin(scroll_0_3 * Math.PI / 2) * 20
    camera.value.position.x = cameraX
    camera.value.position.z = cameraZ

    const scroll_2_3 = getPositionBetween(2, 3)
    const cameraYOffset = scroll_2_3 * 4 * 70
    camera.value.position.y = cameraYOffset
    camera.value.lookAt(new Vector3(0, 10 + cameraYOffset, 0))
  }


  mountainModel.value.rotation.x = 0;
  mountainModel.value.rotation.y = Math.PI / 2;
  mountainModel.value.rotation.z = 0;
  mountainModel.value.position.x = 0;
  mountainModel.value.position.y = 0;
  mountainModel.value.position.z = 0;

  cloudsModel.value.position.z = -12 + 48 * cloudPath;
})

watch(cloudsModel, () => {
  cloudsModel.value.lookAt(camera.value.position)
})
</script>

<template>
  <div>
    <TresCanvas v-bind="gl" style="position: absolute">
      <TresPerspectiveCamera ref="camera" :position="new Vector3(20, 0, 0)" :look-at="new Vector3(0, 10, 0)" />
      <primitive ref="mountainModel" :object="mountain" :position="new Vector3(0, 0, 0)" />
      <primitive ref="cloudsModel" :object="clouds" :position="new Vector3(0, 7, 0)" :scale="new Vector3(2, 2, 2)" />
      <TresDirectionalLight ref="sun" color="white" :position="new Vector3(5, 10, 200)" :intensity="3" cast-shadow />
      <TresDirectionalLight color="white" :position="new Vector3(5, 10, 200)" :intensity="0.1" />
      <TresAmbientLight ref="ambientLight" color="white" :intensity="1" />
    </TresCanvas>
  </div>
</template>
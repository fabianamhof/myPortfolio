<script setup>
import { TresCanvas, useRenderLoop } from '@tresjs/core';
import { BasicShadowMap, SRGBColorSpace, NoToneMapping, Vector3 } from 'three'
import { onMounted, shallowRef } from 'vue';
import { useGLTF } from '@tresjs/cientos';

const gl = {
  shadows: true,
  alpha: true,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
  windowSize: true,
}

const { scene: clouds, nodes: cloudNodes } = await useGLTF('/clouds/scene.gltf')
const { scene: mountain } = await useGLTF('/snow_mountain/scene.gltf')

console.log(cloudNodes);
cloudNodes.Cylinder005.visible = false;
const camera = shallowRef();
const cloudsModel = shallowRef();
const mountainModel = shallowRef();
const sun = shallowRef();
const sunObject = shallowRef();

const { onLoop } = useRenderLoop();

let mountainAngle = 0;
let cloudPath = 0;
let sunPath = 0;
onLoop(({ delta, elapsed }) => {
  cloudPath += 0.0005
  if (cloudPath > 1) {
    cloudPath = 0;
  }

  sunPath += 0.005
  if (sunPath > Math.PI * 2) {
    sunPath = 0
  }

  const sunX = Math.cos(sunPath) * 20;
  const sunZ = Math.sin(sunPath) * 20

  sun.value.position.x = sunX
  sun.value.position.z = sunZ
  sunObject.value.position.x = sunX
  sunObject.value.position.y = 20
  sunObject.value.position.z = sunZ

  var docHeight = document.documentElement.scrollHeight;
  var scrollPosition = window.screenY || document.documentElement.scrollTop;
  var scrollPercentage = Math.min((scrollPosition / (docHeight - window.innerHeight)), 1);

  mountainModel.value.position.z = 5 * scrollPercentage;
  mountainModel.value.lookAt(camera.value.position);
  mountainModel.value.rotation.y = Math.PI / 2 - Math.PI / 2 * scrollPercentage

  cloudsModel.value.position.z = -75 + 200 * cloudPath;
})

onMounted(() => {
  console.log(clouds);
})
</script>

<template>
  <div>
    <TresCanvas v-bind="gl" style="position: absolute">
      <TresPerspectiveCamera ref="camera" :position="new Vector3(20, 0, 0)" :look-at="new Vector3(0, 10, 0)" />
      <primitive ref="mountainModel" :object="mountain" :position="[0, 0, 0]" />
      <primitive ref="cloudsModel" :object="clouds" :position="[-40, 20, 300]" :rotation="[0, 1, 0]"
        :scale="[5, 5, 5]" />
      <TresMesh ref="sunObject" :radius="5" :position="[0, 15, 0]">
        <TresSphereGeometry></TresSphereGeometry>
      </TresMesh>
      <TresDirectionalLight ref="sun" color="#fbe8c9" :position="[5, 10, 200]" :intensity="15" />
      <TresAmbientLight :intensity="1" />
    </TresCanvas>
  </div>
</template>
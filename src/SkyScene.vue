<script setup lang="ts">
import { Line2, useGLTF } from '@tresjs/cientos';
import { TresCanvas, useRenderLoop } from '@tresjs/core';
import { BasicShadowMap, NoToneMapping, SRGBColorSpace, Vector3 } from 'three';
import { onMounted, ref, shallowRef } from 'vue';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

import StarLabels from "@/StarLabels.vue";

const gl = {
  shadows: true,
  alpha: false,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
  windowSize: true,
}

const { scene: stars } = await useGLTF('/stars/scene.gltf')

const camera = shallowRef();
const container = shallowRef<HTMLElement>();
const sunObject = shallowRef();

const { onLoop } = useRenderLoop();

let cloudPath = 0;
let sunPath = 0;
onLoop(({ delta, elapsed }) => {
  cloudPath += 0.0005
  if (cloudPath > 1) {
    cloudPath = 0;
  }

  var docHeight = document.documentElement.scrollHeight;
  var scrollPosition = window.screenY || document.documentElement.scrollTop;
  var scrollPercentage = Math.min((scrollPosition / (docHeight - window.innerHeight)), 1);

  const sunX = Math.cos(scrollPercentage * Math.PI * 2) * 25;
  const sunY = Math.sin(scrollPercentage * Math.PI) * 40
  const sunZ = Math.sin(scrollPercentage * Math.PI * 2) * 25;

  sunObject.value.position.x = sunX
  sunObject.value.position.y = sunY
  sunObject.value.position.z = sunZ

  const cameraX = Math.cos(scrollPercentage * Math.PI / 2) * 20;
  const cameraYOffset = Math.max(scrollPercentage - 2 / 3, 0) * 60
  const cameraZ = Math.sin(scrollPercentage * Math.PI / 2) * 20
  camera.value.position.x = cameraX
  camera.value.position.y = cameraYOffset
  camera.value.position.z = cameraZ
  camera.value.lookAt(new Vector3(0, 10 + cameraYOffset, 0))
  console.log(cameraYOffset)
})

const brightStars = ref<Vector3[]>([
  new Vector3(0, 80, -40),
  new Vector3(-10, 75, -40),
  new Vector3(10, 60, -40),
  new Vector3(5, 45, -40),
  new Vector3(7, 40, -40),
  new Vector3(2, 35, -40),
])


</script>

<template>
  <div ref="container">
    <TresCanvas v-bind="gl" style="position: absolute">
      <TresPerspectiveCamera ref="camera" :position="new Vector3(0, 0, 0)" :look-at="new Vector3(0, 0, 0)" />
      <primitive :object="stars" />
      <TresAmbientLight :intensity="1" />
      <TresMesh ref="sunObject" :radius="5">
        <TresSphereGeometry></TresSphereGeometry>
      </TresMesh>
      <template v-for="(star, index) in brightStars" :key="index">
        <TresMesh ref="star" :radius="5" :position="star">
          <TresSphereGeometry></TresSphereGeometry>
        </TresMesh>
      </template>
      <Line2 :points="brightStars" :line-width="0.001" color="white"></Line2>
      <StarLabels :stars="brightStars"></StarLabels>
    </TresCanvas>
  </div>
</template>
<script setup lang="ts">
import { Line2, useGLTF } from '@tresjs/cientos';
import { TresCanvas, useRenderLoop } from '@tresjs/core';
import { BasicShadowMap, NoToneMapping, SRGBColorSpace, Vector3 } from 'three';
import { ref, shallowRef } from 'vue';

import StarLabels from "@/StarLabels.vue";
import type { Star } from './types';

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

const { onLoop } = useRenderLoop();

onLoop(({ delta, elapsed }) => {
  var docHeight = document.documentElement.scrollHeight;
  var scrollPosition = window.screenY || document.documentElement.scrollTop;
  var scrollPercentage = Math.min((scrollPosition / (docHeight - window.innerHeight)), 1);

  const cameraX = Math.cos(scrollPercentage * Math.PI / 2) * 20;
  const cameraYOffset = Math.max(scrollPercentage - 2 / 3, 0) * 140
  const cameraZ = Math.sin(scrollPercentage * Math.PI / 2) * 20
  camera.value.position.x = cameraX
  camera.value.position.y = cameraYOffset
  camera.value.position.z = cameraZ
  camera.value.lookAt(new Vector3(0, 10 + cameraYOffset, 0))

  document.querySelector<HTMLElement>(".content.me")!.style.opacity = `${(1 - Math.max(0, (scrollPercentage - 1 / 2) * 6))}`
  document.querySelector<HTMLElement>(".content.journey")!.style.opacity = `${(Math.max(0, (scrollPercentage - 9 / 10) * 6))}`
})

const brightStars = ref<Star[]>([
  {
    title: "1997",
    description: "I came into the world in 97, right here in Welsberg, South Tyrol.",
    labelOffsetX: 5,
    point: new Vector3(-20, 80 + 30, -40),
  },
  {
    title: "2003-2016",
    description: "Spent some good years at TFO Bruneck. It helped me evolving me and my technical skills.",
    labelOffsetX: 5,
    point: new Vector3(-10, 70 + 30, -40),
  },
  {
    title: "2016-2019",
    description: "Worked for three years at Elpo Bruneck, handling building control systems. It was a job that kept me engaged and encouraged innovation.",
    labelOffsetX: 5,
    point: new Vector3(0, 60 + 30, -40),
  },
  {
    title: "2019-2022",
    description: "Took a three-year stint in Innsbruck to dive into Computer Science. Explored the vast world of tech and picked up valuable skills.",
    labelOffsetX: 5,
    point: new Vector3(5, 45 + 30, -40),
  },
  {
    title: "Since 2022",
    description: "Since 2022, I've been working with the SiMedia crew. It's been a journey of collaboration and innovation, and I'm embracing every moment.",
    labelOffsetX: 5,
    point: new Vector3(2, 35 + 30, -40),
  }
])
</script>

<template>
  <div ref="container">
    <TresCanvas v-bind="gl" style="position: absolute">
      <TresPerspectiveCamera ref="camera" :position="new Vector3(0, 0, 0)" :look-at="new Vector3(0, 0, 0)" />
      <primitive :object="stars" />
      <TresAmbientLight :intensity="1" />
      <template v-for="(star, index) in brightStars" :key="index">
        <TresMesh ref="star" :radius="5" :position="star.point">
          <TresSphereGeometry></TresSphereGeometry>
        </TresMesh>
      </template>
      <Line2 :points="brightStars.map((star) => star.point)" :line-width="0.001" color="white"></Line2>
      <StarLabels :stars="brightStars"></StarLabels>
    </TresCanvas>
  </div>
</template>
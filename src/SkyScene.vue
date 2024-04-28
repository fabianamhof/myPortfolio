<script setup lang="ts">
import { Line2, useGLTF } from '@tresjs/cientos';
import { TresCanvas, useRenderLoop } from '@tresjs/core';
import { BasicShadowMap, Color, NoToneMapping, SRGBColorSpace, Vector3, type WebGLRendererParameters } from 'three';
import { ref, shallowRef } from 'vue';

import StarLabels from "@/StarLabels.vue";
import type { Star } from './types';
import type { TresCanvasProps } from '@tresjs/core/dist/src/components/TresCanvas.vue.js';
import { getCurrentPosition, getElementVisibility, getPositionBetween } from './positionInfo';

const gl: TresCanvasProps = {
  shadows: true,
  alpha: true,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
  windowSize: true,
}

const { scene: stars, materials: starsMaterials } = await useGLTF('/stars/scene.gltf')

const tresContext = shallowRef();
const camera = shallowRef();
const container = shallowRef<HTMLElement>();
const starsObject = shallowRef();
const spaceshipObject = shallowRef();

const colors = [
  [0.53, 0.81, 1.0, 1],
  [1.0, 0.22, 0.1, 1],
  [0.53, 0.81, 1.0, 0.2],
  [0.53, 0.81, 1.0, 0.2],
]

// Calculate the color transition based on scroll percentage
function updateBackgroundColor(scrollPercentage: number) {
  const colorIndex = Math.floor(scrollPercentage * (colors.length - 1));
  const startColor = colors[colorIndex];
  const endColor = colors[colorIndex + 1] || colors[colorIndex]; // In case colorIndex+1 is out of bounds

  // Interpolate between startColor and endColor based on scrollPercentage within this color segment
  const interpolatedColor = startColor.map((channel, i) => {
    return channel + ((endColor[i] - channel) * ((scrollPercentage * (colors.length - 1)) % 1));
  });

  tresContext.value.context.renderer.value.setClearColor(new Color(interpolatedColor[0], interpolatedColor[1], interpolatedColor[2]), interpolatedColor[3])
}

const { onLoop } = useRenderLoop();

onLoop(({ delta, elapsed }) => {
  const { prevPage, scrollPercentage, visibility } = getCurrentPosition();
  console.log(getCurrentPosition())
  starsMaterials.star.opacity = scrollPercentage
  starsMaterials.star.transparent = true

  updateBackgroundColor(scrollPercentage)

  if (prevPage < 3) {
    const scroll_0_3 = getPositionBetween(0, 3)
    const cameraX = Math.cos(scroll_0_3 * Math.PI / 2) * 20;
    const cameraZ = Math.sin(scroll_0_3 * Math.PI / 2) * 20
    camera.value.position.x = cameraX
    camera.value.position.z = cameraZ

    const scroll_2_3 = getPositionBetween(2, 3)
    const cameraYOffset = scroll_2_3 * 50
    camera.value.position.y = cameraYOffset
    camera.value.lookAt(new Vector3(0, 10 + cameraYOffset, 0))
  } if (prevPage >= 3) {
    const scroll_3_4 = getPositionBetween(3, 4)

    camera.value.rotation.y = -scroll_3_4 * Math.PI / 3
  }

  console.log(getElementVisibility(".page.me"));
  document.querySelector<HTMLElement>(".content.me")!.style.opacity = `${(getElementVisibility(".page.me") ** 10)}`
  document.querySelector<HTMLElement>(".content.journey")!.style.opacity = `${getElementVisibility(".page.journey") ** 10}`
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
    <TresCanvas ref="tresContext" v-bind="gl" style="position: absolute">
      <TresPerspectiveCamera ref="camera" :position="new Vector3(0, 0, 0)" :look-at="new Vector3(0, 0, 0)" />
      <primitive ref="starsObject" :object="stars" />
      <template v-for="(star, index) in brightStars" :key="index">
        <TresMesh :radius="5" :position="star.point">
          <TresSphereGeometry></TresSphereGeometry>
        </TresMesh>
      </template>
      <Line2 :points="brightStars.map((star) => star.point)" :line-width="0.001"></Line2>
      <StarLabels :stars="brightStars"></StarLabels>
    </TresCanvas>
  </div>
</template>
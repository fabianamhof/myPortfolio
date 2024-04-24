<script setup>
import { TresCanvas, useRenderLoop } from '@tresjs/core';
import { BasicShadowMap, SRGBColorSpace, NoToneMapping, Vector3 } from 'three'

import MountainModel from '@/components/MountainModel.vue';
import { shallowRef } from 'vue';

const gl = {
  shadows: true,
  alpha: true,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
  windowSize: true,

}

const camera = shallowRef();

const { onLoop } = useRenderLoop();

let angle = 0;
let radius = 20;
onLoop(({ delta, elapsed }) => {
  angle += 0.0005

  camera.value.position.x = Math.cos(angle) * radius
  camera.value.position.z = Math.sin(angle) * radius
  camera.value.lookAt(0, 10, 0)

  console.log(camera.value);
})
</script>
<template>
  <div style="position: relative; height: 100%; width: 100%;">
    <div class="content" style="position: absolute;">
      <p>Hallo</p>
    </div>
    <TresCanvas v-bind="gl" style="position: absolute">
      <TresPerspectiveCamera ref="camera" :position="new Vector3(20, 0, 0)" :look-at="new Vector3(0, 10, 0)" />
      <Suspense>
        <MountainModel v-if="camera" />
      </Suspense>
      <TresDirectionalLight color="white" :position="[10, 10, 10]" :intensity="2" />
      <TresAmbientLight :intensity="1" />
    </TresCanvas>
  </div>
</template>

<style>
#app {
  height: 100vh;
  width: 100vw;
}

.content {
  font-size: xx-large;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: -100;
}
</style>
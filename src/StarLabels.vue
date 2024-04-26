<script setup lang="ts">
import { useTresContext } from '@tresjs/core';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { onMounted } from 'vue';
import type { Star } from './types';

const props = defineProps<{
  stars: Star[]
}>()

const { scene, camera, renderer } = useTresContext();


const htmlRenderer = new CSS2DRenderer();
function render() {
  htmlRenderer.setSize(renderer.value.domElement.clientWidth, renderer.value.domElement.clientHeight)
  htmlRenderer.render(scene.value, camera.value!)
  requestAnimationFrame(render)
}

onMounted(() => {
  console.log(props.stars)
  for (const [index, star] of props.stars.entries()) {
    const el = document.createElement("button");
    el.innerHTML = star.title;
    el.className = "bg-white p-2 border rounded-lg"
    el.onclick = () => {
      document.querySelector(".content.journey")!.innerHTML = star.description
    }

    console.log(el.clientWidth)
    const starObject = new CSS2DObject(el);
    starObject.position.x = star.point.x + star.labelOffsetX
    starObject.position.y = star.point.y;
    starObject.position.z = star.point.z;
    scene.value.add(starObject);
  }

  htmlRenderer.domElement.style.position = "fixed"
  document.getElementById("container")?.appendChild(htmlRenderer.domElement);
  console.log(scene.value, camera.value, renderer.value, renderer.value.domElement)
  render()

})
</script>

<template>
  <details v-if="false"
    class="overflow-hidden w-full max-h-24 bg-white rounded-lg shadow-lg justify-center items-center cursor-pointer">
    <summary class="grid grid-cols-[70px_auto] transition-all duration-150">
      <div class="p-5 col-start-1 col-end-1 border-r text-sm flex items-center" set:html={time}></div>
      <div class="p-5 col-start-2 col-end-2l flex items-center"></div>
    </summary>
    <div class="p-5 col-span-2"></div>
  </details>
</template>
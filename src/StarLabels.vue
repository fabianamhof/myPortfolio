<script setup lang="ts">
import { useTresContext } from '@tresjs/core';
import { Vector3 } from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { onMounted } from 'vue';

const props = defineProps<{
  stars: Vector3[]
}>()

const { scene, camera, renderer } = useTresContext();



onMounted(() => {
  console.log(props.stars)
  for (const [index, star] of props.stars.entries()) {
    const el = document.createElement("div");
    el.innerHTML = `star ${index}`
    const starObject = new CSS2DObject(el);
    scene.value.add(starObject);
  }

  const htmlRenderer = new CSS2DRenderer();
  htmlRenderer.setSize(renderer.value.domElement.clientWidth, renderer.value.domElement.clientHeight)
  console.log(scene.value, camera.value, renderer.value, renderer.value.domElement)
  htmlRenderer.render(scene.value, camera.value!)
})
</script>

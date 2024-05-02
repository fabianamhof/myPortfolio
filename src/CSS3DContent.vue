<script setup lang="ts">
import { useTresContext } from '@tresjs/core';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { onMounted } from 'vue';
import type { Star } from './types';
import { Vector3 } from 'three';

const { scene, camera, renderer } = useTresContext();

const props = defineProps<{
  stars: Star[]
}>()

const htmlRenderer = new CSS3DRenderer();
function render() {
  htmlRenderer.setSize(renderer.value.domElement.clientWidth, renderer.value.domElement.clientHeight)
  htmlRenderer.render(scene.value, camera.value!)
  requestAnimationFrame(render)
}

const starLabels = [];

onMounted(() => {
  const hiEl = document.createElement("div");
  hiEl.innerHTML = `
  <div id="hi" class="content">
    <h1>Hi there. I'm Fabian.</h1>
    <h2>Great to see you.<br> Scroll down to get to know me a little better.
    </h2>
  </div>
  `
  const hi = new CSS3DObject(hiEl);
  hi.position.x = -5
  hi.position.y = 15
  hi.position.z = 0
  hi.scale.x = 0.05
  hi.scale.y = 0.05
  hi.scale.z = 0.05
  hi.lookAt(camera.value!.position)
  scene.value.add(hi);

  const meEl = document.createElement("div");
  meEl.innerHTML = `
  <div id="me" class="content">
    <h1>Me</h1>
    <div>
      I'm a web technology enthusiast with a knack for crafting innovative solutions that seamlessly integrate
      with
      user needs. My journey through Computer Science at the University of Innsbruck has equipped me with a
      diverse
      skill set, covering various facets of software development. Beyond the digital realm, I find joy and
      vitality
      in outdoor pursuits like hiking or soccer.
    </div>
  </div>`
  const me = new CSS3DObject(meEl);
  me.position.x = -12
  me.position.y = 12
  me.position.z = 5
  me.scale.x = 0.05
  me.scale.y = 0.05
  me.scale.z = 0.05
  me.lookAt(new Vector3(-12, 0, -20))
  scene.value.add(me)

  for (const [index, star] of props.stars.entries()) {
    const el = document.createElement("button");
    el.innerHTML = star.title;
    el.className = "starButton"
    el.onclick = () => {
      document.querySelector("#journey div")!.innerHTML = star.description
    }

    const starObject = new CSS3DObject(el);
    starObject.position.x = star.point.x + star.offset.x;
    starObject.position.y = star.point.y + star.offset.y;
    starObject.position.z = star.point.z + star.offset.z;
    starObject.scale.x = 0.03
    starObject.scale.y = 0.03
    starObject.scale.z = 0.03
    starObject.rotateY(Math.PI)
    starLabels.push(starObject)

    scene.value.add(starObject);
  }


  const journeyEl = document.createElement("div");
  journeyEl.innerHTML = `
  <div id="journey" class="content">
    <h1>My journey</h1>
    <div>
      Click on a star.
    </div>
  </div>`
  const journey = new CSS3DObject(journeyEl);
  journey.position.x = 5
  journey.position.y = 55
  journey.position.z = 0
  journey.scale.x = 0.05
  journey.scale.y = 0.05
  journey.scale.z = 0.05
  journey.rotateY(Math.PI)
  scene.value.add(journey)

  const thanksEl = document.createElement("div");
  thanksEl.innerHTML = `
  <div id="thanks" class="content">
    <h1>
      Thank you!
    </h1>
    <div>
      Here are some of the technologies that helped me build this website.<br>
      <span class="flex justify-center items-center gap-2 my-2">
        <a class="hover:invert" href="https://vuejs.org//"><img alt="Three.js" src="/threejs.png"></a>
        <a class="invert hover:invert-0" href="https://tailwindcss.com/"><img alt="Tailwind" src="/tailwind.png"></a>
        <a class="invert hover:invert-0" href="https://aws.amazon.com/"><img alt="AWS" src="/aws.png"></a>
        <a class="invert hover:invert-0" href="https://threejs.org/"><img alt="Github" src="/github.png"></a>
      </span>
      <span>Contact me</span>
      <span class="flex justify-center gap-2 my-2">
        <a href="mailto:amhof.fabian1234@gmail.com">
          <img class="invert hover:invert-0" alt="Mail" src="/email.png">
        </a>
      </span>
    </div>
  </div>
  `
  const thanks = new CSS3DObject(thanksEl);
  thanks.position.x = -28
  thanks.position.y = 55
  thanks.position.z = -40
  thanks.scale.x = 0.05
  thanks.scale.y = 0.05
  thanks.scale.z = 0.05
  thanks.rotateY(Math.PI / 2)
  scene.value.add(thanks)


  htmlRenderer.domElement.style.position = "fixed"
  document.getElementById("container")?.prepend(htmlRenderer.domElement);
  console.log(scene.value, camera.value, renderer.value, renderer.value.domElement)
  render()
})
</script>

<template>

</template>


<style>
.content {
  @apply text-white
}

#hi {
  @apply text-center
}

#me {
  @apply text-right w-[300px] opacity-0
}

#journey {
  @apply text-center w-[300px] opacity-0
}

#thanks {
  @apply text-center opacity-0
}

.starButton {
  @apply bg-white p-2 rounded
}

img {
  @apply w-5
}
</style>
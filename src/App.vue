<script setup lang="ts">
import MobileScene from './MobileScene.vue';
</script>
<template>
  <div class="relative">
    <div id="container" class="w-dvw h-dvh fixed top-0">
      <Suspense>
        <MobileScene />
      </Suspense>
    </div>
    <div class="absolute top-0">
      <div class="page">
        <div class="h-full flex justify-center items-center text-white text-center pb-36">
          <div class="w-1/2">
            <h1>Hi there. I'm Fabian.</h1>
            <h2>Great to see you.</h2>
          </div>
        </div>
      </div>
      <div class="page">
        <div class="h-full flex justify-center items-center text-white text-center  pb-36">
          <div class="m-5">
            <h1>Me</h1>
            I'm a web technology enthusiast with a knack for crafting innovative solutions that seamlessly integrate
            with
            user needs. My journey through Computer Science at the University of Innsbruck has equipped me with a
            diverse
            skill set, covering various facets of software development. Beyond the digital realm, I find joy and
            vitality
            in outdoor pursuits like hiking or soccer.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.content,
.starButton {
  font-family: "Space Mono", monospace;
  font-weight: 400;
  font-style: normal;
  scroll-behavior: smooth;
}

:root {
  --color: rgba(135, 206, 255, 1);
  --color2: rgba(135, 206, 255, 1);
}


#container {
  background-image: linear-gradient(0deg, var(--color) 30%, var(--color2) 100%);
}

.page {
  height: 100dvh;
  width: 100dvw;
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
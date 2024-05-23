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
    <div id="content" class="absolute top-0">
      <div id="page1" class="page">
        <div class="h-full flex justify-center items-center text-white text-center pb-36">
          <div class="w-1/2 flex items-center justify-center flex-col">
            <img class="rounded-full h-24 mb-10" src="/fabian.jpg">
            <h1>Hi there.<br/>I'm Fabian.</h1>
            <h2>Great to see you.</h2>
          </div>
        </div>
      </div>
      <div id="page2" class="page">
        <div class="h-full flex justify-center items-center text-white text-center  pb-36">
          <div class="m-5 lg:max-w-96">
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
      <div id="page3" class="page">
        <div class="h-full flex justify-center items-center text-white text-center">
          <div class="m-5 lg:max-w-96">
            <h1>1997</h1>
            I came into the world in 97, right here in Welsberg, South Tyrol.
          </div>
        </div>
      </div>
      <div id="page4" class="page">
        <div class="h-full flex justify-center items-center text-white text-center">
          <div class="m-5 lg:max-w-96">
            <h1>2003-2016</h1>
            Spent some good years at TFO Bruneck. It helped me evolving me and my technical skills.
          </div>
        </div>
      </div>
      <div id="page5" class="page">
        <div class="h-full flex justify-center items-center text-white text-center">
          <div class="m-5 lg:max-w-96">
            <h1>2016-2019</h1>
            Worked for three years at Elpo Bruneck, handling building control systems. It was a job that kept me engaged and encouraged innovation.
          </div>
        </div>
      </div>
      <div id="page6" class="page">
        <div class="h-full flex justify-center items-center text-white text-center">
          <div class="m-5 lg:max-w-96">
            <h1>2019-2022</h1>
            Took a three-year stint in Innsbruck to dive into Computer Science. Explored the vast world of tech and picked up valuable skills.
          </div>
        </div>
      </div>
      <div id="page7" class="page">
        <div class="h-full flex justify-center items-center text-white text-center">
          <div class="m-5 lg:max-w-96">
            <h1>Since 2022</h1>
            Since 2022, I've been working with the SiMedia crew. It's been a journey of collaboration and innovation, and I'm embracing every moment.
          </div>
        </div>
      </div>
      <div id="page8" class="page">
        <div class="h-full flex justify-center items-center text-white text-center">
          <div class="m-5 lg:max-w-96">
            <h1>Thank you!</h1>
            <div>
            <span>Here are some of the technologies that helped me build this website.<br></span>
            <span class="flex justify-center items-center gap-4 my-2">
              <a href="https://vuejs.org//"><img class="h-8 invert" alt="Three.js" src="/threejs.png"></a>
              <a href="https://tailwindcss.com/"><img class="h-8 invert" alt="Tailwind" src="/tailwind.png"></a>
              <a href="https://aws.amazon.com/"><img class="h-8 invert" alt="AWS" src="/aws.png"></a>
              <a href="https://threejs.org/"><img class="h-8 invert" alt="Github" src="/github.png"></a>
            </span>
            <span>Contact me</span>
            <span class="flex justify-center gap-2 my-2">
              <a href="mailto:amhof.fabian1234@gmail.com">
                <img class="h-8 invert" alt="Mail" src="/email.png">
              </a>
            </span>
            </div>
          </div>
        </div>
      </div>
      <div id="page9" class="page">
        <div class="h-full flex justify-center items-center text-white text-center">
          <div class="m-5 lg:max-w-96">
            <h1>Credits</h1>
            <p class="mb-3">This work is based on "Snow Mountain" (https://sketchfab.com/3d-models/snow-mountain-28d511ddb8624eee9684e93824e543f5) by nigromancer (https://sketchfab.com/nigromancer) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)</p>
            <p class="mb-3">This work is based on "Cloud Low Poly #01" (https://sketchfab.com/3d-models/cloud-low-poly-01-1f7e39b63dea47bcaf6f888f34b02a80) by Game Green (https://sketchfab.com/gamegreen) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)</p>
            <p class="mb-3">This work is based on "[Extracted] Minecraft Java Edition's Stars" (https://sketchfab.com/3d-models/extracted-minecraft-java-editions-stars-c8868b7ffc4a473eb5cd9203a59e3650) by AjaxGb (https://sketchfab.com/ajaxgb) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
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

#content {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.1);
}

.page {
  position: absolute;
  height: 100dvh;
  width: 100dvw;
  opacity: 0;
}

h1 {
  @apply !mb-5
}
</style>
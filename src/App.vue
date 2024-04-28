<script setup>
import MountainScene from '@/MountainScene.vue';
import SkyScene from '@/SkyScene.vue';
</script>
<template>
  <div id="container" style="position: relative; height: 100vh; width: 100vw;">
    <div style="position: fixed;">
      <Suspense>
        <SkyScene />
      </Suspense>
    </div>
    <div class="pageContainer" style="position: absolute; height: 100%; width: 100%;">
      <div class="page center-content">
        <div class="content hi">
          <h1><span>Hi there. I'm Fabian.</span> </h1>
          <h2>Great to see you.<br> Scroll down to get to know me a little better.
          </h2>
        </div>
      </div>
      <div class="page me right-content">
        <div class="content me lg:w-1/3 w-full">
          <h2>Me</h2>
          <div>
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
      <div class="page journey left-content">
        <div class="content journey">
          <div>
            Click on a star
          </div>
        </div>
      </div>
      <div class="page center-content">
        <div class="content thanks">
          <div class="text-center h-full w-full flex flex-col items-center justify-center">
            <h1>
              <Typing speed={2} infinite={true} text="<bold class='font-extrabold'>Thank you!</bold>" />
            </h1>
            <div class="flex flex-col gap-5 items-center justify-center">
              <span>
                <br>Here are some of the technologies that helped me build this website.<br>
              </span>
              <span class="flex gap-5">
                <a class="transition-all duration-500 h-10 hover:h-16" href="https://astro.build/"><img class="h-full"
                    alt="Astro" src="/astro.png"></a>
                <a class="transition-all duration-500 h-10 hover:h-16" href="https://tailwindcss.com/"><img
                    class="h-full" alt="Tailwind" src="/tailwind.png"></a>
                <a class="transition-all duration-500 h-10 hover:h-16" href="https://aws.amazon.com/"><img
                    class="h-full" alt="AWS" src="/aws.png"></a>
                <a class="transition-all duration-500 h-10 hover:h-16"
                  href="https://github.com/fabianamhof/myWebsite2"><img alt="Github" class="h-full"
                    src="/github.png"></a>
              </span>
              <span class="mt-10">Contact me</span>
              <span class="flex gap-5">
                <a class="transition-all duration-500 h-10 hover:h-16" href="mailto:amhof.fabian1234@gmail.com"><img
                    class="h-full" alt="Mail" src="/email.png"></a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="position: fixed;">
      <Suspense>
        <MountainScene />
      </Suspense>
    </div>
  </div>

</template>

<style>
html {
  font-family: monospace, system-ui, sans-serif;
  scroll-behavior: smooth;
}

body {
  background-color: black;
}

#app {
  height: 100vh;
  width: 100vw;
}

.page {
  height: 100%;
  @apply p-10 lg:p-20 text-white lg:text-2xl
}

.center-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.right-content {
  display: flex;
  align-items: center;
  justify-content: end;
}

.left-content {
  display: flex;
  align-items: center;
  justify-content: start;
}

.content.hi {
  text-align: center;
  margin-bottom: 200px;
  @apply text-gray-700
}

.content.me {
  text-align: right;
  @apply mb-52
}

.content.journey {
  text-align: right;
  width: 30%;
}

.content.thanks {
  text-align: center;
  z-index: 4
}
</style>
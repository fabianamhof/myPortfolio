<script setup>
import MountainScene from '@/MountainScene.vue';
</script>
<template>
  <div style="position: relative; height: 100%; width: 100%;">
    <div style="position: absolute; height: 100%; width: 100%;">
      <div class=" content hi">
        <div style="margin-top: -200px;">
          <h1><span>Hi there. I'm Fabian.</span> </h1>
          <h2>Great to see you.<br> Scroll down to get to know me a little better.
          </h2>
        </div>
      </div>
      <div class="content me">
        <div style="margin-top: -200px;">
          I'm a web technology enthusiast with a knack for crafting innovative solutions that seamlessly integrate with
          user needs. My journey through Computer Science at the University of Innsbruck has equipped me with a diverse
          skill set, covering various facets of software development. Beyond the digital realm, I find joy and vitality
          in outdoor pursuits like hiking or soccer.
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
#app {
  height: 100vh;
  width: 100vw;
}

.content {
  background-color: #e6f6fe;
  color: gray;
  height: 100%;
  display: flex;
  padding: 0 10rem;
}

.content.hi {
  align-items: center;
  justify-content: center;
  text-align: center
}

.content.me {
  align-items: center;
  justify-content: end;
  text-align: center
}
</style>
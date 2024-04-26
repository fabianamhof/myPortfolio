<script setup>
import MountainScene from '@/MountainScene.vue';
import SkyScene from '@/SkyScene.vue';
</script>
<template>
  <div id="container" style="position: relative; height: 100%; width: 100%;">
    <div style="position: fixed;">
      <Suspense>
        <SkyScene />
      </Suspense>
    </div>
    <div style="position: absolute; height: 100%; width: 100%;">
      <div class="page center-content">
        <div class="content hi">
          <h1><span>Hi there. I'm Fabian.</span> </h1>
          <h2>Great to see you.<br> Scroll down to get to know me a little better.
          </h2>
        </div>
      </div>
      <div class="page right-content">
        <div class="content me">
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
      <div class="page left-content">
        <div class="content journey">
          <div>
            Click on a star
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
#app {
  height: 100vh;
  width: 100vw;
}

.page {
  color: gray;
  height: calc(100%);
  padding: 100px
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

.content {
  color: gray;
}

.content.hi {
  text-align: center;
  padding-bottom: 200px;
}

.content.me {
  text-align: right;
  width: 30%;
}

.content.journey {
  text-align: right;
  width: 30%;
}
</style>
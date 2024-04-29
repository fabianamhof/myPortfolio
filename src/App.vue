<script setup>
import MountainScene from '@/MountainScene.vue';
</script>
<template>
  <div class="pageContainer" style="position: absolute;">
    <div id="page1" class="page">
    </div>
    <div id="page2" class="page">
    </div>
    <div id="page3" class="page">
    </div>
    <div id="page4" class="page">
    </div>
  </div>
  <div id="container">

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

:root {
  --color: rgba(135, 206, 255, 1);
  --color2: rgba(135, 206, 255, 1);
}


.pageContainer {
  background-image: linear-gradient(0deg, var(--color) 30%, var(--color2) 100%);
}

#app {
  height: 100vh;
  width: 100vw;
}

.page {
  height: 100vh;
  width: 100vw;
}
</style>
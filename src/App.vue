<script setup lang="ts">
import MountainScene from '@/MountainScene.vue';
import { onMounted, onBeforeUnmount, ref } from "vue"

const tiltDetected = ref(false);

const handleOrientationChange = () => {
  tiltDetected.value = window.innerWidth/window.innerHeight > 4/3;
};

onMounted(() => {
  // Listen for device orientation change events
  window.addEventListener('resize', handleOrientationChange);
  handleOrientationChange();
});

onBeforeUnmount(() => {
  // Remove event listener to prevent memory leaks
  window.removeEventListener('resize', handleOrientationChange);
});

function detectMostVisiblePage(): string {
    let minValue = 100000;
    let mostVisiblePageId = null;
    const pages = document.querySelectorAll(".page")
    // Loop through each page to check its visible area
    pages.forEach(page => {
        const pageRect = page.getBoundingClientRect();

        console.log(page.id, pageRect)

        if (Math.abs(pageRect.top) < minValue) {
          minValue = Math.abs(pageRect.top);
          mostVisiblePageId = page.id;
        }
    });

    console.log(mostVisiblePageId);

    // Return the id of the most visible page
    return mostVisiblePageId;
}

function nextPage() {
    // Get all page elements
    const pages = document.querySelectorAll('.page');

    // Get the currently visible page
    const currentVisiblePageId = detectMostVisiblePage();

    // Find the index of the currently visible page
    let currentIndex = -1;
    for (let i = 0; i < pages.length; i++) {
        if (pages[i].id === currentVisiblePageId) {
            currentIndex = i;
            break;
        }
    }

    // If the currently visible page is found and it's not the last page, scroll to the next page
    if (currentIndex !== -1 && currentIndex < pages.length - 1) {
        const nextPage = pages[currentIndex + 1];
        nextPage.scrollIntoView();
    }
}

function prevPage() {
    // Get all page elements
    const pages = document.querySelectorAll('.page');

    // Get the currently visible page
    const currentVisiblePageId = detectMostVisiblePage();

    // Find the index of the currently visible page
    let currentIndex = -1;
    for (let i = 0; i < pages.length; i++) {
        if (pages[i].id === currentVisiblePageId) {
            currentIndex = i;
            break;
        }
    }

    // If the currently visible page is found and it's not the first page, scroll to the previous page
    if (currentIndex !== -1 && currentIndex > 0) {
        const prevPage = pages[currentIndex - 1];
        prevPage.scrollIntoView();
    }
}
</script>
<template>
  <div class="pageContainer" style="position: absolute;"  v-if="tiltDetected">
    <div id="page1" class="page">
    </div>
    <div id="page2" class="page">
    </div>
    <div id="page3" class="page">
    </div>
    <div id="page4" class="page">
    </div>
  </div>
  <div id="container" v-if="tiltDetected">
    <div style="position: fixed;">
      <Suspense>
        <MountainScene :key="tiltDetected" />
      </Suspense>
    </div>
    <div class="pointer-events-none" style="position: fixed; width: 100vw; height: 100dvh;">
      <button class="bg-white opacity-50 rounded-full p-5 top-5 right-5 absolute pointer-events-auto" @click="prevPage"> &uarr;</button>
      <button class="bg-white opacity-50 rounded-full p-5 bottom-5 right-5 absolute pointer-events-auto" @click="nextPage"> &darr;</button>
    </div>
  </div>
  <div style="position: fixed; width: 100vw; height: 100dvh;" class="bg-black pointer-events-none" v-if="tiltDetected === false">
    <div class="flex h-full justify-center items-center text-center text-white">
      <h1>
        Please tilt you device or increase the aspect-ratio.
      </h1> 
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


.pageContainer {
  background-image: linear-gradient(0deg, var(--color) 30%, var(--color2) 100%);
}

.page {
  height: 100dvh;
  width: 100dvw;
}
</style>
<script setup lang="ts">
import { TresCanvas, useRenderLoop } from '@tresjs/core';
import { BasicShadowMap, SRGBColorSpace, NoToneMapping, Vector3, Color, Mesh } from 'three'
import { onMounted, ref, shallowRef, watch } from 'vue';
import { Line2, OrbitControls, useGLTF } from '@tresjs/cientos';
import CSS3DContent from "@/CSS3DContent.vue";
import type { Star } from './types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getCurrentPosition } from './positionInfo';

const { scene: stars, materials: starsMaterials } = await useGLTF('/stars/scene.gltf')

const tresContext = shallowRef();
const container = shallowRef<HTMLElement>();
const starsObject = shallowRef();

const brightStars = ref<Star[]>([
  {
    title: "1997",
    description: "I came into the world in 97, right here in Welsberg, South Tyrol.",
    point: new Vector3(0, 70, 5),
  },
  {
    title: "2003-2016",
    description: "Spent some good years at TFO Bruneck. It helped me evolving me and my technical skills.",
    point: new Vector3(-2, 65, 3),
  },
  {
    title: "2016-2019",
    description: "Worked for three years at Elpo Bruneck, handling building control systems. It was a job that kept me engaged and encouraged innovation.",
    point: new Vector3(-4, 55, 0),
  },
  {
    title: "2019-2022",
    description: "Took a three-year stint in Innsbruck to dive into Computer Science. Explored the vast world of tech and picked up valuable skills.",
    point: new Vector3(-1, 51, -1),
  },
  {
    title: "Since 2022",
    description: "Since 2022, I've been working with the SiMedia crew. It's been a journey of collaboration and innovation, and I'm embracing every moment.",
    point: new Vector3(0, 40, -4),
  }
])

const gl = {
  shadows: true,
  alpha: true,
  shadowMapType: BasicShadowMap,
  outputColorSpace: SRGBColorSpace,
  toneMapping: NoToneMapping,
  windowSize: true,
}

const { scene: clouds, nodes: cloudNodes, materials: cloudMaterials } = await useGLTF('/clouds/scene.gltf')
const { scene: mountain, nodes: mountainNodes } = await useGLTF('/snow_mountain/scene.gltf')


for (const key in cloudNodes) {
  const node = cloudNodes[key]
  if (node instanceof Mesh) { node.castShadow = true; }
}

for (const key in mountainNodes) {
  const node = mountainNodes[key]
  node.receiveShadow = true;
}

for (const cloudMaterial in cloudMaterials) {
  cloudMaterials[cloudMaterial].emissive = new Color(0.4, 0.4, 0.4)
}

cloudNodes.Icosphere001.position.y = 3
cloudNodes.Icosphere002.position.y = 5
cloudNodes.Icosphere003.position.y = 4
cloudNodes.Icosphere004.position.y = 8
cloudNodes.Icosphere005.position.y = 10
cloudNodes.Cylinder005.visible = false;
console.log(cloudNodes);

const camera = shallowRef();
const cloudsModel = shallowRef();
const mountainModel = shallowRef();
const sun = shallowRef();
const ambientLight = shallowRef();

const { onLoop } = useRenderLoop();


gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.defaults({
  immediateRender: false,
});
let cameraAnimation1 = gsap.timeline({
  scrollTrigger: {
    trigger: ".pageContainer",
    start: "top top",
    endTrigger: ".pageContainer",
    end: "bottom bottom",
    scrub: 1,
  }
});

// let cameraAnimation2 = gsap.timeline({
//   scrollTrigger: {
//     trigger: "#page2",
//     start: "bottom bottom",
//     endTrigger: "#page3",
//     end: "bottom bottom",
//     scrub: 1,
//   }
// });

// let cameraAnimation3 = gsap.timeline({
//   scrollTrigger: {
//     trigger: "#page3",
//     start: "bottom bottom",
//     endTrigger: "#page4",
//     end: "bottom bottom",
//     scrub: 1,
//   }
// });




let cloudPath = 0;
let lookAt = new Vector3(0, 10, 0)
let firstIter = false

const color1 = "linear-gradient(90deg, rgba(156,36,64,1) 34%, rgba(46,125,152,1) 100%);"

onLoop(({ delta, elapsed }) => {
  if (!firstIter) {
    cameraAnimation1.to(camera?.value.position, { x: -10, y: 0, z: -20 })
    cameraAnimation1.to("body", { "--color": "rgba(156,36,64,1)", "--color2": "rgba(46,125,152,1)" }, "<")
    cameraAnimation1.to(lookAt, { x: -10, y: 10, z: 0 }, "<")
    cameraAnimation1.to("#hi", { opacity: 0, duration: 0.2 }, "<")
    cameraAnimation1.to("#me", { opacity: 1, duration: 0.2 }, "<0.2")

    cameraAnimation1.to(camera?.value.position, { x: 4, y: 55, z: -40 }, ">0.5")
    cameraAnimation1.to("body", { "--color": "rgba(17,29,33,1)", "--color2": "rgba(17,29,33,1)" }, "<")
    cameraAnimation1.to(lookAt, { x: 4, y: 55, z: 0 }, "<")
    cameraAnimation1.to("#journey", { opacity: 1, duration: 0.5 }, "<")

    cameraAnimation1.to(camera?.value.position, { x: 0, y: 55, z: -40 }, ">0.5")
    cameraAnimation1.to(lookAt, { x: -34, y: 55, z: -40 }, "<")
    cameraAnimation1.to("#thanks", { opacity: 1, duration: 0.5 }, "<")


    firstIter = true
  }

  cloudPath += 0.0005
  if (cloudPath > 1) {
    cloudPath = 0;
  }


  mountainModel.value.rotation.x = 0;
  mountainModel.value.rotation.y = Math.PI / 2;
  mountainModel.value.rotation.z = 0;
  mountainModel.value.position.x = 0;
  mountainModel.value.position.y = 0;
  mountainModel.value.position.z = 0;

  cloudsModel.value.position.z = -12 + 48 * cloudPath;

  camera.value.lookAt(lookAt)
})

watch(cloudsModel, () => {
  cloudsModel.value.lookAt(camera.value.position)
})

onMounted(() => {


  // 
})
</script>

<template>
  <div>
    <TresCanvas ref="tresContext" v-bind="gl" style="position: absolute; pointer-events: none;">
      <TresPerspectiveCamera ref="camera" :position="new Vector3(20, 0, 0)" :look-at="new Vector3(0, 10, 0)" />
      <!-- <OrbitControls></OrbitControls> -->
      <primitive ref="mountainModel" :object="mountain" :position="new Vector3(0, 0, 0)" />
      <primitive ref="cloudsModel" :object="clouds" :position="new Vector3(0, 7, 0)" :scale="new Vector3(2, 2, 2)" />
      <primitive ref="starsObject" :object="stars" />
      <template v-for="(star, index) in brightStars" :key="index">
        <TresMesh :position="star.point" :scale="new Vector3(0.3, 0.3, 0.3)">
          <TresSphereGeometry></TresSphereGeometry>
        </TresMesh>
      </template>
      <Line2 :points="brightStars.map((star) => star.point)" :line-width="0.001"></Line2>
      <CSS3DContent :stars="brightStars"></CSS3DContent>
      <TresDirectionalLight ref="sun" color="white" :position="new Vector3(5, 10, 200)" :intensity="3" cast-shadow />
      <TresAmbientLight ref="ambientLight" color="white" :intensity="1" />
    </TresCanvas>
  </div>
</template>
<script setup lang="ts">
import { useGLTF } from '@tresjs/cientos'

const { scene, nodes, materials } = await useGLTF('/snow_mountain/scene.gltf')
</script>

<template>
  <primitive v-bind="$attrs" :object="scene" />
</template>
<script setup>
// Dynamic binding prevents Vite from treating this as a static asset import
// during SSR — the value is resolved at runtime, not at compile time.
defineProps({
  inline: {
    type: Boolean,
    default: false,
  },
})
const src = '/demo.mp4'
</script>

<template>
  <div :class="['fk-demo', inline ? 'fk-demo-inline' : '']">
    <div class="fk-demo-inner">
      <video :src="src" autoplay loop muted playsinline preload="none" width="860" height="484"></video>
    </div>
  </div>
</template>

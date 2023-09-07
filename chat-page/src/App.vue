<script setup lang="ts">
import "animate.css"
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition name="animate__animated animate__bounce" enter-active-class="animate__fadeInRightBig"
      leave-active-class="animate__fadeOutLeftBig" appear mode="out-in">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<style scoped>
.animate__animated.animate__bounce {
  --animate-duration: 0.2s;
}
</style>
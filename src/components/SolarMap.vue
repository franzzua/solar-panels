<script setup lang="ts">
import {onBeforeUnmount, onMounted, shallowRef} from "vue";
import {MapHandler} from "@/maps/map-handler";
import '@maptiler/sdk/dist/maptiler-sdk.css';
import {solarStore} from "@/services/store";

const keyboardHandler = (e: KeyboardEvent) => {
  const direction = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'top',
    ArrowDown: 'bottom',
  }[e.key] as Direction | undefined;
  if (direction && solarStore.selectedPanel) {
    solarStore.cloneSelectedAndMove(direction);
  }
}
const mapContainer = shallowRef<HTMLElement | null>(null);
onMounted(() => {
  new MapHandler(mapContainer.value!);
  window.addEventListener('keyup', keyboardHandler)
})
onBeforeUnmount(() => window.removeEventListener('keyup', keyboardHandler));
</script>
<template>
  <div ref="mapContainer" class="container"></div>
</template>

<style scoped>
.container{
  width: 100%;
  height: 100%;
}
</style>

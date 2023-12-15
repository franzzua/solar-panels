<script setup>
import {config} from '@maptiler/sdk';
import {onMounted, shallowRef} from "vue";
import {MapHandler} from "@/components/map-handler.ts";
import '@maptiler/sdk/dist/maptiler-sdk.css';

const mapContainer = shallowRef(null);
config.apiKey = 'LrAb6HjnrM0QAkRImnPk';
onMounted(() => {
  new MapHandler(mapContainer.value);
})
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

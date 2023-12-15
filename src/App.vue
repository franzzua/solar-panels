<script setup lang="ts">
import SolarMap from "@/components/SolarMap.vue";
import {solarStore} from "@/services/store";
import {onBeforeUnmount, onMounted, ref} from "vue";
import "./assets/base.css";

const rotation = ref(0)
const size = ref({width: 1, height: 2})
const add = () => solarStore.addPanel(size.value, rotation.value);
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
onMounted(() => window.addEventListener('keyup', keyboardHandler));
onBeforeUnmount(() => window.removeEventListener('keyup', keyboardHandler));
</script>

<template>
  <div class="container">
  <SolarMap class="map"/>
    <div class="panel">
      <div class="selectDegree">
        <label>
          <input type="radio" value="0" :checked="rotation == 0" @click="rotation = 0">
          <div style="width: 1em; height: 2em; background: #181818"/>
        </label>

        <label>
          <input type="radio" value="90" :checked="rotation == -90" @click="rotation = -90">
          <div style="width: 2em; height: 1em; background: #181818"/>
        </label>
      </div>
      <button @click="add">Add</button>
    </div>
  </div>
</template>

<style scoped>
.map{
  width: 100%;
  height: 100%;
}
.container{
  width: 100vw;
  height: 100vh;
  position: relative;
}
.panel{
  width: 20vw;
  position: absolute;
  right: 5px;
  top: 5px;
  background: #FFF3;
  backdrop-filter: blur(3px);
  padding: 1em;
}
.selectDegree{
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  gap: 1em;
}
.selectDegree input{
  display: none;
}
.selectDegree label{
  border: solid .1px transparent;
  padding: .5em 1em;
  display: flex;
  align-items: center;
}
.selectDegree label:has(input:checked){
  border-color: red;
}
</style>

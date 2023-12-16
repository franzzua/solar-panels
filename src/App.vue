<script setup lang="ts">
import SolarMap from "@/components/SolarMap.vue";
import {solarStore} from "@/services/store";
import {onBeforeUnmount, onMounted, ref} from "vue";
import "./assets/base.css";
import {BingSource} from "@/maps/sources/bing-source";
import {GoogleSource} from "@/maps/sources/google-source";

const rotation = ref(0)
const size = ref({width: 1, height: 2})
const sources = [
  new GoogleSource(GOOGLE_API_KEY),
  new BingSource(BING_API_KEY)
]
solarStore.tileSource = sources[0];
function changeTileSource(id){
  solarStore.tileSource = sources.find(x => x.id == id);
}
const add = () => solarStore.addPanel(
    rotation.value == 0 ? size.value : {width: size.value.height, height: size.value.width},
    0
);
solarStore.on('change', e => {
  localStorage.setItem('data', JSON.stringify(e));
});
onMounted(() => {
  const data = JSON.parse(localStorage.getItem('data') ?? '[]');
  solarStore.load(data);
})
</script>

<template>
  <div class="container">
    <SolarMap class="map"/>
    <div class="panel">
      <label>
        <span>Tile Source</span>
        <select :value="solarStore.tileSource?.id" @change="changeTileSource($event.target.value)">
          <option value="google">Google</option>
          <option value="bing">Bing</option>
        </select>
      </label>
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
  left: 5px;
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

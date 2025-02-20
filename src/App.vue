<script>
import { mapActions } from 'pinia';
import { useDataStore } from './stores/store';
import NavBar from '@/components/NavBar.vue';

export default {
  name: 'App',
  
  components: {
    NavBar,
  },

  methods: {
    ...mapActions(useDataStore, ['populatePacientes', 'populateOperadores', 'populateZonas', 'populateLlamadasSalientes', 'populateLlamadasEntrantes']),
  },

  mounted() {
    this.populatePacientes();
    this.populateOperadores();
    this.populateZonas();
    this.populateLlamadasSalientes();
    this.populateLlamadasEntrantes();
  }
};
</script>

<template>
  
  <div class="container">
    <header>
      <NavBar />
    </header>
    
    <RouterView />
    
    <footer>
      <a>Footer CAMBIADO</a>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>

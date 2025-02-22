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
    this.populateZonas();
    this.populatePacientes();
    this.populateOperadores();
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
      <a>Teleasistència - Grup 3 - 2024/2025</a>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
footer{
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

</style>

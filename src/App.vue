<script>
import { mapActions } from 'pinia';
import { useDataStore } from './stores/store';
import NavBar from '@/components/NavBar.vue';
import AppMessages from './components/AppMessages.vue';

export default {
  name: 'App',
  
  components: {
    NavBar,
    AppMessages
  },

  methods: {
    ...mapActions(useDataStore, ['populatePacientes', 'populateOperadores', 'populateZonas', 'populateLlamadasSalientes', 'populateLlamadasEntrantes']),
  },

  async mounted() {
    await this.populateZonas();
    await this.populatePacientes();
    await this.populateOperadores();
    await this.populateLlamadasSalientes();
    await this.populateLlamadasEntrantes();
  }
};
</script>

<template>
  
  <div class="container">
    <header>
      <NavBar />
    </header>
    <app-messages />
    
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
<script>
export default {
  name: 'NavBar',
  computed: {
    operadorId() {
      return JSON.parse(localStorage.getItem("operador"))?.id ?? null;
    }
  }
};
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
          aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">  
          <li class="nav-item">
            <RouterLink class="nav-link nav-item-hover" to="/">Listado de pacientes</RouterLink>
          </li>          
          <li class="nav-item">
            <RouterLink class="nav-link nav-item-hover" to="/registerPatient">Registrar paciente</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link nav-item-hover" to="/calendarViewAvisos">Calendario de Avisos</RouterLink>
          </li>
              <li class="nav-item">
            <RouterLink class="nav-link nav-item-hover" :to="{ name: 'generateWarn', query: { tipo: 'alarma' } }">Crear Aviso de Zona</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link nav-item-hover" :to="{ name: 'myCallsOperador', params: { operador: operadorId } }">Mis llamadas</RouterLink>
          </li>
        
          <li class="nav-item">
            <RouterLink class="nav-link nav-item-hover" to="/logout">Logout</RouterLink>
          </li>

        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-item-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-radius 0.3s ease;
}

.nav-item-hover:hover {
  transform: scale(1.1);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
</style>

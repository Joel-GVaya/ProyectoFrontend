<script>
import { useDataStore } from "../stores/store";
import { mapActions } from "pinia";

export default {
  name: "CallsView",
  props: ["id"],

  data() {
    return {
      llamada: {},
      operador: {},
      paciente: {},
    };
  },

  async mounted() {
    this.llamada = await this.getLlamadaEntrante(this.id);
    this.operador = await this.getOperadorByID(this.llamada.user_id);
    this.paciente = await this.getPacienteByID(this.llamada.paciente_id);
  },

  methods: {
    ...mapActions(useDataStore, ["getLlamadaEntrante", "getOperadorByID", "getPacienteByID"]),
    editCall() {
      this.$router.push({ name: "editIncomingCall", params: { id: this.llamada.id } });
    },
    formatDuracion(duracionEnSegundos) {
      const minutos = Math.floor(duracionEnSegundos / 60);
      const segundos = duracionEnSegundos % 60;
      if (minutos === 0) {
        return `${segundos} segundos`;
      } else if (segundos === 0) {
        return `${minutos} minutos`;
      } else if (minutos === 1) {
        return `${minutos} minuto y ${segundos} segundos`;
      } else if (segundos === 1) {
        return `${minutos} minutos y ${segundos} segundo`;
      } else if (minutos === 1 && segundos === 1) {
        return `${minutos} minuto y ${segundos} segundo`;
      } else {  
        return `${minutos} minutos y ${segundos} segundos`;
      }
    },
  },
};
</script>

<template>
  <div class="call-details">
    <h1>Detalles de la Llamada</h1>
    <div class="detail"><strong>Fecha y Hora:</strong> {{ llamada.fecha_hora }}</div>
    <div class="detail"><strong>Operador:</strong> {{ operador.nombre }}</div>
    <div class="detail"><strong>Paciente:</strong> {{ paciente.nombre }}</div>
    <div class="detail"><strong>Emergencia:</strong> {{ llamada.emergencia ? 'Sí' : 'No' }}</div>
    <div class="detail"><strong>Subtipo:</strong> {{ llamada.subtipo }}</div>
    <div class="detail"><strong>Descripción:</strong> {{ llamada.descripcion }}</div>
    <div class="detail"><strong>Duración:</strong> {{ formatDuracion(llamada.duracion) }}</div>
  </div>
  <div>
    <button class="edit-button" @click="editCall">Editar</button>
  </div>
</template>

<style scoped>
.call-details {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.call-details h1 {
  text-align: center;
  margin-bottom: 20px;
}

.detail {
  margin-bottom: 10px;
  font-size: 1.1em;
}

.detail strong {
  color: #333;
}

.edit-button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #007bff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1em;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.edit-button:hover {
  background-color: #0056b3;
}
</style>
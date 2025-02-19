<script>
import { useDataStore } from "../stores/store";
import { mapActions } from "pinia";

export default {
  name: "WarnDetails",
  props: ["id"],

  data() {
    return {
      aviso: {},
      operador: {},
      paciente: {},
    };
  },

  async mounted() {
    this.aviso = await this.getAvisoByID(this.id);
    this.operador = await this.getOperadorByID(this.aviso.operador_id);
    this.paciente = await this.getPacienteByID(this.aviso.paciente_id);
  },

  methods: {
    ...mapActions(useDataStore, ["getAvisoByID", "getOperadorByID", "getPacienteByID", "deleteAvisoByID"]),
    async deleteAviso(id) {
      await this.deleteAvisoByID(id);
      this.$router.push({ name: "home" });
    }
  },
};
</script>

<template>
  <div class="warn-details">
    <h1>Detalles del Aviso</h1>
    <div class="detail"><strong>Fecha de Inicio:</strong> {{ aviso.fecha_inicio }}</div>
    <div class="detail"><strong>Operador:</strong> {{ operador.nombre }}</div>
    <div class="detail"><strong>Paciente:</strong> {{ paciente.nombre }}</div>
    <div class="detail"><strong>Tipo:</strong> {{ aviso.tipo }}</div>
    <div class="detail"><strong>Categoría:</strong> {{ aviso.categoria }}</div>
    <div class="detail"><strong>Descripción:</strong> {{ aviso.descripcion }}</div>
    <div class="detail"><strong>Frecuencia:</strong> {{ aviso.frecuencia }}</div>
    <div class="detail"><strong>Zona Afectada:</strong> {{ aviso.zona_afectada }}</div>
  </div>
  <div>
    <button class="edit-button" @click="deleteAviso(aviso.id)">Eliminar</button>
  </div>
</template>

<style scoped>
.warn-details {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.warn-details h1 {
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

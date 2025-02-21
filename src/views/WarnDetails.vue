<script>
import { useDataStore } from "../stores/store";
import { mapActions } from "pinia";

export default {
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
    },
    formatFecha(fechaISO) {
      const separador = fechaISO.includes("T") ? "T" : " ";
      const [fecha, hora] = fechaISO.split(separador);
      const [year, month, day] = fecha.split("-");
      const [hour, minute] = hora.split(":");
      return {
        fecha: `${day}/${month}/${year}`,
        hora: `${hour}:${minute}`
      };
    }
  },

  computed: {
    frecuenciaFormateada() {
      if (this.aviso.frecuencia && this.aviso.frecuencia.startsWith("periodico")) {
        const dias = this.aviso.frecuencia.split('-')[1];
        return `Periódico, cada ${dias} días`;
      }
      return this.aviso.frecuencia;
    },
    fechaFormateada() {
      if (this.aviso.fecha_inicio) {
        return this.formatFecha(this.aviso.fecha_inicio).fecha;
      }
      return "";
    },
    horaFormateada() {
      if (this.aviso.fecha_inicio) {
        return this.formatFecha(this.aviso.fecha_inicio).hora;
      }
      return "";
    }
  }
};
</script>

<template>
  <div class="warn-details">
    <h1>Detalles del Aviso</h1>
    <div class="detail"><strong>Fecha de Inicio:</strong> {{ fechaFormateada }}</div>
    <div class="detail"><strong>Fecha de Inicio:</strong> {{ horaFormateada }}</div>
    <div class="detail"><strong>Operador:</strong> {{ operador.nombre }}</div>
    <div class="detail" v-if="paciente !== null"><strong>Paciente:</strong> {{ paciente.nombre }}</div>
    <div class="detail"><strong>Tipo:</strong> {{ aviso.tipo }}</div>
    <div class="detail"><strong>Categoría:</strong> {{ aviso.categoria }}</div>
    <div class="detail"><strong>Descripción:</strong> {{ aviso.descripcion }}</div>
    <div class="detail"><strong>Frecuencia:</strong> {{ frecuenciaFormateada }}</div>
    <div class="detail" v-if="aviso.zona_afectada !== null"><strong>Zona Afectada:</strong> {{ aviso.zona_afectada }}
    </div>
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

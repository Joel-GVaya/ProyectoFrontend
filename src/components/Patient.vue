<script>
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/store";
export default {
  props: ["paciente"],
  computed: {
    ...mapState(useDataStore, ["getNomZonaById"]),
  },
  methods: {
    ...mapActions(useDataStore, ["darDeBajaPaciente"]), 
    verPaciente(id) {
      this.$router.push({ name: "detailsPatient", params: { id: id } });
    },
    editarPaciente(id) {
      this.$router.push({ name: "editPatient", params: { id: id } });
    },
  },
};
</script>

<template>
  <tr>
    <td>{{ paciente.nombre }}</td>
    <td>{{ paciente.telefono }}</td>
    <td>{{ paciente.DNI }}</td>
    <td>{{ getNomZonaById(paciente.zona_id) }}</td>
    <button name="ver" class="btn btn-success btn-sm me-2 ms-2" @click="verPaciente(paciente.id)">
        <i class="bi bi-eye-fill"> Ver</i>
    </button>
    <button name="editar" class="btn btn-warning btn-sm me-2" @click="editarPaciente(paciente.id)">
      <i class="bi bi-pencil-fill"> Editar</i>
    </button>
    <button name="eliminar" class="btn btn-danger btn-sm me-2" @click="darDeBajaPaciente(paciente.id)">
      <i class="bi bi-trash-fill">
        Dar de baja</i
      >
    </button>
  </tr>
</template>

<style scoped>
</style>

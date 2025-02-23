<script>
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/store";
export default {
  props: ["paciente"],
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
    <td>{{ paciente.zona.nombre }}</td>
    <td class="botones">
      <button name="ver" class="btn btn-success btn-sm me-2" @click="verPaciente(paciente.id)">
        <i class="bi bi-eye-fill"> Ver</i>
      </button>
      <button name="editar" class="btn btn-warning btn-sm me-2" @click="editarPaciente(paciente.id)">
        <i class="bi bi-pencil-fill"> Editar</i>
      </button>
      <button name="eliminar" class="btn btn-danger btn-sm" @click="darDeBajaPaciente(paciente.id)">
        <i class="bi bi-trash-fill"> Dar de baja</i>
      </button>
    </td>
  </tr>
</template>

<style scoped>
.botones {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
}

@media (max-width: 768px) {
  .botones button {
    width: 100%;
  }
}
</style>


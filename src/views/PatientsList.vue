<script>
import { mapState, mapActions } from "pinia";
import { useDataStore } from "@/stores/store";
import Patient from "@/components/Patient.vue";

export default {

  props: ["id", "zona"],

  components: {
    Patient,
  },

  data() {
    return {
      sortKey: "nombre",
      sortOrder: 1,
    };
  },

  computed: {
    ...mapState(useDataStore, ["pacientes"]),

    pacientesOrdenados() {
      return [...this.pacientes].sort((a, b) => {
        let valorA = a[this.sortKey]?.toString().toLowerCase() || "";
        let valorB = b[this.sortKey]?.toString().toLowerCase() || "";

        if (valorA < valorB) return -1 * this.sortOrder;
        if (valorA > valorB) return 1 * this.sortOrder;
        return 0;
      });
    },
  },

  async mounted() {
    const usuario = JSON.parse(localStorage.getItem("operador"));
    if (!usuario) {
      this.$router.push("/login");
      return;
    }
  },

  methods: {
    ordenarPor(campo) {
      if (this.sortKey === campo) {
        this.sortOrder *= -1;
      } else {
        this.sortKey = campo;
        this.sortOrder = 1;
      }
    },
  },
};
</script>

<template>
  <div class="container my-5">
    <h1 class="text-center mb-4">Listado de Pacientes</h1>

    <div class="table-responsive">
      <table class="table table-bordered table-striped table-hover rounded-3 shadow-sm">
        <thead class="thead-dark">
          <tr>
            <th @click="ordenarPor('nombre')" class="sortable">
              Nombre
              <span v-if="sortKey === 'nombre'">{{ sortOrder === 1 ? "⬆️" : "⬇️" }}</span>
            </th>
            <th>Teléfono</th>
            <th>DNI</th>
            <th @click="ordenarPor('zona')" class="sortable">
              Zona
              <span v-if="sortKey === 'zona'">{{ sortOrder === 1 ? "⬆️" : "⬇️" }}</span>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <patient v-for="paciente in pacientesOrdenados" :key="paciente.id" :paciente="paciente"></patient>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  text-decoration: underline;
}
table-responsive {
    margin-left: 20px; /* Añadir margen izquierdo */
    margin-right: 20px; /* Añadir margen derecho */
}

.table-bordered {
    border: 3px solid #007bff;
    border-radius: 20px;
}

.table th, .table td {
    border-top: 2px solid #007bff !important;
    border-bottom: 2px solid #007bff !important;
}

.table-striped tbody tr:nth-of-type(odd) {
    background-color: #f8f9fa;
}

.table th, .table td {
    padding: 12px;
}

.table-hover tbody tr:hover {
    background-color: #e9ecef;
}
</style>

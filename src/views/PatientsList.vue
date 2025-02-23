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
      searchQuery: "",
    };
  },

  computed: {
    ...mapState(useDataStore, ["pacientes"]),

    pacientesFiltrados() {
      return this.pacientes.filter((paciente) => {
        const nombre = paciente.nombre || '';
        return nombre.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    },

    pacientesOrdenados() {
      return [...this.pacientesFiltrados].sort((a, b) => {
        let valorA = this.sortKey === "zona" ? a.zona?.nombre?.toLowerCase() || "" : a[this.sortKey]?.toString().toLowerCase() || "";
        let valorB = this.sortKey === "zona" ? b.zona?.nombre?.toLowerCase() || "" : b[this.sortKey]?.toString().toLowerCase() || "";

        if (valorA < valorB) return -1 * this.sortOrder;
        if (valorA > valorB) return 1 * this.sortOrder;
        return 0;
      });
    }
    ,
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

    <div class="mb-3">
      <input type="text" v-model="searchQuery" class="form-control" placeholder="Buscar paciente por nombre" />
    </div>

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
/* Colores */
:root {
  --color-primary: #3674B5;
  --color-secondary: #578FCA;
  --color-accent: #A1E3F9;
  --color-background: #D1F8EF;
}

.container {
  background-color: var(--color-background);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: var(--color-primary);
  font-weight: bold;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

.form-control {
  border: 2px solid var(--color-primary);
  border-radius: 5px;
}

.table-responsive {
  overflow-x: auto;
  width: 100%;
  text-align: center;
}

th.sortable {
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  color: var(--color-primary);
  transition: color 0.3s ease;
}

th.sortable:hover {
  color: var(--color-secondary);
  text-decoration: underline;
}

th i {
  margin-left: 5px;
}

.table {
  table-layout: fixed;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
}

.table-bordered {
  border-radius: 10px;
  border: 2px solid var(--color-primary);
}

.table-hover tbody tr:hover {
  background-color: var(--color-accent);
}

input[type="text"] {
  border-radius: 20px;
  border: 1px solid var(--color-primary);
  padding: 8px 15px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.botones {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
}

.botones button {
  border-radius: 20px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-success {
  background: #28a745;
  border: none;
}

.btn-warning {
  background: #ffcc00;
  border: none;
  color: black;
}

.btn-danger {
  background: #dc3545;
  border: none;
}

.btn-success:hover {
  background: #218838;
}

.btn-warning:hover {
  background: #e6b800;
}

.btn-danger:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .botones button {
    width: 100%;
  }
}

</style>

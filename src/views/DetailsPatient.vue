<script>
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/store";

export default {
  props: ["id"],
  
  data() {
    return {
      paciente: {},
      llamadasEntrantes: [],
      llamadasSalientes: [],
    };
  },

  computed: {
    ...mapState(useDataStore, [
      "getNomZonaById",
      "getLlamadasSalientesByPacienteId",
      "getLlamadasEntrantesByPacienteId",
    ]),
  },
  
  methods: {
    ...mapActions(useDataStore, ["getPacienteByID"]),
    
    editarLlamadaEntrante(id) {
      this.$router.push({ name: "editIncomingCall", params: { id: id }, query: { paciente: this.id } });
    },

    editarLlamadaSaliente(id) {
      this.$router.push({ name: "editOutgoingCall", params: { id: id } });
    },

    formatFecha(fecha) {
      const [año, mes, dia] = fecha.split("-");
      return `${dia}-${mes}-${año}`;
    },

    formatDuracion(duracionEnSegundos) {
      if (duracionEnSegundos < 60) {
        return `${duracionEnSegundos} segundos`;
      } else {
        const minutos = Math.floor(duracionEnSegundos / 60);
        if (minutos > 1) {
          return `${minutos} minutos`;
        } else {
          return `${minutos} minuto`;
        }
      }
    },

    async cargarPaciente() {
      try {
        this.paciente = await this.getPacienteByID(this.id);

        this.llamadasEntrantes = this.getLlamadasEntrantesByPacienteId(this.id).map(
          (llamada) => ({
            ...llamada,
            fecha: this.formatFecha(llamada.fecha_hora.split(" ")[0]),
            hora: llamada.fecha_hora.split(" ")[1].slice(0, 5),
            duracion: this.formatDuracion(llamada.duracion),
          })
        );

        this.llamadasSalientes = this.getLlamadasSalientesByPacienteId(this.id).map(
          (llamada) => ({
            ...llamada,
            fecha: this.formatFecha(llamada.fecha_hora.split(" ")[0]),
            hora: llamada.fecha_hora.split(" ")[1].slice(0, 5),
            duracion: this.formatDuracion(llamada.duracion),
          })
        );
      } catch (error) {
        alert("Error al cargar el paciente:", error);
      }
    },
  },

  mounted() {
    this.cargarPaciente();
  },

  watch: {
    id: {
      immediate: true,
      handler() {
        this.cargarPaciente();
      },
    },
  },
};
</script>

<template>
  <div class="container my-5">
    <div class="card shadow-sm p-4">
      <h2 class="text-center mb-4">Detalles del Paciente</h2>

      <div class="row">
        <div class="col-md-6">
          <ul class="list-unstyled">
            <li><strong>Nombre: </strong> {{ paciente.nombre }}</li>
            <li><strong>Fecha de Nacimiento: </strong> {{ paciente.fecha_nac }}</li>
            <li><strong>DNI: </strong> {{ paciente.DNI }}</li>
            <li><strong>Número SIP: </strong> {{ paciente.num_sip }}</li>
            <li><strong>Teléfono: </strong> {{ paciente.telefono }}</li>
            <li><strong>Correo: </strong> {{ paciente.correo }}</li>
          </ul>
        </div>
        <div class="col-md-6">
          <ul class="list-unstyled">
            <li><strong>Dirección: </strong> {{ paciente.direccion }}</li>
            <li><strong>Ciudad: </strong> {{ paciente.ciudad }}</li>
            <li><strong>Código Postal: </strong> {{ paciente.cp }}</li>
            <li><strong>Zona: </strong> {{ getNomZonaById(paciente.zona_id) }}</li>
            <li><strong>Situación Personal: </strong> {{ paciente.sit_personal }}</li>
            <li><strong>Situación Sanitaria: </strong> {{ paciente.sit_sanitaria }}</li>
          </ul>
        </div>
        <div class="col-12">
          <ul class="list-unstyled">
            <li>
              <strong v-if="paciente.personas_contacto?.length > 1">Personas de Contacto: </strong>
              <strong v-else>Persona de contacto: </strong>
            <li v-for="(personaContacto, index) in paciente.personas_contacto" :key="index">
              {{ personaContacto.nombre }} {{ personaContacto.apellido }} ({{ personaContacto.relacion }}) - {{
                personaContacto.telefono }}
            </li>
            </li>
          </ul>
        </div>
      </div>

      <!-- Llamadas Entrantes y Salientes -->
      <div class="row mt-4">
        <div class="col-md-6 mb-4">
          <div class="card p-3 llamadas-entrantes">
            <h4 class="text-center">Llamadas Entrantes</h4>
            <table class="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Duración</th>
                  <th>Emergencia</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="llamada in llamadasEntrantes" :key="llamada.id">
                  <td>{{ llamada.fecha }}</td>
                  <td>{{ llamada.hora }}</td>
                  <td>{{ llamada.duracion }}</td>
                  <td>{{ llamada.emergencia ? "Sí" : "No" }}</td>
                  <td>{{ llamada.descripcion || 'No hay observaciones' }}</td>
                  <td>
                    <button name="editar" class="btn btn-warning btn-sm me-2"
                      @click="editarLlamadaEntrante(llamada.id)">
                      <i class="bi bi-pencil-fill"> Editar</i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="btn-container">
            <router-link :to="{ name: 'registerIncomingCall', query: { emergencia: true, paciente: this.paciente.id} }">
              Registrar llamada de emergencia
            </router-link>

            <router-link :to="{ name: 'registerIncomingCall', query: { emergencia: false, paciente: this.paciente.id } }">
              Registrar llamada no urgente
            </router-link>
          </div>
        </div>

        <div class="col-md-6 mb-4">
          <div class="card p-3 llamadas-salientes">
            <h4 class="text-center">Llamadas Salientes</h4>
            <table class="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Duración</th>
                  <th>Planificada</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="llamada in llamadasSalientes" :key="llamada.id">
                  <td>{{ llamada.fecha }}</td>
                  <td>{{ llamada.hora }}</td>
                  <td>{{ llamada.duracion }}</td>
                  <td>{{ llamada.planificada ? "Sí" : "No" }}</td>
                  <td>{{ llamada.descripcion || 'No hay observaciones' }}</td>
                  <td>
                    <button name="editar" class="btn btn-warning btn-sm me-2"
                      @click="editarLlamadaSaliente(llamada.id)">
                      <i class="bi bi-pencil-fill"> Editar</i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="btn-container">
            <router-link :to="{ name: 'calendarView', query: { paciente_id: paciente.id } }">
              Registrar llamada agendada
            </router-link>

            <router-link :to="{
              name: 'registerOutgoingCall',
              query: {
                planificada: false,
                paciente_id: paciente.id
              }
            }">
              Registrar llamada sin agendar
            </router-link>
          </div>
        </div>
        <div>
          <router-link :to="{ name: 'generateWarn', query: { tipo: 'paciente', paciente_id: paciente.id } }" class="btn btn-primary">
            Crear aviso para paciente
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

h4 {
  margin-bottom: 15px;
  color: #333;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}

.llamadas-entrantes {
  background-color: #f8f9fa;
}

.llamadas-salientes {
  background-color: #e9f7ef;
}

.llamadas-entrantes,
.llamadas-salientes {
  min-height: 300px;
  overflow-x: auto;
}


.btn-container {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.btn-container a {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.btn-container a:hover {
  background-color: #0056b3;
}

@media (max-width: 767px) {
  .btn-container {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
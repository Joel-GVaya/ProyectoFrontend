import { defineStore } from "pinia";
import axios from "axios";

const SERVER = "http://localhost/api";

export const useDataStore = defineStore("data", {
  state() {
    return {
      pacientes: [],
      llamadas_entrantes: [],
      llamadas_salientes: [],
      operadores: [],
      zonas: []
    };
  },

  getters: {
    getNomPacienteById: (state) => (id) => {
      return state.pacientes.find((paciente) => paciente.id == id)?.nombre;
    },
    getIdByNomPaciente: (state) => (nombre) => {
      return state.pacientes.find((paciente) => paciente.nombre == nombre)?.id;
    },
    getPacientesByOperadorZona: (state) => (zona) => {
      return state.pacientes.filter((paciente) => paciente.zona == zona);
    },
    getNomZonaById: (state) => (id) => {
      return state.zonas.find((zona) => zona.id == id)?.nombre
    },
    getLlamadasEntrantesByPacienteId: (state) => (id) => {
      console.log(id)
      return state.llamadas_entrantes.filter(
        (llamada) => llamada.paciente ==  id
      );
    },
    getLlamadasSalientesByPacienteId: (state) => (id) => {
      return state.llamadas_salientes.filter(
        (llamada) => llamada.paciente == id
      );
    },
    getNomOperadorById: (state) => (id) => {
      return state.operadores.find((operador) => operador.id == id)?.nombre;
    },
  },

  actions: {
    getAuthHeaders() {
      let token = localStorage.getItem("token")?.replace(/^"|"$/g, "");
      if (!token) {
        console.error("No hay token disponible");
        return null;
      }
      return { headers: { "Authorization": `Bearer ${token}` } };
    },

    async populateLlamadasSalientes() {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;

        const response = await axios.get(`${SERVER}/llamadas_salientes`, headers);
        this.llamadas_salientes = response.data.data;
      } catch (error) {
        console.log(error);
      }
    },
    async populateLlamadasEntrantes() {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/llamadas_entrantes`, headers);
        this.llamadas_entrantes = response.data.data;
      } catch (error) {
        console.log(error)
      }
    },
    async populateZonas() {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/zonas`, headers);
        this.zonas = response.data.data;
      } catch (error) {
        console.log(error)
      }
    },

    async populateOperadores() {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/operadores`, headers);
        this.operadores = response.data.data;
      } catch (error) {
        console.log(error)
      }
    },
    async populatePacientes() {   //correcto
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;

        const response = await axios.get(`${SERVER}/pacientes`, headers);
        this.pacientes = response.data.data;
      } catch (error) {
        console.log("Error al cargar pacientes:", error);
      }
    },

    /*async populateLlamadas() {
      try {
        const response = await axios.get(`${SERVER}/llamadas_entrantes`);
        this.llamadas_entrantes = response.data;
      } catch (error) {
        console.log(error)
      }
    },*/

    async registrarLlamadaEntrante(llamada_entrante) {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
    
        llamada_entrante.user_id = 8;
        const response = await axios.post(`${SERVER}/llamadas_entrantes`, llamada_entrante, headers);

        this.llamadas_entrantes.push(response.data);
      } catch (error) {
        console.log(error);
      }
    },

    async deleteLlamada(id) {
      try {
        await axios.delete(`${SERVER}/llamadas_entrantes/${id}`);
        const index = this.llamadas_entrantes.findIndex(
          (llamada) => llamada.id == id
        );
        if (index !== -1) {
          this.llamadas_entrantes.splice(index, 1);
        }
      } catch (error) {
        console.log(error)
      }
    },

    async editIncomingCall(call) {
      try {
        const response = await axios.put(
          `${SERVER}/llamadas_entrantes/${call.id}`,
          call
        );
        const index = this.llamadas_entrantes.findIndex(
          (llamada) => llamada.id == call.id
        );
        if (index !== -1) {
          this.llamadas_entrantes[index] = response.data;
        }
      } catch (error) {
        console.log(error.message);
      }
    },
    
    async getLlamadaEntrante(id) {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/llamadas_entrantes/${id}`, headers);
        return response.data;
      } catch (error) {
        console.log(error)
        return
      }
    },
    async getLlamadaSaliente(id) {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/llamadas_salientes/${id}`, headers);
        return response.data.data;
      } catch (error) {
        console.log(error)
        return
      }
    },

    async getPacienteByID(id) {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/pacientes/${id}`, headers);
        return response.data.data;
      } catch (error) {
        console.log(`Error al obtener el paciente con id: ${id}`, error);
        return null;
      }
    },

    async getOperadorByID(id) {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/operadores/${id}`, headers);
        return response.data.data;
      } catch (error) {
        console.log(`Error al obtener el operador con id: ${id}`, error);
        return null;
      }
    },

    async login(correo, contrasena) {
      try {
        const response = await axios.post(`${SERVER}/login`, {
          correo: correo,
          password: contrasena,
        });
    
        if (response.data) {
          localStorage.setItem("operador", JSON.stringify(response.data.data));
          localStorage.setItem("token", JSON.stringify(response.data.data.token));
          return response.data.data;
        } else {
          return null;
        }
      } catch (error) {
        console.error(`Error en login con correo: ${correo}`, error);
        return null;
      }
    },
    async darDeBajaPaciente(id) {
      try {
        if (confirm("¿Está seguro que desea dar de baja a este paciente?")) {
          await axios.delete(`${SERVER}/pacientes/${id}`);
          const index = this.pacientes.findIndex(
            (paciente) => paciente.id == id
          );
          if (index !== -1) {
            this.pacientes.splice(index, 1);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    async loadPatient(id) {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/pacientes/${id}`, headers);
        return response.data.data;
      } catch (error) {
        console.log("Error al cargar los datos del paciente.");
      }
    },
    async addPatient(paciente) {
      try {
        const reponse = await axios.post(`${SERVER}/pacientes`, paciente);
        this.pacientes.push(reponse.data);
      } catch (error) {
        console.log(error);
      }
    },
    async updatePaciente(id, paciente) {
      try {
        cout(`${SERVER}/pacientes/${id}`, paciente);
        const index = this.pacientes.findIndex((pac) => pac.id == id);
        if (index !== -1) {
          this.pacientes[index] = response.data;
        }
      } catch (error) {
        console.log(error);
      }
    },

    async getLlamadasEntrantesOperador(user_id) {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/llamadas_entrantes?users=${user_id}`, headers);
        return response.data.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    async getLlamadasEntrantesPaciente(paciente_id) {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/llamadas_entrantes?paciente_id=${paciente_id}`, headers);
        return response.data.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    async getLlamadasSalientesOperador(user_id) {
      try {
        const headers = this.getAuthHeaders();
        if (!headers) return;
        const response = await axios.get(`${SERVER}/llamadas_salientes?users=${user_id}`, headers);
        return response.data.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    async getZonas() {
      try {
        const response = await axios.get(`${SERVER}/zonas`);
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    async getAvisos() {
      try {
        const response = await axios.get(`${SERVER}/avisos`);
        return response.data;
      } catch (error) {
        console.log(error);
        return [];
      }
    },

    async getAvisoByID(id) {
      try {
        const response = await axios.get(`${SERVER}/avisos/${id}`);
        return response.data;
      } catch (error) {
        console.log(`Error al obtener el aviso con id: ${id}`, error);
        return null;
      }
    },
    async editWarn(aviso) {
      try {
        const response = await axios.put(`${SERVER}/avisos/${aviso.id}`, aviso);
        const index = this.avisos.findIndex(a => a.id == aviso.id);
        if (index !== -1) {
          this.avisos[index] = response.data;
        }
      } catch (error) {
        console.log(error.message);
      }
    },
    async deleteAvisoByID(id) {
      try {
        await axios.delete(`${SERVER}/avisos/${id}`);
      } catch (error) {
        console.log(`Error al eliminar el aviso con id: ${id}`, error);
      }
    },
    async registrarAviso(aviso) {
      try {
        const response = await axios.post(`${SERVER}/avisos`, aviso);
      } catch (error) {
        console.log(error);
      }
    },
  },
});

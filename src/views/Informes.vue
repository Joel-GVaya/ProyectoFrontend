<script>
import { useDataStore } from '@/stores/store';
import { computed } from 'vue';
import { mapActions } from 'pinia';

export default {
    name: 'informes',
    setup() {
        const store = useDataStore();
        const pacientes = computed(() => store.pacientes);
        return { pacientes };
    },
    data() {
        return {
            selectedPacienteId: null
        };
    },
    methods: {

        ...mapActions(useDataStore, ["reporteEmergencias", "reportePacientes", "reporteLlamadasProgramadas", "reporteLlamadasRealizadas", "reporteHistoricoPaciente", "anadirMensaje"]),

        logEmergencias() {
            this.reporteEmergencias();
        },
        logPacientes() {
            this.reportePacientes();
        },
        logLlamadasProgramadas() {
            this.reporteLlamadasProgramadas();
        },
        logLlamadasRealizadas() {
            this.reporteLlamadasRealizadas();
        },
        logHistoricoPaciente() {
            if (this.selectedPacienteId) {
                this.reporteHistoricoPaciente(this.selectedPacienteId);
            } else {
                this.anadirMensaje('Seleccione un paciente');
            }
        }
    }
}
</script>

<template>
    <div class="informes-container">
        <h1>Descargar reportes</h1>
        <button @click="logEmergencias">Reporte de Emergencias</button>
        <button @click="logPacientes">Reporte de Pacientes</button>
        <button @click="logLlamadasProgramadas">Reporte de Llamadas Programadas</button>
        <button @click="logLlamadasRealizadas">Reporte de Llamadas Realizadas</button>
        <div class="form-container">
            <label for="paciente-select">Seleccione un paciente:</label><br>
            <select v-model="selectedPacienteId" id="paciente-select">
                <option v-for="paciente in pacientes" :key="paciente.id" :value="paciente.id">
                    {{ paciente.nombre }}
                </option>
            </select><br>
            <button @click="logHistoricoPaciente">Reporte historico del paciente</button>
        </div>
    </div>
</template>

<style scoped>
.informes-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    background-color: #007BFF;
    color: white;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #0056b3;
}

.form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background-color: #f9f9f9;
}

label {
    font-size: 16px;
    font-weight: bold;
}

select {
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid #ccc;
    width: 100%;
    max-width: 300px;
}

select:focus {
    outline: none;
    border-color: #007BFF;
}

button {
    width: 100%;
    max-width: 300px;
}
</style>
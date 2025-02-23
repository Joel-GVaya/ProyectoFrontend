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

        ...mapActions(useDataStore, ["reporteEmergencias", "reportePacientes", "reporteLlamadasProgramadas", "reporteLlamadasRealizadas", "reporteHistoricoPaciente"]),

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
                alert('Seleccione un paciente');
            }
        }
    }
}
</script>

<template>
    <div class="informes-container">
        <h1>Descargar informes</h1>
        <button @click="logEmergencias">Informe de Emergencias</button>
        <button @click="logPacientes">Informe de Pacientes</button>
        <button @click="logLlamadasProgramadas">Informe de Llamadas Programadas</button>
        <button @click="logLlamadasRealizadas">Informe de Llamadas Realizadas</button>
        <div>
            <label for="paciente-select">Seleccione un paciente:</label><br>
            <select v-model="selectedPacienteId" id="paciente-select">
                <option v-for="paciente in pacientes" :key="paciente.id" :value="paciente.id">
                    {{ paciente.nombre }}
                </option>
            </select><br>
            <button @click="logHistoricoPaciente">Informe historico del paciente</button>
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

select {
    padding: 10px;
    font-size: 16px;
    margin-right: 10px;
}
</style>
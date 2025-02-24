<script>
import { useDataStore } from '@/stores/store';
import { computed } from 'vue';
import { mapActions } from 'pinia';

export default {
    name: 'informes',
    setup() {
        const store = useDataStore();
        const pacientes = computed(() => store.pacientes);
        const zonas = computed(() => store.zonas);
        return { pacientes, zonas };
        
    },
    data() {
        return {
            selectedPacienteId: null,
            selectedZonaId: null,
            selectedDate: null,
            selectedType: null,
            selectedZone: null,
            selectedPacienteType: null
        };
    },
    methods: {

        ...mapActions(useDataStore, ["reporteEmergencias", "reportePacientes", "reporteLlamadasProgramadas", "reporteLlamadasRealizadas", "reporteHistoricoPaciente", "reporteHistoricoZona"]),

        logEmergencias() {
            console.log('Emergencias');
            this.reporteEmergencias();
        },
        logPacientes() {
            console.log('Pacientes');
            this.reportePacientes();
        },
        logLlamadasProgramadas() {
            if (this.selectedDate && this.selectedType && this.selectedZone) {
                console.log('Llamadas Programadas:', {
                    fecha: this.selectedDate,
                    tipo: this.selectedType,
                    zona: this.selectedZone
                });
                //this.reporteLlamadasProgramadas(this.selectedDate, this.selectedType, this.selectedZone);
            } else {
                alert('Seleccione fecha, tipo y zona');
            }
        },
        logLlamadasRealizadas() {
            if (this.selectedDate && this.selectedType && this.selectedZone) {
                console.log('Llamadas Realizadas:', {
                    fecha: this.selectedDate,
                    tipo: this.selectedType,
                    zona: this.selectedZone
                });
                //this.reporteLlamadasRealizadas(this.selectedDate, this.selectedType, this.selectedZone);
            } else {
                alert('Seleccione fecha, tipo y zona');
            }
        },
        logHistoricoPaciente() {
            if (this.selectedPacienteId && this.selectedPacienteType !== null) {
                console.log('Historico Paciente:', {
                    pacienteId: this.selectedPacienteId,
                    tipo: this.selectedPacienteType
                });
                //this.reporteHistoricoPaciente(this.selectedPacienteId, this.selectedPacienteType);
            } else {
                alert('Seleccione un paciente y tipo de llamada');
            }
        },

        logHistoricoZona() {
            if (this.selectedZonaId) {
                console.log('Historico Zona:' + this.selectedZonaId);
                this.reporteHistoricoZona(this.selectedZonaId);
            } else {
                alert('Seleccione una zona');
            }
        }
    }
}
</script>

<template>
    <div class="informes-container">
        <h1>Descargar reportes</h1>
        <div class="form-container">
            <label for="paciente-select">Seleccione una zona:</label><br>
            <select v-model="selectedZonaId" id="paciente-select">
                <option v-for="zona in zonas" :key="zona.id" :value="zona.id">
                    {{ zona.nombre }}
                </option>
            </select><br>
            <button @click="logHistoricoZona">Reporte historico de la zona</button>
        </div>
        <button @click="logPacientes">Reporte de Pacientes</button>
        <div class="form-container">
            <label for="date-select">Seleccione una fecha:</label><br>
            <input type="date" v-model="selectedDate" id="date-select"><br>
            <label for="type-select">Seleccione un tipo:</label><br>
            <select v-model="selectedType" id="type-select">
                <option value="1">Planificado</option>
                <option value="0">No Planificado</option>
                <option value="1">Emergencia</option>
                <option value="0">No Emergencia</option>
            </select><br>
            <label for="zone-select">Seleccione una zona:</label><br>
            <select v-model="selectedZone" id="zone-select">
                <option v-for="zona in zonas" :key="zona.id" :value="zona.id">
                    {{ zona.nombre }}
                </option>
            </select><br>
            <button @click="logLlamadasProgramadas">Reporte de Llamadas Programadas</button>
            <button @click="logLlamadasRealizadas">Reporte de Llamadas Realizadas</button>
        </div>
        <div class="form-container">
            <label for="paciente-select">Seleccione un paciente:</label><br>
            <select v-model="selectedPacienteId" id="paciente-select">
                <option v-for="paciente in pacientes" :key="paciente.id" :value="paciente.id">
                    {{ paciente.nombre }}
                </option>
            </select><br>
            <label for="paciente-type-select">Seleccione un tipo de llamada:</label><br>
            <select v-model="selectedPacienteType" id="paciente-type-select">
                <option value="1">Entrantes</option>
                <option value="0">Salientes</option>
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
    gap: 20px;
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
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
    width: 100%;
}

label {
    font-size: 16px;
    font-weight: bold;
}

select, input[type="date"] {
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid #ccc;
    width: 100%;
    max-width: 300px;
}

select:focus, input[type="date"]:focus {
    outline: none;
    border-color: #007BFF;
}

button {
    width: 100%;
    max-width: 300px;
}

@media (max-width: 600px) {
    .informes-container {
        padding: 10px;
    }

    .form-container {
        padding: 10px;
    }

    button {
        padding: 8px 16px;
        font-size: 14px;
    }

    select, input[type="date"] {
        padding: 8px;
        font-size: 14px;
    }
}
</style>
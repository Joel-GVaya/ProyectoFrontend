<script>
import { mapState } from 'pinia';
import { useDataStore } from '../stores/store';

export default {
  name: 'CalendarView',
  props: {
    operador: {
      type: Number,
      required: false
    },
    paciente: {
      type: Number,
      required: false
    },
    tipo: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      currentDate: new Date(),
      events: {},
      weekdays: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
      llamadas: [],
      avisos: [],
      zonaIdUsuario: null,
      selectedDay: null, // Para saber qué día se ha seleccionado
      eventsForSelectedDay: []
    };
  },
  watch: {
    '$route'() {
      this.updateData();
    }
  },
  mounted() {
    const usuario = JSON.parse(localStorage.getItem("operador"));
    if (!usuario) {
      this.$router.push("/login");
      return;
    }
    this.zonaIdUsuario = usuario.zona_id;
    this.updateData();
  },
  computed: {
    daysInMonth() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      return new Date(year, month + 1, 0).getDate();
    },
    firstDayOfMonth() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      let firstDay = new Date(year, month, 1).getDay();
      return firstDay === 0 ? 6 : firstDay - 1;
    },
    ...mapState(useDataStore, ['getNomPacienteById']),
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    openModal(day) {
  this.selectedDay = day;
  const selectedDateKey = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  this.eventsForSelectedDay = this.events[selectedDateKey] || []; // Asignar eventos al día seleccionado
},
    closeModal() {
      this.selectedDay = null;
    },
    async getLlamadasOperador(operadorId) {
      const store = useDataStore();
      this.llamadas = await store.getLlamadasEntrantesOperador(operadorId);
      this.mostrarLlamadas();
    },
    mostrarLlamadas() {
      this.llamadas.forEach(llamada => {
        const dateKey = llamada.fecha_hora.split(' ')[0];
        if (!this.events[dateKey]) this.events[dateKey] = [];
        this.events[dateKey].push(llamada);
      });
    },
    async getLlamadasPaciente(pacienteId) {
      const store = useDataStore();
      this.llamadas = await store.getLlamadasEntrantesPaciente(pacienteId);
    },
    async getAvisos() {
      const store = useDataStore();
      this.avisos = await store.getAvisos();
      this.avisos = this.avisos.filter(aviso => aviso.zona_id === this.zonaIdUsuario); 
      this.mostrarAvisos();
    },
    mostrarAvisos() {
      this.avisos.forEach(aviso => {
        const startDate = new Date(aviso.fecha_inicio);
        const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

        if (aviso.frecuencia === 'semanal') {
          while (startDate <= endDate) {
            const dateKey = startDate.toISOString().split('T')[0];
            if (!this.events[dateKey]) this.events[dateKey] = [];
            this.events[dateKey].push(aviso);
            startDate.setDate(startDate.getDate() + 7);
          }
        } else if (aviso.frecuencia === 'diaria') {
          while (startDate <= endDate) {
            const dateKey = startDate.toISOString().split('T')[0];
            if (!this.events[dateKey]) this.events[dateKey] = [];
            this.events[dateKey].push(aviso);
            startDate.setDate(startDate.getDate() + 1);
          }
        } else if (aviso.frecuencia === 'mensual') {
          while (startDate <= endDate) {
            const dateKey = startDate.toISOString().split('T')[0];
            if (!this.events[dateKey]) this.events[dateKey] = [];
            this.events[dateKey].push(aviso);
            startDate.setMonth(startDate.getMonth() + 1);
          }
        } else if (aviso.frecuencia === 'anual') {
          while (startDate <= endDate) {
            const dateKey = startDate.toISOString().split('T')[0];
            if (!this.events[dateKey]) this.events[dateKey] = [];
            this.events[dateKey].push(aviso);
            startDate.setFullYear(startDate.getFullYear() + 1);
          }
        } else {
          const dateKey = aviso.fecha_inicio.split(' ')[0];
          if (!this.events[dateKey]) this.events[dateKey] = [];
          this.events[dateKey].push(aviso);
        }
      });
    },
    getLlamadasPorDia(day) {
      const dateKey = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return this.events[dateKey] || [];
    },
    verDetalles(event) {
      if (event.hasOwnProperty('fecha_hora')) {
        this.$router.push({ name: 'callsView', params: { id: event.id } });
      } else if (event.hasOwnProperty('fecha_inicio')) {
        this.$router.push({ name: 'warnDetails', params: { id: event.id } });
      }
    },
    updateData() {
      this.events = {}; 
      if (this.operador !== undefined) {
        this.getLlamadasOperador(this.operador);
      } else if (this.paciente !== undefined) {
        this.getLlamadasPaciente(this.paciente);
      } else {
        this.getAvisos();
      }
    }
  },
};
</script>
<template>
<div class="calendar">
  <div class="header">
    <h2>{{ currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }) }}</h2>
    <div class="navigation-buttons">
      <button @click="previousMonth">&#8592;</button>
      <button @click="nextMonth">&#8594;</button>
    </div>
  </div>
  <div class="weekdays">
    <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
  </div>

    <div class="days">
      <div v-for="n in firstDayOfMonth" :key="'empty' + n" class="empty"></div>
      <div v-for="day in daysInMonth" :key="day" class="day"
        :class="{
          'emergency-border': events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`] && events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`].some(event => event.emergencia),
          'non-emergency-border': events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`] && events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`].every(event => !event.emergencia),
          'mixed-border': events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`] && events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`].some(event => event.emergencia) && events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`].some(event => !event.emergencia)
        }"
        @click="openModal(day)">
        <div class="day-number">{{ day }}</div>
      </div>
    </div>
    <div v-if="selectedDay !== null" class="modal">
  <div class="modal-content">
    <h3>Acciones para el día {{ selectedDay }}</h3>
    <button @click="closeModal" class="close-btn">X</button>
    
    <div v-if="getLlamadasPorDia(selectedDay).length">
      <div v-for="evento in getLlamadasPorDia(selectedDay)" :key="evento.id" class="event-box">
        <div class="event-header">
          <p class="event-subtipo">{{ evento.subtipo }}</p>
        </div>
        <p class="event-description">{{ evento.descripcion }}</p>
        <button @click="verDetalles(evento)" class="details-btn">Ver detalles</button>
      </div>
    </div>
    <div v-else>
      <p>No hay eventos para este día.</p>
    </div>
  </div>
</div>




  </div>
</template>


<style scoped>
/* Estilos generales */
.calendar {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 10px;
}

/* Estilo del encabezado */
.header {
  display: flex;
  flex-direction: column; /* Cambiado a columna */
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-color: #dc3545;
  color: white;
  border-radius: 8px;
}

.navigation-buttons {
  margin-top: 10px; /* Espaciado entre el mes y las flechas */
  display: flex;
  justify-content: space-between;
  width: 100%; /* Para que las flechas ocupen todo el ancho disponible */
  max-width: 200px; /* Opcional: Limitar el ancho de las flechas */
}

h2 {
  font-size: 1.6em;
  text-align: center;
  flex-grow: 1; /* Para que el título ocupe todo el espacio disponible */
  margin: 0;
}

/* Estilo para los botones */
button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 15px 30px; /* Aumentamos el tamaño del relleno */
  font-size: 1.2em; /* Aumentamos el tamaño de la fuente */
  border-radius: 8px; /* Opcional: hacer los bordes más redondeados */
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

button:hover {
  background-color: #dc3545;
  transform: scale(1.05);
}

button:active {
  transform: scale(1);
}

/* Estilo para la vista de días */
.weekdays, .days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-top: 20px;
}

.day {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
  position: relative;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.day-number {
  font-size: 1.4em;
  font-weight: bold;
  margin-bottom: 10px;
}

.empty {
  background-color: transparent;
  border: none;
}

.day:hover {
  background-color: #dc3545;
  color: white;
}

/* Estilo para los botones de evento */
.event-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 12px;
  font-size: 0.9em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.event-button:hover {
  background-color: #218838;
}

.event-button:active {
  background-color: #1e7e34;
}

/* Estilos para las clases de borde */
.emergency-border {
  border: 2px solid #dc3545;
}

.non-emergency-border {
  border: 2px solid green;
}

.mixed-border {
  border: 2px solid orange;
}

/* Estilo para el modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
}

.modal-content button {
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  font-size: 1em;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-content button:hover {
  background-color: #c82333;
}

.modal-content button:active {
  background-color: #bd2130;
}

/* Estilos para los eventos */
.event-box {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.event-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.event-subtipo {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.event-description {
  font-size: 14px;
  color: #666;
  margin: 10px 0;
}

.details-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 15px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.details-btn:hover {
  background-color: #0056b3;
}

.details-btn:active {
  transform: scale(1);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

/* Ajustes para dispositivos pequeños */
@media (max-width: 600px) {
  .calendar {
    max-width: 100%;
    padding: 5px;
  }

  .header {
    flex-direction: column; /* Apilar los elementos en móviles */
    align-items: center;
  }
  h2 {
    font-size: 1.2em; /* Reducir el tamaño del título en móvil */
    margin: 10px 0;
  }

  .weekdays, .days {
    grid-template-columns: repeat(7, 1fr);
  }

  .day {
    font-size: 0.8em;
    padding: 8px;
  }
  button {
    font-size: 1.2em; /* Ajustar tamaño de las flechas */
    margin: 5px 0; /* Separación de los botones en móvil */
  }

  .modal-content {
    width: 90%;
    padding: 15px;
  }

  .event-box {
    font-size: 0.9em;
    padding: 10px;
  }

  .details-btn {
    font-size: 0.9em;
  }
}

@media (max-width: 400px) {
  .calendar {
    padding: 0;
  }

  .header {
    padding: 5px;
  }

  h2 {
    font-size: 1.2em;
  }

  .day {
    font-size: 0.7em;
    padding: 6px;
  }

  button {
    padding: 5px;
    font-size: 0.7em;
  }
}
</style>
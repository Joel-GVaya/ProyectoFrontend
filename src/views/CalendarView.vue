<script>
import { useDataStore } from '@/stores/store';


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
      avisos: []
    };
  },

  watch: {
    '$route'() {
      this.updateData();
    }
  },

  mounted() {
    this.updateData();
    const usuario = JSON.parse(localStorage.getItem("operador"));
    if (!usuario) {
      this.$router.push("/login");
      return;
  }
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
    }
  },

  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    /*addEvent(day) {
      const dateKey = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const eventText = prompt('Ingrese el evento:');
      if (eventText) {
        if (!this.events[dateKey]) this.events[dateKey] = [];
        this.events[dateKey].push(eventText);
      }
    },*/
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
        // Lógica para mostrar detalles de la llamada
        this.$router.push({ name: 'callsView', params: { id: event.id } });
      } else if (event.hasOwnProperty('fecha_inicio')) {
        // Lógica para mostrar detalles del aviso
        this.$router.push({ name: 'warnDetails', params: { id: event.id } });
      }
    },
    updateData() {
      this.events = {}; // Limpiar los eventos antes de actualizar los datos
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
      <button @click="previousMonth">&#8592;</button>
      <h2>{{ currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }) }}</h2>
      <button @click="nextMonth">&#8594;</button>
    </div>
    <div class="weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
    </div>
    <div class="days">
      <div v-for="n in firstDayOfMonth" :key="'empty' + n" class="empty"></div>
      <div v-for="day in daysInMonth" :key="day" class="day" @click="addEvent(day)"
        :class="{
          'emergency-border': events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`] && events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`].some(event => event.emergencia),
          'non-emergency-border': events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`] && events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`].every(event => !event.emergencia),
          'mixed-border': events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`] && events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`].some(event => event.emergencia) && events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`].some(event => !event.emergencia)
        }">
        <div class="day-number">{{ day }}</div>
        <div
          v-if="events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`]">
          <ul>
            <li
              v-for="event in events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`]"
              :key="event.id" @click.stop="verDetalles(event)">
              {{ event.descripcion || 'sin descripción' }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar {
  width: 100%;
  max-width: 1200px;
  /* Aumentar el ancho máximo */
  margin: auto;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
  /* Aumentar el padding */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  /* Aumentar el margen inferior */
}

.header h2 {
  font-size: 2em;
  /* Aumentar el tamaño de la fuente */
  color: #333;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  font-weight: bold;
  margin-bottom: 15px;
  /* Aumentar el margen inferior */
  color: #555;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 15px;
  /* Aumentar el espacio entre los días */
}

.day {
  padding: 20px;
  /* Aumentar el padding */
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
  min-height: 120px;
  /* Aumentar la altura mínima */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.day:hover {
  background-color: #f0f0f0;
}

.day-number {
  font-weight: bold;
  margin-bottom: 10px;
  /* Aumentar el margen inferior */
}

.empty {
  visibility: hidden;
}

.emergency-border {
  border: 3px solid red;
}

.non-emergency-border {
  border: 3px solid green;
}

.mixed-border {
  border: 3px solid;
  border-image: linear-gradient(to right, red, green) 1;
}

@media (max-width: 767px) {
  .calendar {
    padding: 15px;
  }
  .header h2 {
    font-size: 1.5em;
  }
  .weekdays, .days {
    grid-template-columns: repeat(2, 1fr);
  }
  .day {
    padding: 10px;
    min-height: 80px;
  }
}
</style>

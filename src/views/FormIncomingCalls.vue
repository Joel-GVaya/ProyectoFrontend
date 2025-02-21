<script>
import { useDataStore } from "../stores/store";
import { mapState, mapActions } from "pinia";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";

export default {
  components: {
    Form,
    Field,
    ErrorMessage,
  },
  props: {
    id: String,
  },
  computed: {
    ...mapState(useDataStore, [
      "llamadas",
      "pacientes",
      "getNomPacienteById",
      "getIdByNomPaciente",
    ]),
  },
  data() {
    const mySchema = yup.object({
      persona: yup.string().required("La persona que realiza la llamada es obligatoria"),
      dia: yup
        .string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato incorrecto, debe ser YYYY-MM-DD")
        .required("El día de la llamada es obligatorio"),
      hora: yup
        .string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato incorrecto, debe ser HH:MM")
        .required("La hora de la llamada es obligatoria"),
      horas: yup.number().min(0, "Las horas deben ser positivas").required("La duración en horas es obligatoria"),
      minutos: yup.number().min(0, "Los minutos deben ser positivos").required("La duración en minutos es obligatoria"),
      segundos: yup
        .number()
        .min(0, "Los segundos deben ser positivos")
        .max(59, "Los segundos deben ser menores de 60")
        .required("La duración en segundos es obligatoria"),
      observaciones: yup.string().max(500, "Máximo 500 caracteres").nullable(),
      subtipo: yup.string().required("El subtipo de la llamada es obligatorio"),
    });

    return {
      llamada: {
        user_id: JSON.parse(localStorage.getItem('operador'))?.id || null,
        dia: "",
        hora: "",
        horas: 0,
        minutos: 0,
        segundos: 0,
        emergencia: this.emergencia,
      },
      mySchema,
    };
  },
  methods: {
    ...mapActions(useDataStore, ["registrarLlamadaEntrante", "editIncomingCall", "getLlamadaEntrante"]),

    submitLlamada() {
      const fechaHora = `${this.llamada.dia} ${this.llamada.hora}`;
      const duracionTotal = (this.llamada.horas * 60 + this.llamada.minutos) * 60 + this.llamada.segundos;

      const llamadaData = {
        ...this.llamada,
        fecha_hora: fechaHora,
        paciente_id: this.llamada.paciente_id,
        duracion: duracionTotal,
        descripcion: this.llamada.descripcion || "",
      };

      delete llamadaData.dia;
      delete llamadaData.hora;
      delete llamadaData.minutos;
      delete llamadaData.segundos;
      delete llamadaData.horas;

      if (!this.id) {
        this.registrarLlamadaEntrante(llamadaData);
      } else {
        this.editIncomingCall(llamadaData);
      }

      this.$router.push("/");
    },

    cargarLlamada() {
      if (this.id) {
        this.getLlamadaEntrante(this.id).then((data) => {
          if (data.fecha_hora) {
            const [fecha, horaCompleta] = data.fecha_hora.split(" ");
            const [hora, minutos] = horaCompleta.split(":");
            const { horas, minutos: min, segundos } = this.formatDuracion(data.duracion || 0);

            this.llamada = {
              ...data,
              dia: fecha,
              hora: `${hora}:${minutos}`,
              horas,
              minutos: min,
              segundos,
              emergencia: data.emergencia,
            };
          }
        });
      }
    },

    formatDuracion(duracionEnSegundos) {
      const horas = Math.floor(duracionEnSegundos / 3600);
      const minutos = Math.floor((duracionEnSegundos % 3600) / 60);
      const segundos = duracionEnSegundos % 60;
      return { horas, minutos, segundos };
    },
  },
  mounted() {
  if (!this.id) {
    const now = new Date();
    this.llamada.dia = now.toISOString().split("T")[0];
    this.llamada.hora = now.toTimeString().split(" ")[0].slice(0, 5);
    this.llamada.emergencia = this.$route.query.emergencia === "true";
  } else {
    this.cargarLlamada();
  }
}
};
</script>

<template>
  <div id="form" class="form-container">
    <h3 v-if="llamada.emergencia">Registrar llamada de emergencia</h3>
    <h3 v-else>Registrar llamada no urgente</h3>
    <Form id="llamadaForm" method="post" @submit="submitLlamada" :validation-schema="mySchema">
      <div class="form-group">
        <label for="persona">Persona que realiza la llamada:</label>
        <Field as="select" name="persona" v-model="llamada.paciente_id" class="form-control">
          <option value="" disabled>--- Escoge persona ---</option>
          <option v-for="paciente in pacientes" :value="paciente.id" :key="paciente.id">
            {{ paciente.nombre }}
          </option>
        </Field>
        <ErrorMessage name="persona" class="error-message" />
      </div>

      <div class="form-group">
        <label for="subtipo" v-if="llamada.emergencia">Tipo de emergencia:</label>
        <label for="subtipo" v-else>Tipo de comunicación:</label>
        <Field as="select" name="subtipo" v-model="llamada.subtipo" class="form-control">
          <option value="" disabled>--- Escoge tipo ---</option>
          <template v-if="llamada.emergencia">
            <option value="emergencia_social">Emergencias sociales</option>
            <option value="emergencia_sanitaria">Emergencias sanitarias</option>
            <option value="crisis_angustia">Crisis de soledad o angustia</option>
            <option value="alarma_sin_respuesta">Alarma sin respuesta</option>
            <option value="otro">Otro tipo de llamada...</option>
          </template>
          <template v-else>
            <option value="notificar_ausencias">Notificar ausencias o retornos</option>
            <option value="modificar_datos">Modificar datos personales</option>
            <option value="llamadas_accidentales">Llamadas accidentales</option>
            <option value="solicitud_informacion">Solicitud de información</option>
            <option value="sugerencias_quejas">Sugerencias, quejas o reclamaciones</option>
            <option value="llamadas_sociales">Llamadas sociales</option>
            <option value="citas_medicas">Registrar citas médicas</option>
            <option value="otro">Otro tipo de llamada...</option>
          </template>
        </Field>
        <ErrorMessage name="subtipo" class="error-message" />
      </div>

      <div class="form-group">
        <label for="dia">Día de la llamada:</label>
        <Field type="date" name="dia" v-model="llamada.dia" class="form-control" />
        <ErrorMessage name="dia" class="error-message" />
      </div>

      <div class="form-group">
        <label for="hora">Hora de la llamada:</label>
        <Field type="time" name="hora" v-model="llamada.hora" class="form-control" />
        <ErrorMessage name="hora" class="error-message" />
      </div>

      <div class="form-group">
        <label for="duracion">Duración de la llamada:</label>
        <div class="duration-fields">
          <Field type="number" name="horas" v-model="llamada.horas" placeholder="Horas" min="0" class="form-control" />
          <span>:</span>
          <Field type="number" name="minutos" v-model="llamada.minutos" placeholder="Minutos" min="0" max="59" class="form-control" />
          <span>:</span>
          <Field type="number" name="segundos" v-model="llamada.segundos" placeholder="Segundos" min="0" max="59" class="form-control" />
        </div>
        <ErrorMessage name="minutos" class="error-message" />
        <ErrorMessage name="segundos" class="error-message" />
      </div>

      <div class="form-group">
        <label for="descripcion">Descripción:</label>
        <Field as="textarea" name="descripcion" v-model="llamada.descripcion" class="form-control" />
        <ErrorMessage name="descripcion" class="error-message" />
      </div>

      <div class="form-actions">
        <button type="submit" v-if="!id" class="btn btn-primary">Añadir</button>
        <button type="submit" v-else class="btn btn-primary">Editar</button>
        <button type="reset" v-if="!id" class="btn btn-secondary">Reset</button>
        <button type="button" v-else @click="cargarLlamada" class="btn btn-secondary">Reset datos</button>
      </div>
    </Form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.duration-fields {
  display: flex;
  align-items: center;
}

.duration-fields span {
  margin: 0 5px;
}

.error-message {
  color: red;
  font-size: 0.875em;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}
</style>

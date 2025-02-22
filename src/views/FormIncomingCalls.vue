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
  props: ["id"],
  computed: {
    ...mapState(useDataStore, [
      "llamadas",
      "pacientes",
      "getNomOperadorById",
    ]),
  },
  data() {
    const mySchema = yup.object({
      user_id: yup.string().required("El operador es obligatorio"),
      dia: yup
        .string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato incorrecto, debe ser YYYY-MM-DD")
        .required("El día de la llamada es obligatorio"),
      hora: yup
        .string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato incorrecto, debe ser HH:MM")
        .required("La hora de la llamada es obligatoria"),
      descripcion: yup.string().max(500, "Máximo 500 caracteres").nullable(),
      subtipo: yup.string().required("El subtipo de la llamada es obligatorio"),
      paciente_id: yup.string().required("El paciente es obligatorio"),
      horas: yup
        .number()
        .min(0, "Las horas deben ser 0 o más")
        .required("Especifíca las horas de la llamada"),
      minutos: yup
        .number()
        .min(0, "Los minutos deben ser 0 o más")
        .max(59, "Los minutos deben ser menores de 60")
        .required("Espefíca los minutos de la llamada"),
      segundos: yup
        .number()
        .min(0, "Los segundos deben ser 0 o más")
        .max(59, "Los segundos deben ser menores de 60")
        .required("Especifíca los segundos de la llamada"),
    }).test(
      "duracion-valida",
      "La duración total de la llamada no puede ser 0",
      function (values) {
        if (values.horas === 0 && values.minutos === 0 && values.segundos === 0) {
          return this.createError({ path: "horas", message: "La duración de llamada debe ser superior a 0" });
        }
        return true;
      }
    );

    return {
      llamada: {
        dia: "",
        hora: "",
        user_id: JSON.parse(localStorage.getItem('operador'))?.id || null,
        paciente: this.$route.query.paciente || "",
        descripcion: "",
        subtipo: "",
        duracion: "",
        horas: null,
        minutos: null,
        segundos: null,
        emergencia: "",
      },
      operador: {},
      mySchema,
    };
  },
  methods: {
    ...mapActions(useDataStore, ["registrarLlamadaEntrante", "editIncomingCall", "getLlamadaEntrante"]),

    async submitLlamada() {
      const fechaHora = `${this.llamada.dia} ${this.llamada.hora}`;
      const duracionTotal = (this.llamada.horas * 60 + this.llamada.minutos) * 60 + this.llamada.segundos;

      const llamadaData = {
        id: Number(this.id),
        fecha_hora: fechaHora,
        user_id: Number(this.llamada.user_id),
        paciente: Number(this.llamada.paciente),
        tipo: this.llamada.emergencia ? "emergencia" : "no_urgente",
        subtipo: this.llamada.subtipo,
        descripcion: this.llamada.descripcion,
        duracion: duracionTotal,
        paciente_id: this.llamada.paciente,
      };

      delete llamadaData.dia;
      delete llamadaData.hora;
      delete llamadaData.horas;
      delete llamadaData.minutos;
      delete llamadaData.segundos;
      delete llamadaData.paciente;

      if (!this.id) {
        await this.registrarLlamadaEntrante(llamadaData);
      } else {
        await this.editIncomingCall(llamadaData);
      }

      this.$router.push("/");
    },

    async cargarLlamada() {
      if (this.id) {
        const data = await this.getLlamadaEntrante(this.id);
        if (data && data.fecha_hora) {
          const [fecha, horaCompleta] = data.fecha_hora.split(" ");
          const [hora, minutos] = horaCompleta.split(":");
          const { horas, minutos: min, segundos } = this.formatDuracion(data.duracion);

          this.llamada = {
            ...data,
            dia: fecha,
            hora: `${hora}:${minutos}`,
            horas,
            minutos: min,
            segundos,
            emergencia: data.emergencia === "emergencia",
          };
        }
      }
    },

    formatDuracion(duracionEnSegundos) {
      const horas = Math.floor(duracionEnSegundos / 3600);
      const minutos = Math.floor((duracionEnSegundos % 3600) / 60);
      const segundos = duracionEnSegundos % 60;
      return { horas, minutos, segundos };
    },

    resetForm() {
      this.llamada = {
        dia: new Date().toISOString().split("T")[0],
        hora: new Date().toTimeString().split(" ")[0].slice(0, 5),
        user_id: JSON.parse(localStorage.getItem("operador"))?.id || null,
        paciente: this.$route.query.paciente || "",
        descripcion: "",
        subtipo: "",
        duracion: "",
        horas: null,
        minutos: null,
        segundos: null,
        emergencia: this.$route.query.emergencia === "true",
      };
      this.operador = JSON.parse(localStorage.getItem("operador"))?.nombre || "";
    }

  },
  async mounted() {
    if (!this.id) {
      const now = new Date();
      this.llamada.dia = now.toISOString().split("T")[0];
      this.llamada.hora = now.toTimeString().split(" ")[0].slice(0, 5);
      this.operador = JSON.parse(localStorage.getItem('operador')).nombre;
      this.llamada.emergencia = this.$route.query.emergencia === "true";
    } else {
      this.operador = this.getNomOperadorById(this.llamada.user_id);
      await this.cargarLlamada();
    }
  }
};
</script>

<template>
  <div id="form" class="form-container">
    <h3 v-if="llamada.emergencia">Registrar llamada de emergencia</h3>
    <h3 v-else>Registrar llamada no urgente</h3>
    <Form id="llamadaForm" method="post" @submit="submitLlamada" :validation-schema="mySchema">
      <div class="mb-3">
        <label for="operador" class="form-label">Operador:</label>
        <Field type="text" name="user_id" v-model="operador" class="form-control" disabled />
        <ErrorMessage name="user_id" class="text-danger" />
      </div>
      <div class="form-group">
        <label for="paciente" class="form-label">Persona que realiza la llamada: </label>
        <Field as="select" name="paciente_id" v-model="llamada.paciente" class="form-select">
          <option value="" disabled>--- Escoge paciente ---</option>
          <option v-for="paciente in pacientes" :value="paciente.id" :key="paciente.id">
            {{ paciente.nombre }}
          </option>
        </Field>
        <ErrorMessage name="paciente" class="text-danger" />
      </div>

      <div class="form-group">
        <label for="subtipo" v-if="llamada.emergencia">Tipo de emergencia:</label>
        <label for="subtipo" v-else>Tipo de comunicación:</label>
        <Field as="select" name="subtipo" v-model="llamada.subtipo" class="form-control">
          <option value="" disabled>--- Escoge tipo ---</option>
          <template v-if="llamada.emergencia">
            <option value="Emergencias sociales">Emergencias sociales</option>
            <option value="Emergencias sanitarias">Emergencias sanitarias</option>
            <option value="Crisis de soledad o angustia">Crisis de soledad o angustia</option>
            <option value="Alarma sin respuesta">Alarma sin respuesta</option>
            <option value="Otro tipo de llamada">Otro tipo de llamada...</option>
          </template>
          <template v-else>
            <option value="Notificar ausencias o retornos">Notificar ausencias o retornos</option>
            <option value="Modificar datos personales">Modificar datos personales</option>
            <option value="Llamadas accidentales">Llamadas accidentales</option>
            <option value="Solicitud de informacion">Solicitud de información</option>
            <option value="Sugerencias, quejas o reclamaciones">Sugerencias, quejas o reclamaciones</option>
            <option value="Llamadas sociales">Llamadas sociales</option>
            <option value="Registrar citas medicas">Registrar citas médicas</option>
            <option value="Otro tipo de llamada">Otro tipo de llamada...</option>
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
          <Field type="number" name="horas" v-model="llamada.horas" :placeholder="llamada.horas === null ? 'Horas' : ''"
            min="0" class="form-control" />
          <span>:</span>
          <Field type="number" name="minutos" v-model="llamada.minutos"
            :placeholder="llamada.minutos === null ? 'Minutos' : ''" min="0" max="59" class="form-control" />
          <span>:</span>
          <Field type="number" name="segundos" v-model="llamada.segundos"
            :placeholder="llamada.segundos === null ? 'Segundos' : ''" min="0" max="59" class="form-control" />
        </div>
        <ErrorMessage name="horas" class="error-message" />
        <br>
        <ErrorMessage name="minutos" class="error-message" />
        <br>
        <ErrorMessage name="segundos" class="error-message" />
      </div>

      <div class="form-group">
        <label for="descripcion">Descripción:</label>
        <Field as="textarea" name="descripcion" v-model="llamada.descripcion" class="form-control" />
        <ErrorMessage name="descripcion" class="error-message" />
      </div>

      <div class="form-actions">
        <button type="submit" @click="submitLlamada" v-if="!id" class="btn btn-primary">Añadir</button>
        <button type="submit"  @click="submitLlamada" v-else class="btn btn-primary">Editar</button>
        <button type="button" v-if="!id" @click="resetForm" class="btn btn-secondary">Reset</button>
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

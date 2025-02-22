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
      planificado: yup.string().required("El tipo de llamada es obligatorio"),
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
        paciente_id: this.$route.query.paciente_id || "",
        descripcion: "",
        planificado: this.planificado ? true : false,
        duracion: "",
        horas: null,
        minutos: null,
        segundos: null,
      },
      operador: {},
      mySchema,
    };
  },
  methods: {
    ...mapActions(useDataStore, ["registrarLlamadaSaliente", "editOutgoingCall", "getLlamadaSaliente"]),

    async submitLlamada() {
      const fechaHora = `${this.llamada.dia} ${this.llamada.hora}`;
      const duracionTotal = (this.llamada.horas * 60 + this.llamada.minutos) * 60 + this.llamada.segundos;

      const llamadaData = {
        ...this.llamada,
        fecha_hora: fechaHora,
        duracion: duracionTotal,
        descripcion: this.llamada.descripcion || "Sin descripción",
        paciente_id: this.llamada.paciente_id,
      };

      delete llamadaData.dia;
      delete llamadaData.hora;
      delete llamadaData.horas;
      delete llamadaData.minutos;
      delete llamadaData.segundos;

      if (!this.id) {
        await this.registrarLlamadaSaliente(llamadaData);
      } else {
        await this.editOutgoingCall(llamadaData);
      }

      this.$router.push("/");
    },

    async cargarLlamada() {
      if (this.id) {
        const data = await this.getLlamadaSaliente(this.id);
        if (data.fecha_hora) {
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

    resetLlamada() {
      this.llamada = {
        dia: "",
        hora: "",
        user_id: JSON.parse(localStorage.getItem('operador'))?.id || null,
        paciente_id: this.$route.query.paciente_id || "",
        descripcion: "",
        planificado: this.planificado ? true : false,
        duracion: "",
        horas: null,
        minutos: null,
        segundos: null,
      };
      this.operador = JSON.parse(localStorage.getItem('operador'))?.nombre || '';
    },
  },
  async mounted() {
    if (!this.id) {
      const now = new Date();
      this.llamada.dia = now.toISOString().split("T")[0];
      this.llamada.hora = now.toTimeString().split(" ")[0].slice(0, 5);
      this.operador = JSON.parse(localStorage.getItem('operador')).nombre;
    } else {
      this.operador = this.getNomOperadorById(this.llamada.user_id);
      await this.cargarLlamada();
    }
  }
};
</script>

<template>
  <div id="form" class="container mt-5">
    <h3 class="mb-4">Registrar llamada saliente</h3>
    <Form id="llamadaForm" method="post" @submit="submitLlamada" :validation-schema="mySchema">
      <div class="mb-3">
        <label for="user_id" class="form-label">Operador:</label>
        <Field type="text" name="user_id" v-model="operador" class="form-control" disabled />
        <ErrorMessage name="user_id" class="text-danger" />
      </div>

      <div class="mb-3">
        <label for="paciente_id" class="form-label">Paciente:</label>
        <Field as="select" name="paciente_id" v-model="llamada.paciente_id" class="form-select">
          <option value="" disabled>--- Escoge paciente ---</option>
          <option v-for="paciente in pacientes" :value="paciente.id" :key="paciente.id">
            {{ paciente.nombre }}
          </option>
        </Field>
        <ErrorMessage name="paciente_id" class="text-danger" />
      </div>

      <div class="mb-3">
        <label for="dia" class="form-label">Día de la llamada:</label>
        <Field type="date" name="dia" v-model="llamada.dia" class="form-control" />
        <ErrorMessage name="dia" class="text-danger" />
      </div>

      <div class="mb-3">
        <label for="hora" class="form-label">Hora de la llamada:</label>
        <Field type="time" name="hora" v-model="llamada.hora" class="form-control" />
        <ErrorMessage name="hora" class="text-danger" />
      </div>

      <div class="mb-3">
        <label for="duracion" class="form-label">Duración de la llamada:</label>
        <div class="duration-fields">
          <Field type="number" name="horas" v-model="llamada.horas" :placeholder="llamada.horas === null ? 'Horas' : ''" min="0" class="form-control" />
          <span>:</span>
          <Field type="number" name="minutos" v-model="llamada.minutos" :placeholder="llamada.minutos === null ? 'Minutos' : ''" min="0" max="59" class="form-control" />
          <span>:</span>
          <Field type="number" name="segundos" v-model="llamada.segundos" :placeholder="llamada.segundos === null ? 'Segundos' : ''" min="0" max="59" class="form-control" />
        </div>
        <ErrorMessage name="horas" class="text-danger" />
        <br>
        <ErrorMessage name="minutos" class="text-danger" />
        <br>
        <ErrorMessage name="segundos" class="text-danger" />
      </div>

      <div class="mb-3">
        <label for="descripcion" class="form-label">Descripción:</label>
        <Field as="textarea" name="descripcion" v-model="llamada.descripcion" class="form-control" />
        <ErrorMessage name="descripcion" class="text-danger" />
      </div>

      <div class="form-actions">
        <button type="submit" @click="submitLlamada" v-if="!id" class="btn btn-primary">Añadir</button>
        <button type="submit" @click="submitLlamada" v-else class="btn btn-primary">Editar</button>
        <button type="button" v-if="!id" @click="resetLlamada" class="btn btn-secondary">Reset</button>
        <button type="button" v-else @click="cargarLlamada" class="btn btn-secondary">Reset datos</button>
      </div>
    </Form>
  </div>
</template>

<style scoped>
.duration-fields {
  display: flex;
  align-items: center;
}

.duration-fields span {
  margin: 0 5px;
}
</style>
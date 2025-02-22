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
      operador_id: yup.string().required("El operador es obligatorio"),
      dia: yup
        .string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato incorrecto, debe ser YYYY-MM-DD")
        .required("El día de la llamada es obligatorio"),
      hora: yup
        .string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato incorrecto, debe ser HH:MM")
        .required("La hora de la llamada es obligatoria"),
      descripcion: yup.string().max(500, "Máximo 500 caracteres").nullable(),
      planificada: yup.string().required("El tipo de llamada es obligatorio"),
      paciente: yup.string().required("El paciente es obligatorio"),
      duracion: yup
        .number()
        .min(1, "La duración debe ser al menos 1 segundo")
        .required("La duración es obligatoria"),
    });

    return {
      llamada: {
        dia: "",
        hora: "",
        operador_id: JSON.parse(localStorage.getItem('operador'))?.id || null,
        paciente: this.$route.query.paciente || "",
        descripcion: "",
        planificada: this.planificada ? true : false,
        duracion: null,
      },
      operador: {},
      mySchema,
    };
  },
  methods: {
    ...mapActions(useDataStore, ["registrarLlamadaSaliente", "editIncomingCall", "getLlamadaSaliente"]),

    async submitLlamada() {
      const fechaHora = `${this.llamada.dia} ${this.llamada.hora}`;

      const llamadaData = {
        ...this.llamada,
        fecha_hora: fechaHora,
        descripcion: this.llamada.descripcion || "Sin descripción",
      };

      delete llamadaData.dia;
      delete llamadaData.hora;

      if (!this.id) {
        await this.registrarLlamadaSaliente(llamadaData);
      } else {
        await this.editIncomingCall(llamadaData);
      }

      this.$router.push("/");
    },

    async cargarLlamada() {
      if (this.id) {
        const data = await this.getLlamadaSaliente(this.id);
        if (data.fecha_hora) {
          const [fecha, horaCompleta] = data.fecha_hora.split(" ");
          const [hora, minutos] = horaCompleta.split(":");

          this.llamada = {
            ...data,
            dia: fecha,
            hora: `${hora}:${minutos}`,
          };
        }
      }
    },

    resetLlamada() {
      this.llamada = {
        dia: "",
        hora: "",
        operador_id: JSON.parse(localStorage.getItem('operador'))?.id || null,
        paciente: this.$route.query.paciente || "",
        descripcion: "",
        planificada: this.planificada ? true : false,
        duracion: null,
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
      this.operador = this.getNomOperadorById(this.llamada.operador_id);
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
        <label for="operador" class="form-label">Operador:</label>
        <Field type="text" name="operador_id" v-model="operador" class="form-control" disabled />
        <ErrorMessage name="operador_id" class="text-danger" />
      </div>

      <div class="mb-3">
        <label for="paciente" class="form-label">Paciente:</label>
        <Field as="select" name="paciente" v-model="llamada.paciente" class="form-select">
          <option value="" disabled>--- Escoge paciente ---</option>
          <option v-for="paciente in pacientes" :value="paciente.id" :key="paciente.id">
            {{ paciente.nombre }}
          </option>
        </Field>
        <ErrorMessage name="paciente" class="text-danger" />
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
        <label for="duracion" class="form-label">Duración de la llamada (en segundos):</label>
        <Field type="number" name="duracion" v-model="llamada.duracion" class="form-control" />
        <ErrorMessage name="duracion" class="text-danger" />
      </div>

      <div class="mb-3">
        <label for="descripcion" class="form-label">Descripción:</label>
        <Field as="textarea" name="descripcion" v-model="llamada.descripcion" class="form-control" />
        <ErrorMessage name="descripcion" class="text-danger" />
      </div>

      <div class="form-actions">
        <button type="submit" v-if="!id" class="btn btn-primary">Añadir</button>
        <button type="submit" v-else class="btn btn-primary">Editar</button>
        <button type="button" v-if="!id" @click="resetLlamada" class="btn btn-secondary">Reset</button>
        <button type="button" v-else @click="cargarLlamada" class="btn btn-secondary">Reset datos</button>
      </div>
    </Form>
  </div>
</template>
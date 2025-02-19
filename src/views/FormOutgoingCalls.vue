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
      "getPacientesByOperadorZona",
      "getNomPacienteById",
      "getIdByNomPaciente",
      "pacientes",
    ]),
  },
  data() {
    const mySchema = yup.object({
      operador_id: yup.number().required("El operador es obligatorio"),
      dia: yup
        .string()
        .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato incorrecto, debe ser YYYY-MM-DD")
        .required("El día de la llamada es obligatorio"),
      hora: yup
        .string()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato incorrecto, debe ser HH:MM")
        .required("La hora de la llamada es obligatoria"),
      descripcion: yup.string().max(500, "Máximo 500 caracteres").nullable(),
      tipo_llamada: yup.string().required("El tipo de llamada es obligatorio"),
      paciente_id: yup.string().required("El paciente es obligatorio"),
    });

    return {
      llamada: {
        dia: "",
        hora: "",
        operador_id: JSON.parse(localStorage.getItem('operador'))?.id || null,
        paciente_id: "",
        descripcion: "",
        tipo_llamada: this.planificada ? "planificada" : "no_planificada",
        detalles: "",
      },
      mySchema,
    };
  },
  methods: {
    ...mapActions(useDataStore, ["registrarLlamadaEntrante", "editIncomingCall", "getLlamadaSaliente"]),

    async submitLlamada() {
      const fechaHora = `${this.llamada.dia} ${this.llamada.hora}`;

      const llamadaData = {
        ...this.llamada,
        fecha_hora: fechaHora,
        paciente_id: this.llamada.paciente_id,
        descripcion: this.llamada.descripcion || "",
      };

      if (!this.id) {
        await this.registrarLlamadaEntrante(llamadaData);
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
            operador_id: data.operador_id,
          };
        }
      }
    },
  },
  mounted() {
    if (!this.id) {
      const now = new Date();
      this.llamada.dia = now.toISOString().split("T")[0];
      this.llamada.hora = now.toTimeString().split(" ")[0].slice(0, 5);
    } else {
      console.log("cargando llamada: " + this.id);
      this.cargarLlamada();
    }
  }
};
</script>

<template>
  <div id="form" class="container mt-5">
    <h3 class="mb-4">Registrar llamada saliente</h3>
    <Form id="llamadaForm" method="post" @submit="submitLlamada" class="needs-validation" novalidate>
      <div class="mb-3">
        <label for="operador" class="form-label">Operador:</label>
        <Field type="text" name="operador" v-model="llamada.operador_id" class="form-control" disabled />
        <ErrorMessage name="operador" class="text-danger" />
      </div>

      <div class="mb-3">
        <label for="paciente" class="form-label">Paciente:</label>
        <Field as="select" name="paciente" v-model="llamada.paciente_id" class="form-select">
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

      <div class="mb-3" v-if="llamada.tipo_llamada === 'no_planificada'">
        <label for="detalles" class="form-label">Detalles de la llamada no planificada:</label><br>
        <Field as="textarea" name="detalles" v-model="llamada.detalles" class="form-control"
          placeholder="Por ejemplo: Verificación de actuación previa, seguimiento de alarma, etc." />
        <ErrorMessage name="detalles" class="text-danger" />
      </div>

      <div class="d-flex justify-content-between">
        <button type="submit" class="btn btn-primary" v-if="!id">Añadir</button>
        <button type="submit" class="btn btn-primary" v-else>Editar</button>
        <button type="reset" class="btn btn-secondary" v-if="!id">Reset</button>
        <button type="button" class="btn btn-secondary" v-else @click="cargarLlamada">Reset datos</button>
      </div>
    </Form>
  </div>
</template>

<style scoped>
/* Estilos adicionales si es necesario */
</style>
<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import { useDataStore } from "../stores/store";
import { mapState, mapActions } from "pinia";
import * as yup from "yup";

export default {
  name: "RegistroPaciente",

  props: {
    id: {
      type: String,
      default: null,
    },
  },

  components: {
    Form,
    Field,
    ErrorMessage,
  },

  data() {
    return {
      form: {
        nombre: "",
        fecha_nac: "",
        DNI: "",
        num_sip: "",
        telefono: "",
        correo: "",
        direccion: "",
        ciudad: "",
        cp: "",
        zona: "",
        sit_personal: "",
        sit_sanitaria: "",
        sit_habitaculo: "",
        sit_economica: "",
        autonomia: false,
        personas_contacto: [{ nombre: "", apellido: "", telefono: "", relacion: "" }],
      },

      situacionHabitaculo: ["Casa Propia", "Alquiler", "Residencia", "Otros"],
      situacionEconomica: ["Pensión", "Trabajo activo", "Desempleado", "Otros"],

      schema: yup.object().shape({
        nombre: yup.string().required("El nombre es obligatorio"),
        fecha_nac: yup.date().typeError("Debe ser una fecha válida").required("La fecha de nacimiento es obligatoria"),
        DNI: yup
          .string()
          .matches(/^\d{8}[A-Z]$/, "El DNI debe tener 8 números seguidos de una letra en mayúscula")
          .required("El DNI es obligatorio"),
        num_sip: yup.string().matches(/^\d+$/, "Debe ser un número").required("El número SIP es obligatorio"),
        telefono: yup.string().matches(/^[0-9]{9}$/, "El teléfono debe tener 9 dígitos").required("El teléfono es obligatorio"),
        correo: yup.string().email("Debe ser un correo válido").required("El correo es obligatorio"),
        direccion: yup.string().required("La dirección es obligatoria"),
        ciudad: yup.string().required("La ciudad es obligatoria"),
        cp: yup.string().matches(/^\d{5}$/, "Debe ser un código postal válido").required("El código postal es obligatorio"),
        zona: yup.string().required("La zona es obligatoria"),
        sit_personal: yup.string().required("Campo obligatorio"),
        sit_sanitaria: yup.string().required("Campo obligatorio"),
        sit_habitaculo: yup.string().required("Campo obligatorio"),
        sit_economica: yup.string().required("Campo obligatorio"),
        personas_contacto: yup.array().of(
          yup.object().shape({
            nombre: yup.string().required("El nombre es obligatorio"),
            apellido: yup.string().required("El apellido es obligatorio"),
            telefono: yup.string().matches(/^[0-9]{9}$/, "Debe tener 9 dígitos").required("El teléfono es obligatorio"),
            relacion: yup.string().required("La relación es obligatoria"),
          })
        ),
      }),
    };
  },
  async mounted() {
    if (this.id) {
      const paciente = await this.loadPatient(this.id);
      if (paciente) {
        this.form = JSON.parse(JSON.stringify(paciente));
      }
    }
  },

  computed: {
    ...mapState(useDataStore, ["zonas", "getNomZonaById"]),

    zonaNombre: {
      get() {
        return this.getNomZonaById(this.form.zona) || "";
      },
      set(nombre) {
        const zonaEncontrada = this.zonas.find((zona) => zona.nombre === nombre);
        this.form.zona = zonaEncontrada ? zonaEncontrada.id : "";
      },
    },
  },


  methods: {
    ...mapActions(useDataStore, ["loadPatient", "addPatient", "updatePatient"]),
    async submitPatient() {
      if (this.form.sit_personal === "Solo/a") {
        this.form.sit_personal = `Solo/a. Pasa solo/a ${this.form.tiempo_solo} horas.`;
      } else if (this.form.sit_personal === "Acompañado/a") {
        this.form.sit_personal = `Acompañado/a. Con ${this.form.acompaniado_con}`;
      } else if (this.form.sit_personal === "Otros") {
        this.form.sit_personal = `Otros: ${this.form.sit_personal_otros}`;
      }

      if (this.form.sit_economica === "Pensión") {
        this.form.sit_economica = `Pensión. Monto: ${this.form.monto_pension}€`;
      } else if (this.form.sit_economica === "Trabajo activo") {
        this.form.sit_economica = `Trabajo activo. Lugar: ${this.form.trabajo}`;
      } else if (this.form.sit_economica === "Desempleado") {
        this.form.sit_economica = `Desempleado. Motivo: ${this.form.desempleado_por}`;
      } else if (this.form.sit_economica === "Otros") {
        this.form.sit_economica = `Otros: ${this.form.sit_economica_otros}`;
      }
      const usuario = {
        nombre: this.form.nombre,
        fecha_nac: this.form.fecha_nac,
        DNI: this.form.DNI,
        num_sip: this.form.num_sip,
        telefono: this.form.telefono,
        correo: this.form.correo,
        direccion: this.form.direccion,
        ciudad: this.form.ciudad,
        cp: this.form.cp,
        zona: this.form.zona,
        sit_personal: this.form.sit_personal,
        sit_sanitaria: this.form.sit_sanitaria,
        sit_habitaculo: this.form.sit_habitaculo,
        sit_economica: this.form.sit_economica,
        autonomia: Boolean(this.form.autonomia),
        personas_contacto: this.form.personas_contacto,
      }
      if (this.id) {
        await this.updatePatient(usuario);
      } else {
        await this.addPatient(usuario);
      }
      this.$router.push("/")
    },
    agregarPersonaContacto() {
      this.form.personas_contacto.push({ nombre: "", apellido: "", telefono: "", relacion: "" });
    },

    eliminarPersonaContacto(index) {
      this.form.personas_contacto.splice(index, 1);
    },
  },
};
</script>

<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4" v-if="!this.id">Registrar Nuevo Paciente</h1>
    <h1 class="text-center mb-4" v-else>Editar paciente</h1>
    <div class="card shadow">
      <div class="card-body">
        <Form @submit="submitPatient" :validation-schema="schema">
          <div class="mb-3">
            <label class="form-label">Nombre Completo</label>
            <Field name="nombre" v-model="form.nombre" type="text" class="form-control" />
            <ErrorMessage name="nombre" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Fecha de Nacimiento</label>
            <Field name="fecha_nac" v-model="form.fecha_nac" type="date" class="form-control" />
            <ErrorMessage name="fecha_nac" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">DNI</label>
            <Field name="DNI" v-model="form.DNI" type="text" class="form-control" />
            <ErrorMessage name="DNI" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Número de Tarjeta Sanitaria</label>
            <Field name="num_sip" v-model="form.num_sip" type="text" class="form-control" />
            <ErrorMessage name="num_sip" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Teléfono</label>
            <Field name="telefono" v-model="form.telefono" type="text" class="form-control" />
            <ErrorMessage name="telefono" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Correo Electrónico</label>
            <Field name="correo" v-model="form.correo" type="email" class="form-control" />
            <ErrorMessage name="correo" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Dirección</label>
            <Field name="direccion" v-model="form.direccion" type="text" class="form-control" />
            <ErrorMessage name="direccion" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Ciudad</label>
            <Field name="ciudad" v-model="form.ciudad" type="text" class="form-control" />
            <ErrorMessage name="ciudad" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Código Postal</label>
            <Field name="cp" v-model="form.cp" type="text" class="form-control" />
            <ErrorMessage name="cp" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Zona</label>
            <Field as="select" name="zona" v-model="zonaNombre" class="form-select">
              <option value="" disabled>Seleccione una opción</option>
              <option v-for="zona in zonas" :key="zona.id" :value="zona.nombre">
                {{ zona.nombre }}
              </option>
            </Field>

            <ErrorMessage name="zona" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Situación Personal</label>
            <Field as="textarea" name="sit_personal" v-model="form.sit_personal" class="form-control">
            </Field>
            <ErrorMessage name="sit_personal" class="text-danger small" />
          </div>

          <div v-if="form.sit_personal === 'Solo/a'" class="mb-3">
            <label class="form-label">¿Cuántas horas pasa solo?</label>
            <Field name="tiempo_solo" v-model="form.tiempo_solo" type="number" class="form-control" min="0" max="24" />
            <ErrorMessage name="tiempo_solo" class="text-danger small" />
          </div>

          <div v-if="form.sit_personal === 'Acompañado/a'" class="mb-3">
            <label class="form-label">¿Con quién vive?</label>
            <Field name="acompaniado_con" v-model="form.acompaniado_con" type="text" class="form-control" />
            <ErrorMessage name="acompaniado_con" class="text-danger small" />
          </div>

          <div v-if="form.sit_personal === 'Otros'">
            <label class="form-label">Especifique</label>
            <Field name="sit_personal_otros" v-model="form.sit_personal_otros" as="textarea" class="form-control" />
            <ErrorMessage name="sit_personal_otros" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Situación Habitacional</label>
            <Field as="textarea" name="sit_habitaculo" v-model="form.sit_habitaculo" class="form-control"
              placeholder="Barreras arquitectónicas, estado de conservación, tipo de vivienda, ubicación...">
            </Field>
            <ErrorMessage name="sit_habitaculo" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Situación Sanitaria</label>
            <Field as="textarea" name="sit_sanitaria" v-model="form.sit_sanitaria" class="form-control" />
            <ErrorMessage name="sit_sanitaria" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">¿Tiene autonomía personal?</label>
            <div>
              <input type="checkbox" v-model="form.autonomia" />
              <label>Puede realizar actividades básicas de la vida diaria sin ayuda.</label>
            </div>
          </div>


          <div class="mb-3">
            <label class="form-label">Situación Económica</label>
            <Field as="textarea" name="sit_economica" v-model="form.sit_economica" class="form-control"
              placeholder="Pensión, trabajo activo, desempleado...">
            </Field>
            <ErrorMessage name="sit_economica" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Personas de Contacto</label>

            <div v-for="(persona, index) in form.personas_contacto" :key="index" class="border p-3 mb-3 rounded">
              <h5 class="text-primary">Persona de Contacto {{ index + 1 }}</h5>

              <div class="mb-2">
                <label class="form-label">Nombre</label>
                <Field :name="`personas_contacto[${index}].nombre`" v-model="persona.nombre" type="text"
                  class="form-control" placeholder="Nombre" />
                <ErrorMessage :name="`personas_contacto[${index}].nombre`" class="text-danger small" />
              </div>

              <div class="mb-2">
                <label class="form-label">Apellido</label>
                <Field :name="`personas_contacto[${index}].apellido`" v-model="persona.apellido" type="text"
                  class="form-control" placeholder="Apellido" />
                <ErrorMessage :name="`personas_contacto[${index}].apellido`" class="text-danger small" />
              </div>

              <div class="mb-2">
                <label class="form-label">Teléfono</label>
                <Field :name="`personas_contacto[${index}].telefono`" v-model="persona.telefono" type="text"
                  class="form-control" placeholder="Teléfono" />
                <ErrorMessage :name="`personas_contacto[${index}].telefono`" class="text-danger small" />
              </div>

              <div class="mb-2">
                <label class="form-label">Relación</label>
                <Field :name="`personas_contacto[${index}].relacion`" v-model="persona.relacion" type="text"
                  class="form-control" placeholder="Relación" />
                <ErrorMessage :name="`personas_contacto[${index}].relacion`" class="text-danger small" />
              </div>

              <button type="button" @click="eliminarPersonaContacto(index)" class="btn btn-danger btn-sm mt-2">
                Eliminar
              </button>
            </div>

            <button type="button" @click="agregarPersonaContacto" class="btn btn-primary mt-3">
              Agregar Persona de Contacto
            </button>
          </div>

          <div class="text-center mt-4">
            <button type="submit" class="btn btn-success">
              Registrar Paciente
            </button>
          </div>
          <div class="text-center mt-4">
            <button type="button" @click="$router.push('/')" class="btn btn-secondary">
              Cancelar
            </button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
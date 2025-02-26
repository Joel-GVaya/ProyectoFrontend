<script>
import { Form, Field, ErrorMessage, useForm } from "vee-validate";
import { useDataStore } from "../stores/store";
import { mapState, mapActions } from "pinia";
import * as yup from "yup";

export default {
  props: ["id"],

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
        zona_id: "",
        sit_personal: "",
        sit_sanitaria: "",
        sit_habitaculo: "",
        sit_economica: "",
        autonomia: false,
        persona_contacto: [{ nombre: "", apellido: "", telefono: "", relacion: "" }],
      },

      schema: yup.object().shape({
        nombre: yup.string().required("El nombre es obligatorio"),
        fecha_nac: yup.date().typeError("Debe ser una fecha válida").required("La fecha de nacimiento es obligatoria"),
        DNI: yup
          .string()
          .matches(/^\d{8}[A-Z]$/, "El DNI debe tener 8 números seguidos de una letra en mayúscula")
          .required("El DNI es obligatorio"),
        num_sip: yup
          .string()
          .max(8, "El número SIP debe tener 8 dígitos")
          .matches(/^\d+$/, "Debe ser un número válido")
          .required("El número SIP es obligatorio"),
        telefono: yup.string().matches(/^[0-9]{9}$/, "El teléfono debe tener 9 dígitos").required("El teléfono es obligatorio"),
        correo: yup.string().email("Debe ser un correo válido").required("El correo es obligatorio"),
        direccion: yup.string().required("La dirección es obligatoria"),
        ciudad: yup.string().required("La ciudad es obligatoria"),
        cp: yup.string().matches(/^\d{5}$/, "Debe ser un código postal válido").required("El código postal es obligatorio"),
        zona_id: yup.string().required("La zona es obligatoria"),
        sit_personal: yup.string().required("Campo obligatorio"),
        sit_sanitaria: yup.string().required("Campo obligatorio"),
        sit_habitaculo: yup.string().required("Campo obligatorio"),
        sit_economica: yup.string().required("Campo obligatorio"),
        persona_contacto: yup.array().of(
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

  mounted() {
    if (this.id) {
      this.cargarPaciente();
    }
  },

  watch: {
    id(newId) {
      if (newId) {
        this.cargarPaciente();
      } else {
        this.resetForm();
      }
    },
  },

  computed: {
    ...mapState(useDataStore, ["zonas", "getNomZonaById"]),

    zonaNombre: {
      get() {
        return this.getNomZonaById(this.form.zona_id) || "";
      },
      set(nombre) {
        const zonaEncontrada = this.zonas.find((zona) => zona.nombre === nombre);
        this.form.zona_id = zonaEncontrada ? Number(zonaEncontrada.id) : "";
      },
    },
  },

  methods: {
    ...mapActions(useDataStore, ["loadPatient", "addPatient", "updatePatient", "populatePacientes"]),
    
    async cargarPaciente() {
      if (!this.id) return;
      const paciente = await this.loadPatient(this.id);
      if (paciente) {
        this.form = JSON.parse(JSON.stringify(paciente));

        if (this.form.fecha_nac) {
          const fecha = new Date(this.form.fecha_nac);
          this.form.fecha_nac = fecha.toISOString().split("T")[0];
        }
        this.form.autonomia = this.form.autonomia === 1;
      }
    },

    async submitPatient() {
      const usuario = {
        id: this.id ? Number(this.id) : null,
        nombre: this.form.nombre,
        fecha_nac: this.form.fecha_nac ? this.form.fecha_nac : null,
        DNI: this.form.DNI,
        num_sip: this.form.num_sip,
        telefono: this.form.telefono,
        correo: this.form.correo,
        direccion: this.form.direccion,
        ciudad: this.form.ciudad,
        cp: this.form.cp,
        zona_id: this.form.zona_id ? Number(this.form.zona_id) : null,
        sit_personal: this.form.sit_personal,
        sit_sanitaria: this.form.sit_sanitaria,
        sit_habitaculo: this.form.sit_habitaculo,
        sit_economica: this.form.sit_economica,
        autonomia: this.form.autonomia,
      };

      if (this.id) {
        await this.updatePatient(usuario);
      } else {
        await this.addPatient(usuario);
      }

      await this.populatePacientes();

      this.$router.push("/");
    },

    agregarPersonaContacto() {
      this.form.persona_contacto.push({ nombre: "", apellido: "", telefono: "", relacion: "" });
    },

    eliminarPersonaContacto(index) {
      this.form.persona_contacto.splice(index, 1);
    },

    resetForm() {
      this.form = {
        nombre: "",
        fecha_nac: "",
        DNI: "",
        num_sip: "",
        telefono: "",
        correo: "",
        direccion: "",
        ciudad: "",
        cp: "",
        zona_id: "",
        sit_personal: "",
        sit_sanitaria: "",
        sit_habitaculo: "",
        sit_economica: "",
        autonomia: false,
        persona_contacto: [{ nombre: "", apellido: "", telefono: "", relacion: "" }],
      };
      this.$refs.form.resetForm();
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
        <Form @submit="submitPatient" :validation-schema="schema" ref="form">
          <div class="mb-3">
            <label class="form-label">Nombre completo</label>
            <Field name="nombre" v-model="form.nombre" type="text" class="form-control"
              placeholder="Ingrese su nombre completo" />
            <ErrorMessage name="nombre" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Fecha de nacimiento</label>
            <Field name="fecha_nac" v-model="form.fecha_nac" type="date" class="form-control"
              placeholder="Seleccione su fecha de nacimiento" />
            <ErrorMessage name="fecha_nac" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">DNI</label>
            <Field name="DNI" v-model="form.DNI" type="text" class="form-control" placeholder="Ingrese su DNI" />
            <ErrorMessage name="DNI" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Número de tarjeta sanitaria</label>
            <Field name="num_sip" v-model="form.num_sip" type="text" class="form-control"
              placeholder="Ingrese el número de tarjeta sanitaria" maxlength="8"/>
            <ErrorMessage name="num_sip" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Teléfono</label>
            <Field name="telefono" v-model="form.telefono" type="text" class="form-control"
              placeholder="Ingrese su número de teléfono" />
            <ErrorMessage name="telefono" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Correo electrónico</label>
            <Field name="correo" v-model="form.correo" type="email" class="form-control"
              placeholder="Ingrese su correo electrónico" />
            <ErrorMessage name="correo" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Dirección</label>
            <Field name="direccion" v-model="form.direccion" type="text" class="form-control"
              placeholder="Ingrese su dirección" />
            <ErrorMessage name="direccion" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Ciudad</label>
            <Field name="ciudad" v-model="form.ciudad" type="text" class="form-control"
              placeholder="Ingrese su ciudad" />
            <ErrorMessage name="ciudad" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Código postal</label>
            <Field name="cp" v-model="form.cp" type="text" class="form-control"
              placeholder="Ingrese su código postal" />
            <ErrorMessage name="cp" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Zona</label>
            <Field as="select" name="zona_id" v-model="zonaNombre" class="form-select">
              <option value="" disabled>Seleccione una opción</option>
              <option v-for="zona in zonas" :key="zona.id" :value="zona.nombre">
                {{ zona.nombre }}
              </option>
            </Field>
            <ErrorMessage name="zona_id" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Situación personal</label>
            <Field as="textarea" name="sit_personal" v-model="form.sit_personal" class="form-control"
              placeholder="Describa su situación personal"></Field>
            <ErrorMessage name="sit_personal" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Situación habitacional</label>
            <Field as="textarea" name="sit_habitaculo" v-model="form.sit_habitaculo" class="form-control"
              placeholder="Barreras arquitectónicas, estado de conservación, tipo de vivienda, ubicación..."></Field>
            <ErrorMessage name="sit_habitaculo" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Situación sanitaria</label>
            <Field as="textarea" name="sit_sanitaria" v-model="form.sit_sanitaria" class="form-control"
              placeholder="Describa su situación sanitaria"></Field>
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
            <label class="form-label">Situación económica</label>
            <Field as="textarea" name="sit_economica" v-model="form.sit_economica" class="form-control"
              placeholder="Pensión, trabajo activo, desempleado..."></Field>
            <ErrorMessage name="sit_economica" class="text-danger small" />
          </div>

          <div class="mb-3">
            <label class="form-label">Personas de contacto</label>

            <div v-for="(persona, index) in form.persona_contacto" :key="index" class="border p-3 mb-3 rounded">
              <h5 class="text-primary">Persona de Contacto {{ index + 1 }}</h5>

              <div class="mb-2">
                <label class="form-label">Nombre</label>
                <Field :name="`persona_contacto[${index}].nombre`" v-model="persona.nombre" type="text"
                  class="form-control" placeholder="Ingrese el nombre de la persona de contacto" />
                <ErrorMessage :name="`persona_contacto[${index}].nombre`" class="text-danger small" />
              </div>

              <div class="mb-2">
                <label class="form-label">Apellido</label>
                <Field :name="`persona_contacto[${index}].apellido`" v-model="persona.apellido" type="text"
                  class="form-control" placeholder="Ingrese el apellido de la persona de contacto" />
                <ErrorMessage :name="`persona_contacto[${index}].apellido`" class="text-danger small" />
              </div>

              <div class="mb-2">
                <label class="form-label">Teléfono</label>
                <Field :name="`persona_contacto[${index}].telefono`" v-model="persona.telefono" type="text"
                  class="form-control" placeholder="Ingrese el teléfono de la persona de contacto" />
                <ErrorMessage :name="`persona_contacto[${index}].telefono`" class="text-danger small" />
              </div>

              <div class="mb-2">
                <label class="form-label">Relación</label>
                <Field :name="`persona_contacto[${index}].relacion`" v-model="persona.relacion" type="text"
                  class="form-control" placeholder="Indique la relación de la persona de contacto" />
                <ErrorMessage :name="`persona_contacto[${index}].relacion`" class="text-danger small" />
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
              {{ id ? 'Editar Paciente' : 'Registrar Paciente' }}
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

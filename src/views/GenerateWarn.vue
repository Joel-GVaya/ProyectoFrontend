<script>
import { mapActions, mapState } from "pinia";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useDataStore } from "@/stores/store";

export default {
    components: { Form, Field, ErrorMessage },
    props: { id: String },
    data() {
        const schema = yup.object({
            tipo: yup.string().required("El tipo es obligatorio"),
            categoria: yup.string().nullable(),
            descripcion: yup.string().required("La descripción es obligatoria"),
            fecha: yup.date().required("La fecha es obligatoria"),
            hora: yup.string().required("La hora es obligatoria"),
            frecuencia: yup.string().required("La frecuencia es obligatoria"),
            dias_periodicos: yup.number().nullable().when("frecuencia", {
                is: "periodico",
                then: (schema) => schema.required("Debe especificar cada cuántos días").min(1, "Debe ser al menos 1 día"),
            }),
            zona_afectada: yup.number().nullable().when("tipo", {
                is: "alarma",
                then: (schema) => schema.required("La zona afectada es obligatoria"),
            }),
            paciente_id: yup.number().nullable().when("tipo", {
                is: (val) => val !== "alarma",
                then: (schema) => schema.required("El paciente es obligatorio"),
            }),
        });

        const now = new Date();
        return {
            form: {
                operador_id: null,
                operador_nombre: "",
                tipo: this.$route.query.tipo === "alarma" ? "alarma" : "",
                categoria: this.$route.query.tipo === "alarma" ? null : "",
                descripcion: "",
                fecha: now.toISOString().split("T")[0], 
                hora: now.toTimeString().slice(0, 5), 
                frecuencia: "",
                dias_periodicos: null,
                zona_afectada: null,
                paciente_id: this.$route.query.paciente_id || null,
            },
            schema,
        };
    },
    computed: { ...mapState(useDataStore, ["zonas", "pacientes"]) },
    methods: {
        ...mapActions(useDataStore, ["registrarAviso", "getAvisoById", "editWarn"]),
        
        async submitForm() {
            const avisoData = {
                operador_id: this.form.operador_id,
                tipo: this.form.tipo,
                categoria: this.form.tipo === "alarma" ? null : this.form.categoria,
                descripcion: this.form.descripcion,
                fecha_inicio: `${this.form.fecha}T${this.form.hora}:00`,
                frecuencia: this.form.frecuencia === "periodico" && this.form.dias_periodicos
                    ? `periodico-${this.form.dias_periodicos}`
                    : this.form.frecuencia,
                zona_afectada: this.form.tipo === "alarma" ? this.form.zona_afectada : null,
                paciente_id: this.form.tipo !== "alarma" ? this.form.paciente_id : null,
            };
            
            if (this.id) {
                await this.editWarn(avisoData);
            } else {
                await this.registrarAviso(avisoData);
            }

            this.$router.push({ name: "home" });
        },

        async cargarAviso() {
            if (!this.id) return;
            const aviso = await this.getAvisoById(this.id);
            if (!aviso) return;

            const [fecha, hora] = aviso.fecha_inicio.split("T");
            const match = aviso.frecuencia.match(/periodico-(\d+)/);

            this.form = {
                ...aviso,
                fecha,
                hora: hora.slice(0, 5),
                frecuencia: match ? "periodico" : aviso.frecuencia,
                dias_periodicos: match ? parseInt(match[1]) : null,
                zona_afectada: aviso.tipo === "alarma" ? aviso.zona_afectada : null,
                paciente_id: aviso.tipo !== "alarma" ? aviso.paciente_id : null,
            };
        },
    },
    async mounted() {
        const operador = JSON.parse(localStorage.getItem("operador"));
        if (operador) {
            this.form.operador_id = operador.id;
            this.form.operador_nombre = operador.nombre;
        }
        if (this.id) await this.cargarAviso();


        const usuario = JSON.parse(localStorage.getItem("operador"));
        if (!usuario) {
      this.$router.push("/login");
      return;
  }
    },
};
</script>


<template>
    <div id="form" class="container mt-5">
        <h3 class="mb-4">{{ id ? "Editar Aviso" : "Crear Aviso" }}</h3>
        <Form @submit="submitForm" :validation-schema="schema" class="needs-validation" novalidate>
            <div class="mb-3">
                <label for="operador" class="form-label">Operador:</label>
                <input type="text" name="operador" v-model="form.operador_nombre" class="form-control" readonly />
            </div>

            <div class="mb-3">
                <label for="tipo" class="form-label">Tipo:</label>
                <Field as="select" name="tipo" v-model="form.tipo" class="form-select">
                    <option value="" disabled>--- Selecciona tipo ---</option>
                    <option value="avisos" v-if="form.tipo !== 'alarma'">Avisos</option>
                    <option value="seguimiento" v-if="form.tipo !== 'alarma'">Seguimiento según protocolos</option>
                    <option value="agendas" v-if="form.tipo !== 'alarma'">Agendas de ausencia domiciliaria y retorno</option>
                    <option value="alarma" v-else>Alarmas</option>
                </Field>
                <ErrorMessage name="tipo" class="text-danger" />
            </div>

            <div class="mb-3" v-if="form.tipo && form.tipo !== 'alarma'">
                <label for="categoria" class="form-label">Categoría:</label>
                <Field as="select" name="categoria" v-model="form.categoria" class="form-select">
                    <option value="" disabled>--- Selecciona categoría ---</option>
                    <template v-if="form.tipo === 'avisos'">
                        <option value="medicacion">De medicación</option>
                        <option value="especiales">Especiales o por alerta</option>
                    </template>
                    <template v-else-if="form.tipo === 'seguimiento'">
                        <option value="emergencias">Después de emergencias</option>
                        <option value="luto">Por procesos de luto</option>
                        <option value="altas">Por altas hospitalarias</option>
                    </template>
                    <template v-else-if="form.tipo === 'agendas'">
                        <option value="suspension">Suspensión temporal del servicio</option>
                        <option value="retornos">Retornos o fin de la ausencia</option>
                    </template>
                </Field>
                <ErrorMessage name="categoria" class="text-danger" />
            </div>

            <div class="mb-3">
                <label for="fecha" class="form-label">Fecha:</label>
                <Field type="date" name="fecha" v-model="form.fecha" class="form-control" />
                <ErrorMessage name="fecha" class="text-danger" />
            </div>

            <div class="mb-3">
                <label for="hora" class="form-label">Hora:</label>
                <Field type="time" name="hora" v-model="form.hora" class="form-control" />
                <ErrorMessage name="hora" class="text-danger" />
            </div>

            <div class="mb-3">
                <label for="frecuencia" class="form-label">Frecuencia:</label>
                <Field as="select" name="frecuencia" v-model="form.frecuencia" class="form-select">
                    <option value="" disabled>--- Selecciona frecuencia ---</option>
                    <option value="puntual">Puntual</option>
                    <option value="periodico">Periódico</option>
                </Field>
                <ErrorMessage name="frecuencia" class="text-danger" />
            </div>

            <div class="mb-3" v-if="form.frecuencia === 'periodico'">
                <label for="dias_periodicos" class="form-label">Cada cuántos días:</label>
                <Field type="number" name="dias_periodicos" v-model="form.dias_periodicos" class="form-control" />
                <ErrorMessage name="dias_periodicos" class="text-danger" />
            </div>

            <div class="mb-3" v-if="form.tipo === 'alarma'">
                <label for="zona_afectada" class="form-label">Zona Afectada:</label>
                <Field as="select" name="zona_afectada" v-model="form.zona_afectada" class="form-select">
                    <option value="" disabled>--- Selecciona zona ---</option>
                    <option v-for="zona in zonas" :value="zona.id" :key="zona.id">
                        {{ zona.nombre }}
                    </option>
                </Field>
                <ErrorMessage name="zona_afectada" class="text-danger" />
            </div>

            <div class="mb-3" v-if="form.tipo !== 'alarma'">
                <label for="paciente_id" class="form-label">Paciente:</label>
                <Field as="select" name="paciente_id" v-model="form.paciente_id" class="form-select">
                    <option value="" disabled>--- Selecciona paciente ---</option>
                    <option v-for="paciente in pacientes" :value="paciente.id" :key="paciente.id">
                        {{ paciente.nombre }}
                    </option>
                </Field>
                <ErrorMessage name="paciente_id" class="text-danger" />
            </div>

            <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción:</label>
                <Field as="textarea" name="descripcion" v-model="form.descripcion" class="form-control" />
                <ErrorMessage name="descripcion" class="text-danger" />
            </div>

            <button type="submit" class="btn btn-primary">
                {{ id ? "Editar" : "Crear" }}
            </button>
        </Form>
    </div>
</template>

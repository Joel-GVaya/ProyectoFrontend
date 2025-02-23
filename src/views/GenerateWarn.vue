<script>
import { mapActions, mapState } from "pinia";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useDataStore } from "../stores/store";

export default {
    components: { Form, Field, ErrorMessage },
    props: ["id"],
    data() {
        const mySchema = yup.object({
            user_id: yup.string().required("El operador es obligatorio"),
            tipo: yup.string().required("El tipo es obligatorio"),
            categoria: yup.string().nullable(),
            descripcion: yup.string().required("La descripción es obligatoria"),
            fecha: yup
                .string()
                .matches(/^\d{4}-\d{2}-\d{2}$/, "Formato incorrecto, debe ser YYYY-MM-DD")
                .required("El día de la llamada es obligatorio"),
            hora: yup
                .string()
                .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato incorrecto, debe ser HH:MM")
                .required("La hora de la llamada es obligatoria"),
            frecuencia: yup.string().required("La frecuencia es obligatoria"),
            dias_periodicos: yup.number().nullable().when("frecuencia", {
                is: "periodico",
                then: (mySchema) => mySchema.required("Debe especificar cada cuántos días").min(1, "Debe ser al menos 1 día"),
            }),
            zona_id: yup.number().nullable().when("tipo", {
                is: "alarma",
                then: (mySchema) => mySchema.required("La zona afectada es obligatoria"),
            }),
            paciente_id: yup.number().nullable().when("tipo", {
                is: (val) => val !== "alarma",
                then: (mySchema) => mySchema.required("El paciente es obligatorio"),
            }),
        });

        return {
            aviso: {
                user_id: null,
                tipo: "",
                categoria: "",
                descripcion: "",
                fecha: "",
                hora: "",
                frecuencia: "",
                dias_periodicos: null,
                zona_id: null,
                paciente_id: this.$route.query.paciente_id || null,
            },
            operador: {},
            mySchema,
        };
    },
    computed: { ...mapState(useDataStore, ["zonas", "pacientes", "getNomOperadorById"]) },
    methods: {
        ...mapActions(useDataStore, ["registrarAviso", "getAvisoByID", "editWarn"]),

        async submitForm() {
            const avisoData = {
                id: Number(this.id),
                user_id: Number(this.aviso.user_id),
                tipo: this.aviso.tipo,
                categoria: this.aviso.tipo === "alarma" ? null : this.aviso.categoria,
                descripcion: this.aviso.descripcion,
                fecha_inicio: `${this.aviso.fecha} ${this.aviso.hora}`,
                frecuencia: this.aviso.frecuencia === "periodico" && this.aviso.dias_periodicos
                    ? `periodico-${this.aviso.dias_periodicos}`
                    : this.aviso.frecuencia,
                zona_id: this.aviso.tipo === "alarma" ? this.aviso.zona_id : null,
                paciente_id: this.aviso.tipo !== "alarma" ? this.aviso.paciente_id : null,
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
            const aviso = await this.getAvisoByID(this.id);
            if (!aviso) return;

            const [fecha, horaCompleta] = aviso.fecha_inicio.split(" ");
            const [hora, minutos] = horaCompleta.split(":");
            const match = aviso.frecuencia.match(/periodico-(\d+)/);

            this.aviso = {
                ...aviso,
                fecha: fecha,
                categoria: aviso.tipo === "alarma" ? null : aviso.categoria,
                hora: `${hora}:${minutos}`,
                frecuencia: match ? "periodico" : aviso.frecuencia,
                dias_periodicos: match ? parseInt(match[1]) : null,
                zona_id: aviso.tipo === "alarma" ? aviso.zona_id : null,
                paciente_id: aviso.tipo !== "alarma" ? aviso.paciente_id : null,
            };

        },

        resetForm() {
            this.aviso = {
                user_id: JSON.parse(localStorage.getItem("operador")).id || null,
                tipo: "",
                categoria: "",
                descripcion: "",
                fecha: new Date().toISOString().split("T")[0],
                hora: new Date().toTimeString().slice(0, 5),
                frecuencia: "",
                dias_periodicos: null,
                zona_id: null,
                paciente_id: this.$route.query.paciente_id || null,
            };
            this.operador = JSON.parse(localStorage.getItem("operador")).nombre || "";
        },
    },
    async mounted() {
        if (!this.id) {
            this.aviso.fecha = new Date().toISOString().split("T")[0];
            this.aviso.hora = new Date().toTimeString().slice(0, 5);
            this.aviso.tipo = this.$route.query.tipo === "alarma" ? "alarma" : "";
            this.operador = JSON.parse(localStorage.getItem("operador")).nombre;
        } else {
            await this.cargarAviso();
            this.operador = this.getNomOperadorById(this.aviso.user_id);
        }
    },
};
</script>

<template>
    <div id="form" class="container mt-5">
        <h3 class="mb-4">{{ id ? "Editar Aviso" : "Crear Aviso" }}</h3>
        <Form @submit="submitForm" :validation-schema="mySchema" class="needs-validation" novalidate>
            <div class="mb-3">
                <label for="user_id" class="form-label">Operador:</label>
                <Field type="text" name="user_id" v-model="operador" class="form-control" readonly />
                <ErrorMessage name="user_id" class="text-danger" />
            </div>

            <div class="mb-3">
                <label for="tipo" class="form-label">Tipo:</label>
                <Field as="select" name="tipo" v-model="aviso.tipo" class="form-select">
                    <option value="" disabled>--- Selecciona tipo ---</option>
                    <option value="avisos" v-if="aviso.tipo !== 'alarma'">Avisos</option>
                    <option value="seguimiento" v-if="aviso.tipo !== 'alarma'">Seguimiento según protocolos</option>
                    <option value="agendas" v-if="aviso.tipo !== 'alarma'">Agendas de ausencia domiciliaria y retorno
                    </option>
                    <option value="alarma" v-else>Alarmas</option>
                </Field>
                <ErrorMessage name="tipo" class="text-danger" />
            </div>

            <div class="mb-3" v-if="aviso.tipo && aviso.tipo !== 'alarma'">
                <label for="categoria" class="form-label">Categoría:</label>
                <Field as="select" name="categoria" v-model="aviso.categoria" class="form-select">
                    <option value="" disabled>--- Selecciona categoría ---</option>
                    <template v-if="aviso.tipo === 'avisos'">
                        <option value="medicacion">De medicación</option>
                        <option value="especiales">Especiales o por alerta</option>
                    </template>
                    <template v-else-if="aviso.tipo === 'seguimiento'">
                        <option value="emergencias">Después de emergencias</option>
                        <option value="luto">Por procesos de luto</option>
                        <option value="altas">Por altas hospitalarias</option>
                    </template>
                    <template v-else-if="aviso.tipo === 'agendas'">
                        <option value="suspension">Suspensión temporal del servicio</option>
                        <option value="retorno">Retornos o fin de la ausencia</option>
                    </template>
                </Field>
                <ErrorMessage name="categoria" class="text-danger" />
            </div>

            <div class="mb-3">
                <label for="fecha" class="form-label">Fecha:</label>
                <Field type="date" name="fecha" v-model="aviso.fecha" class="form-control" />
                <ErrorMessage name="fecha" class="text-danger" />
            </div>

            <div class="mb-3">
                <label for="hora" class="form-label">Hora:</label>
                <Field type="time" name="hora" v-model="aviso.hora" class="form-control" />
                <ErrorMessage name="hora" class="text-danger" />
            </div>

            <div class="mb-3">
                <label for="frecuencia" class="form-label">Frecuencia:</label>
                <Field as="select" name="frecuencia" v-model="aviso.frecuencia" class="form-select">
                    <option value="" disabled>--- Selecciona frecuencia ---</option>
                    <option value="puntual">Puntual</option>
                    <option value="periodico">Periódico</option>
                </Field>
                <ErrorMessage name="frecuencia" class="text-danger" />
            </div>

            <div class="mb-3" v-if="aviso.frecuencia === 'periodico'">
                <label for="dias_periodicos" class="form-label">Cada cuántos días:</label>
                <Field type="number" name="dias_periodicos" v-model="aviso.dias_periodicos" class="form-control" />
                <ErrorMessage name="dias_periodicos" class="text-danger" />
            </div>

            <div class="mb-3" v-if="aviso.tipo === 'alarma'">
                <label for="zona_id" class="form-label">Zona Afectada:</label>
                <Field as="select" name="zona_id" v-model="aviso.zona_id" class="form-select">
                    <option value="" disabled>--- Selecciona zona ---</option>
                    <option v-for="zona in zonas" :value="zona.id" :key="zona.id">
                        {{ zona.nombre }}
                    </option>
                </Field>
                <ErrorMessage name="zona_id" class="text-danger" />
            </div>

            <div class="mb-3" v-if="aviso.tipo !== 'alarma'">
                <label for="paciente_id" class="form-label">Paciente:</label>
                <Field as="select" name="paciente_id" v-model="aviso.paciente_id" class="form-select">
                    <option value="" disabled>--- Selecciona paciente ---</option>
                    <option v-for="paciente in pacientes" :value="paciente.id" :key="paciente.id">
                        {{ paciente.nombre }}
                    </option>
                </Field>
                <ErrorMessage name="paciente_id" class="text-danger" />
            </div>

            <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción:</label>
                <Field as="textarea" name="descripcion" v-model="aviso.descripcion" class="form-control" />
                <ErrorMessage name="descripcion" class="text-danger" />
            </div>

            <button type="submit" class="btn btn-primary">
                {{ id ? "Editar" : "Crear" }}
            </button>
            <button type="button" v-if="!id" @click="resetForm" class="btn btn-secondary">Reset</button>
            <button type="button" v-else @click="cargarAviso" class="btn btn-secondary">Reset datos</button>
        </Form>
    </div>
</template>

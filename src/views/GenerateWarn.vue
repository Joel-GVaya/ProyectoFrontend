<script>
import { mapActions } from "pinia";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useDataStore } from "@/stores/store";

export default {
    components: {
        Form,
        Field,
        ErrorMessage,
    },
    data() {
        const schema = yup.object({
            operador_id: yup.number().required("El operador es obligatorio"),
            tipo: yup.string().required("El tipo es obligatorio"),
            categoria: yup.string().required("La categoría es obligatoria"),
            descripcion: yup.string().required("La descripción es obligatoria"),
            fecha_inicio: yup.date().required("La fecha de inicio es obligatoria"),
            frecuencia: yup
                .string()
                .oneOf(["diaria", "semanal", "mensual", "anual"], "Frecuencia no válida")
                .required('La frecuencia es obligatoria'),
            zona_afectada: yup.number().required("La zona afectada es obligatoria"),
            paciente_id: yup.number().required("El paciente es obligatorio"),
        });

        return {
            zonas: [],
            form: {
                operador_id: null,
                tipo: '',
                categoria: '',
                descripcion: '',
                fecha_inicio: '',
                frecuencia: null,
                zona_afectada: null,
                paciente_id: null
            },
            schema,
        };
    },
    methods: {
        ...mapActions(useDataStore, ["getZonas", "registrarAviso"]),
        async submitForm(values) {
            await this.registrarAviso(values);
            this.$router.push({ name: "home" });
        }
    },

    async mounted() {
        this.zonas = await this.getZonas();
    }
};
</script>


<template>
    <!-- ...existing code... -->
    <div id="form" class="container mt-5">
        <h3 class="mb-4">Generar Aviso</h3>
        <Form @submit="submitForm" :validation-schema="schema" class="needs-validation" novalidate>
            <div class="mb-3">
                <label for="operador_id" class="form-label">Operador ID:</label>
                <Field type="number" name="operador_id" v-model="form.operador_id" class="form-control" />
                <ErrorMessage name="operador_id" class="text-danger" />
            </div>
            <div class="mb-3">
                <label for="tipo" class="form-label">Tipo:</label>
                <Field type="text" name="tipo" v-model="form.tipo" class="form-control" />
                <ErrorMessage name="tipo" class="text-danger" />
            </div>
            <div class="mb-3">
                <label for="categoria" class="form-label">Categoría:</label>
                <Field type="text" name="categoria" v-model="form.categoria" class="form-control" />
                <ErrorMessage name="categoria" class="text-danger" />
            </div>
            <div class="mb-3">
                <label for="descripcion" class="form-label">Descripción:</label>
                <Field type="text" name="descripcion" v-model="form.descripcion" class="form-control" />
                <ErrorMessage name="descripcion" class="text-danger" />
            </div>
            <div class="mb-3">
                <label for="fecha_inicio" class="form-label">Fecha de Inicio:</label>
                <Field type="datetime-local" name="fecha_inicio" v-model="form.fecha_inicio" class="form-control" />
                <ErrorMessage name="fecha_inicio" class="text-danger" />
            </div>
            <div class="mb-3">
                <label for="frecuencia" class="form-label">Frecuencia:</label>
                <Field as="select" name="frecuencia" v-model="form.frecuencia" class="form-select">
                    <option value="" disabled>--- Selecciona frecuencia ---</option>
                    <option value="diaria">Diaria</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                </Field>
                <ErrorMessage name="frecuencia" class="text-danger" />
            </div>
            <div class="mb-3">
                <label for="zona_afectada" class="form-label">Zona Afectada:</label>
                <Field as="select" name="zona_afectada" v-model="form.zona_afectada" class="form-select">
                    <option value="" disabled>--- Selecciona zona ---</option>
                    <option v-for="zona in zonas" :value="zona.id" :key="zona.id">
                        {{ zona.nombre }}
                    </option>
                </Field>
                <ErrorMessage name="zona_afectada" class="text-danger" />
            </div>
            <div class="mb-3">
                <label for="paciente_id" class="form-label">Paciente ID:</label>
                <Field type="number" name="paciente_id" v-model="form.paciente_id" class="form-control" />
                <ErrorMessage name="paciente_id" class="text-danger" />
            </div>
            <button type="submit" class="btn btn-primary">Enviar</button>
        </Form>
    </div>
    <!-- ...existing code... -->
</template>

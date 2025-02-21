<script>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { mapActions } from "pinia";
import { useDataStore } from "@/stores/store";
import { loginWithGoogle } from "@/googleAuth/auth.js";

export default {
  name: "Login",

  components: {
    Form,
    Field,
    ErrorMessage,
  },

  data() {
    return {
      form: {
        correo: "",
        paswd: "",
      },
      mySchema: yup.object({
        correo: yup
          .string()
          .email("Introduce un correo válido")
          .required("El correo es obligatorio"),
        paswd: yup.string().required("La contraseña es obligatoria"),
      }),
    };
  },

  methods: {
    ...mapActions(useDataStore, ["login", "populatePacientes"]),

    async handleSubmit() {
      const { correo, paswd } = this.form;
      const user = await this.login(correo, paswd);
      if (user) {
        await this.populatePacientes();
        this.$router.push({ name: "home" });
      } else {
        alert("Correo o contraseña incorrectos");
      }
    },

    async iniciarSessionGoogle() {
      loginWithGoogle();
    },
  },

};
</script>

<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body">
            <h3 class="text-center mb-4">Iniciar Sesión</h3>
            <Form id="loginForm" :validation-schema="mySchema" @submit="handleSubmit">
              <div class="mb-3">
                <label for="correo" class="form-label">Correo electrónico</label>
                <Field v-model="form.correo" name="correo" type="email" class="form-control" />
                <ErrorMessage name="correo" class="text-danger small" />
              </div>

              <div class="mb-3">
                <label for="paswd" class="form-label">Contraseña</label>
                <Field v-model="form.paswd" name="paswd" type="password" class="form-control" />
                <ErrorMessage name="paswd" class="text-danger small" />
              </div>

              <button type="submit" class="btn btn-primary w-100">Enviar</button>
              <button type="button" class="btn btn-danger w-100 mt-2" @click="iniciarSessionGoogle">Iniciar sesión con
                Google</button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

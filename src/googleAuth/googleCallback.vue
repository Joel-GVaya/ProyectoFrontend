<template>
    <div v-if="loading">Processant autenticació...</div>
  </template>
  
  <script>
  import { onMounted, ref } from "vue";
  import { handleGoogleCallback } from "@/auth";
  import { useRouter, useRoute } from "vue-router";
  
  export default {
    setup() {
      const loading = ref(true);
      const router = useRouter();
      const route = useRoute();
  
      onMounted(async () => {
        const code = route.query.code;
        if (code) {
          await handleGoogleCallback(code);
          this.$router.push({ name: "home" });
        }
      });
  
      return { loading };
    }
  };
  </script>
  
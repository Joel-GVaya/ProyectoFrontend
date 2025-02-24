<script>
import { useDataStore } from '../stores/store.js';
import { mapState, mapActions } from 'pinia';
export default {
    components: {
        useDataStore
    },
    computed: {
        ...mapState(useDataStore, ['messages']),
    },
    methods: {
        ...mapActions(useDataStore, ['borrarMensaje']),
        borrarMensajes(indice) {
            return this.borrarMensaje(indice)
        }
    }
}

</script>

<template>
    <div v-for="(message, index) in messages" class="alert alert-danger alert-dismissible" role="alert"> {{ message }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"
            @click="borrarMensajes(index)">x</button></div>
</template>

<style>
nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #00a2ff;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 20px;
}

nav ul {
    list-style: none;
    display: flex;
    gap: 70px;
    margin: 0;
    padding: 0;
}

nav a {
    color: rgb(0, 0, 0);
    text-decoration: none;
    font-weight: bold;
    transition: color 0.5s;
}

nav a:hover {
    color: #ffffff;
}
</style>
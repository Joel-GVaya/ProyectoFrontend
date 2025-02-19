<script>
    export default{
        name: 'Logout',

        mounted() {
            localStorage.removeItem('operador'); // Elimina solo el usuario
            this.$router.push({name:'login'})
        }
    }
</script>

<template>
    <h1>LogOut</h1>
</template>
<template>
    <h1 class="red">{{ msg }}</h1>
</template>

<style scoped>
    .red {
        color: #f00;
    }
</style>

<script>
    module.exports = {
        props: {
            msg: {
                type: String,
                default: process.env.LOCATION === "ja" ? "こんにちは" : 'Hello world!'
            }
        }
    };
</script>
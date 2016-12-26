<template>
    <h1 class="red">{{ msg }}</h1>
</template>

<style scoped>
    /* root からの相対パスで書く */
    @import "src/setting";

    .red {
        color: var(--myColor);
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
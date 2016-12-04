const Vue = require("vue");
const testComponent = require("../../../components/dynamic/test-component.vue");

//Vue.component("test-component", testComponent);

new Vue({
    el: "#app",
    components: {
        "test-component": testComponent
    }
});
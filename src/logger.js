export default {
    log: function (message, args) {
        if (process.env.DEBUG === true || process.env.DEBUG === "true") {
            console.log(message, args);
        }
    }
}
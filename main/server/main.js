const app = require("./index");
const config = require("./config/config.json");

app(config.SERVER.PORT);

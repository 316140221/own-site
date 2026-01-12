const { intFromEnv } = require("./env.js");

const DEFAULT_PAGE_SIZE = 40;

module.exports = intFromEnv("PAGE_SIZE", DEFAULT_PAGE_SIZE, { min: 1, max: 200 });

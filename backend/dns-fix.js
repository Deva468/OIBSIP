const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("DNS servers:", dns.getServers());

require("./src/seed/pizzaData.js");

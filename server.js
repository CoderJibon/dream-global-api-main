const colors = require("colors");
const app = require("./app.js");
const { PORT } = require("./utils/secret.js");
const mongoDbConnection = require("./config/DBConnect.js");

// server listening

app.listen(PORT, async () => {
  await mongoDbConnection();

  `Server IS Running On Port ${PORT}`.bgCyan.black;
});

require("dotenv").config();
const app = require("./src/app");
const prisma = require("./src/config/prisma");

const PORT = process.env.PORT || 5000;

prisma.$connect()
  .then(() => {
    console.log("PostgreSQL connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("PostgreSQL connection error:", err);
    process.exit(1);
  });

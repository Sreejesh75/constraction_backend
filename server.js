const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

// --- MongoDB Connection ---
mongoose
  .connect("mongodb+srv://sreejeshos7510_db_user:Dbnode1405@cluster0.mih1sk8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error: ", err));

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes);
const projectRoutes = require("./routes/projectRoutes");
app.use("/api", projectRoutes);
const materialRoutes = require("./routes/materialRoutes");
app.use("/api", materialRoutes);
const summaryRoutes = require("./routes/summaryRoutes");
app.use("/api", summaryRoutes);



// --- Test Route ---
app.get("/", (req, res) => {
  res.send("Construction App Backend Running");
});

// --- Start Server ---
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


import "dotenv/config";
import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import libraryItemsRouter from "./routes/library-items.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import loansRouter from "./routes/loans.routes.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/categories", categoriesRouter);
app.use("/api/library-items", libraryItemsRouter);
app.use("/api/loans", loansRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", usersRouter);

app.get("/", (_req, res) => {
  res.json({
    message: "Bibliotekssystemets API fungerar!",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

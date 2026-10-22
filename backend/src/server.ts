import "dotenv/config";
import express from "express";
import cors from "cors";

import categoriesRouter from "./routes/categories.routes.js";
import libraryItemsRouter from "./routes/library-items.routes.js";
import uploadRouter from "./routes/upload.routes.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/categories", categoriesRouter);
app.use("/api/library-items", libraryItemsRouter);
app.use("/api/upload", uploadRouter);
app.get("/", (_req, res) => {
  res.json({
    message: "Bibliotekssystemets API fungerar!",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

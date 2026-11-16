import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  usersRouter,
  authRouter,
  categoriesRouter,
  libraryItemsRouter,
  uploadRouter,
  dashboardRouter,
  loansRouter,
  profileRouter,
} from "./index.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/library-items", libraryItemsRouter);
app.use("/api/loans", loansRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", usersRouter);
app.use("/api/profile", profileRouter);

app.get("/", (_req, res) => {
  res.json({
    message: "Bibliotekssystemets API fungerar!",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

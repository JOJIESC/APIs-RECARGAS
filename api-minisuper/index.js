import express from "express";
import { postRecarga } from "./recargasRoute.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors(
));
app.use(express.json());
app.post("/recargas", postRecarga);

app.listen(3001, () => {
  console.log("Servidor miniSuper corriendo en el puerto 3001");
});

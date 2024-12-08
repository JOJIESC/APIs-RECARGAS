import express from "express";
import dotenv from "dotenv";
import { postRecargaProveedor } from "./recargasRoute.js";

dotenv.config();
const app = express();
app.use(express.json());
app.post("/recargas", postRecargaProveedor);

app.listen(3002, () => {
  console.log("Servidor proveedores corriendo en el puerto 3002");
});

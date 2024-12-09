import mysql from "serverless-mysql";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const miniSuperDb = mysql({
  config: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: "miniSuper",
  },
});

export async function postRecarga(req, res) {
  try {
    console.log("Procesando solicitud POST...");

    const { phoneNumber, amount, providerId } = req.body;

    if (!phoneNumber || !amount || !providerId) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Inserción en la base de datos de MiniSuper
    const miniSuperResult = await miniSuperDb.query(
      `
      INSERT INTO transacciones (numero_telefono, monto, compania, fecha_hora, respuesta, id_proveedor)
      VALUES (?, ?, ?, NOW(), 'Pendiente', ?)
    `,
      [phoneNumber, amount, providerId === "1" ? "Bait" : providerId === "2" ? "Telcel" : "Movistar", providerId]
    );

    console.log("Transacción registrada en MiniSuper:", miniSuperResult);

    // Llamada a la API del proveedor
    const response = await axios.post("http://localhost:3002/recargas", {
      phoneNumber,
      amount,
      providerId,
      miniSuperTransactionId: miniSuperResult.insertId,
    });

    console.log("Respuesta del proveedor:", response.data);

    await miniSuperDb.end();

    res.json({
      message: "Recarga exitosa en MiniSuper y proveedor",
      miniSuperResult,
      providerResponse: response.data,
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    await miniSuperDb.end();
    res.status(500).json({ error: "Error interno al procesar la recarga" });
  }
}

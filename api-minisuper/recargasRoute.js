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
    console.log("Datos de la recarga:", phoneNumber, amount, providerId);

    if (!phoneNumber || !amount || !providerId) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    // Inserción en la base de datos de miniSuper
    const miniSuperResult = await miniSuperDb.query(
      `
      INSERT INTO transacciones (numero_telefono, monto, compania, fecha_hora, respuesta, id_proveedor)
      VALUES (?, ?, 'Pendiente', NOW(), ?, ?)
    `,
      [phoneNumber, amount, "Pendiente", providerId]
    ) ;

    console.log("Transacción registrada en miniSuper:", miniSuperResult);

    // Realiza la llamada a la API de proveedores
    const response = await axios.post("http://localhost:3002/recargas", {
      phoneNumber,
      amount,
      providerId,
      miniSuperTransactionId: miniSuperResult.insertId,
    });

    console.log("Respuesta de proveedores:", response.data);

    await miniSuperDb.end();

    return res.json({
      message: "Recarga exitosa en miniSuper y proveedor",
      miniSuperResult,
      providerResponse: response.data,
    });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);

    await miniSuperDb.end();

    return res
      .status(500)
      .json({
        error: "Error interno al procesar la recarga",
        details: error.message,
      });
  }
}

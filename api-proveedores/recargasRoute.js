import mysql from "serverless-mysql";
import dotenv from "dotenv";

dotenv.config();

const baitDb = mysql({
  config: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: "bait",
  },
});

const telcelDb = mysql({
  config: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: "telcel",
  },
});

const movistarDb = mysql({
  config: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: "movistar",
  },
});

export async function postRecargaProveedor(req, res) {
  try {
    console.log("Procesando solicitud POST para proveedor...");

    const { phoneNumber, amount, providerId, miniSuperTransactionId } = req.body;

    if (!phoneNumber || !amount || !providerId || !miniSuperTransactionId) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    let providerDb;
    let providerTable;
    if (providerId === "1") {
      providerDb = baitDb;
      providerTable = "recargas";
    } else if (providerId === "2") {
      providerDb = telcelDb;
      providerTable = "recargas";
    } else if (providerId === "3") {
      providerDb = movistarDb;
      providerTable = "recargas";
    } else {
      return res.status(400).json({ error: "Proveedor no válido" });
    }

    const providerResult = await providerDb.query(
      `
      INSERT INTO ${providerTable} (numero_telefono, monto, fecha_hora, estado, codigo_respuesta)
      VALUES (?, ?, NOW(), 'Pendiente', ?)
    `,
      [phoneNumber, amount, miniSuperTransactionId]
    );

    console.log(`Datos registrados en la base del proveedor ${providerTable}:`, providerResult);

    await providerDb.end();

    return res.json({ message: "Recarga exitosa en proveedor", providerResult });
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);

    await baitDb.end();
    await telcelDb.end();
    await movistarDb.end();

    return res.status(500).json({ error: "Error interno al procesar la recarga del proveedor", details: error.message });
  }
}

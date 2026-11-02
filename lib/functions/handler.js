import { v4 as uuidv4 } from "uuid";

export const newOrder = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event));

  const orderId = uuidv4();
  console.log("ID de orden generado:", orderId);

  let orderDetails;
  try {
    // Si envías el body desde Thunder Client como JSON, llega como string y se debe parsear
    orderDetails = event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    console.error("Error parsing order details:", error);
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Invalid order details" }),
    };
  }

  console.log("Detalles del pedido:", orderDetails);

  // Construimos el objeto del pedido completo
  const order = {
    orderId: orderId,
    ...orderDetails,
  };

  // Retornamos la estructura estricta que exige API Gateway
  return {
    statusCode: 201, // 201 es el código estándar para recursos creados con POST
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // Útil si más adelante conectas un Frontend
    },
    body: JSON.stringify({
      message: "Pedido creado exitosamente",
      order: order, // Aquí devolvemos el pedido completo en la respuesta
    }),
  };
};

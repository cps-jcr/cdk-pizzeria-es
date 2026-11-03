import { v4 as uuidv4 } from "uuid";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"

const sqsClient = new SQSClient();

export const newOrder = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event, null, 2));

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

  // Enviar mensaje a la cola de pedidos
  await sendMessageToSQS(order);

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

export const getOrder = async (event) => {
  console.log("Evento recibido:", JSON.stringify(event, null, 2));

  const orderId = event.pathParameters.orderId

  const orderDetails = {
    "pizza": "margarita",
    "customerId": 123,
    "order_status": "COMPLETED"
  };

  // Construimos el objeto del pedido completo
  const order = {
    orderId: orderId,
    ...orderDetails,
  };

  console.log("Orden leida:", order);

  // Retornamos la estructura estricta que exige API Gateway
  return {
    statusCode: 200, // 200 es el código estándar para recursos creados con GET
    body: JSON.stringify({
      message: "Orden leida exitosamente",
      order: order, // Aquí devolvemos el pedido completo en la respuesta
    }),
  };
};

export const prepOrder = async (event) => {
  console.log ("Evento recibido:", JSON.stringify(event, null, 2))

  return;
}

async function sendMessageToSQS(message) {

  const params = {
    QueueUrl: process.env.PENDING_ORDERS_QUEUE_URL,
    MessageBody: JSON.stringify(message)
  };

  console.log(JSON.stringify(params, null, 2));

  try {
    const command = new SendMessageCommand(params);
    const data = await sqsClient.send(command);
    console.log("Message sent succesfully:", data.MessageId);
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
  
}
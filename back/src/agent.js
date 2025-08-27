const { GoogleGenerativeAI } = require("@google/generative-ai");
const productsService = require("./services/products.service");
const cartsService = require("./services/carts.service");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const tools = {
  functionDeclarations: [
    {
      name: "getProducts",
      description: "Busca y lista productos. Se puede filtrar por un término de búsqueda.",
      parameters: {
        type: "OBJECT",
        properties: {
          query: {
            type: "STRING",
            description: 'Término para buscar productos, por ejemplo: "camiseta" o "pantalón deportivo".',
          },
        },
        required: [],
      },
    },
    {
      name: "createCart",
      description: "Crea un nuevo carrito de compras con una lista inicial de productos.",
      parameters: {
        type: "OBJECT",
        properties: {
          items: {
            type: "ARRAY",
            description: "Un array de objetos, donde cada objeto representa un producto a añadir.",
            items: {
              type: "OBJECT",
              properties: {
                product_id: { type: "NUMBER", description: "El ID del producto." },
                qty: { type: "NUMBER", description: "La cantidad de ese producto." },
              },
              required: ["product_id", "qty"],
            },
          },
        },
        required: ["items"],
      },
    },
    {
      name: "updateCart",
      description: "Actualiza un carrito de compras existente. Puede añadir, modificar o eliminar productos.",
      parameters: {
        type: "OBJECT",
        properties: {
          cartId: { type: "NUMBER", description: "El ID del carrito que se quiere modificar." },
          items: {
            type: "ARRAY",
            description: "Un array de objetos con los productos a actualizar. Para eliminar un item, usa qty: 0.",
            items: {
              type: "OBJECT",
              properties: {
                product_id: { type: "NUMBER", description: "El ID del producto." },
                qty: { type: "NUMBER", description: "La nueva cantidad del producto." },
              },
              required: ["product_id", "qty"],
            },
          },
        },
        required: ["cartId", "items"],
      },
    },
  ],
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  tools: [tools],
});
const chat = model.startChat();


const availableFunctions = {
  getProducts: async ({ query }) => {
    console.log(`Llamando al servicio para buscar productos con query: ${query}`);
    return await productsService.findAllProducts(query);
  },
  createCart: async ({ items }) => {
    console.log("Llamando al servicio para crear un carrito con items:", items);
    return await cartsService.create(items);
  },
  updateCart: async ({ cartId, items }) => {
    console.log(`Llamando al servicio para actualizar el carrito ${cartId} con items:`, items);
    return await cartsService.update(cartId, items);
  },
};

const runConversation = async (userInput) => {
  try {
    const result = await chat.sendMessage(userInput);
    const call = result.response.functionCalls()?.[0];

    if (call) {
      console.log("Gemini llama a la función:", call.name);
      const serviceResponse = await availableFunctions[call.name](call.args);

      const result2 = await chat.sendMessage([
        { functionResponse: { name: call.name, response: { result: serviceResponse } } },
      ]);

      return result2.response.text();
    }

    return result.response.text();
  } catch (error) {
    console.error("Error en la conversación con el agente:", error);
    return "Lo siento, algo salió mal al procesar tu solicitud.";
  }
};

module.exports = { runConversation };
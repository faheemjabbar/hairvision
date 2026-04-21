import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HairVision API",
      version: "1.0.0",
      description: "API documentation for HairVision FYP",
    },

    servers: [
      {
        url: "http://localhost:5000",
      },
    ],

    // 🔐 JWT AUTH ADDED HERE
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    // 🔐 Make JWT optional globally (you can override per route)
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./routes/*.js"], // route docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
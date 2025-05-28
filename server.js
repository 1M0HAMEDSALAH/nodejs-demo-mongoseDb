// const http = require("http");
// const app = require("./app.js");

// const port = process.env.PORT || 5000;

// const server = http.createServer(app);


// server.listen(port);



// server.js
const express = require("express");
const router = express.Router();

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation using Swagger",
    },
    servers: [{ url: "http://192.168.1.9:8000" }],
    components: {
         schemas: {
    Note: {
      type: "object",
      properties: {
        _id: { type: "string" },
        title: { type: "string" },
        content: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" }
        },
        isPinned: { type: "boolean" },
        userId: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" }
      }
    }
  },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./app.js"]
});


router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = router;
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SE Jobs API Documentation",
      version: "1.0.0",
      description: "API documentation for SE Jobs application",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./src/docs/swagger/*.docs.ts",
    "./src/docs/swagger/*.ts",
    "./src/docs/swagger/jobs/*.docs.ts",
    "./src/docs/swagger/jobs/*.ts",
  ],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };

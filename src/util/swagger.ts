import express from "express";
import swaggerUi from "swagger-ui-express";
import "reflect-metadata";
import swaggerJSDoc from "swagger-jsdoc";

/**
 * Swagger를 사용하도록 한다.
 * @param app Express Application
 */
export function useSwagger(app: express.Application) {
  // Parse class-validator classes into JSON Schema:
  const options = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "TOXIC MARKET PLACE API",
        version: "1.0.0",
        description: `<h2>Auth -> /getjwt/{지갑주소} API를 이용해 토큰 발급 가능합니다. </br> 경매 생성시 bid 값은 price 값과 동일해야 합니다.</h2>`
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
    schemes: ["http", "https"],
    servers: [
      {
        url: "http://localhost:4000",
      },
    ],
    apis: ["*/swagger/**/*Sw.yaml"],
  };
  const specs = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}

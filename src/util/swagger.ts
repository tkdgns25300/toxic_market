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
        title: "NFT wiki Api",
        version: "1.0.0",
        description: `<h2>근데 우리 문서까지 만들 시간이 없는 것 같긴 해 ㅎㅎ</h2>`
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

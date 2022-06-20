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
        description: `<h2>로그인 기능이 스웨거로 만들기에 많이 복작해서 현재 코인 포인트 교환 기능 말고 모든 기능은 로그인 없이 체크 가능합니다.</h2>`
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

import { App } from "./app";
import path from "path";

try {
  const app = new App();
  app.createExpressServer();
} catch (err) {
  console.log(err);
}

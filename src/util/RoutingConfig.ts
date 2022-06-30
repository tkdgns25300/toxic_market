export const routingControllerOptions = {
  cors: true,
  controllers: [`${__dirname}/../controller/**/*.{js,ts}`],
  middlewares: [`${__dirname}/../middlewares/*.{js,ts}`],
  validation: false,
};

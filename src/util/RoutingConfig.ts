export const routingControllerOptions = {
  cors: true,
  controllers: [`${__dirname}/../controller/**/*.ctrl.{js,ts}`],
  middlewares: [`${__dirname}/../middlewares/*.{js,ts}`],
  validation: false,
};

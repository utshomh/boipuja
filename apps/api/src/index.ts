import { serverEnv } from "@boipuja/config/server";

import { app } from "./app";

const host = serverEnv.API_HOST;
const port = serverEnv.API_PORT;

app.listen(port);

console.log(`Boipuja API running at http://${host}:${port}/api/v1`);
console.log(`OpenAPI docs available at http://${host}:${port}/api/v1/swagger`);

/*
- index.js file in backend folder contains puppeteer tool that actually
scans the amount of 3rd party resource types to figure out how much 
 app bloat a merchant's shopify website has 
 
- what to add: turn this into an api
*/
const fastify = require('fastify')({ logger: true });
const puppeteer = require('puppeteer');

// define the root route to test if the server is awake
fastify.get('/', async (request, reply) => {
  return { status: 'Latency-Lab API is online' };
});

// start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log("🚀 Server listening on http://localhost:3001");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
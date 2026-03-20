/*
- index.js file in backend folder contains puppeteer tool that actually
scans the amount of 3rd party resource types to figure out how much 
 app bloat a merchant's shopify website has 
 
- what to add: fastify api setup
*/
const fastify = require('fastify')({ logger: true });
const puppeteer = require('puppeteer');

// define the root route to test if the server is awake
fastify.get('/audit', async (request, reply) => {
  const targetUrl = request.query.url;
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  const report = { firstParty: 0, thirdParty: [] };
  const firstPartyDomains = ['shopify.com', 'shopifycdn.com', 'myshopify.com'];

  await page.setRequestInterception(true);
  page.on('request', (req) => req.continue());

  
  page.on('requestfinished', async (req) => {
    if (req.resourceType() === 'script') {
      const res = await req.response();
      if (res) {
        const timing = res.timing();
        const latency = timing ? timing.receiveHeadersEnd : 0;
        const scriptUrl = req.url();
        const hostname = new URL(scriptUrl).hostname;

        if (!firstPartyDomains.some(d => scriptUrl.includes(d)) && !targetUrl.includes(hostname)) {
          report.thirdParty.push({ hostname, ms: latency });
        } else {
          report.firstParty++;
        }
      }
    }
  });

  await page.goto(targetUrl, { waitUntil: 'networkidle2' });
  await browser.close();

  // Return data as JSON for the frontend
  return {
    site: targetUrl,
    summary: { core: report.firstParty, apps: report.thirdParty.length },
    slowestApps: report.thirdParty.sort((a, b) => b.ms - a.ms).slice(0, 10)
  };
});
// start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
    console.log("Server listening on http://localhost:3001");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
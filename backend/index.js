/*
- index.js file in backend folder contains puppeteer tool that actually
scans the amount of 3rd party resource types to figure out how much 
 app bloat a merchant's shopify website has 
 
*/
const fastify = require('fastify')({ logger: true });
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const awsLambdaFastify = require('@fastify/aws-lambda');


fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    engine: 'puppeteer',
    timestamp: new Date().toISOString()
  };
});

fastify.register(require('@fastify/cors'), {
  origin: "*" //frontend will talk to this api
});
// define the root route to test if the server is awake
fastify.get('/audit', async (request, reply) => {
  const apiKey = request.headers['x-api-key'];
  const SECRET = process.env.AUDIT_SECRET; // No hardcoded string!

  if (!apiKey || apiKey !== SECRET) {
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or missing API Key"
    });
  }
  let targetUrl = request.query.url;
  const deviceType = request.query.device || 'desktop';

  if (!targetUrl || targetUrl.trim() === "") {
    return reply.status(400).send({
      success: false,
      error: 'Bad Request',
      message: 'Please provide a URL. Example: /audit?url=https://gymshark.com'
    });
  }
  if (!targetUrl.startsWith('http')) {
    targetUrl = `https://${targetUrl}`;
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();

    if (deviceType === 'mobile') {

      // simulate 4G network throttling
      const client = await page.target().createCDPSession();
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150, // 150ms 4G latency
        downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6Mbps
        uploadThroughput: 750 * 1024 / 8,
      });
    }
    const report = { firstParty: 0, thirdParty: [] };
    const firstPartyDomains = ['shopify.com', 'shopifycdn.com', 'myshopify.com'];

    await page.setRequestInterception(true);
    page.on('request', (req) => req.continue());


    page.on('requestfinished', async (req) => {
      if (req.resourceType() === 'script') {
        const res = await req.response();
        if (res) {
          const timing = res.timing();
          const latency = timing ? (timing.receiveHeadersEnd - timing.sendStart) : 0;
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
    const isShopify = await page.evaluate(() => {
      // check for global Shopify object or the Shopify CDN link
      return !!(window.Shopify || document.querySelector('link[href*="cdn.shopify.com"]'));
    });

    if (!isShopify) {
      await browser.close(); //prevents crashing
      return reply.code(400).send({
        error: "Platform Mismatch",
        message: "This auditor is specifically tuned for Shopify. This site uses a different e-commerce stack!"
      });
    }
    await browser.close();

    // return data as JSON for the frontend
    return {
      site: targetUrl,
      summary: { core: report.firstParty, apps: report.thirdParty.length },
      slowestApps: report.thirdParty.sort((a, b) => b.ms - a.ms).slice(0, 10)
    };
  } catch (error) {

    if (browser) await browser.close();

    fastify.log.error(error); //error log
    return reply.code(500).send({
      error: 'Audit failed',
      message: error.message
    });
  }
});
const proxy = awsLambdaFastify(fastify);
exports.handler = async (event, context) => proxy(event, context);

// --- LOCAL SERVER START (for testing) ---
if (require.main === module) {
  const start = async () => {
    try {
      await fastify.listen({ port: 3001, host: '0.0.0.0' });
      console.log('Local Server running on port 3001');
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  start();
}
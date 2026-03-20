/*
- index.js file in backend folder contains puppeteer tool that actually
scans the amount of 3rd party resource types to figure out how much 
 app bloat a merchant's shopify website has 
 
- what to add: performance timer to show how many milliseconds for each 
3rd party resources/websites on the active shopify page
*/

const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting Latency-Lab Scanner...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = 'https://www.gymshark.com/'; 

  const firstPartyDomains = [
    'shopify.com',
    'shopifycdn.com',
    'gymshark.com', 
    'myshopify.com'
  ];

  //arrays to report first and third party websites/resources on site   
  const report = {
    firstParty: [],
    thirdParty: []
  };

  await page.setRequestInterception(true);
  page.on('request', (request) => request.continue());

  // Listen for when the download finishes to get the timing
  page.on('requestfinished', async (request) => {
    if (request.resourceType() === 'script')// filter cond to figure out app files that are slowing down a phone's processor
      {
      const response = await request.response();
      if (response) {
        const timing = response.timing();
        // receiveHeadersEnd tells us how long the network took to deliver the file
        const latency = timing ? timing.receiveHeadersEnd : 0;
        const scriptUrl = request.url();

        const isFirstParty = firstPartyDomains.some(domain => scriptUrl.includes(domain));
        
        if (!isFirstParty) {
          // We are now pushing an obj instead of just a str
          report.thirdParty.push({
            hostname: new URL(scriptUrl).hostname,
            ms: latency
          });
        } else {
          report.firstParty.push(scriptUrl);
        }
      }
    }
  });

  console.log(`Auditing scripts on ${url}...`); 
  
  await page.goto(url, { waitUntil: 'networkidle2' });

  console.log(`\n--- Audit Results for ${url} ---`);
  console.log(` Shopify/Core Scripts: ${report.firstParty.length}`);
  console.log(`Third-Party App Scripts: ${report.thirdParty.length}`);
  
const uniqueVillains = [...new Set(report.thirdParty.map(item => item.hostname))];

console.log(`\nTop 3rd-Party App Domains:`);

if (uniqueVillains.length === 0) {
  console.log("None to display");
} else {
  const sortedVillains = report.thirdParty
    .sort((a, b) => b.ms - a.ms)
    .filter((v, i, a) => a.findIndex(t => t.hostname === v.hostname) === i);

  console.log(`Hostname`.padEnd(30) + `| Latency (ms)`);
  console.log(`-`.repeat(45));

  sortedVillains.slice(0, 10).forEach(app => {
    console.log(`${app.hostname.padEnd(30)} | ${app.ms.toFixed(2)}ms`);
  });
}

  await browser.close();
})();
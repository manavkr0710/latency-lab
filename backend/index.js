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
  
const villains = [...new Set(report.thirdParty.map(item => item.hostname))];
  console.log(`\nTop 3rd-Party App Domains:`);

  if (villains.length == 0) {
    console.log("None to display")
  }
  else{
      villains.slice(0, 10).forEach(domain => console.log(`- ${domain}`));

  }

  await browser.close();
})();
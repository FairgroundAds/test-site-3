import fs from "fs";
import path from "path";

const srcDir = "./src";
const outDir = "./dist";
const CMS_API_URL = process.env.CMS_API_URL || "https://expd.thefairground.com/api";
const SITE_DOMAIN = process.env.SITE_DOMAIN || "test-site-3-7ah.pages.dev";
const PAGE_TITLE = "Welcome to Test Site 3";
const SITE_NAME = "Test Site 3";

// Fetch placements from CMS API
async function fetchPlacements() {
  try {
    const response = await fetch(`${CMS_API_URL}/placements/for-domain/${SITE_DOMAIN}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch placements from CMS: ${response.status}`);
      return {};
    }
    
    const data = await response.json();
    return data.placements || {};
  } catch (error) {
    console.error("Error fetching placements from CMS:", error.message);
    return {};
  }
}

// Main build process
(async () => {
  console.log(`Fetching link lists for ${SITE_DOMAIN} from ${CMS_API_URL}...`);
  
  const placements = await fetchPlacements();
  
  console.log('\n=== API RESPONSE ===');
  console.log(JSON.stringify(placements, null, 2));
  console.log('===================\n');
  
  if (Object.keys(placements).length === 0) {
    console.warn("No placements found. Using empty content.");
  } else {
    console.log(`Found ${Object.keys(placements).length} placement(s):`, Object.keys(placements));
  }

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Read the source HTML
  const srcHtml = path.join(srcDir, "index.html");
  let html = fs.readFileSync(srcHtml, "utf8");

  // Replace each placement variable with content from CMS
  // If no content, remove the placeholder entirely
  const allPlaceholders = ['__NAVIGATION__', '__INCONTENT__', '__SUBFOOTER__'];
  
  for (const placeholder of allPlaceholders) {
    const content = placements[placeholder] || '';
    console.log(`\nReplacing ${placeholder}:`);
    console.log(`Content length: ${content.length} characters`);
    console.log(`Preview: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}`);
    html = html.replaceAll(placeholder, content);
  }
  
  // Replace page title and site name
  html = html.replaceAll('__PAGE_TITLE__', PAGE_TITLE);
  html = html.replaceAll('__SITE_NAME__', SITE_NAME);
  
  console.log('\n=== BUILD SUMMARY ===');
  console.log(`Site: ${SITE_NAME}`);
  console.log(`Domain: ${SITE_DOMAIN}`);
  console.log(`Page Title: ${PAGE_TITLE}`);
  console.log(`Placements processed: ${Object.keys(placements).length}`);
  console.log('=====================\n');

  // Write to dist
  const outHtml = path.join(outDir, "index.html");
  fs.writeFileSync(outHtml, html);
  console.log(`Processed: ${srcHtml} -> ${outHtml}`);
  
  console.log("Build complete!");
})();

import fs from "fs";
import path from "path";

const srcDir = "./src";
const outDir = "./dist";
const CMS_API_URL = process.env.CMS_API_URL || "https://expd.thefairground.com/api";
const SITE_DOMAIN = process.env.SITE_DOMAIN || "test-site-3.pages.dev";

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
  for (const [key, value] of Object.entries(placements)) {
    html = html.replaceAll(`${key}`, value || '');
  }

  // Write to dist
  const outHtml = path.join(outDir, "index.html");
  fs.writeFileSync(outHtml, html);
  console.log(`Processed: ${srcHtml} -> ${outHtml}`);
  
  console.log("Build complete!");
})();

const sharp = require('sharp');
const fs = require('fs');

const sizes = [192, 512];

const svgBuffer = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#f97316" rx="64"/>
  <circle cx="256" cy="200" r="80" fill="white"/>
  <rect x="176" y="260" width="160" height="200" rx="20" fill="white"/>
  <line x1="180" y1="320" x2="332" y2="320" stroke="#f97316" stroke-width="8"/>
</svg>
`);

async function generateIcons() {
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`icon-${size}.png`);
    console.log(`Generated icon-${size}.png`);
  }
}

generateIcons().catch(console.error);

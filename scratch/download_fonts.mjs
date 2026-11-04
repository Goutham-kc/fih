import fs from 'fs';
import path from 'path';

const FONTS_DIR = path.resolve('public/fonts');
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

async function downloadFont(cssUrl, targetBaseName) {
  console.log(`Fetching CSS from: ${cssUrl}`);
  const res = await fetch(cssUrl, {
    headers: {
      // User agent that requests WOFF2
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  const css = await res.text();
  console.log('CSS preview:', css.slice(0, 200));

  // Extract font url
  const match = css.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format\(['"]woff2['"]\)/);
  if (!match) {
    throw new Error(`Could not find WOFF2 URL in CSS for ${targetBaseName}`);
  }
  const fontUrl = match[1];
  console.log(`Downloading font file: ${fontUrl}`);
  const fontRes = await fetch(fontUrl);
  const buffer = await fontRes.arrayBuffer();
  const filePath = path.join(FONTS_DIR, `${targetBaseName}.woff2`);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  console.log(`Saved ${targetBaseName}.woff2 (${buffer.byteLength} bytes)`);
}

async function run() {
  await downloadFont('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap', 'PressStart2P-Regular');
  await downloadFont('https://fonts.googleapis.com/css2?family=Silkscreen:wght@400&display=swap', 'Silkscreen-Regular');
  await downloadFont('https://fonts.googleapis.com/css2?family=Silkscreen:wght@700&display=swap', 'Silkscreen-Bold');
  console.log('All fonts downloaded successfully!');
}

run().catch((err) => {
  console.error('Error downloading fonts:', err);
  process.exit(1);
});

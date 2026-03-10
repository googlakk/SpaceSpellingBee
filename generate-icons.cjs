const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, 'public', 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generateIcons() {
    for (const size of sizes) {
        const outPath = path.join(__dirname, 'public', `icon-${size}x${size}.png`);
        await sharp(svgBuffer).resize(size, size).png().toFile(outPath);
        console.log(`✅ ${outPath}`);
    }

    // OG Image: 1200x630 — purple gradient with centered logo
    const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e1b4b"/>
        <stop offset="50%" style="stop-color:#312e81"/>
        <stop offset="100%" style="stop-color:#4c1d95"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <text x="600" y="230" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="96" font-weight="bold">🐝</text>
    <text x="600" y="360" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="72" font-weight="bold">Space Spelling Bee</text>
    <text x="600" y="440" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="36">Learn to spell in any language</text>
  </svg>`;

    await sharp(Buffer.from(ogSvg)).resize(1200, 630).png().toFile(path.join(__dirname, 'public', 'og-image.png'));
    console.log('✅ og-image.png');

    // Screenshot placeholders
    const mobileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844">
    <rect width="390" height="844" fill="#1e1b4b"/>
    <text x="195" y="300" text-anchor="middle" fill="white" font-family="Arial" font-size="48">🐝</text>
    <text x="195" y="380" text-anchor="middle" fill="white" font-family="Arial" font-size="28" font-weight="bold">SpellingBee</text>
    <text x="195" y="430" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial" font-size="18">Practice spelling anywhere</text>
  </svg>`;

    await sharp(Buffer.from(mobileSvg)).png().toFile(path.join(__dirname, 'public', 'screenshot-mobile.png'));
    console.log('✅ screenshot-mobile.png');

    const desktopSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
    <rect width="1920" height="1080" fill="#1e1b4b"/>
    <text x="960" y="440" text-anchor="middle" fill="white" font-family="Arial" font-size="72">🐝</text>
    <text x="960" y="540" text-anchor="middle" fill="white" font-family="Arial" font-size="56" font-weight="bold">Space Spelling Bee</text>
    <text x="960" y="610" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Arial" font-size="28">Interactive spelling practice for all languages</text>
  </svg>`;

    await sharp(Buffer.from(desktopSvg)).png().toFile(path.join(__dirname, 'public', 'screenshot-desktop.png'));
    console.log('✅ screenshot-desktop.png');

    console.log('\n🎉 All icons generated!');
}

generateIcons().catch(console.error);

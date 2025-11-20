#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * This script converts PNG images to WebP format for better performance.
 *
 * Prerequisites:
 * npm install sharp --save-dev
 *
 * Usage:
 * node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Image Optimization Script');
console.log('============================\n');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.error('❌ Error: sharp is not installed.');
  console.log('\nTo install sharp, run:');
  console.log('  npm install sharp --save-dev\n');
  process.exit(1);
}

const sharp = require('sharp');

// Images to convert
const imagesToConvert = [
  'src/assets/bee-hero.png',
  'src/assets/badges.png',
  'src/assets/celebration.png',
  'image.png'
];

async function optimizeImage(inputPath, quality = 80) {
  const outputPath = inputPath.replace('.png', '.webp');

  try {
    // Check if file exists
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${inputPath} (file not found)`);
      return;
    }

    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    await sharp(inputPath)
      .webp({ quality })
      .toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    console.log(`✅ Converted: ${inputPath}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   WebP: ${(newSize / 1024).toFixed(2)} KB`);
    console.log(`   Savings: ${savings}%\n`);
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error.message);
  }
}

async function main() {
  console.log('Converting PNG images to WebP format...\n');

  for (const imagePath of imagesToConvert) {
    await optimizeImage(imagePath);
  }

  console.log('✨ Image optimization complete!\n');
  console.log('📝 Note: Update your code to use .webp files with PNG fallbacks:');
  console.log('   <picture>');
  console.log('     <source srcSet="image.webp" type="image/webp" />');
  console.log('     <img src="image.png" alt="..." />');
  console.log('   </picture>\n');
}

main().catch(console.error);

#!/usr/bin/env node

/**
 * Скрипт для проверки наличия всех необходимых файлов перед публикацией
 * Запуск: node check-files.js
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  // Основные файлы
  { path: 'index.html', critical: true },
  { path: 'package.json', critical: true },
  { path: 'README.md', critical: true },
  { path: 'DEPLOYMENT.md', critical: true },
  { path: 'LICENSE', critical: true },

  // Конфигурация
  { path: '.env.example', critical: true },
  { path: '.gitignore', critical: true },

  // Иконки
  { path: 'public/icon-16x16.png', critical: true },
  { path: 'public/icon-32x32.png', critical: true },
  { path: 'public/icon-72x72.png', critical: true },
  { path: 'public/icon-96x96.png', critical: true },
  { path: 'public/icon-128x128.png', critical: true },
  { path: 'public/icon-144x144.png', critical: true },
  { path: 'public/icon-152x152.png', critical: true },
  { path: 'public/icon-192x192.png', critical: true },
  { path: 'public/icon-384x384.png', critical: true },
  { path: 'public/icon-512x512.png', critical: true },
  { path: 'public/favicon.ico', critical: true },

  // Open Graph
  { path: 'public/og-image.png', critical: true },

  // SEO
  { path: 'public/robots.txt', critical: true },
  { path: 'public/sitemap.xml', critical: true },
  { path: 'public/manifest.json', critical: true },

  // PWA
  { path: 'public/sw.js', critical: false },
];

console.log('\n🔍 Проверка файлов для публикации...\n');
console.log('━'.repeat(70));

let missingCritical = [];
let missingOptional = [];
let foundFiles = 0;
let totalFiles = REQUIRED_FILES.length;

REQUIRED_FILES.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  const exists = fs.existsSync(filePath);

  if (exists) {
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`✅ ${file.path.padEnd(40)} (${size} KB)`);
    foundFiles++;
  } else {
    if (file.critical) {
      console.log(`❌ ${file.path.padEnd(40)} КРИТИЧЕСКИ ВАЖНО!`);
      missingCritical.push(file.path);
    } else {
      console.log(`⚠️  ${file.path.padEnd(40)} Опционально`);
      missingOptional.push(file.path);
    }
  }
});

console.log('━'.repeat(70));
console.log(`\n📊 Статистика: ${foundFiles}/${totalFiles} файлов найдено\n`);

// Проверка .env
const envExists = fs.existsSync(path.join(process.cwd(), '.env'));
if (envExists) {
  console.log('✅ Файл .env существует');
} else {
  console.log('⚠️  Файл .env не найден (создайте из .env.example)');
}

// Проверка package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('\n📦 Package.json:');
  console.log(`   Название: ${packageJson.name}`);
  console.log(`   Версия: ${packageJson.version}`);
  console.log(`   Описание: ${packageJson.description || 'Не указано'}`);
} catch (error) {
  console.log('❌ Ошибка чтения package.json');
}

// Проверка index.html на метатеги
try {
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  const hasOgTags = indexHtml.includes('og:title') && indexHtml.includes('og:image');
  const hasTwitterTags = indexHtml.includes('twitter:card');
  const hasDescription = indexHtml.includes('meta name="description"');

  console.log('\n🏷️  Метатеги в index.html:');
  console.log(`   Open Graph: ${hasOgTags ? '✅' : '❌'}`);
  console.log(`   Twitter Card: ${hasTwitterTags ? '✅' : '❌'}`);
  console.log(`   Description: ${hasDescription ? '✅' : '❌'}`);
} catch (error) {
  console.log('❌ Ошибка чтения index.html');
}

// Итоги
console.log('\n' + '━'.repeat(70));

if (missingCritical.length === 0) {
  console.log('\n✅ ВСЕ КРИТИЧЕСКИ ВАЖНЫЕ ФАЙЛЫ НА МЕСТЕ!');
  console.log('\n📋 Следующие шаги:');
  console.log('   1. Откройте check-deployment-ready.html для финальной проверки');
  console.log('   2. Выполните npm run build');
  console.log('   3. Протестируйте с npm run preview');
  console.log('   4. Опубликуйте приложение!');
} else {
  console.log('\n❌ ВНИМАНИЕ! Отсутствуют критически важные файлы:\n');
  missingCritical.forEach(file => {
    console.log(`   • ${file}`);
  });
  console.log('\n📚 Инструкция:');
  if (missingCritical.some(f => f.includes('icon-'))) {
    console.log('   • Откройте generate-icons.html для создания иконок');
  }
  if (missingCritical.includes('public/og-image.png')) {
    console.log('   • Откройте generate-og-image.html для создания OG изображения');
  }
  if (missingCritical.includes('public/favicon.ico')) {
    console.log('   • Создайте favicon.ico (см. SETUP-INSTRUCTIONS.md)');
  }
  console.log('   • Прочитайте SETUP-INSTRUCTIONS.md для подробной инструкции');
}

if (missingOptional.length > 0) {
  console.log('\n⚠️  Опциональные файлы (не критично):');
  missingOptional.forEach(file => {
    console.log(`   • ${file}`);
  });
}

console.log('\n' + '━'.repeat(70) + '\n');

// Exit code
process.exit(missingCritical.length > 0 ? 1 : 0);

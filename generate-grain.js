// Generates a grain.webp texture using sharp
// Run: node generate-grain.js

const sharp = require('sharp');
const size = 256;

// Generate random noise buffer (grayscale)
const pixels = Buffer.alloc(size * size);
for (let i = 0; i < pixels.length; i++) {
  pixels[i] = Math.floor(Math.random() * 256);
}

sharp(pixels, {
  raw: { width: size, height: size, channels: 1 }
})
  .webp({ quality: 80 })
  .toFile('img/grain.webp')
  .then(() => console.log('grain.webp written to img/grain.webp'))
  .catch(err => console.error(err));

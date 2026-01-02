/**
 * Icon Generator for AccessiLens
 * Run with: node generate-icons.js
 * 
 * Creates simple PNG icons using Canvas.
 * Requires: npm install canvas
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');

    // Draw rounded rectangle
    const radius = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw accessibility symbol (simplified person icon)
    ctx.fillStyle = 'white';

    // Head
    const headRadius = size * 0.12;
    const headY = size * 0.25;
    ctx.beginPath();
    ctx.arc(size / 2, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.moveTo(size * 0.25, size * 0.4);
    ctx.lineTo(size * 0.75, size * 0.4);
    ctx.lineTo(size * 0.75, size * 0.48);
    ctx.lineTo(size * 0.58, size * 0.48);
    ctx.lineTo(size * 0.58, size * 0.9);
    ctx.lineTo(size * 0.42, size * 0.9);
    ctx.lineTo(size * 0.42, size * 0.48);
    ctx.lineTo(size * 0.25, size * 0.48);
    ctx.closePath();
    ctx.fill();

    // Arms
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = 'round';

    // Left arm
    ctx.beginPath();
    ctx.moveTo(size * 0.3, size * 0.44);
    ctx.lineTo(size * 0.15, size * 0.58);
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(size * 0.7, size * 0.44);
    ctx.lineTo(size * 0.85, size * 0.58);
    ctx.stroke();

    return canvas.toBuffer('image/png');
}

// Generate icons
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

sizes.forEach(size => {
    const buffer = generateIcon(size);
    fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);
    console.log(`Generated icon${size}.png`);
});

console.log('All icons generated successfully!');

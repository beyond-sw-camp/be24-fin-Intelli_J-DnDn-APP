#!/usr/bin/env node
import QRCode from "qrcode";

const url = process.argv[2];

if (!url) {
  console.error('Usage: node scripts/generate_qr.mjs "http://<your-pc-ip>:8090"');
  process.exit(1);
}

await QRCode.toFile("phone-preview-qr.png", url, { width: 512 });
console.log("QR code saved to phone-preview-qr.png");

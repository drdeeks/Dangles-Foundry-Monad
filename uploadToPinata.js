// uploadToPinata.js
// Batch upload all .jpeg images in public/metadata to Pinata
// Requires: npm install axios form-data dotenv

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const PINATA_API_KEY = process.env.PINATA_API_KEY || 'YOUR_PINATA_API_KEY';
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || 'YOUR_PINATA_SECRET_API_KEY';
const IMAGES_DIR = path.join(__dirname, 'public', 'metadata');

async function uploadImageToPinata(filePath) {
  const data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const headers = {
    ...data.getHeaders(),
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_SECRET_API_KEY,
  };

  try {
    const res = await axios.post(url, data, { headers });
    return res.data.IpfsHash;
  } catch (err) {
    console.error(`Failed to upload ${filePath}:`, err.response ? err.response.data : err.message);
    return null;
  }
}

async function main() {
  const files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpeg'));
  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    console.log(`Uploading ${file}...`);
    const cid = await uploadImageToPinata(filePath);
    if (cid) {
      console.log(`${file} uploaded: ipfs://${cid}`);
    }
  }
}

main();

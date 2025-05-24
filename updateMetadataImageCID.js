// updateMetadataImageCID.js
// Updates all metadata .json files in public/metadata to use the provided image CID
// Usage: node updateMetadataImageCID.js <IMAGE_CID>

const fs = require('fs');
const path = require('path');

const METADATA_DIR = path.join(__dirname, 'public', 'metadata');
const imageCID = process.argv[2];

if (!imageCID) {
  console.error('Usage: node updateMetadataImageCID.js <IMAGE_CID>');
  process.exit(1);
}

const files = fs.readdirSync(METADATA_DIR).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(METADATA_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const tokenId = file.replace('.json', '');
  data.image = `ipfs://${imageCID}/${tokenId}.jpeg`;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated image for ${file}`);
}

console.log('All metadata files updated with new image CID!');

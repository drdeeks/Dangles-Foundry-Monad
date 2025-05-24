// batchUploadToIPFS.js
// Uploads all images in public/metadata/ to IPFS, updates metadata files with IPFS links, and uploads metadata to IPFS.
// Usage: node batchUploadToIPFS.js

const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');
const path = require('path');

const NFT_STORAGE_KEY = '797b431b.0629c490a92c4cf38d4619a687217b39'; // Replace with your key
const METADATA_DIR = path.join(__dirname, 'public', 'metadata');

async function uploadImage(client, imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const imageFile = new File([imageData], path.basename(imagePath), { type: 'image/png' });
  const imageCid = await client.storeBlob(imageFile);
  return `ipfs://${imageCid}`;
}

async function main() {
  const client = new NFTStorage({ token: NFT_STORAGE_KEY });
  const files = fs.readdirSync(METADATA_DIR).filter(f => f.match(/^\d+\.json$/));
  for (const file of files) {
    const idx = file.replace('.json', '');
    const imagePath = path.join(METADATA_DIR, `${idx}.png`);
    if (!fs.existsSync(imagePath)) {
      console.warn(`Image not found for ${file}, skipping.`);
      continue;
    }
    console.log(`Uploading image ${imagePath}...`);
    const imageIpfsUrl = await uploadImage(client, imagePath);
    // Update metadata
    const metaPath = path.join(METADATA_DIR, file);
    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    metadata.image = imageIpfsUrl;
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
    // Upload metadata
    const metadataFile = new File([JSON.stringify(metadata)], file, { type: 'application/json' });
    console.log(`Uploading metadata ${file}...`);
    const metadataCid = await client.storeBlob(metadataFile);
    console.log(`Image IPFS: ${imageIpfsUrl}`);
    console.log(`Metadata IPFS: ipfs://${metadataCid}`);
  }
  console.log('Batch upload complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

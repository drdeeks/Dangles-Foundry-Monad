// Modernized uploadToIPFS.js for batch image upload using nft.storage storeDirectory
const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');
const path = require('path');

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY || 'YOUR_NFT_STORAGE_KEY';
const IMAGES_DIR = path.join(__dirname, 'public', 'metadata');

async function main() {
  const client = new NFTStorage({ token: NFT_STORAGE_KEY });
  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => f.endsWith('.jpeg'))
    .map(f => new File([
      fs.readFileSync(path.join(IMAGES_DIR, f))
    ], f, { type: 'image/jpeg' }));

  console.log(`Uploading ${files.length} images to IPFS...`);
  const cid = await client.storeDirectory(files);
  console.log('Batch image upload complete!');
  console.log('Image CID:', cid);
  console.log('Example image URI:', `ipfs://${cid}/1.jpeg`);
}

main().catch(e => { console.error(e); process.exit(1); });

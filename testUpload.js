const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');
const path = require('path');

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;
const filePath = path.join(__dirname, 'public', 'metadata', '1.jpeg');

console.log('NFT_STORAGE_KEY:', NFT_STORAGE_KEY);

async function main() {
  const client = new NFTStorage({ token: NFT_STORAGE_KEY });
  const data = fs.readFileSync(filePath);
  const file = new File([data], '1.jpeg', { type: 'image/jpeg' });
  const cid = await client.storeBlob(file);
  console.log('Uploaded single image CID:', cid);
}

main().catch(console.error);

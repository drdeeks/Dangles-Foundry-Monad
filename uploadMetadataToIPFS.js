const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');
const path = require('path');

const NFT_STORAGE_KEY = process.env.NFT_STORAGE_KEY;
const METADATA_DIR = path.join(__dirname, 'public', 'metadata');

async function main() {
  const client = new NFTStorage({ token: NFT_STORAGE_KEY });
  const files = fs.readdirSync(METADATA_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => new File([
      fs.readFileSync(path.join(METADATA_DIR, f))
    ], f, { type: 'application/json' }));

  console.log(`Uploading ${files.length} metadata files to IPFS...`);
  const cid = await client.storeDirectory(files);
  console.log('Batch metadata upload complete!');
  console.log('Metadata CID:', cid);
  console.log('Example metadata URI:', `ipfs://${cid}/1.json`);
}

main().catch(console.error);

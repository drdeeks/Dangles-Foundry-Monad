// generateRandomMetadataWithRarity.js
// 1. Uploads 18 unique images in public/metadata/ to IPFS and collects their CIDs.
// 2. Generates 1111 metadata files, assigning the first 18 as 1/1s, the rest randomly.
// 3. Adds a random set of items (from a common pool) to each NFT, and includes rarity for color and item type/style.
// Usage: node generateRandomMetadataWithRarity.js

const { Blob } = require('blob');
const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');
const path = require('path');

const NFT_STORAGE_KEY = '797b431b.0629c490a92c4cf38d4619a687217b39'; // Replace with your key
const METADATA_DIR = path.join(__dirname, 'public', 'metadata');
const TOTAL_NFTS = 1111;
const UNIQUE_COUNT = 18;

// New trait pools
const agePool = [4, 7, 12, 31];
const temperamentPool = [
  'Cocky',
  'Pessimistic',
  'Easily embarrased',
  'OCD',
  'Naive',
  'Nerd',
  'Secret Local Thug'
];
const specialAbilityPool = [
  'Massive Cock',
  'Micro penis',
  'Astronaught',
  'Vampire',
  'Airdrop Hunter',
  'Gmonad'
];
const weightPool = ['Heavy', 'Middle', 'Light'];
const heightPool = [
  'Just shy of "Dont Fuckin\' Worry About It!"',
  '4.4 ft',
  '3.7 ft',
  '5.0 ft',
  '3.98 ft'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function uploadImage(client, imagePath) {
  const imageData = fs.readFileSync(imagePath);
  // Use Blob from 'blob' package for Node.js compatibility
  const blob = new Blob([imageData], { type: 'image/jpeg' });
  const imageFile = new File([blob], path.basename(imagePath), { type: 'image/jpeg' });
  const metadata = await client.store({
    image: imageFile,
    name: path.basename(imagePath),
    description: 'Dangles NFT image upload'
  });
  return metadata.image.href || metadata.data.image.href || metadata.data.image;
}

async function main() {
  const client = new NFTStorage({ token: NFT_STORAGE_KEY });
  // Upload 18 unique images
  const imageLinks = [];
  for (let i = 1; i <= UNIQUE_COUNT; i++) {
    const imgPath = path.join(METADATA_DIR, `${i}.jpeg`);
    if (!fs.existsSync(imgPath)) {
      throw new Error(`Image not found: ${imgPath}`);
    }
    console.log(`Uploading ${imgPath}...`);
    const ipfsUrl = await uploadImage(client, imgPath);
    imageLinks.push(ipfsUrl);
    console.log(`Uploaded: ${ipfsUrl}`);
  }
  // Generate 1111 metadata files
  for (let i = 1; i <= TOTAL_NFTS; i++) {
    let imgIdx;
    if (i <= UNIQUE_COUNT) {
      imgIdx = i - 1; // 1/1s
    } else {
      imgIdx = Math.floor(Math.random() * UNIQUE_COUNT); // random
    }
    const attributes = [
      { trait_type: 'Age', value: getRandom(agePool) },
      { trait_type: 'Temperament', value: getRandom(temperamentPool) },
      { trait_type: 'Special Ability', value: getRandom(specialAbilityPool) },
      { trait_type: 'Weight', value: getRandom(weightPool) },
      { trait_type: 'Height', value: getRandom(heightPool) }
    ];
    const metadata = {
      name: `Dangles #${i}`,
      description: 'Dangles is a good-natured but self-conscious donkey with extraordinarily long, swinging testicles. Known for his awkward but determined jumps, Dangles is a beloved character with a unique backstory and personality. See the game for more details!',
      image: imageLinks[imgIdx],
      attributes: attributes
    };
    fs.writeFileSync(path.join(METADATA_DIR, `${i}.json`), JSON.stringify(metadata, null, 2));
  }
  console.log('All metadata files with new traits and rarity generated!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

// forceUpdateMetadata.js
// Overwrites all public/metadata/*.json files with new trait structure and random values (no image upload)

const fs = require('fs');
const path = require('path');

const METADATA_DIR = path.join(__dirname, 'public', 'metadata');
const TOTAL_NFTS = 19; // Change to 1111 for full collection
const UNIQUE_COUNT = 18; // Number of unique images

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

for (let i = 1; i <= TOTAL_NFTS; i++) {
  let imgIdx = (i <= UNIQUE_COUNT) ? i : (Math.floor(Math.random() * UNIQUE_COUNT) + 1);
  const metadata = {
    name: `Dangles #${i}`,
    description: 'Dangles is a good-natured but self-conscious donkey with extraordinarily long, swinging testicles. Known for his awkward but determined jumps, Dangles is a beloved character with a unique backstory and personality. See the game for more details!',
    image: `ipfs://REPLACE_WITH_IMAGE_CID/${imgIdx}.jpeg`,
    attributes: [
      { trait_type: 'Age', value: getRandom(agePool) },
      { trait_type: 'Temperament', value: getRandom(temperamentPool) },
      { trait_type: 'Special Ability', value: getRandom(specialAbilityPool) },
      { trait_type: 'Weight', value: getRandom(weightPool) },
      { trait_type: 'Height', value: getRandom(heightPool) }
    ]
  };
  fs.writeFileSync(path.join(METADATA_DIR, `${i}.json`), JSON.stringify(metadata, null, 2));
}

console.log('All metadata files force-updated with new traits and random values.');

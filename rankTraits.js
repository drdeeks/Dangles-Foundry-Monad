// rankTraits.js
// Calculates rarity scores and ranks for NFT metadata files in public/metadata/
// Usage: node rankTraits.js

const fs = require('fs');
const path = require('path');

const METADATA_DIR = path.join(__dirname, 'public', 'metadata');

function getAllMetadataFiles() {
  return fs.readdirSync(METADATA_DIR).filter(f => f.endsWith('.json'));
}

function loadAllMetadata(files) {
  return files.map(f => JSON.parse(fs.readFileSync(path.join(METADATA_DIR, f), 'utf-8')));
}

function countTraitFrequencies(metadataList) {
  const traitCounts = {};
  let totalNFTs = metadataList.length;
  for (const meta of metadataList) {
    for (const attr of meta.attributes) {
      const key = `${attr.trait_type}:${attr.value}`;
      traitCounts[key] = (traitCounts[key] || 0) + 1;
    }
  }
  return { traitCounts, totalNFTs };
}

function calculateRarityScore(meta, traitCounts, totalNFTs) {
  let score = 0;
  for (const attr of meta.attributes) {
    const key = `${attr.trait_type}:${attr.value}`;
    const freq = traitCounts[key] || 1;
    score += 1 / (freq / totalNFTs); // Higher score for rarer traits
  }
  return score;
}

function main() {
  const files = getAllMetadataFiles();
  const metadataList = loadAllMetadata(files);
  const { traitCounts, totalNFTs } = countTraitFrequencies(metadataList);

  // Calculate rarity scores
  const scores = metadataList.map(meta => calculateRarityScore(meta, traitCounts, totalNFTs));

  // Rank NFTs (higher score = rarer)
  const sorted = scores
    .map((score, i) => ({ i, score }))
    .sort((a, b) => b.score - a.score);
  const ranks = Array(scores.length);
  sorted.forEach((item, idx) => {
    ranks[item.i] = idx + 1;
  });

  // Update metadata files
  metadataList.forEach((meta, i) => {
    meta.rarity_score = scores[i];
    meta.rank = ranks[i];
    fs.writeFileSync(path.join(METADATA_DIR, files[i]), JSON.stringify(meta, null, 2));
  });

  console.log('Rarity scores and ranks added to metadata files.');
}

main();

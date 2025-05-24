# Dangles-Foundry-Monad

## Project Overview

This project is a full-stack Ethereum dApp and game built with Foundry (Solidity smart contracts), Node.js/Express (backend server), and a browser-based game frontend. It includes:
- Upgradeable and standard NFT smart contracts
- Deployment scripts
- A browser game that interacts with the blockchain
- User wallet connection and NFT gating

---

## File/Directory Structure & Descriptions

- **src/**
  - `UpgradeableDanglesNFT.sol`: Upgradeable ERC721 NFT contract using OpenZeppelin upgradeable modules and UUPS proxy pattern. Used for NFT minting and upgrades.
  - `DanglesNFT.sol`: Standard (non-upgradeable) ERC721 NFT contract for basic NFT minting.

- **script/**
  - `DeployUpgradeableDanglesNFT.s.sol`: Forge script to deploy the upgradeable NFT contract and its proxy. Handles initialization.
  - `DeployDanglesNFT.s.sol`: Forge script to deploy the standard NFT contract.

- **public/**
  - `index.html`: Main HTML file for the browser game. Contains overlays for sign-in, wallet connection, and game UI. User input fields/buttons are here.
  - `game.js`: Main JavaScript for the game logic, wallet connection, NFT checks, and UI state. Handles all user interactions and blockchain calls.
  - `donkeyCharacter.js`: Contains the donkey character's backstory and related data, loaded as a global variable for the game.
  - `styles.css`: CSS for the game and overlays.
  - `sounds/`: Directory for game sound effects (e.g., donkey_heehaw.mp3).

- **lib/**
  - `openzeppelin-contracts/`, `openzeppelin-contracts-upgradeable/`, `forge-std/`: External dependencies installed via Forge for smart contract development and testing.

- **server.js**: Node.js Express server to serve static files from `public/` on http://localhost:3000.

- **foundry.toml**: Foundry configuration file (Solidity version, remappings, RPC URL, etc.).

- **remappings.txt**: Explicit remappings for Solidity imports.

- **example.env**: Template for environment variables (private key, RPC URLs, API keys, etc.). **Do not commit your real .env file!**

---

## User Input Fields & Locations

- **public/index.html**
  - **Sign In Overlay**: 
    - `#guestBtn`: Button to continue as guest.
    - `#walletBtn`: Button to sign in with an Ethereum wallet (MetaMask, etc.).
  - **Start Overlay**:
    - `#startBtn`: Button to start the game (after sign-in).
    - `#disconnectBtn`: Button to disconnect wallet.
  - **Welcome Overlay**:
    - `#proceedBtn`: Button to continue to the game after the welcome screen.
  - **Game Canvas**: No direct input fields, but keyboard and mouse events are handled in `game.js`.

---

## Deployment & Usage Instructions

### 1. Install Dependencies
- Install [Foundry](https://book.getfoundry.sh/getting-started/installation) and Node.js.
- In the project root, run:
  ```sh
  forge install
  npm install
  ```

### 2. Configure Environment Variables
- Copy `example.env` to `.env` and fill in your private key, RPC URLs, and API keys.
- **Never commit your real .env file!**

### 3. Build & Test Smart Contracts
- Build contracts:
  ```sh
  forge build
  ```
- Run tests:
  ```sh
  forge test
  ```

### 4. Deploy Contracts
- Deploy the upgradeable NFT contract:
  ```sh
  forge script script/DeployUpgradeableDanglesNFT.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast
  ```
- Deploy the standard NFT contract:
  ```sh
  forge script script/DeployDanglesNFT.s.sol --rpc-url <YOUR_RPC_URL> --private-key <YOUR_PRIVATE_KEY> --broadcast
  ```
- Update `NFT_CONTRACT_ADDRESS` in `public/game.js` with your deployed contract address.

### 5. Run the Game Locally
- Start the server:
  ```sh
  node server.js
  ```
- Open your browser to [http://localhost:3000](http://localhost:3000)

### 6. Using the Game
- On load, you'll see the sign-in overlay. Choose guest or wallet sign-in.
- If you sign in with a wallet, MetaMask (or another wallet) will prompt you to connect.
- Only users who own a Dangles NFT can play the game.
- Use the on-screen buttons and keyboard to play.

---

## Updating & Customizing
- To update contract logic, edit files in `src/` and re-deploy using the scripts in `script/`.
- To update the game, edit `public/game.js`, `public/index.html`, or `public/styles.css`.
- To add or change sounds, update files in `public/sounds/`.
- To change the donkey character's backstory, edit `public/donkeyCharacter.js`.

---

## Notes
- All user input fields are in `public/index.html` as described above.
- Wallet connection requires MetaMask or a compatible browser wallet.
- For production, deploy your static site to Vercel, Netlify, or similar, and your contracts to Ethereum or Monad.
- For Vercel, set environment variables in the dashboard (see `example.env` for names).

---

For more help, see the Foundry Book: https://book.getfoundry.sh/

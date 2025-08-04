const { ethers } = require('ethers');
const fs = require('fs');

// Prayer Hand Emoji NFT Contract
const CONTRACT_SOURCE = `// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact alec@quicktop8.com
contract PrayerHandEmoji is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("PrayerHandEmoji", "PRAY")
        Ownable(initialOwner)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "https://quicktop8-alpha.vercel.app/api/metadata/";
    }

    function safeMint(address to, string memory uri)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    // The following functions are overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}`;

async function deployContract() {
  try {
    console.log('🚀 Deploying Prayer Hand Emoji NFT Contract to Base...');
    
    // Base network configuration
    const BASE_RPC = 'https://mainnet.base.org';
    const BASE_CHAIN_ID = 8453;
    
    // You would need to set these environment variables
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS;
    
    if (!PRIVATE_KEY || !DEPLOYER_ADDRESS) {
      console.log('❌ Please set PRIVATE_KEY and DEPLOYER_ADDRESS environment variables');
      console.log('💡 Example: PRIVATE_KEY=0x... DEPLOYER_ADDRESS=0x... node deploy-contract.js');
      return;
    }
    
    // Connect to Base network
    const provider = new ethers.JsonRpcProvider(BASE_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log('📡 Connected to Base network');
    console.log('👤 Deployer address:', DEPLOYER_ADDRESS);
    
    // Contract deployment would go here
    // For now, we'll just show the contract source and deployment instructions
    console.log('\n📄 Contract Source:');
    console.log(CONTRACT_SOURCE);
    
    console.log('\n📋 Deployment Instructions:');
    console.log('1. Install OpenZeppelin Contracts: npm install @openzeppelin/contracts');
    console.log('2. Compile the contract with Hardhat or Foundry');
    console.log('3. Deploy to Base mainnet with your private key');
    console.log('4. Update the contract address in the frontend');
    
    console.log('\n🔗 Base Network Info:');
    console.log('- RPC URL:', BASE_RPC);
    console.log('- Chain ID:', BASE_CHAIN_ID);
    console.log('- Explorer: https://basescan.org');
    
    console.log('\n✅ Contract ready for deployment!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

// Save contract source to file
fs.writeFileSync('PrayerHandEmoji.sol', CONTRACT_SOURCE);
console.log('📄 Contract source saved to PrayerHandEmoji.sol');

deployContract(); 
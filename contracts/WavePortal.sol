// SPDX-License-Identifier: UNLICENSED

// So this is the smart contract - it's kinda like our server's code with different functions people can hit.
// It's hosted on the blockchain, kinda a cloud provider such as AWS, but it's owned by no one

pragma solidity ^0.8.0; // This is what interacts with the BC and Ethereum wallets

import "hardhat/console.sol";

contract WavePortal { 
    uint256 totalWaves;
    uint256 private seed; // This helps generating a random number

    event NewWave(address indexed from, uint256 timestamp, string message);

    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
    }

    Wave[] waves; // Holds all the waves anyone ever sends to me

    mapping(address => uint256) public lastWavedAt; // Associate the address of the last waver with a number

    constructor() payable {
        console.log("Iteraction with the smart contract started - Roll on summer as long as it snows"); // This is the log rendered when contract deployed
        seed = (block.timestamp + block.difficulty) % 100; // Set the initial seed
    }

    function wave(string memory _message) public {

        /*
         * 
         */
        require( // Make sure the current timestamp is at least 5-minutes bigger than the last timestamp we stored
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp, "Must wait 30 seconds before waving again."
        );

        lastWavedAt[msg.sender] = block.timestamp; // Update the current timestamp we have for the user

        totalWaves += 1;
        console.log("%s has waved!", msg.sender);

        waves.push(Wave(msg.sender, _message, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100; // Generate a new seed for the next user that sends a wave
        
        // console.log("Random # generated: %d", seed); // Give the random number generated

        if (seed <= 50) { // Give a 50% chance that the user wins the prize.
            console.log("%s won!", msg.sender);

            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewWave(msg.sender, block.timestamp, _message);

    }

    function getAllWaves() public view returns (Wave[] memory) { // Retrieve the waves from the website
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total waves!", totalWaves); // Makes the contract print the value!
        return totalWaves;
    }
}


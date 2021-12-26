// So far what it does:
//1. Creates a new local Ethereum network.
//2. Deploy your contract.
//3. Then, when the script ends Hardhat will automatically destroy that local network.

const main = async () => {
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  const waveContract = await waveContractFactory.deploy({
    value: hre.ethers.utils.parseEther('0.1'),
  });
  await waveContract.deployed();
  console.log('Contract addy:', waveContract.address); // To see the address of the person interacting with the contract

  //let waveCount;
  //waveCount = await waveContract.getTotalWaves();
  //console.log(waveCount.toNumber());

  /*
   * Get Contract balance
   */
  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  /**
   * Send Wave
   */
  let waveTxn = await waveContract.wave('A message!');
  await waveTxn.wait(); // Wait for the transaction to be mined

  //const [_, randomPerson] = await hre.ethers.getSigners();  // We grab the wallet address of contract owner + a random one
  //waveTxn = await waveContract.connect(randomPerson).wave('Another message!');
  //await waveTxn.wait(); // Wait for the transaction to be mined

  /*
   * Get Contract balance to see what happened!
   */
  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allWaves = await waveContract.getAllWaves();
  console.log(allWaves);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const [allWaves, setAllWaves] = useState([]); 

  const contractAddress = "0x5ca5719B327e1870085A7D41b31358A9B2f325c3";

  const contractABI = abi.abi

  const [messageValue, setMessageValue] = React.useState("")

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and  in our UI so let's
         * pick those out
         */
        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log('NewWave', from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on('NewWave', onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off('NewWave', onNewWave);
    }
  };
}, []);


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(messageValue, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          Anchor your intuitions in blockchain
        </div>

        <div className="bio">

          <br/> 
          Hey there! 👋🏻 I'm Cam and I worked on a web3 app designed to store in the blockchain your thoughts and guesses on what will happen in the future. 
          I like to think that a dream written next to a date often becomes reality so <b> connect your Metamask wallet and start making things happen! 🚀</b>
          <br/> <br/>

        </div>

        {!currentAccount && (
          <span style={{color:'Red'}}> ⚠️ You must have a Metamask wallet. <br/> <br/></span>
        )}

        {
          currentAccount ? (<textarea name="messageArea" className='form-control'
            placeholder="Type your prediction here..."
            type="text"
            id="message"
            value={messageValue}
            onChange={e => setMessageValue(e.target.value)} />) : null
        } 

        <button className="waveButton" onClick={wave}>
          Send to blockchain 
        </button>

        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            Connect your wallet
          </button>
        )}

        {currentAccount && (
        <div className="pred">
        <br/> <br/>
        <u>Predictions made by others:</u>
        <br/> <br/>
        </div>
        )}

       {allWaves.map((message, index) => {
          return (
            <div key={index} className="predictions">
              <div>Account: {message.address}</div>
              <div>Time: {message.timestamp.toString()}</div>
              <div>Prediction: {message.message}</div>
            </div>)
        })}

      <br/> <br/><br/> <br/>
      </div>
    </div>
  );
}

export default App
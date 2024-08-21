import React, { useState, useEffect } from "react";
import StakingPlatform from "../src/build/contracts/StakingPlatform.json"; // Adjust path as needed
const ethers = require("ethers");

const contractAddress = StakingPlatform.networks[5777].address; // Replace with your deployed contract address
const contractABI = StakingPlatform.abi;

const App = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [contractBalance, setContractBalance] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [stakeData, setStakeData] = useState({amount: 0, reward: 0});

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
          // Request account access if needed - get accounts
          await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          // get provider
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);

          // Get the signer (the active account in MetaMask)
          const signer = web3Provider.getSigner();
          const stakingContract = new ethers.Contract(contractAddress, contractABI, signer);
          setContract(stakingContract);

          // Get the account address
          const accounts = await web3Provider.listAccounts();
          setAccount(accounts[0]);
          
          // Get the account balance
          const balance = await web3Provider.getBalance(accounts[0]);
          setBalance(ethers.utils.formatEther(balance));

          //listen to account changes
           window.ethereum.on('accountsChanged', async (accounts) => {
            setAccount(accounts[0]);
            const newBalance = await web3Provider.getBalance(accounts[0]);
            setBalance(ethers.utils.formatEther(newBalance));
          });

        } catch (error) {
          console.error("Failed to connect to MetaMask:", error);
        }
      } else {
        console.error("MetaMask is not installed!");
      }
    };
    initializeWeb3();
  }, []);

  const handleStake = async () => {
    if (contract && stakeAmount) {
      try {
        const tx = await contract.stake({
          value: ethers.utils.parseEther(stakeAmount),
        });
        await tx.wait();
        alert("Stake successful!");

        const newBalance = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(newBalance));
        getContractBalance();
        
      } catch (error) {
        console.error("Stake failed:", error);
        alert("Stake Failed! : " + error);
      }
    } else {
      alert("Stake Failed! : Null Amount / Contract Not found");
    }
  };

  const handleUnstake = async () => {
    if (contract) {
      try {
        const tx = await contract.unstake();
        await tx.wait();
        alert("Unstake successful!");

        const newBalance = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(newBalance));
        getContractBalance();

      } catch (error) {
        console.error("Unstake failed:", error);
        alert("Unstake Failed! : " + error);
      }
    } else{
      alert("Unstake Failed! : Contract Not Found");
    }
  };

  const getContractBalance = async () => {
    if (contract) {
      try {
        const balance = await contract.getContractBalance();
        setContractBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Failed to fetch contract balance:", error);
        alert("Failed to fetch contract balance! : " + error);
      }
    } else{
      alert("Contract not found!");
    }
  };
  
  const calcReward = async () => {
    if (contract && account) {
      try {
        const rewards = await contract.calculateReward(account);
          setRewards(ethers.utils.formatEther(rewards));
        } catch (error) {
          console.error("Failed to fetch reward details:", error);
          alert("Failed to fetch rewards! : " + error);
        }
    } else{
      alert("Failed to fetch rewards! : Address null / Contract Not Found");
    }
  };

  const getStakeDetails = async () => {
    if (contract && account) {
      try {
        const stake = await contract.getStakingDetails(account);
        const stakeAmountFetch = ethers.utils.formatEther(stake[0]);
        setStakeData({amount: stakeAmountFetch});
        } catch (error) {
          console.error("Failed to fetch reward details:", error);
          alert("Failed to fetch rewards! : " + error);
        }
    } else{
      alert("Failed to fetch rewards! : Address null / Contract Not Found");
    }
  };

  return (
    <div>
      <h1>Staking DApp</h1>
      {account ? (
        <div>
          <p>Account: {account}</p>
          <p>Balance: {balance} ETH</p>
          <p>Contract Balance: {contractBalance} ETH</p>
          <p>Rewards: {rewards} ETH</p>
          <p>Stake Amount: {stakeData.amount} ETH</p>
          
          <input
            type="text"
            placeholder="Amount to stake"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />
          <button onClick={handleStake}>Stake</button>
          <button onClick={handleUnstake}>Unstake</button>
          <button onClick={calcReward}>Calculate Reward</button>

          <button onClick={getContractBalance}>Fetch Contract Balance</button>
          <button onClick={getStakeDetails}>Get Staking Details</button>
        
        </div>
      ) : (
        <p>Please connect to MetaMask.</p>
      )}
    </div>
  );
};

export default App;

/* global BigInt */
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import RentAgreementArtifact from "./artifacts/contracts/RentAgreement.sol/RentAgreement.json";
import "./App.css";

// NOTE: Update this after deploying to localhost or Sepolia
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

function App() {
  // Removed unused provider/signer states to fix "assigned but never used" errors
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isLandlord, setIsLandlord] = useState(false);

  // Form State
  const [tenantAddress, setTenantAddress] = useState("");
  const [duration, setDuration] = useState(60); // seconds
  const [interval, setInterval] = useState(10); // seconds
  const [rentAmount, setRentAmount] = useState("0.01"); // ETH
  const [file, setFile] = useState(null);
  
  // Contract State
  const [agreementDetails, setAgreementDetails] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // 1. Connect Wallet on Load
  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const _provider = new ethers.BrowserProvider(window.ethereum);
          const _signer = await _provider.getSigner();
          const _account = await _signer.getAddress();
          
          const _contract = new ethers.Contract(
            contractAddress,
            RentAgreementArtifact.abi,
            _signer
          );
    
          setContract(_contract);
          setAccount(_account);
          
          // Fetch details immediately after connecting
          fetchAgreementDetails(_contract, _account);
        } catch (err) {
          console.error("User denied connection or error", err);
        }
      } else {
        alert("Please install MetaMask!");
      }
    };

    connectWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 2. Automation Loop
  useEffect(() => {
    const checkAndReleaseRent = async () => {
      try {
        if (!contract) return;
        const isOver = await contract.isDurationOver();
        if (isOver) {
          setStatusMessage("Duration of stay is over for the tenant.");
          return;
        }
        // Just logging for automation simulation
        console.log("Checking system status...");
      } catch (err) {
        console.log("Rent not due yet or error checking");
      }
    };

    const intervalId = setInterval(async () => {
      if (contract && agreementDetails && agreementDetails.fullyPaidByTenant) {
        checkAndReleaseRent();
      }
    }, 5000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, agreementDetails]);

  const fetchAgreementDetails = async (_contract, _account) => {
    try {
      const details = await _contract.agreement();
      if (details.landlord !== ethers.ZeroAddress) {
        // Store ALL details including financial data
        setAgreementDetails({
          landlord: details.landlord,
          tenant: details.tenant,
          active: details.active,
          fullyPaidByTenant: details.fullyPaidByTenant,
          duration: details.duration,           // Add this
          interval: details.interval,           // Add this
          rentPerInterval: details.rentPerInterval // Add this
        });
        
        if (_account.toLowerCase() === details.landlord.toLowerCase()) {
          setIsLandlord(true);
        }
      }
    } catch (err) {
      console.log("No agreement yet");
    }
  };

  const uploadToPinata = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data.IpfsHash;
    } catch (error) {
      console.error("Pinata upload error:", error);
      alert("Failed to upload PDF");
      return null;
    }
  };

  const finalizeAgreement = async () => {
    if (!contract) return;
    try {
      setStatusMessage("Uploading Agreement to IPFS...");
      const ipfsHash = await uploadToPinata();
      if (!ipfsHash) return;

      setStatusMessage("Creating Smart Contract Agreement...");
      const weiAmount = ethers.parseEther(rentAmount);
      
      const tx = await contract.createAgreement(
        tenantAddress,
        duration,
        interval,
        weiAmount,
        ipfsHash
      );
      await tx.wait();
      alert("Agreement Finalized!");
      fetchAgreementDetails(contract, account);
      setStatusMessage("Waiting for Tenant to Pay...");
    } catch (err) {
      console.error(err);
      alert("Error creating agreement");
    }
  };

  const payRentAsTenant = async () => {
    if (!contract || !agreementDetails) return;
    try {
      // USE VALUES FROM CONTRACT, NOT FROM STATE
      const durationBig = agreementDetails.duration;
      const intervalBig = agreementDetails.interval;
      const rentPerIntervalBig = agreementDetails.rentPerInterval;

      // Calculate Total: (Duration / Interval) * RentPerInterval
      // Note: In Solidity 60/10 = 6. 
      const totalIntervals = durationBig / intervalBig; 
      const totalWei = rentPerIntervalBig * totalIntervals;

      console.log("Paying Amount (Wei):", totalWei.toString()); // Debug log

      const tx = await contract.fundAgreement({ value: totalWei });
      await tx.wait();
      alert("Full Rent Paid to Contract!");
      fetchAgreementDetails(contract, account);
    } catch (err) {
      console.error("Payment Error:", err); // Check console for specific error
      alert("Payment Failed: Check Console for details");
    }
  };

  const manualTriggerRelease = async () => {
      try {
          const tx = await contract.releaseRent();
          await tx.wait();
          alert("Rent Received from Tenant (Released from Contract)!");
      } catch(err) {
          console.error(err);
          alert("Rent not due yet or Duration Over");
      }
  }

  return (
    <div className="App">
      <h1>Blockchain Rent Payment</h1>
      <p>Connected: {account}</p>
      {isLandlord && <span className="landlord-badge">LANDLORD</span>}

      {!agreementDetails ? (
        <div className="landlord-setup">
            <h2>Landlord Setup</h2>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
            <input placeholder="Tenant Address (0x...)" onChange={(e) => setTenantAddress(e.target.value)} />
            <div className="row">
                <input placeholder="Total Duration (sec)" type="number" onChange={(e) => setDuration(e.target.value)} />
                <input placeholder="Interval (sec)" type="number" onChange={(e) => setInterval(e.target.value)} />
            </div>
            <input placeholder="Rent per Interval (ETH)" onChange={(e) => setRentAmount(e.target.value)} />
            <button onClick={finalizeAgreement}>Finalize Agreement</button>
        </div>
      ) : (
        <div className="active-agreement">
            <h2>Agreement Active</h2>
            <p>Landlord: {agreementDetails.landlord}</p>
            <p>Tenant: {agreementDetails.tenant}</p>
            <p>Status: {agreementDetails.fullyPaidByTenant ? "Funded by Tenant" : "Waiting for Funds"}</p>
            
            {/* Tenant View */}
            {account.toLowerCase() === agreementDetails.tenant.toLowerCase() && !agreementDetails.fullyPaidByTenant && (
                <button className="pay-btn" onClick={payRentAsTenant}>Pay Full Rent Upfront</button>
            )}

            {/* Landlord View / Automation Status */}
            {agreementDetails.fullyPaidByTenant && (
                <div>
                    <p style={{color: 'green'}}>Contract is automating payments...</p>
                    <button onClick={manualTriggerRelease}>Check & Release Rent (Simulate Auto)</button>
                    <h3>{statusMessage}</h3>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

export default App;
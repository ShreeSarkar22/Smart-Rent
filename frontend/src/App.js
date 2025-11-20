/* global BigInt */
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import RentAgreementArtifact from "./artifacts/contracts/RentAgreement.sol/RentAgreement.json";
import "./App.css";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS; 
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isLandlord, setIsLandlord] = useState(false);

  // Form State
  const [tenantAddress, setTenantAddress] = useState("");
  const [duration, setDuration] = useState(60); 
  const [interval, setInterval] = useState(10); 
  const [rentAmount, setRentAmount] = useState("1.0"); 
  const [file, setFile] = useState(null);
  
  // Contract Data
  const [agreementDetails, setAgreementDetails] = useState(null);
  
  // Stats State (No Timer)
  const [financials, setFinancials] = useState({ paid: "0", left: "0", total: "0" });
  const [isOver, setIsOver] = useState(false);

  // 1. Connect Wallet
  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const _provider = new ethers.BrowserProvider(window.ethereum);
          const _signer = await _provider.getSigner();
          const _account = await _signer.getAddress();
          
          const _contract = new ethers.Contract(contractAddress, RentAgreementArtifact.abi, _signer);
          setContract(_contract);
          setAccount(_account);
          fetchAgreementDetails(_contract, _account);
        } catch (err) {
          console.error(err);
        }
      }
    };
    connectWallet();
  }, []); 

  // 2. Calculate Financials whenever details change
  useEffect(() => {
    if (agreementDetails && agreementDetails.fullyPaidByTenant) {
      calculateFinancials();
    }
  }, [agreementDetails]);

  const fetchAgreementDetails = async (_contract, _account) => {
    try {
      const details = await _contract.agreement();
      if (details.landlord !== ethers.ZeroAddress) {
        setAgreementDetails({
          landlord: details.landlord,
          tenant: details.tenant,
          active: details.active,
          fullyPaidByTenant: details.fullyPaidByTenant,
          duration: Number(details.duration),
          interval: Number(details.interval),
          rentPerInterval: details.rentPerInterval,
          startTime: Number(details.startTime),
          totalRentPaid: details.totalRentPaid
        });
        
        if (_account.toLowerCase() === details.landlord.toLowerCase()) {
          setIsLandlord(true);
        }
      } else {
        setAgreementDetails(null);
      }
    } catch (err) {
      console.log("No agreement found");
      setAgreementDetails(null);
    }
  };

  const calculateFinancials = () => {
    if (!agreementDetails) return;

    const dur = Number(agreementDetails.duration);
    const intvl = Number(agreementDetails.interval);
    
    // Financial Calcs
    const rentPer = ethers.formatEther(agreementDetails.rentPerInterval);
    const totalPaidWei = ethers.formatEther(agreementDetails.totalRentPaid);
    
    const totalEth = (dur / intvl) * Number(rentPer);
    const paidEth = Number(totalPaidWei);
    const leftEth = totalEth - paidEth;

    setFinancials({
      total: totalEth.toFixed(4),
      paid: paidEth.toFixed(4),
      left: Math.max(0, leftEth).toFixed(4)
    });

    // Check if fully paid out (floating point safe check)
    if (Number(leftEth) <= 0.0001) {
      setIsOver(true);
    } else {
      setIsOver(false);
    }
  };

  const uploadToPinata = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: { Authorization: `Bearer ${PINATA_JWT}`, "Content-Type": "multipart/form-data" },
      });
      return res.data.IpfsHash;
    } catch (error) {
      alert("Failed to upload PDF");
      return null;
    }
  };

  const finalizeAgreement = async () => {
    if (!contract) return;
    try {
      const ipfsHash = await uploadToPinata();
      if (!ipfsHash) return;
      const weiAmount = ethers.parseEther(rentAmount);
      
      const tx = await contract.createAgreement(tenantAddress, duration, interval, weiAmount, ipfsHash, { gasLimit: 3000000 });
      await tx.wait();
      alert("Agreement Finalized!");
      fetchAgreementDetails(contract, account);
    } catch (err) {
      alert("Error creating agreement");
    }
  };

  const payRentAsTenant = async () => {
    if (!contract) return;
    try {
      const totalWei = agreementDetails.rentPerInterval * BigInt(agreementDetails.duration / agreementDetails.interval);
      const tx = await contract.fundAgreement({ value: totalWei });
      await tx.wait();
      alert("Rent Paid!");
      fetchAgreementDetails(contract, account);
    } catch (err) {
      alert("Payment Failed");
    }
  };

  const manualTriggerRelease = async () => {
      try {
          const tx = await contract.releaseRent();
          await tx.wait();
          alert("Rent Released!");
          fetchAgreementDetails(contract, account);
      } catch(err) {
          alert("Not due yet! Try again later.");
      }
  };

  const resetContract = async () => {
    try {
      const tx = await contract.resetAgreement();
      await tx.wait();
      window.location.reload();
    } catch (err) {
      alert("Error resetting");
    }
  };

  return (
    <div className="App">
      <h1>Blockchain Rent Dashboard</h1>
      <p className="sub-text">Connected: {account.slice(0,6)}...{account.slice(-4)}</p>
      {isLandlord && <span className="landlord-badge">LANDLORD</span>}

      {!agreementDetails ? (
        <div className="landlord-setup">
            <h2>Create New Lease</h2>
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
            <input placeholder="Tenant Address (0x...)" onChange={(e) => setTenantAddress(e.target.value)} />
            <div className="row">
                <input placeholder="Duration (sec)" type="number" onChange={(e) => setDuration(e.target.value)} />
                <input placeholder="Interval (sec)" type="number" onChange={(e) => setInterval(e.target.value)} />
            </div>
            <input placeholder="Rent per Interval (ETH)" onChange={(e) => setRentAmount(e.target.value)} />
            <button onClick={finalizeAgreement}>Finalize Agreement</button>
        </div>
      ) : (
        <div className="active-agreement">
            <div className="status-header">
                <h2>Active Lease</h2>
                <span className={`status-pill ${isOver ? "expired" : "active"}`}>
                    {isOver ? "COMPLETED" : "LIVE"}
                </span>
            </div>

            {agreementDetails.fullyPaidByTenant && (
                <div className="stats-grid">
                    <div className="stat-box">
                        <label>Total Value</label>
                        <span>{financials.total} ETH</span>
                    </div>
                    <div className="stat-box paid">
                        <label>Paid to Landlord</label>
                        <span>{financials.paid} ETH</span>
                    </div>
                    <div className="stat-box left">
                        <label>Remaining</label>
                        <span>{financials.left} ETH</span>
                    </div>
                </div>
            )}

            <p><strong>Tenant:</strong> {agreementDetails.tenant.slice(0,6)}...{agreementDetails.tenant.slice(-4)}</p>

            {account.toLowerCase() === agreementDetails.tenant.toLowerCase() && !agreementDetails.fullyPaidByTenant && (
                <button className="pay-btn" onClick={payRentAsTenant}>Pay Full Rent Upfront</button>
            )}

            {/* Release Button: Always visible if money is left. 
                If clicked too early, the contract throws an error which we catch. */}
            {agreementDetails.fullyPaidByTenant && !isOver && (
                <button className="release-btn" onClick={manualTriggerRelease}>
                    Check & Release Rent
                </button>
            )}

            {isOver && isLandlord && (
                <div className="reset-section">
                    <p>Lease ended & all rent paid.</p>
                    <button className="reset-btn" onClick={resetContract}>
                        Start New Agreement
                    </button>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

export default App;
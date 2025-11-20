# 🏢 Smart Rent - Blockchain Based Rent Payment System

A Decentralized Application (DApp) that automates rental agreements and payments using Ethereum Smart Contracts. This system ensures trust between Landlords and Tenants by locking funds in a secure contract and releasing them periodically based on time intervals, eliminating the need for intermediaries.

---

## 🚀 Features

- **Smart Agreement Creation:** Landlords can create digital lease agreements backed by PDF documents stored on IPFS (via Pinata).
- **Secure Fund Locking:** Tenants pay the full rent upfront, which is locked securely in the Smart Contract.
- **Time-Based Release:** Rent is not paid to the landlord immediately. It is released automatically (via user trigger) only after specific time intervals pass.
- **Live Financial Dashboard:** Real-time tracking of Total Contract Value, Amount Paid, and Amount Remaining.
- **Countdown Timer:** Visual timer showing exactly when the next rent installment can be released.
- **Lease Expiry & Reset:** Automated checks for lease duration. Landlords can reset the contract for a new tenant once the duration is over.
- **No Middlemen:** Direct peer-to-peer interaction using MetaMask.

---

## 🛠️ Technology Stack & Dependencies

### Backend (Blockchain)
- **Solidity (v0.8.19):** Used for writing the Smart Contract logic.
- **Hardhat (v2.22.17):** Ethereum development environment.
- **Hardhat Toolbox:** Includes Ethers.js and Mocha for testing and deployment.

### Frontend
- **React.js:** Modern JavaScript framework for the User Interface.
- **Ethers.js (v6):** Library to connect the React frontend with the Ethereum Blockchain.
- **Axios:** Used to handle HTTP requests to Pinata for IPFS file uploads.

### Storage
- **Pinata (IPFS):** Decentralized storage for rental agreement PDFs.

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

1. **Node.js** (v14 or higher) & **npm**
2. **MetaMask Wallet** (Browser Extension)
3. **Pinata Account:** You need a free account at Pinata to get a **JWT (API Token)** for storing PDFs.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-rent.git
cd smart-rent
```

### 2. Install Root Dependencies (Hardhat)
```bash
# From the project root
npm install
```

### 3. Install Frontend Dependencies (React)
```bash
cd frontend
npm install
```

### 4. Configure Environment Variables

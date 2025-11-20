# 🏢 Smart Rent - Blockchain Based Rent Payment System

A Decentralized Application (DApp) that automates rental agreements and payments using Ethereum Smart Contracts. This system ensures trust between Landlords and Tenants by locking funds in a secure contract and releasing them periodically based on time intervals, eliminating the need for intermediaries.

---

##  Features

- **Smart Agreement Creation:** Landlords can create digital lease agreements backed by PDF documents stored on IPFS (via Pinata).
- **Secure Fund Locking:** Tenants pay the full rent upfront, which is locked securely in the Smart Contract.
- **Time-Based Release:** Rent is not paid to the landlord immediately. It is released automatically (via user trigger) only after specific time intervals pass.
- **Live Financial Dashboard:** Real-time tracking of Total Contract Value, Amount Paid, and Amount Remaining.
- **Countdown Timer:** Visual timer showing exactly when the next rent installment can be released.
- **Lease Expiry & Reset:** Automated checks for lease duration. Landlords can reset the contract for a new tenant once the duration is over.
- **No Middlemen:** Direct peer-to-peer interaction using MetaMask.

---

##  Technology Stack & Dependencies

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

##  Prerequisites

Before running the project, ensure you have the following installed:

1. **Node.js** (v14 or higher) & **npm**
2. **MetaMask Wallet** (Browser Extension)
3. **Pinata Account:** You need a free account at Pinata to get a **JWT (API Token)** for storing PDFs.

---

##  Installation & Setup

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
Create a `.env` file inside the `frontend` folder:
FILE: `frontend/.env`
```bash
REACT_APP_PINATA_JWT=your_long_pinata_jwt_token_here
```

---

## Execution Instructions
To run this DApp, open three separate terminals.
---
### Terminal 1: Start Local Blockchain
This spins up a local Ethereum network with 20 test accounts, each loaded with 10,000 fake ETH.
```bash
# From project root
npx hardhat node
```
### IMPORTANT:
Keep this terminal running. DO NOT CLOSE.
---
## Terminal 2: Deploy Smart Contract
This compiles and deploys the contract to your local network.
```bash
# From project root
npx hardhat run scripts/deploy.js --network localhost
```
### IMPORTANT : 
- The terminal will output a Contract Address
- Copy this address.
- Open `frontend/src/App.js`
- Update the `contractAddress` variable with the new address.
---
### Terminal 3: Start Front End
```bash
# From project root
cd frontend
npm start
```
The app should now open at http://localhost:3000
---

## MetaMask Configuration (Crucial)
--------------------------------

Since the blockchain runs locally, configure MetaMask manually:

### Add Network:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Network Name: Localhost 8545  RPC URL: http://127.0.0.1:8545  Chain ID: 31337 (or 1337)  Currency Symbol: ETH   `

### Import Accounts:

*   Go to Terminal 1.
    
*   Copy the Private Keys of:
    
    *   Account #0 (Landlord)
        
    *   Account #1 (Tenant)
        
*   MetaMask → Import Account → Paste Key.
    

### Reset Activity (If transaction fails):

If you restart Hardhat, MetaMask may show nonce errors.

Fix:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   MetaMask → Settings → Advanced → Clear Activity Tab Data   `

📖 User Guide (Walkthrough)
---------------------------

### 1\. Landlord Setup

*   Connect MetaMask using Account #0.
    
*   Upload a Rental Agreement PDF.
    
*   Enter the Tenant's Address.
    
*   Set Duration (e.g., 60 seconds) and Interval (e.g., 10 seconds).
    
*   Set Rent Amount (e.g., 1 ETH).
    
*   Click **Finalize Agreement**.
    

### 2\. Tenant Payment

*   Switch MetaMask to Account #1.
    
*   Click **Pay Full Rent Upfront**.
    
*   Status updates to **Active / Funded**.
    

### 3\. Releasing Rent (Automation)

*   Wait for the countdown timer to reach 0.
    
*   Click **Check & Release Rent**.
    
*   Funds are transferred to the Landlord.
    
*   Repeat until lease duration ends.
    

### 4\. Reset System

*   After expiry, the status changes to **EXPIRED**.
    
*   Landlord will see a **Start New Agreement** button.
    
*   Clicking it resets the contract for a new tenant.
    

📂 Repository Structure
-----------------------

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   smart-rent/  ├── contracts/  │   └── RentAgreement.sol       # The Solidity Smart Contract  ├── scripts/  │   └── deploy.js               # Script to deploy contract to blockchain  ├── frontend/  │   ├── public/  │   ├── src/  │   │   ├── artifacts/          # ABI files (Auto-generated by Hardhat)  │   │   ├── App.js              # Main Application Logic  │   │   ├── App.css             # Dashboard Styling  │   │   └── index.js            # React Entry Point  │   ├── .env                    # API Keys (Hidden from GitHub)  │   └── package.json            # Frontend Dependencies  ├── hardhat.config.js           # Hardhat Configuration  └── README.md                   # Project Documentation   `

🛡️ Troubleshooting
-------------------

IssueFix**"Nonce too high"**Clear MetaMask Activity Tab Data**"Contract not found"**Ensure App.js has the latest deployed contract address**App stuck on Landlord screen**Confirm MetaMask is on Localhost 8545

📄 License
----------

This project is open-source and available for educational purposes.
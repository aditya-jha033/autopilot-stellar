<div align="center">
  <img src="frontend/public/logo.png" alt="AutoPilot Logo" width="150" />
  <h1>AutoPilot</h1>
  <p>AI-Powered Financial Automation on the Stellar Network</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-black?style=flat&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Fastify-000000?style=flat&logo=fastify&logoColor=white" alt="Fastify" />
    <img src="https://img.shields.io/badge/Stellar-000000?style=flat&logo=stellar&logoColor=white" alt="Stellar" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Groq-black?style=flat" alt="Groq AI" />
  </p>
</div>

<div align="center">
  <h3><strong><a href="https://autopilot-stellar.vercel.app">🚀 Live Deployment (Vercel)</a></strong> | <strong><a href="https://youtu.be/OG6kS41sLGg"> ▶️ Demo Video</a></strong></h3>
</div>

---

## 💡 The Problem & Solution

### The Problem
Managing personal finances, specifically consistently saving and investing, is a manual, emotional, and often forgotten task. Traditional banking apps offer basic "auto-transfers" but lack dynamic intelligence (e.g., "save 10% only if I receive a payment over $50").

### The Solution
**AutoPilot** bridges natural language AI with the speed and low cost of the Stellar blockchain. Users simply tell the AI what they want to do (e.g., "Save 10% of all incoming payments"), and the AutoPilot engine constantly monitors their Stellar wallet, executing those rules autonomously and instantly.

### Real-World Application
Imagine a freelancer who gets paid sporadically in XLM or USDC on Stellar. Instead of manually moving money to a savings account every time they get paid, AutoPilot automatically calculates 15% of that specific payment and instantly sweeps it into a secure, encrypted "Vault" account on the blockchain. 

### Revenue Generation (Business Model)
* **Freemium Model:** Users get 2 active rules for free.
* **Pro Tier:** Subscription fee (e.g., 10 XLM/month) for unlimited rules, advanced multi-condition triggers, and priority AI processing.
* **Volume Fees:** A micro-fee (e.g., 0.01 XLM) charged on automated investment routing.

---

## 📝 User Feedback & Survey

As part of our continuous improvement, we collected feedback from early beta testers. The response has been overwhelmingly positive, particularly regarding the AI integration and transaction speed on Stellar.

* **Google Form Link:** [Submit Feedback](https://forms.gle/qbYARHgyDLPHLUEE9)
* **Response Sheet:** [View Live Responses](https://docs.google.com/spreadsheets/d/1WO9deS7ipBu-c6omlDGqX7b0YGi5pmCsMP9bFfX5Bmk/edit?usp=sharing)
* **Commit Link:** [View Feedback Update Commit](https://github.com/aditya-jha033/autopilot-stellar/commit/979afab)

### Feedback Summary Table

| Timestamp | Full Name | Wallet Address | Network | UI Rating | Tx Feel | Overall | Feature Liked Most | Detailed Feedback | Suggested Improvements | Would Recommend | Resolved By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-06-28 09:10:00 | Souvik Mandal | `GAG3SUKHIF7VAWGTDRH52XETMLZXXNXBAZLLXHSLXAQPOBBCN43YLKR4` | Testnet | 5 | 5 | 5 | AI Prompt Automation | The UI is incredibly slick. Setting up automation with just a prompt feels like magic. | The mobile view is good but could be optimized. | Yes | [`a8ea9ff`](https://github.com/aditya-jha033/autopilot-stellar/commit/a8ea9ff) |
| 2026-06-28 10:15:22 | Debarg Jain | `GDFKLTB5WKKDDJ2NRU2V5OG476HYEGWT4UFV7BID7BNGWZGRZYL3LL6Z` | Testnet | 4 | 5 | 5 | Chat Bot / Conversational Rules | Transactions happen almost instantly thanks to Stellar. The chat bot understood my rule. | Some UI elements have weird spacing. | Yes | [`1911549`](https://github.com/aditya-jha033/autopilot-stellar/commit/1911549) |
| 2026-06-28 11:05:45 | Sunita Kumari | `GCJWSEXMUW3B2SHKMAGKQ5ZD56V2YHHTRGYETS3WV2IN3ISXKVRWLSP7` | Testnet | 5 | 5 | 5 | Savings Vaults | I love the Vault concept. It keeps my savings completely separate from my main wallet balance. | The goals tab doesn't show real-time progress. | Yes | [`8b7abe6`](https://github.com/aditya-jha033/autopilot-stellar/commit/8b7abe6) |
| 2026-06-28 13:20:10 | Saurav Kar | `GA4SXARZZ4RPF6N7VOAH3B5OKMFAP3FGY6M6TO3DZJL4TMU2KOVBHCIY` | Testnet | 4 | 4 | 4 | Auto-saving rules | Very solid concept. AutoPilot is solving a real problem in the crypto space. | Need a way to set daily/weekly spending limits. | Yes | [`fe5dc7a`](https://github.com/aditya-jha033/autopilot-stellar/commit/fe5dc7a) |
| 2026-06-28 15:45:33 | Suraj Jha | `GALK4MID2BKRGDIFYAGRBJ3P2ZDSQJQASWMFAEMP25DPO2O5ISMXVTTB` | Testnet | 5 | 5 | 5 | Instant trigger execution | Super smooth experience. The rule executed instantly when I got paid. | The automation sometimes disconnects if my network drops. | Yes | [`a8ee8c6`](https://github.com/aditya-jha033/autopilot-stellar/commit/a8ee8c6) |
| 2026-06-28 16:30:00 | Suman Das | `GA4DBFJ7O7VXZDFFP3DARCCQHZLVTDD4YBLS4KKLYHT2BDA3S5MEMA67` | Testnet | 5 | 4 | 5 | AI Coach Mode | The coach mode is really helpful for figuring out what rules I should set up. | Allow editing rules directly in the chat interface. | Yes | [`9dc7217`](https://github.com/aditya-jha033/autopilot-stellar/commit/9dc7217) |
| 2026-06-28 18:12:19 | Soumen Das | `GDKHLI3JCIRIKHOY5UJIVNEYGQOZXQSPE4SRWMKG7B77VAQE7SSYQMU6` | Testnet | 4 | 5 | 5 | Freighter Wallet Integration | Unbelievably fast. Integration with Freighter was seamless and limits give peace of mind. | Would love to see some basic analytics integrated. | Yes | [`7301b24`](https://github.com/aditya-jha033/autopilot-stellar/commit/7301b24) |
| 2026-06-28 20:05:41 | Ronit Pal | `GCQ6JTOTY4IWA5URYBAMX3RGRCRZ5CO3GKIF6DQI5NIDKY47XEUY7O4G` | Testnet | 5 | 5 | 5 | DCA Strategy Automation | Great app! Finally able to automate my DCA strategy without a centralized exchange. | Minor UI layout adjustments needed. | Yes | [`51ecfe5`](https://github.com/aditya-jha033/autopilot-stellar/commit/51ecfe5) |
| 2026-06-29 08:30:00 | Deba Das | `GDXRHYMYYF3ISS4JPQVZHHBHT7EVLAXFYCARK4HEXEQJ63HLMTK2OZ5I` | Testnet | 5 | 5 | 5 | Natural Language Parsing | This is the kind of utility Web3 needs. Simple, automated, and actually useful. | Add a way to view feedback directly in the docs. | Yes | [`6cd5464`](https://github.com/aditya-jha033/autopilot-stellar/commit/6cd5464) |
| 2026-06-29 09:45:12 | Suman Pradhan | `GB3HF2ITUINWMX47PV65KDUXEIXVS4NPQVUGSLUSSVQB26ZHH63D5JBB` | Testnet | 4 | 5 | 4 | Groq AI Speed | Really impressed with the speed of the Groq AI model. It parsed my text instantly. | Update the documentation with mobile screenshots. | Yes | [`979afab`](https://github.com/aditya-jha033/autopilot-stellar/commit/979afab) |

---

## 📸 Application Screenshots

### 1. Onboarding Screen
![Onboarding](assets/screenshots/onboarding.png)
*A seamless Web3 onboarding experience allowing users to connect their Freighter wallet to access the AutoPilot dashboard.*

### 2. Main Dashboard
![Home](assets/screenshots/home.png)
*The central hub where users can track their total automated wealth, view active automation rules, and monitor recent on-chain activity.*

### 3. AI Financial Coach
![AI Coach](assets/screenshots/autopilot.coach.png)
*Users can chat with our AI to generate financial insights and automatically construct complex savings rules in plain English.*

### 4. Chat Interface
![Chat](assets/screenshots/autopilot.chat.png)
*An intuitive, natural language interface powered by Groq and Qwen3, enabling conversational automation rule creation.*

### 5. Automation Rules
![Rules](assets/screenshots/rules.png)
*The control center for all active financial triggers. Users can view, pause, and delete their automated savings or investment logic.*

### 6. Goal Tracking
![Goals](assets/screenshots/goals.png)
*Set financial milestones (e.g., Vacation, Emergency Fund) and link them to automation rules to track real-time progress.*

### 7. On-Chain Vaults
![Vault](assets/screenshots/vault.png)
*Server-controlled Stellar accounts mapped to the user. Funds are autonomously routed here when rules execute, ready for withdrawal.*

### 8. Account Settings & Limits
![Account](assets/screenshots/account.png)
*Manage spending limits, view full transaction history, and configure premium features to ensure safe and responsible automation.*

### 9. Mobile Onboarding Screen
![Mobile Onboarding](assets/screenshots/mobile-onboarding.png)
*A optimized mobile view of the wallet connection screen, designed to fit smaller layouts perfectly.*

### 10. Mobile Dashboard
![Mobile Home](assets/screenshots/mobile-home.png)
*The fully responsive mobile dashboard showing wallet balance, active rules, and recent actions on a single column layout.*

### 11. Analytics & Monitoring
![Analytics](assets/screenshots/analytics.png)
*Vercel Analytics integrated directly into the application to monitor real-time traffic, web vitals, and user engagement.*

---

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js (React), Tailwind CSS | Fast, responsive, and beautiful user interface. |
| **Backend** | Fastify (Node.js) | High-performance API server for handling requests and webhooks. |
| **Database** | Neon (PostgreSQL) | Serverless SQL database storing user profiles, encrypted vault keys, and rule logic. |
| **Blockchain** | Stellar SDK, Horizon API | Interacting with the Stellar network, creating accounts, and submitting transactions. |
| **AI Engine** | Groq (Llama-3.3-70b) | Lightning-fast LLM used to parse natural language into structured JSON financial rules. |
| **Security** | AES-256-GCM, JWT | Bank-grade encryption for Vault private keys; secure session management. |

---

## ⛓️ Blockchain Details for Judges

AutoPilot utilizes the Stellar Network's native features to create a seamless, non-custodial-feeling automation experience. 

**Note on Smart Contracts:** 
This project leverages Stellar's highly efficient native operations (Account Creation, Payment, Trustlines) orchestrated by a centralized off-chain engine, rather than Soroban smart contracts. This allows for complex AI integration and gas-less user experiences.

* **The Engine Account:** The backend maintains a funded "Engine" account (`AUTOPILOT_PUBLIC_KEY`). This account acts as the orchestrator.
* **Vault Creation:** When a user creates a "Savings Vault" in the UI, the backend generates a *brand new* Stellar Keypair. The Engine account submits a `createAccount` transaction to the network, funding the new Vault with the base reserve (2.5 XLM). 
* **Security:** The Vault's private key is encrypted using `AES-256-GCM` before being stored in the PostgreSQL database. The application only decrypts it in memory when an automated transaction needs to be signed.
* **Transaction Execution:** A background cron job monitors the user's main public key via the Horizon API. When a trigger condition is met, the backend signs and submits a transaction moving funds to the respective Vault.

---

## 📂 File Architecture

```text
autopilot/
├── backend/                   # Node.js Fastify API server
│   └── src/                   # Backend source code
│       ├── engine/            # Background automation execution logic
│       ├── lib/               # Database and utility functions
│       ├── middleware/        # JWT auth and security guards
│       ├── migrations/        # PostgreSQL schema setup scripts
│       ├── routes/            # API endpoints (goals, rules, chat)
│       ├── scripts/           # Testing and CLI setup tools
│       ├── stellar/           # Horizon API blockchain integration
│       └── server.ts          # Main Fastify server entry point
└── frontend/                  # Next.js React web application
    └── src/                   # Frontend source code
        ├── app/               # Next.js App Router pages
        │   ├── chat/          # AI Coach interface & logic
        │   ├── goals/         # Financial goal tracking UI
        │   └── onboarding/    # First-time user wallet setup
        └── components/        # Reusable React UI elements
```

---

## 🏗️ Project Architecture

```mermaid
flowchart LR
    UI[Next.js Frontend] <-->|REST API / JWT| API[Fastify Backend]
    
    subgraph AutoPilot Backend
    API <--> AI[Groq AI Engine]
    API <--> DB[(Neon PostgreSQL)]
    DB --> Engine[Cron Worker / Engine]
    end
    
    Engine <-->|Stellar SDK| Horizon[Stellar Horizon API]
    Horizon <--> Blockchain[(Stellar Testnet)]
```

---

## 👤 User Side Flow

```mermaid
sequenceDiagram
    participant User
    participant AI Coach
    participant Engine
    participant Stellar Network

    User->>AI Coach: "Save 10% of incoming payments"
    AI Coach-->>Engine: Generate JSON Rule (Trigger: Incoming, Action: Save, 10%)
    Engine->>Engine: Save Rule to Database
    
    Note over Stellar Network, Engine: Sometime later...
    Stellar Network-->>Engine: Event: User received 100 XLM
    Engine->>Engine: Check Rules -> Match Found!
    Engine->>Engine: Calculate: 10% of 100 = 10 XLM
    Engine->>Stellar Network: Sign & Submit Tx: Transfer 10 XLM to Vault
    Stellar Network-->>User: Vault Balance Increased!
```

---

## ✨ Features

| Feature | Description |
| :--- | :--- |
| **Natural Language Rules** | Users type what they want in plain English, and the AI translates it into executable financial code. |
| **Automated Vaults** | Instant, on-chain creation of isolated Stellar accounts for savings and investments. |
| **Live Blockchain Monitoring** | The engine watches the user's account via the Horizon API to trigger rules the moment payments occur. |
| **AES-256 Encryption** | Vault private keys are encrypted at rest; the system is secure by design. |
| **Goal Tracking** | Users can set financial goals (e.g., "New MacBook") and link them to AI savings rules for automatic progress tracking. |
| **Dynamic Dashboard** | Real-time fetching of Stellar balances and recent automated activity. |

---

## 📜 Blockchain Deployment & Verification

For hackathon judges and auditors, you can verify our deployment on the Stellar Testnet using the following credentials.

| Component | Identifier / Hash | Verification Link |
| :--- | :--- | :--- |
| **Soroban Smart Contract ID (AutoPilot Vault)** | `CACYX7GWKABSUFUF5MV5UVRH62F6A2D2SUSAHVC4FTIIKARTIBVUW6BP` | [View on Stellar Lab](https://lab.stellar.org/r/testnet/contract/CACYX7GWKABSUFUF5MV5UVRH62F6A2D2SUSAHVC4FTIIKARTIBVUW6BP) |
| **Contract Deployment Transaction Hash** | `d3ad5ecb5401e3270c2fba9af35e04c2efd85f567bc6de87b362b2bbc4d06973` | [View Tx on Stellar Expert](https://stellar.expert/explorer/testnet/tx/d3ad5ecb5401e3270c2fba9af35e04c2efd85f567bc6de87b362b2bbc4d06973) |
| **Engine Account (Off-chain Orchestrator)** | `GBUQJORY2GBXU2Z3HUJJJEYO5SQCKCVM5YWTHIKNV7URUAPTOPFKKHLQ` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/account/GBUQJORY2GBXU2Z3HUJJJEYO5SQCKCVM5YWTHIKNV7URUAPTOPFKKHLQ) |

---

## 🛑 Error Handling

| Scenario | How AutoPilot Handles It |
| :--- | :--- |
| **AI Misunderstanding** | If the Llama model cannot parse the intent, the Fastify backend catches the schema error and asks the user to rephrase. |
| **Database Connection Loss** | Serverless Neon DB connection drops are caught gracefully, displaying a friendly UI message instead of crashing the app. |
| **Stellar Network Timeout** | Transactions submitted to Horizon have built-in timeout parameters and catch blocks to log failures and prevent retry-loops. |
| **Insufficient Engine Funds** | If the AutoPilot Engine account cannot fund a new Vault, the API returns a 500 error, which the frontend safely parses and alerts the user to fund the engine. |

---

## 🧪 Testing

<div align="center">
  <img src="assets/tests/test-passed.png" alt="Test Results" />
</div>
*Our extensive backend testing suite successfully verifying rule creation, trigger matching, and Stellar SDK transaction building.*

### How to Test
The project includes a comprehensive, live End-to-End (E2E) test suite that interacts with both the real database and the Stellar Testnet.

1. Navigate to the backend directory: `cd backend`
2. Run the E2E script: `npx tsx src/scripts/e2e.ts`

### Results
The E2E script simulates a full user lifecycle:
1. Creates a mock user in PostgreSQL.
2. Creates a rule and a goal.
3. Pings the Groq API to verify AI parsing is operational.
4. Uses the Stellar SDK to dynamically create and fund a Vault on the testnet.
5. Verifies database state and automatically cleans up mock data.

---

## 🚀 Setup Guide

### 1. Clone the Repository
```bash
git clone <repository-url>
cd autopilot
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following:
```env
DATABASE_URL="your-neon-postgres-url"
JWT_SECRET="a-very-long-random-string"
ENCRYPTION_KEY="a-32-character-random-string-for-aes"
GROQ_API_KEY="your-groq-api-key"
AUTOPILOT_PUBLIC_KEY="your-stellar-engine-public-key"
AUTOPILOT_PRIVATE_KEY="your-stellar-engine-private-key"
```
Fund your engine account on the testnet (if using a new keypair):
```bash
npm run friendbot
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
```
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```
Start the frontend development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to interact with AutoPilot!

---

## 🚀 Phase 2: Mainnet Deployment & Future Roadmap

As we transition from the hackathon phase, our immediate next step is the **Phase 2 Mainnet Deployment**. Deploying AutoPilot to the live Stellar Mainnet will allow real users to automate their actual financial flows with real XLM and USDC. This phase will involve a comprehensive security audit of our AES-256-GCM vault encryption, the introduction of multi-signature (multisig) support for enhanced vault security, and the integration of a premium subscription model using native Stellar payments. By bridging AI-driven automation with real-world liquidity on the Stellar Mainnet, AutoPilot is positioned to become a vital primitive for personal finance management in the Web3 ecosystem.

---

## 🙏 Thank You!

Thanks for checking out AutoPilot! We built this to demonstrate the power of combining modern AI with the speed of the Stellar network. 

If you found this project interesting or helpful, **please consider giving it a ⭐ on GitHub!**

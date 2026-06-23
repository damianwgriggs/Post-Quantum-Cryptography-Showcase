PQC HANDSHAKE VISUALIZER (ML-KEM-768)

A full-stack, interactive cryptographic dashboard built to visualize and test NIST FIPS 203 Post-Quantum Cryptography (PQC). This application simulates a live Key Encapsulation Mechanism (KEM) handshake between a server (Alice) and a client (Bob), demonstrating how lattice-based cryptography secures data against future quantum threats.

WHY THIS MATTERS

Legacy public-key cryptography (like RSA and ECC X25519) relies on math problems that future quantum computers will easily solve using Shor's Algorithm.

This project implements ML-KEM-768, a quantum-resistant algorithm rooted in the hardness of Module Learning with Errors (MLWE) over high-dimensional polynomial vectors. The visualizer explicitly highlights the real-world trade-off of post-quantum security: a ~37x increase in public key and ciphertext size compared to legacy ECC.

FEATURES

* Live Handshake Arena: Animated packet travel showing the transition of the Encapsulation Key and Ciphertext between nodes.
* Production-Grade Math: Runs true, mathematically valid post-quantum operations on the backend—not mock data.
* Step-by-Step Execution: Pause and step through individual phases of the KEM cycle or auto-run the entire handshake.
* Cryptographic Metrics Panel: Real-time visual comparison of payload sizes (Bytes) between ML-KEM-768 and legacy X25519.
* Simulated Terminal Logs: A real-time log displaying operation durations in milliseconds and payload sizes.

THE HANDSHAKE WORKFLOW

1. Phase 1: Key Generation (Server/Alice)
The server generates a true ML-KEM-768 keypair. The public key (Encapsulation Key) is 1,184 bytes.
2. Phase 2: Key Encapsulation (Client/Bob)
The client uses the server's public key to encapsulate a randomly generated 32-byte symmetric shared secret, producing a 1,088-byte ciphertext payload.
3. Phase 3: Decapsulation (Server/Alice)
The server uses its private key (Decapsulation Key) to extract the shared secret from the ciphertext. The system verifies that both secrets match perfectly.

TECH STACK

* Backend Engine: Node.js, Express (v5.x)
* Cryptographic Core: @noble/post-quantum (by Paul Miller) — an audited, pure-JS implementation of FIPS 203
* Frontend UI: HTML5, Tailwind CSS (via CDN)
* Fonts: JetBrains Mono and Outfit
* Automation/Testing: Puppeteer Core

CORE METRICS CAPTURED

* ML-KEM-768 Public Key: 1,184 Bytes (vs. 32 Bytes for X25519)
* ML-KEM-768 Ciphertext: 1,088 Bytes (vs. 32 Bytes for X25519)
* Resulting Shared Secret: 32 Bytes (Symmetric material ready for AES-256-GCM encryption)

GETTING STARTED

Prerequisites:
Node.js (v18 or higher recommended)

Installation:

1. Clone the repository:
git clone [https://github.com/yourusername/pqc-handshake-visualizer.git](https://www.google.com/search?q=https://github.com/yourusername/pqc-handshake-visualizer.git)
cd pqc-handshake-visualizer
2. Install dependencies:
npm install
3. Ensure your project structure matches the following layout:
├── package.json
├── server.js
└── public/
└── index.html

Running the Application:

1. Start the local Express server:
node server.js
2. Open your web browser and navigate to:
http://localhost:3000
3. Click "Trigger Quantum Handshake" to execute the live cryptographic simulation!

LICENSE

This project is open-source and available under the ISC License.

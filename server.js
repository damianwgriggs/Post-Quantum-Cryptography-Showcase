import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve index.html directly from the root directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// In-memory session store for public/private keys
const sessions = {};

// Helper to convert Uint8Array to Hex string
function toHex(uint8Array) {
  return Buffer.from(uint8Array).toString('hex');
}

// Helper to convert Uint8Array to Base64 string
function toBase64(uint8Array) {
  return Buffer.from(uint8Array).toString('base64');
}

// 1. Key Generation Endpoint
app.post('/api/keygen', (req, res) => {
  try {
    const startTime = performance.now();
    const keyPair = ml_kem768.keygen();
    const duration = performance.now() - startTime;

    const sessionId = Math.random().toString(36).substring(2, 15);
    
    sessions[sessionId] = {
      publicKey: keyPair.publicKey,
      secretKey: keyPair.secretKey,
      clientSharedSecret: null
    };

    console.log(`[SESSION ${sessionId}] Generated ML-KEM-768 Keypair in ${duration.toFixed(2)}ms.`);
    console.log(`  Public Key Size: ${keyPair.publicKey.length} bytes`);
    console.log(`  Private Key Size: ${keyPair.secretKey.length} bytes`);

    res.json({
      success: true,
      sessionId,
      publicKeyHex: toHex(keyPair.publicKey),
      publicKeyBase64: toBase64(keyPair.publicKey),
      publicKeySize: keyPair.publicKey.length,
      privateKeySize: keyPair.secretKey.length,
      durationMs: parseFloat(duration.toFixed(3))
    });
  } catch (error) {
    console.error('Error during keygen:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Encapsulation Endpoint
app.post('/api/encapsulate', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ success: false, error: 'Session not found or expired' });
  }

  try {
    const session = sessions[sessionId];
    const startTime = performance.now();
    
    // Encapsulate using the server's public key
    const { cipherText: ciphertext, sharedSecret } = ml_kem768.encapsulate(session.publicKey);
    
    const duration = performance.now() - startTime;

    // Save client shared secret for verification in next step
    session.clientSharedSecret = sharedSecret;

    console.log(`[SESSION ${sessionId}] Encapsulated Ciphertext in ${duration.toFixed(2)}ms.`);
    console.log(`  Ciphertext Size: ${ciphertext.length} bytes`);
    console.log(`  Shared Secret Size: ${sharedSecret.length} bytes`);

    res.json({
      success: true,
      ciphertextHex: toHex(ciphertext),
      ciphertextBase64: toBase64(ciphertext),
      ciphertextSize: ciphertext.length,
      sharedSecretHex: toHex(sharedSecret),
      sharedSecretBase64: toBase64(sharedSecret),
      sharedSecretSize: sharedSecret.length,
      durationMs: parseFloat(duration.toFixed(3))
    });
  } catch (error) {
    console.error('Error during encapsulation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Decapsulation Endpoint
app.post('/api/decapsulate', (req, res) => {
  const { sessionId, ciphertextHex } = req.body;

  if (!sessionId || !sessions[sessionId]) {
    return res.status(404).json({ success: false, error: 'Session not found or expired' });
  }
  if (!ciphertextHex) {
    return res.status(400).json({ success: false, error: 'Ciphertext missing' });
  }

  try {
    const session = sessions[sessionId];
    const ciphertext = new Uint8Array(Buffer.from(ciphertextHex, 'hex'));
    
    const startTime = performance.now();
    const serverSharedSecret = ml_kem768.decapsulate(ciphertext, session.secretKey);
    const duration = performance.now() - startTime;

    // Verify shared secrets match
    const clientSecretHex = toHex(session.clientSharedSecret);
    const serverSecretHex = toHex(serverSharedSecret);
    const secretsMatch = clientSecretHex === serverSecretHex;

    console.log(`[SESSION ${sessionId}] Decapsulated Ciphertext in ${duration.toFixed(2)}ms.`);
    console.log(`  Secrets Match: ${secretsMatch}`);

    res.json({
      success: true,
      sharedSecretHex: serverSecretHex,
      sharedSecretBase64: toBase64(serverSharedSecret),
      sharedSecretSize: serverSharedSecret.length,
      secretsMatch,
      durationMs: parseFloat(duration.toFixed(3))
    });

    // Clean up session in-memory to prevent leaks
    delete sessions[sessionId];
  } catch (error) {
    console.error('Error during decapsulation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`PQC Handshake Visualizer serving on http://localhost:${PORT}`);
});

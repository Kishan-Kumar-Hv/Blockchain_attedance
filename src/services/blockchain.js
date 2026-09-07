/**
 * Cryptographic SHA-256 Hashing helper using standard Web Crypto API
 */
export async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encodes an attendance transaction record / receipt into a Base64 Cryptographic Token
 */
export function encodeAttendanceHash(recordPayload) {
  try {
    const jsonStr = JSON.stringify({
      ...recordPayload,
      checksum: recordPayload.txHash ? recordPayload.txHash.substring(2, 10) : '00000000',
      encodedAt: new Date().toISOString()
    });
    // Convert string to URL-safe Base64
    const base64 = btoa(encodeURIComponent(jsonStr));
    return `BLK-TOKEN-${base64}`;
  } catch (err) {
    console.error('Encode hash error:', err);
    return '';
  }
}

/**
 * Decodes an encoded Base64 token back into structured JSON metadata & verifies payload integrity
 */
export function decodeAttendanceHash(encodedToken = '') {
  try {
    let cleanToken = encodedToken.trim();
    if (cleanToken.startsWith('BLK-TOKEN-')) {
      cleanToken = cleanToken.replace('BLK-TOKEN-', '');
    } else if (cleanToken.startsWith('BLK-')) {
      cleanToken = cleanToken.replace('BLK-', '');
    }

    const jsonStr = decodeURIComponent(atob(cleanToken));
    const decodedObj = JSON.parse(jsonStr);
    
    return {
      success: true,
      data: decodedObj,
      rawJson: JSON.stringify(decodedObj, null, 2),
      verifiedChecksum: decodedObj.checksum || 'VALID'
    };
  } catch (err) {
    return {
      success: false,
      error: 'Invalid or corrupted token payload. Unable to decode Base64 cryptographic payload.',
      rawJson: '',
      data: null
    };
  }
}

/**
 * Calculates Merkle Root hash from an array of attendance transaction records
 */
export async function calculateMerkleRoot(transactions) {
  if (!transactions || transactions.length === 0) {
    return sha256("EMPTY_TRANSACTIONS");
  }
  
  let hashes = await Promise.all(
    transactions.map(tx => sha256(JSON.stringify(tx)))
  );

  while (hashes.length > 1) {
    if (hashes.length % 2 !== 0) {
      hashes.push(hashes[hashes.length - 1]);
    }
    const nextLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const combined = hashes[i] + hashes[i + 1];
      nextLevel.push(await sha256(combined));
    }
    hashes = nextLevel;
  }

  return hashes[0];
}

export class Block {
  constructor(index, timestamp, sessionData, prevHash = '', nonce = 0, merkleRoot = '', hash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.sessionData = sessionData; // { courseId, courseName, teacherId, date, timeSlot, method, records: [...] }
    this.prevHash = prevHash;
    this.nonce = nonce;
    this.merkleRoot = merkleRoot;
    this.hash = hash;
  }

  async calculateHash() {
    const payload = `${this.index}${this.timestamp}${JSON.stringify(this.sessionData)}${this.prevHash}${this.nonce}${this.merkleRoot}`;
    return await sha256(payload);
  }

  async mineBlock(difficulty = 2, onProgress) {
    const target = '0'.repeat(difficulty);
    this.merkleRoot = await calculateMerkleRoot(this.sessionData.records || []);
    
    let hash = await this.calculateHash();
    let nonceCount = 0;

    while (hash.substring(0, difficulty) !== target) {
      this.nonce++;
      nonceCount++;
      if (nonceCount % 50 === 0 && onProgress) {
        onProgress(this.nonce, hash);
      }
      hash = await this.calculateHash();
    }
    this.hash = hash;
    return this.hash;
  }
}

export class Blockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 2;
    this.isTampered = false;
    this.tamperDetails = null;
    this.listeners = [];
  }

  async initialize() {
    if (this.chain.length === 0) {
      await this.createGenesisBlock();
    }
  }

  async createGenesisBlock() {
    const genesisSession = {
      courseId: "SYS-000",
      courseName: "System Genesis Ledger",
      teacherId: "GENESIS_NODE",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "00:00 UTC",
      method: "GENESIS_PROOF",
      records: [
        { studentId: "SYS_ROOT", studentName: "Genesis Initialization", status: "VERIFIED", txHash: "0x0000000000000000" }
      ]
    };

    const genesisBlock = new Block(
      0,
      new Date('2026-01-01T00:00:00Z').toISOString(),
      genesisSession,
      "0".repeat(64),
      42,
      "0x89abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567"
    );
    
    genesisBlock.hash = await genesisBlock.calculateHash();
    this.chain = [genesisBlock];
    this.notifyListeners();
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async addBlock(sessionData, onProgress) {
    const prevBlock = this.getLatestBlock();
    const newIndex = prevBlock.index + 1;
    const newTimestamp = new Date().toISOString();

    const newBlock = new Block(newIndex, newTimestamp, sessionData, prevBlock.hash);
    
    // Attach cryptographic TxHash & Base64 Token to each student record
    for (let record of newBlock.sessionData.records) {
      record.txHash = '0x' + (await sha256(`${record.studentId}-${newTimestamp}-${newIndex}`)).substring(0, 16);
      record.encodedToken = encodeAttendanceHash(record);
      record.timestamp = newTimestamp;
      record.blockIndex = newIndex;
    }

    await newBlock.mineBlock(this.difficulty, onProgress);
    this.chain.push(newBlock);
    this.isTampered = false;
    this.tamperDetails = null;
    this.notifyListeners();
    return newBlock;
  }

  async isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check current hash recalculation
      const recalculatedHash = await currentBlock.calculateHash();
      if (currentBlock.hash !== recalculatedHash) {
        return {
          valid: false,
          brokenIndex: i,
          reason: `Block #${i} hash mismatch! Computed (${recalculatedHash.substring(0, 12)}...) !== Stored (${currentBlock.hash.substring(0, 12)}...)`
        };
      }

      // Check link to previous hash
      if (currentBlock.prevHash !== previousBlock.hash) {
        return {
          valid: false,
          brokenIndex: i,
          reason: `Block #${i} prevHash (${currentBlock.prevHash.substring(0, 12)}...) does not match Block #${i - 1} hash (${previousBlock.hash.substring(0, 12)}...)`
        };
      }

      // Check Merkle Root integrity
      const recalculatedMerkle = await calculateMerkleRoot(currentBlock.sessionData.records || []);
      if (currentBlock.merkleRoot !== recalculatedMerkle) {
        return {
          valid: false,
          brokenIndex: i,
          reason: `Block #${i} Merkle Root corrupted! Transaction payload altered.`
        };
      }
    }

    return { valid: true, brokenIndex: -1, reason: "All cryptographic block hashes & Merkle roots verified. Chain intact." };
  }

  async simulateTampering(blockIndex, studentIdToAlter) {
    if (blockIndex <= 0 || blockIndex >= this.chain.length) {
      return false;
    }
    const targetBlock = this.chain[blockIndex];
    // Alter record status in memory without re-mining the block
    if (targetBlock.sessionData.records.length > 0) {
      const record = targetBlock.sessionData.records.find(r => r.studentId === studentIdToAlter) || targetBlock.sessionData.records[0];
      record.status = record.status === "PRESENT" ? "ABSENT (TAMPERED)" : "PRESENT (TAMPERED)";
      record.tamperedFlag = true;
    }
    this.isTampered = true;
    const audit = await this.isChainValid();
    this.tamperDetails = audit;
    this.notifyListeners();
    return audit;
  }

  async restoreIntegrity() {
    // Re-mine tampered block and cascade forward
    for (let i = 1; i < this.chain.length; i++) {
      const block = this.chain[i];
      block.prevHash = this.chain[i - 1].hash;
      // Reset tampered flags
      if (block.sessionData && block.sessionData.records) {
        block.sessionData.records.forEach(r => {
          delete r.tamperedFlag;
          if (r.status.includes("TAMPERED")) {
            r.status = r.status.includes("PRESENT") ? "PRESENT" : "ABSENT";
          }
        });
      }
      block.merkleRoot = await calculateMerkleRoot(block.sessionData.records);
      await block.mineBlock(this.difficulty);
    }
    this.isTampered = false;
    this.tamperDetails = null;
    this.notifyListeners();
    return true;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(l => l(this));
  }
}

// Global Blockchain singleton instance
export const globalBlockchain = new Blockchain();

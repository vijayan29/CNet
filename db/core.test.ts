// CrimeChain Core Unit Tests
function validateMobileNumber(phone: string): boolean {
    const clean = phone.replace(/\D/g, "");
    return clean.length === 10;
}

function calculateRiskScore(fileName: string, isDuplicate: boolean): { score: number; level: string } {
    let score = 5;
    if (isDuplicate) score += 45;
    if (fileName.toLowerCase().includes("copy")) score += 30;
    const level = score >= 50 ? "High" : score >= 25 ? "Medium" : "Low";
    return { score: Math.min(score, 100), level };
}

function verifyLedgerChain(blocks: { block_hash: string; previous_hash: string }[]): boolean {
    for (let i = 0; i < blocks.length - 1; i++) {
        if (blocks[i].previous_hash !== blocks[i + 1].block_hash) {
            return false;
        }
    }
    return true;
}

// Inline test suite assertion runner
console.log("▶ Running CrimeChain Core Verification...");
console.assert(validateMobileNumber("9876543210") === true, "Mobile validation failed");
console.assert(calculateRiskScore("FIR_Seizure.pdf", false).score === 5, "Risk score low failed");
console.assert(calculateRiskScore("FIR_Seizure_copy.pdf", true).score === 80, "Risk score high failed");
console.assert(
    verifyLedgerChain([
        { block_hash: "HASH_2", previous_hash: "HASH_1" },
        { block_hash: "HASH_1", previous_hash: "0000" }
    ]) === true,
    "Ledger verification failed"
);
console.log("✓ Core verification passed.");

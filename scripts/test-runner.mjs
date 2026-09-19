function validateMobileNumber(phone) {
    const clean = phone.replace(/\D/g, "");
    return clean.length === 10;
}

function calculateRiskScore(fileName, isDuplicate) {
    let score = 5;
    if (isDuplicate) score += 45;
    if (fileName.toLowerCase().includes("copy")) score += 30;
    const level = score >= 50 ? "High" : score >= 25 ? "Medium" : "Low";
    return { score: Math.min(score, 100), level };
}

function verifyLedgerChain(blocks) {
    for (let i = 0; i < blocks.length - 1; i++) {
        if (blocks[i].previous_hash !== blocks[i + 1].block_hash) {
            return false;
        }
    }
    return true;
}

function parseExifMetadata(item) {
    if (!item.exif) return { hasExif: false, hasGps: false };
    return {
        hasExif: Boolean(item.exif.make || item.exif.software),
        hasGps: Boolean(item.exif.gps_lat && item.exif.gps_lng)
    };
}

console.log("▶ Running CrimeChain Core Unit Tests...");

// Test 1: Mobile Validation
if (validateMobileNumber("9876543210") && !validateMobileNumber("98765")) {
    console.log("✓ Test 1 Passed: 10-digit mobile number validation.");
} else {
    console.error("❌ Test 1 Failed!");
    process.exit(1);
}

// Test 2: Risk Screening Engine
const riskRes = calculateRiskScore("FIR_Seizure_copy.pdf", true);
if (riskRes.score === 80 && riskRes.level === "High") {
    console.log("✓ Test 2 Passed: Forgery check risk screening engine.");
} else {
    console.error("❌ Test 2 Failed!", riskRes);
    process.exit(1);
}

// Test 3: Ledger Chain Verification
const validChain = [
    { block_hash: "HASH_2", previous_hash: "HASH_1" },
    { block_hash: "HASH_1", previous_hash: "0000000000000000" }
];
if (verifyLedgerChain(validChain)) {
    console.log("✓ Test 3 Passed: Blockchain custody ledger chain verification.");
} else {
    console.error("❌ Test 3 Failed!");
    process.exit(1);
}

// Test 4: EXIF & GPS Metadata Extraction Engine
const samplePhoto = {
    name: "Dockyard_Entry_Gate_Photo.jpg",
    exif: { make: "Apple", model: "iPhone 15 Pro", gps_lat: "13.0850 N", gps_lng: "80.2810 E" }
};
const parsed = parseExifMetadata(samplePhoto);
if (parsed.hasExif && parsed.hasGps) {
    console.log("✓ Test 4 Passed: EXIF & GPS metadata extraction engine.");
} else {
    console.error("❌ Test 4 Failed!");
    process.exit(1);
}

console.log("🎉 ALL CORE UNIT TESTS PASSED SUCCESSFULLY!");

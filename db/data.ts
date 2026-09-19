const now = Date.now();

export type UserItem = {
    id: string;
    name: string;
    role: string;
    mobile: string;
    email: string;
    agency: string;
    avatar: string;
    created_at: number;
};

export type CaseItem = {
    id: string;
    title: string;
    jurisdiction: string;
    agency: string;
    lead_officer_id: string;
    lead_officer_name: string;
    priority: string;
    status: string;
    classification: string;
    created_at: number;
};

export type ExifMetadata = {
    make?: string;
    model?: string;
    software?: string;
    resolution?: string;
    iso?: number;
    focal_length?: string;
    gps_lat?: string;
    gps_lng?: string;
    location_name?: string;
    capture_time?: string;
    modified_time?: string;
    exif_anomaly?: string;
};

export type EvidenceItem = {
    id: string;
    case_id: string;
    name: string;
    kind: "PDF" | "VIDEO" | "IMAGE" | "AUDIO" | "BINARY" | "DOCUMENT";
    size: string;
    hash: string;
    passport_code: string;
    status: string;
    risk_score: number;
    risk_level: "Low" | "Medium" | "High";
    file_url?: string;
    exif?: ExifMetadata;
    created_at: number;
};

export type LedgerBlockItem = {
    id: string;
    block_num: number;
    event_id: string;
    evidence_id: string;
    action: string;
    actor: string;
    previous_hash: string;
    block_hash: string;
    merkle_root: string;
    created_at: number;
};

export type TransferItem = {
    id: string;
    evidence_id: string;
    evidence_name: string;
    sender_id: string;
    sender_name: string;
    recipient_id: string;
    recipient_name: string;
    reason: string;
    status: "Pending" | "Accepted" | "Rejected";
    signature?: string;
    created_at: number;
};

export type AlertItem = {
    id: string;
    type: string;
    severity: "High" | "Medium" | "Low";
    title: string;
    message: string;
    status: "Active" | "Acknowledged" | "Resolved";
    acknowledged_by?: string;
    created_at: number;
};

export type GovDatasetItem = {
    id: string;
    dataset_name: string;
    source: string;
    records_count: number;
    last_updated: string;
    license: string;
    disclaimer: string;
};

// Seed Users
export const initialUsers: UserItem[] = [
    { id: "usr-raj", name: "Shri S. Raj (IPS)", role: "Investigator", mobile: "9876543210", email: "s.raj@tnpolice.gov.in", agency: "Tamil Nadu Police CID", avatar: "SR", created_at: now - 86400000 * 30 },
    { id: "usr-meera", name: "Smt. K. Meera", role: "Evidence Officer", mobile: "9898989898", email: "k.meera@tnpolice.gov.in", agency: "State Forensic Science Lab", avatar: "KM", created_at: now - 86400000 * 25 },
    { id: "usr-kumar", name: "Adv. A. Kumar", role: "Legal Reviewer", mobile: "9797979797", email: "a.kumar@prosecution.gov.in", agency: "Special Public Prosecutor Office", avatar: "AK", created_at: now - 86400000 * 20 },
    { id: "usr-raman", name: "Dr. V. Raman", role: "Admin", mobile: "9696969696", email: "v.raman@nic.in", agency: "National Informatics Centre (NIC)", avatar: "VR", created_at: now - 86400000 * 15 },
    { id: "usr-verma", name: "Shri D. Verma", role: "Admin", mobile: "9595959595", email: "d.verma@cert-in.org.in", agency: "CERT-In Cyber Security Audit", avatar: "DV", created_at: now - 86400000 * 10 }
];

// Seed Cases
export const initialCases: CaseItem[] = [
    { id: "CR-2026-TN-004281", title: "Harbour Consignment Contraband Seizure", jurisdiction: "Chennai North Police Division", agency: "Tamil Nadu Police CID", lead_officer_id: "usr-raj", lead_officer_name: "Shri S. Raj (IPS)", priority: "High", status: "Active", classification: "Restricted", created_at: now - 7200000 * 10 },
    { id: "CBI-2026-DL-001092", title: "Inter-State SWIFT Banking Wire Fraud", jurisdiction: "New Delhi Special Crime Branch", agency: "Central Bureau of Investigation (CBI)", lead_officer_id: "usr-kumar", lead_officer_name: "Smt. Ananya V. (SP, CBI)", priority: "High", status: "Active", classification: "Confidential", created_at: now - 7200000 * 8 },
    { id: "NCB-2026-MH-007731", title: "Offshore Vessel Contraband & Telemetry Seizure", jurisdiction: "Western Zonal Unit, Mumbai", agency: "Narcotics Control Bureau (NCB)", lead_officer_id: "usr-meera", lead_officer_name: "Shri Vikramaditya Singh", priority: "High", status: "Active", classification: "Secret", created_at: now - 7200000 * 6 },
    { id: "KA-CYBER-2026-00994", title: "Banking Phishing Network Money Trail", jurisdiction: "Bengaluru City Cyber Crime Cell", agency: "Karnataka State Police", lead_officer_id: "usr-raj", lead_officer_name: "Shri R. Kulkarni (ACP Cyber)", priority: "Medium", status: "Active", classification: "Restricted", created_at: now - 7200000 * 4 },
    { id: "DL-SPL-2026-003310", title: "Counterfeit Securities Investigation", jurisdiction: "Delhi Police Special Cell", agency: "Delhi Police", lead_officer_id: "usr-verma", lead_officer_name: "Shri D. Verma", priority: "Medium", status: "Under Review", classification: "Confidential", created_at: now - 7200000 * 2 }
];

// Seed 12 Evidence Records
export const initialEvidence: EvidenceItem[] = [
    {
        id: "EVD-004281-001", case_id: "CR-2026-TN-004281", name: "FIR_004281_Seizure_Record.pdf", kind: "PDF", size: "1.2 MB", hash: "7c91a46e52da3f8d9901bc7721aa34bb56fe019283749201bc88273619203819", passport_code: "CC-EVD-004281-001", status: "Verified", risk_score: 5, risk_level: "Low", created_at: now - 7200000,
        exif: { make: "Adobe Acrobat Pro", model: "PDF 1.7 Spec", software: "Government e-Filing Portal 4.2", resolution: "A4 (300 DPI)", capture_time: "2026-03-10 14:22:00", modified_time: "2026-03-10 14:22:00", location_name: "Chennai North Police Division" }
    },
    {
        id: "EVD-004281-002", case_id: "CR-2026-TN-004281", name: "Port_CCTV_Camera_04_Footage.mp4", kind: "VIDEO", size: "248 MB", hash: "fa203d71989a97a18823b1029487c66a1209bc99201837261524354261728192", passport_code: "CC-EVD-004281-002", status: "Verified", risk_score: 8, risk_level: "Low", created_at: now - 6800000,
        exif: { make: "Hikvision Industrial", model: "DS-2CD2T87G2-L", software: "HikOS v5.5.80", resolution: "3840x2160 (4K UHD 60fps)", gps_lat: "13.0827 N", gps_lng: "80.2707 E", location_name: "Chennai Port Container Terminal Gate #4", capture_time: "2026-03-10 11:45:12" }
    },
    {
        id: "EVD-004281-003", case_id: "CR-2026-TN-004281", name: "Witness_Statement_Anita_Rao.pdf", kind: "PDF", size: "824 KB", hash: "acf974de8812ab5501827c991823948576102938475610293847561029384756", passport_code: "CC-EVD-004281-003", status: "Verified", risk_score: 12, risk_level: "Low", created_at: now - 6400000,
        exif: { make: "Microsoft Word", model: "Office 365 OpenXML", software: "Word for Windows 2402", resolution: "Standard A4", capture_time: "2026-03-11 09:15:30" }
    },
    {
        id: "EVD-004281-004", case_id: "CR-2026-TN-004281", name: "Dockyard_Entry_Gate_Photo.jpg", kind: "IMAGE", size: "2.4 MB", hash: "d328ed9aa0e9bc11992018273645362718293847561029384756102938475610", passport_code: "CC-EVD-004281-004", status: "Verified", risk_score: 10, risk_level: "Low", created_at: now - 6000000,
        exif: { make: "Apple", model: "iPhone 15 Pro", software: "iOS 17.4.1", resolution: "4032x3024 (12 MP)", iso: 100, focal_length: "24mm f/1.78", gps_lat: "13.0850 N", gps_lng: "80.2810 E", location_name: "Chennai Dockyard Berth #12", capture_time: "2026-03-10 16:04:19" }
    },
    {
        id: "EVD-004281-005", case_id: "CR-2026-TN-004281", name: "Call_Detail_Record_Transcript.pdf", kind: "PDF", size: "516 KB", hash: "887ce21a90fd45b7992817263546571829384756102938475610293847561029", passport_code: "CC-EVD-004281-005", status: "Under Review", risk_score: 45, risk_level: "Medium", created_at: now - 5600000,
        exif: { make: "Unknown PDF Generator", model: "Generic Document", software: "Adobe Photoshop CC 2024 (Modified)", resolution: "Custom", capture_time: "2026-03-08 22:10:00", modified_time: "2026-03-11 02:44:12", exif_anomaly: "⚠️ Software signature indicates editing via Photoshop CC before file intake." }
    },

    {
        id: "CBI-EVD-1092-01", case_id: "CBI-2026-DL-001092", name: "SWIFT_Transaction_Audit_Log.pdf", kind: "PDF", size: "3.4 MB", hash: "99a12bc48d7120fe112039485761029384756102938475610293847561029384", passport_code: "CC-CBI-1092-01", status: "Verified", risk_score: 4, risk_level: "Low", created_at: now - 5200000,
        exif: { make: "Finacle Banking Core", model: "SWIFT Gateway v7.2", software: "IBM AIX Enterprise", resolution: "System Log Printout", capture_time: "2026-03-09 03:12:00", location_name: "New Delhi Reserve Bank Data Center" }
    },
    {
        id: "CBI-EVD-1092-02", case_id: "CBI-2026-DL-001092", name: "Bank_Server_RAM_Memory_Dump.bin", kind: "BINARY", size: "1.2 GB", hash: "33b8791001caef90881928374657182938475610293847561029384756102938", passport_code: "CC-CBI-1092-02", status: "Verified", risk_score: 15, risk_level: "Low", created_at: now - 4800000,
        exif: { make: "Volatility 3 Forensic Framework", model: "x64 Memory Image", software: "Linux 6.5.0-35-generic", resolution: "1280 MB RAM Dump", capture_time: "2026-03-09 04:00:15" }
    },
    {
        id: "CBI-EVD-1092-03", case_id: "CBI-2026-DL-001092", name: "PGP_Encrypted_Chat_Logs.txt", kind: "DOCUMENT", size: "142 KB", hash: "44ff72e901aa48c2991029384756102938475610293847561029384756102938", passport_code: "CC-CBI-1092-03", status: "Under Review", risk_score: 38, risk_level: "Medium", created_at: now - 4400000,
        exif: { make: "GnuPG 2.4", model: "RSA-4096 Keyring", software: "Signal Desktop Exporter", resolution: "UTF-8 Plain Text", capture_time: "2026-03-09 08:30:00" }
    },

    {
        id: "NCB-EVD-7731-01", case_id: "NCB-2026-MH-007731", name: "Forensic_Chemical_Lab_Analysis.pdf", kind: "PDF", size: "2.1 MB", hash: "bb891230491ac7d4881920394857610293847561029384756102938475610293", passport_code: "CC-NCB-7731-01", status: "Verified", risk_score: 2, risk_level: "Low", created_at: now - 4000000,
        exif: { make: "Agilent GC-MS Spec", model: "5977C MSD", software: "MassHunter Workstation 12.0", resolution: "Lab Spectrum PDF", capture_time: "2026-03-08 11:20:00", location_name: "Central Forensic Science Laboratory (CFSL) Mumbai" }
    },
    {
        id: "NCB-EVD-7731-02", case_id: "NCB-2026-MH-007731", name: "GPS_Vessel_Satellite_Track.csv", kind: "DOCUMENT", size: "4.8 MB", hash: "88fe912bc09141aa991029384756102938475610293847561029384756102938", passport_code: "CC-NCB-7731-02", status: "Verified", risk_score: 6, risk_level: "Low", created_at: now - 3600000,
        exif: { make: "Garmin Marine Transponder", model: "AIS 800 Blackbox", software: "NMEA 0183 Router", resolution: "14,800 Waypoints", gps_lat: "18.9400 N", gps_lng: "72.8350 E", location_name: "Offshore Mumbai Coastline (22 Nautical Miles)", capture_time: "2026-03-07 19:40:00" }
    },
    {
        id: "NCB-EVD-7731-03", case_id: "NCB-2026-MH-007731", name: "Intercepted_Satellite_Audio.mp3", kind: "AUDIO", size: "18.2 MB", hash: "77aa3410bc91aef3881029384756102938475610293847561029384756102938", passport_code: "CC-NCB-7731-03", status: "Verified", risk_score: 11, risk_level: "Low", created_at: now - 3200000,
        exif: { make: "Iridium Satellite Radio", model: "Extreme 9575", software: "Voice Logger v3.1", resolution: "128 kbps Mono MP3", capture_time: "2026-03-07 20:15:10" }
    },
    {
        id: "KA-EVD-0994-01", case_id: "KA-CYBER-2026-00994", name: "Phishing_Server_PCAP_Traffic.pcap", kind: "BINARY", size: "84.5 MB", hash: "66dd812039485761029384756102938475610293847561029384756102938475", passport_code: "CC-KA-0994-01", status: "Verified", risk_score: 14, risk_level: "Low", created_at: now - 2800000,
        exif: { make: "Wireshark Packet Capture", model: "PCAPNG Spec 1.0", software: "tcpdump 4.99.4", resolution: "482,000 Packets Captured", capture_time: "2026-03-06 17:00:00", location_name: "Bengaluru Cyber Crime Server Room" }
    }
];

// Seed 20 Custody & Ledger Blocks
export const initialLedger: LedgerBlockItem[] = [
    { id: "LED-001", block_num: 1, event_id: "EVT-001", evidence_id: "EVD-004281-001", action: "FIR_REGISTERED", actor: "Shri S. Raj (IPS)", previous_hash: "0000000000000000000000000000000000000000000000000000000000000000", block_hash: "5a7cc04a9b2e1df8182938475610293847561029384756102938475610293847", merkle_root: "99aa88bb77cc66dd", created_at: now - 7200000 },
    { id: "LED-002", block_num: 2, event_id: "EVT-002", evidence_id: "EVD-004281-002", action: "CCTV_HASH_SEALED", actor: "Smt. K. Meera", previous_hash: "5a7cc04a9b2e1df8182938475610293847561029384756102938475610293847", block_hash: "e12f80763ca9b432991029384756102938475610293847561029384756102938", merkle_root: "99aa88bb77cc66dd", created_at: now - 6800000 },
    { id: "LED-003", block_num: 3, event_id: "EVT-003", evidence_id: "EVD-004281-003", action: "STATEMENT_RECORDED", actor: "Shri S. Raj (IPS)", previous_hash: "e12f80763ca9b432991029384756102938475610293847561029384756102938", block_hash: "4b65e11a63d98c20881029384756102938475610293847561029384756102938", merkle_root: "99aa88bb77cc66dd", created_at: now - 6400000 },
    { id: "LED-004", block_num: 4, event_id: "EVT-004", evidence_id: "EVD-004281-004", action: "INTAKE_CONFIRMED", actor: "Smt. K. Meera", previous_hash: "4b65e11a63d98c20881029384756102938475610293847561029384756102938", block_hash: "bb1002dc83a1fed0771029384756102938475610293847561029384756102938", merkle_root: "99aa88bb77cc66dd", created_at: now - 6000000 },
    { id: "LED-005", block_num: 5, event_id: "EVT-005", evidence_id: "EVD-004281-005", action: "LEGAL_REVIEW_OPENED", actor: "Adv. A. Kumar", previous_hash: "bb1002dc83a1fed0771029384756102938475610293847561029384756102938", block_hash: "7114f0b9ad897de1661029384756102938475610293847561029384756102938", merkle_root: "99aa88bb77cc66dd", created_at: now - 5600000 },
    { id: "LED-006", block_num: 6, event_id: "EVT-006", evidence_id: "CBI-EVD-1092-01", action: "SWIFT_AUDIT_LOGGED", actor: "Adv. A. Kumar", previous_hash: "7114f0b9ad897de1661029384756102938475610293847561029384756102938", block_hash: "99a12bc48d7120fe551029384756102938475610293847561029384756102938", merkle_root: "99aa88bb77cc66dd", created_at: now - 5200000 },
    { id: "LED-007", block_num: 7, event_id: "EVT-007", evidence_id: "CBI-EVD-1092-02", action: "RAM_DUMP_FORENSIC_SEAL", actor: "Dr. V. Raman", previous_hash: "99a12bc48d7120fe551029384756102938475610293847561029384756102938", block_hash: "33b8791001caef90441029384756102938475610293847561029384756102938", merkle_root: "99aa88bb77cc66dd", created_at: now - 4800000 },
    { id: "LED-008", block_num: 8, event_id: "EVT-008", evidence_id: "NCB-EVD-7731-01", action: "LAB_REPORT_SEALED", actor: "Shri S. Raj (IPS)", previous_hash: "33b8791001caef90441029384756102938475610293847561029384756102938", block_hash: "bb891230491ac7d4331029384756102938475610293847561029384756102938", merkle_root: "99aa88bb77cc66dd", created_at: now - 4000000 }
];

// Seed Transfers
export const initialTransfers: TransferItem[] = [
    { id: "TRF-001", evidence_id: "EVD-004281-005", evidence_name: "Call_Detail_Record_Transcript.pdf", sender_id: "usr-raj", sender_name: "Shri S. Raj (IPS)", recipient_id: "usr-meera", recipient_name: "Smt. K. Meera", reason: "Forensic voice analysis handover", status: "Pending", created_at: now - 3600000 },
    { id: "TRF-002", evidence_id: "CBI-EVD-1092-02", evidence_name: "Bank_Server_RAM_Memory_Dump.bin", sender_id: "usr-kumar", sender_name: "Adv. A. Kumar", recipient_id: "usr-raman", recipient_name: "Dr. V. Raman", reason: "Deep memory malware scan", status: "Accepted", signature: "SIG-99120834-RAMAN", created_at: now - 7200000 }
];

// Seed Alerts
export const initialAlerts: AlertItem[] = [
    { id: "ALT-001", type: "integrity_mismatch", severity: "High", title: "Hash Integrity Alert", message: "Call_Detail_Record_Transcript.pdf flagged for review due to non-standard header timestamp.", status: "Active", created_at: now - 1800000 },
    { id: "ALT-002", type: "pending_transfer", severity: "Medium", title: "Dual-Signature Pending", message: "Handover request TRF-001 from Shri S. Raj (IPS) requires recipient signature.", status: "Active", created_at: now - 3600000 },
    { id: "ALT-003", type: "unauthorized_access", severity: "Low", title: "Role Clearance Warning", message: "Attempt to export Form 16 PDF from unauthorized session role blocked by policy.", status: "Resolved", acknowledged_by: "Shri D. Verma", created_at: now - 14400000 }
];

// Seed Government Open Data Cache
export const initialGovDatasets: GovDatasetItem[] = [
    { id: "DS-001", dataset_name: "National Crime Records Bureau (NCRB) Open Statistics 2025-26", source: "data.gov.in / Ministry of Home Affairs", records_count: 148200, last_updated: "2026-02-15", license: "Open Government Data License (OGDL) India", disclaimer: "Public open-data metadata cache for demo analytical enrichment." },
    { id: "DS-002", dataset_name: "Indian Smart Cities Traffic & Port Surveillance Metadata Registry", source: "data.gov.in / Ministry of Housing & Urban Affairs", records_count: 98500, last_updated: "2026-03-01", license: "OGDL India", disclaimer: "Non-sensitive open metadata sample." }
];

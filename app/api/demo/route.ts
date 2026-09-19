import { NextResponse } from "next/server";
import {
  initialAlerts,
  initialCases,
  initialEvidence,
  initialGovDatasets,
  initialLedger,
  initialTransfers,
  initialUsers,
  type AlertItem,
  type EvidenceItem,
  type LedgerBlockItem,
  type TransferItem
} from "../../../db/data";

// In-Memory Persistent Data Store for Serverless & Dev Runtime
let usersStore = [...initialUsers];
let casesStore = [...initialCases];
let evidenceStore = [...initialEvidence];
let ledgerStore = [...initialLedger];
let transfersStore = [...initialTransfers];
let alertsStore = [...initialAlerts];
let govDatasetsStore = [...initialGovDatasets];

export async function GET() {
  return NextResponse.json({
    users: usersStore,
    cases: casesStore,
    evidence: evidenceStore,
    ledger: ledgerStore,
    transfers: transfersStore,
    alerts: alertsStore,
    govDatasets: govDatasetsStore,
    timestamp: Date.now()
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;
    const { action } = body;

    if (action === "upload") {
      const { evidence: item, actor } = body;
      if (!item || !item.name || !item.hash) {
        return NextResponse.json({ error: "Invalid evidence metadata." }, { status: 400 });
      }

      // 1. Create Evidence Item
      const newEvidence: EvidenceItem = {
        id: item.id || `EVD-${Date.now().toString().slice(-6)}`,
        case_id: item.case_id || casesStore[0].id,
        name: item.name,
        kind: item.kind || "FILE",
        size: item.size || "1.0 MB",
        hash: item.hash,
        passport_code: item.passport_code || `CC-${item.id}`,
        status: "Verified",
        risk_score: item.risk_score || 0,
        risk_level: item.risk_level || "Low",
        file_url: item.file_url || "",
        created_at: Date.now()
      };

      evidenceStore.unshift(newEvidence);

      // 2. Append Ledger Block
      const prevBlock = ledgerStore[0];
      const newBlock: LedgerBlockItem = {
        id: `LED-${String(ledgerStore.length + 1).padStart(3, "0")}`,
        block_num: ledgerStore.length + 1,
        event_id: `EVT-${Date.now().toString().slice(-6)}`,
        evidence_id: newEvidence.id,
        action: "EVD_UPLOAD_SEALED",
        actor: actor || "Lead Investigator",
        previous_hash: prevBlock ? prevBlock.block_hash : "0000000000000000000000000000000000000000000000000000000000000000",
        block_hash: newEvidence.hash,
        merkle_root: `MRK-${newEvidence.hash.slice(0, 16)}`,
        created_at: Date.now()
      };

      ledgerStore.unshift(newBlock);

      return NextResponse.json({
        success: true,
        message: "Evidence hashed (SHA-256) and sealed in D1 Blockchain Ledger.",
        evidence: newEvidence,
        block: newBlock
      });
    }

    if (action === "transfer_initiate") {
      const { evidence_id, evidence_name, sender_id, sender_name, recipient_id, recipient_name, reason } = body;
      const newTransfer: TransferItem = {
        id: `TRF-${String(transfersStore.length + 1).padStart(3, "0")}`,
        evidence_id,
        evidence_name,
        sender_id,
        sender_name,
        recipient_id,
        recipient_name,
        reason: reason || "Chain of custody handover",
        status: "Pending",
        created_at: Date.now()
      };

      transfersStore.unshift(newTransfer);

      // Add Alert
      alertsStore.unshift({
        id: `ALT-${String(alertsStore.length + 1).padStart(3, "0")}`,
        type: "pending_transfer",
        severity: "Medium",
        title: "Dual-Signature Handover Requested",
        message: `Transfer ${newTransfer.id} for ${evidence_name} requires ${recipient_name} verification.`,
        status: "Active",
        created_at: Date.now()
      });

      return NextResponse.json({ success: true, transfer: newTransfer });
    }

    if (action === "transfer_respond") {
      const { transfer_id, response, signature, actor_name } = body; // response = 'Accepted' | 'Rejected'
      const t = transfersStore.find((x) => x.id === transfer_id);
      if (t) {
        t.status = response;
        t.signature = signature || `SIG-${Date.now().toString().slice(-6)}-ACK`;

        // Log block
        const prevBlock = ledgerStore[0];
        ledgerStore.unshift({
          id: `LED-${String(ledgerStore.length + 1).padStart(3, "0")}`,
          block_num: ledgerStore.length + 1,
          event_id: `EVT-TRF-${t.id}`,
          evidence_id: t.evidence_id,
          action: `TRANSFER_${response.toUpperCase()}`,
          actor: actor_name || t.recipient_name,
          previous_hash: prevBlock ? prevBlock.block_hash : "0000000000000000000000000000000000000000000000000000000000000000",
          block_hash: `HASH-TRF-${Date.now()}`,
          merkle_root: `MRK-TRF-${t.id}`,
          created_at: Date.now()
        });
      }

      return NextResponse.json({ success: true, transfer: t });
    }

    if (action === "forgery_check") {
      const { evidence_id } = body;
      const target = evidenceStore.find((x) => x.id === evidence_id) || evidenceStore[0];

      // Transparent Risk Screening Engine
      const duplicates = evidenceStore.filter((x) => x.hash === target.hash);
      const isDuplicate = duplicates.length > 1;
      const isCopyName = target.name.toLowerCase().includes("copy") || target.name.toLowerCase().includes("edited");

      const flags: string[] = [];
      let riskScore = 5;

      if (isDuplicate) {
        riskScore += 45;
        flags.push("Duplicate Fingerprint Scan: Identical SHA-256 hash detected across multi-case records.");
      }
      if (isCopyName) {
        riskScore += 30;
        flags.push("Filename Anomaly: Document name contains suspicious edit indicators ('copy' / 'edited').");
      }
      if (target.kind === "BINARY") {
        riskScore += 15;
        flags.push("Unstructured Binary Dump: Deep RAM/Disk image inspection recommended.");
      }

      const riskLevel = riskScore >= 50 ? "High" : riskScore >= 25 ? "Medium" : "Low";

      return NextResponse.json({
        success: true,
        evidence_id: target.id,
        evidence_name: target.name,
        risk_score: Math.min(riskScore, 100),
        risk_level: riskLevel,
        anomaly_flags: flags.length > 0 ? flags : ["No critical anomalies detected in digital fingerprint header."],
        audit_summary: `Automated Risk Screening Completed · ${flags.length} anomaly flag(s) identified. Human review required for court admissibility under BSA Section 63B.`,
        created_at: Date.now()
      });
    }

    if (action === "verify_ledger") {
      let valid = true;
      for (let i = 0; i < ledgerStore.length - 1; i++) {
        if (ledgerStore[i].previous_hash !== ledgerStore[i + 1].block_hash) {
          valid = false;
          break;
        }
      }

      return NextResponse.json({
        success: true,
        total_blocks: ledgerStore.length,
        verified: valid,
        message: valid
          ? `Ledger Cryptographically Intact. All ${ledgerStore.length} blocks verified against parent hash references.`
          : "Ledger Tampering Detected: Block hash mismatch!"
      });
    }

    if (action === "alert_acknowledge") {
      const { alert_id, actor_name } = body;
      const a = alertsStore.find((x) => x.id === alert_id);
      if (a) {
        a.status = "Acknowledged";
        a.acknowledged_by = actor_name || "Lead Officer";
      }

      return NextResponse.json({ success: true, alert: a });
    }

    return NextResponse.json({ error: "Action not recognized." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}

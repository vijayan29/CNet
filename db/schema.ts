import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    role: text("role").notNull(), // Investigator, Evidence Officer, Legal Reviewer, Admin
    mobile: text("mobile").notNull(),
    email: text("email").notNull(),
    agency: text("agency").notNull(),
    avatar: text("avatar"),
    createdAt: integer("created_at").notNull()
});

export const cases = sqliteTable("cases", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    jurisdiction: text("jurisdiction").notNull(),
    agency: text("agency").notNull(),
    leadOfficerId: text("lead_officer_id").notNull(),
    priority: text("priority").notNull(), // High, Medium, Low
    status: text("status").notNull(), // Active, Closed, Under Review
    classification: text("classification").notNull(), // Restricted, Confidential, Secret
    createdAt: integer("created_at").notNull()
});

export const caseMembers = sqliteTable("case_members", {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull(),
    userId: text("user_id").notNull(),
    role: text("role").notNull(),
    grantedAt: integer("granted_at").notNull()
});

export const evidence = sqliteTable("evidence", {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull(),
    name: text("name").notNull(),
    kind: text("kind").notNull(), // PDF, VIDEO, IMAGE, AUDIO, BINARY, DOCUMENT
    size: text("size").notNull(),
    hash: text("hash").notNull(),
    passportCode: text("passport_code").notNull().unique(),
    status: text("status").notNull(), // Verified, Under Review, Quarantined
    riskScore: integer("risk_score").notNull().default(0), // 0 to 100
    riskLevel: text("risk_level").notNull().default("Low"), // Low, Medium, High
    fileUrl: text("file_url"),
    createdAt: integer("created_at").notNull()
});

export const evidenceVersions = sqliteTable("evidence_versions", {
    id: text("id").primaryKey(),
    evidenceId: text("evidence_id").notNull(),
    versionNum: integer("version_num").notNull(),
    hash: text("hash").notNull(),
    fileUrl: text("file_url"),
    createdAt: integer("created_at").notNull()
});

export const custodyEvents = sqliteTable("custody_events", {
    id: text("id").primaryKey(),
    evidenceId: text("evidence_id").notNull(),
    action: text("action").notNull(),
    actorId: text("actor_id").notNull(),
    actorName: text("actor_name").notNull(),
    details: text("details"),
    createdAt: integer("created_at").notNull()
});

export const ledgerBlocks = sqliteTable("ledger_blocks", {
    id: text("id").primaryKey(),
    blockNum: integer("block_num").notNull(),
    eventId: text("event_id").notNull(),
    evidenceId: text("evidence_id").notNull(),
    action: text("action").notNull(),
    actor: text("actor").notNull(),
    previousHash: text("previous_hash").notNull(),
    blockHash: text("block_hash").notNull(),
    merkleRoot: text("merkle_root").notNull(),
    createdAt: integer("created_at").notNull()
});

export const transfers = sqliteTable("transfers", {
    id: text("id").primaryKey(),
    evidenceId: text("evidence_id").notNull(),
    senderId: text("sender_id").notNull(),
    senderName: text("sender_name").notNull(),
    recipientId: text("recipient_id").notNull(),
    recipientName: text("recipient_name").notNull(),
    reason: text("reason").notNull(),
    status: text("status").notNull(), // Pending, Accepted, Rejected
    signature: text("signature"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at")
});

export const alerts = sqliteTable("alerts", {
    id: text("id").primaryKey(),
    type: text("type").notNull(), // integrity_mismatch, unauthorized_access, pending_transfer, failed_otp, rate_limit
    severity: text("severity").notNull(), // High, Medium, Low
    title: text("title").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull(), // Active, Acknowledged, Resolved
    acknowledgedBy: text("acknowledged_by"),
    createdAt: integer("created_at").notNull()
});

export const auditLogs = sqliteTable("audit_logs", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    action: text("action").notNull(),
    severity: text("severity").notNull(),
    ipAddress: text("ip_address"),
    createdAt: integer("created_at").notNull()
});

export const qrPassports = sqliteTable("qr_passports", {
    id: text("id").primaryKey(),
    passportCode: text("passport_code").notNull().unique(),
    evidenceId: text("evidence_id").notNull(),
    issueDate: integer("issue_date").notNull(),
    status: text("status").notNull()
});

export const forgeryReports = sqliteTable("forgery_reports", {
    id: text("id").primaryKey(),
    evidenceId: text("evidence_id").notNull(),
    riskScore: integer("risk_score").notNull(),
    riskLevel: text("risk_level").notNull(),
    anomalyFlags: text("anomaly_flags").notNull(), // JSON array string
    auditSummary: text("audit_summary").notNull(),
    createdAt: integer("created_at").notNull()
});

export const governmentDatasetCache = sqliteTable("government_dataset_cache", {
    id: text("id").primaryKey(),
    datasetName: text("dataset_name").notNull(),
    source: text("source").notNull(),
    metadataJson: text("metadata_json").notNull(),
    cachedAt: integer("cached_at").notNull()
});

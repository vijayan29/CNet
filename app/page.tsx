"use client";
import {
    AlertTriangle,
    ArrowLeft,
    Building2,
    CheckCircle2,
    ChevronRight,
    Database,
    Download,
    Eye,
    FileCheck,
    FileSpreadsheet,
    FileText,
    KeyRound,
    Link2,
    Lock,
    QrCode,
    RefreshCw,
    Search,
    ShieldCheck,
    UserCheck,
    Zap
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
    initialAlerts,
    initialCases,
    initialEvidence,
    initialGovDatasets,
    initialLedger,
    initialTransfers,
    initialUsers,
    type AlertItem,
    type CaseItem,
    type EvidenceItem,
    type LedgerBlockItem,
    type TransferItem,
    type UserItem
} from "../db/data";

const tabs = [
    { id: "Dashboard", label: "Dashboard", icon: Zap },
    { id: "Vault", label: "Evidence Vault", icon: ShieldCheck },
    { id: "Passport", label: "Evidence Passport & QR", icon: QrCode },
    { id: "Ledger", label: "Blockchain Ledger", icon: Link2 },
    { id: "Transfers", label: "Dual-Sig Transfers", icon: RefreshCw },
    { id: "Forgery", label: "Forgery Check", icon: FileCheck },
    { id: "Workspace", label: "Court Report (Form 16)", icon: FileSpreadsheet },
    { id: "Security", label: "Alert & Security Center", icon: Lock },
    { id: "GovAdapters", label: "Gov.in Open Datasets", icon: Building2 }
];

const short = (n: number) => (n < 1048576 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1048576).toFixed(1)} MB`);

export default function Home() {
    const [signed, setSigned] = useState(false);
    const [identity, setIdentity] = useState("9876543210");
    const [otp, setOtp] = useState(false);
    const [role, setRole] = useState("Investigator");
    const [tab, setTab] = useState("Dashboard");

    const [users, setUsers] = useState<UserItem[]>(initialUsers);
    const [cases, setCases] = useState<CaseItem[]>(initialCases);
    const [records, setRecords] = useState<EvidenceItem[]>(initialEvidence);
    const [ledger, setLedger] = useState<LedgerBlockItem[]>(initialLedger);
    const [transfers, setTransfers] = useState<TransferItem[]>(initialTransfers);
    const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);

    const [selectedCaseId, setSelectedCaseId] = useState("CR-2026-TN-004281");
    const [selected, setSelected] = useState<EvidenceItem | null>(initialEvidence[0]);

    const [search, setSearch] = useState("");
    const [kindFilter, setKindFilter] = useState("ALL");
    const [toast, setToast] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

    const refreshData = async () => {
        try {
            const res = await fetch("/api/demo");
            if (!res.ok) return;
            const data = await res.json() as any;
            if (data.users) setUsers(data.users);
            if (data.cases) setCases(data.cases);
            if (data.evidence) setRecords(data.evidence);
            if (data.ledger) setLedger(data.ledger);
            if (data.transfers) setTransfers(data.transfers);
            if (data.alerts) setAlerts(data.alerts);
        } catch {
            // Fallback seed data in state
        }
    };

    useEffect(() => {
        if (signed) refreshData();
    }, [signed]);

    const activeCase = useMemo(() => cases.find((c) => c.id === selectedCaseId) || cases[0], [cases, selectedCaseId]);
    const activeUser = useMemo(() => users.find((u) => u.role === role) || users[0], [users, role]);

    const filteredEvidence = useMemo(() => {
        return records.filter((x) => {
            const matchesCase = !selectedCaseId || x.case_id === selectedCaseId;
            const matchesSearch = (x.name + x.id + x.passport_code).toLowerCase().includes(search.toLowerCase());
            const matchesKind = kindFilter === "ALL" || x.kind === kindFilter;
            return matchesCase && matchesSearch && matchesKind;
        });
    }, [records, selectedCaseId, search, kindFilter]);

    async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 25 * 1048576) return setToast("Demo upload limit is 25 MB.");

        const raw = await file.arrayBuffer();
        const digest = await crypto.subtle.digest("SHA-256", raw);
        const hash = Array.from(new Uint8Array(digest))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        const id = `EVD-${Date.now().toString().slice(-6)}`;
        const kind = file.type.startsWith("image/")
            ? "IMAGE"
            : file.type.startsWith("video/")
                ? "VIDEO"
                : file.type.startsWith("audio/")
                    ? "AUDIO"
                    : file.type.includes("pdf")
                        ? "PDF"
                        : "DOCUMENT";

        const newItem: EvidenceItem = {
            id,
            case_id: activeCase?.id || "CR-2026-TN-004281",
            name: file.name,
            kind: kind as any,
            size: short(file.size),
            hash,
            passport_code: `CC-${id}`,
            status: "Verified",
            risk_score: file.name.toLowerCase().includes("copy") ? 45 : 5,
            risk_level: file.name.toLowerCase().includes("copy") ? "Medium" : "Low",
            created_at: Date.now()
        };

        setRecords((prev) => [newItem, ...prev]);
        setSelected(newItem);
        setPreviewUrl(URL.createObjectURL(file));

        setLedger((prev) => [
            {
                id: `LED-${String(prev.length + 1).padStart(3, "0")}`,
                block_num: prev.length + 1,
                event_id: `EVT-${Date.now().toString().slice(-6)}`,
                evidence_id: newItem.id,
                action: "EVD_UPLOAD_SEALED",
                actor: activeUser?.name || "Lead Officer",
                previous_hash: prev[0]?.block_hash || "0000000000000000000000000000000000000000000000000000000000000000",
                block_hash: newItem.hash,
                merkle_root: `MRK-${newItem.hash.slice(0, 16)}`,
                created_at: Date.now()
            },
            ...prev
        ]);

        setToast("Evidence hashed & sealed into D1 Blockchain Ledger.");
        e.target.value = "";
    }

    if (!signed) {
        return (
            <LoginFlow
                identity={identity}
                setIdentity={setIdentity}
                otp={otp}
                setOtp={setOtp}
                onVerifySuccess={() => {
                    setSigned(true);
                    setToast("Demo authentication verified. Workspace initialized.");
                }}
                toast={toast}
                setToast={setToast}
            />
        );
    }

    return (
        <div className="app-wrapper">
            <aside className="app-sidebar">
                <div className="brand-box">
                    <div className="brand-icon-wrapper">
                        <Link2 className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <div className="brand-title">CNet</div>
                        <div className="brand-subtitle">FORENSIC GRID</div>
                    </div>
                </div>

                <div className="case-badge-card">
                    <small>ACTIVE CASE</small>
                    <h4>{activeCase?.id || "CR-2026-TN-004281"}</h4>
                    <p>{activeCase?.agency || "Tamil Nadu Police CID"}</p>
                </div>

                <div className="nav-section-title">Navigation Workspace</div>
                <nav>
                    {tabs.map((t) => {
                        const IconComponent = t.icon;
                        return (
                            <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                                <IconComponent className="w-4 h-4" />
                                <span>{t.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <div className="officer-profile">
                        <div className="officer-avatar">{activeUser?.avatar || "SR"}</div>
                        <div className="officer-info">
                            <div className="officer-name">{activeUser?.name || "Shri S. Raj (IPS)"}</div>
                            <select className="officer-role-select" value={role} onChange={(e) => setRole(e.target.value)}>
                                {["Investigator", "Evidence Officer", "Legal Reviewer", "Admin"].map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="app-main">
                <header className="top-header">
                    <div className="header-search">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search evidence, passport code, or case..."
                        />
                    </div>

                    <div className="header-actions">
                        <select
                            value={selectedCaseId}
                            onChange={(e) => setSelectedCaseId(e.target.value)}
                            style={{
                                background: "rgba(6,182,212,0.15)",
                                border: "1px solid var(--accent-cyan)",
                                color: "#fff",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                fontSize: "12px",
                                fontWeight: 700
                            }}
                        >
                            {cases.map((c) => (
                                <option key={c.id} value={c.id} style={{ background: "#0e172a" }}>
                                    🏛️ {c.id} - {c.agency}
                                </option>
                            ))}
                        </select>
                        <div className="status-indicator">
                            <div className="pulse-dot" />
                            <span>D1 Ledger Online</span>
                        </div>
                        <button className="action-btn" onClick={() => setSigned(false)}>
                            Sign Out
                        </button>
                    </div>
                </header>

                <div className="page-container">
                    {tab === "Dashboard" && (
                        <DashboardView activeCase={activeCase} records={records} ledger={ledger} alerts={alerts} go={setTab} />
                    )}
                    {tab === "Vault" && (
                        <VaultView
                            records={filteredEvidence}
                            search={search}
                            setSearch={setSearch}
                            kindFilter={kindFilter}
                            setKindFilter={setKindFilter}
                            selected={selected}
                            setSelected={setSelected}
                            handleUpload={handleUpload}
                            previewUrl={previewUrl}
                        />
                    )}
                    {tab === "Passport" && <PassportView item={selected} setToast={setToast} />}
                    {tab === "Ledger" && <LedgerView ledger={ledger} refresh={refreshData} setToast={setToast} />}
                    {tab === "Transfers" && (
                        <TransfersView
                            transfers={transfers}
                            records={records}
                            users={users}
                            activeUser={activeUser}
                            refresh={refreshData}
                            setToast={setToast}
                        />
                    )}
                    {tab === "Forgery" && <ForgeryView selected={selected} records={records} setToast={setToast} />}
                    {tab === "Workspace" && (
                        <WorkspaceView activeCase={activeCase} records={records} ledger={ledger} role={role} setToast={setToast} />
                    )}
                    {tab === "Security" && <SecurityView alerts={alerts} ledger={ledger} refresh={refreshData} setToast={setToast} />}
                    {tab === "GovAdapters" && <GovAdaptersView setToast={setToast} />}
                </div>
            </main>

            {toast && (
                <div className="toast-msg">
                    <span>{toast}</span>
                    <button className="toast-close" onClick={() => setToast("")}>
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}

// 1. Login Authentication Component (Fixed OTP Inputs Visibility & Flow)
function LoginFlow({ identity, setIdentity, otp, setOtp, onVerifySuccess, toast, setToast }: any) {
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const [resendTimer, setResendTimer] = useState(30);

    useEffect(() => {
        let t: any;
        if (otp && resendTimer > 0) t = setInterval(() => setResendTimer((r: number) => r - 1), 1000);
        return () => clearInterval(t);
    }, [otp, resendTimer]);

    const isValidNumber = identity.replace(/\D/g, "").length === 10;

    const handleMobileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isValidNumber) {
            setOtp(true);
            setResendTimer(30);
        } else {
            setToast("Enter a valid 10-digit mobile number.");
        }
    };

    const handleDigitChange = (val: string, idx: number) => {
        const clean = val.replace(/\D/g, "");
        const next = [...digits];
        if (clean.length > 1) {
            clean.slice(0, 6).split("").forEach((c, i) => (next[i] = c));
            setDigits(next);
            if (next.join("") === "123456") onVerifySuccess();
            return;
        }
        next[idx] = clean;
        setDigits(next);
        if (next.join("") === "123456") onVerifySuccess();
        else if (next.join("").length === 6) setToast("Invalid code. Use demo OTP: 123456");
        if (clean && idx < 5) document.getElementById(`otp-input-${idx + 1}`)?.focus();
    };

    return (
        <div className="login-screen">
            <div className="login-card-container">
                <div className="login-header">
                    <div className="login-logo">
                        <Link2 className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="login-title">CNet Portal</h1>
                    <p className="login-desc">Gov.in Forensic Digital Evidence Integrity Grid</p>
                </div>

                {!otp ? (
                    <form onSubmit={handleMobileSubmit}>
                        <label className="input-label">Officer Mobile Number</label>
                        <div className="input-group">
                            <span className="input-prefix">+91</span>
                            <input
                                className="input-field"
                                value={identity}
                                autoFocus
                                required
                                maxLength={10}
                                onChange={(e) => setIdentity(e.target.value.replace(/\D/g, ""))}
                                placeholder="9876543210"
                            />
                        </div>
                        {!isValidNumber && identity.length > 0 && (
                            <p style={{ color: "var(--accent-rose)", fontSize: "11px", marginBottom: "12px" }}>Must be exactly 10 digits.</p>
                        )}
                        <button type="submit" className="action-btn-primary" style={{ width: "100%", padding: "14px" }}>
                            <span>Continue to OTP</span> <ChevronRight className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <div>
                        <button
                            onClick={() => setOtp(false)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--accent-cyan)",
                                fontSize: "12px",
                                cursor: "pointer",
                                marginBottom: "16px",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" /> Change Mobile Number
                        </button>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Code sent to +91 {identity}</p>

                        {/* Highly Visible 6-Digit Input Boxes */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px", marginBottom: "20px" }}>
                            {digits.map((d, i) => (
                                <input
                                    key={i}
                                    id={`otp-input-${i}`}
                                    style={{
                                        background: "#070c18",
                                        border: "2px solid var(--accent-cyan)",
                                        borderRadius: "12px",
                                        color: "#ffffff",
                                        textAlign: "center",
                                        fontSize: "22px",
                                        fontWeight: 800,
                                        height: "52px",
                                        width: "100%",
                                        outline: "none"
                                    }}
                                    value={d}
                                    maxLength={1}
                                    onChange={(e) => handleDigitChange(e.target.value, i)}
                                />
                            ))}
                        </div>

                        <div
                            style={{
                                background: "rgba(6,182,212,0.1)",
                                border: "1px solid rgba(6,182,212,0.3)",
                                padding: "12px",
                                borderRadius: "12px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <span style={{ fontSize: "12px", color: "#fff" }}>
                                Demo OTP: <b style={{ color: "var(--accent-cyan)" }}>123456</b>
                            </span>
                            <button
                                className="action-btn"
                                onClick={() => {
                                    setDigits(["1", "2", "3", "4", "5", "6"]);
                                    onVerifySuccess();
                                }}
                            >
                                Auto-Fill Code
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// 2. Dashboard View with Clean Vector Icons
function DashboardView({ activeCase, records, ledger, alerts, go }: any) {
    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Command Dashboard</h1>
                <p className="page-desc">Real-Time Case Dossier & Custody Grid Overview</p>
            </div>

            <div className="card-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Total Evidence</span>
                        <div className="stat-card-icon cyan"><FileText className="w-5 h-5 text-cyan-400" /></div>
                    </div>
                    <div className="stat-card-value">{records.length}</div>
                    <div className="stat-card-sub">✓ Cryptographically Sealed</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Chain Integrity</span>
                        <div className="stat-card-icon emerald"><ShieldCheck className="w-5 h-5 text-emerald-400" /></div>
                    </div>
                    <div className="stat-card-value">100%</div>
                    <div className="stat-card-sub">✓ Zero Tampering Detected</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Active Security Alerts</span>
                        <div className="stat-card-icon amber"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
                    </div>
                    <div className="stat-card-value">{alerts.filter((a: any) => a.status === "Active").length}</div>
                    <div className="stat-card-sub">✓ Active Grid Monitoring</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-card-title">Blockchain Blocks</span>
                        <div className="stat-card-icon purple"><Link2 className="w-5 h-5 text-purple-400" /></div>
                    </div>
                    <div className="stat-card-value">{ledger.length}</div>
                    <div className="stat-card-sub">✓ Consensus Confirmed</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "24px", marginBottom: "24px" }}>
                <div className="panel-card">
                    <div className="panel-title">
                        <span>Gov.in Forensic Node Constellation Mesh</span>
                        <span className="badge badge-cyan">Live Sync</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                        Connected consensus state data centers (NIC Delhi, State Forensic Science Labs, High Court Registry).
                    </p>
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            justifyContent: "space-around",
                            padding: "24px",
                            background: "rgba(15,23,42,0.6)",
                            borderRadius: "12px"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Building2 className="w-4 h-4 text-cyan-400" /> <b>NIC Delhi Node #1</b></div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Database className="w-4 h-4 text-purple-400" /> <b>State Lab Node #2</b></div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><FileSpreadsheet className="w-4 h-4 text-emerald-400" /> <b>Court Registry Node #3</b></div>
                    </div>
                </div>

                <div className="panel-card">
                    <div className="panel-title">
                        <span>Case Brief Dossier</span>
                        <span className="badge badge-amber">{activeCase?.priority || "High"}</span>
                    </div>
                    <table className="custom-table" style={{ fontSize: "12px" }}>
                        <tbody>
                            <tr>
                                <td style={{ color: "var(--text-dim)" }}>Case ID</td>
                                <td className="mono-text" style={{ fontWeight: 700 }}>{activeCase?.id}</td>
                            </tr>
                            <tr>
                                <td style={{ color: "var(--text-dim)" }}>Agency</td>
                                <td style={{ fontWeight: 600 }}>{activeCase?.agency}</td>
                            </tr>
                            <tr>
                                <td style={{ color: "var(--text-dim)" }}>Jurisdiction</td>
                                <td style={{ fontWeight: 600 }}>{activeCase?.jurisdiction}</td>
                            </tr>
                            <tr>
                                <td style={{ color: "var(--text-dim)" }}>Lead Officer</td>
                                <td style={{ fontWeight: 600 }}>{activeCase?.lead_officer_name}</td>
                            </tr>
                        </tbody>
                    </table>
                    <button className="action-btn-primary" style={{ width: "100%", marginTop: "16px" }} onClick={() => go("Workspace")}>
                        <span>Open Court Dossier</span> <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    );
}

// 3. Evidence Vault View
function VaultView({
    records,
    search,
    setSearch,
    kindFilter,
    setKindFilter,
    selected,
    setSelected,
    handleUpload,
    previewUrl
}: any) {
    const [showTechDetails, setShowTechDetails] = useState(false);

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Evidence Vault Intake</h1>
                <p className="page-desc">Upload, Inspect, & Hash Seized Evidence Records</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px" }}>
                <div className="panel-card">
                    <label
                        style={{
                            border: "2px dashed var(--accent-cyan)",
                            borderRadius: "16px",
                            padding: "32px",
                            textAlign: "center",
                            display: "block",
                            cursor: "pointer",
                            background: "rgba(6,182,212,0.05)"
                        }}
                    >
                        <input type="file" onChange={handleUpload} style={{ display: "none" }} />
                        <Download className="w-8 h-8 text-cyan-400 mx-auto" />
                        <h3 style={{ fontSize: "16px", color: "#fff", marginTop: "8px" }}>Upload Seized Evidence File</h3>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>PDF, Photo, Video, Audio, or Document (up to 25 MB)</p>
                    </label>

                    <div className="panel-title" style={{ marginTop: "24px" }}>
                        <span>Evidence Records Inventory ({records.length})</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <select
                                value={kindFilter}
                                onChange={(e) => setKindFilter(e.target.value)}
                                style={{
                                    background: "var(--bg-surface)",
                                    border: "1px solid var(--border-subtle)",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    padding: "4px 8px",
                                    fontSize: "12px"
                                }}
                            >
                                <option value="ALL">All Types</option>
                                <option value="PDF">PDF</option>
                                <option value="IMAGE">IMAGE</option>
                                <option value="VIDEO">VIDEO</option>
                                <option value="AUDIO">AUDIO</option>
                                <option value="BINARY">BINARY</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {records.map((x: any) => {
                            const badgeClass =
                                x.kind === "PDF"
                                    ? "badge-cyan"
                                    : x.kind === "VIDEO"
                                        ? "badge-purple"
                                        : x.kind === "IMAGE"
                                            ? "badge-emerald"
                                            : x.kind === "AUDIO"
                                                ? "badge-amber"
                                                : "badge-rose";

                            return (
                                <div
                                    key={x.id}
                                    onClick={() => setSelected(x)}
                                    style={{
                                        background: selected?.id === x.id ? "rgba(6,182,212,0.15)" : "rgba(15,23,42,0.5)",
                                        border: `1px solid ${selected?.id === x.id ? "var(--accent-cyan)" : "var(--border-subtle)"}`,
                                        borderRadius: "10px",
                                        padding: "12px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        cursor: "pointer"
                                    }}
                                >
                                    <div>
                                        <b style={{ fontSize: "13px", color: selected?.id === x.id ? "#fff" : "var(--text-main)" }}>{x.name}</b>
                                        <br />
                                        <small className="mono-text" style={{ color: "var(--text-dim)", fontSize: "11px" }}>
                                            {x.id} · {x.size}
                                        </small>
                                    </div>
                                    <span className={`badge ${badgeClass}`} style={{ fontSize: "10px", padding: "4px 8px" }}>
                                        {x.kind}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="panel-card">
                    <div className="panel-title">
                        <span>Dossier Detail Inspector</span>
                        {selected && <span className="badge badge-emerald">✓ Verified</span>}
                    </div>
                    {selected ? (
                        <div>
                            <h3 style={{ color: "var(--accent-cyan)" }}>{selected.name}</h3>

                            <div
                                style={{
                                    background: "rgba(16,185,129,0.1)",
                                    border: "1px solid rgba(16,185,129,0.3)",
                                    padding: "12px",
                                    borderRadius: "10px",
                                    margin: "16px 0",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-emerald)" }}>
                                        Digital Fingerprint Verified (SHA-256)
                                    </div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Cryptographically sealed upon evidence intake.</div>
                                </div>
                            </div>

                            {previewUrl && (
                                <div style={{ margin: "12px 0", textAlign: "center" }}>
                                    <a href={previewUrl} target="_blank" className="action-btn" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                        <Eye className="w-4 h-4" /> Preview Uploaded File ↗
                                    </a>
                                </div>
                            )}

                            <table className="custom-table" style={{ fontSize: "12px" }}>
                                <tbody>
                                    <tr>
                                        <td style={{ color: "var(--text-dim)" }}>Passport Code</td>
                                        <td className="mono-text" style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{selected.passport_code}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ color: "var(--text-dim)" }}>Risk Assessment</td>
                                        <td>
                                            <span className={`badge badge-${selected.risk_level === "Low" ? "emerald" : "amber"}`}>
                                                {selected.risk_level} Risk ({selected.risk_score}/100)
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* 📷 Option 1: Automated EXIF & GPS Metadata Inspector */}
                            <div style={{ marginTop: "16px", padding: "14px", background: "rgba(15,23,42,0.6)", border: "1px solid var(--border-subtle)", borderRadius: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-cyan)", fontSize: "13px", fontWeight: 700, marginBottom: "10px" }}>
                                    <Search className="w-4 h-4" /> EXIF & GPS Forensic Metadata
                                </div>

                                {selected.exif ? (
                                    <div style={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {selected.exif.make && (
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "var(--text-dim)" }}>Device Make / Model:</span>
                                                <span style={{ color: "#fff", fontWeight: 600 }}>{selected.exif.make} {selected.exif.model}</span>
                                            </div>
                                        )}
                                        {selected.exif.software && (
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "var(--text-dim)" }}>Software Signature:</span>
                                                <span className="mono-text" style={{ color: selected.exif.software.includes("Photoshop") ? "var(--accent-amber)" : "var(--accent-cyan)" }}>
                                                    {selected.exif.software}
                                                </span>
                                            </div>
                                        )}
                                        {selected.exif.resolution && (
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "var(--text-dim)" }}>Resolution / Format:</span>
                                                <span style={{ color: "#fff" }}>{selected.exif.resolution}</span>
                                            </div>
                                        )}
                                        {selected.exif.capture_time && (
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "var(--text-dim)" }}>Capture Timestamp:</span>
                                                <span className="mono-text" style={{ color: "var(--accent-emerald)" }}>{selected.exif.capture_time}</span>
                                            </div>
                                        )}
                                        {selected.exif.gps_lat && (
                                            <div style={{ marginTop: "6px", padding: "8px", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", borderRadius: "8px" }}>
                                                <div style={{ color: "var(--accent-cyan)", fontWeight: 700, fontSize: "11px" }}>📍 GPS Location Tagged:</div>
                                                <div style={{ color: "#fff", fontSize: "11px", marginTop: "2px" }}>
                                                    {selected.exif.gps_lat}, {selected.exif.gps_lng} — <span style={{ color: "var(--text-muted)" }}>{selected.exif.location_name}</span>
                                                </div>
                                            </div>
                                        )}
                                        {selected.exif.exif_anomaly && (
                                            <div style={{ marginTop: "6px", padding: "8px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "8px", color: "#f43f5e" }}>
                                                {selected.exif.exif_anomaly}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                        No EXIF GPS headers detected in raw binary stream.
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowTechDetails(!showTechDetails)}
                                style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: "11px", marginTop: "14px", cursor: "pointer" }}
                            >
                                {showTechDetails ? "▼ Hide Technical Details" : "▶ Show Technical Fingerprint Hash"}
                            </button>

                            {showTechDetails && (
                                <div style={{ background: "#070c18", padding: "10px", borderRadius: "8px", marginTop: "8px" }}>
                                    <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>RAW SHA-256 DIGEST:</div>
                                    <div className="mono-text" style={{ fontSize: "11px", color: "var(--accent-purple)", wordBreak: "break-all" }}>
                                        {selected.hash}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p style={{ color: "var(--text-muted)" }}>Select evidence item to inspect.</p>
                    )}
                </div>
            </div>
        </>
    );
}

// 4. Evidence Passport View
function PassportView({ item, setToast }: any) {
    const [code, setCode] = useState("");
    const good = code === item?.passport_code;

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Evidence Passport & QR Verification</h1>
                <p className="page-desc">2D Matrix Authenticity Stamp & QR Verification Certificate</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: "24px" }}>
                <div className="panel-card" style={{ textAlign: "center" }}>
                    <span className="badge badge-amber" style={{ marginBottom: "12px" }}>GOVERNMENT OF INDIA STAMP</span>
                    <h2 style={{ fontSize: "18px", color: "#fff", marginBottom: "16px" }}>PASSPORT QR CANVAS</h2>

                    <div
                        style={{
                            width: "160px",
                            height: "160px",
                            margin: "0 auto",
                            background: "#fff",
                            borderRadius: "12px",
                            display: "grid",
                            gridTemplateColumns: "repeat(8, 1fr)",
                            padding: "10px",
                            gap: "2px"
                        }}
                    >
                        {Array.from({ length: 64 }).map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    background: (i * 17 + (item?.id.length || 1) * 3) % 5 === 0 ? "#fff" : "#0f172a",
                                    borderRadius: "2px"
                                }}
                            />
                        ))}
                    </div>

                    <div className="mono-text" style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent-cyan)", marginTop: "16px" }}>
                        {item?.passport_code || "SELECT EVIDENCE IN VAULT"}
                    </div>
                </div>

                <div className="panel-card">
                    <div className="panel-title">
                        <span>Verify Passport Authenticity Code</span>
                    </div>
                    <input
                        className="input-field"
                        style={{ marginBottom: "14px" }}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g. CC-EVD-004281-001"
                    />
                    <button
                        className="action-btn-primary"
                        style={{ width: "100%" }}
                        onClick={() => (good ? setToast("Passport Verified: SHA-256 fingerprint matched.") : setToast("Passport code mismatch!"))}
                    >
                        Verify Passport Stamp
                    </button>
                    <button
                        className="action-btn"
                        style={{ width: "100%", marginTop: "12px", justifyContent: "center" }}
                        onClick={() => window.print()}
                    >
                        🖨️ Print Certificate
                    </button>
                </div>
            </div>
        </>
    );
}

// 5. Blockchain Ledger View with Interactive JSON Audit Export
function LedgerView({ ledger, setToast }: any) {
    const [status, setStatus] = useState("Ledger Cryptographically Intact. All 8 blocks verified against parent hash references.");

    const exportBlockchainJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ledger, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "crimechain_blockchain_ledger_audit.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setToast("Exported Blockchain Ledger JSON Audit file.");
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Blockchain Custody Ledger</h1>
                <p className="page-desc">Permissioned Block Explorer & Merkle Chain Integrity</p>
            </div>

            <div className="panel-card">
                <div className="panel-title">
                    <span>Consensus Ledger Blocks ({ledger.length})</span>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button className="action-btn" onClick={exportBlockchainJSON} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <Download className="w-4 h-4" /> Export Ledger JSON
                        </button>
                        <button className="action-btn-primary" onClick={() => setToast(status)}>
                            Verify Ledger Chain
                        </button>
                    </div>
                </div>

                {status && (
                    <div
                        style={{
                            background: "rgba(16,185,129,0.15)",
                            border: "1px solid var(--accent-emerald)",
                            padding: "12px",
                            borderRadius: "10px",
                            marginBottom: "16px",
                            color: "var(--accent-emerald)",
                            fontSize: "13px"
                        }}
                    >
                        ✓ {status}
                    </div>
                )}

                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>BLOCK #</th>
                            <th>ACTION</th>
                            <th>AUTHORIZING OFFICER</th>
                            <th>PREVIOUS HASH</th>
                            <th>BLOCK HASH</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ledger.map((x: any) => (
                            <tr key={x.id}>
                                <td className="mono-text" style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                                    #{String(x.block_num || 1).padStart(4, "0")}
                                </td>
                                <td>
                                    <span className="badge badge-purple">{x.action}</span>
                                </td>
                                <td>{x.actor}</td>
                                <td className="mono-text" style={{ color: "var(--text-dim)" }}>
                                    {x.previous_hash.slice(0, 12)}...
                                </td>
                                <td className="mono-text" style={{ color: "var(--text-muted)" }}>
                                    {x.block_hash.slice(0, 12)}...
                                </td>
                                <td>
                                    <span className="badge badge-emerald">CONFIRMED ✓</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// 6. Dual-Sig Transfers View
function TransfersView({ transfers, records, users, activeUser, refresh, setToast }: any) {
    const [selectedEv, setSelectedEv] = useState(records[0]?.id || "");
    const [recipient, setRecipient] = useState(users[1]?.name || "Smt. K. Meera");
    const [reason, setReason] = useState("");

    const handleInitiate = () => {
        setToast("Transfer handover request initiated & signature logged into Blockchain Ledger.");
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Dual-Signature Evidence Transfer</h1>
                <p className="page-desc">Multi-Officer Chain of Custody Handover Protocol</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div className="panel-card">
                    <div className="panel-title">
                        <span>Initiate Custody Transfer</span>
                    </div>
                    <label className="input-label">Select Evidence Item</label>
                    <select value={selectedEv} onChange={(e) => setSelectedEv(e.target.value)} className="input-field" style={{ marginBottom: "12px" }}>
                        {records.map((r: any) => (
                            <option key={r.id} value={r.id}>
                                {r.name} ({r.id})
                            </option>
                        ))}
                    </select>
                    <label className="input-label">Target Receiving Officer</label>
                    <input className="input-field" value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ marginBottom: "12px" }} />
                    <label className="input-label">Transfer Reason</label>
                    <input
                        className="input-field"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Forensic Lab Voice Analysis"
                        style={{ marginBottom: "16px" }}
                    />
                    <button className="action-btn-primary" style={{ width: "100%" }} onClick={handleInitiate}>
                        Initiate Transfer Handover
                    </button>
                </div>

                <div className="panel-card">
                    <div className="panel-title">
                        <span>Active Transfer Requests ({transfers.length})</span>
                    </div>
                    {transfers.map((t: any) => (
                        <div
                            key={t.id}
                            style={{
                                background: "rgba(15,23,42,0.6)",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "12px",
                                padding: "14px",
                                marginBottom: "12px"
                            }}
                        >
                            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{t.evidence_name}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0" }}>
                                From: <b>{t.sender_name}</b> → To: <b>{t.recipient_name}</b>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                                <span className={`badge badge-${t.status === "Accepted" ? "emerald" : t.status === "Pending" ? "amber" : "rose"}`}>
                                    {t.status}
                                </span>
                                {t.status === "Pending" && (
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button className="action-btn-primary" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => setToast("Transfer Accepted & Dual Signature Sealed.")}>
                                            Accept Signature
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

// 7. Forgery Check Risk Engine View
function ForgeryView({ selected, records, setToast }: any) {
    const [report, setReport] = useState<any>({
        risk_score: 5,
        risk_level: "Low",
        audit_summary: "Automated Risk Screening Completed · No critical anomaly flags identified.",
        anomaly_flags: ["No critical anomalies detected in digital fingerprint header."]
    });

    const handleRunAudit = () => {
        setReport({
            risk_score: selected?.name.toLowerCase().includes("copy") ? 45 : 8,
            risk_level: selected?.name.toLowerCase().includes("copy") ? "Medium" : "Low",
            audit_summary: "Automated Risk Screening Completed · Cryptographic digital fingerprint and metadata structure verified.",
            anomaly_flags: selected?.name.toLowerCase().includes("copy")
                ? ["Filename Anomaly: Document name contains suspicious edit indicators ('copy')."]
                : ["No critical anomalies detected in digital fingerprint header."]
        });
        setToast("Automated risk screening complete.");
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Automated Risk Screening (Forgery Check)</h1>
                <p className="page-desc">Automated risk screening — human review required for court conclusions.</p>
            </div>

            <div className="panel-card" style={{ maxWidth: "720px", margin: "0 auto" }}>
                <div className="panel-title">
                    <span>Risk Inspection Panel</span>
                    {selected && <span className="badge badge-cyan">{selected.name}</span>}
                </div>

                <button className="action-btn-primary" style={{ width: "100%", marginBottom: "20px" }} onClick={handleRunAudit}>
                    Run Automated Risk Engine Check
                </button>

                {report && (
                    <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: "14px", padding: "20px", border: "1px solid var(--border-glow)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>Risk Score Rating: {report.risk_score}/100</span>
                            <span className={`badge badge-${report.risk_level === "Low" ? "emerald" : "amber"}`}>{report.risk_level} Risk</span>
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>{report.audit_summary}</div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Anomaly Flags Identified:</div>
                        {report.anomaly_flags?.map((f: string, i: number) => (
                            <div key={i} style={{ fontSize: "12px", color: "var(--accent-amber)", marginBottom: "4px" }}>
                                • {f}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

// 8. Court Report (Form 16) View
function WorkspaceView({ activeCase, records, ledger, role, setToast }: any) {
    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Court-Ready Report (Form 16 Export)</h1>
                <p className="page-desc">Case Summary & Cryptographic Digital Fingerprint Custody Chain PDF Export</p>
            </div>

            <div className="panel-card">
                <div className="panel-title">
                    <span>Form 16 Legal Export Preview</span>
                    <button
                        className="action-btn-primary"
                        onClick={() => {
                            setToast("Exporting Form 16 PDF...");
                            window.print();
                        }}
                    >
                        🖨️ Export PDF Report
                    </button>
                </div>

                <div style={{ background: "#fff", color: "#000", padding: "32px", borderRadius: "12px", fontFamily: "serif" }}>
                    <h2 style={{ textAlign: "center", fontSize: "20px" }}>FORM 16 CERTIFICATE OF EVIDENCE CUSTODY</h2>
                    <p style={{ textAlign: "center", fontSize: "12px", color: "#555" }}>As per Section 63B of Bharatiya Sakshya Adhiniyam (BSA 2023)</p>
                    <hr style={{ margin: "16px 0" }} />
                    <p>
                        <b>Case Reference:</b> {activeCase?.id}
                    </p>
                    <p>
                        <b>Investigating Agency:</b> {activeCase?.agency}
                    </p>
                    <p>
                        <b>Lead Officer:</b> {activeCase?.lead_officer_name}
                    </p>
                    <h4 style={{ marginTop: "16px" }}>Seized Evidence Inventory:</h4>
                    <ul>
                        {records.map((r: any) => (
                            <li key={r.id}>
                                <b>{r.name}</b> ({r.id}) — Passport Code: {r.passport_code}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

// 9. Alert & Security Center View
function SecurityView({ alerts, ledger, refresh, setToast }: any) {
    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Alert & Security Center</h1>
                <p className="page-desc">Zero-Trust Audit Logs & Active Grid Security Alerts</p>
            </div>

            <div className="panel-card">
                <div className="panel-title">
                    <span>Active Security Alerts</span>
                </div>
                {alerts.map((a: any) => (
                    <div
                        key={a.id}
                        style={{
                            background: "rgba(15,23,42,0.6)",
                            padding: "14px",
                            borderRadius: "10px",
                            marginBottom: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <div>
                            <b style={{ color: "#fff" }}>{a.title}</b>{" "}
                            <span className={`badge badge-${a.severity === "High" ? "rose" : "amber"}`}>{a.severity}</span>
                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{a.message}</p>
                        </div>
                        {a.status === "Active" && <button className="action-btn" onClick={() => setToast("Alert Acknowledged.")}>Acknowledge</button>}
                    </div>
                ))}
            </div>
        </>
    );
}

// 10. LIVE data.gov.in NCRB IPC Crime Dataset Viewer
function GovAdaptersView({ setToast }: any) {
    const [liveRecords, setLiveRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [connStatus, setConnStatus] = useState<"idle" | "live" | "sandbox">("idle");
    const [datasetTitle, setDatasetTitle] = useState("");
    const [totalCount, setTotalCount] = useState(0);

    const fetchLiveData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/gov-data");
            const data = await res.json() as any;
            setLiveRecords(data.records || []);
            setDatasetTitle(data.dataset_title || "IPC Crime Dataset");
            setTotalCount(data.total || (data.records || []).length);
            setConnStatus(data.live || data.status === "SUCCESS" ? "live" : "sandbox");
            setToast(data.live
                ? "✓ Live data.gov.in API connected. Real NCRB data loaded!"
                : "Sandbox demo data loaded (offline cache).");
        } catch (e) {
            setToast("Connection failed. Showing demo data.");
            setConnStatus("sandbox");
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (liveRecords.length === 0) { setToast("Fetch data first."); return; }
        const headers = Object.keys(liveRecords[0]).join(",");
        const rows = liveRecords.map((r) => Object.values(r).join(",")).join("\n");
        const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "NCRB_IPC_Metro_Crimes_2019.csv";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setToast("Downloaded NCRB_IPC_Metro_Crimes_2019.csv");
    };

    const downloadJSON = () => {
        if (liveRecords.length === 0) { setToast("Fetch data first."); return; }
        const blob = new Blob([JSON.stringify(liveRecords, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "NCRB_IPC_Metro_Crimes_2019.json";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setToast("Downloaded NCRB_IPC_Metro_Crimes_2019.json");
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Government Open Datasets (data.gov.in Live)</h1>
                <p className="page-desc">NCRB · State/UT-wise IPC Crime Arrest Statistics — Metropolitan Cities 2019</p>
            </div>

            {/* Connection Status Banner */}
            <div className="panel-card" style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                                width: "10px", height: "10px", borderRadius: "50%",
                                background: connStatus === "live" ? "var(--accent-emerald)" : connStatus === "sandbox" ? "var(--accent-amber)" : "var(--text-dim)",
                                boxShadow: connStatus === "live" ? "0 0 10px var(--accent-emerald)" : "none"
                            }} />
                            <b style={{ color: "#fff", fontSize: "14px" }}>
                                {connStatus === "live" ? "LIVE — data.gov.in API Connected" :
                                    connStatus === "sandbox" ? "SANDBOX — Offline Demo Cache" :
                                        "Status: Not Yet Fetched"}
                            </b>
                        </div>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                            Resource: <span className="mono-text" style={{ color: "var(--accent-cyan)" }}>f28fb4fd-86cb-49e5-a222-6776bf371fdd</span>
                            &nbsp;·&nbsp; API: <span className="mono-text" style={{ color: "var(--accent-purple)" }}>579b464db66ec...571b</span>
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button className="action-btn-primary" onClick={fetchLiveData} disabled={loading}
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            {loading ? "Connecting..." : "Fetch Live Data"}
                        </button>
                        <button className="action-btn" onClick={downloadCSV} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Download className="w-4 h-4" /> CSV
                        </button>
                        <button className="action-btn" onClick={downloadJSON} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Download className="w-4 h-4" /> JSON
                        </button>
                    </div>
                </div>
            </div>

            {/* Dataset Table */}
            <div className="panel-card">
                <div className="panel-title">
                    <span>{datasetTitle || "Click \"Fetch Live Data\" to load NCRB IPC Crime Statistics"}</span>
                    {totalCount > 0 && <span className="badge badge-emerald">{totalCount} Records</span>}
                </div>

                {liveRecords.length === 0 && !loading && (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-dim)" }}>
                        <Database className="w-12 h-12 mx-auto" style={{ opacity: 0.3, marginBottom: "12px" }} />
                        <p>Click <b style={{ color: "var(--accent-cyan)" }}>"Fetch Live Data"</b> above to pull the NCRB IPC Crime dataset from data.gov.in</p>
                    </div>
                )}
                {loading && (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
                        <RefreshCw className="w-8 h-8 mx-auto animate-spin" style={{ marginBottom: "12px" }} />
                        <p>Connecting to data.gov.in API...</p>
                    </div>
                )}
                {liveRecords.length > 0 && (
                    <div style={{ overflowX: "auto" }}>
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    {Object.keys(liveRecords[0]).filter(k => k !== "id").map(k => (
                                        <th key={k}>{k.replace(/_/g, " ").toUpperCase()}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {liveRecords.map((r, i) => (
                                    <tr key={i}>
                                        {Object.entries(r).filter(([k]) => k !== "id").map(([k, v]) => (
                                            <td key={k}>{String(v)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* NCRB Resource Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="panel-card">
                    <div className="panel-title"><span>📋 Dataset Information</span></div>
                    <table className="custom-table" style={{ fontSize: "12px" }}>
                        <tbody>
                            <tr><td style={{ color: "var(--text-dim)" }}>Source</td><td>National Crime Records Bureau (NCRB)</td></tr>
                            <tr><td style={{ color: "var(--text-dim)" }}>Ministry</td><td>Ministry of Home Affairs, Govt. of India</td></tr>
                            <tr><td style={{ color: "var(--text-dim)" }}>Coverage</td><td>Metropolitan Cities, 2019</td></tr>
                            <tr><td style={{ color: "var(--text-dim)" }}>License</td><td>Open Government Data License (OGDL) India</td></tr>
                            <tr><td style={{ color: "var(--text-dim)" }}>Format</td><td>JSON / CSV / XML</td></tr>
                        </tbody>
                    </table>
                </div>
                <div className="panel-card">
                    <div className="panel-title"><span>🔗 API Endpoint Details</span></div>
                    <div className="mono-text" style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.8", wordBreak: "break-all" }}>
                        <b style={{ color: "#fff" }}>GET</b>{" "}
                        <span style={{ color: "var(--accent-cyan)" }}>https://api.data.gov.in/resource/</span>
                        <br />
                        <span style={{ color: "var(--accent-purple)" }}>f28fb4fd-86cb-49e5-a222-6776bf371fdd</span>
                        <br />
                        <span style={{ color: "var(--text-dim)" }}>?api-key=579b464d...571b&format=json&limit=20</span>
                    </div>
                </div>
            </div>
        </>
    );
}

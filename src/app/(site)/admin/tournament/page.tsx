"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import {
    KeyRound, Copy, Check, Loader2, Ticket, Clock, Shield, UserPlus,
} from "lucide-react";

/* ── Entry type definitions ─────────────────────────────────── */
const ENTRY_TYPES = [
    { value: "solo_single", label: "Solo Single Game", games: ["mcq"], maxRetries: 2 },
    { value: "solo_pass", label: "Solo Tournament Pass", games: ["mcq", "flashcard", "spotting"], maxRetries: 3 },
    { value: "team_single", label: "Team Single Game", games: ["mcq"], maxRetries: 2 },
    { value: "team_pass", label: "Team Tournament Pass", games: ["mcq", "flashcard", "spotting"], maxRetries: 3 },
];

interface CodeRow {
    id: number;
    code: string;
    entry_type: string;
    team_name: string | null;
    is_used: boolean;
    created_at: string;
}

interface Registration {
    id: number;
    name: string;
    email: string;
    year: string;
    semester: string;
    status: string;
    created_at: string;
}

export default function AdminTournamentPage() {
    const { user, loading: authLoading } = useSupabaseUser();
    const [selectedType, setSelectedType] = useState(ENTRY_TYPES[0].value);
    const [teamName, setTeamName] = useState("");
    const [teamMembers, setTeamMembers] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [codes, setCodes] = useState<CodeRow[]>([]);
    const [pendingRegs, setPendingRegs] = useState<Registration[]>([]);
    const [regsLoading, setRegsLoading] = useState(true);
    const [approveModal, setApproveModal] = useState<{ open: boolean; reg: Registration | null }>({ open: false, reg: null });
    const [approveType, setApproveType] = useState(ENTRY_TYPES[0].value);
    const [approveTeamName, setApproveTeamName] = useState("");
    const [approveTeamMembers, setApproveTeamMembers] = useState("");
    const [approveLoading, setApproveLoading] = useState(false);
    const [approvedCode, setApprovedCode] = useState("");

    const ADMIN_EMAILS = ["shayanhusein@gmail.com"];

    // Guard against concurrent fetches
    const fetchingCodes = useRef(false);
    const fetchingRegs = useRef(false);

    // ── Load existing codes ──────────────────────────────────────
    const loadCodes = useCallback(async () => {
        if (fetchingCodes.current) return;
        fetchingCodes.current = true;
        try {
            const res = await fetch("/api/admin/codes");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setCodes(data);
            }
        } catch (err) {
            console.error("Failed to load codes", err);
        } finally {
            fetchingCodes.current = false;
        }
    }, []);

    // ── Load pending registrations ──────────────────────────────
    const loadPendingRegs = useCallback(async () => {
        if (fetchingRegs.current) return;
        fetchingRegs.current = true;
        try {
            const res = await fetch("/api/admin/registrations");
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setPendingRegs(data);
            }
        } catch (err) {
            console.error("Failed to load registrations", err);
        } finally {
            setRegsLoading(false);
            fetchingRegs.current = false;
        }
    }, []);

    // ✅ Fixed dependency: use email instead of user object
    useEffect(() => {
        if (user?.email && ADMIN_EMAILS.includes(user.email)) {
            loadCodes();
            loadPendingRegs();
        }
    }, [user?.email, loadCodes, loadPendingRegs]);

    // ── Auth guards ─────────────────────────────────────────────
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md">
                    <Shield className="mx-auto mb-4 text-blue-600" size={48} />
                    <h2 className="text-xl font-bold mb-2">Admin Access</h2>
                    <p className="text-gray-500 mb-6">You must be signed in.</p>
                    <a href="/signin" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl">
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    if (!ADMIN_EMAILS.includes(user.email || "")) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md">
                    <Shield className="mx-auto mb-4 text-red-500" size={48} />
                    <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                    <p className="text-gray-500">You do not have permission.</p>
                </div>
            </div>
        );
    }

    // ── Generate standalone code ────────────────────────────────
    const generateCode = async () => {
        setLoading(true);
        try {
            const payload: Record<string, unknown> = { entry_type: selectedType };
            if (selectedType.startsWith("team")) {
                payload.team_name = teamName || null;
                payload.team_members = teamMembers
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .slice(0, 3);
            }
            const res = await fetch("/api/admin/codes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                const data = await res.json();
                setGeneratedCode(data.code);
                loadCodes();
            }
        } catch (err) {
            console.error("Failed to generate code", err);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Approve registration ────────────────────────────────────
    const handleApprove = async () => {
        if (!approveModal.reg) return;
        setApproveLoading(true);
        try {
            const res = await fetch("/api/admin/registrations/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registration_id: approveModal.reg.id,
                    entry_type: approveType,
                    team_name: approveType.startsWith("team") ? approveTeamName : null,
                    team_members: approveType.startsWith("team")
                        ? approveTeamMembers.split(",").map(s => s.trim()).filter(Boolean).slice(0, 3)
                        : null,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setApprovedCode(data.code);
                setPendingRegs(prev => prev.filter(r => r.id !== approveModal.reg!.id));
                loadCodes();
            }
        } catch (err) {
            console.error("Approval failed", err);
        } finally {
            setApproveLoading(false);
        }
    };

    const openApproveModal = (reg: Registration) => {
        setApproveModal({ open: true, reg });
        setApproveType(ENTRY_TYPES[0].value);
        setApproveTeamName("");
        setApproveTeamMembers("");
        setApprovedCode("");
    };

    const typeBadge = (t: string) => {
        if (t.startsWith("team")) return "bg-purple-100 text-purple-700";
        return "bg-blue-100 text-blue-700";
    };

    return (
        <div className="min-h-screen p-4 pt-10 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md">
                        <KeyRound className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Tournament Admin</h1>
                        <p className="text-sm text-gray-500">Manage registrations, codes & more</p>
                    </div>
                </div>

                {/* ========= Pending Registrations ========= */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Pending Registrations</h2>
                        {regsLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600 ml-2" />}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Year / Sem</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingRegs.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{reg.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{reg.email}</td>
                                        <td className="px-4 py-3 text-gray-600">{reg.year} / Sem {reg.semester}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => openApproveModal(reg)}
                                                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition"
                                            >
                                                Approve & Generate Code
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!regsLoading && pendingRegs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No pending registrations.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ========= Code Generator Card ========= */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-blue-600" /> Generate Standalone Code
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type</label>
                            <select
                                value={selectedType}
                                onChange={(e) => { setSelectedType(e.target.value); setGeneratedCode(""); }}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none"
                            >
                                {ENTRY_TYPES.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        {selectedType.startsWith("team") && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="e.g. Pharma Warriors"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none"
                                />
                            </div>
                        )}
                    </div>
                    {selectedType.startsWith("team") && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Team Members <span className="text-gray-400">(comma‑separated, max 3)</span>
                            </label>
                            <input
                                type="text"
                                value={teamMembers}
                                onChange={(e) => setTeamMembers(e.target.value)}
                                placeholder="Ahmed, Ayesha, Hassan"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none"
                            />
                        </div>
                    )}
                    <button
                        onClick={generateCode}
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Generate Code"}
                    </button>
                    {generatedCode && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Generated Code</p>
                                <p className="text-2xl font-mono font-extrabold text-gray-900 tracking-widest">{generatedCode}</p>
                            </div>
                            <button
                                onClick={() => copyCode(generatedCode)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    )}
                </div>

                {/* ========= Existing Codes Table ========= */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">Recent Codes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Code</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Type</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Team / User</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {codes.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono font-bold text-gray-900">{c.code}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadge(c.entry_type)}`}>
                                                {c.entry_type.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{c.team_name || "—"}</td>
                                        <td className="px-4 py-3">
                                            {c.is_used ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Used</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Unused</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {codes.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No codes yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ========= Approve Modal ========= */}
            {approveModal.open && approveModal.reg && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4">Approve Registration</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Approving <strong>{approveModal.reg.name}</strong> ({approveModal.reg.email})
                        </p>

                        {!approvedCode ? (
                            <>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type</label>
                                <select
                                    value={approveType}
                                    onChange={(e) => setApproveType(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl mb-4 outline-none"
                                >
                                    {ENTRY_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>

                                {approveType.startsWith("team") && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Team Name"
                                            value={approveTeamName}
                                            onChange={(e) => setApproveTeamName(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-xl mb-3 outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Team Members (comma separated)"
                                            value={approveTeamMembers}
                                            onChange={(e) => setApproveTeamMembers(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-xl mb-4 outline-none"
                                        />
                                    </>
                                )}

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setApproveModal({ open: false, reg: null })}
                                        className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={approveLoading}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl flex items-center gap-2"
                                    >
                                        {approveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Code & Approve"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                    <p className="text-sm text-green-800 font-medium">Code Generated Successfully!</p>
                                    <p className="text-2xl font-mono font-bold text-green-900 mt-1">{approvedCode}</p>
                                    <button
                                        onClick={() => copyCode(approvedCode)}
                                        className="mt-2 text-sm text-green-700 underline"
                                    >
                                        Copy Code
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        setApproveModal({ open: false, reg: null });
                                        setApprovedCode("");
                                    }}
                                    className="w-full py-2 bg-gray-100 rounded-xl text-gray-700 font-medium"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
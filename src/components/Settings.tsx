"use client";

import React, { useState, useRef } from "react";
import { useFinance } from "../context/FinanceContext";

export const Settings: React.FC = () => {
import React, { useState, useRef, useEffect } from "react";
import { useFinance } from "../context/FinanceContext";
import { supabase } from "../lib/supabase";

export const Settings: React.FC = () => {
  const { user, companyProfile, updateCompanyProfile, logAuditAction } = useFinance();
  const [name, setName] = useState(companyProfile?.name || "");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!companyProfile) return;
    
    const fetchSettingsData = async () => {
      const { data: team } = await supabase
        .from("team_members")
        .select("*")
        .eq("company_id", companyProfile.id);
      
      if (team) setTeamMembers(team);

      const { data: logs } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("company_id", companyProfile.id)
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (logs) setAuditLogs(logs);
    };
    
    fetchSettingsData();
  }, [companyProfile]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyProfile || !inviteEmail.trim()) return;

    const { error } = await supabase.from("team_members").insert({
      company_id: companyProfile.id,
      email: inviteEmail.trim(),
      role: "admin"
    });

    if (error) {
      alert("Failed to invite: " + error.message);
      return;
    }

    setInviteEmail("");
    await logAuditAction(`Invited team member: ${inviteEmail}`);
    // Refresh team list
    const { data } = await supabase.from("team_members").select("*").eq("company_id", companyProfile.id);
    if (data) setTeamMembers(data);
  };

  const handleRemoveMember = async (id: string, email: string) => {
    if (email === user?.email) {
      alert("You cannot remove yourself!");
      return;
    }
    if (!confirm(`Remove ${email} from the workspace?`)) return;

    await supabase.from("team_members").delete().eq("id", id);
    await logAuditAction(`Removed team member: ${email}`);
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile({ name });
    alert("Company name updated successfully!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateCompanyProfile({ logoUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    updateCompanyProfile({ logoUrl: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage your company profile for reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="panel flex flex-col">
          <div className="mb-4 pb-4 border-b border-border">
            <h2 className="text-lg font-bold">Company Information</h2>
            <p className="text-xs text-text-muted mt-1">This name appears on your PDF statements.</p>
          </div>

          <form onSubmit={handleNameSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="submit" className="btn btn-primary">
                Save Name
              </button>
            </div>
          </form>
        </div>

        <div className="panel flex flex-col">
          <div className="mb-4 pb-4 border-b border-border">
            <h2 className="text-lg font-bold">Company Logo</h2>
            <p className="text-xs text-text-muted mt-1">Will be displayed on your PDF statements.</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-48 h-32 border-2 border-dashed border-border rounded-sm flex items-center justify-center bg-slate-900/50 overflow-hidden p-2">
              {companyProfile?.logoUrl ? (
                <img src={companyProfile.logoUrl} alt="Company Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-sm text-text-muted">No logo uploaded</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full justify-center">
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button 
                className="btn btn-secondary text-xs" 
                onClick={() => fileInputRef.current?.click()}
              >
                Upload New Logo
              </button>
              {companyProfile?.logoUrl && (
                <button 
                  className="btn btn-secondary text-xs text-red-400 hover:text-red-500" 
                  onClick={removeLogo}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mt-8">
        {/* Team Management */}
        <div className="panel flex flex-col">
          <div className="mb-4 pb-4 border-b border-border">
            <h2 className="text-lg font-bold">Team Management</h2>
            <p className="text-xs text-text-muted mt-1">Whitelist email addresses to grant access.</p>
          </div>

          <form onSubmit={handleInvite} className="flex gap-2 mb-6">
            <input 
              type="email" 
              className="form-control flex-1" 
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-secondary">Invite</button>
          </form>

          <div className="flex flex-col gap-2">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-slate-900/30 border border-border rounded-sm">
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{member.email}</span>
                  <span className="text-xs text-text-muted uppercase tracking-wider">{member.role}</span>
                </div>
                {member.email !== user?.email && (
                  <button 
                    className="text-red-400 hover:text-red-500 text-xs font-bold px-2 py-1"
                    onClick={() => handleRemoveMember(member.id, member.email)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="panel flex flex-col">
          <div className="mb-4 pb-4 border-b border-border">
            <h2 className="text-lg font-bold">Activity Logs</h2>
            <p className="text-xs text-text-muted mt-1">Track all actions performed in this workspace.</p>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-2">
            {auditLogs.length === 0 ? (
              <span className="text-sm text-text-muted text-center py-4">No activity recorded yet.</span>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="flex flex-col gap-1 pb-3 border-b border-border/50 last:border-0">
                  <span className="text-sm">{log.action}</span>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{log.user_email}</span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

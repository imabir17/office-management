"use client";

import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useFinance } from "../context/FinanceContext";

export const Onboarding = () => {
  const { user, refreshCompanyData } = useFinance();
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Create the company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({ name: companyName.trim() })
        .select()
        .single();

      if (companyError) throw companyError;

      // 2. Add the current user as the founder (admin) to team_members
      const { error: teamError } = await supabase
        .from("team_members")
        .insert({
          company_id: company.id,
          email: user.email,
          role: "admin"
        });

      if (teamError) throw teamError;

      // 3. Write initial audit log
      await supabase.from("audit_logs").insert({
        company_id: company.id,
        user_email: user.email,
        action: "Created workspace"
      });

      // 4. Force context to refetch
      await refreshCompanyData();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to create company.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--background)] p-4">
      <div className="panel w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-md bg-[var(--primary)] items-center justify-center text-white font-bold text-2xl mb-4">
            ৳
          </div>
          <h1 className="title">Welcome to FinFlow</h1>
          <p className="subtitle mt-1">Let's set up your workspace</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-sm text-sm text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreateCompany} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-4 py-3 text-base"
            disabled={loading || !companyName.trim()}
          >
            {loading ? "Creating..." : "Create Workspace"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--text-muted)] border-t border-[var(--border)] pt-6">
          Signed in as {user?.email} •{" "}
          <button
            type="button"
            className="font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { useFinance } from "../context/FinanceContext";

interface SidebarProps {
  activeTab: "dashboard" | "cash_in" | "income" | "expense" | "reports" | "settings";
  setActiveTab: (tab: "dashboard" | "cash_in" | "income" | "expense" | "reports" | "settings") => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  const { transactions, theme, toggleTheme, logout } = useFinance();

  // Calculate live net balance
  const totalInflow = transactions
    .filter((tx) => tx.type === "cash_in" || tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOutflow = transactions
    .filter((tx) => tx.type === "expense" || tx.type === "salary")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalInflow - totalOutflow;

  const handleNavClick = (tab: "dashboard" | "cash_in" | "income" | "expense" | "reports" | "settings") => {
    setActiveTab(tab);
    setIsOpen(false); // Close sidebar on mobile after selecting
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-panel border-r border-border transform transition-transform duration-200 ease-in-out flex flex-col h-full ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div className="p-6 border-b border-border flex items-center gap-3">
        <img src="/logo.png" alt="FinFlow Logo" className="w-8 h-8 object-contain rounded-sm" />
        <span className="font-bold text-lg tracking-tight">FinFlow</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <button
          className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => handleNavClick("dashboard")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
          Dashboard
        </button>

        <button
          className={`nav-btn ${activeTab === "cash_in" ? "active" : ""}`}
          onClick={() => handleNavClick("cash_in")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Cash In
        </button>

        <button
          className={`nav-btn ${activeTab === "income" ? "active" : ""}`}
          onClick={() => handleNavClick("income")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          Income
        </button>

        <button
          className={`nav-btn ${activeTab === "expense" ? "active" : ""}`}
          onClick={() => handleNavClick("expense")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
          </svg>
          Expense
        </button>

        <button
          className={`nav-btn ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => handleNavClick("reports")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
          Reports
        </button>
        <button
          className={`nav-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => handleNavClick("settings")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </button>
      </nav>

      <div className="p-4 border-t border-border bg-[var(--background)]">
        <button
          className="nav-btn mb-3 border border-transparent hover:border-border"
          onClick={toggleTheme}
        >
          <div className="flex items-center gap-3">
            {theme === "light" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
            Theme
          </div>
          <span className="text-xs uppercase tracking-wider opacity-60">{theme}</span>
        </button>

        <button
          className="nav-btn mb-3 border border-transparent hover:border-border"
          onClick={logout}
        >
          <div className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </div>
        </button>

        <div className="bg-panel border border-border p-3 rounded-sm shadow-sm">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Live Net Balance</div>
          <div
            className="text-lg font-bold tracking-tight"
            style={{ color: netBalance >= 0 ? "var(--inflow)" : "var(--outflow)" }}
          >
            {formatCurrency(netBalance)}
          </div>
        </div>
      </div>
    </aside>
  );
};

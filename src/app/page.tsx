"use client";

import React, { useState } from "react";
import { FinanceProvider } from "../context/FinanceContext";
import { Sidebar } from "../components/Sidebar";
import { Dashboard } from "../components/Dashboard";
import { CashIn } from "../components/CashIn";
import { Income } from "../components/Income";
import { Expense } from "../components/Expense";
import { Reports } from "../components/Reports";
import { Settings } from "../components/Settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "cash_in" | "income" | "expense" | "reports" | "settings">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <FinanceProvider>
      <div className="flex h-screen bg-background overflow-hidden font-sans">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Backdrop for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Mobile Header Bar */}
          <header className="md:hidden flex items-center justify-between p-4 bg-panel border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center text-white font-bold">৳</div>
              <span className="font-bold text-lg tracking-tight">FinFlow</span>
            </div>
            <button
              className="p-2 text-text-muted hover:text-text-main focus:outline-none"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </button>
          </header>

          <main className="flex-1 overflow-y-auto">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "cash_in" && <CashIn />}
            {activeTab === "income" && <Income />}
            {activeTab === "expense" && <Expense />}
            {activeTab === "reports" && <Reports />}
            {activeTab === "settings" && <Settings />}
          </main>
        </div>
      </div>
    </FinanceProvider>
  );
}

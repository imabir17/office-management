"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useFinance, FlowType } from "../context/FinanceContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ReportPdf } from "./ReportPdf";

type DateFilterType = "today" | "week" | "month" | "year" | "custom" | "all";

export const Reports: React.FC = () => {
  const { transactions, companyProfile } = useFinance();

  const [dateFilter, setDateFilter] = useState<DateFilterType>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | FlowType>("all");
  const [isClient, setIsClient] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedBy, setGeneratedBy] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getTypeLabel = (type: FlowType) => {
    switch (type) {
      case "cash_in": return "Cash In";
      case "income": return "Income";
      case "expense": return "Expense";
      case "salary": return "Salary";
      default: return type;
    }
  };

  // Helper to parse YYYY-MM-DD string to local Date at midnight
  const parseDate = (dStr: string) => {
    const [y, m, d] = dStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Sort transactions by date and time before returning
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedTransactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (dateFilter === "all") return true;

      const txDate = parseDate(tx.date);

      if (dateFilter === "today") {
        return txDate.getTime() === today.getTime();
      }

      if (dateFilter === "week") {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return txDate >= startOfWeek && txDate <= endOfWeek;
      }

      if (dateFilter === "month") {
        return txDate.getFullYear() === today.getFullYear() && txDate.getMonth() === today.getMonth();
      }

      if (dateFilter === "year") {
        return txDate.getFullYear() === today.getFullYear();
      }

      if (dateFilter === "custom") {
        if (!startDate || !endDate) return true;
        const s = parseDate(startDate);
        const e = parseDate(endDate);
        return txDate >= s && txDate <= e;
      }

      return true;
    });
  }, [transactions, dateFilter, startDate, endDate, typeFilter]);

  const reportTotals = useMemo(() => {
    let totalCashIn = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSalary = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === "cash_in") totalCashIn += tx.amount;
      if (tx.type === "income") totalIncome += tx.amount;
      if (tx.type === "expense") totalExpense += tx.amount;
      if (tx.type === "salary") totalSalary += tx.amount;
    });

    const totalOutflow = totalExpense + totalSalary;
    const netFlow = (totalCashIn + totalIncome) - totalOutflow;

    return { totalCashIn, totalIncome, totalExpense, totalSalary, totalOutflow, netFlow };
  }, [filteredTransactions]);

  const startingBalance = useMemo(() => {
    if (dateFilter === "all") return 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filterStartDate = new Date(0); // Epoch as default
    
    if (dateFilter === "today") filterStartDate = today;
    if (dateFilter === "week") {
      filterStartDate = new Date(today);
      filterStartDate.setDate(today.getDate() - today.getDay());
    }
    if (dateFilter === "month") {
      filterStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    if (dateFilter === "year") {
      filterStartDate = new Date(today.getFullYear(), 0, 1);
    }
    if (dateFilter === "custom" && startDate) {
      filterStartDate = parseDate(startDate);
    }

    let balance = 0;
    transactions.forEach(tx => {
      const txDate = parseDate(tx.date);
      if (txDate < filterStartDate) {
        if (tx.type === "cash_in" || tx.type === "income") balance += tx.amount;
        if (tx.type === "expense" || tx.type === "salary") balance -= tx.amount;
      }
    });

    return balance;
  }, [transactions, dateFilter, startDate]);

  const getPdfFilename = () => {
    const safeCompanyName = companyProfile.name.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
    
    if (dateFilter === "today") {
      const todayStr = new Date().toISOString().split("T")[0];
      return `${safeCompanyName}_STATEMENT_${todayStr}.pdf`;
    }
    if (dateFilter === "custom" && startDate && endDate) {
      return `${safeCompanyName}_STATEMENT_${startDate}_TO_${endDate}.pdf`;
    }
    
    return `${safeCompanyName}_STATEMENT_${dateFilter.toUpperCase()}.pdf`;
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-main">Financial Reports</h1>
          <p className="text-sm text-text-muted mt-1">Analyze your cash flows over time</p>
        </div>
        <div>
          <button 
            className="btn btn-secondary" 
            onClick={() => setIsModalOpen(true)}
            disabled={filteredTransactions.length === 0}
          >
            Download PDF Statement
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="panel mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Date Range</span>
          <select
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range...</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {dateFilter === "custom" && (
          <>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Start Date</span>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">End Date</span>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Flow Type</span>
          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="all">All Flow Types</option>
            <option value="cash_in">Cash In Only</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="panel flex flex-col gap-1 border-l-4 border-l-emerald-500/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Cash In</span>
          <span className="text-2xl font-bold text-inflow">{formatCurrency(reportTotals.totalCashIn)}</span>
        </div>
        <div className="panel flex flex-col gap-1 border-l-4 border-l-emerald-500/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Income</span>
          <span className="text-2xl font-bold text-inflow">{formatCurrency(reportTotals.totalIncome)}</span>
        </div>
        <div className="panel flex flex-col gap-1 border-l-4 border-l-red-500/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Expense</span>
          <span className="text-2xl font-bold text-outflow">{formatCurrency(reportTotals.totalExpense)}</span>
        </div>
        <div className="panel flex flex-col gap-1 border-l-4 border-l-primary">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Net Flow for Period</span>
          <span className={`text-2xl font-bold ${reportTotals.netFlow >= 0 ? "text-inflow" : "text-outflow"}`}>
            {formatCurrency(reportTotals.netFlow)}
          </span>
        </div>
      </div>

      {/* Detail Table */}
      <div className="panel p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-slate-800/30">
          <span className="text-lg font-bold">Detailed Transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Purpose</th>
                <th style={{ textAlign: "right" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const isPositive = tx.type === "cash_in" || tx.type === "income";
                return (
                  <tr key={tx.id}>
                    <td>{tx.date}</td>
                    <td>
                      <span className={`badge ${isPositive ? "badge-inflow" : "badge-outflow"}`}>
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td>{tx.purpose}</td>
                    <td
                      className={`text-right font-bold ${isPositive ? "text-inflow" : "text-outflow"}`}
                    >
                      {isPositive ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="flex items-center justify-center p-8 text-sm text-text-muted">
                      No transactions found for this period and filter.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-panel border border-border rounded-sm w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-slate-900/30">
              <span className="font-bold text-lg">Generate Statement</span>
              <button className="text-text-muted hover:text-text-main text-xl" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="form-label">Generated By (Your Name)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Jane Doe"
                  value={generatedBy} 
                  onChange={(e) => setGeneratedBy(e.target.value)} 
                />
                <p className="text-xs text-text-muted mt-1">This will be stamped onto the PDF statement.</p>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                {isClient && generatedBy.length > 0 ? (
                  <PDFDownloadLink
                    document={
                      <ReportPdf 
                        transactions={filteredTransactions} 
                        startingBalance={startingBalance}
                        dateFilter={dateFilter} 
                        companyProfile={companyProfile} 
                        generatedBy={generatedBy}
                        reportTotals={reportTotals}
                      />
                    }
                    fileName={getPdfFilename()}
                    className="btn btn-primary"
                  >
                    {({ loading }) => (loading ? "Generating..." : "Download PDF")}
                  </PDFDownloadLink>
                ) : (
                  <button type="button" className="btn btn-primary opacity-50 cursor-not-allowed" disabled>
                    Enter Name First
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

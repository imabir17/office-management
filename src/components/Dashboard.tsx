"use client";

import React, { useMemo } from "react";
import { useFinance } from "../context/FinanceContext";

export const Dashboard: React.FC = () => {
  const { transactions } = useFinance();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const stats = useMemo(() => {
    let totalCashIn = 0;
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSalary = 0;

    transactions.forEach((tx) => {
      if (tx.type === "cash_in") totalCashIn += tx.amount;
      if (tx.type === "income") totalIncome += tx.amount;
      if (tx.type === "expense") totalExpense += tx.amount;
      if (tx.type === "salary") totalSalary += tx.amount;
    });

    const netBalance = (totalCashIn + totalIncome) - (totalExpense + totalSalary);

    return {
      totalCashIn,
      totalIncome,
      totalExpense,
      totalSalary,
      netBalance,
    };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions].slice(0, 5);
  }, [transactions]);

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Financial Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">High-level overview of company financials</p>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="panel flex flex-col gap-1 border-l-4 border-l-primary">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Net Balance</span>
          <span className={`text-2xl font-bold ${stats.netBalance >= 0 ? "text-inflow" : "text-outflow"}`}>
            {formatCurrency(stats.netBalance)}
          </span>
          <span className="text-xs text-text-muted mt-2">Total Cash Available</span>
        </div>

        <div className="panel flex flex-col gap-1 border-l-4 border-l-emerald-500/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Cash In (Investments)</span>
          <span className="text-2xl font-bold text-inflow">
            {formatCurrency(stats.totalCashIn)}
          </span>
          <span className="text-xs text-text-muted mt-2">From management/CEO</span>
        </div>
        
        <div className="panel flex flex-col gap-1 border-l-4 border-l-emerald-500/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Income (Generated)</span>
          <span className="text-2xl font-bold text-inflow">
            {formatCurrency(stats.totalIncome)}
          </span>
          <span className="text-xs text-text-muted mt-2">Business revenue</span>
        </div>

        <div className="panel flex flex-col gap-1 border-l-4 border-l-red-500/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Expenses</span>
          <span className="text-2xl font-bold text-outflow">
            {formatCurrency(stats.totalExpense)}
          </span>
          <span className="text-xs text-text-muted mt-2">Operational costs</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Transactions List */}
        <div className="panel lg:col-span-2 flex flex-col">
          <div className="mb-4 pb-4 border-b border-border">
            <span className="text-lg font-bold">Recent Activity</span>
          </div>

          <div className="flex flex-col gap-4 flex-grow">
            {recentTransactions.map((tx) => {
              const isPositive = tx.type === "cash_in" || tx.type === "income";
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between pb-3 border-b border-border/50 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col gap-1 max-w-[60%]">
                    <span className="text-sm font-semibold">{tx.purpose}</span>
                    <span className="text-xs text-text-muted truncate">
                      From: {tx.payer} • To: {tx.receiver}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${isPositive ? "text-inflow" : "text-outflow"}`}>
                      {isPositive ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                    <div className="text-xs text-text-muted mt-0.5">
                      {tx.date} at {tx.time}
                    </div>
                  </div>
                </div>
              );
            })}
            {recentTransactions.length === 0 && (
              <div className="flex items-center justify-center h-32 text-sm text-text-muted">
                No recent activity
              </div>
            )}
          </div>
        </div>
        
        {/* Helper panel to redirect to Reports */}
        <div className="panel flex flex-col justify-center items-center text-center p-8 bg-slate-800/30">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-bold mb-2">Need Detailed Analytics?</h3>
            <p className="text-sm text-text-muted mb-6 max-w-xs">
              Head over to the new Reports section for daily, weekly, monthly filtering and comprehensive breakdowns.
            </p>
        </div>
      </div>
    </div>
  );
};

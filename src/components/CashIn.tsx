"use client";

import React, { useState, useMemo } from "react";
import { useFinance, Transaction } from "../context/FinanceContext";
import { useToast } from "../context/ToastContext";

export const CashIn: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [txPayer, setTxPayer] = useState("");
  const [txReceiver, setTxReceiver] = useState("");
  const [txPurpose, setTxPurpose] = useState("");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.type !== "cash_in") return false;
      const lowerSearch = searchTerm.toLowerCase();
      return (
        tx.payer.toLowerCase().includes(lowerSearch) ||
        tx.receiver.toLowerCase().includes(lowerSearch) ||
        tx.purpose.toLowerCase().includes(lowerSearch)
      );
    });
  }, [transactions, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      addToast("Please enter a valid amount", "error");
      return;
    }
    if (!txPayer.trim()) {
      addToast("Please enter the Payer", "error");
      return;
    }
    if (!txReceiver.trim()) {
      addToast("Please enter the Receiver", "error");
      return;
    }
    if (!txPurpose.trim()) {
      addToast("Please enter the Purpose", "error");
      return;
    }
    
    const currentTime = new Date().toTimeString().split(' ')[0];

    addTransaction({
      date: txDate,
      time: currentTime,
      type: "cash_in",
      amount: amountNum,
      payer: txPayer.trim(),
      receiver: txReceiver.trim(),
      purpose: txPurpose.trim(),
    });

    setIsModalOpen(false);
    setTxAmount("");
    setTxPayer("");
    setTxReceiver("");
    setTxPurpose("");
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-main">Cash In</h1>
          <p className="text-sm text-text-muted mt-1">Investments from CEO or Management</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            Record Cash In
          </button>
        </div>
      </div>

      <div className="panel mb-8 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Search</span>
          <input
            type="text"
            className="form-control"
            placeholder="Search payer, receiver or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="panel p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Payer</th>
                <th>Receiver</th>
                <th>Purpose</th>
                <th style={{ textAlign: "right" }}>Amount</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <div>{tx.date}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{tx.time}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{tx.payer}</td>
                  <td style={{ fontWeight: 600 }}>{tx.receiver}</td>
                  <td style={{ color: "var(--text-secondary)", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tx.purpose}
                  </td>
                  <td className="text-inflow text-right font-bold">
                    +{formatCurrency(tx.amount)}
                  </td>
                  <td className="text-center">
                    <button
                      className="text-text-muted hover:text-red-400 transition-colors p-2"
                      title="Delete"
                      onClick={() => {
                        if (confirm("Delete this cash in record?")) deleteTransaction(tx.id);
                      }}
                    >✕</button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="flex items-center justify-center p-8 text-sm text-text-muted">No Cash In records found.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-panel border border-border rounded-sm w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-slate-900/30">
              <span className="font-bold text-lg">Record Cash In</span>
              <button className="text-text-muted hover:text-text-main text-xl" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Amount (৳ BDT)</label>
                  <input type="number" className="form-control" required min="1" step="any" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" required value={txDate} onChange={(e) => setTxDate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Payer (Who invested?)</label>
                  <input type="text" className="form-control" required value={txPayer} onChange={(e) => setTxPayer(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Receiver</label>
                  <input type="text" className="form-control" required value={txReceiver} onChange={(e) => setTxReceiver(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="form-label">Purpose</label>
                <textarea className="form-control" style={{ minHeight: "80px", resize: "vertical" }} required value={txPurpose} onChange={(e) => setTxPurpose(e.target.value)} />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Cash In</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

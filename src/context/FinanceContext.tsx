"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type FlowType = "cash_in" | "income" | "expense" | "salary";

export interface Transaction {
  id: string;
  type: FlowType;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  payer: string;
  receiver: string;
  purpose: string;
}

export interface CompanyProfile {
  name: string;
  logoUrl: string | null;
}

interface FinanceContextProps {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const FinanceContext = createContext<FinanceContextProps | undefined>(undefined);

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    date: "2026-05-01",
    time: "09:30:00",
    type: "cash_in",
    amount: 50000,
    payer: "John Doe (CEO)",
    receiver: "Company Bank Account",
    purpose: "Initial Capital Injection",
  },
  {
    id: "tx-2",
    date: "2026-05-05",
    time: "14:15:00",
    type: "income",
    amount: 15000,
    payer: "Acme Corp",
    receiver: "Company Bank Account",
    purpose: "Software License Renewal",
  },
  {
    id: "tx-3",
    date: "2026-05-10",
    time: "10:00:00",
    type: "expense",
    amount: 3200,
    payer: "Company Bank Account",
    receiver: "WeWork",
    purpose: "May Office Rent",
  },
  {
    id: "tx-4",
    date: "2026-05-15",
    time: "11:45:00",
    type: "expense",
    amount: 600,
    payer: "Company Credit Card",
    receiver: "AWS",
    purpose: "Cloud Hosting April",
  },
  {
    id: "tx-5",
    date: "2026-05-20",
    time: "09:00:00",
    type: "income",
    amount: 8500,
    payer: "Zenith LLC",
    receiver: "Company Bank Account",
    purpose: "Consulting Services",
  },
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({ name: "FinFlow Inc.", logoUrl: null });
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const storedTxs = localStorage.getItem("finflow_transactions_v2");
      const storedProfile = localStorage.getItem("finflow_company_profile");

      if (storedTxs) {
        setTransactions(JSON.parse(storedTxs));
      } else {
        setTransactions(MOCK_TRANSACTIONS);
        localStorage.setItem("finflow_transactions_v2", JSON.stringify(MOCK_TRANSACTIONS));
      }

      if (storedProfile) {
        setCompanyProfile(JSON.parse(storedProfile));
      }

      const storedTheme = localStorage.getItem("finflow_theme");
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      }

    } catch (e) {
      console.error("Failed to load local finance storage data: ", e);
      setTransactions(MOCK_TRANSACTIONS);
    }
    setIsLoaded(true);
  }, []);

  // Sync back to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("finflow_transactions_v2", JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("finflow_company_profile", JSON.stringify(companyProfile));
    }
  }, [companyProfile, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("finflow_theme", theme);
      if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    }
  }, [theme, isLoaded]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const addTransaction = (tx: Omit<Transaction, "id">) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    // Prepend to show newest transactions first
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateCompanyProfile = (profile: Partial<CompanyProfile>) => {
    setCompanyProfile((prev) => ({ ...prev, ...profile }));
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        companyProfile,
        updateCompanyProfile,
        theme,
        toggleTheme
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
};

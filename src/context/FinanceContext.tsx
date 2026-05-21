"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

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
  user: User | null;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);

  // Initialize Auth & Theme
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("finflow_theme");
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      }
    } catch (e) {
      console.error(e);
    }
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    setIsLoaded(true);
    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setCompanyProfile({ name: "FinFlow Inc.", logoUrl: null });
      return;
    }

    const fetchData = async () => {
      // Fetch profile
      const { data: profile } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (profile) {
        setCompanyProfile({ name: profile.company_name, logoUrl: profile.logo_url });
      }

      // Fetch transactions
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("time", { ascending: false });

      if (txs) {
        setTransactions(txs as Transaction[]);
      }
    };

    fetchData();
  }, [user]);

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

  const addTransaction = async (tx: Omit<Transaction, "id">) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("transactions")
      .insert({ ...tx, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error("Error adding transaction:", error);
      return;
    }
    setTransactions((prev) => [data as Transaction, ...prev]);
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      console.error("Error deleting transaction:", error);
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const updateCompanyProfile = async (profile: Partial<CompanyProfile>) => {
    if (!user) return;
    const newProfile = { ...companyProfile, ...profile };
    setCompanyProfile(newProfile);

    const { error } = await supabase.from("company_profiles").upsert(
      {
        user_id: user.id,
        company_name: newProfile.name,
        logo_url: newProfile.logoUrl,
      },
      { onConflict: "user_id" }
    );

    if (error) console.error("Error updating profile:", error);
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
        toggleTheme,
        user,
        logout
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

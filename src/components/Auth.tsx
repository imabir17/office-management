"use client";

import React, { useState } from "react";
import { supabase } from "../lib/supabase";

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Success! Please check your email for a confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--background)] p-4">
      <div className="panel w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-md bg-[var(--primary)] items-center justify-center text-white font-bold text-2xl mb-4">
            ৳
          </div>
          <h1 className="title">Welcome to FinFlow</h1>
          <p className="subtitle mt-1">Enterprise Financial Management</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-sm text-sm text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-4 py-3 text-base"
            disabled={loading}
          >
            {loading ? "Authenticating..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--text-muted)] border-t border-[var(--border)] pt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
          >
            {isSignUp ? "Sign In" : "Create one now"}
          </button>
        </div>
      </div>
    </div>
  );
};

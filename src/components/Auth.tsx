"use client";

import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

export const Auth = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
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
        addToast("Success! Please check your email for a confirmation link.", "success");
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      addToast("Password reset email sent! Please check your inbox.", "success");
      setIsResetPassword(false);
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--background)] p-4">
      <div className="panel w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="FinFlow Logo" className="w-16 h-16 object-contain mb-4 mx-auto" />
          <h1 className="title">Welcome to FinFlow</h1>
          <p className="subtitle mt-1">Enterprise Financial Management</p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-sm text-sm text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={isResetPassword ? handleResetPassword : handleAuth} className="flex flex-col gap-4">
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
          
          {!isResetPassword && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="form-label">Password</label>
                {!isSignUp && (
                  <button 
                    type="button" 
                    className="text-xs text-[var(--primary)] hover:underline"
                    onClick={() => {
                      setIsResetPassword(true);
                      setErrorMsg(null);
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary mt-4 py-3 text-base"
            disabled={loading}
          >
            {loading ? "Please wait..." : isResetPassword ? "Send Reset Link" : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[var(--text-muted)] border-t border-[var(--border)] pt-6">
          {isResetPassword ? (
            <button
              type="button"
              className="font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
              onClick={() => {
                setIsResetPassword(false);
                setErrorMsg(null);
              }}
            >
              Back to Sign In
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

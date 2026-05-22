"use client";

import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

interface ResetPasswordProps {
  onSuccess: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onSuccess }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match!", "error");
      return;
    }

    if (newPassword.length < 6) {
      addToast("Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      addToast("Password reset successfully! You can now log in.", "success");
      onSuccess();
    } catch (err: any) {
      addToast(err.message || "Failed to reset password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--background)] p-4">
      <div className="panel w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="FinFlow Logo" className="w-16 h-16 object-cover rounded-full mb-4 mx-auto shadow-md" />
          <h1 className="title">Reset Password</h1>
          <p className="subtitle mt-1">Please enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-4 py-3 text-base"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useRef } from "react";
import { useFinance } from "../context/FinanceContext";

export const Settings: React.FC = () => {
  const { companyProfile, updateCompanyProfile } = useFinance();
  const [name, setName] = useState(companyProfile.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile({ name });
    alert("Company name updated successfully!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateCompanyProfile({ logoUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    updateCompanyProfile({ logoUrl: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Manage your company profile for reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="panel flex flex-col">
          <div className="mb-4 pb-4 border-b border-border">
            <h2 className="text-lg font-bold">Company Information</h2>
            <p className="text-xs text-text-muted mt-1">This name appears on your PDF statements.</p>
          </div>

          <form onSubmit={handleNameSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="submit" className="btn btn-primary">
                Save Name
              </button>
            </div>
          </form>
        </div>

        <div className="panel flex flex-col">
          <div className="mb-4 pb-4 border-b border-border">
            <h2 className="text-lg font-bold">Company Logo</h2>
            <p className="text-xs text-text-muted mt-1">Will be displayed on your PDF statements.</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-48 h-32 border-2 border-dashed border-border rounded-sm flex items-center justify-center bg-slate-900/50 overflow-hidden p-2">
              {companyProfile.logoUrl ? (
                <img src={companyProfile.logoUrl} alt="Company Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-sm text-text-muted">No logo uploaded</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full justify-center">
              <input
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button 
                className="btn btn-secondary text-xs" 
                onClick={() => fileInputRef.current?.click()}
              >
                Upload New Logo
              </button>
              {companyProfile.logoUrl && (
                <button 
                  className="btn btn-secondary text-xs text-red-400 hover:text-red-500" 
                  onClick={removeLogo}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

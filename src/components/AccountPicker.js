// components/AccountPicker.jsx
"use client";
import React from "react";

export default function AccountPicker({ accounts, active, onSelect }) {
  if (!accounts || !accounts.length) return null;
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm">Account:</label>
      <select
        className="border rounded p-1 text-black"
        value={active || ""}
        onChange={(e) => onSelect(e.target.value)}
      >
        {accounts.map((a) => (
          <option className=" text-black" key={a} value={a}>
            {a.slice(0, 6)}...{a.slice(-4)}
          </option>
        ))}
      </select>
    </div>
  );
}

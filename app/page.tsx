"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          username: username,
          password: password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem("operator", JSON.stringify(result.operator));
        router.push("/dashboard");
      } else {
        setError(result.message || "نام کاربری یا رمز عبور اشتباه است.");
      }
    } catch {
      setError("خطا در برقراری ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-[#fafafa] font-sans antialiased" dir="rtl">
      <div className="w-full max-w-md p-8 bg-[#18181b] rounded-xl border border-[#27272a] shadow-2xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">خوش آمدید</h1>
          <p className="text-sm text-[#a1a1aa]">جهت ورود به پنل فروش، اطلاعات اپراتور را وارد کنید.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#e4e4e7]">نام کاربری</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-left font-mono focus:outline-none focus:border-[#2563eb] transition-colors duration-200"
              placeholder="username"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#e4e4e7]">رمز عبور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-left font-mono focus:outline-none focus:border-[#2563eb] transition-colors duration-200"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#fafafa] text-[#09090b] font-bold rounded-lg text-sm hover:bg-[#e4e4e7] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "در حال بررسی اطلاعات..." : "ورود به پنل"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Lead {
  rowId: number;
  "نام و نام خانوادگی"?: string;
  "شماره تماس"?: string | number;
  "محصول مورد نظر"?: string;
  "سورس ورودی "?: string;
  "سورس ورودی"?: string;
  "تاریخ ورودی"?: string;
  "وضعیت"?: string;
  "توضیحات تماس"?: string;
  [key: string]: string | number | undefined;
}

function leadSource(lead: Lead) {
  return lead["سورس ورودی "] || lead["سورس ورودی"] || "";
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [operator, setOperator] = useState<{ name: string } | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm?action=getLeads");
      const result = await res.json();
      if (result.success) {
        setLeads(result.data.reverse());
      }
    } catch (err) {
      console.error("خطا در دریافت لیدها", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedOperator = localStorage.getItem("operator");
    if (!savedOperator) {
      router.push("/");
      return;
    }

    queueMicrotask(() => {
      setOperator(JSON.parse(savedOperator));
      void fetchLeads();
    });
  }, [fetchLeads, router]);

  const handleOpenFollowUp = (lead: Lead) => {
    setSelectedLead(lead);
    // ✅ FIX #3: textarea خالی شروع می‌شه — فقط کامنت جدید نوشته می‌شه
    setComment("");
    setStatus(lead["وضعیت"] || "جدید");
  };

  const handleSaveFollowUp = async () => {
    if (!selectedLead || !operator) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateLead",
          rowId: selectedLead.rowId,
          status: status,
          comment: comment,
          operatorName: operator.name,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setSelectedLead(null);
        fetchLeads();
      } else {
        alert("خطا: " + (result.message || "مشکل نامشخص"));
      }
    } catch {
      alert("خطا در ذخیره اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("operator");
    router.push("/");
  };

  const totalLeads = leads.length;
  const successfulLeads = leads.filter((l) => l["وضعیت"] === "موفق").length;
  const pendingLeads = leads.filter(
    (l) => l["وضعیت"] === "در حال پیگیری"
  ).length;
  const successRate =
    totalLeads > 0 ? Math.round((successfulLeads / totalLeads) * 100) : 0;

  return (
    <div
      className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans"
      dir="rtl"
    >
      <header className="flex justify-between items-center px-8 py-4 bg-[#18181b] border-b border-[#27272a]">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">میز کار فروش پیکس‌دنت</h1>
          <span className="text-xs text-[#a1a1aa] bg-[#27272a] px-2 py-1 rounded">
            اپراتور آنلاین: {operator?.name}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-red-400 hover:text-red-300 hover:underline transition-colors"
        >
          خروج از سیستم
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-[#18181b] p-6 border-l border-[#27272a] space-y-6 hidden md:block">
          <h2 className="text-sm font-semibold text-[#a1a1aa] border-b border-[#27272a] pb-2">
            📊 گزارشات این ماه
          </h2>
          <div className="space-y-4">
            <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a]">
              <p className="text-xs text-[#a1a1aa]">کل ورودی‌ها</p>
              <p className="text-xl font-bold mt-1">{totalLeads} لید</p>
            </div>
            <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a]">
              <p className="text-xs text-[#a1a1aa]">نرخ موفقیت تماس</p>
              <p className="text-xl font-bold text-green-400 mt-1">
                {successRate}%
              </p>
            </div>
            <div className="bg-[#09090b] p-4 rounded-lg border border-[#27272a]">
              <p className="text-xs text-[#a1a1aa]">در حال پیگیری</p>
              <p className="text-xl font-bold text-yellow-500 mt-1">
                {pendingLeads}
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="text-center text-sm text-[#a1a1aa] mt-20 animate-pulse">
              در حال لود کردن داده‌ها از گوگل شیت...
            </div>
          ) : (
            <div className="border border-[#27272a] rounded-xl overflow-hidden bg-[#18181b]">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-[#27272a] text-xs text-[#e4e4e7] border-b border-[#27272a]">
                      <th className="p-4">نام متقاضی</th>
                      <th className="p-4">شماره تماس</th>
                      <th className="p-4">محصول مورد نظر</th>
                      <th className="p-4">سایت منبع</th>
                      <th className="p-4">تاریخ ورودی</th>
                      <th className="p-4 text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[#27272a]">
                    {leads.map((lead) => {
                      let rowBg =
                        "hover:bg-[#27272a]/30 transition-colors";
                      const statusValue = lead["وضعیت"]
                        ? lead["وضعیت"].toString().trim()
                        : "";

                      if (
                        !statusValue ||
                        statusValue === "جدید" ||
                        statusValue === ""
                      ) {
                        rowBg =
                          "bg-red-950/10 border-r-4 border-red-500 hover:bg-red-950/20 transition-colors";
                      } else if (statusValue === "در حال پیگیری") {
                        rowBg =
                          "bg-yellow-950/10 border-r-4 border-yellow-500 hover:bg-yellow-950/20 transition-colors";
                      } else if (statusValue === "موفق") {
                        rowBg =
                          "bg-green-950/10 border-r-4 border-green-500 hover:bg-green-950/20 transition-colors";
                      }

                      return (
                        <tr key={lead.rowId} className={rowBg}>
                          <td className="p-4 font-medium">
                            {lead["نام و نام خانوادگی"] || "—"}
                          </td>
                          <td className="p-4 font-mono">
                            <a
                              href={`tel:${lead["شماره تماس"]}`}
                              className="text-blue-400 hover:underline"
                            >
                              {lead["شماره تماس"]}
                            </a>
                          </td>
                          <td className="p-4 text-[#e4e4e7]">
                            {lead["محصول مورد نظر"] || "—"}
                          </td>
                          <td className="p-4 text-xs text-[#a1a1aa]">
                            {leadSource(lead) || "—"}
                          </td>
                          <td className="p-4 text-xs text-[#a1a1aa]">
                            {lead["تاریخ ورودی"]
                              ? String(lead["تاریخ ورودی"]).split("T")[0]
                              : "—"}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleOpenFollowUp(lead)}
                              className="px-3 py-1 bg-[#27272a] text-xs font-medium rounded hover:bg-[#3f3f46] transition-colors border border-[#3f3f46]"
                            >
                              پیگیری
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedLead && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm z-50">
          <div className="bg-[#18181b] w-full max-w-md p-6 rounded-xl border border-[#27272a] shadow-2xl space-y-4">
            <h3 className="text-base font-bold">
              📝 ثبت گزارش: {selectedLead["نام و نام خانوادگی"] || "—"}
            </h3>
            <p className="text-xs text-[#a1a1aa]">
              شماره تماس: {selectedLead["شماره تماس"]}
            </p>

            {/* نمایش تاریخچه کامنت‌های قبلی */}
            {selectedLead["توضیحات تماس"] && (
              <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-3 max-h-28 overflow-y-auto">
                <p className="text-xs text-[#a1a1aa] mb-1">📋 تاریخچه پیگیری‌ها:</p>
                <pre className="text-xs text-[#71717a] whitespace-pre-wrap font-sans">
                  {String(selectedLead["توضیحات تماس"])}
                </pre>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-[#e4e4e7]">وضعیت تماس</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="جدید">🔴 جدید (بدون اقدام)</option>
                <option value="در حال پیگیری">
                  🟡 در حال پیگیری / زنگ زده شده
                </option>
                <option value="موفق">🟢 موفق (اتمام فرآیند فروش)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#e4e4e7]">
                یادداشت جدید مکالمه
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-blue-500 text-white placeholder-[#52525b]"
                placeholder="خلاصه مکالمه جدید با مشتری را اینجا بنویسید..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveFollowUp}
                disabled={submitting}
                className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {submitting ? "در حال ثبت اطلاعات..." : "ثبت و آپدیت گوگل‌شیت"}
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-[#27272a] text-sm rounded-lg hover:bg-[#3f3f46] transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

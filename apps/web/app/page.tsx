"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/app";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

type Job = {
  id: string;
  status: string;
  payload: any
  attempts: number;
};

const isTerminalState = (status: string) => status === "COMPLETED" || status === "FAILED";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "RUNNING" | "FAILED" | "COMPLETED">("ALL");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchJobs = async () => {
    const { data } = await axios.get(`${API_BASE}/jobs`);
    setJobs(data.data);
  };

  const submitJob = async () => {
    setLoading(true);

    await axios.post(`${API_BASE}/jobs`, {
      payload: JSON.stringify({
        foo: "bar",
      }),
    });

    setLoading(false);
    fetchJobs();
  };

  useEffect(() => {
    const activeTask = jobs.some((job) => !isTerminalState(job.status));

    if (!activeTask) return

    const interval = setInterval(fetchJobs, 2000)

    return () => clearInterval(interval)
  }, [jobs]);

  useEffect(() => {
    fetchJobs();
  })

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesFilter =
        filter === "ALL" ? true : job.status === filter;
      const matchesSearch = job.id.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [jobs, filter, search]);

  const statusColor = (status: string) =>
  ({
    QUEUED: "bg-yellow-100 text-yellow-800",
    RUNNING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800"
  }[status] ?? "bg-gray-100 text-gray-800");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Async Job Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Background job monitoring
            </p>
          </div>

          <button
            onClick={submitJob}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium 
                     hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Create Job"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* Search */}
          <div className="relative w-full md:w-80">
            <input
              placeholder="Search by Job ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white 
                       text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {["ALL", "RUNNING", "COMPLETED", "FAILED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as any)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition
                ${filter === tab
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs */}
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const isRunning = job.status === "RUNNING";
            const isExpanded = expanded === job.id;

            const statusColor = {
              QUEUED: "bg-yellow-100 text-yellow-800",
              RUNNING: "bg-blue-100 text-blue-800",
              COMPLETED: "bg-green-100 text-green-800",
              FAILED: "bg-red-100 text-red-800"
            }[job.status] ?? "bg-gray-100 text-gray-800";

            return (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition"
              >
                {/* Top Row */}
                <div
                  onClick={() =>
                    setExpanded(isExpanded ? null : job.id)
                  }
                  className="cursor-pointer px-5 py-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${isRunning
                          ? "bg-blue-500 animate-pulse"
                          : "bg-gray-400"
                        }`}
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {job.id}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Attempts: {job.attempts}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor}`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Expand Section (No heavy animation) */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t bg-gray-50 text-xs font-mono text-gray-600 whitespace-pre-wrap">
                    <div className="mb-2 font-medium text-gray-500">
                      Payload
                    </div>
                    {JSON.stringify(job.payload ?? {}, null, 2)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
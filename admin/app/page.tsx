"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { apiFetch } from "../lib/api";
import { clearAuth, getStoredUser } from "../lib/auth";

interface FeatureFlag {
  id: string;
  featureKey: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

function DashboardContent() {
  const router = useRouter();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [orgName, setOrgName] = useState("Your organization");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featureKey, setFeatureKey] = useState("");
  const [enableImmediately, setEnableImmediately] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser?.orgName) {
      setOrgName(storedUser.orgName);
    }
  }, []);

  async function loadFlags() {
    setIsLoading(true);
    setError("");

    try {
      const data = await apiFetch<FeatureFlag[]>("/api/flags");
      setFlags(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load flags");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFlags();
  }, []);

  async function handleToggle(flag: FeatureFlag) {
    setError("");
    const previous = flags;
    const nextValue = !flag.isEnabled;
    setFlags(
      previous.map((currentFlag) =>
        currentFlag.id === flag.id ? { ...currentFlag, isEnabled: nextValue } : currentFlag
      )
    );

    try {
      await apiFetch<FeatureFlag>(`/api/flags/${flag.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isEnabled: nextValue })
      });
    } catch (toggleError) {
      setFlags(previous);
      setError(toggleError instanceof Error ? toggleError.message : "Unable to update flag");
    }
  }

  async function handleDelete(flagId: string) {
    if (!window.confirm("Delete this feature flag?")) {
      return;
    }

    setError("");

    try {
      await apiFetch<{ message: string }>(`/api/flags/${flagId}`, {
        method: "DELETE"
      });
      setFlags((currentFlags) => currentFlags.filter((flag) => flag.id !== flagId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete flag");
    }
  }

  async function handleCreateFlag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const created = await apiFetch<FeatureFlag>("/api/flags", {
        method: "POST",
        body: JSON.stringify({
          featureKey,
          isEnabled: enableImmediately
        })
      });

      setFlags((currentFlags) => [created, ...currentFlags]);
      setFeatureKey("");
      setEnableImmediately(false);
      setIsModalOpen(false);
      setSuccess("Feature flag created successfully");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to create flag";
      setModalError(
        message === "Feature key already exists"
          ? "This feature key already exists for your organization"
          : message
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] bg-slatebase px-8 py-8 text-white shadow-panel">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-sky-200/80">
                {orgName}
              </p>
              <h1 className="mt-4 font-[var(--font-heading)] text-4xl font-semibold">
                Feature flags dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Create release toggles, roll them out safely, and keep every flag isolated to your tenant.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-2xl bg-azure px-5 py-3 text-sm font-semibold text-white transition hover:bg-tide"
                onClick={() => setIsModalOpen(true)}
                type="button"
              >
                New Flag
              </button>
              <button
                className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-panel backdrop-blur">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="font-[var(--font-heading)] text-2xl font-semibold text-slatebase">
                Current flags
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Toggles update the backend immediately and remain scoped to your organization.
              </p>
            </div>
            <div className="rounded-2xl bg-skyglass px-4 py-3 text-sm text-slate-600">
              {flags.length} flag{flags.length === 1 ? "" : "s"}
            </div>
          </div>

          {success ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Feature Key</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td className="px-5 py-6 text-slate-500" colSpan={3}>
                      Loading flags...
                    </td>
                  </tr>
                ) : flags.length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-slate-500" colSpan={3}>
                      No flags created yet.
                    </td>
                  </tr>
                ) : (
                  flags.map((flag) => (
                    <tr key={flag.id}>
                      <td className="px-5 py-4 font-medium text-slatebase">{flag.featureKey}</td>
                      <td className="px-5 py-4">
                        <button
                          className={`inline-flex min-w-28 items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                            flag.isEnabled
                              ? "bg-emerald-100 text-mint hover:bg-emerald-200"
                              : "bg-rose-100 text-ember hover:bg-rose-200"
                          }`}
                          onClick={() => handleToggle(flag)}
                          type="button"
                        >
                          {flag.isEnabled ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ember transition hover:bg-rose-50"
                          onClick={() => handleDelete(flag.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/80 bg-white p-6 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-azure">New Flag</p>
                <h3 className="mt-3 font-[var(--font-heading)] text-2xl font-semibold text-slatebase">
                  Create feature toggle
                </h3>
              </div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-50"
                onClick={() => {
                  setIsModalOpen(false);
                  setModalError("");
                }}
                type="button"
              >
                Close
              </button>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleCreateFlag}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Feature Key</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-azure focus:bg-white"
                  value={featureKey}
                  onChange={(event) => setFeatureKey(event.target.value)}
                  placeholder="new_checkout_flow"
                  required
                />
              </label>

              <button
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                  enableImmediately
                    ? "bg-emerald-100 text-mint hover:bg-emerald-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setEnableImmediately((current) => !current)}
                type="button"
              >
                {enableImmediately ? "Enabled on creation" : "Enable immediately"}
              </button>

              {modalError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {modalError}
                </div>
              ) : null}

              <button
                className="w-full rounded-2xl bg-azure px-4 py-3 text-sm font-semibold text-white transition hover:bg-tide disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Flag"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["org_admin"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

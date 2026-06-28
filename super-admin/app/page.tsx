"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { apiFetch } from "../lib/api";
import { clearAuth } from "../lib/auth";

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function DashboardContent() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadOrganizations() {
    setIsLoading(true);
    setError("");

    try {
      const data = await apiFetch<Organization[]>("/api/orgs");
      setOrganizations(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to fetch organizations");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrganizations();
  }, []);

  const totalOrganizations = useMemo(() => organizations.length, [organizations]);

  async function handleCreateOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await apiFetch<Organization>("/api/orgs", {
        method: "POST",
        body: JSON.stringify({ name, slug })
      });

      setIsModalOpen(false);
      setName("");
      setSlug("");
      setSlugTouched(false);
      setSuccess("Organization created successfully");
      await loadOrganizations();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Unable to create organization";
      setModalError(message === "Slug already taken" ? "Slug already taken" : message);
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
        <header className="flex flex-col gap-6 rounded-[2rem] bg-ink px-8 py-8 text-white shadow-panel sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-200/80">
              Feature-Flag Control
            </p>
            <h1 className="mt-4 font-[var(--font-heading)] text-4xl font-semibold">
              Tenant administration
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Spin up organizations and hand off each tenant to its own admin team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-2xl bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-amber-300"
              onClick={() => setIsModalOpen(true)}
              type="button"
            >
              Create Organization
            </button>
            <button
              className="rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.36fr_1fr]">
          <div className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-panel backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Overview</p>
            <div className="mt-6 rounded-3xl bg-mist p-5">
              <p className="text-sm text-slate-500">Organizations</p>
              <p className="mt-2 font-[var(--font-heading)] text-4xl font-semibold text-ink">
                {totalOrganizations}
              </p>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              Every org has isolated users and feature flags. Slugs remain globally unique.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-panel backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-[var(--font-heading)] text-2xl font-semibold text-ink">
                  Organization list
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Publicly available for signup flows, privately managed here.
                </p>
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
                    <th className="px-5 py-4 font-medium">Name</th>
                    <th className="px-5 py-4 font-medium">Slug</th>
                    <th className="px-5 py-4 font-medium">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td className="px-5 py-6 text-slate-500" colSpan={3}>
                        Loading organizations...
                      </td>
                    </tr>
                  ) : organizations.length === 0 ? (
                    <tr>
                      <td className="px-5 py-6 text-slate-500" colSpan={3}>
                        No organizations found.
                      </td>
                    </tr>
                  ) : (
                    organizations.map((organization) => (
                      <tr key={organization.id}>
                        <td className="px-5 py-4 font-medium text-ink">{organization.name}</td>
                        <td className="px-5 py-4 text-slate-600">{organization.slug}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {new Date(organization.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/80 bg-white p-6 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-moss">New Organization</p>
                <h3 className="mt-3 font-[var(--font-heading)] text-2xl font-semibold text-ink">
                  Create tenant
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

            <form className="mt-8 space-y-5" onSubmit={handleCreateOrganization}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-moss focus:bg-white"
                  value={name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setName(value);
                    if (!slugTouched) {
                      setSlug(slugify(value));
                    }
                  }}
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Slug</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-moss focus:bg-white"
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value);
                  }}
                  required
                />
              </label>

              {modalError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {modalError}
                </div>
              ) : null}

              <button
                className="w-full rounded-2xl bg-pine px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Organization"}
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
    <ProtectedRoute allowedRoles={["super_admin"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

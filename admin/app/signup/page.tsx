"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { saveAuth, StoredUser } from "../../lib/auth";

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

interface SignupResponse {
  token: string;
  user: StoredUser;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgId, setOrgId] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [error, setError] = useState("");
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const data = await apiFetch<Organization[]>("/api/orgs");
        setOrganizations(data);
        if (data.length > 0) {
          setOrgId(data[0].id);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load organizations"
        );
      } finally {
        setIsLoadingOrgs(false);
      }
    }

    loadOrganizations();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiFetch<SignupResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          orgId,
          role: "org_admin"
        })
      });

      const selectedOrg = organizations.find((organization) => organization.id === orgId);
      saveAuth(response.token, {
        ...response.user,
        orgName: selectedOrg?.name
      });
      router.push("/");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to sign up"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel backdrop-blur sm:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-azure">
          Admin Signup
        </p>
        <h1 className="mt-4 font-[var(--font-heading)] text-3xl font-semibold text-slatebase">
          Create your organization admin account
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Already onboarded?{" "}
          <Link className="font-semibold text-azure hover:text-tide" href="/login">
            Sign in instead
          </Link>
          .
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Full Name</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-azure focus:bg-white"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-azure focus:bg-white"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-azure focus:bg-white"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Organization</span>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-azure focus:bg-white"
              value={orgId}
              onChange={(event) => setOrgId(event.target.value)}
              required
              disabled={isLoadingOrgs || organizations.length === 0}
            >
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            className="w-full rounded-2xl bg-azure px-4 py-3 text-sm font-semibold text-white transition hover:bg-tide disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting || isLoadingOrgs || organizations.length === 0}
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </main>
  );
}

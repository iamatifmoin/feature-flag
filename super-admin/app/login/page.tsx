"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { clearAuth, getStoredToken, parseToken, saveAuth, StoredUser } from "../../lib/auth";

interface LoginResponse {
  token: string;
  user: StoredUser;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      return;
    }

    const payload = parseToken(token);
    if (payload?.role === "super_admin") {
      router.replace("/");
    } else {
      clearAuth();
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      if (response.user.role !== "super_admin") {
        clearAuth();
        setError("Access denied");
        return;
      }

      saveAuth(response.token, response.user);
      router.push("/");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to login"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-panel backdrop-blur md:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden bg-ink px-10 py-12 text-white md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-200/80">
              Feature-Flag
            </p>
            <h1 className="mt-6 font-[var(--font-heading)] text-4xl font-semibold leading-tight">
              Govern every tenant from one command surface.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Create organizations, bootstrap admins, and keep the rollout graph clean.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200">
            Super admins can create organizations and unlock each tenant workspace.
          </div>
        </section>

        <section className="px-6 py-10 sm:px-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-moss">
              Super Admin Login
            </p>
            <h2 className="mt-4 font-[var(--font-heading)] text-3xl font-semibold text-ink">
              Sign in to Feature-Flag
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use the system-level credentials configured in the backend environment.
            </p>

            <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-moss focus:bg-white"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-moss focus:bg-white"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                className="w-full rounded-2xl bg-pine px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Login"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

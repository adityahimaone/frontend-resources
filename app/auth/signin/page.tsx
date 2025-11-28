"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const errorParam = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error("SignIn error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border-2 border-black shadow-neo p-8">
      <h1 className="text-3xl font-black uppercase tracking-tighter text-center mb-6 text-black">
        Sign In
      </h1>

      {(error || errorParam) && (
        <div className="mb-4 p-3 text-sm font-bold text-black bg-red-400 border-2 border-black">
          {error || "Authentication failed. Please try again."}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-bold text-black mb-2 uppercase"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            className="w-full px-4 py-3 border-2 border-black bg-white text-black font-medium shadow-neo-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-bold text-black mb-2 uppercase"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 border-2 border-black bg-white text-black font-medium shadow-neo-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-green-400 hover:bg-green-500 disabled:bg-gray-300 text-black font-black uppercase border-2 border-black shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-bold text-black">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-black underline decoration-2 decoration-pink-400 hover:bg-pink-400 px-1 transition-all"
        >
          Sign up
        </Link>
      </p>

      <p className="mt-4 text-center text-sm font-bold text-black">
        <Link
          href="/"
          className="text-black underline decoration-2 decoration-blue-400 hover:bg-blue-400 px-1 transition-all"
        >
          ← Back to Home
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-300 px-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-20 h-20 bg-pink-400 border-2 border-black shadow-neo rotate-12 hidden md:block"></div>
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-blue-400 border-2 border-black shadow-neo rounded-full hidden md:block"></div>
      <div className="absolute top-1/3 right-10 w-12 h-12 bg-green-400 border-2 border-black shadow-neo hidden md:block"></div>
      <Suspense
        fallback={<div className="font-black text-black">Loading...</div>}
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}

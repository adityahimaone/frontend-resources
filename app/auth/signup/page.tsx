"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto sign in after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Account created but failed to sign in. Please try signing in manually."
        );
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-300 px-4 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-400 border-2 border-black shadow-neo rotate-12 hidden md:block"></div>
      <div className="absolute bottom-20 left-20 w-16 h-16 bg-blue-400 border-2 border-black shadow-neo rounded-full hidden md:block"></div>
      <div className="absolute top-1/3 left-10 w-12 h-12 bg-green-400 border-2 border-black shadow-neo hidden md:block"></div>
      <div className="w-full max-w-md bg-white border-2 border-black shadow-neo p-8 relative z-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-center mb-6 text-black">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 p-3 text-sm font-bold text-black bg-red-400 border-2 border-black">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-bold text-black mb-2 uppercase"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 border-2 border-black bg-white text-black font-medium shadow-neo-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all focus:outline-none"
            />
          </div>

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
              placeholder="you@example.com"
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-bold text-black mb-2 uppercase"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border-2 border-black bg-white text-black font-medium shadow-neo-sm focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-400 hover:bg-blue-500 disabled:bg-gray-300 text-black font-black uppercase border-2 border-black shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-bold text-black">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-black underline decoration-2 decoration-green-400 hover:bg-green-400 px-1 transition-all"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-sm font-bold text-black">
          <Link
            href="/"
            className="text-black underline decoration-2 decoration-yellow-400 hover:bg-yellow-400 px-1 transition-all"
          >
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}

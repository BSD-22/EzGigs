"use client";

import { actionRegisterHandler } from "@/services/register";
import { useActionState } from "react";
import Link from "next/link";

const initialState = {
  success: false,
  message: "",
};

export default function RegisterPage() {
  const [state, dispatch] = useActionState(actionRegisterHandler, initialState);

  return (
    <div className="min-h-screen flex">
      {/* Left side with aesthetic vibes */}
      <div className="flex-1 bg-gradient-to-br from-[#FF2D55] via-[#8E2DE2] to-[#00F5A0] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10 backdrop-blur-sm"></div>
        <div className="text-center relative z-10">
          <div className="w-40 h-40 mx-auto bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-[#00F5A0]/30">
            <span className="text-white text-5xl font-black">TIXID</span>
          </div>
          <h1 className="mt-8 text-4xl font-black text-white">Join The Party! 🎪</h1>
          <p className="mt-4 text-white text-opacity-90 text-lg font-medium">Your gateway to unforgettable concerts! ✨</p>
        </div>
      </div>

      {/* Right side with register form */}
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A]">
        <div className="max-w-md w-full space-y-8 p-10 bg-black/40 backdrop-blur-xl rounded-3xl border border-[#8E2DE2]/20">
          <div>
            <h2 className="text-center text-4xl font-black bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] text-transparent bg-clip-text">Create Account</h2>
            <p className="mt-2 text-center text-gray-400">Join thousands of concert lovers! 🎵</p>
            {state.message && <p className="mt-2 text-center text-red-400">{state.message}</p>}
          </div>
          <form
            action={dispatch}
            className="mt-8 space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-white text-sm font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={state.input?.name}
                className="w-full px-4 py-3 bg-white/10 border border-[#8E2DE2]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00F5A0] focus:border-transparent transition-all"
                placeholder="Your full name"
              />
              {state.error?.name && <p className="text-red-400 text-sm mt-1">{state.error.name[0]}</p>}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-white text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={state.input?.email}
                className="w-full px-4 py-3 bg-white/10 border border-[#8E2DE2]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00F5A0] focus:border-transparent transition-all"
                placeholder="your.email@example.com"
              />
              {state.error?.email && <p className="text-red-400 text-sm mt-1">{state.error.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-white text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                defaultValue={state.input?.password}
                className="w-full px-4 py-3 bg-white/10 border border-[#8E2DE2]/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00F5A0] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              {state.error?.password && <p className="text-red-400 text-sm mt-1">{state.error.password[0]}</p>}
            </div>
            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-[#8E2DE2] to-[#00F5A0] hover:from-[#7928CA] hover:to-[#00D38B] text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00F5A0] focus:ring-offset-2 focus:ring-offset-black">
                Create Account 🎟️
              </button>
            </div>
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-[#00F5A0] transition-colors">
                Already have an account? Sign in here! 🎭
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

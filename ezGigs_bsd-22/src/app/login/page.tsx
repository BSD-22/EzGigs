"use client";

import { actionLoginHandler } from "@/services/login";
import { useActionState } from "react";
import Link from "next/link";
import FlashErrorComponents from "@/components/FlashErrorComponents";
import Image from "next/image";

const initialState = {
  success: false,
  message: "",
};

export default function LoginPage() {
  const [state, dispatch] = useActionState(actionLoginHandler, initialState);

  return (
    <>
      <FlashErrorComponents>
        <div className="min-h-screen bg-[#E8EBE4] relative overflow-hidden">
          {/* Background effects - sedikit lebih gelap */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#00D2FF]/20 via-[#3A7BD5]/10 to-transparent"></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#00D2FF]/30 rounded-full blur-[128px] animate-pulse"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#3A7BD5]/30 rounded-full blur-[128px] animate-pulse"></div>

          {/* Main Content */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl w-full max-w-5xl overflow-hidden flex shadow-2xl border border-[#00D2FF]/20">
              {/* Left Side - Hero Image */}
              <div className="w-1/2 relative hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00D2FF] to-[#3A7BD5]">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-white/20 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 border-4 border-white/20 rounded-full animate-pulse delay-300"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white/20 rounded-full animate-pulse delay-700"></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                    <div className="w-40 h-40 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20 hover:scale-105 transition-all duration-300">
                      <Link href={"/"}>
                        <Image
                          width={200}
                          height={200}
                          src="https://ik.imagekit.io/3a0xukows/gigs%20fix%20full%20size.png?updatedAt=1738307076179"
                          alt="Logo"
                          className="w-32"
                        />
                      </Link>
                    </div>
                    <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Your Gateway to Live Entertainment</h2>
                    <p className="text-lg text-white/80">Experience the magic of live performances ✨</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form dengan text lebih gelap */}
              <div className="w-full md:w-1/2 p-8 sm:p-12">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-black mb-2">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1E4D8C] to-[#0A2A5E]">Welcome Back!</span>
                      <span className="text-black ml-2">👋</span>
                    </h1>
                    <p className="text-[#1E4D8C]">Let&apos;s get you signed in</p>
                  </div>

                  {state.message && (
                    <div className="mb-6 p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-xl">
                      <p className="text-center text-red-500">{state.message}</p>
                    </div>
                  )}

                  <form
                    action={dispatch}
                    className="space-y-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-[#1E4D8C] text-sm font-medium flex items-center">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        defaultValue={state.input?.email}
                        className="w-full px-4 py-3 bg-white/60 border-2 border-[#00D2FF]/30 rounded-xl text-[#1E4D8C] placeholder-[#1E4D8C]/40 focus:outline-none focus:ring-2 focus:ring-[#00D2FF]/50 focus:border-transparent transition-all backdrop-blur-sm"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-[#1E4D8C] text-sm font-medium flex items-center">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        defaultValue={state.input?.password}
                        className="w-full px-4 py-3 bg-white/60 border-2 border-[#00D2FF]/30 rounded-xl text-[#1E4D8C] placeholder-[#1E4D8C]/40 focus:outline-none focus:ring-2 focus:ring-[#00D2FF]/50 focus:border-transparent transition-all backdrop-blur-sm"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-[#00D2FF] to-[#3A7BD5] text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#3A7BD5]/25 flex items-center justify-center group">
                      <span>Sign In</span>
                      <svg
                        className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </button>

                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#00D2FF]/20"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white/80 text-[#1E4D8C]">New to EzGigs?</span>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className="block w-full py-3 px-4 border-2 border-[#00D2FF] text-[#3A7BD5] font-bold rounded-xl hover:bg-gradient-to-r hover:from-[#00D2FF] hover:to-[#3A7BD5] hover:text-white transition-all text-center">
                      Create an Account
                    </Link>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FlashErrorComponents>
    </>
  );
}

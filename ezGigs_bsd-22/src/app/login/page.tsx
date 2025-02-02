"use client";

import { actionLoginHandler } from "@/services/login";
import { useActionState } from "react";
import Link from "next/link";
import FlashErrorComponents from "@/components/FlashErrorComponents";

const initialState = {
  success: false,
  message: "",
};

export default function LoginPage() {
  const [state, dispatch] = useActionState(actionLoginHandler, initialState);

  return (
    <>
      <FlashErrorComponents>
        <div className="min-h-screen bg-gradient-to-br from-[#F4F6F0] via-[#E8EDE1] to-[#F4F6F0] relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D3D9C9] rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute top-1/2 -left-48 w-96 h-96 bg-[#4A5043] rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-[#656D5D] rounded-full opacity-10 blur-3xl"></div>
          </div>

          {/* Main Content */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl w-full max-w-5xl overflow-hidden flex shadow-2xl">
              {/* Left Side - Hero Image */}
              <div className="w-1/2 relative hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4A5043] to-[#2C3228]">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-white/20 rounded-full"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 border-4 border-white/20 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white/20 rounded-full"></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                    <div className="w-40 h-40 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20">
                    <Link href={"/"}>
                    <img
              src="https://ik.imagekit.io/3a0xukows/gigs%20fix%20full%20size.png?updatedAt=1738307076179"
              alt="Logo"
              className="w-32"
            />
                    </Link>

                    </div>
                    <h2 className="text-4xl font-black mb-4">Your Gateway to Live Entertainment</h2>
                    <p className="text-lg text-white/80">Experience the magic of live performances, secure your tickets now! ✨</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="w-full md:w-1/2 p-8 sm:p-12">
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-[#2C3228] mb-2">Welcome Back! 👋</h1>
                    <p className="text-[#4A5043]">Let&apos;s get you signed in</p>
                  </div>

                  {state.message && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                      <p className="text-center text-red-500">{state.message}</p>
                    </div>
                  )}

                  <form action={dispatch} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-[#2C3228] text-sm font-medium flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#4A5043]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        defaultValue={state.input?.email}
                        className="w-full px-4 py-3 bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl text-[#2C3228] placeholder-[#4A5043]/50 focus:outline-none focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-[#2C3228] text-sm font-medium flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#4A5043]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        defaultValue={state.input?.password}
                        className="w-full px-4 py-3 bg-[#F4F6F0] border border-[#D3D9C9] rounded-xl text-[#2C3228] placeholder-[#4A5043]/50 focus:outline-none focus:ring-2 focus:ring-[#4A5043] focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-[#4A5043] to-[#2C3228] text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#2C3228]/25 flex items-center justify-center group">
                      <span>Sign In</span>
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>

                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#D3D9C9]"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white/80 text-[#4A5043]">New to TIXID?</span>
                      </div>
                    </div>

                    <Link
                      href="/register"
                      className="block w-full py-3 px-4 border-2 border-[#4A5043] text-[#4A5043] font-bold rounded-xl hover:bg-[#4A5043] hover:text-white transition-all text-center">
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [role, setRole] = useState("Admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = isSignIn ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(`http://localhost:5050${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");

      if (isSignIn) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Basic role-based redirect
        if (data.user.role === "Admin") navigate("/admin/dashboard");
        else if (data.user.role === "Base Commander") navigate("/commander/dashboard");
        else navigate("/logistics/dashboard");
      } else {
        // After registration, switch to sign in
        setIsSignIn(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E1E1E] to-[#2A2F36] p-6">
      <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT SIDE - Illustration */}
        <div
          className="md:w-1/2 flex flex-col items-center justify-center text-center p-10"
          style={{ backgroundColor: "#5B7044" }}
        >
          <div className="flex flex-col items-center space-y-6">
            {/* Military-themed symbols */}
            <div className="flex items-center space-x-8 text-[#C6B48E]">
              {/* Dog-tag with star */}
              <svg width="84" height="84" viewBox="0 0 56 56" aria-hidden>
                <g fill="#C6B48E">
                  <path d="M14 12c-2.21 0-4 1.79-4 4v24c0 2.21 1.79 4 4 4h16c1.08 0 2.12-.43 2.88-1.2l9.92-9.92A4 4 0 0044 30V16c0-2.21-1.79-4-4-4H14z"/>
                  {/* cutout star */}
                  <path fill="#5B7044" d="M26.5 26l2.3 4.7 5.2.76-3.75 3.66.89 5.18-4.64-2.44-4.64 2.44.89-5.18L19 31.46l5.2-.76L26.5 26z"/>
                </g>
              </svg>

              {/* Rank stripes */}
              <svg width="84" height="84" viewBox="0 0 56 56" aria-hidden>
                <g fill="#C6B48E">
                  <rect x="12" y="16" width="32" height="6" rx="2"/>
                  <rect x="12" y="26" width="28" height="6" rx="2"/>
                  <rect x="12" y="36" width="24" height="6" rx="2"/>
                </g>
              </svg>

              {/* Vehicle/tank silhouette */}
              <svg width="150" height="150" viewBox="0 0 56 56" aria-hidden>
                <g fill="#C6B48E">
                  <rect x="14" y="30" width="28" height="10" rx="2"/>
                  <rect x="24" y="24" width="12" height="6" rx="2"/>
                  <rect x="36" y="26" width="10" height="3" rx="1.5"/>
                </g>
              </svg>
            </div>

            <h1
              className="text-2xl md:text-3xl font-bold text-[#E3D6A4] leading-snug tracking-wide uppercase"
              style={{ letterSpacing: "2px" }}
            >
              MILITARY ASSET<br />MANAGEMENT SYSTEM
            </h1>
          </div>
        </div>

        {/* RIGHT SIDE - Login Form */}
        <div className="md:w-1/2 flex flex-col justify-center bg-[#1F2A38] text-white p-10 border border-[#2C3A4A] shadow-2xl">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Military Asset Management
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
              {/* Username */}
              <div>
                <label className="block text-sm font-semibold mb-1">USERNAME</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#2E3A4A] text-white border border-[#3D4C5F] focus:outline-none focus:ring-2 focus:ring-[#8BA36A]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-1">PASSWORD</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#2E3A4A] text-white border border-[#3D4C5F] focus:outline-none focus:ring-2 focus:ring-[#8BA36A]"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold mb-1">ROLE</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#2E3A4A] text-white border border-[#3D4C5F] focus:outline-none focus:ring-2 focus:ring-[#8BA36A]"
                >
                  <option>Admin</option>
                  <option>Base Commander</option>
                  <option>Logistics Officer</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsSignIn(true)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold border transition-all duration-200 ${
                    isSignIn
                      ? "bg-[#5B7044] text-white border-transparent hover:bg-[#6B8253]"
                      : "bg-[#2E3A4A] border-[#3D4C5F] text-gray-300 hover:text-white"
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignIn(false)}
                  className={`flex-1 py-2.5 rounded-lg font-semibold border transition-all duration-200 ${
                    !isSignIn
                      ? "bg-[#5B7044] text-white border-transparent hover:bg-[#6B8253]"
                      : "bg-[#2E3A4A] border-[#3D4C5F] text-gray-300 hover:text-white"
                  }`}
                >
                  REGISTER
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 mt-4 bg-[#5B7044] hover:bg-[#6B8253] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
              >
                {isSignIn ? "LOGIN" : "REGISTER"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

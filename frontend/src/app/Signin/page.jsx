"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import Image from "next/image"

const LoginPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await axios.post("http://localhost:5000/login", { email, password })
      const data = res.data

      localStorage.setItem("jwtToken", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      if (data.user.role === "DRIVER") {
        router.push("/DriverDashboard")
      } else {
        router.push("/Dashboard")
      }
    } catch (err) {
      console.error("Login error:", err)
      if (err.response) {
        if (err.response.headers && err.response.headers["content-type"] && 
            err.response.headers["content-type"].includes("application/json")) {
          setError(err.response.data.error || "Something went wrong")
        } else {
          setError("Server error. Please try again later.")
        }
      } else if (err.request) {
        setError("No response from server. Please check your connection.")
      } else {
        setError("An error occurred during login.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: "hidden",
      }}
    >
      {/* Left Side - Background Image */}
      <div
        style={{
          width: "60%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="left-side"
      >
        <Image
          src="/assets/login-background.jpg"
          alt="Login background"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "white",
            zIndex: 10,
            width: "80%",
          }}
        >
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              letterSpacing: "-0.5px",
            }}
          >
            Welcome to RideShare
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              maxWidth: "80%",
              margin: "0 auto",
              textShadow: "0 1px 8px rgba(0,0,0,0.5)",
              lineHeight: "1.6",
              opacity: "0.9",
            }}
          >
            Your journey begins with a single tap
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        style={{
          width: "40%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          backgroundColor: "#ffffff",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.05)",
          position: "relative",
          zIndex: 5,
        }}
        className="right-side"
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "700",
                color: "#333",
                marginBottom: "0.75rem",
              }}
            >
              Sign In
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: "1rem",
              }}
            >
              Please enter your credentials to continue
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                borderLeft: "4px solid #dc2626",
                color: "#dc2626",
                borderRadius: "4px",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                animation: "fadeIn 0.3s ease-in-out",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label
                htmlFor="email"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#4b5563",
                  marginBottom: "0.25rem",
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                  width: "100%",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  ":focus": {
                    borderColor: "#4f46e5",
                    boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
                  },
                }}
                placeholder="you@example.com"
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <label
                  htmlFor="password"
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    marginBottom: "0.25rem",
                  }}
                >
                  Password
                </label>
                <a
                  href="#"
                  style={{
                    fontSize: "0.75rem",
                    color: "#4f46e5",
                    textDecoration: "none",
                    ":hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                  width: "100%",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  ":focus": {
                    borderColor: "#4f46e5",
                    boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
                  },
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#4f46e5",
                color: "white",
                borderRadius: "0.375rem",
                fontWeight: "500",
                fontSize: "1rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "3rem",
                opacity: loading ? "0.7" : "1",
                ":hover": {
                  backgroundColor: "#4338ca",
                },
              }}
            >
              {loading ? (
                <div
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                ></div>
              ) : (
                "Sign In"
              )}
            </button>

            <div
              style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: "0.875rem",
                color: "#6b7280",
              }}
            >
              Don't have an account?{" "}
              <a
                href="/register"
                style={{
                  color: "#4f46e5",
                  textDecoration: "none",
                  fontWeight: "500",
                  ":hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign up
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .left-side {
            display: none;
          }
          .right-side {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default LoginPage

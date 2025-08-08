"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (res.ok) {
      router.replace("/home");
    } else {
      setError("Credenciales incorrectas");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const res = await fetch("http://localhost:8000/auth/google");
    const data = await res.json();
    if (data.auth_url) {
      window.location.href = data.auth_url;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "none" // El fondo lo maneja el layout
    }}>
      <div style={{
        background: "white",
        padding: 40,
        borderRadius: 18,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        minWidth: 340,
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{ marginBottom: 32, textAlign: "center", color: "#374151", fontWeight: 700, fontSize: 28 }}>Iniciar sesión</h2>
        <h2 style={{ marginBottom: 32, textAlign: "center", color: "#374151", fontWeight: 700, fontSize: 18 }}>Para una compra segura</h2>
        <h2 style={{ marginBottom: 22, textAlign: "center", color: "#374151", fontWeight: 700, fontSize: 18 }}>🍔🥙🍕🍟</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 16,
              background: "white",
              color: "#374151",
              outline: "none"
            }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 16,
              background: "white",
              color: "#374151",
              outline: "none"
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "#374151",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "12px 28px",
              fontSize: 18,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 10,
              transition: "background 0.2s, color 0.2s"
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => router.push("/register")}
            style={{
              background: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "12px 28px",
              fontSize: 18,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 10,
              transition: "background 0.2s, color 0.2s"
            }}
          >
            Registrarse
          </button>
        </form>
        {error && <div style={{ color: "#dc2626", marginTop: 18, textAlign: "center" }}>{error}</div>}
        <hr style={{ margin: "32px 0", borderColor: "#e5e7eb" }} />
        <button
          onClick={handleGoogleLogin}
          style={{
            display: "flex",
            alignItems: "center",
            background: "white",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            padding: "12px 28px",
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
            gap: 14,
            transition: "background 0.2s, color 0.2s"
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseOut={e => e.currentTarget.style.background = 'white'}
        >
          <img src="/gooogle.png" alt="Google" style={{ width: 28, height: 28, marginRight: 10 }} />
          Iniciar sesión con Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage; 
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", full_name: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Error al registrar usuario");
      } else {
        setSuccess("Usuario registrado correctamente");
        setTimeout(() => router.replace("/login"), 1500);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "none"
    }}>
      <div style={{
        background: "white",
        padding: 40,
        borderRadius: 18,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        minWidth: 340,
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{ marginBottom: 32, textAlign: "center", color: "#374151", fontWeight: 700, fontSize: 28 }}>Registro</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
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
            type="text"
            name="full_name"
            placeholder="Nombre completo"
            value={form.full_name}
            onChange={handleChange}
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
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
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
            style={{
              background: "#374151",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "12px 28px",
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              marginTop: 10,
              transition: "background 0.2s, color 0.2s"
            }}
          >
            Registrarse
          </button>
        </form>
        {error && <div style={{ color: "#dc2626", marginTop: 18, textAlign: "center" }}>{error}</div>}
        {success && <div style={{ color: "#059669", marginTop: 18, textAlign: "center" }}>{success}</div>}
      </div>
    </div>
  );
}
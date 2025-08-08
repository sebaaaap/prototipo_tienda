"use client";
import React from "react";

const InfroFlujoGeneral = () => {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #181A20 0%, #23262F 100%)",
      color: "#F0B90B",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 0"
    }}>
      <div style={{
        background: "#222531",
        borderRadius: 18,
        boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
        padding: 40,
        maxWidth: 600,
        width: "90%",
        margin: "0 auto"
      }}>
        <h1 style={{
          color: "#F0B90B",
          fontWeight: 800,
          fontSize: 32,
          textAlign: "center",
          marginBottom: 24
        }}>
          Flujo General de Autenticación JWT + Cookies
        </h1>
        <p style={{ color: "#EAECEF", fontSize: 18, marginBottom: 24, textAlign: "center" }}>
          Este flujo asegura máxima seguridad y experiencia de usuario moderna usando JWT en cookies HttpOnly.<br/>
          <b>Funciona tanto para login tradicional como con Google OAuth.</b>
        </p>
        <ol style={{ color: "#F0B90B", fontSize: 17, marginBottom: 32, paddingLeft: 24 }}>
          <li>El usuario inicia sesión (con email/contraseña o Google).</li>
          <li>El backend genera <b>access</b> y <b>refresh token</b> (JWT).</li>
          <li>Para Google, los tokens llegan al frontend en la URL y se convierten en cookies HttpOnly.</li>
          <li>El navegador guarda las cookies automáticamente.</li>
          <li>En cada página protegida, el frontend consulta <b>/me</b> para validar la sesión.</li>
          <li>El backend valida el JWT desde la cookie y responde con los datos del usuario o 401.</li>
          <li>El usuario puede cerrar sesión, lo que borra las cookies y lo redirige a login.</li>
        </ol>
        <div style={{
          background: "#181A20",
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(240,185,11,0.08)"
        }}>
          <h2 style={{ color: "#F0B90B", fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Diagrama del Flujo</h2>
          {/* Aquí puedes poner una imagen de diagrama, por ejemplo: */}
          <img src="/diagrame.png" alt="Diagrama del flujo JWT + Cookies" style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 12 }} />
          <p style={{ color: "#EAECEF", fontSize: 15 }}></p>
        </div>
        <div style={{
          background: "#181A20",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(240,185,11,0.08)"
        }}>
          <h2 style={{ color: "#F0B90B", fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Resumen Visual en papel</h2>
          {/* Aquí puedes poner otra imagen, por ejemplo: */}
          <img src="/resumen-flujo.png" alt="Resumen visual del flujo en papel" style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 12 }} />
          <p style={{ color: "#EAECEF", fontSize: 15 }}></p>
        </div>
      </div>
    </div>
  );
};

export default InfroFlujoGeneral; 
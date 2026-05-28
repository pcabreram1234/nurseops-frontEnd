
import React from "react";
import LoginPage from "@/modules/auth/pages/LoginPage";

// Metadata opcional para SEO/Pestaña
export const metadata = {
  title: "Iniciar Sesión | Nurse Scheduler",
  description: "Acceso al panel de control de asignación de enfermería",
};

export default function Page() {
  return <LoginPage />;
}
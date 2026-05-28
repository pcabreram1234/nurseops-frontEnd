"use client";

import React from "react";
import LoginForm from "../components/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-900">
      <Card className="w-full max-w-md shadow-lg border-slate-200/80">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
            👩‍⚕️
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Nurse Scheduler</CardTitle>
          <CardDescription>
            Introduce tus credenciales para gestionar los turnos departamentales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
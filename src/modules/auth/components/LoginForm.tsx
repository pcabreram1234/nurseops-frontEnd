"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../schemas/login.schema";
import { useLogin } from "../hooks/useAuth";

// Componentes puramente visuales de shadcn/ui
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const { mutate: loginMutate, isPending, error: apiError } = useLogin();

  // Desestructuramos las funciones estándar y nativas de React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutate(values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Manejo de error global de la API */}
      {apiError && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg font-medium">
          {(apiError as any)?.response?.data?.message ||
            "Incorrect credentials. Please try again.."}
        </div>
      )}

      {/* Campo: Correo Electrónico */}
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="nombre@hospital.com"
          disabled={isPending}
          {...register("email")} // Vinculación directa nativa de React Hook Form
        />
        {errors.email && (
          <p className="text-xs font-medium text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Campo: Contraseña */}
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          disabled={isPending}
          {...register("password")} // Vinculación directa nativa de React Hook Form
        />
        {errors.password && (
          <p className="text-xs font-medium text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="bg-transparent text-blue-400  border-blue-400 mt-4 w-full rounded hover:bg-blue-600 hover:text-white transition"
        disabled={isPending}
      >
        {isPending ? "Logging in..." : "Log in to the System"}
      </Button>
    </form>
  );
}

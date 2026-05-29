"use client";

import { useState } from "react";
import { useRoles } from "@/modules/roles/hooks/useRoles";
import { Role, RoleFormData } from "@/modules/roles/types";
import RoleModal from "@/modules/roles/components/RoleModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Shield, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";
import { toast } from "sonner"; // Asegúrate de importarlo

export default function RolesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // 🌟 Extraemos las nuevas funciones desestructuradas de useRoles
  const {
    roles,
    permissionsCatalog,
    isLoading,
    createUserRole,
    isCreating,
    updateUserRole,
    isUpdating,
    assignPermissions,
    isAssigning,
    deleteUserRole
  } = useRoles();

  const { data: orgs = [] } = useQuery({
    queryKey: ["form-orgs"],
    queryFn: async () => (await apiInstance.get("/organizations")).data
  });

  const handleOpenCreate = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  // 🌟 LÓGICA DE ORQUESTACIÓN INTEGRAL MULTI-PERMISOS
  const handleFormSubmit = async (data: RoleFormData) => {
    try {
      if (selectedRole) {
        // --- MODO EDICIÓN ---
        // Ejecutamos ambas actualizaciones en paralelo para mayor velocidad
        await Promise.all([
          updateUserRole({ id: selectedRole.id, data: { id: selectedRole.id, name: data.name } }),
          assignPermissions({ id: selectedRole.id, data: { permissionIds: data.permissionIds } })
        ]);
        toast.success("Rol y matriz de accesos actualizados con éxito");
      } else {
        // --- MODO CREACIÓN ---
        // 1. Creamos el registro base del rol para obtener su UUID autogenerado
        const newRole = await createUserRole({ name: data.name });

        // 2. Si el usuario seleccionó permisos en la matriz, los vinculamos usando el ID retornado
        if (data.permissionIds && data.permissionIds.length > 0 && newRole?.id) {
          await assignPermissions({ id: newRole.id, data: { permissionIds: data.permissionIds } });
        }
        toast.success("Estructura de rol creada y autorizada correctamente");
      }
      setIsModalOpen(false); // Cerramos el modal si todo sale bien
    } catch (error) {
      // Los errores ya los maneja el interceptor de Axios de forma global,
      // pero detenemos el flujo del modal aquí.
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este rol de acceso? Podría afectar a los usuarios asignados.")) {
      await deleteUserRole(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ... Todo tu diseño JSX de la tabla/cards se mantiene exactamente igual ... */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles y Permisos</h1>
          <p className="text-muted-foreground">Estructura las plantillas de seguridad operacional y asocia privilegios lógicos al personal.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
          <Plus className="h-4 w-4" /> Crear Nuevo Rol
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando matriz de seguridad del sistema...
        </div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800">
          <Shield className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No existen roles estructurales creados en la base de datos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((r) => (
            <Card key={r.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow dark:bg-slate-950 dark:border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary shrink-0" /> {r.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-500">
                      ID Org: {r.organizationId || "Estructura Global"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(r)}>
                      <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col space-y-4">
                <div className="space-y-2 flex-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Permisos Activos ({r.rolePermissions?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-35 overflow-y-auto pr-1">
                    {r.rolePermissions && r.rolePermissions.length > 0 ? (
                      r.rolePermissions.map((rp) => (
                        <span
                          key={rp.permisionId}
                          className="inline-flex text-[10px] font-bold font-mono tracking-tight bg-primary/10 text-primary border border-primary/20 rounded px-2 py-0.5"
                          title={rp.permissions?.description}
                        >
                          {rp.permissions?.name || rp.permisionId}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Este rol no posee ningún permiso asignado.</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        role={selectedRole}
        // 🌟 BLOQUEO EXTENDIDO: Deshabilita el formulario si cualquiera de las peticiones de red está pendiente
        isSubmitting={isCreating || isUpdating || isAssigning}
        organizations={orgs}
        permissionsCatalog={permissionsCatalog}
      />
    </div>
  );
}
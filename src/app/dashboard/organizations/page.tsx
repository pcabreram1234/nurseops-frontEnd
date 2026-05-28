"use client";

import { useState } from "react";
import { useOrganizations } from "@/modules/organizations/hooks/useOrganizations";
import { Organization, OrganizationFormData } from "@/modules/organizations/types";
import OrganizationModal from "@/modules/organizations/components/OrganizationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Building2 } from "lucide-react";

export default function OrganizationsPage() {
  const { organizations, isLoading, createOrganization, isCreating, updateOrganization, isUpdating, deleteOrganization } = useOrganizations();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const handleOpenCreate = () => {
    setSelectedOrg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (org: Organization) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: OrganizationFormData) => {
    if (selectedOrg) {
      await updateOrganization({ id: selectedOrg.id, data });
    } else {
      await createOrganization(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta organización?")) {
      await deleteOrganization(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizaciones</h1>
          <p className="text-muted-foreground">Administra los centros médicos e instituciones globales asociadas al ecosistema.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Agregar Institución
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Centros Registrados</CardTitle>
          <CardDescription>Lista de entidades con acceso activo a plantillas horarias y reglas de distribución.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">Cargando registros...</div>
          ) : organizations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
              <Building2 className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No existen organizaciones registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 font-medium text-muted-foreground">
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Código</th>
                    <th className="p-4">Ubicación / Región</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr key={org.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">{org.name}</td>
                      <td className="p-4 font-mono text-xs">{org.code}</td>
                      <td className="p-4 text-muted-foreground">
                        {org.country} <span className="text-xs text-slate-400">({org.timezone})</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          org.status === 'A' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {org.status === 'A' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(org)}>
                          <Edit2 className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(org.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        organization={selectedOrg}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}
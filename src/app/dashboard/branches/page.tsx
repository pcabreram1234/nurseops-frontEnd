"use client";

import { useState } from "react";
import { useBranches } from "@/modules/branches/hooks/useBranches";
import { Branch, BranchFormData } from "@/modules/branches/types";
import BranchModal from "@/modules/branches/components/BranchModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // 🌟 Importación del Input para el buscador
import { 
  Plus, Edit2, Trash2, MapPin, Phone, Mail, Globe, 
  Loader2, Building, Layers, CheckCircle2, AlertCircle, Search, X 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiInstance } from "@/services/axios";

export default function BranchesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🌟 Estado para controlar la barra de búsqueda

  const { branches, isLoading, createBranch, isCreating, updateBranch, isUpdating, deleteBranch } = useBranches();

  // Consumir catálogo maestro de organizaciones
  const { data: orgs = [] } = useQuery({
    queryKey: ["form-orgs"],
    queryFn: async () => (await apiInstance.get("/organizations")).data
  });

  const handleOpenCreate = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: BranchFormData) => {
    try {
      if (selectedBranch) {
        await updateBranch({ id: selectedBranch.id, data });
      } else {
        await createBranch(data);
      }
      setIsModalOpen(false);
    } catch (error) {}
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar permanentemente esta sede? Se desvincularán los departamentos correspondientes.")) {
      await deleteBranch(id);
    }
  };

  // 🌟 FILTRADO REACTIVO EN TIEMPO REAL
  // Busca coincidencias por Nombre, Ciudad, Estado u Organización matriz
  const filteredBranches = branches.filter((b) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    return (
      b.name.toLowerCase().includes(term) ||
      b.city.toLowerCase().includes(term) ||
      b.state.toLowerCase().includes(term) ||
      b.organization?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* SECCIÓN DE CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estructura de Sucursales</h1>
          <p className="text-muted-foreground">Configura las sedes corporativas, georreferenciación y los puntos centrales operativos.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
          <Plus className="h-4 w-4" /> Registrar Sucursal
        </Button>
      </div>

      {/* 🌟 BARRA DE BÚSQUEDA FLUIDA */}
      {branches.length > 0 && (
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, ciudad u organización..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* RENDERIZADO CONDICIONAL DE CONTENIDO */}
      {isLoading ? (
        <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando infraestructura organizacional...
        </div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950 dark:border-slate-800">
          <Building className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No existen sedes registradas en esta organización</p>
        </div>
      ) : filteredBranches.length === 0 ? (
        // 🌟 FEEDBACK COMPRENSIBLE SI LA BÚSQUEDA NO CONTIENE COINCIDENCIAS
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-900">
          <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No se encontraron sucursales</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ningún registro coincide con el término "{searchTerm}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 🌟 Mapeamos sobre 'filteredBranches' en lugar del arreglo crudo */}
          {filteredBranches.map((b) => (
            <Card key={b.id} className={`flex flex-col overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-slate-950 border ${b.isMainBranch ? 'border-primary/50 ring-1 ring-primary/10' : 'border-slate-200 dark:border-slate-800'}`}>
              <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-900 bg-slate-50/40 dark:bg-slate-900/10">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-primary shrink-0" /> {b.name}
                      </CardTitle>
                      {b.isMainBranch && (
                        <span className="inline-flex text-[9px] font-extrabold font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                          Matriz Principal
                        </span>
                      )}
                    </div>
                    <CardDescription className="text-xs font-medium text-slate-500">
                      Org: {b.organization?.name || "Global / Unassigned"}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(b)}>
                      <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* DETALLES DE LOCALIZACIÓN POSTAL */}
                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">
                      {b.address}, {b.city}, {b.state}, {b.country} (CP {b.zipCode})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{b.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{b.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[10px] text-slate-500">
                      {b.timezone} | Lat: {b.latitude ? Number(b.latitude).toFixed(3) : "0.000"} Lng: {b.longitude ? Number(b.longitude).toFixed(3) : "0.000"}
                    </span>
                  </div>
                </div>

                {/* ESTATUS INFORMATIVO DE SUB-ESTRUCTURAS */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Layers className="h-3.5 w-3.5 text-primary" /> 
                    <span>Departamentos: <span className="font-bold text-primary">{b.departments?.length || 0}</span></span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-medium">
                    {b.isActive ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Operativa
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Fuera de servicio
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        branch={selectedBranch}
        isSubmitting={isCreating || isUpdating}
        organizations={orgs}
      />
    </div>
  );
}
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useIntegrations, useWebhookLogs } from "@/modules/integrations/hooks/useIntegrations";
import { Integration, PROVIDER_LABELS, PROVIDER_ICONS, redactConfiguration, WebhookLog, IntegrationFilters } from "@/modules/integrations/types";
import IntegrationModal from "@/modules/integrations/components/IntegrationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    Plus, Edit2, Trash2, Search, X, Loader2, Plug, AlertCircle,
    CheckCircle2, ShieldAlert, Webhook
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Pagination } from "@/components/Pagination";

function WebhookLogsModal({ isOpen, onClose, integration }: { isOpen: boolean; onClose: () => void; integration: Integration | null }) {
    const { logs, isLoading, error } = useWebhookLogs(integration?.id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5 text-primary" />
                        Webhook Logs {integration?.name ? `— ${integration.name}` : ""}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-10 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Cargando logs...
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-sm text-red-600">Error al cargar los logs</div>
                ) : logs.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">No hay registros de webhooks.</div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log: WebhookLog) => (
                            <div key={log.id} className="p-3 rounded-lg border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-mono text-muted-foreground">{log.id.substring(0, 12)}...</span>
                                    <span className="text-[10px] text-muted-foreground">Payload y respuesta registrados</span>
                                </div>
                                <pre className="text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded overflow-x-auto max-h-32">
                                    {JSON.stringify(log.payload, null, 1)}
                                </pre>
                            </div>
                        ))}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function IntegrationsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Integration | null>(null);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [providerFilter, setProviderFilter] = useState<string>("ALL");
    const [isLogsOpen, setIsLogsOpen] = useState(false);
    const [logsTarget, setLogsTarget] = useState<Integration | null>(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 25;

    const filters = useMemo(() => ({
        search: search || undefined,
        provider: providerFilter !== "ALL" ? providerFilter as any : undefined,
        page,
        limit: PAGE_SIZE,
    }), [search, providerFilter, page]);

    const currentUser = useAuthStore((s) => s.user);

    const {
        integrations, meta, isLoading, isFetching, error,
        createIntegration, isCreating, updateIntegration, isUpdating, deleteIntegration,
    } = useIntegrations(filters);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleOpenCreate = () => { setSelected(null); setIsModalOpen(true); };
    const handleOpenEdit = (i: Integration) => { setSelected(i); setIsModalOpen(true); };
    const handleOpenLogs = (i: Integration) => { setLogsTarget(i); setIsLogsOpen(true); };

    const handleFormSubmit = async (data: any) => {
        try {
            const payload = {
                ...data,
                organizationId: data.organizationId || currentUser?.organizationId || "",
            };
            if (selected) {
                await updateIntegration({ id: selected.id, data: payload });
            } else {
                await createIntegration(payload);
            }
            setIsModalOpen(false);
        } catch { /* manejado por el hook */ }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar esta integración? Los webhooks relacionados también se eliminarán.")) {
            await deleteIntegration(id);
        }
    };

    const filtered = integrations.filter(i => {
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            (i.name || "").toLowerCase().includes(q) ||
            i.provider.toLowerCase().includes(q);
        const matchesProvider = providerFilter === "ALL" || i.provider === providerFilter;
        return matchesSearch && matchesProvider;
    });

    const activeCount = integrations.filter(i => i.isActive).length;

    const hasActiveFilters = !!(search || providerFilter !== "ALL");
    const clearFilters = () => { setSearchInput(""); setSearch(""); setProviderFilter("ALL"); setPage(1); };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Integraciones API</h1>
                    <p className="text-muted-foreground">Gestiona las integraciones externas del sistema.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-center">
                    <Plus className="h-4 w-4" /> Nueva Integración
                </Button>
            </div>

            {(integrations.length > 0 || meta || isLoading) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg"><Plug className="h-4 w-4 text-blue-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{meta?.total ?? integrations.length}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Activas</p><p className="text-lg font-bold text-emerald-600">{activeCount}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg"><ShieldAlert className="h-4 w-4 text-amber-600" /></div>
                        <div><p className="text-xs text-muted-foreground">Inactivas</p><p className="text-lg font-bold text-amber-600">{integrations.length - activeCount}</p></div>
                    </div>
                </div>
            )}

            {(integrations.length > 0 || meta || hasActiveFilters) && (
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar por nombre o proveedor..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-9 pr-9" />
                        {searchInput && (
                            <button onClick={() => { setSearchInput(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <select value={providerFilter} onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:bg-slate-950 dark:border-slate-800">
                        <option value="ALL">Todos los proveedores</option>
                        {Object.entries(PROVIDER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs gap-1"><X className="h-3 w-3" /> Limpiar</Button>
                    )}
                </div>
            )}

            {isLoading ? (
                <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando integraciones...
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
                    <AlertCircle className="h-12 w-12 text-red-500/70 mb-3" />
                    <p className="text-sm font-semibold text-red-700">Error al cargar las integraciones</p>
                    <p className="text-xs text-red-600/80 mt-1">{(error as any)?.response?.data?.message || (error as any)?.message || "Error de conexión."}</p>
                </div>
            ) : integrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-white dark:bg-slate-950">
                    <Plug className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No existen integraciones registradas.</p>
                    <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={handleOpenCreate}>
                        <Plus className="h-3.5 w-3.5" /> Crear primera integración
                    </Button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
                    <Search className="h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-semibold">Sin coincidencias</p>
                    <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>Limpiar filtros</Button>
                </div>
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Plug className="h-4 w-4 text-primary" /> Integraciones ({filtered.length}{filtered.length !== integrations.length ? ` de ${integrations.length}` : ""})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20">
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Proveedor</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Nombre</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Configuración</th>
                                        <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Estado</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(i => {
                                        const safeConfig = redactConfiguration(i.configuration);
                                        const configKeys = Object.keys(safeConfig);
                                        return (
                                            <tr key={i.id} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold text-xs">
                                                        {PROVIDER_ICONS[i.provider as keyof typeof PROVIDER_ICONS]} {PROVIDER_LABELS[i.provider as keyof typeof PROVIDER_LABELS] || i.provider}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs">{i.name || "—"}</td>
                                                <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground max-w-[200px] truncate">
                                                    {configKeys.length > 0 ? configKeys.join(", ") : "—"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${i.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                                        {i.isActive ? "Activa" : "Inactiva"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver webhooks" onClick={() => handleOpenLogs(i)}>
                                                            <Webhook className="h-3 w-3 text-slate-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Editar" onClick={() => handleOpenEdit(i)}>
                                                            <Edit2 className="h-3 w-3 text-slate-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Eliminar" onClick={() => handleDelete(i.id)}>
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINACIÓN */}
                        {meta && meta.totalPages > 1 && (
                            <Pagination
                                currentPage={meta.page}
                                totalPages={meta.totalPages}
                                totalItems={meta.total}
                                onPageChange={setPage}
                            />
                        )}
                    </CardContent>
                </Card>
            )}

            <p className="text-xs text-muted-foreground italic flex items-start gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                Los tokens, contraseñas y credenciales nunca se muestran en la interfaz. El estado
                <span className="font-semibold mx-1">«Activa»</span>
                indica que la integración está habilitada; la verificación real de comunicación corresponde al backend.
            </p>

            <IntegrationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                integration={selected}
                isSubmitting={isCreating || isUpdating}
            />

            <WebhookLogsModal
                isOpen={isLogsOpen}
                onClose={() => { setIsLogsOpen(false); setLogsTarget(null); }}
                integration={logsTarget}
            />
        </div>
    );
}
"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiInstance } from "@/services/axios";
import { useVacationPolicies } from "../hooks/useVacationPolicies";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    defaultNurseId?: string | null;
}

/**
 * Asocia un perfil de vacaciones (política activa) a una enfermera.
 * Crea el NurseVacationProfile y su balance del período vigente.
 */
export default function AssignVacationProfileModal({ isOpen, onClose, defaultNurseId }: Props) {
    const { policies, assignVacationPolicy, isAssigning } = useVacationPolicies();

    const [nurseId, setNurseId] = useState<string>(defaultNurseId || "");
    const [policyId, setPolicyId] = useState<string>("");
    const [effectiveFrom, setEffectiveFrom] = useState<string>(new Date().toISOString().split("T")[0]);

    const { data: nurses = [], isLoading: loadingNurses } = useQuery<any[]>({
        queryKey: ["assign-profile-nurses"],
        queryFn: async () => {
            const resp: any = await apiInstance.get("/nurses", { params: { limit: 500 } });
            return resp?.data?.data || resp?.data || [];
        },
        enabled: isOpen,
    });

    const activePolicies = policies.filter((p) => p.status === "ACTIVE");

    useEffect(() => {
        if (isOpen) {
            setNurseId(defaultNurseId || "");
            setPolicyId(activePolicies[0]?.id || "");
            setEffectiveFrom(new Date().toISOString().split("T")[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, defaultNurseId]);

    const handleSubmit = async () => {
        if (!nurseId || !policyId) {
            toast.error("Seleccione la enfermera y la política de vacaciones");
            return;
        }
        try {
            await assignVacationPolicy(policyId, {
                nurseId,
                effectiveFrom,
                isActive: true,
            });
            onClose();
        } catch (error: any) {
            // El hook ya muestra el toast de error
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Asignar Perfil de Vacaciones</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1">
                        <Label>Enfermera *</Label>
                        <Select value={nurseId || undefined} onValueChange={(v) => setNurseId(v || "")}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingNurses ? "Cargando enfermeras..." : "Seleccionar enfermera"} />
                            </SelectTrigger>
                            <SelectContent>
                                {nurses.map((n: any) => (
                                    <SelectItem key={n.id} value={n.id}>
                                        {n.user ? `${n.user.firstName} ${n.user.lastName}` : n.id}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Política de vacaciones (activa) *</Label>
                        <Select value={policyId || undefined} onValueChange={(v) => setPolicyId(v || "")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar política" />
                            </SelectTrigger>
                            <SelectContent>
                                {activePolicies.length === 0 ? (
                                    <div className="px-2 py-3 text-xs text-muted-foreground">
                                        No hay políticas activas. Active una política en Configuración → Políticas de Vacaciones.
                                    </div>
                                ) : (
                                    activePolicies.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.code} — {p.name} (v{p.version})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label>Vigente desde</Label>
                        <Input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
                        <span className="text-xs text-muted-foreground">
                            Al asignar se crea automáticamente el saldo del período vigente según la política.
                        </span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isAssigning || !nurseId || !policyId}>
                        {isAssigning && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                        Asignar Perfil
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

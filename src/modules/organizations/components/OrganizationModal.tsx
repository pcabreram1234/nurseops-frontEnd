"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Organization, OrganizationFormData } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrganizationFormData) => Promise<void>;
  organization?: Organization | null; // Si viene, se activa modo edición
  isSubmitting: boolean;
}

export default function OrganizationModal({ isOpen, onClose, onSubmit, organization, isSubmitting }: Props) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<OrganizationFormData>({
    defaultValues: {
      name: "",
      code: "",
      timezone: "America/Santo_Domingo",
      country: "Dominican Republic",
      status: "A"
    }
  });

  const statusValue = watch("status");

  useEffect(() => {
    if (organization) {
      reset({
        name: organization.name,
        code: organization.code,
        timezone: organization.timezone,
        country: organization.country,
        status: organization.status,
      });
    } else {
      reset({
        name: "",
        code: "",
        timezone: "America/Santo_Domingo",
        country: "Dominican Republic",
        status: "A"
      });
    }
  }, [organization, reset, isOpen]);

  const onFormSubmit = async (data: OrganizationFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{organization ? "Editar Organización" : "Nueva Organización"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="name">Nombre de la Organización</Label>
            <Input id="name" placeholder="Ej. Hospital General" {...register("name", { required: true })} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="code">Código de Identificación</Label>
            <Input id="code" placeholder="Ej. HOSP-GEN-01" {...register("code", { required: true })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="country">País</Label>
              <Input id="country" {...register("country", { required: true })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Input id="timezone" {...register("timezone", { required: true })} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Estado Operativo</Label>
            <Select 
              value={statusValue} 
              onValueChange={(value) => setValue("status", value as 'A' | 'I')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Activo</SelectItem>
                <SelectItem value="I">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
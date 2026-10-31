"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentTemplate, DOCUMENT_TYPE_LABELS, DocumentTemplateFormat } from "../types";

interface SignatureBlock {
    label: string;
    name?: string;
    role?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    template?: DocumentTemplate | null;
    branches?: { id: string; name: string }[];
    isSubmitting?: boolean;
}

const FIELD_HINTS = [
    "{{organization.name}}", "{{organization.code}}",
    "{{branch.name}}", "{{branch.address}}",
    "{{employee.fullName}}", "{{employee.department}}", "{{employee.hireDate}}", "{{employee.contractType}}",
    "{{vacation.startDate}}", "{{vacation.endDate}}", "{{vacation.requestedDays}}", "{{vacation.chargedDays}}", "{{vacation.status}}", "{{vacation.reason}}",
    "{{document.number}}", "{{document.date}}", "{{document.generatedBy}}", "{{today}}",
];

export default function DocumentTemplateModal({ isOpen, onClose, onSubmit, template, branches = [], isSubmitting }: Props) {
    const isEdit = !!template;

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [documentType, setDocumentType] = useState("VACATION_RECEIPT");
    const [format, setFormat] = useState<DocumentTemplateFormat>(DocumentTemplateFormat.PDF);
    const [institution, setInstitution] = useState("");
    const [department, setDepartment] = useState("");
    const [address, setAddress] = useState("");
    const [body, setBody] = useState("");
    const [footerText, setFooterText] = useState("");
    const [logoPath, setLogoPath] = useState("");
    const [numberingPrefix, setNumberingPrefix] = useState("");
    const [numberingDigits, setNumberingDigits] = useState("6");
    const [retentionDays, setRetentionDays] = useState("");
    const [branchId, setBranchId] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [signatureBlocks, setSignatureBlocks] = useState<SignatureBlock[]>([
        { label: "Firma del Empleado" },
        { label: "Recursos Humanos", role: "Aprobación" },
    ]);

    useEffect(() => {
        if (!isOpen) return;
        if (template) {
            setCode(template.code);
            setName(template.name);
            setDescription(template.description || "");
            setDocumentType(template.documentType);
            setFormat(template.format);
            setInstitution((template.header as any)?.institution || "");
            setDepartment((template.header as any)?.department || "");
            setAddress((template.header as any)?.address || "");
            setBody(template.body);
            setFooterText((template.footer as any)?.text || "");
            setLogoPath(template.logoPath || "");
            setNumberingPrefix(template.numberingPrefix || "");
            setNumberingDigits(String(template.numberingDigits ?? 6));
            setRetentionDays(template.retentionDays != null ? String(template.retentionDays) : "");
            setBranchId(template.branchId || "");
            setIsDefault(template.isDefault);
            setSignatureBlocks((template.signatureBlocks as SignatureBlock[]) || []);
        } else {
            setCode("");
            setName("");
            setDescription("");
            setDocumentType("VACATION_RECEIPT");
            setFormat(DocumentTemplateFormat.PDF);
            setInstitution("");
            setDepartment("");
            setAddress("");
            setBody("");
            setFooterText("");
            setLogoPath("");
            setNumberingPrefix("");
            setNumberingDigits("6");
            setRetentionDays("");
            setBranchId("");
            setIsDefault(false);
            setSignatureBlocks([
                { label: "Firma del Empleado" },
                { label: "Recursos Humanos", role: "Aprobación" },
            ]);
        }
    }, [isOpen, template]);

    const updateBlock = (index: number, patch: Partial<SignatureBlock>) => {
        setSignatureBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
    };

    const handleSubmit = async () => {
        const payload: any = {
            code,
            name,
            description: description || undefined,
            documentType,
            format,
            header: {
                ...(institution && { institution }),
                ...(department && { department }),
                ...(address && { address }),
            },
            body,
            footer: footerText ? { text: footerText } : undefined,
            logoPath: logoPath || undefined,
            numberingPrefix: numberingPrefix || undefined,
            numberingDigits: numberingPrefix ? Number(numberingDigits) || 6 : undefined,
            signatureBlocks,
            isDefault,
            retentionDays: retentionDays ? Number(retentionDays) : undefined,
            branchId: branchId || undefined,
        };
        await onSubmit(payload);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[820px] max-h-[88vh] overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>{isEdit ? `Editar Plantilla: ${template?.code}` : "Nueva Plantilla de Documento"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Identificación */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Identificación</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Código *</Label>
                                <Input value={code} onChange={(e) => setCode(e.target.value)} disabled={isEdit} placeholder="VAC-REC" />
                            </div>
                            <div className="space-y-1">
                                <Label>Nombre *</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <Label>Descripción</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Tipo de documento *</Label>
                                <Select value={documentType} onValueChange={(v) => setDocumentType(v || "VACATION_RECEIPT")}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Formato</Label>
                                <Select value={format} onValueChange={(v) => setFormat((v as DocumentTemplateFormat) || DocumentTemplateFormat.PDF)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PDF">PDF</SelectItem>
                                        <SelectItem value="DOCX">DOCX</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label>Sede (vacío = toda la organización)</Label>
                                <Select value={branchId || "__ALL__"} onValueChange={(v) => setBranchId(v === "__ALL__" ? "" : v || "")}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__ALL__">Toda la organización</SelectItem>
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Encabezado institucional */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Encabezado Institucional</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Institución</Label>
                                <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Hospital General..." />
                            </div>
                            <div className="space-y-1">
                                <Label>Departamento / Área</Label>
                                <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Recursos Humanos" />
                            </div>
                            <div className="space-y-1">
                                <Label>Dirección</Label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Santo Domingo, D.R." />
                            </div>
                            <div className="space-y-1">
                                <Label>Ruta del logotipo (opcional)</Label>
                                <Input value={logoPath} onChange={(e) => setLogoPath(e.target.value)} placeholder="storage/logos/logo.png" />
                            </div>
                        </div>
                    </div>

                    {/* Cuerpo con campos dinámicos */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Cuerpo del Documento (campos dinámicos)</p>
                        <Textarea rows={7} value={body} onChange={(e) => setBody(e.target.value)} placeholder={"Se certifica que {{employee.fullName}} ha disfrutado vacaciones del {{vacation.startDate}} al {{vacation.endDate}}."} />
                        <div className="flex flex-wrap gap-1.5">
                            {FIELD_HINTS.map((hint) => (
                                <button
                                    key={hint}
                                    type="button"
                                    onClick={() => setBody((prev) => prev + (prev && !prev.endsWith(" ") ? " " : "") + hint)}
                                    className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                    {hint}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Numeración y retención */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Numeración y Retención</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label>Prefijo de numeración</Label>
                                <Input value={numberingPrefix} onChange={(e) => setNumberingPrefix(e.target.value)} placeholder="VAC-REC-" />
                            </div>
                            <div className="space-y-1">
                                <Label>Dígitos correlativos</Label>
                                <Input type="number" min={1} max={10} value={numberingDigits} onChange={(e) => setNumberingDigits(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label>Retención (días)</Label>
                                <Input type="number" min={0} value={retentionDays} onChange={(e) => setRetentionDays(e.target.value)} placeholder="365" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Texto de pie de página</Label>
                            <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="Documento generado automáticamente por NurseOps..." />
                        </div>
                    </div>

                    {/* Bloques de firma */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Espacios de Firma y Aprobación</p>
                            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setSignatureBlocks((prev) => [...prev, { label: "Firma" }])}>
                                <Plus className="h-3 w-3" /> Agregar
                            </Button>
                        </div>
                        {signatureBlocks.map((block, index) => (
                            <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                                <div className="space-y-1">
                                    <Label>Etiqueta</Label>
                                    <Input value={block.label} onChange={(e) => updateBlock(index, { label: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Nombre (dinámico opcional)</Label>
                                    <Input value={block.name || ""} onChange={(e) => updateBlock(index, { name: e.target.value })} placeholder="{{employee.fullName}}" />
                                </div>
                                <div className="space-y-1">
                                    <Label>Rol / Cargo</Label>
                                    <Input value={block.role || ""} onChange={(e) => updateBlock(index, { role: e.target.value })} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => setSignatureBlocks((prev) => prev.filter((_, i) => i !== index))}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                        <Label className="font-normal">Marcar como plantilla predeterminada de su tipo</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !code || !name || !body}>
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                        {isEdit ? "Guardar Cambios" : "Crear Plantilla"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const fs = require('fs');

const filePath = '/home/pcabreram/nurseApp/System/nurseops-frontend/src/app/dashboard/shift-changes/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Reemplazar APPROVER_ROLES
content = content.replace(
  'const APPROVER_ROLES = ["SUPER", "ADMIN", "SUPERVISOR"];',
  'const APPROVER_ROLES = ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"];'
);

// Reemplazar cada pestaña con los roles correctos
content = content.replace(
  '{ key: "my", label: "Mis Solicitudes", icon: Clock, requiredRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"] }',
  '{ key: "my", label: "Mis Solicitudes", icon: Clock, requiredRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] }'
);

content = content.replace(
  '{ key: "received", label: "Solicitudes Recibidas", icon: Users, requiredRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"] }',
  '{ key: "received", label: "Solicitudes Recibidas", icon: Users, requiredRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] }'
);

content = content.replace(
  '{ key: "opportunities", label: "Oportunidades", icon: Activity, requiredRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"] }',
  '{ key: "opportunities", label: "Oportunidades", icon: Activity, requiredRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] }'
);

content = content.replace(
  '{ key: "history", label: "Historial", icon: History, requiredRoles: ["SUPER", "ADMIN", "SUPERVISOR", "NURSE"] }',
  '{ key: "history", label: "Historial", icon: History, requiredRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR", "NURSE_SENIOR", "NURSE_JUNIOR", "TEMP_NURSE"] }'
);

content = content.replace(
  '{ key: "approvals", label: "Aprobaciones", icon: ShieldCheck, requiredRoles: ["SUPER", "ADMIN", "SUPERVISOR"] }',
  '{ key: "approvals", label: "Aprobaciones", icon: ShieldCheck, requiredRoles: ["SUPER", "SYSTEM_ADMIN", "SUPERVISOR"] }'
);

fs.writeFileSync(filePath, content);
console.log('Done: shift-changes/page.tsx');

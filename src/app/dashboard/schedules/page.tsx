import React from 'react';
import SchedulesPage from '@/modules/schedules/pages/SchedulesPage';

export default function Page() {
  // En producción, este ID vendría del estado global del usuario, 
  // de una URL param, o de una selección previa de departamento.
  const DEFAULT_DEPARTMENT_ID = "dept-01"; 

  return <SchedulesPage departmentId={DEFAULT_DEPARTMENT_ID} />;
}
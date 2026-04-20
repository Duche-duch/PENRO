/** Strip secrets and normalize shape for JSON responses / JWT payload. */
export function serializeUser(row) {
  if (!row) return null;
  const status = row.active === false ? 'inactive' : 'active';
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    department: row.department ?? '',
    position: row.position ?? '',
    vacationCredits: row.vacation_credits != null ? Number(row.vacation_credits) : undefined,
    sickCredits: row.sick_credits != null ? Number(row.sick_credits) : undefined,
    status,
    active: row.active !== false,
    dateHired: row.date_hired,
  };
}

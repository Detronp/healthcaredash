// FICTIONAL operational metrics, alerts and security events for the demo.

export const overview = {
  totalPatients: 1284,
  activeAdmissions: 312,
  availableBeds: 46,
  totalBeds: 358,
  discharged: 58,
  pendingLabs: 137,
  activeAlerts: 9,
};

export const days = ["Nov 9", "Nov 10", "Nov 11", "Nov 12", "Nov 13", "Nov 14", "Nov 15", "Nov 16", "Nov 17", "Nov 18", "Nov 19", "Nov 20", "Nov 21", "Nov 22"];
export const admissionsTrend = [41, 38, 45, 52, 48, 39, 35, 44, 50, 55, 49, 53, 47, 42];
export const dischargeTrend = [36, 40, 39, 44, 50, 42, 31, 38, 46, 51, 52, 48, 50, 58];

export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const dailyDischarges = {
  Planned: [32, 35, 38, 41, 44, 22, 18],
  "Against advice": [2, 1, 3, 2, 1, 2, 1],
  Transfers: [5, 6, 4, 7, 6, 3, 4],
};

export const bedOccupancy = [
  { unit: "ICU", occupied: 26, total: 28 },
  { unit: "Cardiology", occupied: 44, total: 48 },
  { unit: "Medical/Surgical", occupied: 98, total: 112 },
  { unit: "Pediatrics", occupied: 22, total: 32 },
  { unit: "Emergency", occupied: 34, total: 40 },
  { unit: "Neurology", occupied: 30, total: 36 },
  { unit: "Oncology", occupied: 26, total: 30 },
  { unit: "Orthopedics", occupied: 32, total: 32 },
];

export const departmentDistribution = [
  { label: "Medical/Surgical", value: 98 },
  { label: "Cardiology", value: 44 },
  { label: "Emergency", value: 34 },
  { label: "Neurology", value: 30 },
  { label: "Orthopedics", value: 32 },
  { label: "ICU", value: 26 },
  { label: "Oncology", value: 26 },
  { label: "Pediatrics", value: 22 },
];

export const recentActivity = [
  { time: "11:42", type: "admit", text: "Annika Bellweather admitted to Emergency (ED-03)", who: "Dr. Marcus Feld" },
  { time: "11:20", type: "lab", text: "BMP resulted for Annika Bellweather: anion gap 18", who: "Lab System" },
  { time: "10:58", type: "transfer", text: "Ottoline Varga transfer request: 5E → Step-down", who: "Samuel Okeke" },
  { time: "10:40", type: "note", text: "Progress note signed for Ottoline Varga", who: "Dr. Helena Marsh" },
  { time: "10:05", type: "admit", text: "Ellowyn Prater placed in observation (ED-14)", who: "Dr. Marcus Feld" },
  { time: "09:55", type: "rt", text: "HFNC weaned for Ignatius Pemberton", who: "Tomás Reyes, RRT" },
  { time: "09:30", type: "discharge", text: "3 patients discharged from Orthopedics", who: "Unit Clerk" },
  { time: "08:15", type: "med", text: "Furosemide 40 mg IV administered (4W-412)", who: "Priya Okafor, RN" },
];

export const clinicalAlerts = [
  { id: "AL-901", severity: "critical", title: "SpO₂ 87% on FiO₂ 0.80", patient: "Ambrose Littlefield", bed: "ICU-14", time: "11:48" },
  { id: "AL-902", severity: "critical", title: "MAP 62 mmHg on norepinephrine", patient: "Henrietta Caldwell", bed: "ICU-03", time: "11:31" },
  { id: "AL-903", severity: "critical", title: "Temp 38.9 °C, HR 118 (sepsis screen +)", patient: "Desmond Hartwell", bed: "ICU-07", time: "11:05" },
  { id: "AL-904", severity: "warning", title: "Critical lab: K⁺ 3.0 mmol/L", patient: "Marisol Quenby", bed: "4W-412", time: "10:52" },
  { id: "AL-905", severity: "warning", title: "Neutropenic fever 38.4 °C", patient: "Bartholomew Achebe", bed: "7S-702", time: "10:20" },
  { id: "AL-906", severity: "warning", title: "Plateau pressure 31 cmH₂O", patient: "Ambrose Littlefield", bed: "ICU-14", time: "09:58" },
  { id: "AL-907", severity: "info", title: "Fall-risk reassessment due", patient: "Ignatius Pemberton", bed: "6W-604", time: "09:40" },
  { id: "AL-908", severity: "info", title: "Medication reconciliation pending", patient: "Caspian Moreau", bed: "4W-418", time: "09:12" },
  { id: "AL-909", severity: "info", title: "Discharge summary awaiting signature", patient: "Imogen Vasquez-Lyle", bed: "3N-305", time: "08:30" },
];

export const notifications = [
  { id: 1, title: "Critical alert: ICU-14", body: "SpO₂ below 88% for more than 5 minutes.", time: "2 min ago", unread: true, kind: "critical" },
  { id: 2, title: "Lab results ready", body: "14 new results for your patients.", time: "18 min ago", unread: true, kind: "info" },
  { id: 3, title: "Bed request approved", body: "Step-down bed 2N-210 assigned.", time: "42 min ago", unread: true, kind: "success" },
  { id: 4, title: "Shift handoff reminder", body: "Night shift handoff begins at 18:45.", time: "1 h ago", unread: false, kind: "info" },
  { id: 5, title: "New login from known device", body: "Workstation ICU-NS-02.", time: "3 h ago", unread: false, kind: "security" },
];

export const accessLogs = [
  { user: "avoss", role: "Physician", activity: "Viewed patient chart P-10421", ts: "2026-11-22 11:52:10", result: "Success", ip: "10.20.4.18" },
  { user: "pokafor", role: "Registered Nurse", activity: "Documented MAR entry", ts: "2026-11-22 11:47:33", result: "Success", ip: "10.20.4.31" },
  { user: "treyes", role: "Respiratory Therapist", activity: "Updated ventilator settings ICU-07", ts: "2026-11-22 11:40:02", result: "Success", ip: "10.20.8.12" },
  { user: "unknown", role: "—", activity: "Login attempt", ts: "2026-11-22 11:31:45", result: "Denied", ip: "203.0.113.44" },
  { user: "sokeke", role: "Clinical Administrator", activity: "Exported census report", ts: "2026-11-22 11:20:19", result: "Success", ip: "10.20.1.7" },
  { user: "gferrante", role: "Registered Nurse", activity: "Opened chart outside assigned unit", ts: "2026-11-22 11:02:51", result: "Flagged", ip: "10.20.2.44" },
  { user: "isolberg", role: "Physician", activity: "MFA challenge completed", ts: "2026-11-22 10:58:03", result: "Success", ip: "10.20.8.3" },
  { user: "dkowalski", role: "Respiratory Therapist", activity: "Login attempt (expired password)", ts: "2026-11-22 10:41:27", result: "Denied", ip: "10.20.8.19" },
  { user: "cjohansson", role: "Clinical Administrator", activity: "Reviewed audit trail", ts: "2026-11-22 10:15:44", result: "Success", ip: "10.30.0.5" },
  { user: "hmarsh", role: "Physician", activity: "E-prescribed medication", ts: "2026-11-22 09:48:12", result: "Success", ip: "10.20.5.21" },
  { user: "unknown", role: "—", activity: "Login attempt", ts: "2026-11-22 09:30:08", result: "Denied", ip: "198.51.100.23" },
  { user: "blownes", role: "Clinical Administrator", activity: "Changed role permissions (demo)", ts: "2026-11-22 09:02:36", result: "Success", ip: "10.20.1.2" },
];

export const securityAlerts = [
  { severity: "critical", title: "5 failed logins from external IP 203.0.113.44", time: "11:31" },
  { severity: "warning", title: "Chart access outside assigned unit (gferrante)", time: "11:02" },
  { severity: "warning", title: "Password expired for 3 accounts", time: "10:41" },
  { severity: "info", title: "Quarterly access review due in 9 days", time: "08:00" },
];

export const rbacMatrix = {
  roles: ["Physician", "Registered Nurse", "Respiratory Therapist", "Clinical Administrator"],
  permissions: [
    { name: "View patient chart", grants: ["full", "full", "full", "limited"] },
    { name: "Write clinical notes", grants: ["full", "full", "full", "none"] },
    { name: "Order medications", grants: ["full", "none", "limited", "none"] },
    { name: "Administer / document meds", grants: ["limited", "full", "limited", "none"] },
    { name: "Adjust ventilator settings", grants: ["full", "none", "full", "none"] },
    { name: "Export reports", grants: ["limited", "none", "none", "full"] },
    { name: "Manage users & roles", grants: ["none", "none", "none", "full"] },
    { name: "View audit logs", grants: ["none", "none", "none", "full"] },
  ],
};

export const sessions = [
  { user: "avoss", role: "Physician", device: "Workstation 4W-NS-01", started: "07:02", idle: "1 min", mfa: true },
  { user: "isolberg", role: "Physician", device: "Workstation ICU-NS-02", started: "06:55", idle: "4 min", mfa: true },
  { user: "treyes", role: "Respiratory Therapist", device: "Mobile WOW-08", started: "07:10", idle: "0 min", mfa: true },
  { user: "pokafor", role: "Registered Nurse", device: "Workstation 4W-NS-03", started: "06:48", idle: "6 min", mfa: true },
  { user: "sokeke", role: "Clinical Administrator", device: "Laptop ADM-114", started: "08:30", idle: "12 min", mfa: true },
  { user: "gferrante", role: "Registered Nurse", device: "Workstation ED-T-01", started: "07:05", idle: "13 min", mfa: false },
];

export const loginActivity = {
  labels: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00"],
  success: [42, 188, 96, 54, 61, 48, 22],
  failed: [1, 6, 3, 4, 2, 7, 1],
};

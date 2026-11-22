// FICTIONAL ventilator and oxygen-therapy demonstration data.

export const ventilators = [
  { patientId: "P-10422", name: "Desmond Hartwell", bed: "ICU-07", mode: "AC/VC", vt: 420, pbw: 70, rate: 24, peep: 12, fio2: 70, pip: 34, pplat: 28, spo2: 88, rrMeasured: 28, status: "Critical", therapist: "Tomás Reyes, RRT", day: 3,
    abg: { ph: 7.29, paco2: 52, pao2: 64, hco3: 24, sao2: 89, time: "05:30" } },
  { patientId: "P-10429", name: "Henrietta Caldwell", bed: "ICU-03", mode: "PRVC", vt: 380, pbw: 55, rate: 20, peep: 8, fio2: 50, pip: 26, pplat: 22, spo2: 93, rrMeasured: 22, status: "Watch", therapist: "Tomás Reyes, RRT", day: 2,
    abg: { ph: 7.33, paco2: 41, pao2: 78, hco3: 21, sao2: 94, time: "06:10" } },
  { patientId: "P-10432", name: "Leopold Fairbanks", bed: "ICU-11", mode: "PSV", vt: 480, pbw: 75, rate: 14, peep: 5, fio2: 35, pip: 18, pplat: 15, spo2: 96, rrMeasured: 16, status: "Weaning", therapist: "Ruth Ambrose, RRT", day: 4,
    abg: { ph: 7.41, paco2: 39, pao2: 92, hco3: 24, sao2: 97, time: "06:45" } },
  { patientId: "V-20117", name: "Gideon Marchetti", bed: "ICU-02", mode: "AC/VC", vt: 450, pbw: 72, rate: 18, peep: 10, fio2: 55, pip: 30, pplat: 25, spo2: 92, rrMeasured: 20, status: "Watch", therapist: "Ruth Ambrose, RRT", day: 6,
    abg: { ph: 7.36, paco2: 45, pao2: 70, hco3: 25, sao2: 93, time: "04:50" } },
  { patientId: "V-20118", name: "Philippa Okoro", bed: "ICU-09", mode: "SIMV", vt: 400, pbw: 62, rate: 16, peep: 6, fio2: 40, pip: 22, pplat: 18, spo2: 97, rrMeasured: 18, status: "Stable", therapist: "Tomás Reyes, RRT", day: 1,
    abg: { ph: 7.40, paco2: 40, pao2: 98, hco3: 24, sao2: 98, time: "07:05" } },
  { patientId: "V-20119", name: "Ambrose Littlefield", bed: "ICU-14", mode: "APRV", vt: 510, pbw: 80, rate: 12, peep: 16, fio2: 80, pip: 35, pplat: 31, spo2: 87, rrMeasured: 24, status: "Critical", therapist: "Ruth Ambrose, RRT", day: 5,
    abg: { ph: 7.26, paco2: 58, pao2: 58, hco3: 25, sao2: 86, time: "05:15" } },
];

export const oxygenTherapy = [
  { patientId: "P-10426", name: "Thaddeus Brennick", bed: "6W-611", device: "BiPAP (nocturnal)", flow: "IPAP 14 / EPAP 6", fio2: 32, spo2: 90, target: "88–92%", status: "On target" },
  { patientId: "P-10436", name: "Ignatius Pemberton", bed: "6W-604", device: "High-flow nasal cannula", flow: "40 L/min", fio2: 45, spo2: 92, target: "≥ 92%", status: "On target" },
  { patientId: "P-10423", name: "Ellowyn Prater", bed: "ED-14", device: "Nasal cannula", flow: "3 L/min", fio2: 32, spo2: 94, target: "≥ 94%", status: "On target" },
  { patientId: "P-10427", name: "Saoirse Lindqvist", bed: "PED-204", device: "Nasal cannula", flow: "0.5 L/min", fio2: 24, spo2: 94, target: "≥ 92%", status: "Weaning" },
  { patientId: "P-10435", name: "Ottoline Varga", bed: "5E-514", device: "Venturi mask", flow: "8 L/min", fio2: 35, spo2: 95, target: "≥ 94%", status: "Monitor" },
  { patientId: "P-10421", name: "Marisol Quenby", bed: "4W-412", device: "Nasal cannula", flow: "2 L/min", fio2: 28, spo2: 93, target: "≥ 94%", status: "Below target" },
];

export const rtTasks = [
  { time: "13:00", task: "Ventilator check & SBT screen", bed: "ICU-11", owner: "Ruth Ambrose, RRT" },
  { time: "13:30", task: "ABG draw", bed: "ICU-14", owner: "Ruth Ambrose, RRT" },
  { time: "14:00", task: "Nebulizer treatment", bed: "ED-14", owner: "Tomás Reyes, RRT" },
  { time: "14:30", task: "HFNC wean assessment", bed: "6W-604", owner: "Tomás Reyes, RRT" },
  { time: "15:00", task: "Prone position return", bed: "ICU-07", owner: "Tomás Reyes, RRT" },
];

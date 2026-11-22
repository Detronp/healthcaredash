// FICTIONAL staff directory for demonstration only.

export const ROLES = ["Physician", "Registered Nurse", "Respiratory Therapist", "Clinical Administrator"];

const s = (name, id, department, position, role, shift, availability, assigned, ext) =>
  ({ name, id, department, position, role, shift, availability, assigned, ext });

export const staff = [
  s("Dr. Alden Voss", "E-3001", "Cardiology", "Attending Cardiologist", "Physician", "Day (07–19)", "On Duty", 12, "4410"),
  s("Dr. Ingrid Solberg", "E-3002", "ICU", "Intensivist", "Physician", "Day (07–19)", "On Duty", 8, "4120"),
  s("Dr. Kenji Watanabe", "E-3003", "ICU", "Intensivist", "Physician", "Night (19–07)", "Off Duty", 0, "4121"),
  s("Dr. Marcus Feld", "E-3004", "Emergency", "Emergency Physician", "Physician", "Day (07–19)", "On Duty", 9, "4001"),
  s("Dr. Helena Marsh", "E-3005", "Neurology", "Neurologist", "Physician", "Day (07–19)", "In Procedure", 7, "4530"),
  s("Dr. Naomi Thistle", "E-3006", "Pulmonology", "Pulmonologist", "Physician", "Day (07–19)", "On Duty", 10, "4610"),
  s("Dr. Coleman Adebayo", "E-3007", "Orthopedics", "Orthopedic Surgeon", "Physician", "Day (07–19)", "In Procedure", 6, "4310"),
  s("Dr. Yara Delacroix", "E-3008", "Oncology", "Oncologist", "Physician", "Day (07–19)", "On Call", 11, "4710"),
  s("Dr. Oren Castellano", "E-3009", "Pediatrics", "Pediatrician", "Physician", "Day (07–19)", "On Duty", 8, "4210"),
  s("Priya Okafor, RN", "E-4101", "Cardiology", "Charge Nurse", "Registered Nurse", "Day (07–19)", "On Duty", 5, "4412"),
  s("Lucas Brandt, RN", "E-4102", "ICU", "Critical Care RN", "Registered Nurse", "Day (07–19)", "On Duty", 2, "4125"),
  s("Amara Nwosu, RN", "E-4103", "ICU", "Critical Care RN", "Registered Nurse", "Night (19–07)", "Off Duty", 0, "4126"),
  s("Giulia Ferrante, RN", "E-4104", "Emergency", "ED Triage RN", "Registered Nurse", "Day (07–19)", "On Break", 4, "4005"),
  s("Hamza Siddiqui, RN", "E-4105", "Pediatrics", "Pediatric RN", "Registered Nurse", "Evening (15–23)", "On Duty", 4, "4214"),
  s("Mei-Ling Zhou, RN", "E-4106", "Oncology", "Oncology RN", "Registered Nurse", "Day (07–19)", "On Duty", 5, "4715"),
  s("Tomás Reyes, RRT", "E-5201", "Respiratory Care", "Registered Respiratory Therapist", "Respiratory Therapist", "Day (07–19)", "On Duty", 9, "4801"),
  s("Ruth Ambrose, RRT", "E-5202", "Respiratory Care", "Lead Respiratory Therapist", "Respiratory Therapist", "Day (07–19)", "On Duty", 7, "4802"),
  s("Darius Kowalski, CRT", "E-5203", "Respiratory Care", "Certified Respiratory Therapist", "Respiratory Therapist", "Night (19–07)", "Off Duty", 0, "4803"),
  s("Beatrix Lownes", "E-6301", "Administration", "Director of Clinical Operations", "Clinical Administrator", "Business Hours", "On Duty", 0, "4900"),
  s("Samuel Okeke", "E-6302", "Administration", "Bed Management Coordinator", "Clinical Administrator", "Day (07–19)", "On Duty", 0, "4905"),
  s("Clara Johansson", "E-6303", "Compliance", "Privacy & Compliance Officer", "Clinical Administrator", "Business Hours", "Remote", 0, "4950"),
];

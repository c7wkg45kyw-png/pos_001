"use client";

import { useEffect, useState } from "react";

export type Gender = "male" | "female" | "non_binary";
export type EmploymentType = "full_time" | "part_time" | "contractor" | "intern";
export type EmploymentStatus = "active" | "suspended" | "terminated";
export type DocumentType = "id_card" | "resume" | "house_registration" | "education_transcript" | "medical_certificate";
export type AttendanceStatus = "present" | "late" | "absent" | "on_leave" | "half_day";
export type LeaveType = "sick" | "annual" | "personal" | "maternity";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type PayrollCycleStatus = "draft" | "processing" | "calculated" | "locked" | "paid";
export type PayrollItemType = "addition" | "deduction";
export type CycleStatus = "draft" | "active" | "locked" | "completed";
export type EvaluationStatus = "pending_self" | "pending_manager" | "submitted" | "completed";
export type CourseType = "mandatory" | "optional" | "invite_only";
export type EnrollmentStatus = "assigned" | "in_progress" | "completed" | "failed";

export type HRUser = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  firstNameEn: string;
  lastNameEn: string;
  citizenId: string;
  birthDate: string;
  gender: Gender;
  personalEmail: string;
  phoneNumber: string;
  currentAddress: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
};

export type EmployeeProfile = {
  id: string;
  employeeId: string;
  companyEmail: string;
  department: string;
  positionTitle: string;
  employmentType: EmploymentType;
  joinedDate: string;
  probationEndDate: string | null;
  employmentStatus: EmploymentStatus;
  reportsTo: string;
  jobHistory: Array<{ title: string; period: string; note: string }>;
};

export type EmployeeDocument = {
  id: string;
  employeeId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
};

export type AttendanceLog = {
  id: string;
  employeeId: string;
  workDate: string;
  clockIn: string | null;
  clockOut: string | null;
  status: AttendanceStatus;
  deviceSource: string;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentUrl: string | null;
  status: LeaveStatus;
  approvedBy: string | null;
  updatedAt: string;
};

export type PayrollCycle = {
  id: string;
  cycleMonth: number;
  cycleYear: number;
  startDate: string;
  endDate: string;
  payoutDate: string;
  totalPayout: number;
  status: PayrollCycleStatus;
};

export type EmployeePayslip = {
  id: string;
  payrollCycleId: string;
  employeeId: string;
  baseSalary: number;
  totalAdditions: number;
  totalDeductions: number;
  netPay: number;
  isPublished: boolean;
};

export type PayrollItem = {
  id: string;
  payslipId: string;
  itemType: PayrollItemType;
  itemName: string;
  amount: number;
};

export type EvaluationCycle = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
};

export type EmployeeEvaluation = {
  id: string;
  cycleId: string;
  employeeId: string;
  managerId: string;
  selfScore: number | null;
  managerScore: number | null;
  finalScore: number | null;
  grade: string | null;
  status: EvaluationStatus;
  comments: string | null;
};

export type EmployeeGoal = {
  id: string;
  evaluationId: string;
  goalTitle: string;
  weight: number;
  targetValue: string;
  achievedValue: string | null;
  progressPercentage: number;
};

export type Course = {
  id: string;
  courseCode: string;
  title: string;
  description: string;
  type: CourseType;
  durationHours: number;
  maxSeats: number | null;
  isActive: boolean;
  createdAt: string;
};

export type CourseEnrollment = {
  id: string;
  courseId: string;
  employeeId: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  completedAt: string | null;
  certificateUrl: string | null;
};

export type HRWorkspaceState = {
  users: HRUser[];
  profiles: EmployeeProfile[];
  documents: EmployeeDocument[];
  attendanceLogs: AttendanceLog[];
  leaveRequests: LeaveRequest[];
  payrollCycles: PayrollCycle[];
  employeePayslips: EmployeePayslip[];
  payrollItems: PayrollItem[];
  evaluationCycles: EvaluationCycle[];
  employeeEvaluations: EmployeeEvaluation[];
  employeeGoals: EmployeeGoal[];
  courses: Course[];
  courseEnrollments: CourseEnrollment[];
};

const STORAGE_KEY = "qms001_hr_workspace_v1";
const EVENT_NAME = "qms001:hr-workspace-updated";
const WORKSPACE_TODAY = "2026-06-30";

export const requiredDocuments: DocumentType[] = [
  "id_card",
  "resume",
  "house_registration",
  "education_transcript",
  "medical_certificate"
];

const defaultWorkspace: HRWorkspaceState = {
  users: [
    {
      id: "emp-1",
      employeeCode: "EMP2026-001",
      firstName: "ณรินทร์",
      lastName: "ชัยยสิทธิ์",
      firstNameEn: "Narin",
      lastNameEn: "Chaiyasit",
      citizenId: "1101700200111",
      birthDate: "1992-04-18",
      gender: "male",
      personalEmail: "narin.personal@example.com",
      phoneNumber: "081-100-1001",
      currentAddress: "88/12 Rattanathibet Rd, Nonthaburi 11000",
      emergencyContactName: "Kanya Chaiyasit",
      emergencyContactRelation: "Spouse",
      emergencyContactPhone: "089-800-1221"
    },
    {
      id: "emp-2",
      employeeCode: "EMP2026-002",
      firstName: "มะลิ",
      lastName: "ศิริพร",
      firstNameEn: "Mali",
      lastNameEn: "Siriporn",
      citizenId: "1101700200222",
      birthDate: "1991-11-02",
      gender: "female",
      personalEmail: "mali.personal@example.com",
      phoneNumber: "081-100-1002",
      currentAddress: "15/7 Chaeng Watthana, Bangkok 10210",
      emergencyContactName: "Prasit Siriporn",
      emergencyContactRelation: "Brother",
      emergencyContactPhone: "086-222-4590"
    },
    {
      id: "emp-3",
      employeeCode: "EMP2026-003",
      firstName: "พิมพ์ชนก",
      lastName: "สุธรรม",
      firstNameEn: "Pimchanok",
      lastNameEn: "Sutham",
      citizenId: "1101700200333",
      birthDate: "1995-07-25",
      gender: "female",
      personalEmail: "pimchanok.personal@example.com",
      phoneNumber: "081-100-1003",
      currentAddress: "42/90 Srinakarin, Samut Prakan 10270",
      emergencyContactName: "Anan Sutham",
      emergencyContactRelation: "Father",
      emergencyContactPhone: "085-612-1234"
    },
    {
      id: "emp-4",
      employeeCode: "EMP2026-004",
      firstName: "กิตติพงษ์",
      lastName: "เลิศ",
      firstNameEn: "Kittipong",
      lastNameEn: "Lert",
      citizenId: "1101700200444",
      birthDate: "1990-09-12",
      gender: "male",
      personalEmail: "kittipong.personal@example.com",
      phoneNumber: "081-100-1004",
      currentAddress: "10/44 Rama 2, Bangkok 10150",
      emergencyContactName: "Naree Lert",
      emergencyContactRelation: "Mother",
      emergencyContactPhone: "084-334-2221"
    },
    {
      id: "emp-5",
      employeeCode: "EMP2026-005",
      firstName: "ธนิดา",
      lastName: "วงศ์",
      firstNameEn: "Thanida",
      lastNameEn: "Wong",
      citizenId: "1101700200555",
      birthDate: "1998-01-10",
      gender: "female",
      personalEmail: "thanida.personal@example.com",
      phoneNumber: "081-100-1005",
      currentAddress: "99/1 Lat Phrao, Bangkok 10310",
      emergencyContactName: "Suda Wong",
      emergencyContactRelation: "Mother",
      emergencyContactPhone: "082-700-3199"
    },
    {
      id: "emp-6",
      employeeCode: "EMP2026-006",
      firstName: "อัครเดช",
      lastName: "ปรีชา",
      firstNameEn: "Akkharadet",
      lastNameEn: "Preecha",
      citizenId: "1101700200666",
      birthDate: "1988-03-05",
      gender: "male",
      personalEmail: "akkharadet.personal@example.com",
      phoneNumber: "081-100-1006",
      currentAddress: "77/8 Sukhumvit, Bangkok 10110",
      emergencyContactName: "Patchara Preecha",
      emergencyContactRelation: "Spouse",
      emergencyContactPhone: "081-220-4001"
    }
  ],
  profiles: [
    {
      id: "profile-1",
      employeeId: "emp-1",
      companyEmail: "narin@company.example",
      department: "Technology",
      positionTitle: "Senior Backend Engineer",
      employmentType: "full_time",
      joinedDate: "2024-02-01",
      probationEndDate: "2024-05-01",
      employmentStatus: "active",
      reportsTo: "Chief Technology Officer",
      jobHistory: [
        { title: "Backend Developer", period: "2024-02-01 to 2025-01-31", note: "Joined platform services team" },
        { title: "Senior Backend Engineer", period: "2025-02-01 to present", note: "Promoted after infrastructure migration project" }
      ]
    },
    {
      id: "profile-2",
      employeeId: "emp-2",
      companyEmail: "mali@company.example",
      department: "Human Resources",
      positionTitle: "HR Business Partner",
      employmentType: "full_time",
      joinedDate: "2023-08-15",
      probationEndDate: "2023-11-15",
      employmentStatus: "active",
      reportsTo: "Head of People Operations",
      jobHistory: [{ title: "HR Business Partner", period: "2023-08-15 to present", note: "Leads organization design and talent operations" }]
    },
    {
      id: "profile-3",
      employeeId: "emp-3",
      companyEmail: "pimchanok@company.example",
      department: "Sales",
      positionTitle: "Sales Executive",
      employmentType: "intern",
      joinedDate: "2026-05-06",
      probationEndDate: null,
      employmentStatus: "active",
      reportsTo: "Regional Sales Lead",
      jobHistory: [{ title: "Sales Executive Intern", period: "2026-05-06 to present", note: "Supports commercial pipeline and outbound follow-up" }]
    },
    {
      id: "profile-4",
      employeeId: "emp-4",
      companyEmail: "kittipong@company.example",
      department: "Operations",
      positionTitle: "Operations Analyst",
      employmentType: "contractor",
      joinedDate: "2025-03-10",
      probationEndDate: null,
      employmentStatus: "suspended",
      reportsTo: "Operations Manager",
      jobHistory: [{ title: "Operations Analyst", period: "2025-03-10 to present", note: "Temporary suspension pending process audit" }]
    },
    {
      id: "profile-5",
      employeeId: "emp-5",
      companyEmail: "thanida@company.example",
      department: "Technology",
      positionTitle: "Frontend Engineer",
      employmentType: "full_time",
      joinedDate: "2024-11-01",
      probationEndDate: "2025-02-01",
      employmentStatus: "active",
      reportsTo: "Engineering Manager",
      jobHistory: [{ title: "Frontend Engineer", period: "2024-11-01 to present", note: "Owns UI framework and design system flows" }]
    },
    {
      id: "profile-6",
      employeeId: "emp-6",
      companyEmail: "akkharadet@company.example",
      department: "Sales",
      positionTitle: "Regional Sales Lead",
      employmentType: "full_time",
      joinedDate: "2022-05-01",
      probationEndDate: "2022-08-01",
      employmentStatus: "active",
      reportsTo: "Chief Revenue Officer",
      jobHistory: [{ title: "Regional Sales Lead", period: "2022-05-01 to present", note: "Leads pipeline strategy and regional expansion." }]
    }
  ],
  documents: [
    { id: "doc-1", employeeId: "emp-1", documentType: "id_card", fileName: "narin-id-card.pdf", fileUrl: "vault/narin-id-card.pdf", uploadedAt: "2024-02-01T10:20:00Z" },
    { id: "doc-2", employeeId: "emp-1", documentType: "resume", fileName: "narin-resume.pdf", fileUrl: "vault/narin-resume.pdf", uploadedAt: "2024-02-01T10:22:00Z" },
    { id: "doc-3", employeeId: "emp-1", documentType: "education_transcript", fileName: "narin-transcript.pdf", fileUrl: "vault/narin-transcript.pdf", uploadedAt: "2024-02-02T09:00:00Z" },
    { id: "doc-4", employeeId: "emp-2", documentType: "id_card", fileName: "mali-id-card.pdf", fileUrl: "vault/mali-id-card.pdf", uploadedAt: "2023-08-15T08:10:00Z" },
    { id: "doc-5", employeeId: "emp-2", documentType: "resume", fileName: "mali-resume.pdf", fileUrl: "vault/mali-resume.pdf", uploadedAt: "2023-08-15T08:15:00Z" },
    { id: "doc-6", employeeId: "emp-2", documentType: "house_registration", fileName: "mali-house.pdf", fileUrl: "vault/mali-house.pdf", uploadedAt: "2023-08-15T08:18:00Z" },
    { id: "doc-7", employeeId: "emp-3", documentType: "resume", fileName: "pimchanok-resume.pdf", fileUrl: "vault/pimchanok-resume.pdf", uploadedAt: "2026-05-05T16:42:00Z" },
    { id: "doc-8", employeeId: "emp-3", documentType: "medical_certificate", fileName: "pimchanok-medical.pdf", fileUrl: "vault/pimchanok-medical.pdf", uploadedAt: "2026-05-05T16:50:00Z" },
    { id: "doc-9", employeeId: "emp-4", documentType: "id_card", fileName: "kittipong-id-card.pdf", fileUrl: "vault/kittipong-id-card.pdf", uploadedAt: "2025-03-10T09:20:00Z" },
    { id: "doc-10", employeeId: "emp-5", documentType: "id_card", fileName: "thanida-id-card.pdf", fileUrl: "vault/thanida-id-card.pdf", uploadedAt: "2024-11-01T10:00:00Z" },
    { id: "doc-11", employeeId: "emp-5", documentType: "resume", fileName: "thanida-resume.pdf", fileUrl: "vault/thanida-resume.pdf", uploadedAt: "2024-11-01T10:05:00Z" },
    { id: "doc-12", employeeId: "emp-5", documentType: "education_transcript", fileName: "thanida-transcript.pdf", fileUrl: "vault/thanida-transcript.pdf", uploadedAt: "2024-11-01T10:10:00Z" },
    { id: "doc-13", employeeId: "emp-6", documentType: "id_card", fileName: "akkharadet-id-card.pdf", fileUrl: "vault/akkharadet-id-card.pdf", uploadedAt: "2022-05-01T08:30:00Z" },
    { id: "doc-14", employeeId: "emp-6", documentType: "resume", fileName: "akkharadet-resume.pdf", fileUrl: "vault/akkharadet-resume.pdf", uploadedAt: "2022-05-01T08:35:00Z" },
    { id: "doc-15", employeeId: "emp-6", documentType: "house_registration", fileName: "akkharadet-house.pdf", fileUrl: "vault/akkharadet-house.pdf", uploadedAt: "2022-05-01T08:45:00Z" },
    { id: "doc-16", employeeId: "emp-6", documentType: "education_transcript", fileName: "akkharadet-transcript.pdf", fileUrl: "vault/akkharadet-transcript.pdf", uploadedAt: "2022-05-01T08:50:00Z" }
  ],
  attendanceLogs: [
    { id: "att-1", employeeId: "emp-1", workDate: "2026-06-30", clockIn: "2026-06-30T08:56:00Z", clockOut: "2026-06-30T18:02:00Z", status: "present", deviceSource: "Web_Portal" },
    { id: "att-2", employeeId: "emp-2", workDate: "2026-06-30", clockIn: "2026-06-30T09:17:00Z", clockOut: null, status: "late", deviceSource: "Mobile_App_GPS" },
    { id: "att-3", employeeId: "emp-3", workDate: "2026-06-30", clockIn: "2026-06-30T08:49:00Z", clockOut: "2026-06-30T17:55:00Z", status: "present", deviceSource: "Fingerprint_Scanner" },
    { id: "att-4", employeeId: "emp-4", workDate: "2026-06-30", clockIn: null, clockOut: null, status: "absent", deviceSource: "Web_Portal" },
    { id: "att-5", employeeId: "emp-5", workDate: "2026-06-30", clockIn: null, clockOut: null, status: "on_leave", deviceSource: "Mobile_App_GPS" },
    { id: "att-6", employeeId: "emp-6", workDate: "2026-06-30", clockIn: "2026-06-30T09:02:00Z", clockOut: "2026-06-30T13:10:00Z", status: "half_day", deviceSource: "Web_Portal" },
    { id: "att-7", employeeId: "emp-1", workDate: "2026-06-29", clockIn: "2026-06-29T08:53:00Z", clockOut: "2026-06-29T18:03:00Z", status: "present", deviceSource: "Web_Portal" },
    { id: "att-8", employeeId: "emp-2", workDate: "2026-06-29", clockIn: "2026-06-29T08:58:00Z", clockOut: "2026-06-29T18:00:00Z", status: "present", deviceSource: "Mobile_App_GPS" }
  ],
  leaveRequests: [
    { id: "leave-1", employeeId: "emp-5", leaveType: "sick", startDate: "2026-06-30", endDate: "2026-06-30", totalDays: 1, reason: "Fever and medical checkup", attachmentUrl: "medical-certificate-june-30.pdf", status: "pending", approvedBy: null, updatedAt: "2026-06-30T07:52:00Z" },
    { id: "leave-2", employeeId: "emp-4", leaveType: "personal", startDate: "2026-07-02", endDate: "2026-07-02", totalDays: 0.5, reason: "Family appointment in the morning", attachmentUrl: null, status: "pending", approvedBy: null, updatedAt: "2026-06-30T08:05:00Z" },
    { id: "leave-3", employeeId: "emp-2", leaveType: "annual", startDate: "2026-07-10", endDate: "2026-07-12", totalDays: 3, reason: "Planned vacation", attachmentUrl: null, status: "approved", approvedBy: "emp-6", updatedAt: "2026-06-28T11:30:00Z" },
    { id: "leave-4", employeeId: "emp-3", leaveType: "personal", startDate: "2026-07-04", endDate: "2026-07-04", totalDays: 1, reason: "Personal documentation matter", attachmentUrl: "request-supporting-doc.pdf", status: "rejected", approvedBy: "emp-2", updatedAt: "2026-06-29T13:15:00Z" }
  ],
  payrollCycles: [
    { id: "pay-cycle-1", cycleMonth: 6, cycleYear: 2026, startDate: "2026-06-01", endDate: "2026-06-30", payoutDate: "2026-07-03", totalPayout: 26150, status: "calculated" },
    { id: "pay-cycle-2", cycleMonth: 5, cycleYear: 2026, startDate: "2026-05-01", endDate: "2026-05-31", payoutDate: "2026-06-03", totalPayout: 25890, status: "paid" },
    { id: "pay-cycle-3", cycleMonth: 7, cycleYear: 2026, startDate: "2026-07-01", endDate: "2026-07-31", payoutDate: "2026-08-04", totalPayout: 0, status: "draft" }
  ],
  employeePayslips: [
    { id: "slip-1", payrollCycleId: "pay-cycle-1", employeeId: "emp-1", baseSalary: 4200, totalAdditions: 380, totalDeductions: 245, netPay: 4335, isPublished: false },
    { id: "slip-2", payrollCycleId: "pay-cycle-1", employeeId: "emp-2", baseSalary: 3600, totalAdditions: 210, totalDeductions: 190, netPay: 3620, isPublished: false },
    { id: "slip-3", payrollCycleId: "pay-cycle-1", employeeId: "emp-3", baseSalary: 3950, totalAdditions: 510, totalDeductions: 260, netPay: 4200, isPublished: true },
    { id: "slip-4", payrollCycleId: "pay-cycle-1", employeeId: "emp-4", baseSalary: 3100, totalAdditions: 165, totalDeductions: 140, netPay: 3125, isPublished: false },
    { id: "slip-5", payrollCycleId: "pay-cycle-1", employeeId: "emp-5", baseSalary: 4050, totalAdditions: 275, totalDeductions: 210, netPay: 4115, isPublished: true },
    { id: "slip-6", payrollCycleId: "pay-cycle-1", employeeId: "emp-6", baseSalary: 5100, totalAdditions: 980, totalDeductions: 325, netPay: 5755, isPublished: false },
    { id: "slip-7", payrollCycleId: "pay-cycle-2", employeeId: "emp-1", baseSalary: 4200, totalAdditions: 320, totalDeductions: 240, netPay: 4280, isPublished: true },
    { id: "slip-8", payrollCycleId: "pay-cycle-2", employeeId: "emp-2", baseSalary: 3600, totalAdditions: 185, totalDeductions: 180, netPay: 3605, isPublished: true }
  ],
  payrollItems: [
    { id: "item-1", payslipId: "slip-1", itemType: "addition", itemName: "Overtime OT", amount: 180 },
    { id: "item-2", payslipId: "slip-1", itemType: "addition", itemName: "Project Bonus", amount: 200 },
    { id: "item-3", payslipId: "slip-1", itemType: "deduction", itemName: "Social Security", amount: 75 },
    { id: "item-4", payslipId: "slip-1", itemType: "deduction", itemName: "Withholding Tax", amount: 170 },
    { id: "item-5", payslipId: "slip-2", itemType: "addition", itemName: "Transport Allowance", amount: 90 },
    { id: "item-6", payslipId: "slip-2", itemType: "addition", itemName: "Recruitment Incentive", amount: 120 },
    { id: "item-7", payslipId: "slip-2", itemType: "deduction", itemName: "Social Security", amount: 75 },
    { id: "item-8", payslipId: "slip-2", itemType: "deduction", itemName: "Tax", amount: 115 },
    { id: "item-9", payslipId: "slip-3", itemType: "addition", itemName: "Sales Commission", amount: 360 },
    { id: "item-10", payslipId: "slip-3", itemType: "addition", itemName: "Travel Claim", amount: 150 },
    { id: "item-11", payslipId: "slip-3", itemType: "deduction", itemName: "Social Security", amount: 75 },
    { id: "item-12", payslipId: "slip-3", itemType: "deduction", itemName: "Tax", amount: 185 },
    { id: "item-13", payslipId: "slip-4", itemType: "addition", itemName: "Shift Allowance", amount: 120 },
    { id: "item-14", payslipId: "slip-4", itemType: "addition", itemName: "Attendance Bonus", amount: 45 },
    { id: "item-15", payslipId: "slip-4", itemType: "deduction", itemName: "Social Security", amount: 75 },
    { id: "item-16", payslipId: "slip-4", itemType: "deduction", itemName: "Late Penalty", amount: 65 },
    { id: "item-17", payslipId: "slip-5", itemType: "addition", itemName: "UI Delivery Bonus", amount: 275 },
    { id: "item-18", payslipId: "slip-5", itemType: "deduction", itemName: "Social Security", amount: 75 },
    { id: "item-19", payslipId: "slip-5", itemType: "deduction", itemName: "Tax", amount: 135 },
    { id: "item-20", payslipId: "slip-6", itemType: "addition", itemName: "Regional Commission", amount: 700 },
    { id: "item-21", payslipId: "slip-6", itemType: "addition", itemName: "Quarter Bonus", amount: 280 },
    { id: "item-22", payslipId: "slip-6", itemType: "deduction", itemName: "Social Security", amount: 75 },
    { id: "item-23", payslipId: "slip-6", itemType: "deduction", itemName: "Tax", amount: 250 }
  ],
  evaluationCycles: [
    { id: "cycle-1", title: "Mid-Year Review 2026", startDate: "2026-06-01", endDate: "2026-07-15", status: "active" },
    { id: "cycle-2", title: "Quarterly Check-In Q1 2026", startDate: "2026-01-05", endDate: "2026-03-31", status: "completed" },
    { id: "cycle-3", title: "Annual Evaluation 2026", startDate: "2026-11-01", endDate: "2026-12-20", status: "draft" }
  ],
  employeeEvaluations: [
    { id: "eval-1", cycleId: "cycle-1", employeeId: "emp-1", managerId: "emp-6", selfScore: 4.3, managerScore: null, finalScore: null, grade: null, status: "pending_manager", comments: "Self review submitted. Waiting for manager calibration." },
    { id: "eval-2", cycleId: "cycle-1", employeeId: "emp-2", managerId: "emp-6", selfScore: null, managerScore: null, finalScore: null, grade: null, status: "pending_self", comments: "Reminder scheduled for self assessment completion." },
    { id: "eval-3", cycleId: "cycle-1", employeeId: "emp-3", managerId: "emp-6", selfScore: 4.0, managerScore: 4.2, finalScore: 4.1, grade: "A", status: "completed", comments: "Strong pipeline execution and customer expansion delivery." },
    { id: "eval-4", cycleId: "cycle-1", employeeId: "emp-4", managerId: "emp-2", selfScore: 3.7, managerScore: 3.8, finalScore: null, grade: null, status: "submitted", comments: "Ready for HR calibration review." },
    { id: "eval-5", cycleId: "cycle-2", employeeId: "emp-5", managerId: "emp-1", selfScore: 4.4, managerScore: 4.5, finalScore: 4.45, grade: "A", status: "completed", comments: "Exceeded delivery expectations and mentored junior developers." },
    { id: "eval-6", cycleId: "cycle-2", employeeId: "emp-6", managerId: "emp-2", selfScore: 4.1, managerScore: 4.0, finalScore: 4.05, grade: "A", status: "completed", comments: "Strong regional leadership and deal quality." }
  ],
  employeeGoals: [
    { id: "goal-1", evaluationId: "eval-1", goalTitle: "Ship platform API milestones on schedule", weight: 35, targetValue: "Launch 4 roadmap milestones", achievedValue: "3 milestones launched, 1 in QA", progressPercentage: 78 },
    { id: "goal-2", evaluationId: "eval-1", goalTitle: "Reduce incident response time", weight: 25, targetValue: "Average under 25 minutes", achievedValue: "28 minutes average", progressPercentage: 82 },
    { id: "goal-3", evaluationId: "eval-1", goalTitle: "Mentor junior backend engineers", weight: 40, targetValue: "2 mentees with quarterly plan", achievedValue: "2 mentees active", progressPercentage: 100 },
    { id: "goal-4", evaluationId: "eval-2", goalTitle: "Improve onboarding satisfaction", weight: 50, targetValue: "Reach 90% satisfaction score", achievedValue: "Survey in progress", progressPercentage: 42 },
    { id: "goal-5", evaluationId: "eval-2", goalTitle: "Standardize hiring coordinator playbook", weight: 50, targetValue: "Roll out 1 shared playbook", achievedValue: "Draft completed", progressPercentage: 68 },
    { id: "goal-6", evaluationId: "eval-3", goalTitle: "Grow key account revenue", weight: 50, targetValue: "Increase by 15%", achievedValue: "Increased by 18%", progressPercentage: 100 },
    { id: "goal-7", evaluationId: "eval-3", goalTitle: "Maintain proposal win-rate", weight: 25, targetValue: "Win rate at 42%", achievedValue: "Closed at 44%", progressPercentage: 100 },
    { id: "goal-8", evaluationId: "eval-3", goalTitle: "Coach new sales representatives", weight: 25, targetValue: "2 reps onboarded", achievedValue: "2 reps onboarded", progressPercentage: 100 },
    { id: "goal-9", evaluationId: "eval-4", goalTitle: "Improve order processing accuracy", weight: 60, targetValue: "Accuracy above 98.5%", achievedValue: "98.2%", progressPercentage: 91 },
    { id: "goal-10", evaluationId: "eval-4", goalTitle: "Shorten fulfillment handoff time", weight: 40, targetValue: "Average under 6 hours", achievedValue: "6.4 hours average", progressPercentage: 88 },
    { id: "goal-11", evaluationId: "eval-5", goalTitle: "Improve design system adoption", weight: 50, targetValue: "Use shared components in 90% of flows", achievedValue: "Reached 94%", progressPercentage: 100 },
    { id: "goal-12", evaluationId: "eval-6", goalTitle: "Increase quarterly regional pipeline", weight: 100, targetValue: "Pipeline growth 20%", achievedValue: "Pipeline growth 22%", progressPercentage: 100 }
  ],
  courses: [
    { id: "course-1", courseCode: "TRN-2026-01", title: "Cybersecurity 101", description: "Foundation course for secure password handling, phishing awareness, and company device safety.", type: "mandatory", durationHours: 6, maxSeats: 40, isActive: true, createdAt: "2026-06-02T09:00:00Z" },
    { id: "course-2", courseCode: "TRN-2026-02", title: "Golang Advanced Concept", description: "Deep dive into concurrency patterns, context usage, testing, and service design.", type: "invite_only", durationHours: 12, maxSeats: 18, isActive: true, createdAt: "2026-06-10T09:00:00Z" },
    { id: "course-3", courseCode: "TRN-2026-03", title: "Customer Communication Essentials", description: "Improve service tone, escalation handling, and written communication for cross-team work.", type: "optional", durationHours: 4.5, maxSeats: null, isActive: false, createdAt: "2026-05-24T09:00:00Z" },
    { id: "course-4", courseCode: "TRN-2026-04", title: "Leadership Coaching for Team Leads", description: "Coaching conversations, performance follow-up, and practical leadership rituals.", type: "invite_only", durationHours: 8, maxSeats: 12, isActive: true, createdAt: "2026-06-20T09:00:00Z" }
  ],
  courseEnrollments: [
    { id: "enrollment-1", courseId: "course-1", employeeId: "emp-1", enrollmentDate: "2026-06-05", status: "completed", progressPercentage: 100, completedAt: "2026-06-11T13:45:00Z", certificateUrl: "https://example.com/certificates/cybersecurity-101-narin.pdf" },
    { id: "enrollment-2", courseId: "course-1", employeeId: "emp-3", enrollmentDate: "2026-06-09", status: "in_progress", progressPercentage: 60, completedAt: null, certificateUrl: null },
    { id: "enrollment-3", courseId: "course-2", employeeId: "emp-5", enrollmentDate: "2026-06-12", status: "assigned", progressPercentage: 15, completedAt: null, certificateUrl: null },
    { id: "enrollment-4", courseId: "course-3", employeeId: "emp-4", enrollmentDate: "2026-05-27", status: "failed", progressPercentage: 100, completedAt: "2026-06-01T10:30:00Z", certificateUrl: null },
    { id: "enrollment-5", courseId: "course-4", employeeId: "emp-2", enrollmentDate: "2026-06-21", status: "completed", progressPercentage: 100, completedAt: "2026-06-27T16:20:00Z", certificateUrl: "https://example.com/certificates/leadership-coaching-mali.pdf" },
    { id: "enrollment-6", courseId: "course-2", employeeId: "emp-1", enrollmentDate: "2026-06-16", status: "in_progress", progressPercentage: 72, completedAt: null, certificateUrl: null }
  ]
};

function cloneWorkspace(value: HRWorkspaceState): HRWorkspaceState {
  return JSON.parse(JSON.stringify(value)) as HRWorkspaceState;
}

export function loadHRWorkspace(): HRWorkspaceState {
  if (typeof window === "undefined") {
    return cloneWorkspace(defaultWorkspace);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return cloneWorkspace(defaultWorkspace);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<HRWorkspaceState>;
    return {
      ...cloneWorkspace(defaultWorkspace),
      ...parsed
    };
  } catch {
    return cloneWorkspace(defaultWorkspace);
  }
}

export function saveHRWorkspace(next: HRWorkspaceState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useHRWorkspace() {
  const [workspace, setWorkspace] = useState<HRWorkspaceState>(() => cloneWorkspace(defaultWorkspace));

  useEffect(() => {
    const sync = () => {
      setWorkspace(loadHRWorkspace());
    };

    sync();
    window.addEventListener(EVENT_NAME, sync);
    return () => window.removeEventListener(EVENT_NAME, sync);
  }, []);

  function updateWorkspace(updater: HRWorkspaceState | ((current: HRWorkspaceState) => HRWorkspaceState)) {
    setWorkspace((current) => {
      const base = cloneWorkspace(current);
      const next = typeof updater === "function" ? updater(base) : updater;
      saveHRWorkspace(next);
      return next;
    });
  }

  return { workspace, updateWorkspace };
}

export function employeeFullName(user: HRUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function employmentTypeLabel(value: EmploymentType) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function documentLabel(value: DocumentType) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function estimateBaseSalary(profile: EmployeeProfile) {
  const departmentBase: Record<string, number> = {
    Technology: 4200,
    "Human Resources": 3600,
    Sales: 3900,
    Operations: 3200,
    Finance: 3800
  };

  const employmentModifier: Record<EmploymentType, number> = {
    full_time: 1,
    part_time: 0.55,
    contractor: 0.8,
    intern: 0.45
  };

  const base = departmentBase[profile.department] ?? 3500;
  return Math.round(base * (employmentModifier[profile.employmentType] ?? 1));
}

export function appendNewEmployeeRelations(state: HRWorkspaceState, user: HRUser, profile: EmployeeProfile): HRWorkspaceState {
  const next = cloneWorkspace(state);
  next.users = [user, ...next.users];
  next.profiles = [profile, ...next.profiles];

  if (profile.employmentStatus === "active") {
    next.attendanceLogs = [
      {
        id: `att-${crypto.randomUUID()}`,
        employeeId: user.id,
        workDate: WORKSPACE_TODAY,
        clockIn: null,
        clockOut: null,
        status: "absent",
        deviceSource: "Web_Portal"
      },
      ...next.attendanceLogs
    ];
  }

  const activeCycle = next.evaluationCycles.find((cycle) => cycle.status === "active");
  if (activeCycle && profile.employmentStatus === "active") {
    next.employeeEvaluations = [
      {
        id: `eval-${crypto.randomUUID()}`,
        cycleId: activeCycle.id,
        employeeId: user.id,
        managerId: next.users.find((item) => item.id !== user.id)?.id ?? user.id,
        selfScore: null,
        managerScore: null,
        finalScore: null,
        grade: null,
        status: "pending_self",
        comments: "Auto-created from HRIS onboarding flow."
      },
      ...next.employeeEvaluations
    ];
  }

  const currentPayrollCycle =
    next.payrollCycles.find((cycle) => cycle.cycleMonth === 6 && cycle.cycleYear === 2026) ??
    next.payrollCycles.find((cycle) => cycle.status !== "paid");
  if (currentPayrollCycle && profile.employmentStatus === "active") {
    const baseSalary = estimateBaseSalary(profile);
    next.employeePayslips = [
      {
        id: `slip-${crypto.randomUUID()}`,
        payrollCycleId: currentPayrollCycle.id,
        employeeId: user.id,
        baseSalary,
        totalAdditions: 0,
        totalDeductions: 0,
        netPay: baseSalary,
        isPublished: false
      },
      ...next.employeePayslips
    ];
    next.payrollCycles = next.payrollCycles.map((cycle) =>
      cycle.id === currentPayrollCycle.id
        ? {
            ...cycle,
            totalPayout: next.employeePayslips
              .filter((item) => item.payrollCycleId === currentPayrollCycle.id)
              .reduce((sum, item) => sum + item.netPay, 0)
          }
        : cycle
    );
  }

  const mandatoryCourse = next.courses.find((course) => course.isActive && course.type === "mandatory");
  if (mandatoryCourse && profile.employmentStatus === "active") {
    next.courseEnrollments = [
      {
        id: `enrollment-${crypto.randomUUID()}`,
        courseId: mandatoryCourse.id,
        employeeId: user.id,
        enrollmentDate: WORKSPACE_TODAY,
        status: "assigned",
        progressPercentage: 0,
        completedAt: null,
        certificateUrl: null
      },
      ...next.courseEnrollments
    ];
  }

  return next;
}

export function applyLeaveDecision(state: HRWorkspaceState, requestId: string, status: LeaveStatus, approverId: string | null) {
  const next = cloneWorkspace(state);
  const target = next.leaveRequests.find((request) => request.id === requestId);
  if (!target) {
    return next;
  }

  next.leaveRequests = next.leaveRequests.map((request) =>
    request.id === requestId
      ? {
          ...request,
          status,
          approvedBy: status === "pending" ? null : approverId,
          updatedAt: `${WORKSPACE_TODAY}T09:15:00Z`
        }
      : request
  );

  if (target.startDate === WORKSPACE_TODAY && target.endDate === WORKSPACE_TODAY) {
    const hasAttendance = next.attendanceLogs.some(
      (log) => log.employeeId === target.employeeId && log.workDate === WORKSPACE_TODAY
    );

    if (!hasAttendance) {
      next.attendanceLogs = [
        {
          id: `att-${crypto.randomUUID()}`,
          employeeId: target.employeeId,
          workDate: WORKSPACE_TODAY,
          clockIn: null,
          clockOut: null,
          status: status === "approved" ? "on_leave" : "absent",
          deviceSource: "Web_Portal"
        },
        ...next.attendanceLogs
      ];
    } else {
      next.attendanceLogs = next.attendanceLogs.map((log) =>
        log.employeeId === target.employeeId && log.workDate === WORKSPACE_TODAY
          ? {
              ...log,
              clockIn: status === "approved" ? null : log.clockIn,
              clockOut: status === "approved" ? null : log.clockOut,
              status: status === "approved" ? "on_leave" : "absent"
            }
          : log
      );
    }
  }

  return next;
}

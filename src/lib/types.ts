export type Role = "super_admin" | "nazoratchi" | "masul";

export type DebtType = "umidsiz" | "harakatdagi";

export type CompanyStatus = "undirilmoqda" | "qisman" | "toliq" | "ozgarishsiz";

export type PaymentType = "pul_kochirish" | "naqd" | "ozaro_hisob" | "sud_qarori" | "boshqa";

export interface Territory {
  id: string;
  name: string;
  type: "shahar" | "tuman";
}

export interface Employee {
  id: string;
  full_name: string;
  short_name: string;
  phone: string;
  email: string;
  role: Role;
  position: string;
  territory_id: string;
  status: "faol" | "nofaol";
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  stir: string;
  director_name: string;
  phone: string;
  address: string;
  territory_id: string;
  responsible_employee_id: string;
  debt_type: DebtType;
  initial_debt: number;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  company_id: string;
  employee_id: string;
  amount: number;
  collection_date: string; // ISO datetime
  payment_type: PaymentType;
  comment: string;
  document_url: string | null;
  document_name: string | null;
  created_at: string;
  created_by: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: "yaratildi" | "tahrirlandi" | "ochirildi";
  entity_type: string;
  entity_id: string;
  old_data: string | null;
  new_data: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
  link?: string;
}

export const DEBT_TYPE_LABEL: Record<DebtType, string> = {
  umidsiz: "Umidsiz",
  harakatdagi: "Harakatdagi",
};

export const STATUS_LABEL: Record<CompanyStatus, string> = {
  undirilmoqda: "Undirilmoqda",
  qisman: "Qisman undirildi",
  toliq: "To'liq undirildi",
  ozgarishsiz: "O'zgarishsiz",
};

export const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  pul_kochirish: "Pul ko'chirish",
  naqd: "Naqd pul",
  ozaro_hisob: "O'zaro hisob-kitob",
  sud_qarori: "Sud qarori asosida",
  boshqa: "Boshqa",
};

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  nazoratchi: "Nazoratchi",
  masul: "Mas'ul xodim",
};

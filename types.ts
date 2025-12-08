
export interface Policy {
  id: string;
  policyNumber: string;
  holderName: string;
  productName: string;
  premium: number;
  status: 'active' | 'pending' | 'expired' | 'processing';
  createTime: string;
  startDate: string;
  endDate: string;
  insuredCount: number;
}

export interface Employee {
  id: string;
  name: string;
  idType: string;
  idNumber: string;
  gender: string;
  jobCode: string;
  jobCategory: string;
}

export interface PlanConfig {
  id: string;
  name: string;
  jobClass: string;
  insuredCount: number | '';
  deathBenefit: string;
  medicalBenefit: string;
  dailyHospital: string;
  lostWages: string;
  duration: string;
  paymentType: string;
  disabilityScale: string;
  accident24h: string;
}

export interface CompanyInfo {
  name: string;
  creditCode: string;
  province: string;
  city: string;
  district: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  industry: string;
}

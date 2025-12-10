
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
  isHighWork?: boolean; // 是否涉及高处作业
  planId?: string; // 关联的方案ID
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
  applicationType?: string; // 投保类型（新保/续保）
  isHighRisk?: boolean; // 是否涉高
  // 动态责任选择：key为liability_id，value为选择的保额
  liabilitySelections?: Record<number, string>;
  // 保费信息
  premiumPerPerson?: number; // 每人保费
  totalPremium?: number; // 总保费
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
  applicationType?: string; // 投保类型（新保/续保）
  isHighRisk?: boolean; // 是否涉高
  provinceId?: number; // 省份ID
  cityId?: number; // 城市ID
  districtId?: number; // 区县ID
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "farmer" | "admin";
  phone?: string;
  address?: string;
}

export interface Farm {
  id: string;
  userId: string;
  name: string;
  location: string;
  size: number;
  soilType: string;
  climateRegion: string;
}

export interface Crop {
  id: string;
  userId: string;
  farmId: string;
  name: string;
  variety: string;
  status: "active" | "harvested" | "failed";
  plantedDate: string;
  harvestedDate?: string;
  areaPlanted: number;
  expectedYield: number;
  actualYield?: number;
  season: string;
}

export interface Transaction {
  id: string;
  userId: string;
  farmId: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
}

export interface DiseaseLog {
  id: string;
  userId: string;
  cropName: string;
  diseaseName: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  treatment: string[];
  date: string;
}

export interface MarketPrice {
  id: string;
  cropName: string;
  price: number;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
  region: string;
  lastUpdated: string;
}

export interface Recommendation {
  cropName: string;
  suitabilityScore: number;
  variety: string;
  reasoning: string;
  idealPh: string;
  growthDuration: string;
  wateringFrequency: string;
  potentialYieldEstimate: string;
}

export interface FertilizerAdvice {
  overallVerdict: string;
  fertilizerType: string;
  dosageRule: string;
  waterSolubility: string;
  guidelines: string[];
  npkTargetRatio: string;
  soilPhAdjustment: string;
}

export interface DiseaseResult {
  diseaseName: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  diagnosis: string;
  treatment: string[];
}

export interface AnalyticsData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    totalFarms: number;
    totalCrops: number;
    activeCrops: number;
    diseaseAlertCount: number;
  };
  financialChart: Array<{
    month: string;
    income: number;
    expense: number;
    profit: number;
  }>;
  cropYields: Array<{
    name: string;
    variety: string;
    yield: number;
    area: number;
    status: string;
  }>;
  expenseCategoryChart: Array<{
    name: string;
    value: number;
  }>;
}

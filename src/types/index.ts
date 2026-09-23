export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  mileage: number;
  engineHours: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface FaultCode {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  resolved: boolean;
}

export interface InspectionDefect {
  id: string;
  category: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  timestamp: string;
  resolved: boolean;
}

export interface MaintenanceHistory {
  id: string;
  vehicleId: string;
  type: 'preventive' | 'repair' | 'inspection';
  description: string;
  date: string;
  mileageAtService: number;
  cost?: number;
}

export interface VehicleData {
  vehicle: Vehicle;
  faultCodes: FaultCode[];
  inspectionDefects: InspectionDefect[];
  maintenanceHistory: MaintenanceHistory[];
  utilizationRate: number;
}

export type RiskLevel = 'watch' | 'at-risk' | 'critical';

export interface ComponentStressScore {
  vehicleId: string;
  vehicleName: string;
  overallScore: number;
  riskLevel: RiskLevel;
  engineScore: number;
  transmissionScore: number;
  brakeScore: number;
  coolingScore: number;
  contributingFactors: string[];
  recommendation: string;
  estimatedDaysToService: number;
  confidence: number;
}

export interface VehicleDataAdapter {
  getVehicleData(vehicleId: string): Promise<VehicleData>;
  getAllVehicles(): Promise<Vehicle[]>;
}

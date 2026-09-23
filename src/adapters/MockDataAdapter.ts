import type { Vehicle, VehicleData, VehicleDataAdapter, FaultCode, InspectionDefect, MaintenanceHistory } from '../types';

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'V001',
    name: 'Delivery Truck 101',
    make: 'Freightliner',
    model: 'M2 106',
    year: 2019,
    vin: '1FVACWDT5KHHX1234',
    mileage: 145230,
    engineHours: 4820,
    status: 'active',
  },
  {
    id: 'V002',
    name: 'Delivery Truck 102',
    make: 'Freightliner',
    model: 'M2 106',
    year: 2020,
    vin: '1FVACWDT5LHHX5678',
    mileage: 98450,
    engineHours: 3210,
    status: 'active',
  },
  {
    id: 'V003',
    name: 'Delivery Truck 103',
    make: 'International',
    model: 'MV607',
    year: 2021,
    vin: '3HAMSAAM2ML987654',
    mileage: 67200,
    engineHours: 2150,
    status: 'active',
  },
  {
    id: 'V004',
    name: 'Delivery Truck 104',
    make: 'Freightliner',
    model: 'M2 106',
    year: 2018,
    vin: '1FVACWDT5JHHX9012',
    mileage: 198750,
    engineHours: 6430,
    status: 'active',
  },
  {
    id: 'V005',
    name: 'Delivery Truck 105',
    make: 'International',
    model: 'MV607',
    year: 2022,
    vin: '3HAMSAAM2NL456789',
    mileage: 42100,
    engineHours: 1380,
    status: 'active',
  },
];

const MOCK_FAULT_CODES: Record<string, FaultCode[]> = {
  V001: [
    {
      code: 'P0128',
      description: 'Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)',
      severity: 'medium',
      timestamp: '2026-09-10T14:23:00Z',
      resolved: false,
    },
    {
      code: 'P0101',
      description: 'Mass Air Flow Circuit Range/Performance',
      severity: 'medium',
      timestamp: '2026-08-15T09:45:00Z',
      resolved: true,
    },
    {
      code: 'P0420',
      description: 'Catalyst System Efficiency Below Threshold',
      severity: 'low',
      timestamp: '2026-07-22T16:12:00Z',
      resolved: true,
    },
  ],
  V002: [
    {
      code: 'P0171',
      description: 'System Too Lean (Bank 1)',
      severity: 'medium',
      timestamp: '2026-09-18T11:30:00Z',
      resolved: false,
    },
  ],
  V004: [
    {
      code: 'P0300',
      description: 'Random/Multiple Cylinder Misfire Detected',
      severity: 'high',
      timestamp: '2026-09-20T08:15:00Z',
      resolved: false,
    },
    {
      code: 'P0128',
      description: 'Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)',
      severity: 'medium',
      timestamp: '2026-09-12T13:40:00Z',
      resolved: false,
    },
    {
      code: 'P0401',
      description: 'Exhaust Gas Recirculation Flow Insufficient',
      severity: 'medium',
      timestamp: '2026-08-28T10:20:00Z',
      resolved: false,
    },
  ],
};

const MOCK_INSPECTION_DEFECTS: Record<string, InspectionDefect[]> = {
  V001: [
    {
      id: 'D001',
      category: 'Brakes',
      description: 'Front brake pads worn to 30%',
      severity: 'major',
      timestamp: '2026-09-15T07:00:00Z',
      resolved: false,
    },
  ],
  V004: [
    {
      id: 'D002',
      category: 'Engine',
      description: 'Minor oil leak from valve cover gasket',
      severity: 'minor',
      timestamp: '2026-09-19T07:30:00Z',
      resolved: false,
    },
    {
      id: 'D003',
      category: 'Cooling System',
      description: 'Coolant level below minimum',
      severity: 'major',
      timestamp: '2026-09-19T07:30:00Z',
      resolved: false,
    },
  ],
};

const MOCK_MAINTENANCE_HISTORY: Record<string, MaintenanceHistory[]> = {
  V001: [
    {
      id: 'M001',
      vehicleId: 'V001',
      type: 'preventive',
      description: 'Oil and filter change',
      date: '2026-08-01T00:00:00Z',
      mileageAtService: 138000,
      cost: 185,
    },
    {
      id: 'M002',
      vehicleId: 'V001',
      type: 'repair',
      description: 'Replaced alternator',
      date: '2026-06-15T00:00:00Z',
      mileageAtService: 132500,
      cost: 620,
    },
  ],
  V002: [
    {
      id: 'M003',
      vehicleId: 'V002',
      type: 'preventive',
      description: 'Oil and filter change',
      date: '2026-09-05T00:00:00Z',
      mileageAtService: 95000,
      cost: 185,
    },
  ],
  V003: [
    {
      id: 'M004',
      vehicleId: 'V003',
      type: 'preventive',
      description: 'Oil and filter change',
      date: '2026-08-20T00:00:00Z',
      mileageAtService: 62000,
      cost: 185,
    },
  ],
  V004: [
    {
      id: 'M005',
      vehicleId: 'V004',
      type: 'preventive',
      description: 'Oil and filter change',
      date: '2026-07-10T00:00:00Z',
      mileageAtService: 190000,
      cost: 185,
    },
    {
      id: 'M006',
      vehicleId: 'V004',
      type: 'repair',
      description: 'Transmission service',
      date: '2026-05-22T00:00:00Z',
      mileageAtService: 180000,
      cost: 1250,
    },
  ],
  V005: [
    {
      id: 'M007',
      vehicleId: 'V005',
      type: 'inspection',
      description: 'Annual DOT inspection',
      date: '2026-09-01T00:00:00Z',
      mileageAtService: 40000,
      cost: 95,
    },
  ],
};

const MOCK_UTILIZATION: Record<string, number> = {
  V001: 0.82,
  V002: 0.65,
  V003: 0.58,
  V004: 0.91,
  V005: 0.45,
};

export class MockDataAdapter implements VehicleDataAdapter {
  async getVehicleData(vehicleId: string): Promise<VehicleData> {
    await this.simulateNetworkDelay();

    const vehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
    if (!vehicle) {
      throw new Error(`Vehicle ${vehicleId} not found`);
    }

    return {
      vehicle,
      faultCodes: MOCK_FAULT_CODES[vehicleId] || [],
      inspectionDefects: MOCK_INSPECTION_DEFECTS[vehicleId] || [],
      maintenanceHistory: MOCK_MAINTENANCE_HISTORY[vehicleId] || [],
      utilizationRate: MOCK_UTILIZATION[vehicleId] || 0.5,
    };
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    await this.simulateNetworkDelay();
    return MOCK_VEHICLES;
  }

  private simulateNetworkDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  }
}

import type { Vehicle, VehicleData, VehicleDataAdapter } from '../types';

/**
 * MotiveDataAdapter - Motive Public API integration
 *
 * Connects to Motive Public APIs using session-scoped JWT authentication.
 *
 * Public API endpoints used:
 * - GET /v1/vehicles - List all vehicles in fleet
 * - GET /v1/vehicles/{id} - Get vehicle details, mileage, engine hours
 * - GET /v1/fault_codes - Get diagnostic trouble codes by vehicle
 * - GET /v1/inspection_reports - Get DVIR inspection results
 * - GET /v1/vehicle_stats - Get utilization metrics (if available)
 *
 * Authentication:
 * - Receives short-lived JWT from Motive Dashboard via postMessage
 * - Token is scoped to fleet data for the authenticated user
 * - Session-only handling, no persistent credentials
 *
 * Known limitations:
 * - Raw sensor time-series (RPM, coolant pressure, exhaust temp) not exposed
 * - Maintenance history endpoints may require verification
 * - Write operations (work orders, POs) require separate permissions
 *
 * Reference: Motive Public API documentation and Labs TDD
 */
export class MotiveDataAdapter implements VehicleDataAdapter {
  private authToken: string | null = null;

  constructor() {
    // Constructor left for future initialization if needed
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  async getVehicleData(vehicleId: string): Promise<VehicleData> {
    this.ensureAuthenticated();

    // Parallel fetch of all vehicle data
    const [vehicle, faultCodes, inspectionReports, utilizationData] = await Promise.all([
      this.fetchVehicleDetails(vehicleId),
      this.fetchFaultCodes(vehicleId),
      this.fetchInspectionReports(vehicleId),
      this.fetchUtilizationData(vehicleId).catch(() => null), // Optional endpoint
    ]);

    return {
      vehicle: {
        id: vehicleId,
        name: vehicle.make_model || vehicle.number || `Vehicle ${vehicleId}`,
        make: vehicle.make || 'Unknown',
        model: vehicle.model || 'Unknown',
        year: vehicle.year || 2020,
        vin: vehicle.vin || '',
        mileage: vehicle.current_odometer || 0,
        engineHours: vehicle.current_engine_hours || 0,
        status: this.mapVehicleStatus(vehicle.status),
      },
      faultCodes: this.normalizeFaultCodes(faultCodes),
      inspectionDefects: this.normalizeInspectionDefects(inspectionReports),
      maintenanceHistory: [], // TODO: Add when maintenance API endpoint is confirmed
      utilizationRate: utilizationData?.utilization_rate || 0.7,
    };
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    this.ensureAuthenticated();

    const response = await this.fetch('/v1/vehicles');
    const data = await response.json();

    // Normalize response based on actual API structure
    const vehicles = data.vehicles || data.data || data;

    const mappedVehicles = vehicles.map((v: any) => ({
      id: v.id?.toString() || v.vehicle_id?.toString() || '',
      name: v.make_model || v.number || `Vehicle ${v.id || 'Unknown'}`,
      make: v.make || 'Unknown',
      model: v.model || 'Unknown',
      year: v.year || 2020,
      vin: v.vin || '',
      mileage: v.current_odometer || 0,
      engineHours: v.current_engine_hours || 0,
      status: this.mapVehicleStatus(v.status),
    }));

    // Filter out vehicles without valid IDs to prevent downstream API errors
    const validVehicles = mappedVehicles.filter(v => v.id && v.id.trim() !== '');
    const filteredCount = mappedVehicles.length - validVehicles.length;

    if (filteredCount > 0) {
      console.warn(`Filtered out ${filteredCount} vehicles without valid IDs`);
    }

    return validVehicles;
  }

  private async fetchVehicleDetails(vehicleId: string): Promise<any> {
    if (!vehicleId || vehicleId.trim() === '') {
      throw new Error('Vehicle ID is required');
    }
    const response = await this.fetch(`/v1/vehicles/${vehicleId}`);
    return await response.json();
  }

  private async fetchFaultCodes(vehicleId: string): Promise<any[]> {
    const response = await this.fetch(`/v1/fault_codes?vehicle_id=${vehicleId}`);
    const data = await response.json();
    return data.fault_codes || data.data || data || [];
  }

  private async fetchInspectionReports(vehicleId: string): Promise<any[]> {
    const response = await this.fetch(`/v1/inspection_reports?vehicle_id=${vehicleId}`);
    const data = await response.json();
    return data.inspection_reports || data.data || data || [];
  }

  private async fetchUtilizationData(vehicleId: string): Promise<any> {
    const response = await this.fetch(`/v1/vehicle_stats/${vehicleId}`);
    return await response.json();
  }

  private normalizeFaultCodes(rawCodes: any[]): Array<{
    code: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
    resolved: boolean;
  }> {
    return rawCodes.map((fc) => ({
      code: fc.code || fc.fault_code || 'UNKNOWN',
      description: fc.description || fc.fault_description || 'Unknown fault',
      severity: this.mapSeverity(fc.severity || fc.fault_severity),
      timestamp: new Date(fc.occurred_at || fc.timestamp || Date.now()).toISOString(),
      resolved: fc.resolved || false,
    }));
  }

  private normalizeInspectionDefects(rawReports: any[]): Array<{
    id: string;
    category: string;
    description: string;
    severity: 'minor' | 'major' | 'critical';
    timestamp: string;
    resolved: boolean;
  }> {
    const defects: any[] = [];

    rawReports.forEach((report) => {
      const reportDefects = report.defects || report.violations || [];
      reportDefects.forEach((defect: any, index: number) => {
        defects.push({
          id: defect.id || `${report.id || 'unknown'}-${index}`,
          category: defect.type || defect.defect_type || defect.category || 'Unknown',
          description: defect.description || defect.defect_description || 'Unknown defect',
          severity: this.mapInspectionSeverity(defect.severity),
          timestamp: new Date(defect.reported_at || report.time || Date.now()).toISOString(),
          resolved: defect.resolved || false,
        });
      });
    });

    return defects;
  }

  private mapSeverity(severity: any): 'low' | 'medium' | 'high' {
    const s = String(severity || '').toLowerCase();
    if (s.includes('high') || s.includes('critical')) return 'high';
    if (s.includes('medium') || s.includes('moderate')) return 'medium';
    return 'low';
  }

  private mapInspectionSeverity(severity: any): 'minor' | 'major' | 'critical' {
    const s = String(severity || '').toLowerCase();
    if (s.includes('critical') || s.includes('high')) return 'critical';
    if (s.includes('major') || s.includes('medium')) return 'major';
    return 'minor';
  }

  private mapVehicleStatus(status: any): 'active' | 'maintenance' | 'inactive' {
    const s = String(status || '').toLowerCase();
    if (s.includes('maintenance') || s.includes('repair') || s.includes('service')) return 'maintenance';
    if (s.includes('inactive') || s.includes('disabled') || s.includes('retired')) return 'inactive';
    return 'active';
  }

  private async fetch(endpoint: string, _options: RequestInit = {}): Promise<Response> {
    // Use server-side proxy to avoid CORS issues
    // The proxy forwards requests to api.gomotive.com with the token
    const proxyUrl = '/api/motive-proxy';

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: normalizedEndpoint,
        token: this.authToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      throw new Error(`Motive API error: ${response.status} ${error}`);
    }

    return response;
  }

  private ensureAuthenticated(): void {
    if (!this.authToken) {
      throw new Error('Not authenticated. Set auth token via setAuthToken() first.');
    }
  }
}

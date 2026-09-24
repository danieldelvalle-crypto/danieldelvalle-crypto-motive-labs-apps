import type { Vehicle, VehicleData, VehicleDataAdapter } from '../types';

/**
 * MotiveDataAdapter - Placeholder for Motive Public API integration
 *
 * TODO: Replace with actual Motive API calls once access is configured
 *
 * Required Motive APIs:
 * - Vehicles API: Get vehicle fleet, vehicle details, mileage, engine hours
 * - Diagnostics API: Fault codes and diagnostic trouble codes
 * - Inspections API: DVIR defects and inspection results
 * - Maintenance API: Service history, work orders, preventive maintenance schedules
 * - Telematics API: Utilization metrics (if available)
 *
 * Authentication:
 * - Expects short-lived JWT from Motive Dashboard via postMessage
 * - Token should be scoped to fleet data for the authenticated user
 *
 * API Gaps (as of 2026-09-23):
 * - Raw sensor time-series (RPM, coolant pressure, exhaust temp) not exposed in Public API
 * - Purchase order creation/approval permissions unclear
 * - Work order write access requires permission verification
 */
export class MotiveDataAdapter implements VehicleDataAdapter {
  private _apiBaseUrl: string;
  private authToken: string | null = null;

  constructor(apiBaseUrl: string = 'https://api.gomotive.com/v1') {
    this._apiBaseUrl = apiBaseUrl;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  async getVehicleData(_vehicleId: string): Promise<VehicleData> {
    this.ensureAuthenticated();

    // TODO: Implement actual API calls
    // Example structure:
    // const [vehicle, faultCodes, inspections, maintenance, utilization] = await Promise.all([
    //   this.fetchVehicle(vehicleId),
    //   this.fetchFaultCodes(vehicleId),
    //   this.fetchInspectionDefects(vehicleId),
    //   this.fetchMaintenanceHistory(vehicleId),
    //   this.fetchUtilizationRate(vehicleId),
    // ]);

    throw new Error('MotiveDataAdapter not yet implemented. Use MockDataAdapter for development.');
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    this.ensureAuthenticated();

    // TODO: Implement actual API call
    // const response = await fetch(`${this.apiBaseUrl}/vehicles`, {
    //   headers: {
    //     'Authorization': `Bearer ${this.authToken}`,
    //     'Content-Type': 'application/json',
    //   },
    // });

    throw new Error('MotiveDataAdapter not yet implemented. Use MockDataAdapter for development.');
  }

  private ensureAuthenticated(): void {
    if (!this.authToken) {
      throw new Error('Not authenticated. Call setAuthToken() first.');
    }
  }

  private async fetchVehicle(_vehicleId: string): Promise<any> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  private async fetchFaultCodes(_vehicleId: string): Promise<any[]> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  private async fetchInspectionDefects(_vehicleId: string): Promise<any[]> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  private async fetchMaintenanceHistory(_vehicleId: string): Promise<any[]> {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  private async fetchUtilizationRate(_vehicleId: string): Promise<number> {
    // TODO: Implement
    throw new Error('Not implemented');
  }
}

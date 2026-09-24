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
  private authToken: string | null = null;

  constructor(_apiBaseUrl: string = 'https://api.gomotive.com/v1') {
    // API base URL will be used when implementing actual Motive API calls
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  async getVehicleData(_vehicleId: string): Promise<VehicleData> {
    this.ensureAuthenticated();

    // TODO: Implement actual API calls
    // When implementing, fetch data from Motive APIs:
    // - Vehicle details: GET /vehicles/{vehicleId}
    // - Fault codes: GET /diagnostics/fault_codes?vehicle_id={vehicleId}
    // - Inspection defects: GET /inspections/defects?vehicle_id={vehicleId}
    // - Maintenance history: GET /maintenance/history?vehicle_id={vehicleId}
    // - Utilization metrics: GET /telematics/utilization?vehicle_id={vehicleId}

    throw new Error('MotiveDataAdapter not yet implemented. Use MockDataAdapter for development.');
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    this.ensureAuthenticated();

    // TODO: Implement actual API call
    // Example:
    // const response = await fetch(`${apiBaseUrl}/vehicles`, {
    //   headers: {
    //     'Authorization': `Bearer ${this.authToken}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // return await response.json();

    throw new Error('MotiveDataAdapter not yet implemented. Use MockDataAdapter for development.');
  }

  private ensureAuthenticated(): void {
    if (!this.authToken) {
      throw new Error('Not authenticated. Call setAuthToken() first.');
    }
  }
}

import type { VehicleData, ComponentStressScore, RiskLevel } from '../types';

/**
 * Component-Stress Scoring Service
 *
 * Calculates predictive maintenance risk scores based on:
 * - Fault code history and severity
 * - Inspection defects
 * - Mileage and engine-hour intensity
 * - Service history patterns
 * - Vehicle utilization
 *
 * Future enhancements (requires deeper Motive API access):
 * - Raw sensor time-series analysis (RPM, temperature, pressure)
 * - Component-specific wear models
 * - Route profile and terrain factors
 * - Seasonal and environmental adjustments
 */
export class StressScoreCalculator {
  calculateScore(data: VehicleData): ComponentStressScore {
    const engineScore = this.calculateEngineScore(data);
    const transmissionScore = this.calculateTransmissionScore(data);
    const brakeScore = this.calculateBrakeScore(data);
    const coolingScore = this.calculateCoolingScore(data);

    const overallScore = (
      engineScore * 0.35 +
      transmissionScore * 0.25 +
      brakeScore * 0.20 +
      coolingScore * 0.20
    );

    const riskLevel = this.determineRiskLevel(overallScore);
    const contributingFactors = this.identifyContributingFactors(data, {
      engineScore,
      transmissionScore,
      brakeScore,
      coolingScore,
    });
    const recommendation = this.generateRecommendation(riskLevel, contributingFactors, data);
    const estimatedDaysToService = this.estimateDaysToService(riskLevel, overallScore);
    const confidence = this.calculateConfidence(data);

    return {
      vehicleId: data.vehicle.id,
      vehicleName: data.vehicle.name,
      overallScore,
      riskLevel,
      engineScore,
      transmissionScore,
      brakeScore,
      coolingScore,
      contributingFactors,
      recommendation,
      estimatedDaysToService,
      confidence,
    };
  }

  private calculateEngineScore(data: VehicleData): number {
    let score = 0;

    const unresolvedEngineFaults = data.faultCodes.filter(
      fc => !fc.resolved && this.isEngineFault(fc.code)
    );
    score += unresolvedEngineFaults.length * 15;
    score += unresolvedEngineFaults.filter(fc => fc.severity === 'high').length * 10;

    const engineDefects = data.inspectionDefects.filter(
      d => !d.resolved && d.category.toLowerCase().includes('engine')
    );
    score += engineDefects.filter(d => d.severity === 'critical').length * 20;
    score += engineDefects.filter(d => d.severity === 'major').length * 10;

    const mileagePerHour = data.vehicle.mileage / Math.max(data.vehicle.engineHours, 1);
    if (mileagePerHour < 25) {
      score += 10;
    }

    const highUtilization = data.utilizationRate > 0.8;
    if (highUtilization) {
      score += 5;
    }

    return Math.min(100, score);
  }

  private calculateTransmissionScore(data: VehicleData): number {
    let score = 0;

    const transmissionFaults = data.faultCodes.filter(
      fc => !fc.resolved && this.isTransmissionFault(fc.code)
    );
    score += transmissionFaults.length * 15;

    const mileage = data.vehicle.mileage;
    if (mileage > 150000) {
      score += 15;
    } else if (mileage > 100000) {
      score += 8;
    }

    const lastTransmissionService = data.maintenanceHistory.find(
      m => m.description.toLowerCase().includes('transmission')
    );
    if (lastTransmissionService) {
      const mileageSinceService = mileage - lastTransmissionService.mileageAtService;
      if (mileageSinceService > 50000) {
        score += 10;
      }
    } else if (mileage > 75000) {
      score += 15;
    }

    return Math.min(100, score);
  }

  private calculateBrakeScore(data: VehicleData): number {
    let score = 0;

    const brakeDefects = data.inspectionDefects.filter(
      d => !d.resolved && d.category.toLowerCase().includes('brake')
    );
    score += brakeDefects.filter(d => d.severity === 'critical').length * 25;
    score += brakeDefects.filter(d => d.severity === 'major').length * 15;
    score += brakeDefects.filter(d => d.severity === 'minor').length * 5;

    const brakeFaults = data.faultCodes.filter(
      fc => !fc.resolved && this.isBrakeFault(fc.code)
    );
    score += brakeFaults.length * 12;

    const highUtilization = data.utilizationRate > 0.75;
    if (highUtilization) {
      score += 8;
    }

    return Math.min(100, score);
  }

  private calculateCoolingScore(data: VehicleData): number {
    let score = 0;

    const coolingFaults = data.faultCodes.filter(
      fc => !fc.resolved && this.isCoolingFault(fc.code)
    );
    score += coolingFaults.filter(fc => fc.severity === 'high').length * 20;
    score += coolingFaults.filter(fc => fc.severity === 'medium').length * 12;

    const coolingDefects = data.inspectionDefects.filter(
      d => !d.resolved && d.category.toLowerCase().includes('cooling')
    );
    score += coolingDefects.filter(d => d.severity === 'critical').length * 20;
    score += coolingDefects.filter(d => d.severity === 'major').length * 12;

    return Math.min(100, score);
  }

  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 60) return 'critical';
    if (score >= 35) return 'at-risk';
    return 'watch';
  }

  private identifyContributingFactors(
    data: VehicleData,
    scores: { engineScore: number; transmissionScore: number; brakeScore: number; coolingScore: number }
  ): string[] {
    const factors: string[] = [];

    if (scores.engineScore >= 40) {
      const highSeverityFaults = data.faultCodes.filter(
        fc => !fc.resolved && fc.severity === 'high' && this.isEngineFault(fc.code)
      );
      if (highSeverityFaults.length > 0) {
        factors.push(`${highSeverityFaults.length} unresolved high-severity engine fault${highSeverityFaults.length > 1 ? 's' : ''}`);
      }
    }

    if (scores.coolingScore >= 30) {
      const coolingIssues = data.faultCodes.filter(fc => !fc.resolved && this.isCoolingFault(fc.code));
      if (coolingIssues.length > 0) {
        factors.push('Cooling system irregularities detected');
      }
    }

    if (scores.brakeScore >= 30) {
      const brakeDefects = data.inspectionDefects.filter(
        d => !d.resolved && d.category.toLowerCase().includes('brake')
      );
      if (brakeDefects.length > 0) {
        factors.push(`${brakeDefects.length} unresolved brake defect${brakeDefects.length > 1 ? 's' : ''}`);
      }
    }

    if (scores.transmissionScore >= 30) {
      if (data.vehicle.mileage > 150000) {
        factors.push('High mileage (>150k miles)');
      }
    }

    if (data.utilizationRate > 0.8) {
      factors.push('High utilization rate (>80%)');
    }

    return factors;
  }

  private generateRecommendation(riskLevel: RiskLevel, factors: string[], _data: VehicleData): string {
    if (riskLevel === 'critical') {
      const primaryIssue = factors[0] || 'multiple stress indicators';
      return `Immediate inspection recommended due to ${primaryIssue}. Schedule service before next scheduled yard stop.`;
    }

    if (riskLevel === 'at-risk') {
      return `Schedule inspection within next 7-14 days. Monitor ${factors.length > 0 ? factors[0] : 'vehicle health metrics'} closely.`;
    }

    return 'Vehicle within normal operating parameters. Continue standard preventive maintenance schedule.';
  }

  private estimateDaysToService(riskLevel: RiskLevel, score: number): number {
    if (riskLevel === 'critical') return Math.max(1, Math.floor(20 - score / 5));
    if (riskLevel === 'at-risk') return Math.floor(30 - score / 3);
    return 90;
  }

  private calculateConfidence(data: VehicleData): number {
    let confidence = 0.6;

    if (data.faultCodes.length > 0) confidence += 0.15;
    if (data.inspectionDefects.length > 0) confidence += 0.1;
    if (data.maintenanceHistory.length >= 3) confidence += 0.1;
    if (data.vehicle.mileage > 50000) confidence += 0.05;

    return Math.min(1.0, confidence);
  }

  private isEngineFault(code: string): boolean {
    const engineCodes = ['P0', 'P1', 'P2', 'P3'];
    return engineCodes.some(prefix => code.startsWith(prefix)) &&
      !this.isTransmissionFault(code) &&
      !this.isCoolingFault(code) &&
      !this.isBrakeFault(code);
  }

  private isTransmissionFault(code: string): boolean {
    const transmissionCodes = ['P07', 'P17', 'P27'];
    return transmissionCodes.some(prefix => code.startsWith(prefix));
  }

  private isCoolingFault(code: string): boolean {
    return code.startsWith('P0128') || code.startsWith('P0125') || code.startsWith('P0126');
  }

  private isBrakeFault(code: string): boolean {
    return code.startsWith('C0') || code.startsWith('C1');
  }
}

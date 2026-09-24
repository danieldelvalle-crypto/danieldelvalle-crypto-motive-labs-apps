import { useState, useEffect } from 'react';
import type { ComponentStressScore } from '../types';
import { VehicleCard } from './VehicleCard';
import { ScoreDetails } from './ScoreDetails';
import { MockDataAdapter } from '../adapters/MockDataAdapter';
import { MotiveDataAdapter } from '../adapters/MotiveDataAdapter';
import { StressScoreCalculator } from '../services/StressScoreCalculator';
import { useMotiveAuth } from '../hooks/useMotiveAuth';

type SortOption = 'risk-desc' | 'risk-asc' | 'name' | 'days';
type FilterOption = 'all' | 'critical' | 'at-risk' | 'watch';

export function VehicleRiskDashboard() {
  const { status: authStatus, token, isDemoMode } = useMotiveAuth();
  const [scores, setScores] = useState<ComponentStressScore[]>([]);
  const [selectedScore, setSelectedScore] = useState<ComponentStressScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('risk-desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  useEffect(() => {
    if (authStatus === 'authenticated' || authStatus === 'demo') {
      loadVehicleScores();
    }
  }, [authStatus, token, isDemoMode]);

  const loadVehicleScores = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use MockDataAdapter in demo mode, MotiveDataAdapter when authenticated
      const adapter = isDemoMode
        ? new MockDataAdapter()
        : (() => {
            const motiveAdapter = new MotiveDataAdapter();
            if (token) motiveAdapter.setAuthToken(token);
            return motiveAdapter;
          })();

      const calculator = new StressScoreCalculator();

      const vehicles = await adapter.getAllVehicles();
      const scorePromises = vehicles.map(async (vehicle) => {
        const data = await adapter.getVehicleData(vehicle.id);
        return calculator.calculateScore(data);
      });

      const calculatedScores = await Promise.all(scorePromises);
      setScores(calculatedScores);
    } catch (err) {
      console.error('Failed to load vehicle scores:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  };

  const getSortedAndFilteredScores = () => {
    let filtered = scores;

    if (filterBy !== 'all') {
      filtered = scores.filter((s) => s.riskLevel === filterBy);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'risk-desc':
          return b.overallScore - a.overallScore;
        case 'risk-asc':
          return a.overallScore - b.overallScore;
        case 'name':
          return a.vehicleName.localeCompare(b.vehicleName);
        case 'days':
          return a.estimatedDaysToService - b.estimatedDaysToService;
        default:
          return 0;
      }
    });

    return sorted;
  };

  const getRiskCounts = () => {
    return {
      critical: scores.filter((s) => s.riskLevel === 'critical').length,
      atRisk: scores.filter((s) => s.riskLevel === 'at-risk').length,
      watch: scores.filter((s) => s.riskLevel === 'watch').length,
    };
  };

  if (authStatus === 'pending') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontSize: '18px',
          color: '#6B7280',
        }}
      >
        Waiting for Motive authentication...
      </div>
    );
  }

  if (authStatus === 'error') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '32px',
        }}
      >
        <div style={{ fontSize: '18px', color: '#DC2626', marginBottom: '16px' }}>
          Authentication Error
        </div>
        <div style={{ fontSize: '14px', color: '#6B7280', maxWidth: '500px', textAlign: 'center' }}>
          Failed to authenticate with Motive Dashboard. Please refresh the page or contact support.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontSize: '18px',
          color: '#6B7280',
        }}
      >
        Loading vehicle data...
      </div>
    );
  }

  const sortedScores = getSortedAndFilteredScores();
  const counts = getRiskCounts();

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {isDemoMode && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #3B82F6',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#1E40AF',
          }}
        >
          <strong>Demo Mode:</strong> Using synthetic data. When embedded in Motive Dashboard, this app will connect to live fleet data via Motive Public APIs.
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #DC2626',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#991B1B',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>
          Component Stress Advisor
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>
          Predictive maintenance risk scoring for fleet vehicles
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            padding: '20px',
            backgroundColor: '#FEF2F2',
            border: '2px solid #DC2626',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#991B1B', marginBottom: '8px' }}>
            CRITICAL
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#DC2626' }}>
            {counts.critical}
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: '#FFFBEB',
            border: '2px solid #F59E0B',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400E', marginBottom: '8px' }}>
            AT RISK
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B' }}>
            {counts.atRisk}
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: '#F0FDF4',
            border: '2px solid #10B981',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#065F46', marginBottom: '8px' }}>
            WATCH
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#10B981' }}>
            {counts.watch}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '14px',
            }}
          >
            <option value="risk-desc">Risk (High to Low)</option>
            <option value="risk-asc">Risk (Low to High)</option>
            <option value="name">Vehicle Name</option>
            <option value="days">Days to Service</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', marginRight: '8px' }}>Filter:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '14px',
            }}
          >
            <option value="all">All Vehicles ({scores.length})</option>
            <option value="critical">Critical ({counts.critical})</option>
            <option value="at-risk">At Risk ({counts.atRisk})</option>
            <option value="watch">Watch ({counts.watch})</option>
          </select>
        </div>
      </div>

      {sortedScores.length === 0 ? (
        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            color: '#6B7280',
          }}
        >
          No vehicles match the selected filter
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
          }}
        >
          {sortedScores.map((score) => (
            <VehicleCard
              key={score.vehicleId}
              score={score}
              onClick={() => setSelectedScore(score)}
            />
          ))}
        </div>
      )}

      {selectedScore && (
        <ScoreDetails score={selectedScore} onClose={() => setSelectedScore(null)} />
      )}
    </div>
  );
}

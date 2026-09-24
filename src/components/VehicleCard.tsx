import type { ComponentStressScore } from '../types';

interface VehicleCardProps {
  score: ComponentStressScore;
  onClick: () => void;
}

export function VehicleCard({ score, onClick }: VehicleCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return '#DC2626';
      case 'at-risk':
        return '#F59E0B';
      case 'watch':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical':
        return 'CRITICAL';
      case 'at-risk':
        return 'AT RISK';
      case 'watch':
        return 'WATCH';
      default:
        return level.toUpperCase();
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${getRiskColor(score.riskLevel)}`,
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        backgroundColor: '#FFFFFF',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
            {score.vehicleName}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>
            ID: {score.vehicleId}
          </p>
        </div>
        <div
          style={{
            backgroundColor: getRiskColor(score.riskLevel),
            color: '#FFFFFF',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '700',
          }}
        >
          {getRiskLabel(score.riskLevel)}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Overall Stress Score</span>
          <span style={{ fontSize: '14px', fontWeight: '700' }}>{score.overallScore.toFixed(1)}</span>
        </div>
        <div
          style={{
            height: '8px',
            backgroundColor: '#E5E7EB',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${score.overallScore}%`,
              backgroundColor: getRiskColor(score.riskLevel),
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      <div style={{ fontSize: '14px', color: '#374151', marginBottom: '12px' }}>
        {score.contributingFactors.length > 0 ? (
          <div>
            <strong>Key factors:</strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
              {score.contributingFactors.slice(0, 2).map((factor, idx) => (
                <li key={idx} style={{ marginBottom: '2px' }}>{factor}</li>
              ))}
            </ul>
          </div>
        ) : (
          <em>No significant stress factors detected</em>
        )}
      </div>

      <div
        style={{
          fontSize: '12px',
          color: '#6B7280',
          paddingTop: '12px',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <div style={{ marginBottom: '4px' }}>
          <strong>Estimated days to service:</strong> {score.estimatedDaysToService}
        </div>
        <div>
          <strong>Confidence:</strong> {(score.confidence * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

import type { ComponentStressScore } from '../types';

interface ScoreDetailsProps {
  score: ComponentStressScore;
  onClose: () => void;
}

export function ScoreDetails({ score, onClose }: ScoreDetailsProps) {
  const componentScores = [
    { name: 'Engine', score: score.engineScore },
    { name: 'Transmission', score: score.transmissionScore },
    { name: 'Brakes', score: score.brakeScore },
    { name: 'Cooling System', score: score.coolingScore },
  ];

  const getScoreColor = (componentScore: number) => {
    if (componentScore >= 60) return '#DC2626';
    if (componentScore >= 35) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '700' }}>
              {score.vehicleName}
            </h2>
            <p style={{ margin: 0, fontSize: '16px', color: '#6B7280' }}>
              Component Stress Analysis
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6B7280',
              padding: '0',
              width: '32px',
              height: '32px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Overall Assessment
          </h3>
          <div
            style={{
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              <strong>Risk Level:</strong>{' '}
              <span style={{ textTransform: 'uppercase', fontWeight: '700' }}>
                {score.riskLevel}
              </span>
            </div>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              <strong>Overall Score:</strong> {score.overallScore.toFixed(1)} / 100
            </div>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              <strong>Estimated Days to Service:</strong> {score.estimatedDaysToService} days
            </div>
            <div style={{ fontSize: '14px' }}>
              <strong>Confidence:</strong> {(score.confidence * 100).toFixed(0)}%
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              borderRadius: '8px',
            }}
          >
            <strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Recommendation:
            </strong>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
              {score.recommendation}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Component Breakdown
          </h3>
          {componentScores.map((component) => (
            <div key={component.name} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{component.name}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: getScoreColor(component.score) }}>
                  {component.score.toFixed(1)}
                </span>
              </div>
              <div
                style={{
                  height: '10px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '5px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${component.score}%`,
                    backgroundColor: getScoreColor(component.score),
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {score.contributingFactors.length > 0 && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Contributing Factors
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
              {score.contributingFactors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3B82F6';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, Shield, Activity } from 'lucide-react';

const steps = [
  {
    title: 'Extraction',
    desc: 'Deep integration with source platforms allows for high-frequency polling and granular data capture.',
    detail: 'Using proprietary connectors, we bypass standard aggregation layers to access raw event logs directly.',
    icon: <Database size={20} />
  },
  {
    title: 'Purification',
    desc: 'Multi-stage heuristic filters identify and isolate synthetic traffic patterns and engagement anomalies.',
    detail: 'Our Signal-to-Noise Ratio (SNR) enhancement algorithms ensure only authentic user interactions remain.',
    icon: <Shield size={20} />
  },
  {
    title: 'Processing',
    desc: 'Real-time normalization across disparate data sources creates a unified, accurate view of performance.',
    detail: 'Time-series analysis and cross-platform verification eliminate double-counting and attribution errors.',
    icon: <Layers size={20} />
  },
  {
    title: 'Verification',
    desc: 'Final cryptographic validation ensures data integrity from point of origin to the dashboard.',
    detail: 'Each data point is signed and hashed, creating an immutable audit trail for all analytics reports.',
    icon: <Activity size={20} />
  }
];

const Methodology = () => {
  return (
    <section id="methodology" style={{ padding: 'var(--space-2xl) 0' }}>
      <div className="container">
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <span className="label-caps">The Protocol</span>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginTop: 'var(--space-sm)' }}>Proprietary Methodology</h2>
        </div>
        
        <div className="grid-12">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              style={{
                gridColumn: 'span 12',
                display: 'flex',
                gap: 'var(--space-xl)',
                padding: 'var(--space-lg) 0',
                borderBottom: '1px solid var(--border-muted)',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ 
                color: 'var(--fg-primary)', 
                background: 'var(--bg-secondary)', 
                padding: 'var(--space-md)', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {step.icon}
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <h3 style={{ fontSize: '20px' }}>{step.title}</h3>
                  <span className="mono" style={{ fontSize: '12px', color: 'var(--border-muted)' }}>PHASE_{idx + 1}</span>
                </div>
                <p style={{ color: 'var(--fg-secondary)', fontSize: '16px', maxWidth: '600px', marginBottom: 'var(--space-md)' }}>
                  {step.desc}
                </p>
                <div style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  padding: 'var(--space-md)', 
                  borderLeft: '2px solid var(--fg-primary)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.6)'
                }}>
                  {step.detail}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Methodology;

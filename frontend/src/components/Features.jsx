import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

const features = [
  {
    title: 'Data Collection',
    desc: 'Ingest raw metric streams from distributed nodes with zero-loss protocols.',
    icon: <Cpu size={24} />
  },
  {
    title: 'Data Cleansing',
    desc: 'Advanced heuristic filtering to remove outlier noise and artifacts.',
    icon: <ShieldCheck size={24} />
  },
  {
    title: 'Rule Based Model',
    desc: 'Apply custom validation logic and business rules in real-time.',
    icon: <Zap size={24} />
  },
  {
    title: 'Rendering Data',
    desc: 'Streamlined visualization engine for clear, high-fidelity insights.',
    icon: <BarChart3 size={24} />
  }
];

const Features = () => {
  return (
    <section id="features">
      <div className="container">
        <div style={{ marginBottom: 'var(--space-xl)', textAlign: 'left' }}>
          <span className="label-caps">Capabilities</span>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginTop: 'var(--space-sm)' }}>Engineered for Precision</h2>
        </div>
        
        <div className="grid-12">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card feature-card"
              style={{
                gridColumn: 'span 6',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-md)',
                minHeight: '240px',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ color: 'var(--fg-primary)' }}>{f.icon}</div>
              <div>
                <h3 style={{ fontSize: '24px', marginBottom: 'var(--space-sm)' }}>{f.title}</h3>
                <p style={{ color: 'var(--fg-secondary)', fontSize: '16px', lineHeight: '1.5' }}>{f.desc}</p>
              </div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--border-muted)' }}>
                PROTOCOL_OP_{idx + 1} // SECURE
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .feature-card {
            grid-column: span 12 !important;
            min-height: auto !important;
            padding: var(--space-lg) !important;
          }
        }
      `}} />
    </section>
  );
};

export default Features;

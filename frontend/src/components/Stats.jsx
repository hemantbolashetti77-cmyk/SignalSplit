import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Signal Purity', value: '99.98%', desc: 'Verified Signal Output' },
  { label: 'Latency Offset', value: '1.2ms', desc: 'Sync Stability' },
  { label: 'Data Cleaned', value: '4.8PB', desc: 'Cumulative Processing' },
  { label: 'Noise Leakage', value: '0.00%', desc: 'Isolation Integrity' },
];

const Stats = () => {
  return (
    <section style={{ borderTop: '1px solid var(--border-muted)', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="grid-12" style={{ gap: '0' }}>
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="stat-item"
              style={{
                gridColumn: 'span 3',
                padding: 'var(--space-xl) var(--space-md)',
                textAlign: 'center'
              }}
            >
              <div className="label-caps" style={{ marginBottom: 'var(--space-md)' }}>{stat.label}</div>
              <div className="mono" style={{ 
                fontSize: 'clamp(32px, 5vw, 48px)', 
                fontWeight: '500',
                marginBottom: 'var(--space-sm)',
                letterSpacing: '-0.05em'
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: 'var(--fg-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {stat.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .stat-item {
          border-right: 1px solid var(--border-muted);
        }
        .stat-item:last-child {
          border-right: none;
        }
        @media (max-width: 768px) {
          .stat-item {
            grid-column: span 2 !important;
            border-right: 1px solid var(--border-muted);
            padding: var(--space-lg) var(--space-sm) !important;
          }
          .stat-item:nth-child(2n) {
            border-right: none;
          }
          .stat-item:nth-child(n+3) {
            border-top: 1px solid var(--border-muted);
          }
        }
      `}} />
    </section>
  );
};

export default Stats;

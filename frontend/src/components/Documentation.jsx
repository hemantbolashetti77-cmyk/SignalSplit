import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Terminal, Code2, Globe, Lock } from 'lucide-react';

const Documentation = () => {
  return (
    <section id="api-docs" style={{ padding: 'var(--space-2xl) 0', background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
          <span className="label-caps">Integration</span>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginTop: 'var(--space-sm)' }}>Developer Resources</h2>
        </div>

        <div className="grid-12">
          <div style={{ gridColumn: 'span 7' }}>
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '100%' }}>
              <div style={{ 
                background: '#1a1b1c', 
                padding: 'var(--space-sm) var(--space-md)', 
                display: 'flex', 
                gap: '8px', 
                borderBottom: '1px solid var(--border-muted)' 
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                <span className="mono" style={{ fontSize: '10px', marginLeft: 'auto', color: 'var(--border-muted)' }}>bash — 80x24</span>
              </div>
              <div style={{ padding: 'var(--space-lg)', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.6' }}>
                <div style={{ color: '#aeafad' }}># Initialize SignalSplit client</div>
                <div><span style={{ color: '#c397d8' }}>curl</span> -X POST https://api.signalsplit.io/v1/init \</div>
                <div style={{ paddingLeft: '20px' }}>-H <span style={{ color: '#b5bd68' }}>"Authorization: Bearer YOUR_API_KEY"</span> \</div>
                <div style={{ paddingLeft: '20px' }}>-d <span style={{ color: '#b5bd68' }}>{`'{"node": "alpha-01", "sync": true}'`}</span></div>
                <br />
                <div style={{ color: '#aeafad' }}># Response</div>
                <div style={{ color: '#70c0b1' }}>{"{"}</div>
                <div style={{ paddingLeft: '20px' }}><span style={{ color: '#e78c45' }}>"status"</span>: <span style={{ color: '#b5bd68' }}>"active"</span>,</div>
                <div style={{ paddingLeft: '20px' }}><span style={{ color: '#e78c45' }}>"session_id"</span>: <span style={{ color: '#b5bd68' }}>"ss_7x92k..."</span>,</div>
                <div style={{ paddingLeft: '20px' }}><span style={{ color: '#e78c45' }}>"latency"</span>: <span style={{ color: '#b5bd68' }}>"1.2ms"</span></div>
                <div style={{ color: '#70c0b1' }}>{"}"}</div>
                <div className="cursor" style={{ 
                  display: 'inline-block', 
                  width: '8px', 
                  height: '15px', 
                  background: 'var(--fg-primary)', 
                  verticalAlign: 'middle',
                  marginLeft: '4px',
                  animation: 'blink 1s step-end infinite'
                }} />
              </div>
            </div>
          </div>

          <div style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {[
              { icon: <Terminal size={18} />, title: 'CLI Tooling', desc: 'Manage your data streams from the terminal.' },
              { icon: <Code2 size={18} />, title: 'SDK Libraries', desc: 'Ready-to-use packages for Node, Python, and Go.' },
              { icon: <Globe size={18} />, title: 'Webhooks', desc: 'Real-time event notifications for your stack.' },
              { icon: <Lock size={18} />, title: 'Auth Protocol', desc: 'Secure OAuth2 and API Key management.' }
            ].map((item, i) => (
              <Link 
                to="/login"
                key={i}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <motion.div 
                  whileHover={{ x: 10, background: 'rgba(255,255,255,0.05)' }}
                  style={{ 
                    display: 'flex', 
                    gap: 'var(--space-md)', 
                    padding: 'var(--space-md)', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-muted)',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <div style={{ color: 'var(--fg-primary)' }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--fg-secondary)' }}>{item.desc}</div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink {
          50% { opacity: 0; }
        }
        @media (max-width: 768px) {
          #api\ docs .grid-12 > div {
            grid-column: span 12 !important;
          }
        }
      `}} />
    </section>
  );
};

export default Documentation;

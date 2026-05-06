import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '80px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background elements */}
      <div className="hide-mobile" style={{
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(18,19,20,0) 70%)',
        zIndex: -1
      }} />

      <div className="container">
        <div className="grid-12">
          <div style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="label-caps" style={{ marginBottom: 'var(--space-md)', display: 'block' }}>
                Precision Data Cleansing Protocol // v2.0.4
              </span>
              <h1 style={{
                fontSize: 'clamp(48px, 12vw, 120px)',
                lineHeight: '0.9',
                marginBottom: 'var(--space-lg)',
                letterSpacing: '-0.06em'
              }}>
                SIGNALSPLIT
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              style={{
                fontSize: 'clamp(16px, 2.5vw, 24px)',
                color: 'var(--fg-secondary)',
                maxWidth: '800px',
                margin: '0 auto var(--space-xl)',
                fontFamily: 'var(--font-body)',
                fontWeight: '400',
                lineHeight: '1.4'
              }}
            >
              METRIC CLEANER AND DELIVERING AUTHENTIC INSIGHTS. <br className="hide-mobile" />
              ISOLATE THE CORE DATA SIGNAL FROM UNWANTED NOISE WITH BINARY PRECISION.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              style={{
                display: 'flex',
                gap: 'var(--space-md)',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', minWidth: '200px' }}>Get Started</Link>
              <button 
                className="btn-outline" 
                style={{ minWidth: '200px' }}
                onClick={() => document.getElementById('api-docs')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Documentation
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative monospaced data */}
      <div className="mono hide-mobile" style={{
        position: 'absolute',
        bottom: '40px',
        left: 'var(--grid-margin)',
        fontSize: '10px',
        color: 'var(--border-muted)',
        display: 'flex',
        gap: '20px'
      }}>
        <span>CORE_INIT_001</span>
        <span>LATENCY_SYNC_ACTIVE</span>
        <span>ENCRYPT_STATED_TRUE</span>
      </div>
    </section>
  );
};

export default Hero;

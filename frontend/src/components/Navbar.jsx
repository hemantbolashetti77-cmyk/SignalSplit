import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'rgba(18, 19, 20, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-muted)',
      padding: 'var(--space-md) 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          fontSize: '24px',
          fontWeight: '700',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.04em',
          textDecoration: 'none',
          color: 'var(--fg-primary)'
        }}>
          SIGNALSPLIT
        </Link>
        
        {/* Desktop Menu */}
        <div className="desktop-menu" style={{
          display: 'flex',
          gap: 'var(--space-lg)',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: 'var(--space-lg)', marginRight: 'var(--space-lg)' }} className="hide-mobile">
            {['Features', 'Methodology', 'API Docs'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="label-caps"
                style={{
                  textDecoration: 'none',
                  fontSize: '12px',
                  transition: 'color 0.2s ease'
                }}
              >
                {item}
              </a>
            ))}
          </div>
          <Link to="/login" className="btn-primary" style={{
            padding: '8px 16px',
            fontSize: '12px',
            textDecoration: 'none'
          }}>
            Get Started
          </Link>
          
          <button 
            className="show-mobile"
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'none', color: 'var(--fg-primary)', padding: '4px' }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '73px',
          left: 0,
          right: 0,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-muted)',
          padding: 'var(--space-xl) var(--grid-margin)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-lg)',
          zIndex: 999,
          animation: 'fadeIn 0.3s ease'
        }}>
          {['Features', 'Methodology', 'API Docs'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="label-caps"
              onClick={() => setIsOpen(false)}
              style={{
                textDecoration: 'none',
                fontSize: '18px',
                color: 'var(--fg-primary)'
              }}
            >
              {item}
            </a>
          ))}
          <Link to="/login" className="btn-primary" onClick={() => setIsOpen(false)} style={{
            textAlign: 'center',
            textDecoration: 'none'
          }}>
            Get Started
          </Link>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}} />
    </nav>
  );
};

export default Navbar;

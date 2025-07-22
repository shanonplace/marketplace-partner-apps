import React from 'react';

// Overlay and modal styles
export const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(30, 41, 59, 0.45)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s',
};

export const modalStyle: React.CSSProperties = {
  minWidth: 600,
  minHeight: 400,
  background: 'white',
  borderRadius: 18,
  boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
  padding: '40px 32px 32px 32px',
  position: 'relative',
  zIndex: 10000,
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'auto',
  border: '1.5px solid #e5e7eb',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
};

export const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  borderRadius: '6px',
  background: isActive ? '#2563eb' : 'transparent',
  color: isActive ? 'white' : '#4b5563',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  border: 'none',
  marginRight: '8px',
  transition: 'all 0.2s',
});

export const titleStyle: React.CSSProperties = {
  marginBottom: 24,
  fontWeight: 600,
  fontSize: 20,
  letterSpacing: 0.1,
};

export const searchInputStyle: React.CSSProperties = {
  padding: 10,
  fontSize: 16,
  borderRadius: 8,
  border: '1.5px solid #e5e7eb',
  background: '#f8fafc',
  width: '60%',
};

export const iconButtonStyle = (isSelected: boolean): React.CSSProperties => ({
  border: isSelected ? '2.5px solid #2563eb' : '1.5px solid #e5e7eb',
  borderRadius: 10,
  padding: 16,
  background: isSelected ? 'rgba(37,99,235,0.08)' : '#fff',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 80,
  boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
  transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
  outline: 'none',
});

export const iconStyle: React.CSSProperties = {
  fontSize: 28,
  marginBottom: 6,
  color: '#222',
};

export const iconLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#666',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
  marginTop: 2,
};

export const iconGridStyle: React.CSSProperties = {
  gap: '14px',
  rowGap: '18px',
  padding: '8px 0',
};

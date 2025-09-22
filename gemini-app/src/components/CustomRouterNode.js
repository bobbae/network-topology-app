import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { FaGlobe } from 'react-icons/fa'; // Example icon

const CustomRouterNode = ({ data }) => {
  return (
    <div
      style={{
        padding: '10px',
        border: '1px solid #FF9800',
        borderRadius: '5px',
        background: '#263238',
        color: '#fff',
        textAlign: 'center',
        width: '100px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <FaGlobe size={30} color="#FF9800" />
      <div style={{ marginTop: '5px', fontWeight: 'bold' }}>{data.label}</div>
      <div style={{ fontSize: '0.8em' }}>IP: {data.ip}</div>
      {/* Add more metadata display here */}
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

export default memo(CustomRouterNode);
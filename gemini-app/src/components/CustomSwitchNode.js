import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { FaServer } from 'react-icons/fa'; // Example icon

const CustomSwitchNode = ({ data }) => {
  return (
    <div
      style={{
        padding: '10px',
        border: '1px solid #00BCD4',
        borderRadius: '5px',
        background: '#263238',
        color: '#fff',
        textAlign: 'center',
        width: '100px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <FaServer size={30} color="#00BCD4" />
      <div style={{ marginTop: '5px', fontWeight: 'bold' }}>{data.label}</div>
      <div style={{ fontSize: '0.8em' }}>IP: {data.ip}</div>
      {/* Add more metadata display here */}
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

export default memo(CustomSwitchNode);
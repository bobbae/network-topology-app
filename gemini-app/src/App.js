import React, { useState, useCallback, useReducer } from 'react';
import 'rc-tree/assets/index.css'; // Treeview styles
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from 'react-flow-renderer';
import Tree from 'rc-tree';

import './App.css'; // App-specific styles
import CustomSwitchNode from './components/CustomSwitchNode';
import CustomRouterNode from './components/CustomRouterNode';

// --- Initial Data Structure ---
// This structure holds both tree hierarchy and associated topology data.
// In a real app, this would be more sophisticated, potentially linking by ID.
const initialData = {
  tree: [
    {
      key: '0-0',
      title: 'Global Network',
      children: [
        {
          key: '0-0-0',
          title: 'Datacenter A',
          children: [
            { key: '0-0-0-0', title: 'Core Switches', isLeaf: true },
            { key: '0-0-0-1', title: 'Edge Routers', isLeaf: true },
          ],
        },
        {
          key: '0-0-1',
          title: 'Datacenter B',
          children: [
            { key: '0-0-1-0', title: 'Production VLAN', isLeaf: true },
          ],
        },
        { key: '0-0-2', title: 'Remote Sites', isLeaf: true },
      ],
    },
  ],
  // This object maps tree node keys to their respective react-flow data
  // In a real app, this would be managed more dynamically.
  topologies: {
    '0-0': { // Global Network
      nodes: [
        { id: '1', type: 'customRouter', position: { x: 50, y: 50 }, data: { label: 'Border Router', ip: '192.168.1.1' } },
        { id: '2', type: 'customSwitch', position: { x: 250, y: 150 }, data: { label: 'Main Switch', ip: '192.168.1.2' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
      ],
    },
    '0-0-0': { // Datacenter A
      nodes: [
        { id: 'dcA-1', type: 'customRouter', position: { x: 100, y: 100 }, data: { label: 'DC A Router 1', ip: '10.0.0.1' } },
        { id: 'dcA-2', type: 'customSwitch', position: { x: 300, y: 200 }, data: { label: 'DC A Switch 1', ip: '10.0.0.2' } },
        { id: 'dcA-3', type: 'customSwitch', position: { x: 300, y: 50 }, data: { label: 'DC A Switch 2', ip: '10.0.0.3' } },
      ],
      edges: [
        { id: 'e-dcA-1-2', source: 'dcA-1', target: 'dcA-2', animated: true },
        { id: 'e-dcA-1-3', source: 'dcA-1', target: 'dcA-3' },
      ],
    },
    '0-0-0-0': { // Core Switches
      nodes: [
        { id: 'cs-1', type: 'customSwitch', position: { x: 50, y: 50 }, data: { label: 'Core Switch 1', ip: '10.0.1.1' } },
        { id: 'cs-2', type: 'customSwitch', position: { x: 200, y: 150 }, data: { label: 'Core Switch 2', ip: '10.0.1.2' } },
      ],
      edges: [
        { id: 'e-cs1-cs2', source: 'cs-1', target: 'cs-2', animated: true },
      ],
    },
    // ... add more topologies for other tree nodes
  },
};

// --- Reducer for application state ---
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TREE_DATA':
      return { ...state, treeData: action.payload };
    case 'SET_SELECTED_TREE_NODE_KEY':
      return { ...state, selectedTreeNodeKey: action.payload };
    case 'SET_TOPOLOGIES':
      return { ...state, topologies: action.payload };
    case 'UPDATE_TOPOLOGY_NODES':
      return {
        ...state,
        topologies: {
          ...state.topologies,
          [state.selectedTreeNodeKey]: {
            ...state.topologies[state.selectedTreeNodeKey],
            nodes: action.payload,
          },
        },
      };
    case 'UPDATE_TOPOLOGY_EDGES':
      return {
        ...state,
        topologies: {
          ...state.topologies,
          [state.selectedTreeNodeKey]: {
            ...state.topologies[state.selectedTreeNodeKey],
            edges: action.payload,
          },
        },
      };
    case 'ADD_TOPOLOGY_EDGE':
      const currentEdges = state.topologies[state.selectedTreeNodeKey]?.edges || [];
      return {
        ...state,
        topologies: {
          ...state.topologies,
          [state.selectedTreeNodeKey]: {
            ...state.topologies[state.selectedTreeNodeKey],
            edges: addEdge(action.payload, currentEdges),
          },
        },
      };
    default:
      return state;
  }
};

const initialAppState = {
  treeData: initialData.tree,
  selectedTreeNodeKey: '0-0', // Default selection
  topologies: initialData.topologies,
};

// --- Custom node types for react-flow ---
const nodeTypes = {
  customSwitch: CustomSwitchNode,
  customRouter: CustomRouterNode,
};

function App() {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const { treeData, selectedTreeNodeKey, topologies } = state;

  // React Flow handlers
  const onNodesChange = useCallback(
    (changes) => {
      if (selectedTreeNodeKey) {
        const currentTopology = topologies[selectedTreeNodeKey] || { nodes: [], edges: [] };
        dispatch({
          type: 'UPDATE_TOPOLOGY_NODES',
          payload: applyNodeChanges(changes, currentTopology.nodes),
        });
      }
    },
    [selectedTreeNodeKey, topologies]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      if (selectedTreeNodeKey) {
        const currentTopology = topologies[selectedTreeNodeKey] || { nodes: [], edges: [] };
        dispatch({
          type: 'UPDATE_TOPOLOGY_EDGES',
          payload: applyEdgeChanges(changes, currentTopology.edges),
        });
      }
    },
    [selectedTreeNodeKey, topologies]
  );

  const onConnect = useCallback(
    (connection) => {
      if (selectedTreeNodeKey) {
        dispatch({ type: 'ADD_TOPOLOGY_EDGE', payload: connection });
      }
    },
    [selectedTreeNodeKey]
  );

  // Treeview handler
  const onSelect = useCallback((selectedKeys) => {
    if (selectedKeys.length > 0) {
      dispatch({ type: 'SET_SELECTED_TREE_NODE_KEY', payload: selectedKeys[0] });
    }
  }, []);

  // --- Load/Save JSON handlers ---
  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedData = JSON.parse(e.target.result);
          // Assuming the loaded data has the same structure as our initialData
          dispatch({ type: 'SET_TREE_DATA', payload: loadedData.tree });
          dispatch({ type: 'SET_TOPOLOGIES', payload: loadedData.topologies });
          // Reset selected key to first node of loaded tree
          dispatch({
            type: 'SET_SELECTED_TREE_NODE_KEY',
            payload: loadedData.tree[0]?.key || null,
          });
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    const dataToSave = {
      tree: treeData,
      topologies: topologies,
    };
    const jsonString = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "network_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentTopology = topologies[selectedTreeNodeKey] || { nodes: [], edges: [] };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Network Topology Editor</h1>
        <div className="header-controls">
          <input type="file" accept=".json" onChange={handleLoad} style={{ display: 'none' }} id="load-file-input" />
          <label htmlFor="load-file-input" className="button">Load JSON</label>
          <button onClick={handleSave} className="button">Save JSON</button>
        </div>
      </header>
      <div className="main-content">
        <div className="left-panel">
          <h2>Network Hierarchy</h2>
          {/* Search bar would go here */}
          <div className="tree-container">
            <Tree
              showLine
              defaultExpandAll
              onSelect={onSelect}
              selectedKeys={[selectedTreeNodeKey]}
              treeData={treeData}
            />
          </div>
        </div>
        <div className="right-panel">
          <h2>Topology View: {selectedTreeNodeKey ? (treeData.find(t => t.key === selectedTreeNodeKey) || findNodeInTree(treeData, selectedTreeNodeKey))?.title : 'None Selected'}</h2>
          <div className="react-flow-container">
            {selectedTreeNodeKey ? (
              <ReactFlow
                nodes={currentTopology.nodes}
                edges={currentTopology.edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
              >
                <Controls />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            ) : (
              <div className="no-selection-message">Select a node from the left panel to view its topology.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to find a node in the treeData by key (for displaying title)
function findNodeInTree(tree, key) {
  for (const node of tree) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const found = findNodeInTree(node.children, key);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export default App;

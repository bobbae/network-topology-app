import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data/peer'
import { FaNetworkWired, FaServer, FaDesktop, FaInfoCircle, FaCog, FaLink, FaTrash } from 'react-icons/fa'
import './TopologyView.css'

const TopologyView = ({ selectedNode, treeData, onDataChange, customConnections, onCustomConnectionsChange }) => {
  const networkRef = useRef(null)
  const networkInstance = useRef(null)
  const [showNodeInfo, setShowNodeInfo] = useState(false)
  const [selectedTopoNode, setSelectedTopoNode] = useState(null)
  const [connectionMode, setConnectionMode] = useState(false)
  const [firstSelectedNode, setFirstSelectedNode] = useState(null)
  const [selectedConnectionType, setSelectedConnectionType] = useState('ethernet')
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, nodeId: null })
  const [editingNodeData, setEditingNodeData] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [networkData, setNetworkData] = useState({ nodes: new DataSet(), edges: new DataSet() })

  // Convert tree data to vis-network format
  const convertToNetworkData = useCallback((rootNode) => {
    const nodes = []
    const edges = []

    const recurse = (node, parentId) => {
      if (!node) return;

      // Add current node
      const nodeStyle = getNodeStyle(node.type, node.id)
      nodes.push({
        id: node.id,
        label: node.name,
        group: node.type,
        title: `${node.name}${node.ip ? ` (${node.ip})` : ''}`,
        physics: true,
        ...nodeStyle
      })

      // Add edge to parent if exists
      if (parentId) {
        edges.push({
          id: `${parentId}-${node.id}`,
          from: parentId,
          to: node.id,
          ...getEdgeStyle(node.type)
        })
      }

      // Recursively process children
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => recurse(child, node.id))
      }
    }

    if (rootNode) {
      recurse(rootNode, null)
    }

    // Add custom connections
    customConnections.forEach(connection => {
      // Only add custom connections for nodes that exist in current topology
      const fromExists = nodes.some(n => n.id === connection.from)
      const toExists = nodes.some(n => n.id === connection.to)
      
      if (fromExists && toExists) {
        edges.push({
          id: connection.id,
          from: connection.from,
          to: connection.to,
          label: connection.label || '',
          ...getCustomEdgeStyle(connection.type || 'custom')
        })
      }
    })

    return { nodes, edges }
  }, [customConnections, connectionMode, firstSelectedNode])

  const getNodeStyle = (type, nodeId) => {
    const isFirstSelected = connectionMode && firstSelectedNode === nodeId
    const baseStyle = {
      font: { color: 'white', size: 14, face: 'Arial' },
      borderWidth: isFirstSelected ? 4 : 2,
      shapeProperties: { borderDashes: false },
      shadow: isFirstSelected ? {
        enabled: true,
        color: '#ff4444',
        size: 8,
        x: 0,
        y: 0
      } : false,
      chosen: {
        node: (values, id, selected, hovering) => {
          if (connectionMode && id === firstSelectedNode) {
            values.borderWidth = 4
            values.borderColor = '#ff4444'
          } else if (selected) {
            values.borderWidth = 3
            values.borderColor = '#2196f3'
          }
        }
      }
    }

    const getColorConfig = (defaultBg, defaultBorder) => ({
      background: defaultBg,
      border: isFirstSelected ? '#ff4444' : defaultBorder
    })

    switch (type) {
      case 'root':
        return {
          ...baseStyle,
          shape: 'box',
          color: getColorConfig('#2c3e50', '#34495e'),
          size: 30,
          font: { ...baseStyle.font, size: 16 }
        }
      case 'network':
        return {
          ...baseStyle,
          shape: 'ellipse',
          color: getColorConfig('#3498db', '#2980b9'),
          size: 25
        }
      case 'router':
        return {
          ...baseStyle,
          shape: 'box',
          color: getColorConfig('#e74c3c', '#c0392b'),
          size: 20
        }
      case 'switch':
        return {
          ...baseStyle,
          shape: 'box',
          color: getColorConfig('#f39c12', '#e67e22'),
          size: 18
        }
      case 'server':
        return {
          ...baseStyle,
          shape: 'box',
          color: getColorConfig('#27ae60', '#229954'),
          size: 18
        }
      case 'device':
        return {
          ...baseStyle,
          shape: 'circle',
          color: getColorConfig('#9b59b6', '#8e44ad'),
          size: 15
        }
      default:
        return {
          ...baseStyle,
          shape: 'circle',
          color: getColorConfig('#95a5a6', '#7f8c8d'),
          size: 15
        }
    }
  }

  const getEdgeStyle = (targetType) => {
    return {
      color: { color: '#7f8c8d', highlight: '#2196f3', hover: '#3498db' },
      width: 2,
      smooth: {
        enabled: true,
        type: 'curvedCW',
        roundness: 0.1
      },
      arrows: {
        to: { enabled: false },
        from: { enabled: false }
      },
      dashes: false
    }
  }

  const getCustomEdgeStyle = (connectionType) => {
    const baseStyle = {
      smooth: {
        enabled: true,
        type: 'continuous'
      },
      font: { color: '#2c3e50', size: 12, strokeWidth: 2, strokeColor: 'white' },
      arrows: {
        to: { enabled: false },
        from: { enabled: false }
      }
    }

    switch (connectionType) {
      case 'ethernet':
        return {
          ...baseStyle,
          color: { color: '#27ae60', highlight: '#2ecc71', hover: '#27ae60' },
          width: 3,
          dashes: false
        }
      case 'fiber':
        return {
          ...baseStyle,
          color: { color: '#f39c12', highlight: '#f1c40f', hover: '#f39c12' },
          width: 4,
          dashes: false
        }
      case 'wireless':
        return {
          ...baseStyle,
          color: { color: '#9b59b6', highlight: '#8e44ad', hover: '#9b59b6' },
          width: 2,
          dashes: [5, 5]
        }
      case 'vpn':
        return {
          ...baseStyle,
          color: { color: '#e74c3c', highlight: '#c0392b', hover: '#e74c3c' },
          width: 2,
          dashes: [10, 5]
        }
      default: // custom
        return {
          ...baseStyle,
          color: { color: '#3498db', highlight: '#2980b9', hover: '#3498db' },
          width: 2,
          dashes: false
        }
    }
  }

  const getNetworkOptions = () => ({
    physics: {
      enabled: true,
      stabilization: { 
        iterations: 150,
        updateInterval: 25
      },
      solver: 'forceAtlas2Based',
      forceAtlas2Based: {
        theta: 0.5,
        gravitationalConstant: -50,
        centralGravity: 0.01,
        springConstant: 0.08,
        springLength: 100,
        damping: 0.9, // Increased damping to reduce oscillation
        avoidOverlap: 1
      }
    },
    layout: {
      improvedLayout: true,
      hierarchical: {
        enabled: false
      }
    },
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      selectConnectedEdges: false,
      multiselect: false, // Disable multiselect to avoid conflicts
      navigationButtons: false
    },
    nodes: {
      font: {
        strokeWidth: 3,
        strokeColor: 'rgba(0,0,0,0.8)'
      },
      fixed: false,
      physics: true
    },
    edges: {
      smooth: {
        enabled: true,
        type: 'continuous'
      }
    }
  })

  // Update network data when selectedNode or customConnections change
  useEffect(() => {
    if (selectedNode) {
      const { nodes, edges } = convertToNetworkData(selectedNode)
      setNetworkData({
        nodes: new DataSet(nodes),
        edges: new DataSet(edges)
      })
    } else {
      setNetworkData({ nodes: new DataSet(), edges: new DataSet() })
    }
  }, [selectedNode, convertToNetworkData])

  const options = useMemo(() => getNetworkOptions(), [])

  // Create the vis-network instance the first time a node is selected.
  // Keep the instance alive while the user keeps selecting nodes so that
  // React never needs to un-mount the canvas (avoids DOMException).
  // Initialize and manage the vis-network instance
  useEffect(() => {
    // Only initialize the vis-network instance once when a node is selected
    if (!networkInstance.current && selectedNode && networkRef.current) {
      try {
        const network = new Network(networkRef.current, networkData, options)
        networkInstance.current = network

        const stabilizationDoneHandler = () => {
          network.setOptions({ physics: false })
        }
        network.on('stabilizationIterationsDone', stabilizationDoneHandler)

        if (networkData.nodes.length > 0) {
          network.stabilize()
        }
      } catch (e) {
        console.error('Error creating network instance:', e)
        networkInstance.current = null
      }
    }
  }, [selectedNode])

  // Update data in existing network instance
  useEffect(() => {
    if (networkInstance.current && networkData.nodes.length > 0) {
      try {
        networkInstance.current.setData(networkData)
        networkInstance.current.setOptions({ physics: { enabled: true } })
        networkInstance.current.stabilize()
      } catch (e) {
        console.error('Error updating network data:', e)
      }
    }
  }, [networkData])

  // Destroy the vis-network instance when this component unmounts.
  useEffect(() => {
    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy()
        networkInstance.current = null
      }
    }
  }, [])

  // Update data in network instance
  useEffect(() => {
    if (networkInstance.current) {
      networkInstance.current.setData(networkData)
      if (networkData.nodes.length > 0) {
        networkInstance.current.setOptions({ physics: { enabled: true } })
        networkInstance.current.stabilize()
      }
    }
  }, [networkData])

  // Connection mode handlers
  const deleteCustomConnection = useCallback((edgeId) => {
    // Only delete custom connections (not hierarchical ones)
    if (String(edgeId).startsWith('custom-')) {
      onCustomConnectionsChange(prev => prev.filter(conn => conn.id !== edgeId))
    }
  }, [onCustomConnectionsChange])

  // Event handlers with useCallback to memoize them
  const clickHandler = useCallback((event) => {
    if (event.nodes.length > 0) {
      const nodeId = event.nodes[0]
      const nodeData = networkData.nodes.get(nodeId)

      if (connectionMode) {
        if (!firstSelectedNode) {
          setFirstSelectedNode(nodeId)
        } else if (firstSelectedNode !== nodeId) {
          const connectionId = `custom-${firstSelectedNode}-${nodeId}-${Date.now()}`
          const connectionTypeLabels = {
            ethernet: 'Ethernet', fiber: 'Fiber Optic', wireless: 'Wireless', vpn: 'VPN', custom: 'Custom Link'
          }
          const newConnection = {
            id: connectionId, from: firstSelectedNode, to: nodeId, type: selectedConnectionType, label: connectionTypeLabels[selectedConnectionType] || 'Connection'
          }
          onCustomConnectionsChange(prev => [...prev, newConnection])
          setFirstSelectedNode(null)
        } else {
          setFirstSelectedNode(null)
        }
      } else {
        setSelectedTopoNode(nodeData)
        setShowNodeInfo(true)
      }
    } else if (!connectionMode) {
      setShowNodeInfo(false)
      setSelectedTopoNode(null)
    }
  }, [connectionMode, firstSelectedNode, networkData, onCustomConnectionsChange, selectedConnectionType])

  const selectEdgeHandler = useCallback((event) => {
    if (connectionMode && event.edges.length > 0) {
      const edgeId = event.edges[0]
      deleteCustomConnection(edgeId)
    }
  }, [connectionMode, deleteCustomConnection])

  const onContextHandler = useCallback((event) => {
    event.event.preventDefault()
    const nodeId = networkInstance.current.getNodeAt(event.pointer.DOM)
    if (nodeId) {
      setContextMenu({ visible: true, x: event.event.clientX, y: event.event.clientY, nodeId })
    } else {
      setContextMenu({ visible: false, x: 0, y: 0, nodeId: null })
    }
  }, [])

  // Attach/detach event listeners
  useEffect(() => {
    const network = networkInstance.current
    if (!network) return
    network.on('click', clickHandler)
    network.on('selectEdge', selectEdgeHandler)
    network.on('oncontext', onContextHandler)

    return () => {
      network.off('click', clickHandler)
      network.off('selectEdge', selectEdgeHandler)
      network.off('oncontext', onContextHandler)
    }
  }, [clickHandler, selectEdgeHandler, onContextHandler])

  // Hide context menu on clicks outside
  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, nodeId: null })
      }
    }

    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [contextMenu.visible])

  // Find node details from tree data
  const findNodeInTree = (nodeId, tree) => {
    if (!tree) return null
    if (tree.id === nodeId) return tree

    if (tree.children) {
      for (const child of tree.children) {
        const found = findNodeInTree(nodeId, child)
        if (found) return found
      }
    }

    return null
  }

  const selectedNodeDetails = selectedTopoNode ? findNodeInTree(selectedTopoNode.id, treeData) : null

  const getNodeTypeIcon = (type) => {
    switch (type) {
      case 'network': return <FaNetworkWired />
      case 'router': case 'switch': case 'server': return <FaServer />
      case 'device': return <FaDesktop />
      default: return <FaNetworkWired />
    }
  }

  const toggleConnectionMode = () => {
    setConnectionMode(!connectionMode)
    setFirstSelectedNode(null)
    setShowNodeInfo(false)
    setSelectedTopoNode(null)
    if (networkInstance.current) {
      networkInstance.current.unselectAll()
    }
  }

  const clearAllCustomConnections = () => {
    onCustomConnectionsChange([])
  }

  const toggleLayout = () => {
    if (!networkInstance.current) return
    
    const currentOptions = networkInstance.current.getOptionsFromConfigurator()
    const hierarchical = !currentOptions.layout.hierarchical.enabled
    
    networkInstance.current.setOptions({
      layout: {
        hierarchical: {
          enabled: hierarchical,
          direction: 'UD',
          sortMethod: 'directed',
          nodeSpacing: 200,
          levelSeparation: 150
        }
      },
      physics: {
        enabled: !hierarchical
      }
    })
  }

  // Node editing handlers
  const handleEditNode = useCallback((nodeId) => {
    const nodeData = findNodeInTree(nodeId, treeData)
    if (nodeData) {
      setEditingNodeData({
        id: nodeData.id,
        name: nodeData.name || '',
        type: nodeData.type || 'device',
        ip: nodeData.ip || '',
        mac: nodeData.mac || '',
        description: nodeData.description || ''
      })
      setShowEditModal(true)
      setContextMenu({ visible: false, x: 0, y: 0, nodeId: null })
    }
  }, [treeData])

  const handleDeleteNode = useCallback((nodeId) => {
    if (nodeId === 'root') {
      alert('Cannot delete root node')
      return
    }

    if (window.confirm('Are you sure you want to delete this node and all its children?')) {
      const updateTree = (node) => {
        if (node.children) {
          return {
            ...node,
            children: node.children
              .filter(child => child.id !== nodeId)
              .map(updateTree)
          }
        }
        return node
      }

      const updatedData = updateTree(treeData)
      onDataChange(updatedData)
      setContextMenu({ visible: false, x: 0, y: 0, nodeId: null })
    }
  }, [treeData, onDataChange])

  const handleSaveNodeEdit = useCallback(() => {
    if (!editingNodeData) return

    const updateNodeInTree = (node) => {
      if (node.id === editingNodeData.id) {
        return {
          ...node,
          name: editingNodeData.name,
          type: editingNodeData.type,
          ip: editingNodeData.ip,
          mac: editingNodeData.mac,
          description: editingNodeData.description
        }
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeInTree)
        }
      }
      return node
    }

    const updatedData = updateNodeInTree(treeData)
    onDataChange(updatedData)
    setShowEditModal(false)
    setEditingNodeData(null)
  }, [editingNodeData, treeData, onDataChange])

  const handleCancelNodeEdit = useCallback(() => {
    setShowEditModal(false)
    setEditingNodeData(null)
  }, [])

  return (
    <div className="topology-view">
      <div className="topology-header">
        <div className="topology-title">
          <h3>
            {selectedNode ? `Topology: ${selectedNode.name}` : 'Select a node to view topology'}
          </h3>
          {selectedNode && (
            <div className="topology-controls">
              <button 
                onClick={toggleConnectionMode} 
                className={`connection-btn ${connectionMode ? 'active' : ''}`}
                title={connectionMode ? 'Exit Connection Mode' : 'Enter Connection Mode'}
              >
                <FaLink /> {connectionMode ? 'Exit Connect' : 'Connect'}
              </button>
              {customConnections.length > 0 && (
                <button 
                  onClick={clearAllCustomConnections} 
                  className="clear-connections-btn"
                  title="Clear All Custom Connections"
                >
                  <FaTrash /> Clear Links
                </button>
              )}
              <button onClick={toggleLayout} className="layout-btn" title="Toggle Layout">
                <FaCog /> Layout
              </button>
            </div>
          )}
        </div>
      </div>
      
      {connectionMode && (
        <div className="connection-mode-banner">
          <div className="connection-instructions">
            <strong>Connection Mode Active:</strong> 
            {firstSelectedNode ? (
              <span>
                {` First node selected: `}
                <span className="selected-node-indicator">
                  {findNodeInTree(firstSelectedNode, treeData)?.name || firstSelectedNode}
                </span>
                {`. Click another node to create a connection.`}
              </span>
            ) : 
              ` Click on a node to start creating a connection.`
            }
            {customConnections.length > 0 && ` Click on connection lines to delete them.`}
          </div>
          <div className="connection-type-selector">
            <label htmlFor="connection-type">Connection Type:</label>
            <select 
              id="connection-type"
              value={selectedConnectionType}
              onChange={(e) => setSelectedConnectionType(e.target.value)}
            >
              <option value="ethernet">Ethernet</option>
              <option value="fiber">Fiber Optic</option>
              <option value="wireless">Wireless</option>
              <option value="vpn">VPN</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="topology-content">
        {selectedNode ? (
          <>
            <div className="network-container" ref={networkRef}></div>
            
            {showNodeInfo && selectedNodeDetails && (
              <div className="node-info-panel">
                <div className="node-info-header">
                  <div className="node-info-icon">
                    {getNodeTypeIcon(selectedNodeDetails.type)}
                  </div>
                  <div className="node-info-title">
                    <h4>{selectedNodeDetails.name}</h4>
                    <span className="node-type">{selectedNodeDetails.type}</span>
                  </div>
                  <button 
                    className="close-info" 
                    onClick={() => setShowNodeInfo(false)}
                    title="Close"
                  >
                    ×
                  </button>
                </div>
                
                <div className="node-info-content">
                  <div className="info-item">
                    <strong>Type:</strong> {selectedNodeDetails.type}
                  </div>
                  
                  {selectedNodeDetails.ip && (
                    <div className="info-item">
                      <strong>IP Address:</strong> {selectedNodeDetails.ip}
                    </div>
                  )}
                  
                  {selectedNodeDetails.mac && (
                    <div className="info-item">
                      <strong>MAC Address:</strong> {selectedNodeDetails.mac}
                    </div>
                  )}
                  
                  {selectedNodeDetails.description && (
                    <div className="info-item">
                      <strong>Description:</strong> {selectedNodeDetails.description}
                    </div>
                  )}
                  
                  {selectedNodeDetails.children && selectedNodeDetails.children.length > 0 && (
                    <div className="info-item">
                      <strong>Connected Devices:</strong> {selectedNodeDetails.children.length}
                    </div>
                  )}
                  
                  <div className="info-item">
                    <strong>Status:</strong> 
                    <span className="status-indicator online"> Online</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <FaInfoCircle size={48} />
            <h3>No Node Selected</h3>
            <p>Select a node from the tree view to display its network topology</p>
          </div>
        )}
      </div>
      
      {selectedNode && (
        <div className="topology-legend">
          <h4>Legend</h4>
          <div className="legend-items">
            <div className="legend-section">
              <h5>Devices</h5>
              <div className="legend-item">
                <div className="legend-color network"></div>
                <span>Network</span>
              </div>
              <div className="legend-item">
                <div className="legend-color router"></div>
                <span>Router</span>
              </div>
              <div className="legend-item">
                <div className="legend-color switch"></div>
                <span>Switch</span>
              </div>
              <div className="legend-item">
                <div className="legend-color server"></div>
                <span>Server</span>
              </div>
              <div className="legend-item">
                <div className="legend-color device"></div>
                <span>Device</span>
              </div>
            </div>
            
            {customConnections.length > 0 && (
              <div className="legend-section">
                <h5>Connections</h5>
                <div className="legend-item">
                  <div className="legend-line ethernet"></div>
                  <span>Ethernet</span>
                </div>
                <div className="legend-item">
                  <div className="legend-line fiber"></div>
                  <span>Fiber</span>
                </div>
                <div className="legend-item">
                  <div className="legend-line wireless"></div>
                  <span>Wireless</span>
                </div>
                <div className="legend-item">
                  <div className="legend-line vpn"></div>
                  <span>VPN</span>
                </div>
                <div className="legend-item">
                  <div className="legend-line custom"></div>
                  <span>Custom</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Context Menu */}
      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 10000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-item" onClick={() => handleEditNode(contextMenu.nodeId)}>
            <FaCog /> Edit Properties
          </div>
          {contextMenu.nodeId !== 'root' && (
            <div className="context-menu-item danger" onClick={() => handleDeleteNode(contextMenu.nodeId)}>
              <FaTrash /> Delete Node
            </div>
          )}
        </div>
      )}
      
      {/* Edit Node Modal */}
      {showEditModal && editingNodeData && (
        <div className="modal-overlay" onClick={handleCancelNodeEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Node Properties</h3>
              <button className="close-modal" onClick={handleCancelNodeEdit}>
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="node-name">Name:</label>
                <input
                  id="node-name"
                  type="text"
                  value={editingNodeData.name}
                  onChange={(e) => setEditingNodeData({...editingNodeData, name: e.target.value})}
                  placeholder="Enter node name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="node-type">Type:</label>
                <select
                  id="node-type"
                  value={editingNodeData.type}
                  onChange={(e) => setEditingNodeData({...editingNodeData, type: e.target.value})}
                >
                  <option value="network">Network</option>
                  <option value="router">Router</option>
                  <option value="switch">Switch</option>
                  <option value="server">Server</option>
                  <option value="device">Device</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="node-ip">IP Address:</label>
                <input
                  id="node-ip"
                  type="text"
                  value={editingNodeData.ip}
                  onChange={(e) => setEditingNodeData({...editingNodeData, ip: e.target.value})}
                  placeholder="e.g., 192.168.1.1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="node-mac">MAC Address:</label>
                <input
                  id="node-mac"
                  type="text"
                  value={editingNodeData.mac}
                  onChange={(e) => setEditingNodeData({...editingNodeData, mac: e.target.value})}
                  placeholder="e.g., 00:11:22:33:44:55"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="node-description">Description:</label>
                <textarea
                  id="node-description"
                  value={editingNodeData.description}
                  onChange={(e) => setEditingNodeData({...editingNodeData, description: e.target.value})}
                  placeholder="Enter node description"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCancelNodeEdit}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSaveNodeEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopologyView

import { useState } from 'react'
import { 
  FaNetworkWired, 
  FaServer, 
  FaDesktop, 
  FaPlus, 
  FaMinus, 
  FaEdit, 
  FaTrash,
  FaChevronRight,
  FaChevronDown,
  FaSave,
  FaTimes
} from 'react-icons/fa'
import './TreeView.css'

const TreeView = ({ data, onNodeSelect, onDataChange, selectedNode }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']))
  const [editingNode, setEditingNode] = useState(null)
  const [editValue, setEditValue] = useState('')

  const getNodeIcon = (type) => {
    switch (type) {
      case 'network': return <FaNetworkWired />
      case 'router': return <FaServer />
      case 'switch': return <FaServer />
      case 'server': return <FaServer />
      case 'device': return <FaDesktop />
      default: return <FaNetworkWired />
    }
  }

  const toggleExpanded = (nodeId) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const addNode = (parentId, type) => {
    const newNode = {
      id: `${type}_${Date.now()}`,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      ip: type !== 'network' ? '192.168.1.100' : undefined,
      children: []
    }

    const updateTree = (node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        }
      }
      return {
        ...node,
        children: node.children?.map(updateTree) || []
      }
    }

    const newData = updateTree(data)
    onDataChange(newData)
    setExpandedNodes(prev => new Set([...prev, parentId]))
  }

  const deleteNode = (nodeId) => {
    if (nodeId === 'root') return

    const removeFromTree = (node) => {
      if (node.children) {
        return {
          ...node,
          children: node.children
            .filter(child => child.id !== nodeId)
            .map(removeFromTree)
        }
      }
      return node
    }

    const newData = removeFromTree(data)
    onDataChange(newData)
    
    if (selectedNode?.id === nodeId) {
      onNodeSelect(null)
    }
  }

  const startEdit = (node) => {
    setEditingNode(node.id)
    setEditValue(node.name)
  }

  const saveEdit = (nodeId) => {
    const updateTree = (node) => {
      if (node.id === nodeId) {
        return { ...node, name: editValue }
      }
      return {
        ...node,
        children: node.children?.map(updateTree) || []
      }
    }

    const newData = updateTree(data)
    onDataChange(newData)
    setEditingNode(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingNode(null)
    setEditValue('')
  }

  const renderNode = (node, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isSelected = selectedNode?.id === node.id
    const isEditing = editingNode === node.id

    return (
      <div key={node.id} className="tree-node-container">
        <div 
          className={`tree-node ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 10}px` }}
        >
          <div className="tree-node-content">
            {hasChildren && (
              <button 
                className="expand-button"
                onClick={() => toggleExpanded(node.id)}
              >
                {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
              </button>
            )}
            {!hasChildren && <div className="expand-placeholder"></div>}
            
            <span className="node-icon">{getNodeIcon(node.type)}</span>
            
            {isEditing ? (
              <div className="edit-controls">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && saveEdit(node.id)}
                  autoFocus
                />
                <button onClick={() => saveEdit(node.id)} className="save-btn">
                  <FaSave />
                </button>
                <button onClick={cancelEdit} className="cancel-btn">
                  <FaTimes />
                </button>
              </div>
            ) : (
              <>
                <span 
                  className="node-label"
                  onClick={() => onNodeSelect(node)}
                >
                  {node.name}
                  {node.ip && <span className="node-ip"> ({node.ip})</span>}
                </span>
                
                <div className="node-actions">
                  <button onClick={() => startEdit(node)} title="Edit">
                    <FaEdit />
                  </button>
                  {node.id !== 'root' && (
                    <button onClick={() => deleteNode(node.id)} title="Delete">
                      <FaTrash />
                    </button>
                  )}
                  <div className="add-dropdown">
                    <button className="add-btn" title="Add">
                      <FaPlus />
                    </button>
                    <div className="add-menu">
                      <button onClick={() => addNode(node.id, 'network')}>
                        Add Network
                      </button>
                      <button onClick={() => addNode(node.id, 'router')}>
                        Add Router
                      </button>
                      <button onClick={() => addNode(node.id, 'switch')}>
                        Add Switch
                      </button>
                      <button onClick={() => addNode(node.id, 'server')}>
                        Add Server
                      </button>
                      <button onClick={() => addNode(node.id, 'device')}>
                        Add Device
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="tree-children">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="tree-view">
      <div className="tree-header">
        <h3>Network Hierarchy</h3>
      </div>
      <div className="tree-content">
        {renderNode(data)}
      </div>
    </div>
  )
}

export default TreeView

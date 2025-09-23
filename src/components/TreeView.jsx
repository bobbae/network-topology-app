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
  FaTimes,
  FaPlusSquare,
  FaMinusSquare
} from 'react-icons/fa'
import './TreeView.css'

const TreeView = ({ data, onNodeSelect, selectedNode, onNodeAdd, onNodeDelete, onNodeEdit }) => {
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

  const getAllNodeIdsWithChildren = (node, nodeIds = new Set()) => {
    if (node.children && node.children.length > 0) {
      nodeIds.add(node.id)
      node.children.forEach(child => getAllNodeIdsWithChildren(child, nodeIds))
    }
    return nodeIds
  }

  const handleExpandAll = () => {
    setExpandedNodes(getAllNodeIdsWithChildren(data))
  }

  const handleCollapseAll = () => {
    setExpandedNodes(new Set(['root']))
  }

  const handleAddNode = (parentId, type) => {
    onNodeAdd(parentId, type);
    setExpandedNodes(prev => new Set([...prev, parentId]))
  }

  const startEdit = (node) => {
    setEditingNode(node.id)
    setEditValue(node.name)
  }

  const handleSaveEdit = (nodeId) => {
    onNodeEdit(nodeId, editValue)
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(node.id)}
                  autoFocus
                />
                <button onClick={() => handleSaveEdit(node.id)} className="save-btn">
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
                  onClick={(e) => { e.stopPropagation(); setTimeout(() => onNodeSelect(node), 0); }}
                >
                  {node.name}
                  {node.ip && <span className="node-ip"> ({node.ip})</span>}
                </span>
                
                <div className="node-actions">
                  <button onClick={() => startEdit(node)} title="Edit">
                    <FaEdit />
                  </button>
                  {node.id !== 'root' && (
                    <button onClick={() => onNodeDelete(node.id)} title="Delete">
                      <FaTrash />
                    </button>
                  )}
                  <div className="add-dropdown">
                    <button className="add-btn" title="Add">
                      <FaPlus />
                    </button>
                    <div className="add-menu">
                      <button onClick={() => handleAddNode(node.id, 'network')}>
                        Add Network
                      </button>
                      <button onClick={() => handleAddNode(node.id, 'router')}>
                        Add Router
                      </button>
                      <button onClick={() => handleAddNode(node.id, 'switch')}>
                        Add Switch
                      </button>
                      <button onClick={() => handleAddNode(node.id, 'server')}>
                        Add Server
                      </button>
                      <button onClick={() => handleAddNode(node.id, 'device')}>
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
        <div className="tree-controls">
          <button onClick={handleExpandAll} title="Expand All">
            <FaPlusSquare />
          </button>
          <button onClick={handleCollapseAll} title="Collapse All">
            <FaMinusSquare />
          </button>
        </div>
      </div>
      <div className="tree-content">
        {renderNode(data)}
      </div>
    </div>
  )
}

export default TreeView

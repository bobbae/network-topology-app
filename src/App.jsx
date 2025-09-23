import { useState, useRef, useMemo, useCallback } from 'react'
import { FaDownload, FaUpload, FaSearch } from 'react-icons/fa'
import TreeView from './components/TreeView'
import TopologyView from './components/TopologyView'
import './App.css'

function App() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [customConnections, setCustomConnections] = useState([])
  const fileInputRef = useRef(null)
  const [treeData, setTreeData] = useState({
    id: 'root',
    name: 'Network Infrastructure',
    type: 'root',
    children: [
      {
        id: 'network1',
        name: 'Data Center Network',
        type: 'network',
        children: [
          {
            id: 'router1',
            name: 'Core Router 1',
            type: 'router',
            ip: '192.168.1.1',
            mac: '00:1A:2B:3C:4D:5E',
            description: 'Primary core router for data center network',
            children: []
          },
          {
            id: 'switch1',
            name: 'Access Switch 1',
            type: 'switch',
            ip: '192.168.1.10',
            mac: '00:1A:2B:3C:4D:5F',
            description: 'Access layer switch for server connectivity',
            children: []
          }
        ]
      },
      {
        id: 'network2',
        name: 'Branch Network',
        type: 'network',
        children: [
          {
            id: 'router2',
            name: 'Branch Router',
            type: 'router',
            ip: '10.0.0.1',
            mac: '00:1A:2B:3C:4D:60',
            description: 'Edge router for branch office connectivity',
            children: []
          }
        ]
      }
    ]
  })

  // Save topology data to JSON file
  const handleSaveToFile = () => {
    const dataToSave = {
      treeData,
      customConnections,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const dataStr = JSON.stringify(dataToSave, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `network-topology-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  // Load topology data from JSON file
  const handleLoadFromFile = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target.result)

        // More robust validation
        if (
          loadedData &&
          typeof loadedData === 'object' &&
          loadedData.treeData &&
          typeof loadedData.treeData === 'object' &&
          !Array.isArray(loadedData.treeData) &&
          'id' in loadedData.treeData &&
          'children' in loadedData.treeData
        ) {
          setTreeData(loadedData.treeData);

          // Load custom connections if they exist and are an array
          setCustomConnections(
            Array.isArray(loadedData.customConnections)
              ? loadedData.customConnections
              : []
          );

          setSelectedNode(null);

          alert(`Network topology loaded successfully!${loadedData.exportedAt ? ` (Created: ${new Date(loadedData.exportedAt).toLocaleString()})` : ''}`);
        } else {
          throw new Error('Invalid file format')
        }
      } catch (error) {
        alert('Error loading file: ' + error.message + '. Please ensure you\'re loading a valid network topology JSON file.')
      }
    }
    reader.readAsText(file)
    
    // Reset the input so the same file can be loaded again
    event.target.value = ''
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const displayedData = useMemo(() => {
    if (!searchTerm) {
      return treeData
    }

    const filterTree = (node, term) => {
      const lowerCaseTerm = term.toLowerCase()

      // If the node itself matches, return it and all its children
      if (node.name.toLowerCase().includes(lowerCaseTerm)) {
        return node
      }

      // If the node has children, filter them
      if (node.children) {
        const filteredChildren = node.children
          .map(child => filterTree(child, term))
          .filter(child => child !== null)

        // If any of the children match, return the node with the filtered children
        if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren }
        }
      }

      return null
    }

    const filteredChildren = treeData.children
      .map(child => filterTree(child, searchTerm))
      .filter(child => child !== null)

    return { ...treeData, children: filteredChildren }
  }, [searchTerm, treeData])

  const handleAddNode = useCallback((parentId, type) => {
    const newNode = {
      id: `${type}_${Date.now()}`,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      ip: type !== 'network' ? '192.168.1.100' : undefined,
      children: []
    };

    const updateTree = (node) => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateTree)
        };
      }
      return node;
    };

    setTreeData(prevData => updateTree(prevData));
  }, []);

  const handleDeleteNode = useCallback((nodeId) => {
    if (nodeId === 'root') return;

    const removeFromTree = (node) => {
      if (node.children) {
        return {
          ...node,
          children: node.children
            .filter(child => child.id !== nodeId)
            .map(removeFromTree)
        };
      }
      return node;
    };

    setTreeData(prevData => {
      const newData = removeFromTree(prevData);
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
      return newData;
    });
  }, [selectedNode]);

  const handleSaveNodeEdit = useCallback((nodeId, newName) => {
    const updateTree = (node) => {
      if (node.id === nodeId) {
        return { ...node, name: newName };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateTree)
        };
      }
      return node;
    };
    setTreeData(prevData => updateTree(prevData));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Network Topology Manager</h1>
          <div className="file-actions">
            <button
              className="action-btn save-btn"
              onClick={handleSaveToFile}
              title="Save topology to a JSON file"
            >
              <FaDownload />
              <span>Save to File</span>
            </button>
            <button
              className="action-btn load-btn"
              onClick={triggerFileInput}
              title="Load topology from a JSON file"
            >
              <FaUpload />
              <span>Load from File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleLoadFromFile}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </header>
      <div className="app-content">
        <div className="left-panel">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <TreeView 
            data={displayedData}
            onNodeSelect={setSelectedNode}
            selectedNode={selectedNode}
            onNodeAdd={handleAddNode}
            onNodeDelete={handleDeleteNode}
            onNodeEdit={handleSaveNodeEdit}
          />
        </div>
        <div className="right-panel">
          <TopologyView 
            selectedNode={selectedNode}
            treeData={treeData}
            onDataChange={setTreeData}
            customConnections={customConnections}
            onCustomConnectionsChange={setCustomConnections}
          />
        </div>
      </div>
    </div>
  )
}

export default App

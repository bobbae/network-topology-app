import { useState, useRef } from 'react'
import { FaDownload, FaUpload } from 'react-icons/fa'
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
        
        // Validate the data structure
        if (loadedData.treeData && typeof loadedData.treeData === 'object') {
          setTreeData(loadedData.treeData)
          
          // Load custom connections if they exist
          if (Array.isArray(loadedData.customConnections)) {
            setCustomConnections(loadedData.customConnections)
          } else {
            setCustomConnections([])
          }
          
          // Reset selected node when loading new data
          setSelectedNode(null)
          
          alert(`Network topology loaded successfully!${loadedData.exportedAt ? ` (Created: ${new Date(loadedData.exportedAt).toLocaleString()})` : ''}`)
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Network Topology Manager</h1>
          <div className="header-actions">
            <button 
              className="save-btn"
              onClick={handleSaveToFile}
              title="Save topology to JSON file"
            >
              <FaDownload /> Save
            </button>
            <button 
              className="load-btn"
              onClick={triggerFileInput}
              title="Load topology from JSON file"
            >
              <FaUpload /> Load
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
          <TreeView 
            data={treeData}
            onNodeSelect={setSelectedNode}
            onDataChange={setTreeData}
            selectedNode={selectedNode}
          />
        </div>
        <div className="right-panel">
          <TopologyView 
            selectedNode={selectedNode}
            treeData={treeData}
            onDataChange={setTreeData}
          />
        </div>
      </div>
    </div>
  )
}

export default App

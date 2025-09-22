# Network Topology Manager

A React-based network topology visualization application that allows users to create and manage custom hierarchical network structures with interactive topology diagrams.

## Features

### 🌳 Hierarchical Tree View
- **Custom Network Hierarchy**: Build complex network structures with multiple levels
- **Interactive Tree Navigation**: Expand/collapse nodes, select items
- **Real-time Editing**: Inline editing of node names
- **Drag & Drop Support**: Reorganize network components (future enhancement)

### 📊 Network Topology Visualization
- **Interactive Diagrams**: Powered by vis-network for dynamic network graphs
- **Multiple Layout Options**: Switch between force-directed and hierarchical layouts
- **Device Type Visualization**: Different colors and shapes for various device types
- **Real-time Updates**: Topology updates automatically when tree structure changes
- **Custom Connections**: Create custom links between any nodes in the topology
- **Connection Types**: Support for Ethernet, Fiber, Wireless, VPN, and Custom connections

### 🛠 Device Management
- **Multiple Device Types**: Support for networks, routers, switches, servers, and devices
- **Comprehensive Metadata**: IP addresses, MAC addresses, descriptions, and more
- **Right-Click Context Menu**: Quick access to edit and delete operations
- **Advanced Node Editor**: Modal form for editing all node properties
- **Device Information Panel**: Detailed information display with all metadata

### 🎨 User Experience
- **Split Panel Interface**: Tree view on left, topology diagram on right
- **Responsive Design**: Adapts to different screen sizes
- **Professional Styling**: Modern UI with intuitive controls
- **Visual Feedback**: Hover effects, selection states, and animations

## Device Types

| Type | Color | Icon | Description |
|------|-------|------|-------------|
| **Network** | Blue | 🔄 | Network segments or subnets |
| **Router** | Red | 🖥️ | Routing devices |
| **Switch** | Orange | 🖥️ | Switching devices |
| **Server** | Green | 🖥️ | Server hardware |
| **Device** | Purple | 💻 | End-user devices |

## Connection Types

| Type | Color | Style | Description |
|------|-------|-------|-------------|
| **Ethernet** | Green | Solid | Standard Ethernet connections |
| **Fiber** | Orange | Thick | Fiber optic high-speed links |
| **Wireless** | Purple | Dashed | Wireless network connections |
| **VPN** | Red | Long Dash | Virtual private network links |
| **Custom** | Blue | Solid | User-defined connections |

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

## Usage Guide

### Creating Network Hierarchies

1. **Select a Parent Node**: Click on any node in the tree view
2. **Add New Devices**: Hover over a node to reveal the "+" button
3. **Choose Device Type**: Select from the dropdown menu (Network, Router, Switch, Server, Device)
4. **Edit Properties**: Click the edit icon to rename devices or modify properties

### Viewing Topology Diagrams

1. **Select a Node**: Click on any node in the tree to view its topology
2. **Interact with Diagram**: 
   - Pan: Click and drag empty space
   - Zoom: Use mouse wheel
   - Select Nodes: Click on network nodes
3. **Toggle Layouts**: Use the "Layout" button to switch between force-directed and hierarchical views
4. **View Details**: Click on nodes in the topology to see detailed information

### Creating Custom Connections

1. **Enter Connection Mode**: Click the "Connect" button in the topology controls
2. **Select Connection Type**: Choose from Ethernet, Fiber, Wireless, VPN, or Custom
3. **Create Links**: Click on two nodes to create a connection between them
4. **Delete Links**: In connection mode, click on existing connection lines to delete them
5. **Exit Mode**: Click "Exit Connect" to return to normal view mode

### Editing Node Properties

1. **Access Context Menu**: Right-click on any node in the topology view
2. **Edit Properties**: Select "Edit Properties" to open the node editor
3. **Modify Fields**: Update name, type, IP address, MAC address, and description
4. **Save Changes**: Click "Save Changes" to apply modifications
5. **Delete Nodes**: Use "Delete Node" option to remove nodes (except root)

#### Supported Node Properties
- **Name**: Display name for the device
- **Type**: Device category (Network, Router, Switch, Server, Device)
- **IP Address**: IPv4 address (e.g., 192.168.1.1)
- **MAC Address**: Hardware address (e.g., 00:11:22:33:44:55)
- **Description**: Detailed description of the device's role

### Navigation Tips

- **Tree Navigation**: Use the chevron arrows to expand/collapse branches
- **Quick Selection**: Selected items are highlighted in blue
- **Information Panel**: Click topology nodes to open the information sidebar
- **Right-Click Menu**: Right-click nodes in topology for edit/delete options
- **Modal Editor**: Use the comprehensive modal form for detailed node editing
- **Legend**: Refer to the color-coded legend for device type identification

## Architecture

### Technology Stack
- **Frontend**: React 18 with Vite
- **Visualization**: vis-network for graph rendering
- **Icons**: React Icons (Font Awesome)
- **Styling**: CSS3 with modern features

### Component Structure
```
src/
├── components/
│   ├── TreeView.jsx          # Hierarchical tree component
│   ├── TreeView.css          # Tree styling
│   ├── TopologyView.jsx      # Network topology visualization
│   └── TopologyView.css      # Topology styling
├── App.jsx                   # Main application component
├── App.css                   # Application layout styles
└── index.css                 # Global styles
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Future Enhancements

- [ ] Drag & Drop node reorganization
- [ ] Import/Export network configurations
- [ ] Real-time network monitoring integration
- [ ] Connection management between devices
- [ ] Network discovery and auto-mapping
- [ ] Performance metrics and monitoring
- [ ] Multi-user collaboration features
- [ ] Cloud storage and synchronization

## License

This project is licensed under the MIT License.

---

**Built with ❤️ using React and vis-network**

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# network-topology-app

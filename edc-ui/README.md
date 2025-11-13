# Eclipse Dataspace Connector UI

A modern web interface for visualizing and managing Eclipse Dataspace Connector (EDC) interactions between data providers and consumers.

## Features

- **Provider Interface**: Upload data files, create assets, define policies, and set up contract definitions
- **Consumer Interface**: Browse catalogs, negotiate contracts, and initiate data transfers
- **Interactive Visualization**: Real-time view of dataspace interactions and relationships
- **Connector Health Monitoring**: Check the status of both provider and consumer connectors

## Prerequisites

Before running this UI, ensure you have the EDC connectors running:

1. **Provider Connector** on port 19193 (management API) and 19194 (protocol API)
2. **Consumer Connector** on port 29193 (management API) and 29194 (protocol API)

Follow the [transfer prerequisites guide](../transfer/transfer-00-prerequisites/README.md) to set up the connectors.

## Installation

1. Navigate to the UI directory:
   ```bash
   cd edc-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The UI will be available at http://localhost:3000

## Usage

### 1. Provider Setup
- Go to the **Provider** tab
- Create assets by uploading data files or defining HTTP endpoints
- Define access policies (currently supports open access)
- Create contract definitions linking policies to assets

### 2. Consumer Operations
- Navigate to the **Consumer** tab
- Browse the catalog to see available datasets
- Select a dataset and negotiate a contract
- Once negotiation is complete, initiate data transfers

### 3. Visualization
- Use the **Visualization** tab to see the dataspace topology
- View relationships between assets, policies, contracts, and connectors
- Monitor active negotiations and transfers in real-time

## API Integration

The UI communicates with EDC connectors through their Management API endpoints:

- **Provider Management API**: `http://localhost:19193/management/v3/`
- **Consumer Management API**: `http://localhost:29193/management/v3/`

API calls are proxied through the Vite development server to avoid CORS issues.

## Architecture

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query for server state
- **Visualization**: React Flow for interactive diagrams
- **HTTP Client**: Axios with proxy configuration

## Development

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

## Troubleshooting

### Connector Connection Issues
- Ensure both provider and consumer connectors are running
- Check that the management API ports (19193, 29193) are accessible
- Verify the protocol API ports (19194, 29194) are configured correctly

### CORS Issues
- The development server includes proxy configuration for API calls
- In production, ensure proper CORS headers are configured on the EDC connectors

## Contributing

This UI is part of the EDC Samples project. Please refer to the main project guidelines for contributing.
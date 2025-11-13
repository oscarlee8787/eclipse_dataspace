import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from 'react-flow-renderer'
import { Database, Download, Shield, FileText, Activity } from 'lucide-react'
import { api } from '../services/api'

const nodeTypes = {
  provider: ProviderNode,
  consumer: ConsumerNode,
  asset: AssetNode,
  policy: PolicyNode,
  contract: ContractNode,
}

export default function Visualization() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  
  const { data: assets } = useQuery({
    queryKey: ['assets'],
    queryFn: api.getAssets,
  })

  const { data: policies } = useQuery({
    queryKey: ['policies'],
    queryFn: api.getPolicies,
  })

  const { data: contracts } = useQuery({
    queryKey: ['contract-definitions'],
    queryFn: api.getContractDefinitions,
  })

  const { data: negotiations } = useQuery({
    queryKey: ['contract-negotiations'],
    queryFn: api.getContractNegotiations,
  })

  // Generate nodes and edges based on data
  const generateNodes = (): Node[] => {
    const nodes: Node[] = [
      {
        id: 'provider',
        type: 'provider',
        position: { x: 100, y: 100 },
        data: { label: 'Data Provider', connectorId: 'provider-connector' },
      },
      {
        id: 'consumer',
        type: 'consumer',
        position: { x: 600, y: 100 },
        data: { label: 'Data Consumer', connectorId: 'consumer-connector' },
      },
    ]

    // Add asset nodes
    assets?.forEach((asset: any, index: number) => {
      nodes.push({
        id: `asset-${asset['@id']}`,
        type: 'asset',
        position: { x: 50 + (index * 120), y: 250 },
        data: { 
          label: asset.properties?.name || asset['@id'],
          asset,
        },
      })
    })

    // Add policy nodes
    policies?.forEach((policy: any, index: number) => {
      nodes.push({
        id: `policy-${policy['@id']}`,
        type: 'policy',
        position: { x: 50 + (index * 120), y: 400 },
        data: { 
          label: policy['@id'],
          policy,
        },
      })
    })

    // Add contract nodes
    contracts?.forEach((contract: any, index: number) => {
      nodes.push({
        id: `contract-${contract['@id']}`,
        type: 'contract',
        position: { x: 50 + (index * 120), y: 550 },
        data: { 
          label: contract['@id'],
          contract,
        },
      })
    })

    return nodes
  }

  const generateEdges = (): Edge[] => {
    const edges: Edge[] = []

    // Connect provider to assets
    assets?.forEach((asset: any) => {
      edges.push({
        id: `provider-asset-${asset['@id']}`,
        source: 'provider',
        target: `asset-${asset['@id']}`,
        type: 'smoothstep',
        label: 'hosts',
        style: { stroke: '#0066CC' },
      })
    })

    // Connect policies to contracts
    contracts?.forEach((contract: any) => {
      edges.push({
        id: `policy-contract-${contract['@id']}-access`,
        source: `policy-${contract.accessPolicyId}`,
        target: `contract-${contract['@id']}`,
        type: 'smoothstep',
        label: 'access policy',
        style: { stroke: '#059669' },
      })

      edges.push({
        id: `policy-contract-${contract['@id']}-contract`,
        source: `policy-${contract.contractPolicyId}`,
        target: `contract-${contract['@id']}`,
        type: 'smoothstep',
        label: 'contract policy',
        style: { stroke: '#7C3AED' },
      })
    })

    // Connect successful negotiations to consumer
    negotiations?.filter((n: any) => n.state === 'FINALIZED').forEach((negotiation: any) => {
      edges.push({
        id: `negotiation-${negotiation['@id']}`,
        source: 'provider',
        target: 'consumer',
        type: 'smoothstep',
        label: 'active agreement',
        style: { stroke: '#DC2626', strokeWidth: 3 },
        animated: true,
      })
    })

    return edges
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(generateNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges())

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dataspace Visualization</h1>
          <p className="mt-2 text-sm text-gray-700">
            Interactive view of provider-consumer interactions and data flow.
          </p>
        </div>
      </div>

      <div className="mt-8 flex space-x-6">
        <div className="flex-1 card p-0 overflow-hidden" style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="top-right"
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {selectedNode && (
          <div className="w-80 card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Node Details</h3>
            <NodeDetails node={selectedNode} onClose={() => setSelectedNode(null)} />
          </div>
        )}
      </div>

      <div className="mt-6 card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Legend</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-edc-blue rounded mr-2"></div>
              <span className="text-sm">Provider-Asset relationship</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
              <span className="text-sm">Policy-Contract relationship</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
              <span className="text-sm">Active data transfer</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-600 rounded mr-2"></div>
              <span className="text-sm">Contract policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProviderNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-blue-100 border-2 border-blue-500">
      <div className="flex items-center">
        <Database className="h-5 w-5 text-blue-600 mr-2" />
        <div>
          <div className="text-lg font-bold text-blue-900">{data.label}</div>
          <div className="text-xs text-blue-700">{data.connectorId}</div>
        </div>
      </div>
    </div>
  )
}

function ConsumerNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-green-100 border-2 border-green-500">
      <div className="flex items-center">
        <Download className="h-5 w-5 text-green-600 mr-2" />
        <div>
          <div className="text-lg font-bold text-green-900">{data.label}</div>
          <div className="text-xs text-green-700">{data.connectorId}</div>
        </div>
      </div>
    </div>
  )
}

function AssetNode({ data }: { data: any }) {
  return (
    <div className="px-3 py-2 shadow-md rounded-md bg-gray-100 border-2 border-gray-400">
      <div className="flex items-center">
        <FileText className="h-4 w-4 text-gray-600 mr-1" />
        <div>
          <div className="text-sm font-semibold text-gray-900">{data.label}</div>
          <div className="text-xs text-gray-600">Asset</div>
        </div>
      </div>
    </div>
  )
}

function PolicyNode({ data }: { data: any }) {
  return (
    <div className="px-3 py-2 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-400">
      <div className="flex items-center">
        <Shield className="h-4 w-4 text-yellow-600 mr-1" />
        <div>
          <div className="text-sm font-semibold text-yellow-900">{data.label}</div>
          <div className="text-xs text-yellow-600">Policy</div>
        </div>
      </div>
    </div>
  )
}

function ContractNode({ data }: { data: any }) {
  return (
    <div className="px-3 py-2 shadow-md rounded-md bg-purple-100 border-2 border-purple-400">
      <div className="flex items-center">
        <Activity className="h-4 w-4 text-purple-600 mr-1" />
        <div>
          <div className="text-sm font-semibold text-purple-900">{data.label}</div>
          <div className="text-xs text-purple-600">Contract</div>
        </div>
      </div>
    </div>
  )
}

function NodeDetails({ node, onClose }: { node: Node; onClose: () => void }) {
  const renderDetails = () => {
    switch (node.type) {
      case 'provider':
        return (
          <div>
            <h4 className="font-medium text-gray-900">Provider Connector</h4>
            <p className="text-sm text-gray-600 mt-1">
              Hosts and manages data assets available for sharing in the dataspace.
            </p>
          </div>
        )
      case 'consumer':
        return (
          <div>
            <h4 className="font-medium text-gray-900">Consumer Connector</h4>
            <p className="text-sm text-gray-600 mt-1">
              Discovers and accesses data from providers through contract negotiations.
            </p>
          </div>
        )
      case 'asset':
        const asset = node.data.asset
        return (
          <div>
            <h4 className="font-medium text-gray-900">Asset Details</h4>
            <dl className="mt-2 space-y-1">
              <div>
                <dt className="text-xs font-medium text-gray-500">Name:</dt>
                <dd className="text-sm text-gray-900">{asset.properties?.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Content Type:</dt>
                <dd className="text-sm text-gray-900">{asset.properties?.contenttype}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Base URL:</dt>
                <dd className="text-sm text-gray-900 break-all">{asset.dataAddress?.baseUrl}</dd>
              </div>
            </dl>
          </div>
        )
      case 'policy':
        return (
          <div>
            <h4 className="font-medium text-gray-900">Policy Details</h4>
            <p className="text-sm text-gray-600 mt-1">
              Access control policy defining permissions and constraints.
            </p>
          </div>
        )
      case 'contract':
        const contract = node.data.contract
        return (
          <div>
            <h4 className="font-medium text-gray-900">Contract Definition</h4>
            <dl className="mt-2 space-y-1">
              <div>
                <dt className="text-xs font-medium text-gray-500">Access Policy:</dt>
                <dd className="text-sm text-gray-900">{contract.accessPolicyId}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500">Contract Policy:</dt>
                <dd className="text-sm text-gray-900">{contract.contractPolicyId}</dd>
              </div>
            </dl>
          </div>
        )
      default:
        return <div>No details available</div>
    }
  }

  return (
    <div>
      {renderDetails()}
      <button
        onClick={onClose}
        className="mt-4 w-full btn-secondary text-sm"
      >
        Close
      </button>
    </div>
  )
}
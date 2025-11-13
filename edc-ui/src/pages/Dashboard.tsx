import { useQuery } from '@tanstack/react-query'
import { Database, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '../services/api'
import ConnectorStatus from '../components/ConnectorStatus'

export default function Dashboard() {
  const { data: providerHealth } = useQuery({
    queryKey: ['provider-health'],
    queryFn: () => api.checkProviderHealth(),
    refetchInterval: 30000,
  })

  const { data: consumerHealth } = useQuery({
    queryKey: ['consumer-health'],
    queryFn: () => api.checkConsumerHealth(),
    refetchInterval: 30000,
  })

  const StatusCard = ({ title, status, icon: Icon, description }: any) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${status ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={`h-6 w-6 ${status ? 'text-green-600' : 'text-red-600'}`} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="ml-auto">
          {status ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Monitor your Eclipse Dataspace Connector ecosystem status and activity.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title="Provider Connector"
          status={providerHealth?.isHealthy}
          icon={Database}
          description="Data provider connector status"
        />
        
        <StatusCard
          title="Consumer Connector"
          status={consumerHealth?.isHealthy}
          icon={Download}
          description="Data consumer connector status"
        />
        
        <div className="lg:col-span-1">
          <ConnectorStatus />
        </div>
      </div>

      <div className="mt-8 card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Start Guide</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-edc-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
              1
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Set up Provider</h3>
              <p className="text-sm text-gray-500">
                Go to the Provider tab to upload data files, create assets, and define access policies.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-edc-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
              2
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Browse as Consumer</h3>
              <p className="text-sm text-gray-500">
                Use the Consumer tab to discover available datasets, negotiate contracts, and access data.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-edc-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
              3
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Visualize Interactions</h3>
              <p className="text-sm text-gray-500">
                Monitor the data exchange flow and connector interactions in the Visualization tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
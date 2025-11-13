import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Search, Download, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../services/api'

export default function Consumer() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'negotiations' | 'transfers'>('catalog')
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [catalog, setCatalog] = useState<any>(null)

  const queryClient = useQueryClient()

  const requestCatalogMutation = useMutation({
    mutationFn: api.requestCatalog,
    onSuccess: (data) => {
      setCatalog(data)
      toast.success('Catalog fetched successfully!')
    },
    onError: () => {
      toast.error('Failed to fetch catalog')
    },
  })

  const { data: negotiations } = useQuery({
    queryKey: ['contract-negotiations'],
    queryFn: api.getContractNegotiations,
  })

  const negotiateContractMutation = useMutation({
    mutationFn: api.negotiateContract,
    onSuccess: (data) => {
      console.log('Contract negotiation success:', data)
      queryClient.invalidateQueries({ queryKey: ['contract-negotiations'] })
      setSelectedOffer(null)
      toast.success('Contract negotiation initiated!')
    },
    onError: (error: any) => {
      console.error('Contract negotiation error:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate contract negotiation'
      toast.error(errorMessage)
    },
  })

  const startTransferMutation = useMutation({
    mutationFn: api.startTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-processes'] })
      toast.success('Data transfer initiated!')
    },
    onError: () => {
      toast.error('Failed to start transfer')
    },
  })

  const handleFetchCatalog = () => {
    requestCatalogMutation.mutate({
      counterPartyAddress: 'http://localhost:19194/protocol',
      protocol: 'dataspace-protocol-http',
    })
  }

  const handleNegotiateContract = () => {
    if (!selectedOffer) {
      toast.error('No offer selected')
      return
    }

    console.log('Selected offer for negotiation:', selectedOffer)
    
    const policy = selectedOffer['odrl:hasPolicy']
    if (!policy) {
      toast.error('No policy found in selected offer')
      return
    }

    negotiateContractMutation.mutate({
      counterPartyAddress: 'http://localhost:19194/protocol',
      protocol: 'dataspace-protocol-http',
      policy: {
        '@context': 'http://www.w3.org/ns/odrl.jsonld',
        '@id': policy['@id'],
        '@type': 'Offer',
        'assigner': 'provider',
        'target': selectedOffer['@id']
      },
    })
  }

  const handleStartTransfer = (contractAgreementId: string, assetId: string) => {
    startTransferMutation.mutate({
      counterPartyAddress: 'http://localhost:19194/protocol',
      protocol: 'dataspace-protocol-http',
      contractId: contractAgreementId,
      assetId: assetId,
      dataDestination: {
        type: 'HttpProxy',
      },
      managedResources: false,
    })
  }

  const tabs = [
    { id: 'catalog', name: 'Catalog Browser', icon: Search },
    { id: 'negotiations', name: 'Contract Negotiations', icon: FileText },
    { id: 'transfers', name: 'Data Transfers', icon: Download },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Data Consumer</h1>
          <p className="mt-2 text-sm text-gray-700">
            Discover and access data from providers in the dataspace.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-edc-blue text-edc-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'catalog' && (
            <CatalogTab
              catalog={catalog}
              onFetchCatalog={handleFetchCatalog}
              isLoading={requestCatalogMutation.isPending}
              selectedOffer={selectedOffer}
              onSelectOffer={setSelectedOffer}
              onNegotiate={handleNegotiateContract}
              isNegotiating={negotiateContractMutation.isPending}
            />
          )}
          {activeTab === 'negotiations' && (
            <NegotiationsTab
              negotiations={negotiations}
              onStartTransfer={handleStartTransfer}
              isStartingTransfer={startTransferMutation.isPending}
            />
          )}
          {activeTab === 'transfers' && (
            <TransfersTab />
          )}
        </div>
      </div>
    </div>
  )
}

function CatalogTab({
  catalog,
  onFetchCatalog,
  isLoading,
  selectedOffer,
  onSelectOffer,
  onNegotiate,
  isNegotiating,
}: any) {
  const offers = catalog?.['dcat:dataset'] ? [catalog['dcat:dataset']] : []

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg font-medium text-gray-900">Provider Catalog</h2>
          <p className="mt-1 text-sm text-gray-700">
            Browse available datasets from the provider connector.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={onFetchCatalog}
            disabled={isLoading}
            className="btn-primary flex items-center disabled:opacity-50"
          >
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Loading...' : 'Fetch Catalog'}
          </button>
        </div>
      </div>

      {!catalog && (
        <div className="mt-6 card text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No catalog loaded</h3>
          <p className="mt-1 text-sm text-gray-500">
            Click "Fetch Catalog" to browse available datasets from the provider.
          </p>
        </div>
      )}

      {offers.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {offers.map((dataset: any) => (
            <div
              key={dataset['@id']}
              className={`card cursor-pointer transition-all duration-200 ${
                selectedOffer?.['@id'] === dataset['@id']
                  ? 'ring-2 ring-edc-blue border-edc-blue'
                  : 'hover:shadow-md'
              }`}
              onClick={() => onSelectOffer(dataset)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {dataset.name || dataset['@id']}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {dataset.contenttype}
                  </p>
                  {dataset.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {dataset.description}
                    </p>
                  )}
                </div>
                {selectedOffer?.['@id'] === dataset['@id'] && (
                  <CheckCircle className="h-5 w-5 text-edc-blue flex-shrink-0 ml-4" />
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Available Formats:</h4>
                <div className="flex flex-wrap gap-2">
                  {dataset['dcat:distribution']?.map((dist: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {dist['dct:format']?.['@id']}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOffer && (
        <div className="mt-6 card bg-blue-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Negotiation</h3>
          <p className="text-sm text-gray-600 mb-4">
            You have selected "{selectedOffer.name || selectedOffer['@id']}". 
            Click negotiate to start the contract negotiation process.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => onSelectOffer(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onNegotiate}
              disabled={isNegotiating}
              className="btn-primary disabled:opacity-50"
            >
              {isNegotiating ? 'Negotiating...' : 'Negotiate Contract'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function NegotiationsTab({ negotiations, onStartTransfer, isStartingTransfer }: any) {
  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'FINALIZED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'TERMINATED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'FINALIZED':
        return 'bg-green-100 text-green-800'
      case 'TERMINATED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg font-medium text-gray-900">Contract Negotiations</h2>
          <p className="mt-1 text-sm text-gray-700">
            Track the status of your contract negotiations with providers.
          </p>
        </div>
      </div>

      {!negotiations?.length && (
        <div className="mt-6 card text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No negotiations</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by browsing the catalog and selecting a dataset to negotiate.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {negotiations?.map((negotiation: any) => (
          <div key={negotiation['@id']} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(negotiation.state)}
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    {negotiation['@id']}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {negotiation.type} • {negotiation.protocol}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(negotiation.state)}`}>
                  {negotiation.state}
                </span>
                {negotiation.state === 'FINALIZED' && negotiation.contractAgreementId && (
                  <button
                    onClick={() => onStartTransfer(negotiation.contractAgreementId, 'assetId')}
                    disabled={isStartingTransfer}
                    className="btn-primary text-xs disabled:opacity-50"
                  >
                    {isStartingTransfer ? 'Starting...' : 'Start Transfer'}
                  </button>
                )}
              </div>
            </div>
            {negotiation.contractAgreementId && (
              <div className="mt-3 text-xs text-gray-600">
                Contract Agreement: {negotiation.contractAgreementId}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TransfersTab() {
  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg font-medium text-gray-900">Data Transfers</h2>
          <p className="mt-1 text-sm text-gray-700">
            Monitor active and completed data transfer processes.
          </p>
        </div>
      </div>

      <div className="mt-6 card text-center py-12">
        <Download className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No active transfers</h3>
        <p className="mt-1 text-sm text-gray-500">
          Transfer processes will appear here once you initiate data transfers.
        </p>
      </div>
    </div>
  )
}
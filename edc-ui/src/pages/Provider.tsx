import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Plus, Database, Shield, FileText } from 'lucide-react'
import { api } from '../services/api'

export default function Provider() {
  const [activeTab, setActiveTab] = useState<'assets' | 'policies' | 'contracts'>('assets')
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [showPolicyForm, setShowPolicyForm] = useState(false)
  const [showContractForm, setShowContractForm] = useState(false)

  const queryClient = useQueryClient()

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: api.getAssets,
  })

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: api.getPolicies,
  })

  const { data: contractDefinitions, isLoading: contractsLoading } = useQuery({
    queryKey: ['contract-definitions'],
    queryFn: api.getContractDefinitions,
  })

  const createAssetMutation = useMutation({
    mutationFn: api.createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setShowAssetForm(false)
      toast.success('Asset created successfully!')
    },
    onError: () => {
      toast.error('Failed to create asset')
    },
  })

  const createPolicyMutation = useMutation({
    mutationFn: api.createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      setShowPolicyForm(false)
      toast.success('Policy created successfully!')
    },
    onError: () => {
      toast.error('Failed to create policy')
    },
  })

  const createContractMutation = useMutation({
    mutationFn: api.createContractDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-definitions'] })
      setShowContractForm(false)
      toast.success('Contract definition created successfully!')
    },
    onError: () => {
      toast.error('Failed to create contract definition')
    },
  })

  const tabs = [
    { id: 'assets', name: 'Assets', icon: Database, count: assets?.length || 0 },
    { id: 'policies', name: 'Policies', icon: Shield, count: policies?.length || 0 },
    { id: 'contracts', name: 'Contract Definitions', icon: FileText, count: contractDefinitions?.length || 0 },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Data Provider</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your data assets, access policies, and contract definitions.
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
                  <span className="ml-2 bg-gray-100 text-gray-900 rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'assets' && (
            <AssetsTab
              assets={assets}
              loading={assetsLoading}
              showForm={showAssetForm}
              setShowForm={setShowAssetForm}
              onSubmit={createAssetMutation.mutate}
              isSubmitting={createAssetMutation.isPending}
            />
          )}
          {activeTab === 'policies' && (
            <PoliciesTab
              policies={policies}
              loading={policiesLoading}
              showForm={showPolicyForm}
              setShowForm={setShowPolicyForm}
              onSubmit={createPolicyMutation.mutate}
              isSubmitting={createPolicyMutation.isPending}
            />
          )}
          {activeTab === 'contracts' && (
            <ContractDefinitionsTab
              contracts={contractDefinitions}
              loading={contractsLoading}
              showForm={showContractForm}
              setShowForm={setShowContractForm}
              onSubmit={createContractMutation.mutate}
              isSubmitting={createContractMutation.isPending}
              policies={policies}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function AssetsTab({ assets, loading, showForm, setShowForm, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    contentType: 'application/json',
    dataType: 'HttpData',
    baseUrl: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      '@id': formData.id || crypto.randomUUID(),
      properties: {
        name: formData.name,
        description: formData.description,
        contenttype: formData.contentType,
      },
      dataAddress: {
        type: formData.dataType,
        baseUrl: formData.baseUrl,
      },
    })
  }

  if (loading) return <div>Loading assets...</div>

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg font-medium text-gray-900">Assets</h2>
          <p className="mt-1 text-sm text-gray-700">
            Data assets that can be shared through the dataspace.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-6 card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Asset</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Asset ID (optional)</label>
              <input
                type="text"
                className="form-input"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                placeholder="Leave empty to auto-generate"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Product description"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the asset"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Content Type</label>
                <select
                  className="form-input"
                  value={formData.contentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
                >
                  <option value="application/json">JSON</option>
                  <option value="text/csv">CSV</option>
                  <option value="application/xml">XML</option>
                  <option value="text/plain">Plain Text</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data Type</label>
                <select
                  className="form-input"
                  value={formData.dataType}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataType: e.target.value }))}
                >
                  <option value="HttpData">HTTP Data</option>
                  <option value="HttpProxy">HTTP Proxy</option>
                  <option value="AzureStorage">Azure Storage</option>
                  <option value="S3">Amazon S3</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Base URL</label>
              <input
                type="url"
                required
                className="form-input"
                value={formData.baseUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://example.com/data/product.json"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Asset'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets?.map((asset: any) => (
          <div key={asset['@id']} className="card">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-edc-blue" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {asset.properties?.name || asset['@id']}
                </h3>
                <p className="text-xs text-gray-500">
                  {asset.properties?.contenttype}
                </p>
              </div>
            </div>
            {asset.properties?.description && (
              <p className="mt-2 text-sm text-gray-600">
                {asset.properties.description}
              </p>
            )}
            <div className="mt-2 text-xs text-gray-400">
              ID: {asset['@id']}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PoliciesTab({ policies, loading, showForm, setShowForm, onSubmit, isSubmitting }: any) {
  const [policyType, setPolicyType] = useState<'open' | 'custom'>('open')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const policy = {
      '@type': 'Set',
      permission: [],
      prohibition: [],
      obligation: [],
    }
    
    onSubmit({
      '@id': `policy-${Date.now()}`,
      policy,
    })
  }

  if (loading) return <div>Loading policies...</div>

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg font-medium text-gray-900">Access Policies</h2>
          <p className="mt-1 text-sm text-gray-700">
            Define access rules and constraints for your assets.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-6 card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Policy</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Policy Type</label>
              <select
                className="form-input"
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value as any)}
              >
                <option value="open">Open Access</option>
                <option value="custom">Custom Policy</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Policy'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {policies?.map((policy: any) => (
          <div key={policy['@id']} className="card">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {policy['@id']}
                </h3>
                <p className="text-xs text-gray-500">
                  Open Access Policy
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              ID: {policy['@id']}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContractDefinitionsTab({ contracts, loading, showForm, setShowForm, onSubmit, isSubmitting, policies }: any) {
  const [formData, setFormData] = useState({
    accessPolicyId: '',
    contractPolicyId: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      '@id': `contract-def-${Date.now()}`,
      accessPolicyId: formData.accessPolicyId,
      contractPolicyId: formData.contractPolicyId,
      assetsSelector: [], // Empty selector means all assets
    })
  }

  if (loading) return <div>Loading contract definitions...</div>

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-lg font-medium text-gray-900">Contract Definitions</h2>
          <p className="mt-1 text-sm text-gray-700">
            Link policies to assets to create contract offers.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contract Definition
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-6 card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Contract Definition</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Access Policy</label>
              <select
                required
                className="form-input"
                value={formData.accessPolicyId}
                onChange={(e) => setFormData(prev => ({ ...prev, accessPolicyId: e.target.value }))}
              >
                <option value="">Select a policy...</option>
                {policies?.map((policy: any) => (
                  <option key={policy['@id']} value={policy['@id']}>
                    {policy['@id']}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contract Policy</label>
              <select
                required
                className="form-input"
                value={formData.contractPolicyId}
                onChange={(e) => setFormData(prev => ({ ...prev, contractPolicyId: e.target.value }))}
              >
                <option value="">Select a policy...</option>
                {policies?.map((policy: any) => (
                  <option key={policy['@id']} value={policy['@id']}>
                    {policy['@id']}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.accessPolicyId || !formData.contractPolicyId}
                className="btn-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Contract Definition'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contracts?.map((contract: any) => (
          <div key={contract['@id']} className="card">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {contract['@id']}
                </h3>
                <p className="text-xs text-gray-500">
                  Contract Definition
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <div>Access Policy: {contract.accessPolicyId}</div>
              <div>Contract Policy: {contract.contractPolicyId}</div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              ID: {contract['@id']}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
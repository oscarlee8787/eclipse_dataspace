import axios from 'axios'

const providerApi = axios.create({
  baseURL: '/api/provider',
  headers: {
    'Content-Type': 'application/json',
  },
})

const consumerApi = axios.create({
  baseURL: '/api/consumer',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Asset {
  '@id': string
  properties: {
    name: string
    description?: string
    contenttype: string
  }
  dataAddress: {
    type: string
    baseUrl: string
  }
}

export interface Policy {
  '@id': string
  policy: {
    '@type': string
    permission: any[]
    prohibition: any[]
    obligation: any[]
  }
}

export interface ContractDefinition {
  '@id': string
  accessPolicyId: string
  contractPolicyId: string
  assetsSelector: any[]
}

export interface ContractOffer {
  '@id': string
  policy: any
  asset: Asset
}

export interface CatalogRequest {
  counterPartyAddress: string
  protocol: string
}

export interface ContractNegotiation {
  '@id'?: string
  counterPartyAddress: string
  protocol: string
  policy: any
}

export const api = {
  // Health checks
  async checkProviderHealth() {
    try {
      const response = await fetch('http://localhost:19191/api/check/health')
      return { isHealthy: response.ok }
    } catch {
      return { isHealthy: false }
    }
  },

  async checkConsumerHealth() {
    try {
      const response = await fetch('http://localhost:29191/api/check/health')
      return { isHealthy: response.ok }
    } catch {
      return { isHealthy: false }
    }
  },

  // Provider APIs
  async createAsset(asset: Omit<Asset, '@id'> & { '@id'?: string }) {
    const response = await providerApi.post('/assets', {
      '@context': { '@vocab': 'https://w3id.org/edc/v0.0.1/ns/' },
      '@id': asset['@id'] || crypto.randomUUID(),
      properties: asset.properties,
      dataAddress: asset.dataAddress,
    })
    return response.data
  },

  async getAssets() {
    const response = await providerApi.post('/assets/request', {
      '@context': { '@vocab': 'https://w3id.org/edc/v0.0.1/ns/' }
    })
    return response.data
  },

  async createPolicy(policy: Omit<Policy, '@id'> & { '@id'?: string }) {
    const response = await providerApi.post('/policydefinitions', {
      '@context': { '@vocab': 'https://w3id.org/edc/v0.0.1/ns/' },
      '@id': policy['@id'] || crypto.randomUUID(),
      policy: policy.policy,
    })
    return response.data
  },

  async getPolicies() {
    const response = await providerApi.post('/policydefinitions/request', {
      '@context': { '@vocab': 'https://w3id.org/edc/v0.0.1/ns/' }
    })
    return response.data
  },

  async createContractDefinition(contractDef: Omit<ContractDefinition, '@id'> & { '@id'?: string }) {
    const response = await providerApi.post('/contractdefinitions', {
      '@context': { '@vocab': 'https://w3id.org/edc/v0.0.1/ns/' },
      '@id': contractDef['@id'] || crypto.randomUUID(),
      accessPolicyId: contractDef.accessPolicyId,
      contractPolicyId: contractDef.contractPolicyId,
      assetsSelector: contractDef.assetsSelector,
    })
    return response.data
  },

  async getContractDefinitions() {
    const response = await providerApi.post('/contractdefinitions/request', {
      '@context': { '@vocab': 'https://w3id.org/edc/v0.0.1/ns/' }
    })
    return response.data
  },

  // Consumer APIs
  async requestCatalog(request: CatalogRequest) {
    const response = await consumerApi.post('/catalog/request', {
      '@context': { '@vocab': 'https://w3id.org/edc/v0.0.1/ns/' },
      counterPartyAddress: request.counterPartyAddress,
      protocol: request.protocol,
    })
    return response.data
  },

  async negotiateContract(negotiation: ContractNegotiation) {
    const payload = {
      '@context': { 
        '@vocab': 'https://w3id.org/edc/v0.0.1/ns/',
        'dct': 'https://purl.org/dc/terms/',
        'dcat': 'https://www.w3.org/ns/dcat/',
        'odrl': 'http://www.w3.org/ns/odrl/2/',
        'dspace': 'https://w3id.org/dspace/v0.8/'
      },
      '@type': 'ContractRequest',
      counterPartyAddress: negotiation.counterPartyAddress,
      protocol: negotiation.protocol,
      policy: negotiation.policy,
    }
    console.log('Contract negotiation payload:', JSON.stringify(payload, null, 2))
    console.log('Making request to:', '/contractnegotiations')
    
    try {
      const response = await consumerApi.post('/contractnegotiations', payload)
      console.log('Contract negotiation response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Contract negotiation failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      })
      throw error
    }
  },

  async getContractNegotiation(id: string) {
    const response = await consumerApi.get(`/contractnegotiations/${id}`)
    return response.data
  },

  async getContractNegotiations() {
    const response = await consumerApi.post('/contractnegotiations/request', {
      '@context': { '@vocab': 'https://w3id.org/edc/v0.0.1/ns/' }
    })
    return response.data
  },

  async startTransfer(transfer: any) {
    const response = await consumerApi.post('/transferprocesses', {
      '@context': { '@vocab': 'https://w3id.org/edc/v0.0.1/ns/' },
      ...transfer,
    })
    return response.data
  },

  async getTransferProcess(id: string) {
    const response = await consumerApi.get(`/transferprocesses/${id}`)
    return response.data
  },
}
# Complete Eclipse Dataspace Components (EDC) Tutorial

This comprehensive tutorial takes you through every step to set up, operate, and understand a complete dataspace with two EDC connectors for secure data sharing.

## Table of Contents
1. [Prerequisites and Setup](#prerequisites-and-setup)
2. [Understanding Dataspace Architecture](#understanding-dataspace-architecture)
3. [Building the Basic Learning Path](#building-the-basic-learning-path)
4. [Setting Up Production-Ready Connectors](#setting-up-production-ready-connectors)
5. [Complete Dataspace Operations Walkthrough](#complete-dataspace-operations-walkthrough)
6. [Understanding Each Component](#understanding-each-component)
7. [Troubleshooting Guide](#troubleshooting-guide)

## Prerequisites and Setup

### System Requirements
- **Java 17+** (verified working with OpenJDK 17.0.17)
- **Unix-style environment** (macOS, Linux, or Windows with WSL2)
- **curl** for API testing
- **Git** for repository access

### Verify Your Environment
```bash
# Check Java version
java -version
# Should show: openjdk version "17.x.x" or higher

# Check if you're in the correct directory
pwd
# Should show: /path/to/eclipse_dataspace/Samples

# Verify Gradle wrapper
./gradlew --version
# Should show Gradle 9.0.0
```

## Understanding Dataspace Architecture

### What is a Dataspace?
A **dataspace** is a decentralized ecosystem where organizations can:
- Share data while maintaining full control
- Define precise usage policies
- Enable secure data transfers
- Maintain data sovereignty

### Key Components Explained

| Component | Purpose | Example |
|-----------|---------|---------|
| **Asset** | Data resource you want to share | JSON API, File, Database |
| **Policy** | Rules about data access/usage | "Only on weekdays", "Max 100 requests" |
| **Contract Definition** | Offer linking asset + policy | "Dataset X with Policy Y" |
| **Contract Negotiation** | Agreement process between parties | Consumer requests, Provider accepts |
| **Data Transfer** | Actual secure data movement | Pull/Push data through secure channel |

### Architecture Diagram
```
Provider Connector                    Consumer Connector
┌─────────────────────┐              ┌─────────────────────┐
│  Assets             │              │  Catalog Requests   │
│  ├─ Data Sources    │              │  ├─ Browse offers   │
│  └─ Policies        │◄────────────►│  └─ Negotiate       │
│                     │   DSP        │                     │
│  Contract Offers    │   Protocol   │  Contract Agreements│
│  └─ Available deals │              │  └─ Signed deals    │
│                     │              │                     │
│  Data Plane         │              │  Data Plane         │
│  └─ Actual transfer │◄────────────►│  └─ Receive data    │
└─────────────────────┘              └─────────────────────┘
```

## Building the Basic Learning Path

### Step 1: Basic Connector (Minimal Setup)

#### What it teaches:
- How EDC runtime works
- Essential dependencies
- Basic build process

#### Build and Run:
```bash
# Build the basic connector
./gradlew clean basic:basic-01-basic-connector:build

# Run it (will fail if port 8181 is in use)
java -jar basic/basic-01-basic-connector/build/libs/basic-connector.jar

# If you get "Address already in use", kill the conflicting process:
lsof -i :8181
kill <PID>

# Then run again
java -jar basic/basic-01-basic-connector/build/libs/basic-connector.jar
```

#### Expected Output:
```
INFO Booting EDC runtime
WARNING The runtime is configured as an anonymous participant. DO NOT DO THIS IN PRODUCTION.
INFO HTTPS enforcement it not enabled, please enable it in a production environment
WARNING Config value: no setting found for 'edc.hostname', falling back to default value 'localhost'
WARNING Using the InMemoryVault is not suitable for production scenarios and should be replaced with an actual Vault!
INFO 9 service extensions started
INFO Runtime [UUID] ready
```

#### Key Files:
- `basic/basic-01-basic-connector/build.gradle.kts` - Build configuration
- Contains essential EDC dependencies: `edc.boot`, `edc.runtime.core`, `edc.connector.core`

### Step 2: Health Endpoint Connector (Extensions)

#### What it teaches:
- How to create custom extensions
- HTTP endpoint registration
- Service injection patterns

#### Build and Run:
```bash
# Build the health endpoint connector
./gradlew clean basic:basic-02-health-endpoint:build

# Run in background
java -jar basic/basic-02-health-endpoint/build/libs/connector-health.jar &

# Test the health endpoint
curl http://localhost:8181/api/health
# Expected response: {"response":"I'm alive!"}

# Stop the connector
pkill -f "connector-health.jar"
```

#### Key Extension Files:
**`basic/basic-02-health-endpoint/src/main/java/org/eclipse/edc/extension/health/HealthEndpointExtension.java`**
```java
public class HealthEndpointExtension implements ServiceExtension {
    @Inject
    WebService webService;

    @Override
    public void initialize(ServiceExtensionContext context) {
        webService.registerResource(new HealthApiController(context.getMonitor()));
    }
}
```

**`basic/basic-02-health-endpoint/src/main/java/org/eclipse/edc/extension/health/HealthApiController.java`**
```java
@Path("/")
public class HealthApiController {
    @GET
    @Path("health")
    public String checkHealth() {
        return "{\"response\":\"I'm alive!\"}";
    }
}
```

### Step 3: Configuration-Enabled Connector

#### What it teaches:
- External configuration management
- Properties-based setup
- Port customization

#### Configuration File:
**Location:** `basic/basic-03-configuration/config.properties`
```properties
web.http.port=9191
web.http.path=/api
web.http.management.port=9192
web.http.management.path=/management
edc.samples.basic.03.logprefix=MyLogPrefix
```

#### Build and Run:
```bash
# Build the configuration connector
./gradlew clean basic:basic-03-configuration:build

# Run with external config
java -Dedc.fs.config=basic/basic-03-configuration/config.properties -jar basic/basic-03-configuration/build/libs/filesystem-config-connector.jar &

# Test on configured port
curl http://localhost:9191/api/health
# Expected response: {"response":"I'm alive!"}

# Stop the connector
pkill -f "filesystem-config-connector.jar"
```

## Setting Up Production-Ready Connectors

### Step 4: Build Full Transfer-Capable Connectors

#### What it includes:
- Management APIs for asset/policy creation
- DSP (Dataspace Protocol) endpoints
- Data plane for actual transfers
- Contract negotiation capabilities

```bash
# Build the complete connector
./gradlew transfer:transfer-00-prerequisites:connector:build
```

### Step 5: Configure Provider and Consumer

#### Provider Configuration
**Location:** `transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties`
```properties
# Participant identification
edc.participant.id=provider
edc.dsp.callback.address=http://localhost:19194/protocol

# HTTP endpoints
web.http.port=19191                    # Main API
web.http.path=/api
web.http.management.port=19193         # Management API
web.http.management.path=/management
web.http.protocol.port=19194           # DSP Protocol
web.http.protocol.path=/protocol
web.http.public.port=19291             # Data Plane Public
web.http.public.path=/public
web.http.control.port=19192            # Data Plane Control
web.http.control.path=/control

# Data plane configuration
edc.dataplane.api.public.baseurl=http://localhost:19291/public

# Security (development only)
edc.transfer.proxy.token.signer.privatekey.alias=private-key
edc.transfer.proxy.token.verifier.publickey.alias=public-key
```

#### Consumer Configuration
**Location:** `transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties`
```properties
# Participant identification
edc.participant.id=consumer
edc.dsp.callback.address=http://localhost:29194/protocol

# HTTP endpoints
web.http.port=29191                    # Main API
web.http.path=/api
web.http.management.port=29193         # Management API
web.http.management.path=/management
web.http.protocol.port=29194           # DSP Protocol
web.http.protocol.path=/protocol
web.http.public.port=29291             # Data Plane Public
web.http.public.path=/public
web.http.control.port=29192            # Data Plane Control
web.http.control.path=/control

# Security (development only)
edc.transfer.proxy.token.signer.privatekey.alias=private-key
edc.transfer.proxy.token.verifier.publickey.alias=public-key
```

### Step 6: Start Both Connectors

#### Terminal 1 - Start Provider:
```bash
java -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar
```

#### Terminal 2 - Start Consumer:
```bash
java -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar
```

#### Expected Output for Both:
```
INFO Booting EDC runtime
WARNING Using the InMemoryVault is not suitable for production scenarios and should be replaced with an actual Vault!
INFO HTTPS enforcement it not enabled, please enable it in a production environment
WARNING No TransactionContext registered, a no-op implementation will be used, not suitable for production environments
WARNING No TokenDecorator was registered. The 'scope' field of outgoing protocol messages will be empty
INFO 88 service extensions started
INFO Runtime [UUID] ready
```

### Step 7: Verify Connectors are Running

```bash
# Test Provider Management API (should return 404 or 405 - indicating it's running)
curl -i http://localhost:19193/management/

# Test Consumer Management API
curl -i http://localhost:29193/management/

# Both should return HTML error pages, proving the servers are responding
```

## Complete Dataspace Operations Walkthrough

### Phase 1: Provider Setup (Data Sharing)

#### Step 8: Create Sample Asset File

Create a file for our sample asset:
```bash
# Create the sample asset definition
cat > /tmp/create-sample-asset.json << 'EOF'
{
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
  },
  "@id": "sample-data-2025",
  "properties": {
    "name": "Sample User Data",
    "contenttype": "application/json",
    "description": "Demo dataset for dataspace learning"
  },
  "dataAddress": {
    "type": "HttpData",
    "name": "JSONPlaceholder Users",
    "baseUrl": "https://jsonplaceholder.typicode.com/users",
    "proxyPath": "true"
  }
}
EOF
```

#### Step 9: Create Asset on Provider

```bash
# Create the asset
curl -d @/tmp/create-sample-asset.json \
  -H 'content-type: application/json' \
  http://localhost:19193/management/v3/assets \
  -s

# Expected response:
# {"@type":"IdResponse","@id":"sample-data-2025","createdAt":1763015315307,...}
```

**What this does:**
- Registers a data asset with ID `sample-data-2025`
- Points to JSONPlaceholder API as the data source
- Makes it available for sharing through contracts

#### Step 10: Create Access Policy

```bash
# Use the existing policy file
curl -d @transfer/transfer-01-negotiation/resources/create-policy.json \
  -H 'content-type: application/json' \
  http://localhost:19193/management/v3/policydefinitions \
  -s

# Expected response:
# {"@type":"IdResponse","@id":"aPolicy","createdAt":1763015330000,...}
```

**Policy file contents** (`transfer/transfer-01-negotiation/resources/create-policy.json`):
```json
{
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/",
    "odrl": "http://www.w3.org/ns/odrl/2/"
  },
  "@id": "aPolicy",
  "policy": {
    "@context": "http://www.w3.org/ns/odrl.jsonld",
    "@type": "Set",
    "permission": [],
    "prohibition": [],
    "obligation": []
  }
}
```

**What this does:**
- Creates an open access policy (no restrictions)
- In production, you'd add specific rules here

#### Step 11: Create Contract Definition

```bash
# Link asset to policy
curl -d @transfer/transfer-01-negotiation/resources/create-contract-definition.json \
  -H 'content-type: application/json' \
  http://localhost:19193/management/v3/contractdefinitions \
  -s

# Expected response:
# {"@type":"IdResponse","@id":"1","createdAt":1763015339700,...}
```

**Contract definition file** (`transfer/transfer-01-negotiation/resources/create-contract-definition.json`):
```json
{
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
  },
  "@id": "1",
  "accessPolicyId": "aPolicy",
  "contractPolicyId": "aPolicy",
  "assetsSelector": []
}
```

**What this does:**
- Creates a contract offer linking all assets to the policy
- Empty `assetsSelector` means all assets are included
- Now the Provider is offering data for negotiation

### Phase 2: Consumer Operations (Data Discovery)

#### Step 12: Consumer Fetches Catalog

```bash
# Discover available data
curl -X POST "http://localhost:29193/management/v3/catalog/request" \
  -H 'Content-Type: application/json' \
  -d @transfer/transfer-01-negotiation/resources/fetch-catalog.json \
  -s
```

**Catalog request file** (`transfer/transfer-01-negotiation/resources/fetch-catalog.json`):
```json
{
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
  },
  "counterPartyAddress": "http://localhost:19194/protocol",
  "protocol": "dataspace-protocol-http"
}
```

**Expected response excerpt:**
```json
{
  "@type": "dcat:Catalog",
  "dcat:dataset": [
    {
      "@id": "sample-data-2025",
      "@type": "dcat:Dataset",
      "odrl:hasPolicy": {
        "@id": "MQ==:c2FtcGxlLWRhdGEtMjAyNQ==:ZjBiZWY0ZDQtMDI4YS00YzdmLThmMTItYTQ3YmNkYzVhNTA5",
        "@type": "odrl:Offer",
        ...
      },
      "name": "Sample User Data",
      "description": "Demo dataset for dataspace learning"
    }
  ]
}
```

**What this does:**
- Consumer queries Provider's catalog
- Discovers available datasets and their contract offers
- Note the contract offer ID in `odrl:hasPolicy.@id` - you'll need this next

#### Step 13: Extract Contract Offer ID

From the catalog response, copy the contract offer ID:
```
MQ==:c2FtcGxlLWRhdGEtMjAyNQ==:ZjBiZWY0ZDQtMDI4YS00YzdmLThmMTItYTQ3YmNkYzVhNTA5
```

### Phase 3: Contract Negotiation

#### Step 14: Create Contract Negotiation Request

```bash
# Create negotiation request file
cat > /tmp/negotiate-sample-contract.json << 'EOF'
{
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
  },
  "@type": "ContractRequest",
  "counterPartyAddress": "http://localhost:19194/protocol",
  "protocol": "dataspace-protocol-http",
  "policy": {
    "@context": "http://www.w3.org/ns/odrl.jsonld",
    "@id": "MQ==:c2FtcGxlLWRhdGEtMjAyNQ==:ZjBiZWY0ZDQtMDI4YS00YzdmLThmMTItYTQ3YmNkYzVhNTA5",
    "@type": "Offer",
    "assigner": "provider",
    "target": "sample-data-2025"
  }
}
EOF
```

#### Step 15: Start Contract Negotiation

```bash
# Initiate negotiation
curl -d @/tmp/negotiate-sample-contract.json \
  -X POST \
  -H 'content-type: application/json' \
  http://localhost:29193/management/v3/contractnegotiations \
  -s

# Expected response:
# {"@type":"IdResponse","@id":"43bfb3b5-cecc-43db-adac-ba575c4d49e8",...}
```

**Save the negotiation ID:** `43bfb3b5-cecc-43db-adac-ba575c4d49e8`

#### Step 16: Check Negotiation Status

```bash
# Check if negotiation completed
curl -X GET "http://localhost:29193/management/v3/contractnegotiations/43bfb3b5-cecc-43db-adac-ba575c4d49e8" \
  --header 'Content-Type: application/json' \
  -s
```

**Expected response:**
```json
{
  "@type": "ContractNegotiation",
  "state": "FINALIZED",
  "contractAgreementId": "0e846b35-8cd6-4803-bb0c-bdd63192ece1",
  "assetId": "sample-data-2025",
  ...
}
```

**Save the contract agreement ID:** `0e846b35-8cd6-4803-bb0c-bdd63192ece1`

**What this means:**
- `FINALIZED` state = negotiation successful
- Contract agreement establishes the legal framework for data transfer
- Consumer can now request data transfers under this agreement

### Phase 4: Data Transfer

#### Step 17: Create Transfer Request

```bash
# Create transfer request file
cat > /tmp/start-transfer.json << 'EOF'
{
  "@context": {
    "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
  },
  "@type": "TransferRequest",
  "counterPartyAddress": "http://localhost:19194/protocol",
  "protocol": "dataspace-protocol-http",
  "contractId": "0e846b35-8cd6-4803-bb0c-bdd63192ece1",
  "assetId": "sample-data-2025",
  "dataDestination": {
    "type": "HttpProxy"
  },
  "transferType": "HttpData-PULL"
}
EOF
```

#### Step 18: Initiate Data Transfer

```bash
# Start the transfer
curl -X POST \
  -H 'Content-Type: application/json' \
  -d @/tmp/start-transfer.json \
  http://localhost:29193/management/v3/transferprocesses \
  -s

# Expected response:
# {"@type":"IdResponse","@id":"c0e2453c-1f7a-4cf7-8ab9-c1be9ba227ee",...}
```

**Save the transfer process ID:** `c0e2453c-1f7a-4cf7-8ab9-c1be9ba227ee`

#### Step 19: Check Transfer Status

```bash
# Monitor transfer progress
curl -X GET "http://localhost:29193/management/v3/transferprocesses/c0e2453c-1f7a-4cf7-8ab9-c1be9ba227ee" \
  --header 'Content-Type: application/json' \
  -s
```

**Expected response:**
```json
{
  "@type": "TransferProcess",
  "state": "STARTED" or "COMPLETED",
  "assetId": "sample-data-2025",
  "contractId": "0e846b35-8cd6-4803-bb0c-bdd63192ece1",
  ...
}
```

## Understanding Each Component

### Connector Architecture

```
EDC Connector
├── Control Plane (Business Logic)
│   ├── Management API (Asset/Policy management)
│   ├── Protocol API (DSP communication)
│   └── Contract/Transfer Management
└── Data Plane (Data Movement)
    ├── Public API (Data access)
    └── Control API (Transfer control)
```

### API Endpoints Explained

#### Provider Connector Endpoints:
```
Management API (19193):
├── /management/v3/assets              # Create/manage data assets
├── /management/v3/policydefinitions   # Create/manage access policies
├── /management/v3/contractdefinitions # Create/manage contract offers
└── /management/v3/contractnegotiations # Monitor negotiations

Protocol API (19194):
└── /protocol/*                       # DSP communication with other connectors

Data Plane (19291):
└── /public/*                         # Actual data access endpoint
```

#### Consumer Connector Endpoints:
```
Management API (29193):
├── /management/v3/catalog/request     # Discover provider catalogs
├── /management/v3/contractnegotiations # Initiate/monitor negotiations
└── /management/v3/transferprocesses   # Initiate/monitor transfers

Protocol API (29194):
└── /protocol/*                       # DSP communication with providers

Data Plane (29291):
└── /public/*                         # Access transferred data
```

### Data Flow Sequence

```mermaid
sequenceDiagram
    participant Consumer
    participant Provider
    
    Note over Provider: 1. Setup Phase
    Provider->>Provider: Create Asset
    Provider->>Provider: Create Policy
    Provider->>Provider: Create Contract Definition
    
    Note over Consumer,Provider: 2. Discovery Phase
    Consumer->>Provider: Request Catalog
    Provider->>Consumer: Return Available Offers
    
    Note over Consumer,Provider: 3. Negotiation Phase
    Consumer->>Provider: Send Contract Offer
    Provider->>Provider: Validate Offer
    Provider->>Consumer: Send Agreement/Rejection
    
    Note over Consumer,Provider: 4. Transfer Phase
    Consumer->>Provider: Request Data Transfer
    Provider->>Provider: Setup Data Access
    Provider->>Consumer: Return Access Details
    Consumer->>Provider: Access Data
```

### File Locations Summary

```
Samples/
├── COMPLETE_DATASPACE_TUTORIAL.md          # This file
├── DATASPACE_SETUP_GUIDE.md                # Quick setup reference
├── basic/
│   ├── basic-01-basic-connector/
│   │   └── build.gradle.kts                # Minimal connector build
│   ├── basic-02-health-endpoint/
│   │   ├── build.gradle.kts                # Extension-enabled build
│   │   └── src/main/java/.../              # Extension source code
│   └── basic-03-configuration/
│       ├── build.gradle.kts                # Config-enabled build
│       └── config.properties               # External configuration
└── transfer/
    ├── transfer-00-prerequisites/
    │   ├── connector/build.gradle.kts       # Full connector build
    │   └── resources/configuration/
    │       ├── provider-configuration.properties
    │       └── consumer-configuration.properties
    └── transfer-01-negotiation/resources/
        ├── create-asset.json               # Sample asset definition
        ├── create-policy.json              # Sample policy definition
        ├── create-contract-definition.json # Sample contract definition
        ├── fetch-catalog.json              # Catalog request template
        └── negotiate-contract.json         # Contract negotiation template

Temporary files you create:
├── /tmp/create-sample-asset.json           # Your custom asset
├── /tmp/negotiate-sample-contract.json     # Your negotiation request
└── /tmp/start-transfer.json                # Your transfer request
```

## Troubleshooting Guide

### Common Issues

#### Port Conflicts
```bash
# Error: "Address already in use"
# Solution: Find and kill conflicting processes
lsof -i :8181  # or whatever port is conflicting
kill <PID>
```

#### Connector Not Starting
```bash
# Check Java version
java -version
# Must be 17+

# Check build success
./gradlew clean transfer:transfer-00-prerequisites:connector:build
# Look for "BUILD SUCCESSFUL"
```

#### API Calls Failing
```bash
# Verify connectors are running
curl -i http://localhost:19193/management/
curl -i http://localhost:29193/management/
# Should return HTML (404/405 errors are OK - means server is responding)

# Check connector logs in the terminal where you started them
```

#### Contract Negotiation Issues
- Ensure contract offer ID from catalog exactly matches negotiation request
- Verify both connectors are running and accessible
- Check that asset ID in negotiation matches the one in catalog

#### Transfer Problems
- Verify contract agreement exists and is finalized
- Ensure transfer request uses correct contract agreement ID
- Check that asset is accessible from provider

### Development vs Production

**⚠️ Current setup is for DEVELOPMENT ONLY**

For production deployment, address these warnings:
- Replace `InMemoryVault` with secure vault (HashiCorp Vault, Azure Key Vault, etc.)
- Enable HTTPS enforcement
- Implement proper participant authentication
- Add transaction context for reliability
- Use persistent storage instead of in-memory
- Configure proper security policies

### Next Steps for Learning

1. **Experiment with Policies:**
   - Add time-based restrictions
   - Implement usage counting
   - Create role-based access

2. **Try Different Data Sources:**
   - Local files
   - Database connections
   - Different APIs

3. **Scale Your Dataspace:**
   - Add more participants
   - Create multi-party agreements
   - Implement complex sharing scenarios

4. **Production Preparation:**
   - Security hardening
   - Monitoring setup
   - Performance tuning

## Summary

You've now learned to:
- ✅ Build and run EDC connectors
- ✅ Create and manage data assets
- ✅ Define access policies
- ✅ Negotiate contracts between parties
- ✅ Execute secure data transfers
- ✅ Understand the complete dataspace workflow

This foundation enables you to build production-ready dataspaces for real-world data sharing scenarios while maintaining full control and sovereignty over your data assets.
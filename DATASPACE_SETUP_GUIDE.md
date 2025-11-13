# Eclipse Dataspace Components (EDC) Setup Guide

This guide provides step-by-step instructions to set up a complete dataspace with two EDC connectors for data sharing and transfer.

## Prerequisites

✅ **System Requirements:**
- Java 17+ (verified: OpenJDK 17.0.17)
- Unix-style environment (macOS, Linux, or Windows with WSL2)
- Git for repository access

✅ **Repository:**
- Eclipse EDC Samples repository: `https://github.com/eclipse-edc/Samples`

## Step-by-Step Setup

### 1. Verify Java Installation

```bash
java -version
# Should show Java 17 or higher
```

### 2. Build the Basic Connectors (Learning Path)

Build and test each basic sample to understand EDC concepts:

#### Basic Connector (minimal setup)
```bash
./gradlew clean basic:basic-01-basic-connector:build
java -jar basic/basic-01-basic-connector/build/libs/basic-connector.jar
```

#### Health Endpoint Connector (with extensions)
```bash
./gradlew clean basic:basic-02-health-endpoint:build
java -jar basic/basic-02-health-endpoint/build/libs/connector-health.jar &

# Test the health endpoint
curl http://localhost:8181/api/health
# Expected: {"response":"I'm alive!"}

# Stop the connector
pkill -f "connector-health.jar"
```

#### Configuration-enabled Connector
```bash
./gradlew clean basic:basic-03-configuration:build
java -Dedc.fs.config=basic/basic-03-configuration/config.properties -jar basic/basic-03-configuration/build/libs/filesystem-config-connector.jar &

# Test on configured port
curl http://localhost:9191/api/health
# Expected: {"response":"I'm alive!"}

# Stop the connector
pkill -f "filesystem-config-connector.jar"
```

### 3. Build the Full Dataspace Connectors

Build the complete connector with transfer capabilities:

```bash
./gradlew transfer:transfer-00-prerequisites:connector:build
```

### 4. Start the Dataspace

#### Start Provider Connector
```bash
java -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar &
```

#### Start Consumer Connector (in separate terminal)
```bash
java -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar &
```

## Connector Endpoints

### Provider Connector (`participant-id: provider`)
- **Management API**: `http://localhost:19193/management/`
- **Protocol API**: `http://localhost:19194/protocol/`
- **Public Data Plane**: `http://localhost:19291/public/`
- **Control Plane**: `http://localhost:19192/control/`

### Consumer Connector (`participant-id: consumer`)
- **Management API**: `http://localhost:29193/management/`
- **Protocol API**: `http://localhost:29194/protocol/`
- **Public Data Plane**: `http://localhost:29291/public/`
- **Control Plane**: `http://localhost:29192/control/`

## Configuration Files

### Provider Configuration
Located at: `transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties`

```properties
edc.participant.id=provider
edc.dsp.callback.address=http://localhost:19194/protocol
web.http.port=19191
web.http.path=/api
web.http.management.port=19193
web.http.management.path=/management
web.http.protocol.port=19194
web.http.protocol.path=/protocol
web.http.public.port=19291
web.http.public.path=/public
web.http.control.port=19192
web.http.control.path=/control
edc.dataplane.api.public.baseurl=http://localhost:19291/public
```

### Consumer Configuration
Located at: `transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties`

```properties
edc.participant.id=consumer
edc.dsp.callback.address=http://localhost:29194/protocol
web.http.port=29191
web.http.path=/api
web.http.management.port=29193
web.http.management.path=/management
web.http.protocol.port=29194
web.http.protocol.path=/protocol
web.http.public.port=29291
web.http.public.path=/public
web.http.control.port=29192
web.http.control.path=/control
```

## Verification

Test that both connectors are running:

```bash
# Check if connectors respond (should return 404 or 405, indicating they're running)
curl -i http://localhost:19193/management/
curl -i http://localhost:29193/management/
```

## Runtime Information

- **Service Extensions**: 88 service extensions loaded per connector
- **Storage**: In-memory (development only - not production suitable)
- **Security**: Anonymous participants (development only)
- **Vault**: In-memory vault (not production suitable)

## Next Steps

With your dataspace running, you can:

1. **Create Assets** via Management API
2. **Define Policies** for data usage
3. **Create Contract Definitions** for data sharing agreements
4. **Negotiate Contracts** between connectors
5. **Transfer Data** between participants

## Troubleshooting

### Port Conflicts
If you get "Address already in use" errors:
```bash
# Find and kill processes using the ports
lsof -i :8181  # or other conflicting port
kill <PID>
```

### Configuration Issues
- Ensure Java 17+ is installed
- Verify configuration file paths are correct
- Check that all required ports are available

## Production Considerations

⚠️ **This setup is for development only**. For production:

- Replace in-memory vault with secure vault implementation
- Enable HTTPS enforcement
- Configure proper participant identification
- Implement transaction context
- Use persistent storage solutions
- Configure proper security and authentication
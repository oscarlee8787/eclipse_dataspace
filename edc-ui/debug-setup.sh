#!/bin/bash

echo "🔍 EDC Connector Setup Verification"
echo "================================="

# Check if connectors are running
echo "📡 Testing Connector Connectivity..."

echo -n "Provider Management API (19193): "
if curl -s -m 5 -H "Content-Type: application/json" -X POST http://localhost:19193/management/v3/assets/request -d '{"@context": {"@vocab": "https://w3id.org/edc/v0.0.1/ns/"}}' > /dev/null 2>&1; then
    echo "✅ Online"
else
    echo "❌ Offline"
fi

echo -n "Consumer Management API (29193): "
if curl -s -m 5 -H "Content-Type: application/json" -X POST http://localhost:29193/management/v3/contractnegotiations/request -d '{"@context": {"@vocab": "https://w3id.org/edc/v0.0.1/ns/"}}' > /dev/null 2>&1; then
    echo "✅ Online"
else
    echo "❌ Offline"
fi

echo -n "Provider Protocol API (19194): "
if curl -s -m 5 http://localhost:19194/protocol > /dev/null 2>&1; then
    echo "✅ Online"
else
    echo "❌ Offline"
fi

echo -n "Consumer Protocol API (29194): "
if curl -s -m 5 http://localhost:29194/protocol > /dev/null 2>&1; then
    echo "✅ Online"
else
    echo "❌ Offline"
fi

echo ""
echo "🏗️  Connector JAR Status..."
CONNECTOR_JAR="transfer/transfer-00-prerequisites/connector/build/libs/connector.jar"
if [ -f "$CONNECTOR_JAR" ]; then
    echo "✅ Connector JAR exists: $CONNECTOR_JAR"
else
    echo "❌ Connector JAR missing. Run: ./gradlew transfer:transfer-00-prerequisites:connector:build"
fi

echo ""
echo "📋 Quick Setup Commands:"
echo "1. Build connector:"
echo "   ./gradlew transfer:transfer-00-prerequisites:connector:build"
echo ""
echo "2. Start provider (in one terminal):"
echo "   java -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/provider-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar"
echo ""
echo "3. Start consumer (in another terminal):"
echo "   java -Dedc.fs.config=transfer/transfer-00-prerequisites/resources/configuration/consumer-configuration.properties -jar transfer/transfer-00-prerequisites/connector/build/libs/connector.jar"
echo ""
echo "4. Start UI (in third terminal):"
echo "   cd edc-ui && npm run dev"
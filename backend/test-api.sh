#!/bin/bash

# Backend API Test Script
# Bu script backend API'ni test qiladi

API_URL="http://localhost:5000/api"

echo "🧪 Backend API Test Script"
echo "=========================="
echo ""

# 1. Health Check
echo "1️⃣ Health Check..."
curl -s $API_URL/health | jq '.' || echo "❌ Health check failed"
echo ""
echo ""

# 2. Login Test
echo "2️⃣ Login Test (admin)..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"admin123"}')

echo $LOGIN_RESPONSE | jq '.'

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
  echo "✅ Login successful! Token received."
else
  echo "❌ Login failed!"
  exit 1
fi

echo ""
echo ""

# 3. Get Current User
echo "3️⃣ Get Current User..."
curl -s $API_URL/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo ""

# 4. Get All Districts
echo "4️⃣ Get All Districts..."
curl -s $API_URL/districts \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, name}'
echo ""
echo ""

# 5. Get All Crime Types
echo "5️⃣ Get All Crime Types..."
curl -s $API_URL/crime-types \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {id, name}'
echo ""
echo ""

# 6. Get All Persons
echo "6️⃣ Get All Persons..."
curl -s $API_URL/persons \
  -H "Authorization: Bearer $TOKEN" | jq '.count'
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "Token for manual testing:"
echo $TOKEN

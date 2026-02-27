#!/bin/bash
echo "Setting up Wellness Kits..."

# Install dependencies
echo "Installing root dependencies..."
npm install

# STEP 1: Start MySQL container
echo "Starting MySQL container..."
docker run --name wellness-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=wellness_kits \
  -e MYSQL_USER=wellness_user \
  -e MYSQL_PASSWORD=wellness_pass \
  -p 3306:3306 \
  -d mysql:8.0

echo "Waiting for MySQL to initialize (15 seconds)..."
sleep 15

# STEP 2: # Run seed (drops tables, creates tables, inserts data)
echo "Running database seed (creates tables + inserts test data)..."
cd backend && npm run db:seed
cd ..


echo "Setup complete!"
echo ""
echo "Database seeded with:"
echo "   - 30 test orders from drone_map.html"
echo "   - 5 additional NYC test orders"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Access the app at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000/api"
echo "  Database: localhost:3306 (user: wellness_user, pass: wellness_pass)"
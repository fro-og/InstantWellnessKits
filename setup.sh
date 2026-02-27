#!/bin/bash
echo "Setting up Wellness Kits..."

echo "Installing root dependencies..."
npm install

if [ "$(docker ps -aq -f name=wellness-mysql)" ]; then
    echo "MySQL container already exists."
    
    if [ ! "$(docker ps -q -f name=wellness-mysql)" ]; then
        echo "Starting existing MySQL container..."
        docker start wellness-mysql
    else
        echo "MySQL container is already running."
    fi
else
    echo "Starting new MySQL container..."
    docker run --name wellness-mysql \
      -e MYSQL_ROOT_PASSWORD=rootpass \
      -e MYSQL_DATABASE=wellness_kits \
      -e MYSQL_USER=wellness_user \
      -e MYSQL_PASSWORD=wellness_pass \
      -p 3306:3306 \
      -d mysql:8.0
fi

echo "Waiting for MySQL to initialize (10 seconds)..."
sleep 10

echo "Running database seed (creates tables if needed + adds new test data)..."
cd backend && npm run db:seed
cd ..

if [ $? -eq 0 ]; then
    echo "Database seed completed successfully!"
else
    echo "Database seed failed. Trying alternative method..."
    
    cd backend && npx ts-node src/database/seed.ts
    cd ..
fi

echo ""
echo "Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Access the app at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000/api"
echo "  Database: localhost:3306 (user: wellness_user, pass: wellness_pass)"
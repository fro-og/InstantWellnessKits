# BetterMe Drone Delivery
## Overview
You and a few friends dropped out of university to build a drone delivery startup. After obtaining a license to deliver goods by drone anywhere in New York State, you launched Instant Wellness Kits — compact packages that help people "reset their day" in 20–30 minutes. The service took off fast.
One problem: sales tax was never factored in. The app charged only the kit price, ignoring applicable taxes. The tax authority noticed. The company has 48 hours to fix it.
Given the delivery coordinates (latitude & longitude), this service determines the correct composite sales tax for each order and stores the full breakdown — state, county, city, and special district rates.

## Who Is This For?
This service is currently a prototype — a single unified tool intended to validate the core tax calculation logic and give the delivery company full visibility into their orders.
The primary audience at this stage is the delivery company itself. The admin panel lets the team track all orders, see the tax breakdown for each one, and manually create orders when something goes wrong on the customer side (app crashes, failed submissions, support tickets, etc.).
In the future, the platform can naturally be split into two separate products:

- Customer-facing app — simplified order placement and tracking for end users
- Company dashboard — full order management, tax reporting, manual controls, and analytics for the operations team

The core technological value of this prototype is automated tax calculation: given any delivery point in New York State, the system resolves the exact composite tax rate and applies it correctly. This alone is what the company needs most right now — a reliable, auditable record of every order's tax liability.

## The Problem
New York State has a complex, multi-jurisdictional sales tax system. The applicable composite rate depends on where the delivery is made, not where the business is located. For example, a delivery inside NYC is taxed at 8.875%, while deliveries in other counties or cities carry different rates.
The mobile app collects GPS coordinates at checkout — that data is already available. This service uses those coordinates to resolve the correct tax jurisdiction and apply the right rate.

## Features
### Orders

- Create an order manually by providing latitude, longitude, and subtotal (kit price before tax). The system instantly calculates and stores the full tax breakdown.
- Import orders — upload a file with order data; the system processes each row, calculates taxes, and saves everything in bulk.
- View all orders in a paginated, sortable table with calculated tax details.

### Filtering
#### Filter the orders list by:

- Date range — from / to
- Min / Max total amount
- Location (jurisdiction / area)

### Tax Breakdown per Order
#### Each order stores:

- composite_tax_rate — e.g. 0.08875
- tax_amount — calculated tax in dollars
- total_amount — subtotal + tax
- Breakdown: state_rate, county_rate, city_rate, special_rates
- jurisdictions — which tax districts were applied

### Authentication

- Sign in with Google account via OAuth
- Sign out

---
## Technical details

### Database Setup & Data Persistence

The project uses Docker with MySQL 8.0 for database management. All data is persisted using Docker volumes:

- **Database Container**: `wellness-mysql` running on port 3306
- **Volume**: `instantwellnesskits_mysql_data` - persists data even after container removal
- **Current Data**: 11,222 orders with 30,077 tax breakdown records
- **Initial Setup**: Tables are created via migration script (`npm run db:migrate`)

### Data Flow
1. User creates order via web interface or CSV import
2. Backend calculates tax based on coordinates using point-in-polygon lookup
3. Order and tax breakdown saved to MySQL with transaction safety
4. Data persists in Docker volume
5. Frontend displays orders with tax breakdown and filtering

### Tax Calculation Logic
The system determines tax rates by:
- Taking GPS coordinates (latitude, longitude)
- Finding which county/city contains that point using GeoJSON boundary data
- Looking up pre-configured tax rates for that jurisdiction
- Calculating composite rate = state_rate (4%) + county_rate (0-4%) + city_rate (0-4.5%)

### Features

- CSV Import: Upload order data with coordinates for bulk processing
- Manual Order Creation: Create single orders with instant tax calculation
- Order Dashboard: View all orders with pagination, filtering, and tax breakdown
- Smart Tax Calculation: Automatic composite tax rate based on location (state + county + city)
- Google OAuth: Secure admin access (optional)

### Tech Stack

#### Backend
- Node.js + Express - REST API server
- TypeScript - Type safety
- MySQL 8.0 - Relational database
- Docker - Containerized database
- mysql2 - MySQL driver with promises
- csv-parse - CSV parsing
- Helmet + CORS + Rate Limiting - Security

#### Frontend
- React 18 - UI library
- TypeScript - Type safety
- React Query - Data fetching & caching
- React Router v6 - Navigation
- Tailwind CSS - Styling
- Google OAuth - Authentication

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Docker** (for MySQL container)
- **Git**

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/InstantWellnessKits.git
cd InstantWellnessKits
./setup.sh # for Linux
./setup.bat # for Windows
```

2. Start the app
```bash
npm run dev  # for Linux

# -----------
cd ..
$env:PORT=3000; npm start # for Windows

```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Database: localhost:3306 (user: wellness_user, password: wellness_pass)

### Database management

```bash
# create tables
npm run db:migrate

# load test data
npm run db:seed

# backup database
docker exec wellness-mysql mysqldump -u wellness_user -pwellness_pass wellness_kits > backup.sql

# restore database
cat backup.sql | docker exec -i wellness-mysql mysql -u wellness_user -pwellness_pass wellness_kits
```

### Stop application
```bash
pkill -f "ts-node|react-scripts"
docker stop wellness-mysql
```

### Extra info (for debugging)
```bash
# start docker
docker start wellness-mysql
docker stop wellness-mysql

# start backend
npm run backend:dev

# start frontend
PORT=3000 npm start

# db setup
npm run db:seed
npm run db:migrate

# check db content
docker exec -it wellness-mysql mysql -u wellness_user -pwellness_pass wellness_kits -e "SELECT COUNT(*) FROM orders; SELECT * FROM orders LIMIT 5;"

# backup db data
docker exec wellness-mysql mysqldump -u wellness_user -pwellness_pass wellness_kits > backup_$(date +%Y%m%d).sql

# restore db from backup
cat backup_20250227.sql | docker exec -i wellness-mysql mysql -u wellness_user -pwellness_pass wellness_kits
```
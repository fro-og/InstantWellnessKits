@echo off
setlocal enabledelayedexpansion

echo Setting up Wellness Kits...
echo.

echo Installing root dependencies...
call npm install
echo.

docker ps -aq -f name=wellness-mysql >nul 2>&1
if %errorlevel% equ 0 (
    echo MySQL container already exists.
    
    docker ps -q -f name=wellness-mysql >nul 2>&1
    if %errorlevel% neq 0 (
        echo Starting existing MySQL container...
        docker start wellness-mysql
    ) else (
        echo MySQL container is already running.
    )
) else (
    echo Starting new MySQL container...
    docker run --name wellness-mysql ^
      -e MYSQL_ROOT_PASSWORD=rootpass ^
      -e MYSQL_DATABASE=wellness_kits ^
      -e MYSQL_USER=wellness_user ^
      -e MYSQL_PASSWORD=wellness_pass ^
      -p 3306:3306 ^
      -d mysql:8.0
)
echo.

echo Waiting for MySQL to initialize...
timeout /t 5 /nobreak >nul

REM Test MySQL connection
set MAX_RETRIES=20
set RETRY_COUNT=0

:retry_connection
docker exec wellness-mysql mysql -u wellness_user -pwellness_pass -e "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! geq %MAX_RETRIES% (
        echo Failed to connect to MySQL. Exiting.
        exit /b 1
    )
    echo MySQL not ready yet... waiting 2 seconds
    timeout /t 2 /nobreak >nul
    goto retry_connection
)
echo MySQL is ready!
echo.

echo Running database seed...
cd backend
set DB_HOST=127.0.0.1
set DB_PORT=3306
call npm run db:seed
set SEED_EXIT=%errorlevel%
cd ..

if %SEED_EXIT% equ 0 (
    echo Database seed completed successfully!
) else (
    echo Database seed failed. Trying alternative method...
    cd backend
    set DB_HOST=127.0.0.1
    set DB_PORT=3306
    call npx ts-node src/database/seed.ts
    cd ..
)

echo.
echo ========================================
echo Database setup complete!
echo ========================================
echo.
echo To start the app:
echo   1. Backend: cd backend && npm run backend:dev
echo   2. Frontend: $env:PORT=3000; npm start
echo   3. Open http://localhost:3000
echo.
pause

@echo off
setlocal enabledelayedexpansion

echo Setting up Wellness Kits...
echo.

echo Installing root dependencies...
call npm install
echo.

docker ps -aq -f name=wellness-mysql >nul 2>&1
if %errorlevel% equ 0 (
    echo MySQL container already exists.
    
    docker ps -q -f name=wellness-mysql >nul 2>&1
    if %errorlevel% neq 0 (
        echo Starting existing MySQL container...
        docker start wellness-mysql
    ) else (
        echo MySQL container is already running.
    )
) else (
    echo Starting new MySQL container...
    docker run --name wellness-mysql ^
      -e MYSQL_ROOT_PASSWORD=rootpass ^
      -e MYSQL_DATABASE=wellness_kits ^
      -e MYSQL_USER=wellness_user ^
      -e MYSQL_PASSWORD=wellness_pass ^
      -p 3306:3306 ^
      -d mysql:8.0
)
echo.

echo Waiting for MySQL to initialize...
timeout /t 5 /nobreak >nul

REM Test MySQL connection
set MAX_RETRIES=20
set RETRY_COUNT=0

:retry_connection
docker exec wellness-mysql mysql -u wellness_user -pwellness_pass -e "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! geq %MAX_RETRIES% (
        echo Failed to connect to MySQL. Exiting.
        exit /b 1
    )
    echo MySQL not ready yet... waiting 2 seconds
    timeout /t 2 /nobreak >nul
    goto retry_connection
)
echo MySQL is ready!
echo.

echo Running database seed...
cd backend
set DB_HOST=127.0.0.1
set DB_PORT=3306
call npm run db:seed
set SEED_EXIT=%errorlevel%
cd ..

if %SEED_EXIT% equ 0 (
    echo Database seed completed successfully!
) else (
    echo Database seed failed. Trying alternative method...
    cd backend
    set DB_HOST=127.0.0.1
    set DB_PORT=3306
    call npx ts-node src/database/seed.ts
    cd ..
)

echo.
echo ========================================
echo Starting backend server...
echo ========================================
echo.

cd backend
start cmd /k "npm run backend:dev"
cd ..


echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Backend is running in a new window.
echo.
echo To start the frontend, open a NEW PowerShell window and run:
echo   cd %cd%
echo   $env:PORT=3000; npm start
echo.
echo Then open http://localhost:3000 in your browser
echo.
pause

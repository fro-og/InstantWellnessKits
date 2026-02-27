# BetterMe Drone Delivery
## Business Requirements & Feature Proposals
*Research & Business Analysis — Working Document*

---

## 1. Sales Tax Calculation

**Business Need**

> *(залиш тут порожнє місце — пропишу згодом)*

---

## 2. User Accounts & Order Tracking

**Business Need**

Сервіс наразі не надає користувачам жодної можливості відстежувати свої замовлення після оформлення. Це створює фрустрацію та збільшує навантаження на підтримку. Необхідно впровадити легку систему акаунтів.

**Функціональні вимоги**

- Реєстрація та авторизація через email або номер телефону (без зайвих полів — мінімально достатньо для сервісу такого типу).
- Акаунт зберігає історію замовлень з прив'язкою до номера замовлення та статусу доставки.
- Lifecycle статусів: `Прийнято` → `Дрон призначено` → `В дорозі` → `Доставлено` -- прописано в комірці самого замовлення, не займає лишнього місця, підсвічується кольором для інтуїтивного розуміння
- Можливість переглянути деталі кожного замовлення: тип wellness kit, час, адреса, сума.

> **Рекомендація:** Не варто перевантажувати акаунт зайвою функціональністю на старті. Достатньо email + список замовлень. Соціальний вхід (Google/Apple) значно підвищить конверсію реєстрації.

---

## 3. Гейміфікація через інтерактивну карту

**Business Need**

Очікування доставки — критична точка втрати користувача. Дослідження UX показують, що видиме очікування (коли людина бачить процес) суттєво знижує сприйняту тривалість і фрустрацію — ефект відомий як **"дзеркало в ліфті"**: встановлення дзеркал усунуло скарги на час очікування без зміни швидкості ліфта. Карта з рухом дрону є прямим аналогом цього рішення для нашого сервісу.

**Функціональні вимоги**

- Після оформлення замовлення користувач бачить інтерактивну карту з анімованим рухом дрону до точки доставки в реальному часі.
- На карті відображається лише власне замовлення — чужі маршрути не видно для захисту приватності.
- Кожне замовлення має публічний **Order ID**. Будь-хто може ввести чужий ID у поле пошуку й побачити статус доставки (без особистих даних).
  - *Use case: користувач ділиться ID з другом, той відстежує доставку.*
- В акаунті список усіх замовлень з ID — зручно копіювати та ділитися.
- Карта показує розрахунковий час прибуття (ETA) з оновленням в реальному часі.

> **Рекомендація:** Можна додати мікровзаємодії: звук дрону при наближенні, анімацію приземлення, коротке "вау-повідомлення" при доставці. Це формує емоційну прив'язаність до бренду.

---

## 4. Доступність для людей з порушеннями зору

**Business Need**

Понад 2.2 мільярди людей у світі мають порушення зору різного ступеня. Ігнорування цієї аудиторії — це не лише втрачений ринок, а й юридичний ризик: у США сайти зобов'язані відповідати стандартам ADA. Відповідність стандартам доступності також покращує SEO та загальну якість коду.

**Стандарти та ресурси**

- Дотримуватись стандарту **WCAG 2.2 рівня AA** — міжнародний технічний стандарт доступності веб-контенту від W3C.
- Офіційна документація: [W3C WAI — WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)
- Практичний гайд для розробників: [Web Accessibility for the Visually Impaired](https://accessibilityassistant.com/blog/accessibility-insights/web-accessibility-for-visually-impaired/)

**Ключові вимоги до реалізації**

- Контрастність тексту до фону — мінімум 4.5:1 для звичайного тексту, 3:1 для великого.
- Всі інтерактивні елементи (кнопки, форми, карта) мають бути доступні з клавіатури без миші.
- Alt-тексти для всіх зображень та іконок — для зчитувачів екрану (screen readers).
- Карта має мати текстову альтернативу: статус доставки, ETA, адреса — доступні без візуалізації.
- Форми з чіткими `label`-елементами та повідомленнями про помилки для screen reader.

> **Рекомендація:** Доступність найдешевше закласти на етапі проєктування, а не виправляти постфактум. Після релізу провести аудит через [Lighthouse](https://developer.chrome.com/docs/lighthouse/) (вбудований у Chrome DevTools) та [WAVE](https://wave.webaim.org/).

---

## 5. Публічна статистика замовлень

**Business Need**

Публічна статистика виконує кілька функцій: підвищує довіру до бренду, формує FOMO, демонструє масштаб сервісу новим користувачам і дає медіа привід для згадок. Це низьковитратний механізм залучення, що не потребує рекламного бюджету.

**Метрики для відображення**

- Загальна кількість виконаних замовлень (лічильник з початку роботи сервісу).
- Середня кількість замовлень на день (ковзне середнє за останні 30 днів).
- Рекордний день — дата та кількість замовлень.
- Популярні зони доставки — топ-3 райони або zip-коди (без особистих даних).
- Середній час доставки — агреговано по всіх замовленнях.
- Кількість активних дронів у реальному часі (якщо технічно доступно).

**Формат подачі**

- Окрема секція на головній сторінці або дашборд — *"By the numbers"*.
- Анімовані лічильники при завантаженні сторінки для привернення уваги.
- Оновлення статистики в реальному часі або раз на 24 години.

> **Рекомендація:** Розглянути публікацію щотижневого *"State of Deliveries"* у форматі інфографіки для соціальних мереж — безкоштовний контент-маркетинг, що генерується автоматично з наявних даних.

---

## Додаткові рекомендації

**Рейтинг і відгуки**
Після кожної доставки — короткий (1 питання) feedback-запит. Сукупний рейтинг підвищує конверсію нових користувачів.

**Реферальна програма**
Можливість поділитися Order ID органічно відкриває шлях до реферальної механіки: *"відстеж замовлення друга та отримай знижку на перший власний Kit"*.

**Офлайн-режим PWA**
Сторінка трекінгу має бути доступна як Progressive Web App з можливістю встановлення на домашній екран — для швидкого доступу під час очікування доставки.

**Мультимовність**
Нью-Йорк — багатомовне місто. Підтримка іспанської та китайської мов на старті відкриє значний додатковий сегмент ринку з мінімальними витратами.

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
./setup.sh
```

2. Start the app
```bash
npm run dev
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
```
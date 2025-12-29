# Restaurant POS System - Wok'N'Cats

A complete, production-ready Point of Sale (POS) system for restaurants built with modern technologies.

## 🚀 Features

### Backend (FastAPI + PostgreSQL)
- ✅ User authentication (JWT-based) with admin and staff roles
- ✅ Complete CRUD operations for menu items
- ✅ Order management with real-time updates via WebSockets
- ✅ Table management system
- ✅ Payment processing (Cash, Card, Split Payment)
- ✅ **Coupon & Discount System** 🎟️
- ✅ **Cross-selling & Product Recommendations** 🎯
- ✅ **Marketing Automation (SMS/Email)** 📧
- ✅ **Loyalty Program** 🏆
- ✅ RESTful API with auto-generated documentation
- ✅ Database migrations with SQLAlchemy
- ✅ Image upload support for menu items

### Frontend (React)
- ✅ Admin Dashboard with sales statistics and charts
- ✅ Menu Management (add, edit, delete items with images)
- ✅ Order Management (track and update order status)
- ✅ Table Management (visual table layout)
- ✅ Staff Interface for taking orders
- ✅ Collapsible sidebar with search
- ✅ Split payment (card + cash) with auto-calculation
- ✅ Responsive design for tablets and desktops
- ✅ Real-time order updates
- ✅ Beautiful UI with Tailwind CSS

### Database (PostgreSQL)
- ✅ Users (authentication and roles)
- ✅ Menu Items (with categories and images)
- ✅ Orders (with items, status, and payment info)
- ✅ Tables (status and capacity management)
- ✅ Payments (transaction records)
- ✅ Coupons (discount codes and promotions)
- ✅ Product Recommendations (cross-sell, upsell)
- ✅ Customer Preferences (order history, favorites)
- ✅ Marketing Campaigns (automated messaging)
- ✅ Loyalty Program (points, tiers, rewards)

## 📋 Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- Git (optional)

## 🛠️ Installation & Setup

### 1. Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd Projekt

# Or simply extract the ZIP file
```

### 2. Configure Environment Variables

Copy the example environment file and configure it:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Then edit .env with your preferred editor
notepad .env
```

**Important:** Update the following in `.env`:
- `SECRET_KEY`: Change to a secure random string (minimum 32 characters)
- Payment keys (optional): Add your Stripe/PayPal credentials if needed

### 3. Start the Application

```bash
# Start all services (database, backend, frontend)
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

**First-time setup takes 5-10 minutes** to download images and install dependencies.

### 4. Access the Application

Once running, you can access:

- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

### 5. Login

Use these default credentials to login:

**Admin Account:**
- Login: `admin`
- Password: `admin123`

**Staff Account:**
- Login: `staff`
- Password: `staff123`

**Note:** These default accounts will be created automatically on first run (see step 6).

## 🔧 Initial Database Setup

### Create Default Users and Sample Data

After starting the services, run this script to populate the database:

```bash
# Windows PowerShell
docker-compose exec backend python -c "
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.menu_item import MenuItem
from app.models.table import Table, TableStatus
from app.core.security import get_password_hash

db = SessionLocal()

# Create admin user
admin = User(
    name='Admin User',
    email='admin@restaurant.com',
    password_hash=get_password_hash('admin123'),
    role=UserRole.ADMIN
)
db.add(admin)

# Create staff user
staff = User(
    name='Staff User',
    email='staff@restaurant.com',
    password_hash=get_password_hash('staff123'),
    role=UserRole.STAFF
)
db.add(staff)

# Create sample menu items
menu_items = [
    MenuItem(name='Margherita Pizza', description='Classic tomato and mozzarella', price=12.99, category='Pizza', available=1),
    MenuItem(name='Pepperoni Pizza', description='Tomato, mozzarella, and pepperoni', price=14.99, category='Pizza', available=1),
    MenuItem(name='Caesar Salad', description='Fresh romaine with caesar dressing', price=8.99, category='Salad', available=1),
    MenuItem(name='Spaghetti Carbonara', description='Pasta with bacon and cream sauce', price=13.99, category='Pasta', available=1),
    MenuItem(name='Grilled Salmon', description='Fresh salmon with vegetables', price=18.99, category='Main Course', available=1),
    MenuItem(name='Tiramisu', description='Classic Italian dessert', price=6.99, category='Dessert', available=1),
    MenuItem(name='Coca Cola', description='Soft drink', price=2.99, category='Beverages', available=1),
    MenuItem(name='Coffee', description='Espresso coffee', price=3.49, category='Beverages', available=1),
]
db.add_all(menu_items)

# Create sample tables
for i in range(1, 11):
    table = Table(number=i, capacity=4, status=TableStatus.AVAILABLE)
    db.add(table)

db.commit()
print('✅ Database initialized with sample data!')
"
```

## 📖 Usage Guide

### Admin Dashboard
1. Login with admin credentials
2. View sales statistics and charts
3. Navigate to different sections:
   - **Menu**: Add/edit/delete menu items
   - **Orders**: View and manage all orders
   - **Tables**: Add/edit tables and their status

### Staff Interface
1. Login with staff credentials
2. Select a table
3. Browse menu by categories
4. Add items to cart
5. Adjust quantities
6. Place order

### Order Management
- Orders automatically appear in the Order Management page
- Update order status: Pending → Preparing → Ready → Completed
- Track payment status
- View order history

## 🎯 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get token
- `GET /api/v1/auth/me` - Get current user info

#### Menu Items
- `GET /api/v1/menu` - Get all menu items
- `POST /api/v1/menu` - Create menu item (admin)
- `PUT /api/v1/menu/{id}` - Update menu item (admin)
- `DELETE /api/v1/menu/{id}` - Delete menu item (admin)

#### Orders
- `GET /api/v1/orders` - Get all orders
- `POST /api/v1/orders` - Create new order
- `PUT /api/v1/orders/{id}` - Update order
- `GET /api/v1/orders/stats` - Get order statistics (admin)

#### Tables
- `GET /api/v1/tables` - Get all tables
- `POST /api/v1/tables` - Create table (admin)
- `PUT /api/v1/tables/{id}` - Update table

#### Payments
- `POST /api/v1/payments` - Create payment record
- `POST /api/v1/payments/stripe/create-payment-intent` - Stripe integration
- `POST /api/v1/payments/paypal/create-payment` - PayPal integration

## 🔌 Payment Integration

### Stripe Setup
1. Get your API keys from https://stripe.com
2. Update `.env`:
   ```
   STRIPE_API_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```
3. Restart the backend: `docker-compose restart backend`

### PayPal Setup
1. Get your credentials from https://developer.paypal.com
2. Update `.env`:
   ```
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_MODE=sandbox
   ```
3. Restart the backend: `docker-compose restart backend`

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# Rebuild after code changes
docker-compose up --build

# Remove all containers and volumes (fresh start)
docker-compose down -v
```

## 🔍 Troubleshooting

### Port Already in Use
If ports 3000, 8000, or 5432 are already in use:

1. Stop conflicting services, or
2. Edit `docker-compose.yml` to use different ports:
   ```yaml
   ports:
     - "3001:3000"  # Frontend
     - "8001:8000"  # Backend
     - "5433:5432"  # Database
   ```

### Database Connection Issues
```bash
# Restart the database
docker-compose restart postgres

# Check if database is healthy
docker-compose ps
```

### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend
```

### Backend Errors
```bash
# Check backend logs
docker-compose logs backend

# Access backend shell for debugging
docker-compose exec backend /bin/sh
```

## 📁 Project Structure

```
Projekt/
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   │   └── v1/          # API version 1
│   │   │       ├── auth.py  # Authentication
│   │   │       ├── menu_items.py
│   │   │       ├── orders.py
│   │   │       ├── tables.py
│   │   │       ├── payments.py
│   │   │       └── users.py
│   │   ├── core/            # Core functionality
│   │   │   ├── config.py    # Configuration
│   │   │   ├── database.py  # Database setup
│   │   │   └── security.py  # Security utilities
│   │   ├── models/          # Database models
│   │   │   ├── user.py
│   │   │   ├── menu_item.py
│   │   │   ├── order.py
│   │   │   ├── table.py
│   │   │   └── payment.py
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── websocket/       # WebSocket manager
│   │   └── main.py          # Application entry point
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile
├── frontend/                # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   └── Layout.js
│   │   ├── context/         # React context
│   │   │   └── AuthContext.js
│   │   ├── pages/           # Page components
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── MenuManagement.js
│   │   │   ├── OrderManagement.js
│   │   │   ├── TableManagement.js
│   │   │   └── StaffInterface.js
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── uploads/                 # File uploads (menu images)
├── docker-compose.yml       # Docker orchestration
├── .env.example            # Environment variables template
├── .env                    # Environment variables (create this)
├── .gitignore
└── README.md               # This file
```

## 🚀 Deployment

### Production Checklist
- [ ] Change `SECRET_KEY` in `.env` to a strong random string
- [ ] Use production database credentials
- [ ] Set `REACT_APP_API_URL` to your production API URL
- [ ] Configure proper CORS origins in backend
- [ ] Set up HTTPS/SSL certificates
- [ ] Enable payment gateway production mode
- [ ] Set up proper logging
- [ ] Configure backup strategy for database

### Deploy to Cloud
This application can be deployed to:
- AWS (EC2, ECS, or Elastic Beanstalk)
- Google Cloud Platform (Cloud Run, GKE)
- Azure (Container Instances, AKS)
- DigitalOcean (App Platform, Kubernetes)
- Heroku
- Any VPS with Docker support

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- SQL injection protection (SQLAlchemy ORM)
- CORS configuration
- Input validation with Pydantic
- Secure payment processing

## 🔄 Future Enhancements

- [ ] Delivery platform integration (Uber Eats, Glovo)
- [ ] Kitchen display system (KDS)
- [ ] Inventory management
- [ ] Employee shift management
- [ ] Customer loyalty program
- [ ] Mobile app (React Native)
- [ ] Receipt printing
- [ ] Multi-location support
- [ ] Advanced reporting and analytics

## 📝 License

This project is provided as-is for educational and commercial use.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation at http://localhost:8000/docs
3. Check Docker logs: `docker-compose logs`

## 📞 Contact

For support or inquiries, please contact the development team.

---

**Built with ❤️ using FastAPI, React, PostgreSQL, and Docker**

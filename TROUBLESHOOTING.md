# Troubleshooting Guide

## Common Issues and Solutions

### 1. Docker Container Won't Start

**Symptom:** `docker-compose up` fails or containers exit immediately

**Solutions:**

```powershell
# Check if Docker Desktop is running
docker --version

# View container logs
docker-compose logs

# Check specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Remove all containers and volumes, start fresh
docker-compose down -v
docker-compose up --build
```

**If port conflicts:**
```powershell
# Check what's using ports 3000, 8000, 5432
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Kill process by PID (replace 1234 with actual PID)
taskkill /PID 1234 /F
```

### 2. Database Connection Failed

**Symptom:** Backend shows "could not connect to server" or "Connection refused"

**Solutions:**

```powershell
# Check if PostgreSQL container is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Wait for database to be ready (it takes ~30 seconds on first run)
docker-compose up -d postgres
Start-Sleep -Seconds 30
docker-compose up -d backend

# Verify database health
docker-compose exec postgres pg_isready -U postgres
```

### 3. Frontend Can't Connect to Backend

**Symptom:** API calls fail with CORS errors or connection refused

**Solutions:**

```powershell
# Check if backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Verify backend is responding
curl http://localhost:8000/health
# Or in PowerShell:
Invoke-WebRequest -Uri http://localhost:8000/health

# Restart backend
docker-compose restart backend

# Check REACT_APP_API_URL is correct
# Should be http://localhost:8000 (not https)
```

### 4. Login Fails with "Incorrect email or password"

**Symptom:** Can't login even with correct credentials

**Solutions:**

```powershell
# Reinitialize database
.\init-db.ps1

# Manually create admin user
docker-compose exec -T backend python -c "
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

db = SessionLocal()
user = db.query(User).filter(User.email == 'admin@restaurant.com').first()
if user:
    user.password_hash = get_password_hash('admin123')
    db.commit()
    print('Password reset')
db.close()
"
```

### 5. JWT Token Errors

**Symptom:** "Could not validate credentials" or "Token expired"

**Solutions:**

```powershell
# Clear browser localStorage
# Open browser console (F12) and run:
# localStorage.clear()

# Check SECRET_KEY in .env is at least 32 characters
# Update .env and restart backend
docker-compose restart backend

# Verify token expiration time in .env
# ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 6. Images Not Uploading

**Symptom:** Menu item image upload fails

**Solutions:**

```powershell
# Check uploads directory exists and has permissions
New-Item -ItemType Directory -Force -Path uploads/menu_items

# Verify backend can write to uploads
docker-compose exec backend ls -la /app/uploads

# Restart backend
docker-compose restart backend
```

### 7. WebSocket Connection Failed

**Symptom:** Real-time updates not working

**Solutions:**

```powershell
# Check if WebSocket port is accessible
# Browser console should show: ws://localhost:8000/ws/...

# Disable browser extensions that might block WebSocket
# Try in incognito mode

# Check backend logs for WebSocket errors
docker-compose logs backend | Select-String "websocket"

# Restart backend
docker-compose restart backend
```

### 8. npm Install Fails

**Symptom:** Frontend container fails to build with npm errors

**Solutions:**

```powershell
# Clear npm cache and rebuild
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### 9. Python Package Installation Fails

**Symptom:** Backend container fails to build with pip errors

**Solutions:**

```powershell
# Clear build cache and rebuild
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d

# If specific package fails, update requirements.txt versions
# Edit backend/requirements.txt and rebuild
```

### 10. Permission Denied Errors (Linux/Mac)

**Symptom:** Cannot execute scripts or access files

**Solutions:**

```bash
# Make scripts executable
chmod +x init-db.sh

# Fix file ownership
sudo chown -R $USER:$USER .

# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

### 11. Slow Performance

**Symptom:** Application is slow or unresponsive

**Solutions:**

```powershell
# Check Docker resource allocation
# Docker Desktop -> Settings -> Resources
# Increase CPU and Memory if needed

# Check container resource usage
docker stats

# Restart all containers
docker-compose restart

# Clear old Docker images and volumes
docker system prune -a --volumes
```

### 12. Database Migration Issues

**Symptom:** Database schema doesn't match models

**Solutions:**

```powershell
# Drop and recreate database
docker-compose down -v
docker-compose up -d postgres
Start-Sleep -Seconds 30
docker-compose up -d backend
.\init-db.ps1
```

### 13. CORS Errors

**Symptom:** Browser console shows "CORS policy" errors

**Solutions:**

```powershell
# Verify backend CORS settings in backend/app/main.py
# Should include frontend URL in allow_origins

# Restart backend after changes
docker-compose restart backend

# Check API is accessible
curl http://localhost:8000/api/v1/menu
```

### 14. Page Not Found (404)

**Symptom:** Frontend shows 404 or blank page

**Solutions:**

```powershell
# Check frontend logs
docker-compose logs frontend

# Verify frontend is running
docker-compose ps frontend

# Rebuild frontend
docker-compose up --build frontend

# Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
```

### 15. Payment Integration Issues

**Symptom:** Stripe or PayPal payments fail

**Solutions:**

```powershell
# Verify API keys in .env
# Stripe: sk_test_... (not pk_test_...)
# PayPal: Sandbox credentials

# Check backend logs for payment errors
docker-compose logs backend | Select-String "stripe|paypal"

# Restart backend after updating .env
docker-compose restart backend

# Test with card payments or cash first
```

## Debug Mode

### Enable Verbose Logging

**Backend:**
```python
# In backend/app/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend:**
```javascript
// In frontend/src/services/api.js
api.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### Access Container Shell

```powershell
# Backend shell
docker-compose exec backend /bin/sh

# Frontend shell
docker-compose exec frontend /bin/sh

# Database shell
docker-compose exec postgres psql -U postgres -d restaurant_pos
```

### Check Database Contents

```powershell
docker-compose exec postgres psql -U postgres -d restaurant_pos -c "SELECT * FROM users;"
docker-compose exec postgres psql -U postgres -d restaurant_pos -c "SELECT * FROM menu_items;"
docker-compose exec postgres psql -U postgres -d restaurant_pos -c "SELECT * FROM orders;"
```

## Health Checks

### Backend Health Check
```powershell
# Should return: {"status": "healthy"}
curl http://localhost:8000/health
# Or
Invoke-WebRequest -Uri http://localhost:8000/health
```

### Database Health Check
```powershell
docker-compose exec postgres pg_isready -U postgres
# Should return: postgres:5432 - accepting connections
```

### All Services Status
```powershell
docker-compose ps
# All services should show "Up" status
```

## Performance Optimization

### 1. Database Performance

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Add indexes
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### 2. Backend Performance

```python
# Use pagination
@router.get("/")
async def get_items(skip: int = 0, limit: int = 100):
    return db.query(Model).offset(skip).limit(limit).all()

# Use select_in for relationships
order = db.query(Order).options(selectinload(Order.table)).first()
```

### 3. Frontend Performance

```javascript
// Implement caching
const { data, isLoading } = useQuery('menu', menuAPI.getAll, {
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

## Getting Help

### Collect Debug Information

```powershell
# Create debug report
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$debugFile = "debug_$timestamp.txt"

"=== Docker Compose Status ===" | Out-File $debugFile
docker-compose ps | Out-File $debugFile -Append

"=== Backend Logs ===" | Out-File $debugFile -Append
docker-compose logs --tail=100 backend | Out-File $debugFile -Append

"=== Frontend Logs ===" | Out-File $debugFile -Append
docker-compose logs --tail=100 frontend | Out-File $debugFile -Append

"=== Database Logs ===" | Out-File $debugFile -Append
docker-compose logs --tail=100 postgres | Out-File $debugFile -Append

Write-Host "Debug report saved to: $debugFile"
```

### Contact Support Checklist

When reporting issues, include:
- [ ] Error message (exact text)
- [ ] Steps to reproduce
- [ ] Docker logs (from debug report)
- [ ] Browser console errors (F12)
- [ ] Operating system and version
- [ ] Docker version
- [ ] What you've already tried

## Quick Reset (Nuclear Option)

**Warning: This deletes ALL data!**

```powershell
# Stop and remove everything
docker-compose down -v

# Remove all Docker images
docker system prune -a --volumes

# Start fresh
docker-compose up --build -d

# Wait for services to start
Start-Sleep -Seconds 60

# Initialize database
.\init-db.ps1

# Access application
start http://localhost:3000
```

## Preventive Maintenance

### Daily Checks
```powershell
# Check container health
docker-compose ps

# Check disk space
docker system df
```

### Weekly Maintenance
```powershell
# Backup database
docker-compose exec postgres pg_dump -U postgres restaurant_pos > backup.sql

# Clean old logs
docker-compose logs --tail=0 > $null

# Update dependencies (test first!)
docker-compose pull
```

### Monthly Tasks
```powershell
# Review and update .env
# Check for security updates
# Review error logs
# Test backup restore procedure
```

---

## Still Having Issues?

1. Check the main README.md
2. Review API documentation at http://localhost:8000/docs
3. Check DEVELOPMENT.md for advanced topics
4. Search GitHub issues (if applicable)
5. Create a detailed bug report with debug information

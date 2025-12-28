# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   Admin UI   │              │  Staff UI    │            │
│  │  (React)     │              │  (React)     │            │
│  │              │              │              │            │
│  │ - Dashboard  │              │ - Order      │            │
│  │ - Menu Mgmt  │              │   Taking     │            │
│  │ - Orders     │              │ - Table      │            │
│  │ - Tables     │              │   Selection  │            │
│  └──────┬───────┘              └──────┬───────┘            │
│         │                              │                     │
│         └──────────────┬───────────────┘                     │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS + WebSocket
                         │
┌────────────────────────┼─────────────────────────────────────┐
│                        │        API LAYER                     │
├────────────────────────┼─────────────────────────────────────┤
│                        ▼                                     │
│              ┌──────────────────┐                           │
│              │  FastAPI Server  │                           │
│              │   (Port 8000)    │                           │
│              └─────────┬────────┘                           │
│                        │                                     │
│        ┌───────────────┼───────────────┐                    │
│        │               │               │                    │
│   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐               │
│   │  Auth   │    │ Business│    │WebSocket│               │
│   │  API    │    │   API   │    │ Manager │               │
│   └────┬────┘    └────┬────┘    └────┬────┘               │
│        │              │              │                      │
│        │    ┌─────────┴──────┐       │                      │
│        │    │                │       │                      │
│   ┌────▼────▼────┐    ┌──────▼───────▼────┐               │
│   │   Security   │    │   Business Logic   │               │
│   │   - JWT      │    │   - Orders         │               │
│   │   - RBAC     │    │   - Menu           │               │
│   │   - Hashing  │    │   - Tables         │               │
│   └──────────────┘    │   - Payments       │               │
│                       └────────┬───────────┘               │
└────────────────────────────────┼─────────────────────────────┘
                                 │
                                 │ SQLAlchemy ORM
                                 │
┌────────────────────────────────┼─────────────────────────────┐
│                        DATABASE LAYER                        │
├────────────────────────────────┼─────────────────────────────┤
│                                ▼                             │
│                     ┌──────────────────┐                    │
│                     │   PostgreSQL     │                    │
│                     │   (Port 5432)    │                    │
│                     └──────────────────┘                    │
│                                                              │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│    │  Users   │  │   Menu   │  │  Orders  │  │  Tables  ││
│    │          │  │  Items   │  │          │  │          ││
│    └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                              │
│                      ┌──────────┐                           │
│                      │ Payments │                           │
│                      │          │                           │
│                      └──────────┘                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│     ┌──────────┐              ┌──────────┐                 │
│     │  Stripe  │              │  PayPal  │                 │
│     │   API    │              │   API    │                 │
│     └──────────┘              └──────────┘                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌──────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│Client│      │ FastAPI  │      │ Security │      │ Database │
└───┬──┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
    │              │                  │                  │
    │ POST /login  │                  │                  │
    ├─────────────>│                  │                  │
    │              │                  │                  │
    │              │ Verify Password  │                  │
    │              ├─────────────────>│                  │
    │              │                  │                  │
    │              │                  │  Query User      │
    │              │                  ├─────────────────>│
    │              │                  │                  │
    │              │                  │  User Data       │
    │              │                  │<─────────────────┤
    │              │                  │                  │
    │              │  Hash Match      │                  │
    │              │<─────────────────┤                  │
    │              │                  │                  │
    │              │ Generate JWT     │                  │
    │              ├─────────────────>│                  │
    │              │                  │                  │
    │              │  JWT Token       │                  │
    │              │<─────────────────┤                  │
    │              │                  │                  │
    │   Token      │                  │                  │
    │<─────────────┤                  │                  │
    │              │                  │                  │
```

### 2. Order Creation Flow

```
┌──────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│Staff │   │ Frontend │   │ Backend  │   │ Database │   │WebSocket │
└───┬──┘   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
    │           │              │              │              │
    │ Select    │              │              │              │
    │ Items     │              │              │              │
    ├──────────>│              │              │              │
    │           │              │              │              │
    │           │ POST /orders │              │              │
    │           ├─────────────>│              │              │
    │           │              │              │              │
    │           │              │ Validate     │              │
    │           │              │ & Calculate  │              │
    │           │              │              │              │
    │           │              │ Save Order   │              │
    │           │              ├─────────────>│              │
    │           │              │              │              │
    │           │              │ Order Data   │              │
    │           │              │<─────────────┤              │
    │           │              │              │              │
    │           │              │ Broadcast    │              │
    │           │              ├──────────────┼─────────────>│
    │           │              │              │              │
    │           │ Order        │              │              │
    │           │ Created      │              │              │
    │           │<─────────────┤              │              │
    │           │              │              │              │
    │ Success   │              │              │              │
    │<──────────┤              │              │              │
    │           │              │              │              │
```

### 3. Payment Processing Flow (Stripe)

```
┌──────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│Client│   │ Frontend │   │ Backend  │   │ Database │   │  Stripe  │
└───┬──┘   └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
    │           │              │              │              │
    │ Pay Order │              │              │              │
    ├──────────>│              │              │              │
    │           │              │              │              │
    │           │ Create       │              │              │
    │           │ Payment      │              │              │
    │           │ Intent       │              │              │
    │           ├─────────────>│              │              │
    │           │              │              │              │
    │           │              │ Create       │              │
    │           │              │ Intent       │              │
    │           │              ├──────────────┼─────────────>│
    │           │              │              │              │
    │           │              │ Client       │              │
    │           │              │ Secret       │              │
    │           │              │<─────────────┼──────────────┤
    │           │              │              │              │
    │           │ Secret       │              │              │
    │           │<─────────────┤              │              │
    │           │              │              │              │
    │ Confirm   │              │              │              │
    │ Payment   │              │              │              │
    ├──────────>│              │              │              │
    │           │              │              │              │
    │           │ Direct to Stripe            │              │
    │           ├──────────────┼──────────────┼─────────────>│
    │           │              │              │              │
    │           │              │ Webhook      │              │
    │           │              │ Notification │              │
    │           │              │<─────────────┼──────────────┤
    │           │              │              │              │
    │           │              │ Update Order │              │
    │           │              ├─────────────>│              │
    │           │              │              │              │
    │ Success   │              │              │              │
    │<──────────┤              │              │              │
    │           │              │              │              │
```

## Database Schema

```
┌─────────────────────┐
│       Users         │
├─────────────────────┤
│ PK  id              │
│     name            │
│     email (unique)  │
│     password_hash   │
│     role (enum)     │
└─────────┬───────────┘
          │
          │ 1:N
          │
          ▼
┌─────────────────────┐         ┌─────────────────────┐
│      Orders         │    N:1  │       Tables        │
├─────────────────────┤◄────────┤─────────────────────┤
│ PK  id              │         │ PK  id              │
│ FK  table_id        │         │     number (unique) │
│ FK  created_by      │         │     capacity        │
│     items (JSON)    │         │     status (enum)   │
│     total_price     │         └─────────────────────┘
│     status (enum)   │
│     payment_status  │
│     payment_method  │
│     notes           │
│     timestamp       │
│     updated_at      │
└─────────┬───────────┘
          │
          │ 1:1
          │
          ▼
┌─────────────────────┐
│      Payments       │
├─────────────────────┤
│ PK  id              │
│ FK  order_id(unique)│
│     amount          │
│     payment_method  │
│     transaction_id  │
│     status          │
│     timestamp       │
└─────────────────────┘

┌─────────────────────┐
│    Menu Items       │
├─────────────────────┤
│ PK  id              │
│     name            │
│     description     │
│     price           │
│     category        │
│     image_url       │
│     available       │
└─────────────────────┘
```

## API Request Flow

```
1. Client Request
   ↓
2. CORS Middleware
   ↓
3. Authentication (JWT)
   ↓
4. Authorization (RBAC)
   ↓
5. Route Handler
   ↓
6. Business Logic
   ↓
7. Database Query (SQLAlchemy)
   ↓
8. Response Serialization (Pydantic)
   ↓
9. JSON Response
```

## WebSocket Communication

```
Kitchen Display ◄─────┐
                      │
Admin Dashboard ◄─────┤
                      │
Staff Tablets ◄───────┼──── WebSocket Manager
                      │         (Backend)
Order System ────────►│
                      │
Payment System ───────┘

Events:
- order.created
- order.updated
- order.status_changed
- payment.received
```

## Security Layers

```
┌─────────────────────────────────┐
│   1. HTTPS/TLS Encryption       │
├─────────────────────────────────┤
│   2. CORS Policy                │
├─────────────────────────────────┤
│   3. JWT Authentication         │
├─────────────────────────────────┤
│   4. Role-Based Access Control  │
├─────────────────────────────────┤
│   5. Input Validation (Pydantic)│
├─────────────────────────────────┤
│   6. SQL Injection Protection   │
│      (SQLAlchemy ORM)           │
├─────────────────────────────────┤
│   7. Password Hashing (bcrypt)  │
└─────────────────────────────────┘
```

## Deployment Architecture (Production)

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │  Load Balancer │
              └────────┬───────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌────────┐    ┌────────┐    ┌────────┐
    │ Web    │    │ Web    │    │ Web    │
    │ Server │    │ Server │    │ Server │
    │ (Nginx)│    │ (Nginx)│    │ (Nginx)│
    └────┬───┘    └────┬───┘    └────┬───┘
         │             │             │
         └─────────────┼─────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌────────┐    ┌────────┐    ┌────────┐
    │Backend │    │Backend │    │Backend │
    │ API    │    │ API    │    │ API    │
    └────┬───┘    └────┬───┘    └────┬───┘
         │             │             │
         └─────────────┼─────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   PostgreSQL   │
              │   (Clustered)  │
              └────────────────┘
```

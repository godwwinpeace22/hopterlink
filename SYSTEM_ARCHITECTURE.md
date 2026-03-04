# 🏗️ SYSTEM ARCHITECTURE - Fixers Hive Job Posting & Bidding System

## 📁 FILE STRUCTURE

```
/src/app/components/pages/
├── PostJob.tsx              ✅ Client posts new job
├── JobBoard.tsx             ✅ Provider browses available jobs
├── MyJobs.tsx               ✅ Client views jobs & quotes
├── MyQuotes.tsx             ✅ Provider tracks submitted quotes
├── ClientDashboard.tsx      ✅ Client main dashboard
├── ProviderDashboard.tsx    ✅ Provider main dashboard
├── ClientRewards.tsx        ✅ Client loyalty & cashback
├── ProviderRewards.tsx      ✅ Provider badges & challenges
├── ClientSignup.tsx         ✅ Client registration
├── ProviderSignup.tsx       ✅ Provider registration
├── SignIn.tsx               ✅ Authentication
├── ProviderOnboarding.tsx   ✅ Provider verification
├── ProviderSearch.tsx       ✅ Browse providers (direct booking)
├── ProviderProfile.tsx      ✅ View provider details
└── BookingWizard.tsx        ✅ Direct booking flow
```

---

## 🔄 DATA FLOW ARCHITECTURE

### **1. JOB POSTING FLOW**

```
┌─────────────┐
│   CLIENT    │
│ Posts Job   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│  Job Created in System      │
│  - Title, Description       │
│  - Budget, Location         │
│  - Category, Urgency        │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  Notification Service       │
│  Notifies ALL providers     │
│  in matching category       │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  Job Appears on Job Board   │
│  All providers can see      │
└─────────────────────────────┘
```

### **2. QUOTE SUBMISSION FLOW**

```
┌──────────────┐
│  PROVIDER    │
│ Views Job    │
└──────┬───────┘
       │
       ↓
┌─────────────────────────────┐
│  Submit Quote Dialog        │
│  - Amount                   │
│  - Timeline                 │
│  - Message                  │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  Quote Saved                │
│  - Status: "Pending"        │
│  - Visible to Client        │
│  - Added to Provider's      │
│    "My Quotes"              │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  Client Notified            │
│  "New quote received"       │
└─────────────────────────────┘
```

### **3. COMMUNICATION FLOW**

```
┌──────────────┐              ┌──────────────┐
│   CLIENT     │◄────────────►│  PROVIDER    │
│ My Jobs Page │   Messages   │ My Quotes    │
└──────────────┘              └──────────────┘
       │                              │
       └──────────┬───────────────────┘
                  ↓
         ┌─────────────────┐
         │ Messaging System│
         │ - Real-time     │
         │ - Notifications │
         │ - History       │
         └─────────────────┘
```

### **4. ACCEPTANCE & ESCROW FLOW**

```
┌─────────────┐
│   CLIENT    │
│ Accepts     │
│ Quote       │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────┐
│  Redirect to Payment Page   │
│  Client Funds Escrow        │
│  - Full job amount          │
│  - Admin fees               │
│  - Card payment required    │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  Escrow Account             │
│  Funds LOCKED               │
│  Until job completion       │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  Provider Notified          │
│  "Quote Accepted!"          │
│  Job → Active Jobs          │
└──────┬──────────────────────┘
       │
       ↓
┌─────────────────────────────┐
│  Status Updates:            │
│  1. Funded                  │
│  2. In Progress             │
│  3. Completed               │
│  4. Funds Released          │
└─────────────────────────────┘
```

### **5. JOB COMPLETION FLOW**

```
┌──────────────┐
│  PROVIDER    │
│ Marks Job    │
│ Complete     │
└──────┬───────┘
       │
       ↓
┌─────────────────────────────┐
│  Client Review Required     │
│  - Approve Work             │
│  - Request Changes          │
│  - File Dispute             │
└──────┬──────────────────────┘
       │
       ├──► APPROVED ──────────────┐
       │                           │
       └──► DISPUTED               │
              │                    │
              ↓                    ↓
       ┌──────────────┐    ┌──────────────┐
       │ Admin Review │    │ Release      │
       │ Evidence     │    │ Escrow       │
       │ Decision     │    │              │
       └──────────────┘    └──────┬───────┘
                                  │
                                  ↓
                           ┌──────────────┐
                           │ Commission   │
                           │ Deducted     │
                           │ - 5% or 3.5% │
                           └──────┬───────┘
                                  │
                                  ↓
                           ┌──────────────┐
                           │ Provider     │
                           │ Wallet       │
                           │ Updated      │
                           └──────────────┘
```

---

## 🗄️ DATA MODELS

### **Job Model**
```typescript
interface Job {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  budgetType: "fixed" | "hourly";
  location: string;
  urgency: "urgent" | "flexible";
  preferredDate: string;
  photos: string[];
  status: "open" | "in_progress" | "completed" | "disputed";
  createdAt: timestamp;
  acceptedQuoteId?: string;
  escrowAmount?: number;
  escrowStatus?: "pending" | "held" | "released";
}
```

### **Quote Model**
```typescript
interface Quote {
  id: string;
  jobId: string;
  providerId: string;
  amount: number;
  timeline: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "client_messaged";
  submittedAt: timestamp;
  responseAt?: timestamp;
}
```

### **Escrow Transaction Model**
```typescript
interface EscrowTransaction {
  id: string;
  jobId: string;
  clientId: string;
  providerId: string;
  amount: number;
  commission: number;
  netToProvider: number;
  status: "funded" | "held" | "released" | "refunded";
  fundedAt: timestamp;
  releasedAt?: timestamp;
  paymentMethod: string;
}
```

### **Notification Model**
```typescript
interface Notification {
  id: string;
  userId: string;
  type: "new_job" | "new_quote" | "quote_accepted" | "message" | "job_complete" | "payment_received";
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: timestamp;
}
```

---

## 🔔 NOTIFICATION TRIGGERS

| Event | Who Gets Notified | Notification Type |
|-------|------------------|------------------|
| Job Posted | All providers in category | "New job available in your area" |
| Quote Submitted | Client | "New quote received on your job" |
| Client Messages Provider | Provider | "Client has a question about your quote" |
| Provider Responds | Client | "Provider responded to your message" |
| Quote Accepted | Provider | "🎉 Your quote was accepted!" |
| Escrow Funded | Provider | "Job funded - you can start work" |
| Job Marked Complete | Client | "Job completed - please review" |
| Funds Released | Provider | "💰 Payment received" |
| Review Posted | Provider | "Client left you a review" |

---

## 💳 PAYMENT & ESCROW SYSTEM

### **Flow Steps:**

1. **Client Accepts Quote**
   - Quote amount shown
   - Commission calculated
   - Admin fees added
   - Total displayed

2. **Payment Page**
   - Card information required
   - Billing address
   - Payment authorization
   - Funds captured

3. **Escrow Account**
   - Funds held securely
   - Not accessible to either party
   - Protected against disputes

4. **Job Completion**
   - Client reviews work
   - Approval triggers release
   - Commission deducted
   - Net paid to provider

### **Commission Calculation:**

```javascript
function calculateCommission(jobAmount) {
  if (jobAmount <= 500) {
    return jobAmount * 0.05; // 5%
  } else {
    return jobAmount * 0.035; // 3.5%
  }
}

function calculateNetToProvider(jobAmount) {
  const commission = calculateCommission(jobAmount);
  return jobAmount - commission;
}

// Example:
// Job: $400 → Commission: $20 (5%) → Provider Gets: $380
// Job: $600 → Commission: $21 (3.5%) → Provider Gets: $579
```

---

## 🛡️ SECURITY & VALIDATION

### **Client Side:**
- ✅ Job posting validation
- ✅ Budget minimum/maximum
- ✅ Required fields enforcement
- ✅ Photo upload limits
- ✅ Location verification

### **Provider Side:**
- ✅ Quote amount validation
- ✅ Timeline requirements
- ✅ Message character limits
- ✅ Duplicate quote prevention
- ✅ Category matching

### **Payment Security:**
- 🔐 PCI DSS compliant
- 🔐 SSL/TLS encryption
- 🔐 Tokenized card storage
- 🔐 3D Secure authentication
- 🔐 Fraud detection

### **Escrow Protection:**
- 🛡️ Third-party escrow service
- 🛡️ Automated holds
- 🛡️ Dispute resolution
- 🛡️ Refund capabilities
- 🛡️ Transaction logging

---

## 📊 DATABASE SCHEMA OVERVIEW

```sql
-- Jobs Table
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  budget VARCHAR(50),
  budget_type ENUM('fixed', 'hourly'),
  location VARCHAR(255),
  urgency ENUM('urgent', 'flexible'),
  preferred_date DATE,
  status ENUM('open', 'in_progress', 'completed', 'disputed'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Quotes Table
CREATE TABLE quotes (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  provider_id UUID REFERENCES users(id),
  amount DECIMAL(10,2),
  timeline VARCHAR(255),
  message TEXT,
  status ENUM('pending', 'accepted', 'rejected', 'client_messaged'),
  submitted_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Escrow Transactions Table
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  client_id UUID REFERENCES users(id),
  provider_id UUID REFERENCES users(id),
  amount DECIMAL(10,2),
  commission DECIMAL(10,2),
  net_to_provider DECIMAL(10,2),
  status ENUM('funded', 'held', 'released', 'refunded'),
  funded_at TIMESTAMP,
  released_at TIMESTAMP
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  quote_id UUID REFERENCES quotes(id),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  link VARCHAR(255),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);
```

---

## 🚀 API ENDPOINTS (Future Backend)

### **Job Management**
```
POST   /api/jobs                 # Create new job
GET    /api/jobs                 # List all jobs (with filters)
GET    /api/jobs/:id             # Get job details
PUT    /api/jobs/:id             # Update job
DELETE /api/jobs/:id             # Delete job (only if no quotes)
GET    /api/jobs/:id/quotes      # Get all quotes for a job
```

### **Quote Management**
```
POST   /api/quotes               # Submit new quote
GET    /api/quotes               # Get provider's quotes
GET    /api/quotes/:id           # Get quote details
PUT    /api/quotes/:id           # Update quote
DELETE /api/quotes/:id           # Withdraw quote
POST   /api/quotes/:id/accept    # Accept quote (client)
```

### **Messaging**
```
POST   /api/messages             # Send message
GET    /api/messages/:jobId      # Get messages for job
PUT    /api/messages/:id/read    # Mark message as read
```

### **Escrow**
```
POST   /api/escrow/fund          # Fund escrow (client)
POST   /api/escrow/release       # Release funds (client approval)
POST   /api/escrow/dispute       # File dispute
GET    /api/escrow/:jobId        # Get escrow status
```

### **Notifications**
```
GET    /api/notifications        # Get user notifications
PUT    /api/notifications/:id/read  # Mark as read
PUT    /api/notifications/read-all  # Mark all as read
```

---

## 🎯 STATE MANAGEMENT

### **Job States**
```
open → in_progress → completed
  ↓                      ↓
disputed ←──────────────┘
```

### **Quote States**
```
pending → accepted → job_funded → job_complete → paid
   ↓                                               ↑
   ├──→ client_messaged → resolved ───────────────┘
   ↓
rejected (archived)
```

### **Escrow States**
```
funded → held → released → provider_wallet
   ↓              ↓
disputed → admin_review → resolved
```

---

## 🔄 INTEGRATION POINTS

### **Current (Frontend Only):**
- ✅ Mock data for demonstrations
- ✅ Local state management
- ✅ Client-side routing
- ✅ UI/UX complete

### **Future (Backend Integration):**
- 🔜 REST API or GraphQL
- 🔜 Real-time WebSocket for notifications
- 🔜 Payment gateway (Stripe/Square)
- 🔜 Cloud storage for photos (S3/Cloudinary)
- 🔜 Email service (SendGrid/Mailgun)
- 🔜 SMS notifications (Twilio)

---

## 📈 SCALABILITY CONSIDERATIONS

### **Performance:**
- Pagination for job listings
- Lazy loading for quotes
- Image optimization
- Caching strategies
- Database indexing

### **Infrastructure:**
- Load balancing
- CDN for static assets
- Database replication
- Queue system for notifications
- Microservices architecture

---

**Last Updated:** December 2024  
**Version:** 2.0  
**Status:** ✅ Production Ready (Frontend)

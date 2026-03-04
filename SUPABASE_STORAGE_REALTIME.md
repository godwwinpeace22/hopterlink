# Supabase Storage & Realtime Configuration

## Storage Buckets

### 1. **job-photos**

- **Purpose**: Store photos uploaded by clients when posting jobs
- **Public Access**: Yes (read-only)
- **Max File Size**: 5MB per file
- **Allowed MIME Types**: image/jpeg, image/png, image/webp
- **RLS Policy**:

  ```sql
  -- Anyone can view
  CREATE POLICY "Job photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'job-photos');

  -- Only clients can upload to their own folders
  CREATE POLICY "Clients can upload job photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'job-photos' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

  -- Clients can delete their own photos
  CREATE POLICY "Clients can delete own job photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'job-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
  ```

- **Path Structure**: `{user_id}/{job_id}/{filename}`

### 2. **provider-documents**

- **Purpose**: Store verification documents (ID, insurance, certifications, licenses)
- **Public Access**: No (private)
- **Max File Size**: 10MB per file
- **Allowed MIME Types**: image/jpeg, image/png, application/pdf
- **RLS Policy**:

  ```sql
  -- Only provider and admins can view
  CREATE POLICY "Providers can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'provider-documents' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  );

  -- Only providers can upload to their own folder
  CREATE POLICY "Providers can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'provider-documents' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider')
  );

  -- Providers can update/replace documents
  CREATE POLICY "Providers can update own documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'provider-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
  ```

- **Path Structure**: `{provider_id}/{document_type}/{filename}`

### 3. **provider-portfolios**

- **Purpose**: Store portfolio images showcasing providers' work
- **Public Access**: Yes (read-only)
- **Max File Size**: 8MB per file
- **Allowed MIME Types**: image/jpeg, image/png, image/webp
- **RLS Policy**:

  ```sql
  -- Anyone can view portfolio images
  CREATE POLICY "Portfolio images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'provider-portfolios');

  -- Only providers can upload to their own portfolio
  CREATE POLICY "Providers can upload portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'provider-portfolios' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider')
  );

  -- Providers can delete their portfolio images
  CREATE POLICY "Providers can delete own portfolio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'provider-portfolios' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
  ```

- **Path Structure**: `{provider_id}/{filename}`

### 4. **avatars**

- **Purpose**: Store user profile avatars
- **Public Access**: Yes (read-only)
- **Max File Size**: 2MB
- **Allowed MIME Types**: image/jpeg, image/png, image/webp
- **RLS Policy**:

  ```sql
  -- Anyone can view avatars
  CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

  -- Users can upload their own avatar
  CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

  -- Users can update their avatar
  CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
  ```

- **Path Structure**: `{user_id}/{filename}`

### 5. **message-attachments**

- **Purpose**: Store files sent in messages
- **Public Access**: No (private)
- **Max File Size**: 10MB
- **Allowed MIME Types**: image/_, application/pdf, application/msword, application/vnd.openxmlformats-officedocument._
- **RLS Policy**:

  ```sql
  -- Only sender and recipient can view
  CREATE POLICY "Message attachments viewable by conversation participants"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-attachments' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     auth.uid()::text = (storage.foldername(name))[2])
  );

  -- Sender can upload
  CREATE POLICY "Users can upload message attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
  ```

- **Path Structure**: `{sender_id}/{recipient_id}/{message_id}/{filename}`

---

## Realtime Subscriptions

### 1. **Messages Channel**

- **Table**: `messages`
- **Events**: INSERT, UPDATE (for read receipts)
- **Filter**: By `sender_id` or `recipient_id` matching current user
- **Use Cases**:
  - Live chat updates in messaging UI
  - Unread message count badge updates
  - New message notifications

```typescript
// Frontend subscription example
const messagesChannel = supabase
  .channel("messages")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `recipient_id=eq.${userId}`,
    },
    (payload) => {
      // Handle new message
      console.log("New message received:", payload.new);
    },
  )
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "messages",
      filter: `sender_id=eq.${userId}`,
    },
    (payload) => {
      // Handle read receipt
      console.log("Message read:", payload.new);
    },
  )
  .subscribe();
```

### 2. **Notifications Channel**

- **Table**: `notifications`
- **Events**: INSERT
- **Filter**: By `user_id` matching current user
- **Use Cases**:
  - Toast/banner notifications in real-time
  - Notification bell icon badge updates
  - Desktop/push notification triggers

```typescript
const notificationsChannel = supabase
  .channel("notifications")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      // Show toast notification
      toast({
        title: payload.new.title,
        description: payload.new.message,
      });
    },
  )
  .subscribe();
```

### 3. **Quotes Channel** (for Clients)

- **Table**: `quotes`
- **Events**: INSERT, UPDATE
- **Filter**: By `job_id` for jobs owned by current user
- **Use Cases**:
  - Real-time quote reception on MyJobs page
  - Quote count updates
  - Quote status changes (accepted/rejected)

```typescript
const quotesChannel = supabase
  .channel("job-quotes")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "quotes",
      filter: `job_id=in.(${myJobIds.join(",")})`,
    },
    (payload) => {
      // Update quotes list
      setQuotes((prev) => [...prev, payload.new]);
    },
  )
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "quotes",
      filter: `job_id=in.(${myJobIds.join(",")})`,
    },
    (payload) => {
      // Update quote status
      setQuotes((prev) =>
        prev.map((q) => (q.id === payload.new.id ? payload.new : q)),
      );
    },
  )
  .subscribe();
```

### 4. **Bookings Channel**

- **Table**: `bookings`
- **Events**: INSERT, UPDATE
- **Filter**: By `client_id` OR `provider_id` matching current user
- **Use Cases**:
  - Booking confirmation updates
  - Status changes (confirmed, in_progress, completed, cancelled)
  - Dashboard stats updates

```typescript
const bookingsChannel = supabase
  .channel("my-bookings")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "bookings",
      filter:
        userRole === "client"
          ? `client_id=eq.${userId}`
          : `provider_id=eq.${userId}`,
    },
    (payload) => {
      // Refetch bookings or update in place
      if (payload.eventType === "UPDATE") {
        updateBookingInList(payload.new);
      } else if (payload.eventType === "INSERT") {
        addBookingToList(payload.new);
      }
    },
  )
  .subscribe();
```

### 5. **Job Board Channel** (for Providers)

- **Table**: `jobs`
- **Events**: INSERT
- **Filter**: By `status='open'` and optionally `category`
- **Use Cases**:
  - Real-time new job postings on JobBoard page
  - Notification when jobs matching saved searches are posted

```typescript
const jobBoardChannel = supabase
  .channel("job-board")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "jobs",
      filter: "status=eq.open",
    },
    (payload) => {
      // Check if job matches provider's service categories
      if (myCategories.includes(payload.new.category)) {
        // Show notification or add to job list
        setJobs((prev) => [payload.new, ...prev]);
      }
    },
  )
  .subscribe();
```

### 6. **Provider Availability Channel** (for Direct Bookings)

- **Table**: `provider_profiles`
- **Events**: UPDATE
- **Filter**: By specific `user_id` when viewing a provider profile
- **Use Cases**:
  - Real-time availability updates when booking
  - Calendar slot updates

```typescript
const providerChannel = supabase
  .channel(`provider-${providerId}`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "provider_profiles",
      filter: `user_id=eq.${providerId}`,
    },
    (payload) => {
      // Update availability calendar
      setProviderAvailability(payload.new.availability);
    },
  )
  .subscribe();
```

---

## Presence Tracking (Optional)

### Online Status

Track which users are currently online for better messaging UX.

```typescript
const presenceChannel = supabase.channel("online-users", {
  config: {
    presence: {
      key: userId,
    },
  },
});

presenceChannel
  .on("presence", { event: "sync" }, () => {
    const state = presenceChannel.presenceState();
    // Update UI with online users
    setOnlineUsers(Object.keys(state));
  })
  .on("presence", { event: "join" }, ({ key, newPresences }) => {
    console.log("User joined:", key);
  })
  .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
    console.log("User left:", key);
  })
  .subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await presenceChannel.track({
        user_id: userId,
        online_at: new Date().toISOString(),
      });
    }
  });
```

---

## Database Functions for Realtime Triggers

### Notification Creation Trigger

Automatically create notifications when certain events occur:

```sql
-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_link_url TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link_url, related_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_link_url, p_related_id)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Notify client when quote is received
CREATE OR REPLACE FUNCTION notify_quote_received()
RETURNS TRIGGER AS $$
DECLARE
  job_owner UUID;
  job_title TEXT;
BEGIN
  SELECT client_id, title INTO job_owner, job_title
  FROM jobs WHERE id = NEW.job_id;

  PERFORM create_notification(
    job_owner,
    'quote_received',
    'New Quote Received',
    'You received a new quote for "' || job_title || '"',
    '/my-jobs/' || NEW.job_id,
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quote_received_notification
AFTER INSERT ON quotes
FOR EACH ROW
EXECUTE FUNCTION notify_quote_received();

-- Trigger: Notify provider when quote is accepted
CREATE OR REPLACE FUNCTION notify_quote_accepted()
RETURNS TRIGGER AS $$
DECLARE
  job_title TEXT;
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    SELECT title INTO job_title FROM jobs WHERE id = NEW.job_id;

    PERFORM create_notification(
      NEW.provider_id,
      'quote_accepted',
      'Quote Accepted!',
      'Your quote for "' || job_title || '" has been accepted',
      '/my-quotes/' || NEW.id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quote_accepted_notification
AFTER UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION notify_quote_accepted();

-- Trigger: Notify both parties when booking is confirmed
CREATE OR REPLACE FUNCTION notify_booking_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Notify client
    PERFORM create_notification(
      NEW.client_id,
      'booking_confirmed',
      'Booking Confirmed',
      'Your booking has been confirmed',
      '/bookings/' || NEW.id,
      NEW.id
    );

    -- Notify provider
    PERFORM create_notification(
      NEW.provider_id,
      'booking_confirmed',
      'New Booking Confirmed',
      'You have a new confirmed booking',
      '/bookings/' || NEW.id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_confirmed_notification
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION notify_booking_confirmed();

-- Trigger: Notify when message is received
CREATE OR REPLACE FUNCTION notify_message_received()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
BEGIN
  SELECT full_name INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  PERFORM create_notification(
    NEW.recipient_id,
    'message_received',
    'New Message',
    'You have a new message from ' || COALESCE(sender_name, 'a user'),
    '/messages/' || NEW.sender_id,
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_received_notification
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_message_received();
```

---

## Implementation Checklist

- [ ] Create storage buckets in Supabase Dashboard
- [ ] Apply storage RLS policies for each bucket
- [ ] Enable Realtime for tables: messages, notifications, quotes, bookings, jobs
- [ ] Create database functions and triggers for automatic notifications
- [ ] Configure presence tracking if needed
- [ ] Set up storage limits and quotas
- [ ] Test file uploads to each bucket
- [ ] Test realtime subscriptions for each channel
- [ ] Add error handling for storage operations in frontend
- [ ] Add reconnection logic for realtime subscriptions

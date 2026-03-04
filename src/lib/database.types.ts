export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          amount: number;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          client_id: string;
          completed_at: string | null;
          confirmed_at: string | null;
          created_at: string | null;
          description: string | null;
          duration_hours: number | null;
          id: string;
          job_id: string | null;
          location: Json;
          metadata: Json | null;
          payment_method: Database["public"]["Enums"]["payment_method"] | null;
          payment_status: Database["public"]["Enums"]["payment_status"] | null;
          photo_urls: string[] | null;
          provider_id: string;
          quote_id: string | null;
          scheduled_date: string;
          scheduled_time: string | null;
          service_type: string;
          special_instructions: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["booking_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          client_id: string;
          completed_at?: string | null;
          confirmed_at?: string | null;
          created_at?: string | null;
          description?: string | null;
          duration_hours?: number | null;
          id?: string;
          job_id?: string | null;
          location: Json;
          metadata?: Json | null;
          payment_method?: Database["public"]["Enums"]["payment_method"] | null;
          payment_status?: Database["public"]["Enums"]["payment_status"] | null;
          photo_urls?: string[] | null;
          provider_id: string;
          quote_id?: string | null;
          scheduled_date: string;
          scheduled_time?: string | null;
          service_type: string;
          special_instructions?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["booking_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          client_id?: string;
          completed_at?: string | null;
          confirmed_at?: string | null;
          created_at?: string | null;
          description?: string | null;
          duration_hours?: number | null;
          id?: string;
          job_id?: string | null;
          location?: Json;
          metadata?: Json | null;
          payment_method?: Database["public"]["Enums"]["payment_method"] | null;
          payment_status?: Database["public"]["Enums"]["payment_status"] | null;
          photo_urls?: string[] | null;
          provider_id?: string;
          quote_id?: string | null;
          scheduled_date?: string;
          scheduled_time?: string | null;
          service_type?: string;
          special_instructions?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["booking_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quotes";
            referencedColumns: ["id"];
          },
        ];
      };
      client_profiles: {
        Row: {
          created_at: string | null;
          jobs_posted: number | null;
          notification_preferences: Json | null;
          preferred_categories: string[] | null;
          saved_providers: string[] | null;
          total_spent: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          jobs_posted?: number | null;
          notification_preferences?: Json | null;
          preferred_categories?: string[] | null;
          saved_providers?: string[] | null;
          total_spent?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          jobs_posted?: number | null;
          notification_preferences?: Json | null;
          preferred_categories?: string[] | null;
          saved_providers?: string[] | null;
          total_spent?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      client_rewards: {
        Row: {
          cashback: number | null;
          created_at: string | null;
          lifetime_points: number | null;
          points: number | null;
          referral_code: string;
          referrals_count: number | null;
          tier: Database["public"]["Enums"]["reward_tier"] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          cashback?: number | null;
          created_at?: string | null;
          lifetime_points?: number | null;
          points?: number | null;
          referral_code: string;
          referrals_count?: number | null;
          tier?: Database["public"]["Enums"]["reward_tier"] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          cashback?: number | null;
          created_at?: string | null;
          lifetime_points?: number | null;
          points?: number | null;
          referral_code?: string;
          referrals_count?: number | null;
          tier?: Database["public"]["Enums"]["reward_tier"] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_rewards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "client_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      escrow_payments: {
        Row: {
          amount: number;
          booking_id: string;
          client_id: string;
          created_at: string | null;
          dispute_reason: string | null;
          held_at: string | null;
          id: string;
          metadata: Json | null;
          payment_intent_id: string | null;
          platform_fee: number;
          provider_amount: number;
          provider_id: string;
          refunded_at: string | null;
          released_at: string | null;
          status: Database["public"]["Enums"]["payment_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          booking_id: string;
          client_id: string;
          created_at?: string | null;
          dispute_reason?: string | null;
          held_at?: string | null;
          id?: string;
          metadata?: Json | null;
          payment_intent_id?: string | null;
          platform_fee: number;
          provider_amount: number;
          provider_id: string;
          refunded_at?: string | null;
          released_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          booking_id?: string;
          client_id?: string;
          created_at?: string | null;
          dispute_reason?: string | null;
          held_at?: string | null;
          id?: string;
          metadata?: Json | null;
          payment_intent_id?: string | null;
          platform_fee?: number;
          provider_amount?: number;
          provider_id?: string;
          refunded_at?: string | null;
          released_at?: string | null;
          status?: Database["public"]["Enums"]["payment_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "escrow_payments_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "escrow_payments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "escrow_payments_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          budget_max: number | null;
          budget_min: number | null;
          category: string;
          client_id: string;
          completed_at: string | null;
          created_at: string | null;
          description: string;
          expires_at: string | null;
          id: string;
          location: Json;
          metadata: Json | null;
          photo_urls: string[] | null;
          preferred_date: string | null;
          quotes_count: number | null;
          status: Database["public"]["Enums"]["job_status"] | null;
          title: string;
          updated_at: string | null;
          urgency: string | null;
          views_count: number | null;
        };
        Insert: {
          budget_max?: number | null;
          budget_min?: number | null;
          category: string;
          client_id: string;
          completed_at?: string | null;
          created_at?: string | null;
          description: string;
          expires_at?: string | null;
          id?: string;
          location: Json;
          metadata?: Json | null;
          photo_urls?: string[] | null;
          preferred_date?: string | null;
          quotes_count?: number | null;
          status?: Database["public"]["Enums"]["job_status"] | null;
          title: string;
          updated_at?: string | null;
          urgency?: string | null;
          views_count?: number | null;
        };
        Update: {
          budget_max?: number | null;
          budget_min?: number | null;
          category?: string;
          client_id?: string;
          completed_at?: string | null;
          created_at?: string | null;
          description?: string;
          expires_at?: string | null;
          id?: string;
          location?: Json;
          metadata?: Json | null;
          photo_urls?: string[] | null;
          preferred_date?: string | null;
          quotes_count?: number | null;
          status?: Database["public"]["Enums"]["job_status"] | null;
          title?: string;
          updated_at?: string | null;
          urgency?: string | null;
          views_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          attachment_url: string | null;
          booking_id: string | null;
          content: string;
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          job_id: string | null;
          message_type: Database["public"]["Enums"]["message_type"] | null;
          metadata: Json | null;
          read_at: string | null;
          recipient_id: string;
          sender_id: string;
        };
        Insert: {
          attachment_url?: string | null;
          booking_id?: string | null;
          content: string;
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          job_id?: string | null;
          message_type?: Database["public"]["Enums"]["message_type"] | null;
          metadata?: Json | null;
          read_at?: string | null;
          recipient_id: string;
          sender_id: string;
        };
        Update: {
          attachment_url?: string | null;
          booking_id?: string | null;
          content?: string;
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          job_id?: string | null;
          message_type?: Database["public"]["Enums"]["message_type"] | null;
          metadata?: Json | null;
          read_at?: string | null;
          recipient_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          link_url: string | null;
          message: string;
          metadata: Json | null;
          read_at: string | null;
          related_id: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          link_url?: string | null;
          message: string;
          metadata?: Json | null;
          read_at?: string | null;
          related_id?: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          link_url?: string | null;
          message?: string;
          metadata?: Json | null;
          read_at?: string | null;
          related_id?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          is_active: boolean | null;
          is_suspended: boolean | null;
          last_seen_at: string | null;
          location: Json | null;
          metadata: Json | null;
          phone: string | null;
          phone_verified: boolean | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          is_active?: boolean | null;
          is_suspended?: boolean | null;
          last_seen_at?: string | null;
          location?: Json | null;
          metadata?: Json | null;
          phone?: string | null;
          phone_verified?: boolean | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          is_suspended?: boolean | null;
          last_seen_at?: string | null;
          location?: Json | null;
          metadata?: Json | null;
          phone?: string | null;
          phone_verified?: boolean | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_role_memberships: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          metadata: Json;
          onboarding_completed_at: string | null;
          onboarding_started_at: string | null;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          role: Database["public"]["Enums"]["user_role"];
          state: Database["public"]["Enums"]["role_membership_state"];
          suspended_reason: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          metadata?: Json;
          onboarding_completed_at?: string | null;
          onboarding_started_at?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          role: Database["public"]["Enums"]["user_role"];
          state?: Database["public"]["Enums"]["role_membership_state"];
          suspended_reason?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          metadata?: Json;
          onboarding_completed_at?: string | null;
          onboarding_started_at?: string | null;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          state?: Database["public"]["Enums"]["role_membership_state"];
          suspended_reason?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_role_memberships_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_role_memberships_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      provider_profiles: {
        Row: {
          acceptance_rate: number | null;
          availability: Json | null;
          background_check_date: string | null;
          bio: string | null;
          business_name: string | null;
          certifications: string[] | null;
          created_at: string | null;
          experience_years: number | null;
          hourly_rate: number | null;
          insurance_expiry: string | null;
          is_featured: boolean | null;
          jobs_completed: number | null;
          portfolio_urls: string[] | null;
          rating: number | null;
          response_time: number | null;
          service_areas: string[] | null;
          services: string[];
          total_earned: number | null;
          total_reviews: number | null;
          updated_at: string | null;
          user_id: string;
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null;
          verified_at: string | null;
        };
        Insert: {
          acceptance_rate?: number | null;
          availability?: Json | null;
          background_check_date?: string | null;
          bio?: string | null;
          business_name?: string | null;
          certifications?: string[] | null;
          created_at?: string | null;
          experience_years?: number | null;
          hourly_rate?: number | null;
          insurance_expiry?: string | null;
          is_featured?: boolean | null;
          jobs_completed?: number | null;
          portfolio_urls?: string[] | null;
          rating?: number | null;
          response_time?: number | null;
          service_areas?: string[] | null;
          services: string[];
          total_earned?: number | null;
          total_reviews?: number | null;
          updated_at?: string | null;
          user_id: string;
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null;
          verified_at?: string | null;
        };
        Update: {
          acceptance_rate?: number | null;
          availability?: Json | null;
          background_check_date?: string | null;
          bio?: string | null;
          business_name?: string | null;
          certifications?: string[] | null;
          created_at?: string | null;
          experience_years?: number | null;
          hourly_rate?: number | null;
          insurance_expiry?: string | null;
          is_featured?: boolean | null;
          jobs_completed?: number | null;
          portfolio_urls?: string[] | null;
          rating?: number | null;
          response_time?: number | null;
          service_areas?: string[] | null;
          services?: string[];
          total_earned?: number | null;
          total_reviews?: number | null;
          updated_at?: string | null;
          user_id?: string;
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null;
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "provider_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      quotes: {
        Row: {
          accepted_at: string | null;
          amount: number;
          created_at: string | null;
          estimated_duration: string | null;
          expires_at: string | null;
          id: string;
          job_id: string;
          message: string | null;
          metadata: Json | null;
          provider_id: string;
          status: Database["public"]["Enums"]["quote_status"] | null;
          timeline_days: number | null;
          updated_at: string | null;
        };
        Insert: {
          accepted_at?: string | null;
          amount: number;
          created_at?: string | null;
          estimated_duration?: string | null;
          expires_at?: string | null;
          id?: string;
          job_id: string;
          message?: string | null;
          metadata?: Json | null;
          provider_id: string;
          status?: Database["public"]["Enums"]["quote_status"] | null;
          timeline_days?: number | null;
          updated_at?: string | null;
        };
        Update: {
          accepted_at?: string | null;
          amount?: number;
          created_at?: string | null;
          estimated_duration?: string | null;
          expires_at?: string | null;
          id?: string;
          job_id?: string;
          message?: string | null;
          metadata?: Json | null;
          provider_id?: string;
          status?: Database["public"]["Enums"]["quote_status"] | null;
          timeline_days?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quotes_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotes_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      referrals: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          id: string;
          referee_id: string;
          referral_code: string;
          referrer_id: string;
          reward_cashback: number | null;
          reward_points: number | null;
          status: string | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          referee_id: string;
          referral_code: string;
          referrer_id: string;
          reward_cashback?: number | null;
          reward_points?: number | null;
          status?: string | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          referee_id?: string;
          referral_code?: string;
          referrer_id?: string;
          reward_cashback?: number | null;
          reward_points?: number | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey";
            columns: ["referee_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey";
            columns: ["referrer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          reason: string;
          related_id: string | null;
          related_type: string | null;
          reported_user_id: string | null;
          reporter_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          reason: string;
          related_id?: string | null;
          related_type?: string | null;
          reported_user_id?: string | null;
          reporter_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          reason?: string;
          related_id?: string | null;
          related_type?: string | null;
          reported_user_id?: string | null;
          reporter_id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reported_user_id_fkey";
            columns: ["reported_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          booking_id: string;
          comment: string | null;
          created_at: string | null;
          id: string;
          is_verified: boolean | null;
          rating: number;
          response: string | null;
          response_at: string | null;
          reviewee_id: string;
          reviewer_id: string;
          updated_at: string | null;
        };
        Insert: {
          booking_id: string;
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          is_verified?: boolean | null;
          rating: number;
          response?: string | null;
          response_at?: string | null;
          reviewee_id: string;
          reviewer_id: string;
          updated_at?: string | null;
        };
        Update: {
          booking_id?: string;
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          is_verified?: boolean | null;
          rating?: number;
          response?: string | null;
          response_at?: string | null;
          reviewee_id?: string;
          reviewer_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey";
            columns: ["reviewee_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reward_marketplace: {
        Row: {
          created_at: string | null;
          description: string | null;
          discount_amount: number | null;
          discount_percent: number | null;
          id: string;
          is_active: boolean | null;
          points_cost: number;
          title: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          discount_amount?: number | null;
          discount_percent?: number | null;
          id?: string;
          is_active?: boolean | null;
          points_cost: number;
          title: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          discount_amount?: number | null;
          discount_percent?: number | null;
          id?: string;
          is_active?: boolean | null;
          points_cost?: number;
          title?: string;
        };
        Relationships: [];
      };
      reward_transactions: {
        Row: {
          booking_id: string | null;
          cashback: number | null;
          created_at: string | null;
          description: string;
          id: string;
          metadata: Json | null;
          points: number;
          type: string;
          user_id: string;
        };
        Insert: {
          booking_id?: string | null;
          cashback?: number | null;
          created_at?: string | null;
          description: string;
          id?: string;
          metadata?: Json | null;
          points: number;
          type: string;
          user_id: string;
        };
        Update: {
          booking_id?: string | null;
          cashback?: number | null;
          created_at?: string | null;
          description?: string;
          id?: string;
          metadata?: Json | null;
          points?: number;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reward_transactions_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reward_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "client_profiles";
            referencedColumns: ["user_id"];
          },
        ];
      };
      saved_searches: {
        Row: {
          created_at: string | null;
          filters: Json;
          id: string;
          name: string;
          notify_on_match: boolean | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          filters: Json;
          id?: string;
          name: string;
          notify_on_match?: boolean | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          filters?: Json;
          id?: string;
          name?: string;
          notify_on_match?: boolean | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      stripe_webhook_events: {
        Row: {
          created_at: string | null;
          event_id: string;
          event_type: string;
          payload: Json;
          processed_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          event_id: string;
          event_type: string;
          payload: Json;
          processed_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          event_id?: string;
          event_type?: string;
          payload?: Json;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      wallet_topups: {
        Row: {
          amount_cents: number;
          canceled_at: string | null;
          checkout_url: string | null;
          created_at: string;
          currency: string;
          failed_at: string | null;
          failure_reason: string | null;
          id: string;
          idempotency_key: string;
          metadata: Json;
          provider: string;
          status: string;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          succeeded_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount_cents: number;
          canceled_at?: string | null;
          checkout_url?: string | null;
          created_at?: string;
          currency?: string;
          failed_at?: string | null;
          failure_reason?: string | null;
          id?: string;
          idempotency_key: string;
          metadata?: Json;
          provider?: string;
          status?: string;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          succeeded_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          canceled_at?: string | null;
          checkout_url?: string | null;
          created_at?: string;
          currency?: string;
          failed_at?: string | null;
          failure_reason?: string | null;
          id?: string;
          idempotency_key?: string;
          metadata?: Json;
          provider?: string;
          status?: string;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          succeeded_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallet_topups_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      verification_documents: {
        Row: {
          document_type: Database["public"]["Enums"]["document_type"];
          expiry_date: string | null;
          file_name: string | null;
          file_url: string;
          id: string;
          metadata: Json | null;
          provider_id: string;
          rejection_reason: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["verification_status"] | null;
          submitted_at: string | null;
        };
        Insert: {
          document_type: Database["public"]["Enums"]["document_type"];
          expiry_date?: string | null;
          file_name?: string | null;
          file_url: string;
          id?: string;
          metadata?: Json | null;
          provider_id: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["verification_status"] | null;
          submitted_at?: string | null;
        };
        Update: {
          document_type?: Database["public"]["Enums"]["document_type"];
          expiry_date?: string | null;
          file_name?: string | null;
          file_url?: string;
          id?: string;
          metadata?: Json | null;
          provider_id?: string;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["verification_status"] | null;
          submitted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "verification_documents_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_documents_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      start_role_onboarding: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"];
        };
        Returns: Database["public"]["Tables"]["user_role_memberships"]["Row"];
      };
      submit_role_onboarding: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"];
        };
        Returns: Database["public"]["Tables"]["user_role_memberships"]["Row"];
      };
      switch_active_role: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"];
        };
        Returns: Database["public"]["Tables"]["user_role_memberships"]["Row"];
      };
    };
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed";
      document_type:
        | "id"
        | "insurance"
        | "certification"
        | "license"
        | "portfolio";
      job_status:
        | "draft"
        | "open"
        | "quoted"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed";
      message_type:
        | "text"
        | "system"
        | "attachment"
        | "quote_update"
        | "booking_update";
      notification_type:
        | "job_posted"
        | "quote_received"
        | "quote_accepted"
        | "message_received"
        | "booking_confirmed"
        | "payment_released"
        | "review_received"
        | "verification_approved"
        | "reward_earned";
      payment_method: "card" | "cash" | "escrow" | "wallet";
      payment_status: "pending" | "held" | "released" | "refunded" | "disputed";
      quote_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "client_messaged"
        | "withdrawn";
      role_membership_state:
        | "not_started"
        | "onboarding"
        | "pending_review"
        | "approved"
        | "rejected"
        | "suspended";
      reward_tier: "bronze" | "silver" | "gold" | "platinum";
      user_role: "client" | "provider" | "admin";
      verification_status:
        | "not_started"
        | "pending"
        | "approved"
        | "rejected"
        | "expired";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      document_type: [
        "id",
        "insurance",
        "certification",
        "license",
        "portfolio",
      ],
      job_status: [
        "draft",
        "open",
        "quoted",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      message_type: [
        "text",
        "system",
        "attachment",
        "quote_update",
        "booking_update",
      ],
      notification_type: [
        "job_posted",
        "quote_received",
        "quote_accepted",
        "message_received",
        "booking_confirmed",
        "payment_released",
        "review_received",
        "verification_approved",
        "reward_earned",
      ],
      payment_method: ["card", "cash", "escrow", "wallet"],
      payment_status: ["pending", "held", "released", "refunded", "disputed"],
      quote_status: [
        "pending",
        "accepted",
        "rejected",
        "client_messaged",
        "withdrawn",
      ],
      role_membership_state: [
        "not_started",
        "onboarding",
        "pending_review",
        "approved",
        "rejected",
        "suspended",
      ],
      reward_tier: ["bronze", "silver", "gold", "platinum"],
      user_role: ["client", "provider", "admin"],
      verification_status: [
        "not_started",
        "pending",
        "approved",
        "rejected",
        "expired",
      ],
    },
  },
} as const;

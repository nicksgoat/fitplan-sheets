export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      circuit_exercises: {
        Row: {
          circuit_id: string
          created_at: string | null
          exercise_id: string
          exercise_order: number
          id: string
          updated_at: string | null
        }
        Insert: {
          circuit_id: string
          created_at?: string | null
          exercise_id: string
          exercise_order: number
          id?: string
          updated_at?: string | null
        }
        Update: {
          circuit_id?: string
          created_at?: string | null
          exercise_id?: string
          exercise_order?: number
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circuit_exercises_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "circuits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circuit_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
        ]
      }
      circuits: {
        Row: {
          created_at: string
          id: string
          name: string
          rest_between_exercises: string | null
          rest_between_rounds: string | null
          rounds: string | null
          updated_at: string
          workout_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          rest_between_exercises?: string | null
          rest_between_rounds?: string | null
          rounds?: string | null
          updated_at?: string
          workout_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          rest_between_exercises?: string | null
          rest_between_rounds?: string | null
          rounds?: string | null
          updated_at?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circuits_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      club_channel_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "club_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      club_channels: {
        Row: {
          club_id: string
          created_at: string
          created_by: string
          description: string | null
          event_id: string | null
          id: string
          is_default: boolean | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          created_by: string
          description?: string | null
          event_id?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          event_id?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_channels_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_channels_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "club_events"
            referencedColumns: ["id"]
          },
        ]
      }
      club_events: {
        Row: {
          attendee_count: number | null
          club_id: string
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          image_url: string | null
          location: string | null
          name: string
          start_time: string
          updated_at: string
        }
        Insert: {
          attendee_count?: number | null
          club_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          start_time: string
          updated_at?: string
        }
        Update: {
          attendee_count?: number | null
          club_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_members: {
        Row: {
          club_id: string
          expires_at: string | null
          id: string
          joined_at: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          premium_expires_at: string | null
          role: string
          status: string
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          club_id: string
          expires_at?: string | null
          id?: string
          joined_at?: string
          membership_type?: Database["public"]["Enums"]["membership_type"]
          premium_expires_at?: string | null
          role?: string
          status?: string
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          club_id?: string
          expires_at?: string | null
          id?: string
          joined_at?: string
          membership_type?: Database["public"]["Enums"]["membership_type"]
          premium_expires_at?: string | null
          role?: string
          status?: string
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_messages: {
        Row: {
          club_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          user_id: string
        }
        Insert: {
          club_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          user_id: string
        }
        Update: {
          club_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_messages_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "club_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      club_posts: {
        Row: {
          club_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
          user_id: string
          workout_id: string | null
        }
        Insert: {
          club_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id: string
          workout_id?: string | null
        }
        Update: {
          club_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_posts_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_product_purchases: {
        Row: {
          amount_paid: number
          created_at: string
          currency: string
          id: string
          product_id: string
          purchase_date: string
          refund_processed_at: string | null
          refund_reason: string | null
          refund_requested_at: string | null
          refund_status: string | null
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string
          currency?: string
          id?: string
          product_id: string
          purchase_date?: string
          refund_processed_at?: string | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          refund_status?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          currency?: string
          id?: string
          product_id?: string
          purchase_date?: string
          refund_processed_at?: string | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          refund_status?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_product_purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "club_products"
            referencedColumns: ["id"]
          },
        ]
      }
      club_products: {
        Row: {
          club_id: string
          created_at: string
          date_time: string | null
          description: string | null
          id: string
          is_active: boolean
          location: string | null
          max_participants: number | null
          name: string
          price_amount: number
          price_currency: string
          product_type: string
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          date_time?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          max_participants?: number | null
          name: string
          price_amount: number
          price_currency?: string
          product_type?: string
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          date_time?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          max_participants?: number | null
          name?: string
          price_amount?: number
          price_currency?: string
          product_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_products_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          club_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_amount: number | null
          plan_currency: string | null
          plan_interval: string | null
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          club_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_amount?: number | null
          plan_currency?: string | null
          plan_interval?: string | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          club_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_amount?: number | null
          plan_currency?: string | null
          plan_interval?: string | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_subscriptions_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          banner_url: string | null
          club_type: Database["public"]["Enums"]["club_type"] | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          logo_url: string | null
          membership_type: Database["public"]["Enums"]["membership_type"] | null
          name: string
          premium_price: number | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          club_type?: Database["public"]["Enums"]["club_type"] | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          logo_url?: string | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          name: string
          premium_price?: number | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          club_type?: Database["public"]["Enums"]["club_type"] | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          membership_type?:
            | Database["public"]["Enums"]["membership_type"]
            | null
          name?: string
          premium_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      combine_correlations: {
        Row: {
          correlation_strength: number
          created_at: string
          drill_name: string
          exercise_category: string | null
          exercise_name: string
          id: string
          is_direct_measurement: boolean
          updated_at: string
        }
        Insert: {
          correlation_strength: number
          created_at?: string
          drill_name: string
          exercise_category?: string | null
          exercise_name: string
          id?: string
          is_direct_measurement?: boolean
          updated_at?: string
        }
        Update: {
          correlation_strength?: number
          created_at?: string
          drill_name?: string
          exercise_category?: string | null
          exercise_name?: string
          id?: string
          is_direct_measurement?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      event_participants: {
        Row: {
          event_id: string
          id: string
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          joined_at?: string
          status?: string
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "club_events"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_library: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at: string
          creator: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          duration: string | null
          id: string
          image_url: string | null
          instructions: string | null
          is_custom: boolean | null
          name: string
          primary_muscle: Database["public"]["Enums"]["primary_muscle"]
          secondary_muscles:
            | Database["public"]["Enums"]["primary_muscle"][]
            | null
          tags: string[] | null
          updated_at: string
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          creator?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_custom?: boolean | null
          name: string
          primary_muscle: Database["public"]["Enums"]["primary_muscle"]
          secondary_muscles?:
            | Database["public"]["Enums"]["primary_muscle"][]
            | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          created_at?: string
          creator?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"] | null
          duration?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_custom?: boolean | null
          name?: string
          primary_muscle?: Database["public"]["Enums"]["primary_muscle"]
          secondary_muscles?:
            | Database["public"]["Enums"]["primary_muscle"][]
            | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      exercise_logs: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          updated_at: string | null
          workout_log_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          updated_at?: string | null
          workout_log_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          updated_at?: string | null
          workout_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_logs_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sets: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          intensity: string | null
          intensity_type: Database["public"]["Enums"]["intensity_type"] | null
          reps: string | null
          rest: string | null
          updated_at: string
          weight: string | null
          weight_type: Database["public"]["Enums"]["weight_type"] | null
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          intensity?: string | null
          intensity_type?: Database["public"]["Enums"]["intensity_type"] | null
          reps?: string | null
          rest?: string | null
          updated_at?: string
          weight?: string | null
          weight_type?: Database["public"]["Enums"]["weight_type"] | null
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          intensity?: string | null
          intensity_type?: Database["public"]["Enums"]["intensity_type"] | null
          reps?: string | null
          rest?: string | null
          updated_at?: string
          weight?: string | null
          weight_type?: Database["public"]["Enums"]["weight_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          circuit_id: string | null
          circuit_order: number | null
          created_at: string
          group_id: string | null
          id: string
          intensity_type: Database["public"]["Enums"]["intensity_type"] | null
          is_circuit: boolean | null
          is_group: boolean | null
          is_in_circuit: boolean | null
          name: string
          notes: string | null
          rep_type: Database["public"]["Enums"]["rep_type"] | null
          updated_at: string
          weight_type: Database["public"]["Enums"]["weight_type"] | null
          workout_id: string
        }
        Insert: {
          circuit_id?: string | null
          circuit_order?: number | null
          created_at?: string
          group_id?: string | null
          id?: string
          intensity_type?: Database["public"]["Enums"]["intensity_type"] | null
          is_circuit?: boolean | null
          is_group?: boolean | null
          is_in_circuit?: boolean | null
          name: string
          notes?: string | null
          rep_type?: Database["public"]["Enums"]["rep_type"] | null
          updated_at?: string
          weight_type?: Database["public"]["Enums"]["weight_type"] | null
          workout_id: string
        }
        Update: {
          circuit_id?: string | null
          circuit_order?: number | null
          created_at?: string
          group_id?: string | null
          id?: string
          intensity_type?: Database["public"]["Enums"]["intensity_type"] | null
          is_circuit?: boolean | null
          is_group?: boolean | null
          is_in_circuit?: boolean | null
          name?: string
          notes?: string | null
          rep_type?: Database["public"]["Enums"]["rep_type"] | null
          updated_at?: string
          weight_type?: Database["public"]["Enums"]["weight_type"] | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      liked_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      "NFL Combine Database": {
        Row: {
          "3Cone": string | null
          "40yd": string | null
          Bench: string | null
          "Broad Jump": string | null
          Draft_Pick: number | null
          Draft_Round: number | null
          Draft_Team: string | null
          Draft_Year: number | null
          Height_in: number | null
          id: number
          Player: string | null
          Pos: string | null
          School: string | null
          Shuttle: string | null
          Vertical: string | null
          Weight_lb: number | null
        }
        Insert: {
          "3Cone"?: string | null
          "40yd"?: string | null
          Bench?: string | null
          "Broad Jump"?: string | null
          Draft_Pick?: number | null
          Draft_Round?: number | null
          Draft_Team?: string | null
          Draft_Year?: number | null
          Height_in?: number | null
          id: number
          Player?: string | null
          Pos?: string | null
          School?: string | null
          Shuttle?: string | null
          Vertical?: string | null
          Weight_lb?: number | null
        }
        Update: {
          "3Cone"?: string | null
          "40yd"?: string | null
          Bench?: string | null
          "Broad Jump"?: string | null
          Draft_Pick?: number | null
          Draft_Round?: number | null
          Draft_Team?: string | null
          Draft_Year?: number | null
          Height_in?: number | null
          id?: number
          Player?: string | null
          Pos?: string | null
          School?: string | null
          Shuttle?: string | null
          Vertical?: string | null
          Weight_lb?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          social_links: Json | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          order_num: number
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          order_num: number
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          order_num?: number
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_sets: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          order_num: number
          reps: number | null
          session_exercise_id: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          order_num: number
          reps?: number | null
          session_exercise_id: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          order_num?: number
          reps?: number | null
          session_exercise_id?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_sets_session_exercise_id_fkey"
            columns: ["session_exercise_id"]
            isOneToOne: false
            referencedRelation: "session_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      set_logs: {
        Row: {
          created_at: string | null
          exercise_log_id: string
          id: string
          notes: string | null
          reps: number
          rest_time: number | null
          set_number: number
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_log_id: string
          id?: string
          notes?: string | null
          reps: number
          rest_time?: number | null
          set_number: number
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_log_id?: string
          id?: string
          notes?: string | null
          reps?: number
          rest_time?: number | null
          set_number?: number
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_exercise_log_id_fkey"
            columns: ["exercise_log_id"]
            isOneToOne: false
            referencedRelation: "exercise_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_combine_estimations: {
        Row: {
          created_at: string
          drill_name: string
          estimated_score: string
          estimation_type: string
          id: string
          percentile: number | null
          position_percentile: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drill_name: string
          estimated_score: string
          estimation_type?: string
          id?: string
          percentile?: number | null
          position_percentile?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drill_name?: string
          estimated_score?: string
          estimation_type?: string
          id?: string
          percentile?: number | null
          position_percentile?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weeks: {
        Row: {
          created_at: string
          id: string
          name: string
          order_num: number
          program_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_num: number
          program_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_num?: number
          program_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string
          exercise_order: number
          id: string
          notes: string | null
          updated_at: string | null
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          exercise_order: number
          id?: string
          notes?: string | null
          updated_at?: string | null
          workout_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          exercise_order?: number
          id?: string
          notes?: string | null
          updated_at?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          created_at: string | null
          duration: number
          end_time: string
          id: string
          notes: string | null
          rating: number | null
          start_time: string
          updated_at: string | null
          user_id: string
          workout_id: string
        }
        Insert: {
          created_at?: string | null
          duration: number
          end_time: string
          id?: string
          notes?: string | null
          rating?: number | null
          start_time: string
          updated_at?: string | null
          user_id: string
          workout_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number
          end_time?: string
          id?: string
          notes?: string | null
          rating?: number | null
          start_time?: string
          updated_at?: string | null
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_programs: {
        Row: {
          category: string
          comments: number | null
          created_at: string | null
          creator: Json | null
          description: string | null
          difficulty: string
          duration: number
          id: string
          image_url: string | null
          is_custom: boolean | null
          likes: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          category: string
          comments?: number | null
          created_at?: string | null
          creator?: Json | null
          description?: string | null
          difficulty: string
          duration: number
          id?: string
          image_url?: string | null
          is_custom?: boolean | null
          likes?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          comments?: number | null
          created_at?: string | null
          creator?: Json | null
          description?: string | null
          difficulty?: string
          duration?: number
          id?: string
          image_url?: string | null
          is_custom?: boolean | null
          likes?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration: number | null
          id: string
          started_at: string
          updated_at: string
          user_id: string
          workout_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          started_at?: string
          updated_at?: string
          user_id: string
          workout_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_weeks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          program_id: string
          title: string
          updated_at: string | null
          week_number: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          program_id: string
          title: string
          updated_at?: string | null
          week_number: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          program_id?: string
          title?: string
          updated_at?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_weeks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          day_num: number
          id: string
          name: string
          updated_at: string
          week_id: string
        }
        Insert: {
          created_at?: string
          day_num: number
          id?: string
          name: string
          updated_at?: string
          week_id: string
        }
        Update: {
          created_at?: string
          day_num?: number
          id?: string
          name?: string
          updated_at?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "weeks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_combine_percentiles: {
        Args: {
          user_score: string
          drill_name: string
          player_position?: string
        }
        Returns: {
          percentile: number
          position_percentile: number
          top_score: string
        }[]
      }
      calculate_user_combine_estimates: {
        Args: { user_id_param: string }
        Returns: Json
      }
      create_club_event: {
        Args: {
          p_club_id: string
          p_name: string
          p_description: string
          p_start_time: string
          p_end_time: string
          p_created_by: string
        }
        Returns: string
      }
      create_event: {
        Args: {
          p_club_id: string
          p_name: string
          p_description: string
          p_start_time: string
          p_end_time: string
          p_created_by: string
        }
        Returns: string
      }
      create_user_profile: {
        Args: {
          user_id: string
          user_username: string
          user_display_name: string
        }
        Returns: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          social_links: Json | null
          updated_at: string | null
          username: string | null
          website: string | null
        }[]
      }
      ensure_club_creators_are_owners: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_user_combine_data: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_club_events: {
        Args: { p_club_id: string }
        Returns: {
          attendee_count: number | null
          club_id: string
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          image_url: string | null
          location: string | null
          name: string
          start_time: string
          updated_at: string
        }[]
      }
      get_nfl_combine_averages: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_table_structure: {
        Args: { table_name: string }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: string
          column_default: string
        }[]
      }
      is_club_admin: {
        Args: { club_id_param: string; user_id_param: string }
        Returns: boolean
      }
      is_club_creator: {
        Args: { club_id_param: string; user_id_param: string }
        Returns: boolean
      }
      is_club_member: {
        Args: { club_id_param: string; user_id_param: string }
        Returns: boolean
      }
      is_club_member_safe: {
        Args: { club_id_param: string; user_id_param: string }
        Returns: boolean
      }
      join_event: {
        Args: { p_event_id: string; p_user_id: string; p_status?: string }
        Returns: boolean
      }
      leave_event: {
        Args: { p_event_id: string; p_user_id: string }
        Returns: boolean
      }
      list_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          table_schema: string
        }[]
      }
      recommend_combine_exercises: {
        Args: { user_id_param: string }
        Returns: {
          drill_name: string
          current_score: string
          percentile: number
          recommended_exercises: Json
        }[]
      }
      run_sql_query: {
        Args: { query: string }
        Returns: Json
      }
      run_sql_query_with_params: {
        Args: { query: string; params_array: Json }
        Returns: Json
      }
    }
    Enums: {
      club_type: "fitness" | "sports" | "wellness" | "nutrition" | "other"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      exercise_category:
        | "barbell"
        | "dumbbell"
        | "machine"
        | "bodyweight"
        | "kettlebell"
        | "cable"
        | "cardio"
        | "other"
      intensity_type: "rpe" | "arpe" | "percent" | "absolute" | "velocity"
      membership_type: "free" | "premium" | "vip"
      primary_muscle:
        | "chest"
        | "back"
        | "shoulders"
        | "biceps"
        | "triceps"
        | "quadriceps"
        | "hamstrings"
        | "glutes"
        | "calves"
        | "abs"
        | "forearms"
        | "full body"
        | "upper chest"
        | "core"
        | "other"
      rep_type:
        | "fixed"
        | "range"
        | "descending"
        | "time"
        | "each-side"
        | "amrap"
      weight_type:
        | "pounds"
        | "kilos"
        | "distance-m"
        | "distance-ft"
        | "distance-yd"
        | "distance-mi"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      club_type: ["fitness", "sports", "wellness", "nutrition", "other"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      exercise_category: [
        "barbell",
        "dumbbell",
        "machine",
        "bodyweight",
        "kettlebell",
        "cable",
        "cardio",
        "other",
      ],
      intensity_type: ["rpe", "arpe", "percent", "absolute", "velocity"],
      membership_type: ["free", "premium", "vip"],
      primary_muscle: [
        "chest",
        "back",
        "shoulders",
        "biceps",
        "triceps",
        "quadriceps",
        "hamstrings",
        "glutes",
        "calves",
        "abs",
        "forearms",
        "full body",
        "upper chest",
        "core",
        "other",
      ],
      rep_type: ["fixed", "range", "descending", "time", "each-side", "amrap"],
      weight_type: [
        "pounds",
        "kilos",
        "distance-m",
        "distance-ft",
        "distance-yd",
        "distance-mi",
      ],
    },
  },
} as const

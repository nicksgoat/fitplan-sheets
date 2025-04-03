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
          exercise_id: string
          order_num: number
        }
        Insert: {
          circuit_id: string
          exercise_id: string
          order_num: number
        }
        Update: {
          circuit_id?: string
          exercise_id?: string
          order_num?: number
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
            referencedRelation: "exercises"
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
      club_events: {
        Row: {
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
      [_ in never]: never
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

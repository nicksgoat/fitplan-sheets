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
          created_at: string
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          username?: string | null
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
      intensity_type: "rpe" | "arpe" | "percent" | "absolute" | "velocity"
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

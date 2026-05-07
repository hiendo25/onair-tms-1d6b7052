export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assignment_submissions: {
        Row: {
          assignment_id: string
          assignment_title: string
          assignment_type: string
          created_at: string
          deadline: string | null
          id: string
          org_id: string
          score: number | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          assignment_title?: string
          assignment_type?: string
          created_at?: string
          deadline?: string | null
          id?: string
          org_id: string
          score?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          assignment_title?: string
          assignment_type?: string
          created_at?: string
          deadline?: string | null
          id?: string
          org_id?: string
          score?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          assigned_count: number
          code: string
          completed_count: number
          created_at: string
          deadline: string | null
          description: string
          id: string
          org_id: string
          status: string
          title: string
          total_questions: number
          type: string
          updated_at: string
        }
        Insert: {
          assigned_count?: number
          code: string
          completed_count?: number
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          org_id: string
          status?: string
          title: string
          total_questions?: number
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_count?: number
          code?: string
          completed_count?: number
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          org_id?: string
          status?: string
          title?: string
          total_questions?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          address: string
          code: string
          created_at: string
          employees: number
          id: string
          manager: string
          name: string
          org_id: string
          phone: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string
          code: string
          created_at?: string
          employees?: number
          id?: string
          manager?: string
          name: string
          org_id: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          code?: string
          created_at?: string
          employees?: number
          id?: string
          manager?: string
          name?: string
          org_id?: string
          phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          issued_count: number
          org_id: string
          status: string
          template_url: string
          title: string
          updated_at: string
          valid_months: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string
          id?: string
          issued_count?: number
          org_id: string
          status?: string
          template_url?: string
          title: string
          updated_at?: string
          valid_months?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          issued_count?: number
          org_id?: string
          status?: string
          template_url?: string
          title?: string
          updated_at?: string
          valid_months?: number
        }
        Relationships: []
      }
      classrooms: {
        Row: {
          capacity: number
          code: string
          created_at: string
          description: string
          end_date: string | null
          id: string
          instructor: string
          location: string
          org_id: string
          start_date: string | null
          status: string
          students_count: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          code: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          instructor?: string
          location?: string
          org_id: string
          start_date?: string | null
          status?: string
          students_count?: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          code?: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          instructor?: string
          location?: string
          org_id?: string
          start_date?: string | null
          status?: string
          students_count?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          content: string
          course_id: string
          created_at: string
          id: string
          lesson_type: string
          org_id: string
          section_id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          course_id: string
          created_at?: string
          id?: string
          lesson_type?: string
          org_id: string
          section_id: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          lesson_type?: string
          org_id?: string
          section_id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "online_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          course_id: string
          created_at: string
          description: string
          id: string
          org_id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string
          id?: string
          org_id: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string
          id?: string
          org_id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "online_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          branch: string
          code: string
          created_at: string
          employees: number
          head: string
          id: string
          name: string
          org_id: string
          status: string
          updated_at: string
        }
        Insert: {
          branch?: string
          code: string
          created_at?: string
          employees?: number
          head?: string
          id?: string
          name: string
          org_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          branch?: string
          code?: string
          created_at?: string
          employees?: number
          head?: string
          id?: string
          name?: string
          org_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string
          branch: string
          created_at: string
          department: string
          email: string
          employee_code: string
          id: string
          joined_at: string | null
          name: string
          org_id: string
          phone: string
          position: string
          role: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string
          branch?: string
          created_at?: string
          department?: string
          email?: string
          employee_code?: string
          id?: string
          joined_at?: string | null
          name: string
          org_id: string
          phone?: string
          position?: string
          role?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string
          branch?: string
          created_at?: string
          department?: string
          email?: string
          employee_code?: string
          id?: string
          joined_at?: string | null
          name?: string
          org_id?: string
          phone?: string
          position?: string
          role?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          cards_count: number
          category: string
          code: string
          created_at: string
          description: string
          id: string
          org_id: string
          status: string
          students_count: number
          title: string
          updated_at: string
        }
        Insert: {
          cards_count?: number
          category?: string
          code: string
          created_at?: string
          description?: string
          id?: string
          org_id: string
          status?: string
          students_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          cards_count?: number
          category?: string
          code?: string
          created_at?: string
          description?: string
          id?: string
          org_id?: string
          status?: string
          students_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gamifications: {
        Row: {
          active: boolean
          badge_url: string
          code: string
          condition: string
          created_at: string
          description: string
          id: string
          org_id: string
          points: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge_url?: string
          code: string
          condition?: string
          created_at?: string
          description?: string
          id?: string
          org_id: string
          points?: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge_url?: string
          code?: string
          condition?: string
          created_at?: string
          description?: string
          id?: string
          org_id?: string
          points?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          category: string
          code: string
          courses_count: number
          created_at: string
          description: string
          duration_hours: number
          id: string
          org_id: string
          status: string
          students_count: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          code: string
          courses_count?: number
          created_at?: string
          description?: string
          duration_hours?: number
          id?: string
          org_id: string
          status?: string
          students_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          courses_count?: number
          created_at?: string
          description?: string
          duration_hours?: number
          id?: string
          org_id?: string
          status?: string
          students_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      online_courses: {
        Row: {
          category: string
          code: string
          cover_url: string
          created_at: string
          description: string
          duration_minutes: number
          id: string
          instructor: string
          is_required: boolean
          lessons_count: number
          level: string
          org_id: string
          status: string
          students_count: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          code: string
          cover_url?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          instructor?: string
          is_required?: boolean
          lessons_count?: number
          level?: string
          org_id: string
          status?: string
          students_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          code?: string
          cover_url?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          instructor?: string
          is_required?: boolean
          lessons_count?: number
          level?: string
          org_id?: string
          status?: string
          students_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_roles: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          is_admin: boolean
          is_instructor: boolean
          is_student: boolean
          name: string
          org_id: string
          permissions: number
          updated_at: string
          users: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string
          id?: string
          is_admin?: boolean
          is_instructor?: boolean
          is_student?: boolean
          name: string
          org_id: string
          permissions?: number
          updated_at?: string
          users?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          is_admin?: boolean
          is_instructor?: boolean
          is_student?: boolean
          name?: string
          org_id?: string
          permissions?: number
          updated_at?: string
          users?: number
        }
        Relationships: [
          {
            foreignKeyName: "org_roles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_color: string
          created_at: string
          domain: string
          id: string
          industry: string
          name: string
          short: string
        }
        Insert: {
          brand_color: string
          created_at?: string
          domain: string
          id: string
          industry: string
          name: string
          short: string
        }
        Update: {
          brand_color?: string
          created_at?: string
          domain?: string
          id?: string
          industry?: string
          name?: string
          short?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          code: string
          completed_count: number
          created_at: string
          description: string
          end_date: string | null
          id: string
          org_id: string
          start_date: string | null
          status: string
          target_count: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          code: string
          completed_count?: number
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          org_id: string
          start_date?: string | null
          status?: string
          target_count?: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          code?: string
          completed_count?: number
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          org_id?: string
          start_date?: string | null
          status?: string
          target_count?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          category: string
          correct_answer: string
          created_at: string
          difficulty: string
          explanation: string
          id: string
          options: Json
          org_id: string
          points: number
          question: string
          tags: string[]
          type: string
          updated_at: string
        }
        Insert: {
          category?: string
          correct_answer?: string
          created_at?: string
          difficulty?: string
          explanation?: string
          id?: string
          options?: Json
          org_id: string
          points?: number
          question: string
          tags?: string[]
          type?: string
          updated_at?: string
        }
        Update: {
          category?: string
          correct_answer?: string
          created_at?: string
          difficulty?: string
          explanation?: string
          id?: string
          options?: Json
          org_id?: string
          points?: number
          question?: string
          tags?: string[]
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      surveys: {
        Row: {
          anonymous: boolean
          code: string
          created_at: string
          description: string
          end_date: string | null
          id: string
          org_id: string
          responses_count: number
          start_date: string | null
          status: string
          target_count: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          anonymous?: boolean
          code: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          org_id: string
          responses_count?: number
          start_date?: string | null
          status?: string
          target_count?: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          anonymous?: boolean
          code?: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          org_id?: string
          responses_count?: number
          start_date?: string | null
          status?: string
          target_count?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          course_id: string
          course_title: string
          created_at: string
          id: string
          org_id: string
          progress: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          course_title?: string
          created_at?: string
          id?: string
          org_id: string
          progress?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          course_title?: string
          created_at?: string
          id?: string
          org_id?: string
          progress?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          org_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type?: string
          org_id: string
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          org_id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_learning_path_progress: {
        Row: {
          completed_lessons: number
          created_at: string
          id: string
          is_active: boolean
          org_id: string
          path_id: string
          path_title: string
          progress: number
          total_lessons: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_lessons?: number
          created_at?: string
          id?: string
          is_active?: boolean
          org_id: string
          path_id: string
          path_title?: string
          progress?: number
          total_lessons?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_lessons?: number
          created_at?: string
          id?: string
          is_active?: boolean
          org_id?: string
          path_id?: string
          path_title?: string
          progress?: number
          total_lessons?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          average_score: number
          branch: string
          completed_courses: number
          created_at: string
          display_name: string
          hours_learned: number
          id: string
          org_id: string
          quizzes_taken: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_score?: number
          branch?: string
          completed_courses?: number
          created_at?: string
          display_name?: string
          hours_learned?: number
          id?: string
          org_id: string
          quizzes_taken?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_score?: number
          branch?: string
          completed_courses?: number
          created_at?: string
          display_name?: string
          hours_learned?: number
          id?: string
          org_id?: string
          quizzes_taken?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          created_at: string
          id: string
          org_id: string
          rank: string
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          rank?: string
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          rank?: string
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
    },
  },
} as const

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
          created_by: string | null
          deadline: string | null
          description: string
          id: string
          max_attempts: number | null
          org_id: string
          pass_score: number
          show_results: boolean
          shuffle_answers: boolean
          shuffle_questions: boolean
          status: string
          time_limit_minutes: number | null
          title: string
          total_points: number
          total_questions: number
          type: string
          updated_at: string
        }
        Insert: {
          assigned_count?: number
          code: string
          completed_count?: number
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string
          id?: string
          max_attempts?: number | null
          org_id: string
          pass_score?: number
          show_results?: boolean
          shuffle_answers?: boolean
          shuffle_questions?: boolean
          status?: string
          time_limit_minutes?: number | null
          title: string
          total_points?: number
          total_questions?: number
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_count?: number
          code?: string
          completed_count?: number
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string
          id?: string
          max_attempts?: number | null
          org_id?: string
          pass_score?: number
          show_results?: boolean
          shuffle_answers?: boolean
          shuffle_questions?: boolean
          status?: string
          time_limit_minutes?: number | null
          title?: string
          total_points?: number
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
      certificate_frames: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_default: boolean
          name: string
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_default?: boolean
          name: string
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_default?: boolean
          name?: string
          org_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          code: string
          content: Json
          created_at: string
          description: string
          frame_url: string
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
          content?: Json
          created_at?: string
          description?: string
          frame_url?: string
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
          content?: Json
          created_at?: string
          description?: string
          frame_url?: string
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
      classroom_agenda: {
        Row: {
          classroom_id: string
          created_at: string
          end_at: string
          id: string
          order_index: number
          org_id: string
          session_id: string | null
          start_at: string
          title: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          end_at: string
          id?: string
          order_index?: number
          org_id: string
          session_id?: string | null
          start_at: string
          title: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          end_at?: string
          id?: string
          order_index?: number
          org_id?: string
          session_id?: string | null
          start_at?: string
          title?: string
        }
        Relationships: []
      }
      classroom_assignments: {
        Row: {
          assignment_id: string
          classroom_id: string
          created_at: string
          id: string
          org_id: string
          session_id: string | null
        }
        Insert: {
          assignment_id: string
          classroom_id: string
          created_at?: string
          id?: string
          org_id: string
          session_id?: string | null
        }
        Update: {
          assignment_id?: string
          classroom_id?: string
          created_at?: string
          id?: string
          org_id?: string
          session_id?: string | null
        }
        Relationships: []
      }
      classroom_courses: {
        Row: {
          classroom_id: string
          course_id: string
          course_order: number
          created_at: string
          end_at: string | null
          id: string
          instructors: Json
          org_id: string
          session_id: string | null
          start_at: string | null
        }
        Insert: {
          classroom_id: string
          course_id: string
          course_order?: number
          created_at?: string
          end_at?: string | null
          id?: string
          instructors?: Json
          org_id: string
          session_id?: string | null
          start_at?: string | null
        }
        Update: {
          classroom_id?: string
          course_id?: string
          course_order?: number
          created_at?: string
          end_at?: string | null
          id?: string
          instructors?: Json
          org_id?: string
          session_id?: string | null
          start_at?: string | null
        }
        Relationships: []
      }
      classroom_flashcards: {
        Row: {
          classroom_id: string
          created_at: string
          display_order: number
          flashcard_id: string
          id: string
          org_id: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          display_order?: number
          flashcard_id: string
          id?: string
          org_id: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          display_order?: number
          flashcard_id?: string
          id?: string
          org_id?: string
        }
        Relationships: []
      }
      classroom_qr_settings: {
        Row: {
          classroom_id: string
          created_at: string
          enabled: boolean
          end_offset_minutes: number
          id: string
          org_id: string
          qr_token: string
          session_id: string | null
          start_offset_minutes: number
          updated_at: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          enabled?: boolean
          end_offset_minutes?: number
          id?: string
          org_id: string
          qr_token?: string
          session_id?: string | null
          start_offset_minutes?: number
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          enabled?: boolean
          end_offset_minutes?: number
          id?: string
          org_id?: string
          qr_token?: string
          session_id?: string | null
          start_offset_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      classroom_sessions: {
        Row: {
          classroom_id: string
          created_at: string
          description: string
          end_at: string | null
          id: string
          location: string
          meeting_id: string
          meeting_password: string
          meeting_provider: string
          meeting_url: string
          org_id: string
          session_order: number
          start_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          description?: string
          end_at?: string | null
          id?: string
          location?: string
          meeting_id?: string
          meeting_password?: string
          meeting_provider?: string
          meeting_url?: string
          org_id: string
          session_order?: number
          start_at?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          description?: string
          end_at?: string | null
          id?: string
          location?: string
          meeting_id?: string
          meeting_password?: string
          meeting_provider?: string
          meeting_url?: string
          org_id?: string
          session_order?: number
          start_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      classroom_students: {
        Row: {
          assigned_at: string
          classroom_id: string
          employee_id: string | null
          id: string
          org_id: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string
          classroom_id: string
          employee_id?: string | null
          id?: string
          org_id: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string
          classroom_id?: string
          employee_id?: string | null
          id?: string
          org_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      classrooms: {
        Row: {
          capacity: number
          certificate_id: string | null
          code: string
          cover_url: string
          created_at: string
          created_by: string | null
          delivery: string
          description: string
          end_at: string | null
          end_date: string | null
          id: string
          instructor: string
          location: string
          materials: Json
          meeting_id: string
          meeting_password: string
          meeting_provider: string
          meeting_url: string
          mode: string
          objective: string
          org_id: string
          start_at: string | null
          start_date: string | null
          status: string
          students_count: number
          title: string
          topics: string[]
          type: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          certificate_id?: string | null
          code: string
          cover_url?: string
          created_at?: string
          created_by?: string | null
          delivery?: string
          description?: string
          end_at?: string | null
          end_date?: string | null
          id?: string
          instructor?: string
          location?: string
          materials?: Json
          meeting_id?: string
          meeting_password?: string
          meeting_provider?: string
          meeting_url?: string
          mode?: string
          objective?: string
          org_id: string
          start_at?: string | null
          start_date?: string | null
          status?: string
          students_count?: number
          title: string
          topics?: string[]
          type?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          certificate_id?: string | null
          code?: string
          cover_url?: string
          created_at?: string
          created_by?: string | null
          delivery?: string
          description?: string
          end_at?: string | null
          end_date?: string | null
          id?: string
          instructor?: string
          location?: string
          materials?: Json
          meeting_id?: string
          meeting_password?: string
          meeting_provider?: string
          meeting_url?: string
          mode?: string
          objective?: string
          org_id?: string
          start_at?: string | null
          start_date?: string | null
          status?: string
          students_count?: number
          title?: string
          topics?: string[]
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_audit_logs: {
        Row: {
          action: string
          changes: Json
          course_id: string | null
          created_at: string
          id: string
          org_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json
          course_id?: string | null
          created_at?: string
          id?: string
          org_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json
          course_id?: string | null
          created_at?: string
          id?: string
          org_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          org_id: string
          progress: number
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          org_id: string
          progress?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          org_id?: string
          progress?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          meta: Json
          org_id: string
          progress_pct: number
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          meta?: Json
          org_id: string
          progress_pct?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          meta?: Json
          org_id?: string
          progress_pct?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          content: string
          content_meta: Json
          content_url: string
          course_id: string
          created_at: string
          description: string
          duration_seconds: number
          id: string
          lesson_type: string
          org_id: string
          quiz_assignment_id: string | null
          section_id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          content_meta?: Json
          content_url?: string
          course_id: string
          created_at?: string
          description?: string
          duration_seconds?: number
          id?: string
          lesson_type?: string
          org_id: string
          quiz_assignment_id?: string | null
          section_id: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          content_meta?: Json
          content_url?: string
          course_id?: string
          created_at?: string
          description?: string
          duration_seconds?: number
          id?: string
          lesson_type?: string
          org_id?: string
          quiz_assignment_id?: string | null
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      exam_assignments: {
        Row: {
          assigned_by: string | null
          audience: Json
          available_from: string | null
          created_at: string
          deadline: string | null
          exam_id: string
          exam_snapshot: Json
          id: string
          org_id: string
          status: string
          student_ids: string[]
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          audience?: Json
          available_from?: string | null
          created_at?: string
          deadline?: string | null
          exam_id: string
          exam_snapshot?: Json
          id?: string
          org_id: string
          status?: string
          student_ids?: string[]
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          audience?: Json
          available_from?: string | null
          created_at?: string
          deadline?: string | null
          exam_id?: string
          exam_snapshot?: Json
          id?: string
          org_id?: string
          status?: string
          student_ids?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_assignments_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          answers: Json
          attempt_number: number
          created_at: string
          exam_assignment_id: string
          id: string
          org_id: string
          passed: boolean | null
          score: number | null
          started_at: string
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          attempt_number?: number
          created_at?: string
          exam_assignment_id: string
          id?: string
          org_id: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          attempt_number?: number
          created_at?: string
          exam_assignment_id?: string
          id?: string
          org_id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_assignment_id_fkey"
            columns: ["exam_assignment_id"]
            isOneToOne: false
            referencedRelation: "exam_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          assignment_id: string
          created_at: string
          id: string
          org_id: string
          points: number
          question_id: string
          sort_order: number
        }
        Insert: {
          assignment_id: string
          created_at?: string
          id?: string
          org_id: string
          points?: number
          question_id: string
          sort_order?: number
        }
        Update: {
          assignment_id?: string
          created_at?: string
          id?: string
          org_id?: string
          points?: number
          question_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          cards_count: number
          category: string
          code: string
          content: string
          created_at: string
          description: string
          enabled: boolean
          id: string
          image_url: string
          name: string | null
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
          content?: string
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          image_url?: string
          name?: string | null
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
          content?: string
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          image_url?: string
          name?: string | null
          org_id?: string
          status?: string
          students_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gamification_settings: {
        Row: {
          assignment_enabled: boolean
          assignment_points: number
          class_enabled: boolean
          class_points: number
          course_enabled: boolean
          course_points: number
          created_at: string
          enabled: boolean
          id: string
          org_id: string
          path_enabled: boolean
          path_points: number
          phase_enabled: boolean
          phase_points: number
          updated_at: string
        }
        Insert: {
          assignment_enabled?: boolean
          assignment_points?: number
          class_enabled?: boolean
          class_points?: number
          course_enabled?: boolean
          course_points?: number
          created_at?: string
          enabled?: boolean
          id?: string
          org_id: string
          path_enabled?: boolean
          path_points?: number
          phase_enabled?: boolean
          phase_points?: number
          updated_at?: string
        }
        Update: {
          assignment_enabled?: boolean
          assignment_points?: number
          class_enabled?: boolean
          class_points?: number
          course_enabled?: boolean
          course_points?: number
          created_at?: string
          enabled?: boolean
          id?: string
          org_id?: string
          path_enabled?: boolean
          path_points?: number
          phase_enabled?: boolean
          phase_points?: number
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
          icon: string
          id: string
          org_id: string
          points: number
          priority: number
          title: string
          type: string
          updated_at: string
          xp_required: number
        }
        Insert: {
          active?: boolean
          badge_url?: string
          code: string
          condition?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          org_id: string
          points?: number
          priority?: number
          title: string
          type?: string
          updated_at?: string
          xp_required?: number
        }
        Update: {
          active?: boolean
          badge_url?: string
          code?: string
          condition?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          org_id?: string
          points?: number
          priority?: number
          title?: string
          type?: string
          updated_at?: string
          xp_required?: number
        }
        Relationships: []
      }
      learning_activity: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json
          org_id: string
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json
          org_id: string
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json
          org_id?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_path_audience: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          learning_path_id: string
          org_id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          learning_path_id: string
          org_id: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          learning_path_id?: string
          org_id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_audience_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          deadline: string | null
          enrolled_at: string
          id: string
          learning_path_id: string
          org_id: string
          progress: number
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          enrolled_at?: string
          id?: string
          learning_path_id: string
          org_id: string
          progress?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          enrolled_at?: string
          id?: string
          learning_path_id?: string
          org_id?: string
          progress?: number
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_enrollments_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_settings: {
        Row: {
          allow_retake: boolean
          completion_threshold: number
          created_at: string
          deadline_days: number | null
          id: string
          learning_path_id: string
          org_id: string
          sequential_mode: boolean
          updated_at: string
        }
        Insert: {
          allow_retake?: boolean
          completion_threshold?: number
          created_at?: string
          deadline_days?: number | null
          id?: string
          learning_path_id: string
          org_id: string
          sequential_mode?: boolean
          updated_at?: string
        }
        Update: {
          allow_retake?: boolean
          completion_threshold?: number
          created_at?: string
          deadline_days?: number | null
          id?: string
          learning_path_id?: string
          org_id?: string
          sequential_mode?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_settings_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: true
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_stage_assignments: {
        Row: {
          assignment_id: string
          created_at: string
          id: string
          org_id: string
          required: boolean
          stage_id: string
          unlock_condition: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          id?: string
          org_id: string
          required?: boolean
          stage_id: string
          unlock_condition?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          id?: string
          org_id?: string
          required?: boolean
          stage_id?: string
          unlock_condition?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_stage_assignments_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_stage_assignments_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "learning_path_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_stage_courses: {
        Row: {
          course_id: string
          course_order: number
          created_at: string
          id: string
          org_id: string
          stage_id: string
        }
        Insert: {
          course_id: string
          course_order?: number
          created_at?: string
          id?: string
          org_id: string
          stage_id: string
        }
        Update: {
          course_id?: string
          course_order?: number
          created_at?: string
          id?: string
          org_id?: string
          stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_stage_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "online_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_stage_courses_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "learning_path_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_stages: {
        Row: {
          created_at: string
          description: string
          end_date: string | null
          id: string
          learning_path_id: string
          name: string
          org_id: string
          stage_order: number
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          learning_path_id: string
          name: string
          org_id: string
          stage_order?: number
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          learning_path_id?: string
          name?: string
          org_id?: string
          stage_order?: number
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_stages_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_path_versions: {
        Row: {
          change_note: string
          changed_at: string
          changed_by: string | null
          id: string
          learning_path_id: string
          org_id: string
          snapshot: Json
          version: number
        }
        Insert: {
          change_note?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          learning_path_id: string
          org_id: string
          snapshot?: Json
          version: number
        }
        Update: {
          change_note?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          learning_path_id?: string
          org_id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_versions_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          category: string
          code: string
          courses_count: number
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string
          duration_hours: number
          id: string
          org_id: string
          published_at: string | null
          status: string
          students_count: number
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category?: string
          code: string
          courses_count?: number
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          duration_hours?: number
          id?: string
          org_id: string
          published_at?: string | null
          status?: string
          students_count?: number
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          code?: string
          courses_count?: number
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          duration_hours?: number
          id?: string
          org_id?: string
          published_at?: string | null
          status?: string
          students_count?: number
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          channel: string
          created_at: string
          id: string
          org_id: string
          read: boolean
          ref_id: string | null
          ref_type: string | null
          sent_at: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          org_id: string
          read?: boolean
          ref_id?: string | null
          ref_type?: string | null
          sent_at?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          org_id?: string
          read?: boolean
          ref_id?: string | null
          ref_type?: string | null
          sent_at?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      online_courses: {
        Row: {
          author_id: string | null
          author_name: string
          category: string
          certificate_id: string | null
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
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string
          category?: string
          certificate_id?: string | null
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
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string
          category?: string
          certificate_id?: string | null
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
          tags?: string[]
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
          approved_by: string | null
          budget: number | null
          code: string
          completed_count: number
          created_at: string
          created_by: string | null
          description: string
          end_date: string | null
          id: string
          objective: string | null
          org_id: string
          rejection_reason: string | null
          start_date: string | null
          status: string
          target_count: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          budget?: number | null
          code: string
          completed_count?: number
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string | null
          id?: string
          objective?: string | null
          org_id: string
          rejection_reason?: string | null
          start_date?: string | null
          status?: string
          target_count?: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          budget?: number | null
          code?: string
          completed_count?: number
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string | null
          id?: string
          objective?: string | null
          org_id?: string
          rejection_reason?: string | null
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
          correct_answers: Json
          created_at: string
          difficulty: string
          explanation: string
          folder_id: string | null
          id: string
          options: Json
          org_id: string
          points: number
          question: string
          status: string
          tags: string[]
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          category?: string
          correct_answer?: string
          correct_answers?: Json
          created_at?: string
          difficulty?: string
          explanation?: string
          folder_id?: string | null
          id?: string
          options?: Json
          org_id: string
          points?: number
          question: string
          status?: string
          tags?: string[]
          title?: string
          type?: string
          updated_at?: string
        }
        Update: {
          category?: string
          correct_answer?: string
          correct_answers?: Json
          created_at?: string
          difficulty?: string
          explanation?: string
          folder_id?: string | null
          id?: string
          options?: Json
          org_id?: string
          points?: number
          question?: string
          status?: string
          tags?: string[]
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "question_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      question_folders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          org_id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          org_id: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          org_id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "question_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_answers: {
        Row: {
          created_at: string
          id: string
          org_id: string
          question_id: string
          response_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          question_id: string
          response_id: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          question_id?: string
          response_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "survey_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "survey_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          org_id: string
          start_date: string | null
          status: string
          student_ids: string[]
          survey_id: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          org_id: string
          start_date?: string | null
          status?: string
          student_ids?: string[]
          survey_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          org_id?: string
          start_date?: string | null
          status?: string
          student_ids?: string[]
          survey_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "survey_assignments_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          content: string
          correct_answer: Json | null
          created_at: string
          id: string
          options: Json
          order_index: number
          org_id: string
          required: boolean
          survey_id: string
          type: string
        }
        Insert: {
          content: string
          correct_answer?: Json | null
          created_at?: string
          id?: string
          options?: Json
          order_index?: number
          org_id: string
          required?: boolean
          survey_id: string
          type: string
        }
        Update: {
          content?: string
          correct_answer?: Json | null
          created_at?: string
          id?: string
          options?: Json
          order_index?: number
          org_id?: string
          required?: boolean
          survey_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          assignment_id: string | null
          created_at: string
          id: string
          org_id: string
          submitted_at: string
          survey_id: string
          user_id: string | null
          version: number
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          id?: string
          org_id: string
          submitted_at?: string
          survey_id: string
          user_id?: string | null
          version?: number
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          id?: string
          org_id?: string
          submitted_at?: string
          survey_id?: string
          user_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "survey_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_versions: {
        Row: {
          change_note: string
          created_at: string
          created_by: string | null
          id: string
          org_id: string
          snapshot: Json
          survey_id: string
          version: number
        }
        Insert: {
          change_note?: string
          created_at?: string
          created_by?: string | null
          id?: string
          org_id: string
          snapshot: Json
          survey_id: string
          version: number
        }
        Update: {
          change_note?: string
          created_at?: string
          created_by?: string | null
          id?: string
          org_id?: string
          snapshot?: Json
          survey_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "survey_versions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          anonymous: boolean
          category: string
          code: string
          created_at: string
          created_by: string | null
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
          version: number
        }
        Insert: {
          anonymous?: boolean
          category?: string
          code: string
          created_at?: string
          created_by?: string | null
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
          version?: number
        }
        Update: {
          anonymous?: boolean
          category?: string
          code?: string
          created_at?: string
          created_by?: string | null
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
          version?: number
        }
        Relationships: []
      }
      training_plan_program_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          org_id: string
          program_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          org_id: string
          program_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          org_id?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_program_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "online_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plan_program_courses_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_plan_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plan_programs: {
        Row: {
          created_at: string
          description: string
          end_date: string | null
          id: string
          name: string
          order_index: number
          org_id: string
          plan_id: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          name: string
          order_index?: number
          org_id: string
          plan_id: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          name?: string
          order_index?: number
          org_id?: string
          plan_id?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_programs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plan_surveys: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          org_id: string
          plan_id: string
          result_summary: Json
          start_date: string | null
          status: string
          survey_id: string
          target_type: string
          target_unit_ids: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          org_id: string
          plan_id: string
          result_summary?: Json
          start_date?: string | null
          status?: string
          survey_id: string
          target_type?: string
          target_unit_ids?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          org_id?: string
          plan_id?: string
          result_summary?: Json
          start_date?: string | null
          status?: string
          survey_id?: string
          target_type?: string
          target_unit_ids?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_surveys_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plan_surveys_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plan_topic_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          org_id: string
          topic_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          org_id: string
          topic_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          org_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_topic_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "online_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plan_topic_courses_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "training_plan_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plan_topics: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          order_index: number
          org_id: string
          plan_id: string
          program_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          order_index?: number
          org_id: string
          plan_id: string
          program_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          order_index?: number
          org_id?: string
          plan_id?: string
          program_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_topics_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plan_topics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_plan_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          org_id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          org_id: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          org_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_certificates: {
        Row: {
          certificate_id: string
          certificate_title: string
          class_id: string | null
          course_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          issued_at: string
          org_id: string
          recipient_name: string
          status: string
          template_snapshot: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_id: string
          certificate_title?: string
          class_id?: string | null
          course_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          org_id: string
          recipient_name?: string
          status?: string
          template_snapshot?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_id?: string
          certificate_title?: string
          class_id?: string | null
          course_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          org_id?: string
          recipient_name?: string
          status?: string
          template_snapshot?: Json
          updated_at?: string
          user_id?: string
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
      user_flashcards: {
        Row: {
          classroom_id: string | null
          content_snapshot: Json
          created_at: string
          delivered_at: string | null
          flashcard_id: string
          id: string
          org_id: string
          scheduled_at: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          classroom_id?: string | null
          content_snapshot?: Json
          created_at?: string
          delivered_at?: string | null
          flashcard_id: string
          id?: string
          org_id: string
          scheduled_at?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          classroom_id?: string | null
          content_snapshot?: Json
          created_at?: string
          delivered_at?: string | null
          flashcard_id?: string
          id?: string
          org_id?: string
          scheduled_at?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      user_learning_path_progress: {
        Row: {
          completed_at: string | null
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
          completed_at?: string | null
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
          completed_at?: string | null
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
      user_titles: {
        Row: {
          assigned_at: string
          id: string
          org_id: string
          title_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          org_id: string
          title_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          org_id?: string
          title_id?: string
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

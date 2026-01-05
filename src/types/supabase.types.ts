export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assignment_categories: {
        Row: {
          assignment_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          assignment_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          assignment_id?: string
          category_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_categories_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_employees: {
        Row: {
          assignment_id: string
          created_at: string
          employee_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          employee_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          employee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_employees_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_results: {
        Row: {
          assignment_id: string
          created_at: string
          data: Json | null
          employee_id: string
          feedback: string | null
          id: string
          max_score: number
          score: number
          status: Database["public"]["Enums"]["assignment_result_status"]
        }
        Insert: {
          assignment_id: string
          created_at?: string
          data?: Json | null
          employee_id: string
          feedback?: string | null
          id?: string
          max_score: number
          score: number
          status?: Database["public"]["Enums"]["assignment_result_status"]
        }
        Update: {
          assignment_id?: string
          created_at?: string
          data?: Json | null
          employee_id?: string
          feedback?: string | null
          id?: string
          max_score?: number
          score?: number
          status?: Database["public"]["Enums"]["assignment_result_status"]
        }
        Relationships: [
          {
            foreignKeyName: "assignment_results_assignment_id_employee_id_fkey"
            columns: ["assignment_id", "employee_id"]
            isOneToOne: true
            referencedRelation: "assignment_results"
            referencedColumns: ["assignment_id", "employee_id"]
          },
          {
            foreignKeyName: "assignment_results_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_results_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: string
          name: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          code: string
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          address?: string
          code?: string
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          address?: string
          code?: string
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string | null
          slug: string | null
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          slug?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          slug?: string | null
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      class_attendances: {
        Row: {
          attendance_method:
            | Database["public"]["Enums"]["attendance_method_enum"]
            | null
          attendance_mode:
            | Database["public"]["Enums"]["attendance_mode_enum"]
            | null
          attendance_status:
            | Database["public"]["Enums"]["attendance_status"]
            | null
          attended_at: string | null
          class_room_id: string | null
          class_session_id: string | null
          created_at: string | null
          device_info: Json | null
          distance_from_class: number | null
          employee_id: string
          id: string
          qr_code_id: string | null
          rejection_reason: string | null
          scan_location_lat: number | null
          scan_location_lng: number | null
        }
        Insert: {
          attendance_method?:
            | Database["public"]["Enums"]["attendance_method_enum"]
            | null
          attendance_mode?:
            | Database["public"]["Enums"]["attendance_mode_enum"]
            | null
          attendance_status?:
            | Database["public"]["Enums"]["attendance_status"]
            | null
          attended_at?: string | null
          class_room_id?: string | null
          class_session_id?: string | null
          created_at?: string | null
          device_info?: Json | null
          distance_from_class?: number | null
          employee_id: string
          id?: string
          qr_code_id?: string | null
          rejection_reason?: string | null
          scan_location_lat?: number | null
          scan_location_lng?: number | null
        }
        Update: {
          attendance_method?:
            | Database["public"]["Enums"]["attendance_method_enum"]
            | null
          attendance_mode?:
            | Database["public"]["Enums"]["attendance_mode_enum"]
            | null
          attendance_status?:
            | Database["public"]["Enums"]["attendance_status"]
            | null
          attended_at?: string | null
          class_room_id?: string | null
          class_session_id?: string | null
          created_at?: string | null
          device_info?: Json | null
          distance_from_class?: number | null
          employee_id?: string
          id?: string
          qr_code_id?: string | null
          rejection_reason?: string | null
          scan_location_lat?: number | null
          scan_location_lng?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "class_attendances_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_attendances_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_attendances_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_attendances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_attendances_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "class_qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_hash_tag: {
        Row: {
          class_room_id: string | null
          created_at: string
          hash_tag_id: string | null
          id: string
        }
        Insert: {
          class_room_id?: string | null
          created_at?: string
          hash_tag_id?: string | null
          id?: string
        }
        Update: {
          class_room_id?: string | null
          created_at?: string
          hash_tag_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_hash_tag_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_hash_tag_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_hash_tag_hash_tag_id_fkey"
            columns: ["hash_tag_id"]
            isOneToOne: false
            referencedRelation: "hash_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      class_qr_codes: {
        Row: {
          allowed_radius_meters: number | null
          checkin_end_time: string | null
          checkin_start_time: string | null
          class_room_id: string | null
          class_session_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_enabled: boolean | null
          location_lat: number | null
          location_lng: number | null
          qr_code: string
          qr_secret: string
          status: Database["public"]["Enums"]["qr_code_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          allowed_radius_meters?: number | null
          checkin_end_time?: string | null
          checkin_start_time?: string | null
          class_room_id?: string | null
          class_session_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          qr_code: string
          qr_secret: string
          status?: Database["public"]["Enums"]["qr_code_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          allowed_radius_meters?: number | null
          checkin_end_time?: string | null
          checkin_start_time?: string | null
          class_room_id?: string | null
          class_session_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          qr_code?: string
          qr_secret?: string
          status?: Database["public"]["Enums"]["qr_code_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_qr_codes_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_qr_codes_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_qr_codes_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_qr_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      class_room_attendance: {
        Row: {
          check_in_at: string | null
          check_out_at: string | null
          class_room_employee_id: number
          created_at: string
          deleted_at: string | null
          id: string
          updated_at: string
        }
        Insert: {
          check_in_at?: string | null
          check_out_at?: string | null
          class_room_employee_id: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          check_in_at?: string | null
          check_out_at?: string | null
          class_room_employee_id?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_room_attendance_class_room_employee_id_fkey"
            columns: ["class_room_employee_id"]
            isOneToOne: false
            referencedRelation: "class_room_employee"
            referencedColumns: ["id"]
          },
        ]
      }
      class_room_employee: {
        Row: {
          class_room_id: string | null
          created_at: string
          employee_id: string | null
          id: number
        }
        Insert: {
          class_room_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: number
        }
        Update: {
          class_room_id?: string | null
          created_at?: string
          employee_id?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_room_employee_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_room_employee_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_room_employee_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      class_room_field: {
        Row: {
          class_field_id: string | null
          class_room_id: string | null
          created_at: string
          id: string
        }
        Insert: {
          class_field_id?: string | null
          class_room_id?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          class_field_id?: string | null
          class_room_id?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_room_field_class_field_id_fkey"
            columns: ["class_field_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_room_field_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_room_field_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms_priority"
            referencedColumns: ["id"]
          },
        ]
      }
      class_room_metadata: {
        Row: {
          class_room_id: string | null
          created_at: string
          id: string
          key: string | null
          value: Json | null
        }
        Insert: {
          class_room_id?: string | null
          created_at?: string
          id?: string
          key?: string | null
          value?: Json | null
        }
        Update: {
          class_room_id?: string | null
          created_at?: string
          id?: string
          key?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "class_room_metadata_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_room_metadata_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms_priority"
            referencedColumns: ["id"]
          },
        ]
      }
      class_rooms: {
        Row: {
          class_type: Database["public"]["Enums"]["class_type"] | null
          created_at: string
          description: string | null
          employee_id: string | null
          end_at: string | null
          id: string
          organization_id: string
          resource_id: string | null
          room_type: Database["public"]["Enums"]["class_room_type"]
          slug: string | null
          start_at: string | null
          status: Database["public"]["Enums"]["class_room_status"]
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          class_type?: Database["public"]["Enums"]["class_type"] | null
          created_at?: string
          description?: string | null
          employee_id?: string | null
          end_at?: string | null
          id?: string
          organization_id?: string
          resource_id?: string | null
          room_type: Database["public"]["Enums"]["class_room_type"]
          slug?: string | null
          start_at?: string | null
          status?: Database["public"]["Enums"]["class_room_status"]
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          class_type?: Database["public"]["Enums"]["class_type"] | null
          created_at?: string
          description?: string | null
          employee_id?: string | null
          end_at?: string | null
          id?: string
          organization_id?: string
          resource_id?: string | null
          room_type?: Database["public"]["Enums"]["class_room_type"]
          slug?: string | null
          start_at?: string | null
          status?: Database["public"]["Enums"]["class_room_status"]
          thumbnail_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_rooms_created_by_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_rooms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      class_rooms_resources: {
        Row: {
          class_room_id: string
          created_at: string
          id: number
          resource_id: string
        }
        Insert: {
          class_room_id?: string
          created_at?: string
          id?: number
          resource_id?: string
        }
        Update: {
          class_room_id?: string
          created_at?: string
          id?: number
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_rooms_resources_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_rooms_resources_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_rooms_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      class_session_assignment: {
        Row: {
          assignment_id: string
          created_at: string
          end_at: string | null
          id: number
          session_id: string
          start_at: string | null
        }
        Insert: {
          assignment_id?: string
          created_at?: string
          end_at?: string | null
          id?: number
          session_id?: string
          start_at?: string | null
        }
        Update: {
          assignment_id?: string
          created_at?: string
          end_at?: string | null
          id?: number
          session_id?: string
          start_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_session_assignment_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_session_assignment_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_session_metadata: {
        Row: {
          class_session_id: string
          id: string
          key: string | null
          value: Json | null
        }
        Insert: {
          class_session_id?: string
          id?: string
          key?: string | null
          value?: Json | null
        }
        Update: {
          class_session_id?: string
          id?: string
          key?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "class_session_metadata_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_session_teacher: {
        Row: {
          class_session_id: string | null
          created_at: string
          id: string
          teacher_id: string | null
        }
        Insert: {
          class_session_id?: string | null
          created_at?: string
          id?: string
          teacher_id?: string | null
        }
        Update: {
          class_session_id?: string | null
          created_at?: string
          id?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_session_teacher_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_session_teacher_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          channel_info: Json | null
          channel_provider:
            | Database["public"]["Enums"]["channel_provider"]
            | null
          class_room_id: string
          created_at: string
          description: string | null
          end_at: string | null
          id: string
          location: string | null
          priority: number
          session_type: Database["public"]["Enums"]["class_session_type"]
          start_at: string | null
          title: string | null
          updated_at: string | null
          weekly_schedule: Json | null
        }
        Insert: {
          channel_info?: Json | null
          channel_provider?:
            | Database["public"]["Enums"]["channel_provider"]
            | null
          class_room_id?: string
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          location?: string | null
          priority?: number
          session_type?: Database["public"]["Enums"]["class_session_type"]
          start_at?: string | null
          title?: string | null
          updated_at?: string | null
          weekly_schedule?: Json | null
        }
        Update: {
          channel_info?: Json | null
          channel_provider?:
            | Database["public"]["Enums"]["channel_provider"]
            | null
          class_room_id?: string
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          location?: string | null
          priority?: number
          session_type?: Database["public"]["Enums"]["class_session_type"]
          start_at?: string | null
          title?: string | null
          updated_at?: string | null
          weekly_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "class_session_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_session_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms_priority"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions_agendas: {
        Row: {
          class_session_id: string | null
          created_at: string
          description: string | null
          end_at: string | null
          id: string
          start_at: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          class_session_id?: string | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          start_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          class_session_id?: string | null
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          start_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_agendas_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      class_sessions_courses_period: {
        Row: {
          class_session_id: string
          course_id: string
          created_at: string
          end_at: string | null
          id: number
          start_at: string | null
          teacher_id: string | null
          weekly_schedule: Json | null
        }
        Insert: {
          class_session_id?: string
          course_id?: string
          created_at?: string
          end_at?: string | null
          id?: number
          start_at?: string | null
          teacher_id?: string | null
          weekly_schedule?: Json | null
        }
        Update: {
          class_session_id?: string
          course_id?: string
          created_at?: string
          end_at?: string | null
          id?: number
          start_at?: string | null
          teacher_id?: string | null
          weekly_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_courses_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_courses_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          organization_id: string
          slug: string
          status: Database["public"]["Enums"]["course_status"]
          title: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          organization_id: string
          slug: string
          status?: Database["public"]["Enums"]["course_status"]
          title?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          organization_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["course_status"]
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      courses_categories: {
        Row: {
          category_id: string
          course_id: string
          created_at: string
          id: number
        }
        Insert: {
          category_id?: string
          course_id?: string
          created_at?: string
          id?: number
        }
        Update: {
          category_id?: string
          course_id?: string
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_categories_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses_metadatas: {
        Row: {
          course_id: string
          created_at: string
          id: number
          key: string
          value: Json
        }
        Insert: {
          course_id?: string
          created_at?: string
          id?: number
          key: string
          value: Json
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: number
          key?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "online_courses_metadatas_online_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_branches: {
        Row: {
          branch_id: string
          created_at: string | null
          employee_id: string
          id: string
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          employee_id: string
          id?: string
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          employee_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_employee_branches_branch_id"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee_branches_employee_id"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_departments: {
        Row: {
          created_at: string | null
          department_id: string
          employee_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          employee_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          employee_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_employee_departments_department_id"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee_departments_employee_id"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_learning_paths: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          learning_path_id: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          learning_path_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          learning_path_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_learning_paths_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_learning_paths_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          employee_code: string
          employee_order: number | null
          employee_type: Database["public"]["Enums"]["employee_type"] | null
          id: string
          organization_id: string
          position_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["employee_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          employee_code: string
          employee_order?: number | null
          employee_type?: Database["public"]["Enums"]["employee_type"] | null
          id?: string
          organization_id: string
          position_id?: string | null
          start_date?: string | null
          status: Database["public"]["Enums"]["employee_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          employee_code?: string
          employee_order?: number | null
          employee_type?: Database["public"]["Enums"]["employee_type"] | null
          id?: string
          organization_id?: string
          position_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      employees_roles: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          employee_id?: string
          id?: string
          role_id?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_roles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      employments: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          organization_unit_id: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          organization_unit_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          organization_unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employments_organization_unit_id_fkey"
            columns: ["organization_unit_id"]
            isOneToOne: false
            referencedRelation: "organization_units"
            referencedColumns: ["id"]
          },
        ]
      }
      hash_tags: {
        Row: {
          created_at: string
          id: string
          name: string | null
          slug: string | null
          type: Database["public"]["Enums"]["hashtag_type"] | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          slug?: string | null
          type?: Database["public"]["Enums"]["hashtag_type"] | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          slug?: string | null
          type?: Database["public"]["Enums"]["hashtag_type"] | null
        }
        Relationships: []
      }
      learning_path_phases: {
        Row: {
          created_at: string
          description: string | null
          id: string
          learning_path_id: string
          order_index: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          learning_path_id: string
          order_index?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          learning_path_id?: string
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_phases_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_paths_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_position_seconds: number | null
          employee_id: string
          id: string
          learning_path_id: string | null
          lesson_id: string
          progress_percentage: number
          started_at: string | null
          status: Database["public"]["Enums"]["lesson_progress_status"]
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_position_seconds?: number | null
          employee_id: string
          id?: string
          learning_path_id?: string | null
          lesson_id: string
          progress_percentage?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["lesson_progress_status"]
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_position_seconds?: number | null
          employee_id?: string
          id?: string
          learning_path_id?: string | null
          lesson_id?: string
          progress_percentage?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["lesson_progress_status"]
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          assignment_id: string | null
          content: string | null
          created_at: string
          id: string
          lesson_type: Database["public"]["Enums"]["lesson_type"]
          main_resource: string | null
          priority: number
          section_id: string
          status: Database["public"]["Enums"]["status"]
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          main_resource?: string | null
          priority?: number
          section_id?: string
          status?: Database["public"]["Enums"]["status"]
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          main_resource?: string | null
          priority?: number
          section_id?: string
          status?: Database["public"]["Enums"]["status"]
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_main_resource_fkey"
            columns: ["main_resource"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_courses_lessions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons_resources: {
        Row: {
          created_at: string
          id: number
          lesson_id: string
          resource_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          lesson_id?: string
          resource_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          lesson_id?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessions_resources_course_lession_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_lessions_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          organization_id: string
          score_required: number
          status: Database["public"]["Enums"]["level_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          organization_id?: string
          score_required?: number
          status?: Database["public"]["Enums"]["level_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          organization_id?: string
          score_required?: number
          status?: Database["public"]["Enums"]["level_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "levels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "levels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      libraries: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "libraries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "libraries_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      managers_employees: {
        Row: {
          employee_id: string
          manager_id: string
        }
        Insert: {
          employee_id: string
          manager_id: string
        }
        Update: {
          employee_id?: string
          manager_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "managers_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managers_employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_units: {
        Row: {
          address: string
          code: string
          created_at: string
          id: string
          name: string
          organization_id: string
          parent_id: string | null
          type: Database["public"]["Enums"]["organization_unit_type"]
        }
        Insert: {
          address?: string
          code?: string
          created_at?: string
          id?: string
          name: string
          organization_id: string
          parent_id?: string | null
          type: Database["public"]["Enums"]["organization_unit_type"]
        }
        Update: {
          address?: string
          code?: string
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          parent_id?: string | null
          type?: Database["public"]["Enums"]["organization_unit_type"]
        }
        Relationships: [
          {
            foreignKeyName: "organization_units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_units_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organization_units"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          employee_limit: number | null
          favicon: string | null
          id: string
          is_active: boolean
          logo: string
          name: string
          shortname: string | null
          subdomain: string
        }
        Insert: {
          created_at?: string
          employee_limit?: number | null
          favicon?: string | null
          id?: string
          is_active?: boolean
          logo: string
          name: string
          shortname?: string | null
          subdomain: string
        }
        Update: {
          created_at?: string
          employee_limit?: number | null
          favicon?: string | null
          id?: string
          is_active?: boolean
          logo?: string
          name?: string
          shortname?: string | null
          subdomain?: string
        }
        Relationships: []
      }
      phase_class_rooms: {
        Row: {
          class_room_id: string
          created_at: string
          id: string
          order_index: number
          phase_id: string
        }
        Insert: {
          class_room_id: string
          created_at?: string
          id?: string
          order_index: number
          phase_id: string
        }
        Update: {
          class_room_id?: string
          created_at?: string
          id?: string
          order_index?: number
          phase_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phase_class_rooms_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phase_class_rooms_class_room_id_fkey"
            columns: ["class_room_id"]
            isOneToOne: false
            referencedRelation: "class_rooms_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phase_class_rooms_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "learning_path_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          birthday: string | null
          created_at: string
          email: string
          employee_id: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          phone_number: string
        }
        Insert: {
          avatar?: string | null
          birthday?: string | null
          created_at?: string
          email: string
          employee_id: string
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          phone_number: string
        }
        Update: {
          avatar?: string | null
          birthday?: string | null
          created_at?: string
          email?: string
          employee_id?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          phone_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          assignment_id: string
          attachments: string[] | null
          created_at: string
          created_by: string
          id: string
          label: string
          options: Json | null
          score: number
          type: Database["public"]["Enums"]["question_type"]
          updated_at: string
        }
        Insert: {
          assignment_id: string
          attachments?: string[] | null
          created_at?: string
          created_by: string
          id?: string
          label: string
          options?: Json | null
          score: number
          type: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          attachments?: string[] | null
          created_at?: string
          created_by?: string
          id?: string
          label?: string
          options?: Json | null
          score?: number
          type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          extension: string | null
          id: string
          kind: Database["public"]["Enums"]["resource_kind"]
          library_id: string
          mime_type: string | null
          name: string
          organization_id: string
          parent_id: string | null
          path: string | null
          size: number | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          extension?: string | null
          id?: string
          kind: Database["public"]["Enums"]["resource_kind"]
          library_id: string
          mime_type?: string | null
          name: string
          organization_id: string
          parent_id?: string | null
          path?: string | null
          size?: number | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          extension?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["resource_kind"]
          library_id?: string
          mime_type?: string | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          path?: string | null
          size?: number | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "libraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action_code: Database["public"]["Enums"]["action_code_enum"]
          assigned_at: string | null
          resource_code: string
          role_id: string
        }
        Insert: {
          action_code: Database["public"]["Enums"]["action_code_enum"]
          assigned_at?: string | null
          resource_code: string
          role_id: string
        }
        Update: {
          action_code?: Database["public"]["Enums"]["action_code_enum"]
          assigned_at?: string | null
          resource_code?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          organization_id: string | null
          title: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          title: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          priority: number
          status: Database["public"]["Enums"]["status"]
          title: string | null
        }
        Insert: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: number
          status?: Database["public"]["Enums"]["status"]
          title?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: number
          status?: Database["public"]["Enums"]["status"]
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "online_courses_sections_online_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          organization_id: string
          slug: string
          survey_type: Database["public"]["Enums"]["survey_type"] | null
          title: string
          update_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          slug: string
          survey_type?: Database["public"]["Enums"]["survey_type"] | null
          title: string
          update_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          slug?: string
          survey_type?: Database["public"]["Enums"]["survey_type"] | null
          title?: string
          update_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys_answers: {
        Row: {
          answer_value: Json | null
          created_at: string
          id: number
          question_id: string
          question_text: string | null
          question_type:
            | Database["public"]["Enums"]["survey_question_type"]
            | null
          response_id: string
        }
        Insert: {
          answer_value?: Json | null
          created_at?: string
          id?: number
          question_id?: string
          question_text?: string | null
          question_type?:
            | Database["public"]["Enums"]["survey_question_type"]
            | null
          response_id?: string
        }
        Update: {
          answer_value?: Json | null
          created_at?: string
          id?: number
          question_id?: string
          question_text?: string | null
          question_type?:
            | Database["public"]["Enums"]["survey_question_type"]
            | null
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "surveys_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "surveys_response"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys_questions: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          name: string | null
          priority: number
          question_type: Database["public"]["Enums"]["survey_question_type"]
          survey_id: string
          update_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          name?: string | null
          priority?: number
          question_type: Database["public"]["Enums"]["survey_question_type"]
          survey_id?: string
          update_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          name?: string | null
          priority?: number
          question_type?: Database["public"]["Enums"]["survey_question_type"]
          survey_id?: string
          update_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys_questions_options: {
        Row: {
          created_at: string
          id: string
          is_other: boolean | null
          option_text: string | null
          priority: number | null
          survey_question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_other?: boolean | null
          option_text?: string | null
          priority?: number | null
          survey_question_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_other?: boolean | null
          option_text?: string | null
          priority?: number | null
          survey_question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_questions_options_survey_question_id_fkey"
            columns: ["survey_question_id"]
            isOneToOne: false
            referencedRelation: "surveys_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys_response: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          survey_id: string
          target_id: string | null
          target_type: Database["public"]["Enums"]["survey_target_type"] | null
        }
        Insert: {
          created_at?: string
          employee_id?: string
          id?: string
          survey_id?: string
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["survey_target_type"] | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          survey_id?: string
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["survey_target_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_response_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surveys_response_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plan_program_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          program_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          program_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_program_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
          description: string | null
          end_date: string | null
          id: string
          name: string
          order_index: number | null
          plan_id: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          order_index?: number | null
          plan_id: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          order_index?: number | null
          plan_id?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_programs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plan_surveys: {
        Row: {
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          organization_id: string
          plan_id: string
          result_summary: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["training_plan_survey_status"]
          survey_id: string
          target_type: Database["public"]["Enums"]["plan_survey_target"]
          target_unit_ids: string[] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          organization_id: string
          plan_id: string
          result_summary?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["training_plan_survey_status"]
          survey_id: string
          target_type?: Database["public"]["Enums"]["plan_survey_target"]
          target_unit_ids?: string[] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string
          plan_id?: string
          result_summary?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["training_plan_survey_status"]
          survey_id?: string
          target_type?: Database["public"]["Enums"]["plan_survey_target"]
          target_unit_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plan_surveys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plan_surveys_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
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
          topic_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          topic_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_topic_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
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
          description: string | null
          id: string
          name: string
          order_index: number | null
          program_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          program_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          program_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_topics_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_plan_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          budget: number | null
          created_at: string
          created_by: string
          end_date: string | null
          id: string
          name: string
          objective: string | null
          organization_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["training_plan_status"]
          survey_id: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          budget?: number | null
          created_at?: string
          created_by: string
          end_date?: string | null
          id?: string
          name: string
          objective?: string | null
          organization_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["training_plan_status"]
          survey_id?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          budget?: number | null
          created_at?: string
          created_by?: string
          end_date?: string | null
          id?: string
          name?: string
          objective?: string | null
          organization_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["training_plan_status"]
          survey_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_references: {
        Row: {
          default_organization_id: string
          id: number
          user_id: string
        }
        Insert: {
          default_organization_id?: string
          id?: number
          user_id?: string
        }
        Update: {
          default_organization_id?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_references_default_organization_id_fkey"
            columns: ["default_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      class_rooms_priority: {
        Row: {
          computed_end_at: string | null
          computed_start_at: string | null
          created_at: string | null
          description: string | null
          employee_id: string | null
          end_at: string | null
          id: string | null
          organization_id: string | null
          resource_id: string | null
          room_type: Database["public"]["Enums"]["class_room_type"] | null
          runtime_status: string | null
          slug: string | null
          sort_rank_primary: number | null
          sort_rank_secondary: number | null
          start_at: string | null
          status: Database["public"]["Enums"]["class_room_status"] | null
          thumbnail_url: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_rooms_created_by_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_rooms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      count_class_room_runtime_status_by_employee: {
        Args: {
          p_employee_id: string
          p_from?: string
          p_search?: string
          p_session_mode?: string
          p_status?: string
          p_to?: string
          p_type?: string
        }
        Returns: {
          runtime_status: string
          total: number
        }[]
      }
      get_filtered_employees: {
        Args:
          | {
              p_branch_id?: string
              p_department_id?: string
              p_employee_type?: Database["public"]["Enums"]["employee_type"]
              p_limit?: number
              p_page?: number
              p_search?: string
            }
          | {
              p_branch_id?: string
              p_department_id?: string
              p_limit?: number
              p_page?: number
              p_search?: string
            }
        Returns: {
          employee_id: string
          total_count: number
        }[]
      }
      get_training_plan_detail_counts: {
        Args: { plan_id: string }
        Returns: {
          courses_count: number
          instructors_count: number
          programs_count: number
          topics_count: number
        }[]
      }
      get_training_plan_status_counts: {
        Args: { org_id: string; search_text?: string }
        Returns: {
          approved: number
          pending: number
          pending_survey: number
          rejected: number
          total: number
        }[]
      }
      get_user_id_by_email: {
        Args: { user_email: string }
        Returns: string
      }
      has_permission: {
        Args: { action_code: string; resource_code: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_qr_code_valid: {
        Args: { p_current_time?: string; p_qr_code: string }
        Returns: {
          is_valid: boolean
          message: string
          qr_code_id: string
        }[]
      }
    }
    Enums: {
      action_code_enum: "create" | "read" | "update" | "delete"
      assignment_result_status: "submitted" | "graded"
      attendance_method_enum: "qr" | "manual" | "online_auto"
      attendance_mode_enum: "offline" | "online"
      attendance_status: "present" | "late" | "absent" | "rejected"
      channel_provider: "google_meet" | "zoom" | "microsoft_teams"
      class_room_status:
        | "publish"
        | "active"
        | "deactive"
        | "pending"
        | "deleted"
        | "draft"
      class_room_type: "single" | "multiple"
      class_session_type: "online" | "offline" | "live"
      class_type: "learning_path" | "room"
      course_status:
        | "published"
        | "pending"
        | "draft"
        | "deleted"
        | "unpublished"
      day_of_week:
        | "sunday"
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
      employee_status: "active" | "inactive"
      employee_type: "admin" | "student" | "teacher"
      gender: "male" | "female" | "other"
      hashtag_type: "class_room"
      lesson_progress_status: "not_started" | "in_progress" | "completed"
      lesson_type: "video" | "file" | "assessment"
      level_status: "deleted" | "active" | "inactive"
      organization_unit_type: "branch" | "department"
      plan_survey_target: "all" | "department" | "branch"
      qr_code_status: "inactive" | "active" | "expired" | "disabled"
      question_type:
        | "file"
        | "text"
        | "checkbox"
        | "radio"
        | "matching"
        | "drag_and_drop"
        | "true_false"
        | "order"
        | "fill"
      resource_kind: "folder" | "file"
      status: "active" | "deactive"
      survey_question_type:
        | "checkbox"
        | "radio"
        | "text"
        | "rating"
        | "sort_rating"
        | "yes_no"
      survey_target_type: "class_room" | "learning_path"
      survey_type: "planning" | "classroom"
      training_plan_status:
        | "pending"
        | "approved"
        | "rejected"
        | "deleted"
        | "pending_survey"
      training_plan_survey_status: "pending" | "collecting" | "closed"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_code_enum: ["create", "read", "update", "delete"],
      assignment_result_status: ["submitted", "graded"],
      attendance_method_enum: ["qr", "manual", "online_auto"],
      attendance_mode_enum: ["offline", "online"],
      attendance_status: ["present", "late", "absent", "rejected"],
      channel_provider: ["google_meet", "zoom", "microsoft_teams"],
      class_room_status: [
        "publish",
        "active",
        "deactive",
        "pending",
        "deleted",
        "draft",
      ],
      class_room_type: ["single", "multiple"],
      class_session_type: ["online", "offline", "live"],
      class_type: ["learning_path", "room"],
      course_status: [
        "published",
        "pending",
        "draft",
        "deleted",
        "unpublished",
      ],
      day_of_week: [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ],
      employee_status: ["active", "inactive"],
      employee_type: ["admin", "student", "teacher"],
      gender: ["male", "female", "other"],
      hashtag_type: ["class_room"],
      lesson_progress_status: ["not_started", "in_progress", "completed"],
      lesson_type: ["video", "file", "assessment"],
      level_status: ["deleted", "active", "inactive"],
      organization_unit_type: ["branch", "department"],
      plan_survey_target: ["all", "department", "branch"],
      qr_code_status: ["inactive", "active", "expired", "disabled"],
      question_type: [
        "file",
        "text",
        "checkbox",
        "radio",
        "matching",
        "drag_and_drop",
        "true_false",
        "order",
        "fill",
      ],
      resource_kind: ["folder", "file"],
      status: ["active", "deactive"],
      survey_question_type: [
        "checkbox",
        "radio",
        "text",
        "rating",
        "sort_rating",
        "yes_no",
      ],
      survey_target_type: ["class_room", "learning_path"],
      survey_type: ["planning", "classroom"],
      training_plan_status: [
        "pending",
        "approved",
        "rejected",
        "deleted",
        "pending_survey",
      ],
      training_plan_survey_status: ["pending", "collecting", "closed"],
    },
  },
} as const


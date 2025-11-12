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
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          name?: string
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
          comunity_info: Json | null
          created_at: string
          description: string | null
          documents: Json | null
          employee_id: string | null
          end_at: string | null
          id: string
          organization_id: string | null
          resource_id: string | null
          room_type: Database["public"]["Enums"]["class_room_type"]
          slug: string | null
          start_at: string | null
          status: Database["public"]["Enums"]["class_room_status"]
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          comunity_info?: Json | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          employee_id?: string | null
          end_at?: string | null
          id?: string
          organization_id?: string | null
          resource_id?: string | null
          room_type: Database["public"]["Enums"]["class_room_type"]
          slug?: string | null
          start_at?: string | null
          status?: Database["public"]["Enums"]["class_room_status"]
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          comunity_info?: Json | null
          created_at?: string
          description?: string | null
          documents?: Json | null
          employee_id?: string | null
          end_at?: string | null
          id?: string
          organization_id?: string | null
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
            foreignKeyName: "class_rooms_employee_id_fkey"
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
          is_online: boolean
          limit_person: number | null
          location: string | null
          priority: number
          start_at: string | null
          title: string | null
          updated_at: string | null
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
          is_online?: boolean
          limit_person?: number | null
          location?: string | null
          priority?: number
          start_at?: string | null
          title?: string | null
          updated_at?: string | null
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
          is_online?: boolean
          limit_person?: number | null
          location?: string | null
          priority?: number
          start_at?: string | null
          title?: string | null
          updated_at?: string | null
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
      courses: {
        Row: {
          community_info: Json | null
          created_at: string
          created_by: string
          created_by: string
          description: string | null
          end_at: string
          end_at: string
          id: string
          organization_id: string
          slug: string
          start_at: string
          organization_id: string
          slug: string
          start_at: string
          status: Database["public"]["Enums"]["course_status"]
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          community_info?: Json | null
          created_at?: string
          created_by: string
          created_by: string
          description?: string | null
          end_at: string
          end_at: string
          id?: string
          organization_id: string
          slug: string
          start_at: string
          organization_id: string
          slug: string
          start_at: string
          status?: Database["public"]["Enums"]["course_status"]
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          community_info?: Json | null
          created_at?: string
          created_by?: string
          created_by?: string
          description?: string | null
          end_at?: string
          end_at?: string
          id?: string
          organization_id?: string
          slug?: string
          start_at?: string
          organization_id?: string
          slug?: string
          start_at?: string
          status?: Database["public"]["Enums"]["course_status"]
          thumbnail_url?: string | null
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
          course_id: string
          created_at: string
          id: number
          key: string
          value: Json
        }
        Insert: {
          course_id?: string
          course_id?: string
          created_at?: string
          id?: number
          key: string
          value: Json
        }
        Update: {
          course_id?: string
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
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses_resources: {
        Row: {
          course_id: string
          id: number
          resource_id: string
        }
        Insert: {
          course_id?: string
          id?: number
          resource_id?: string
        }
        Update: {
          course_id?: string
          id?: number
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      courses_students: {
        Row: {
          course_id: string
          created_at: string
          created_at: string
          id: number
          student_id: string
        }
        Insert: {
          course_id?: string
          created_at?: string
          id?: number
          student_id?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_at?: string
          id?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_students_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      courses_teachers: {
        Row: {
          course_id: string
          created_at: string
          id: number
          teacher_id: string
        }
        Insert: {
          course_id?: string
          created_at?: string
          id?: number
          teacher_id?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: number
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_courses_teachers_online_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_courses_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
          organization_id: string | null
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
          organization_id?: string | null
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
          organization_id?: string | null
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
      group_permission: {
        Row: {
          id: string
          resource_code: string
          title: string | null
        }
        Insert: {
          id?: string
          resource_code: string
          title?: string | null
        }
        Update: {
          id?: string
          resource_code?: string
          title?: string | null
        }
        Relationships: []
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
      lessons: {
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
      lessons_resources: {
        Row: {
          created_at: string
          id: number
          lesson_id: string
          lesson_id: string
          resource_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          lesson_id?: string
          lesson_id?: string
          resource_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          lesson_id?: string
          lesson_id?: string
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lessions_resources_course_lession_id_fkey"
            columns: ["lesson_id"]
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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
          id: string
          is_active: boolean
          logo: string
          name: string
          subdomain: string
        }
        Insert: {
          created_at?: string
          employee_limit?: number | null
          id?: string
          is_active?: boolean
          logo: string
          name: string
          subdomain: string
        }
        Update: {
          created_at?: string
          employee_limit?: number | null
          id?: string
          is_active?: boolean
          logo?: string
          name?: string
          subdomain?: string
        }
        Relationships: []
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
          group_permission_id: string
          role_id: string
        }
        Insert: {
          action_code: Database["public"]["Enums"]["action_code_enum"]
          assigned_at?: string | null
          group_permission_id: string
          role_id: string
        }
        Update: {
          action_code?: Database["public"]["Enums"]["action_code_enum"]
          assigned_at?: string | null
          group_permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_group_permission_id_fkey"
            columns: ["group_permission_id"]
            isOneToOne: false
            referencedRelation: "group_permission"
            referencedColumns: ["id"]
          },
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
      supersemar_masters: {
        Row: {
          data: string | null
          id: number
        }
        Insert: {
          data?: string | null
          id?: number
        }
        Update: {
          data?: string | null
          id?: number
        }
        Relationships: []
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
            foreignKeyName: "class_rooms_employee_id_fkey"
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
        Args: {
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
      has_permission: {
        Args: { action_code: string; resource_code: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
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
      course_status:
        | "published"
        | "pending"
        | "draft"
        | "deleted"
        | "unpublished"
      employee_status: "active" | "inactive"
      employee_type: "admin" | "student" | "teacher"
      gender: "male" | "female" | "other"
      hashtag_type: "class_room"
      lesson_type: "video" | "file" | "assessment"
      lesson_type: "video" | "file" | "assessment"
      organization_unit_type: "branch" | "department"
      qr_code_status: "inactive" | "active" | "expired" | "disabled"
      question_type: "file" | "text" | "checkbox" | "radio"
      resource_kind: "folder" | "file"
      status: "active" | "deactive"
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
      course_status: [
        "published",
        "pending",
        "draft",
        "deleted",
        "unpublished",
      ],
      employee_status: ["active", "inactive"],
      employee_type: ["admin", "student", "teacher"],
      gender: ["male", "female", "other"],
      hashtag_type: ["class_room"],
      lesson_type: ["video", "file", "assessment"],
      lesson_type: ["video", "file", "assessment"],
      organization_unit_type: ["branch", "department"],
      qr_code_status: ["inactive", "active", "expired", "disabled"],
      question_type: ["file", "text", "checkbox", "radio"],
      resource_kind: ["folder", "file"],
      status: ["active", "deactive"],
    },
  },
} as const


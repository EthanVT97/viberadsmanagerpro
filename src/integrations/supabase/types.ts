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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          ad_type: string
          budget: number
          campaign_id: string
          created_at: string
          description: string | null
          headline: string | null
          id: string
          image_url: string | null
          link_url: string | null
          name: string
          performance_data: Json | null
          status: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          ad_type: string
          budget?: number
          campaign_id: string
          created_at?: string
          description?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          name: string
          performance_data?: Json | null
          status?: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          ad_type?: string
          budget?: number
          campaign_id?: string
          created_at?: string
          description?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          name?: string
          performance_data?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_analytics: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversions: number | null
          created_at: string
          date: string
          id: string
          impressions: number | null
          reach: number | null
          spend: number | null
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          reach?: number | null
          spend?: number | null
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string
          date?: string
          id?: string
          impressions?: number | null
          reach?: number | null
          spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget_euro: number
          clicks: number | null
          conversions: number | null
          created_at: string | null
          description: string | null
          id: string
          impressions: number | null
          name: string
          status: string
          target_audience: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_euro: number
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          impressions?: number | null
          name: string
          status?: string
          target_audience?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_euro?: number
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          impressions?: number | null
          name?: string
          status?: string
          target_audience?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          name: string
          price_euro: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          price_euro: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_euro?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          contact_email: string | null
          created_at: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          package_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          package_id: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          package_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          ads_per_campaign_limit: number | null
          campaign_limit: number | null
          {
            foreignKeyName: "subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
          monthly_impressions_limit: number | null
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
          ads_per_campaign_limit?: number | null
          campaign_limit?: number | null
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          monthly_impressions_limit?: number | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
          ads_per_campaign_limit?: number | null
          campaign_limit?: number | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          monthly_impressions_limit?: number | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_billing: boolean | null
          email_campaigns: boolean | null
          email_performance: boolean | null
          email_system: boolean | null
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          push_billing: boolean | null
          push_campaigns: boolean | null
          push_performance: boolean | null
          push_system: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_billing?: boolean | null
          email_campaigns?: boolean | null
          email_performance?: boolean | null
          email_system?: boolean | null
          push_billing?: boolean | null
          push_campaigns?: boolean | null
          push_performance?: boolean | null
          push_system?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_billing?: boolean | null
          email_campaigns?: boolean | null
          email_performance?: boolean | null
          email_system?: boolean | null
          push_billing?: boolean | null
          push_campaigns?: boolean | null
          push_performance?: boolean | null
          push_system?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_package_limits: {
        Args: {
          user_uuid: string
        }
        Returns: {
          campaign_limit: number
          monthly_impressions_limit: number
          ads_per_campaign_limit: number
          package_name: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_generations: {
        Row: {
          author_id: string
          content: string
          content_type: string | null
          created_at: string
          id: string
          model: string | null
          prompt: string
          status: string | null
          tokens_used: number | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          content_type?: string | null
          created_at?: string
          id?: string
          model?: string | null
          prompt: string
          status?: string | null
          tokens_used?: number | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          content_type?: string | null
          created_at?: string
          id?: string
          model?: string | null
          prompt?: string
          status?: string | null
          tokens_used?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          from_country_id: string | null
          id: string
          page_slug: string | null
          referrer_source: string | null
          search_engine_query: string | null
          search_term: string | null
          session_duration_seconds: number | null
          to_country_id: string | null
          user_agent: string | null
          visitor_ip: string | null
          visitor_location: Json | null
        }
        Insert: {
          created_at?: string
          event_type: string
          from_country_id?: string | null
          id?: string
          page_slug?: string | null
          referrer_source?: string | null
          search_engine_query?: string | null
          search_term?: string | null
          session_duration_seconds?: number | null
          to_country_id?: string | null
          user_agent?: string | null
          visitor_ip?: string | null
          visitor_location?: Json | null
        }
        Update: {
          created_at?: string
          event_type?: string
          from_country_id?: string | null
          id?: string
          page_slug?: string | null
          referrer_source?: string | null
          search_engine_query?: string | null
          search_term?: string | null
          session_duration_seconds?: number | null
          to_country_id?: string | null
          user_agent?: string | null
          visitor_ip?: string | null
          visitor_location?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_from_country_id_fkey"
            columns: ["from_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_to_country_id_fkey"
            columns: ["to_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      api_logs: {
        Row: {
          api_provider: string
          created_at: string
          endpoint: string | null
          entity_name: string | null
          error_message: string | null
          id: string
          request_payload: Json | null
          response_summary: Json | null
          response_time_ms: number | null
          retry_count: number | null
          status: string
          task_type: string | null
          tokens_used: number | null
        }
        Insert: {
          api_provider: string
          created_at?: string
          endpoint?: string | null
          entity_name?: string | null
          error_message?: string | null
          id?: string
          request_payload?: Json | null
          response_summary?: Json | null
          response_time_ms?: number | null
          retry_count?: number | null
          status?: string
          task_type?: string | null
          tokens_used?: number | null
        }
        Update: {
          api_provider?: string
          created_at?: string
          endpoint?: string | null
          entity_name?: string | null
          error_message?: string | null
          id?: string
          request_payload?: Json | null
          response_summary?: Json | null
          response_time_ms?: number | null
          retry_count?: number | null
          status?: string
          task_type?: string | null
          tokens_used?: number | null
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          ai_generated: boolean
          author_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          ai_generated?: boolean
          author_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          ai_generated?: boolean
          author_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          capital: string | null
          code: string
          continent: string | null
          created_at: string
          currency: string | null
          flag_emoji: string | null
          id: string
          language: string | null
          name: string
          passport_rank: number | null
          passport_score: number | null
          population: number | null
          region: string | null
          slug: string
          updated_at: string
          visa_free_destinations: number | null
        }
        Insert: {
          capital?: string | null
          code: string
          continent?: string | null
          created_at?: string
          currency?: string | null
          flag_emoji?: string | null
          id?: string
          language?: string | null
          name: string
          passport_rank?: number | null
          passport_score?: number | null
          population?: number | null
          region?: string | null
          slug: string
          updated_at?: string
          visa_free_destinations?: number | null
        }
        Update: {
          capital?: string | null
          code?: string
          continent?: string | null
          created_at?: string
          currency?: string | null
          flag_emoji?: string | null
          id?: string
          language?: string | null
          name?: string
          passport_rank?: number | null
          passport_score?: number | null
          population?: number | null
          region?: string | null
          slug?: string
          updated_at?: string
          visa_free_destinations?: number | null
        }
        Relationships: []
      }
      developer_agent_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      developer_agent_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "developer_agent_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "developer_agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      file_change_history: {
        Row: {
          applied_at: string
          change_description: string | null
          conversation_id: string | null
          file_path: string
          id: string
          new_content: string
          original_content: string | null
          reverted_at: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string
          change_description?: string | null
          conversation_id?: string | null
          file_path: string
          id?: string
          new_content: string
          original_content?: string | null
          reverted_at?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string
          change_description?: string | null
          conversation_id?: string | null
          file_path?: string
          id?: string
          new_content?: string
          original_content?: string | null
          reverted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_change_history_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "developer_agent_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          content: string
          country_id: string | null
          created_at: string
          difficulty: string | null
          excerpt: string | null
          featured_image_url: string | null
          guide_type: string
          id: string
          is_featured: boolean | null
          published_at: string | null
          read_time_minutes: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          country_id?: string | null
          created_at?: string
          difficulty?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          guide_type: string
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          country_id?: string | null
          created_at?: string
          difficulty?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          guide_type?: string
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          read_time_minutes?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          ai_generated: boolean
          author: string | null
          author_id: string | null
          categories: string[] | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          original_url: string | null
          published_at: string | null
          rss_feed_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          source_name: string | null
          source_type: string | null
          source_url: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          author?: string | null
          author_id?: string | null
          categories?: string[] | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          original_url?: string | null
          published_at?: string | null
          rss_feed_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          source_name?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          author?: string | null
          author_id?: string | null
          categories?: string[] | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          original_url?: string | null
          published_at?: string | null
          rss_feed_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          source_name?: string | null
          source_type?: string | null
          source_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_news_articles_rss_feed"
            columns: ["rss_feed_id"]
            isOneToOne: false
            referencedRelation: "rss_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          country_of_interest: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          subscribed_at: string
        }
        Insert: {
          country_of_interest?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          subscribed_at?: string
        }
        Update: {
          country_of_interest?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      processing_times: {
        Row: {
          country_id: string
          embassy_location: string | null
          id: string
          last_updated: string
          processing_time_days: number
          source: string | null
          visa_type: string
        }
        Insert: {
          country_id: string
          embassy_location?: string | null
          id?: string
          last_updated?: string
          processing_time_days: number
          source?: string | null
          visa_type: string
        }
        Update: {
          country_id?: string
          embassy_location?: string | null
          id?: string
          last_updated?: string
          processing_time_days?: number
          source?: string | null
          visa_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_times_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      rss_feeds: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          last_fetched: string | null
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_fetched?: string | null
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_fetched?: string | null
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      search_stats: {
        Row: {
          country_id: string | null
          created_at: string
          id: string
          last_searched: string | null
          last_viewed: string | null
          page_view_count: number
          search_count: number
          updated_at: string
        }
        Insert: {
          country_id?: string | null
          created_at?: string
          id?: string
          last_searched?: string | null
          last_viewed?: string | null
          page_view_count?: number
          search_count?: number
          updated_at?: string
        }
        Update: {
          country_id?: string | null
          created_at?: string
          id?: string
          last_searched?: string | null
          last_viewed?: string | null
          page_view_count?: number
          search_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_stats_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: true
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      settings_affiliates: {
        Row: {
          click_count: number
          created_at: string
          html_embed: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          position: string
          target_url: string
          updated_at: string
        }
        Insert: {
          click_count?: number
          created_at?: string
          html_embed?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          position?: string
          target_url: string
          updated_at?: string
        }
        Update: {
          click_count?: number
          created_at?: string
          html_embed?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          position?: string
          target_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visa_requirements: {
        Row: {
          fee_usd: number | null
          from_country_id: string
          id: string
          last_updated: string
          max_stay_days: number | null
          notes: string | null
          processing_time_days: number | null
          requirement_type: string
          requirements: string[] | null
          to_country_id: string
        }
        Insert: {
          fee_usd?: number | null
          from_country_id: string
          id?: string
          last_updated?: string
          max_stay_days?: number | null
          notes?: string | null
          processing_time_days?: number | null
          requirement_type: string
          requirements?: string[] | null
          to_country_id: string
        }
        Update: {
          fee_usd?: number | null
          from_country_id?: string
          id?: string
          last_updated?: string
          max_stay_days?: number | null
          notes?: string | null
          processing_time_days?: number | null
          requirement_type?: string
          requirements?: string[] | null
          to_country_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visa_requirements_from_country_id_fkey"
            columns: ["from_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_requirements_to_country_id_fkey"
            columns: ["to_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
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
      increment_page_view_count: {
        Args: { p_country_id: string }
        Returns: undefined
      }
      increment_search_count: {
        Args: { p_country_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

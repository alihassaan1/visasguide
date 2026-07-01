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
      affiliate_programs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          partner_id: string | null
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          partner_id?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          partner_id?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      affiliate_widgets: {
        Row: {
          affiliate_program: string
          city_id: string | null
          click_count: number | null
          country_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          position: string | null
          tour_id: string | null
          updated_at: string | null
          widget_type: string | null
          widget_url: string
          widget_variant: string | null
        }
        Insert: {
          affiliate_program: string
          city_id?: string | null
          click_count?: number | null
          country_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position?: string | null
          tour_id?: string | null
          updated_at?: string | null
          widget_type?: string | null
          widget_url: string
          widget_variant?: string | null
        }
        Update: {
          affiliate_program?: string
          city_id?: string | null
          click_count?: number | null
          country_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          position?: string | null
          tour_id?: string | null
          updated_at?: string | null
          widget_type?: string | null
          widget_url?: string
          widget_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_widgets_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_widgets_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
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
          browser_name: string | null
          browser_version: string | null
          created_at: string
          device_name: string | null
          device_type: string | null
          event_type: string
          from_country_id: string | null
          id: string
          is_bot: boolean | null
          os_name: string | null
          os_version: string | null
          page_slug: string | null
          referrer_source: string | null
          screen_height: number | null
          screen_width: number | null
          search_engine_query: string | null
          search_term: string | null
          session_duration_seconds: number | null
          to_country_id: string | null
          user_agent: string | null
          visitor_ip: string | null
          visitor_location: Json | null
        }
        Insert: {
          browser_name?: string | null
          browser_version?: string | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          event_type: string
          from_country_id?: string | null
          id?: string
          is_bot?: boolean | null
          os_name?: string | null
          os_version?: string | null
          page_slug?: string | null
          referrer_source?: string | null
          screen_height?: number | null
          screen_width?: number | null
          search_engine_query?: string | null
          search_term?: string | null
          session_duration_seconds?: number | null
          to_country_id?: string | null
          user_agent?: string | null
          visitor_ip?: string | null
          visitor_location?: Json | null
        }
        Update: {
          browser_name?: string | null
          browser_version?: string | null
          created_at?: string
          device_name?: string | null
          device_type?: string | null
          event_type?: string
          from_country_id?: string | null
          id?: string
          is_bot?: boolean | null
          os_name?: string | null
          os_version?: string | null
          page_slug?: string | null
          referrer_source?: string | null
          screen_height?: number | null
          screen_width?: number | null
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
          input_tokens: number | null
          output_tokens: number | null
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
          input_tokens?: number | null
          output_tokens?: number | null
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
          input_tokens?: number | null
          output_tokens?: number | null
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
      authors: {
        Row: {
          articles_count: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          expertise: string[] | null
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          slug: string
          social_links: Json | null
          updated_at: string
        }
        Insert: {
          articles_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          role?: string | null
          slug: string
          social_links?: Json | null
          updated_at?: string
        }
        Update: {
          articles_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string | null
          slug?: string
          social_links?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          attractions: string[] | null
          best_time_to_visit: string | null
          country_id: string
          created_at: string
          description: string | null
          gallery_images: string[] | null
          getting_around: string | null
          hero_image_url: string | null
          id: string
          is_capital: boolean | null
          is_featured: boolean | null
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          population: number | null
          safety_tips: string | null
          slug: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          attractions?: string[] | null
          best_time_to_visit?: string | null
          country_id: string
          created_at?: string
          description?: string | null
          gallery_images?: string[] | null
          getting_around?: string | null
          hero_image_url?: string | null
          id?: string
          is_capital?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          population?: number | null
          safety_tips?: string | null
          slug: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          attractions?: string[] | null
          best_time_to_visit?: string | null
          country_id?: string
          created_at?: string
          description?: string | null
          gallery_images?: string[] | null
          getting_around?: string | null
          hero_image_url?: string | null
          id?: string
          is_capital?: boolean | null
          is_featured?: boolean | null
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          population?: number | null
          safety_tips?: string | null
          slug?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      content_events: {
        Row: {
          content_page_id: string | null
          content_type: string
          created_at: string
          error_message: string | null
          event_type: string
          featured_image_url: string | null
          id: string
          news_article_id: string | null
          processed: boolean
          processed_at: string | null
          processing_started_at: string | null
          slug: string
          social_post_ids: string[] | null
          title: string
        }
        Insert: {
          content_page_id?: string | null
          content_type: string
          created_at?: string
          error_message?: string | null
          event_type: string
          featured_image_url?: string | null
          id?: string
          news_article_id?: string | null
          processed?: boolean
          processed_at?: string | null
          processing_started_at?: string | null
          slug: string
          social_post_ids?: string[] | null
          title: string
        }
        Update: {
          content_page_id?: string | null
          content_type?: string
          created_at?: string
          error_message?: string | null
          event_type?: string
          featured_image_url?: string | null
          id?: string
          news_article_id?: string | null
          processed?: boolean
          processed_at?: string | null
          processing_started_at?: string | null
          slug?: string
          social_post_ids?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_events_content_page_id_fkey"
            columns: ["content_page_id"]
            isOneToOne: false
            referencedRelation: "content_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_events_news_article_id_fkey"
            columns: ["news_article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
        ]
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
          scheduled_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          view_count: number | null
          writer_id: string | null
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
          scheduled_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          view_count?: number | null
          writer_id?: string | null
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
          scheduled_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          view_count?: number | null
          writer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_pages_writer_id_fkey"
            columns: ["writer_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          annual_tourists: number | null
          capital: string | null
          code: string
          continent: string | null
          created_at: string
          currency: string | null
          entry_ban_destinations: number | null
          eta_destinations: number | null
          evisa_destinations: number | null
          flag_emoji: string | null
          id: string
          language: string | null
          name: string
          passport_free_destinations: number | null
          passport_rank: number | null
          passport_score: number | null
          peak_travel_months: string | null
          population: number | null
          region: string | null
          slug: string
          top_source_countries: string[] | null
          tourism_growth_percent: number | null
          tourism_rank: number | null
          tourism_revenue_usd: number | null
          updated_at: string
          visa_free_destinations: number | null
          visa_required_destinations: number | null
          voa_destinations: number | null
        }
        Insert: {
          annual_tourists?: number | null
          capital?: string | null
          code: string
          continent?: string | null
          created_at?: string
          currency?: string | null
          entry_ban_destinations?: number | null
          eta_destinations?: number | null
          evisa_destinations?: number | null
          flag_emoji?: string | null
          id?: string
          language?: string | null
          name: string
          passport_free_destinations?: number | null
          passport_rank?: number | null
          passport_score?: number | null
          peak_travel_months?: string | null
          population?: number | null
          region?: string | null
          slug: string
          top_source_countries?: string[] | null
          tourism_growth_percent?: number | null
          tourism_rank?: number | null
          tourism_revenue_usd?: number | null
          updated_at?: string
          visa_free_destinations?: number | null
          visa_required_destinations?: number | null
          voa_destinations?: number | null
        }
        Update: {
          annual_tourists?: number | null
          capital?: string | null
          code?: string
          continent?: string | null
          created_at?: string
          currency?: string | null
          entry_ban_destinations?: number | null
          eta_destinations?: number | null
          evisa_destinations?: number | null
          flag_emoji?: string | null
          id?: string
          language?: string | null
          name?: string
          passport_free_destinations?: number | null
          passport_rank?: number | null
          passport_score?: number | null
          peak_travel_months?: string | null
          population?: number | null
          region?: string | null
          slug?: string
          top_source_countries?: string[] | null
          tourism_growth_percent?: number | null
          tourism_rank?: number | null
          tourism_revenue_usd?: number | null
          updated_at?: string
          visa_free_destinations?: number | null
          visa_required_destinations?: number | null
          voa_destinations?: number | null
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
      email_campaigns: {
        Row: {
          clicked_count: number | null
          content: string | null
          created_at: string | null
          id: string
          opened_count: number | null
          sent_at: string | null
          sent_count: number | null
          subject: string
        }
        Insert: {
          clicked_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          opened_count?: number | null
          sent_at?: string | null
          sent_count?: number | null
          subject: string
        }
        Update: {
          clicked_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          opened_count?: number | null
          sent_at?: string | null
          sent_count?: number | null
          subject?: string
        }
        Relationships: []
      }
      email_clicks: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          id: string
          ip_address: string | null
          link_url: string | null
          subscriber_email: string | null
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          link_url?: string | null
          subscriber_email?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          id?: string
          ip_address?: string | null
          link_url?: string | null
          subscriber_email?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_opens: {
        Row: {
          campaign_id: string | null
          id: string
          ip_address: string | null
          opened_at: string | null
          subscriber_email: string
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          id?: string
          ip_address?: string | null
          opened_at?: string | null
          subscriber_email: string
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          id?: string
          ip_address?: string | null
          opened_at?: string | null
          subscriber_email?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_opens_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      etias_country_pages: {
        Row: {
          country_name: string
          country_slug: string
          created_at: string
          faqs: Json | null
          featured_image_url: string | null
          id: string
          intro: string | null
          is_published: boolean
          nationality: string
          processing_details: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          special_notes: string | null
          updated_at: string
          who_qualifies: string | null
        }
        Insert: {
          country_name: string
          country_slug: string
          created_at?: string
          faqs?: Json | null
          featured_image_url?: string | null
          id?: string
          intro?: string | null
          is_published?: boolean
          nationality: string
          processing_details?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          special_notes?: string | null
          updated_at?: string
          who_qualifies?: string | null
        }
        Update: {
          country_name?: string
          country_slug?: string
          created_at?: string
          faqs?: Json | null
          featured_image_url?: string | null
          id?: string
          intro?: string | null
          is_published?: boolean
          nationality?: string
          processing_details?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          special_notes?: string | null
          updated_at?: string
          who_qualifies?: string | null
        }
        Relationships: []
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
      gsc_search_performance: {
        Row: {
          avg_position: number | null
          clicks: number | null
          country: string | null
          created_at: string | null
          ctr: number | null
          date: string
          device: string | null
          id: string
          impressions: number | null
          page_slug: string | null
          page_url: string
          query: string | null
          updated_at: string | null
        }
        Insert: {
          avg_position?: number | null
          clicks?: number | null
          country?: string | null
          created_at?: string | null
          ctr?: number | null
          date: string
          device?: string | null
          id?: string
          impressions?: number | null
          page_slug?: string | null
          page_url: string
          query?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_position?: number | null
          clicks?: number | null
          country?: string | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          device?: string | null
          id?: string
          impressions?: number | null
          page_slug?: string | null
          page_url?: string
          query?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gsc_sync_log: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          rows_fetched: number | null
          rows_inserted: number | null
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          rows_fetched?: number | null
          rows_inserted?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          rows_fetched?: number | null
          rows_inserted?: number | null
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      gsc_url_index_status: {
        Row: {
          coverage_state: string | null
          created_at: string
          google_canonical: string | null
          id: string
          indexing_state: string | null
          inspected_at: string
          last_crawl_time: string | null
          page_fetch_state: string | null
          page_url: string
          raw_response: Json | null
          referring_urls: string[] | null
          robots_txt_state: string | null
          sitemap: string[] | null
          updated_at: string
          user_canonical: string | null
          verdict: string | null
        }
        Insert: {
          coverage_state?: string | null
          created_at?: string
          google_canonical?: string | null
          id?: string
          indexing_state?: string | null
          inspected_at?: string
          last_crawl_time?: string | null
          page_fetch_state?: string | null
          page_url: string
          raw_response?: Json | null
          referring_urls?: string[] | null
          robots_txt_state?: string | null
          sitemap?: string[] | null
          updated_at?: string
          user_canonical?: string | null
          verdict?: string | null
        }
        Update: {
          coverage_state?: string | null
          created_at?: string
          google_canonical?: string | null
          id?: string
          indexing_state?: string | null
          inspected_at?: string
          last_crawl_time?: string | null
          page_fetch_state?: string | null
          page_url?: string
          raw_response?: Json | null
          referring_urls?: string[] | null
          robots_txt_state?: string | null
          sitemap?: string[] | null
          updated_at?: string
          user_canonical?: string | null
          verdict?: string | null
        }
        Relationships: []
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
      marketing_clicks: {
        Row: {
          city: string | null
          clicked_at: string
          content_slug: string | null
          country: string | null
          id: string
          ip_address: string | null
          referrer: string | null
          social_post_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          city?: string | null
          clicked_at?: string
          content_slug?: string | null
          country?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          social_post_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          city?: string | null
          clicked_at?: string
          content_slug?: string | null
          country?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          social_post_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_clicks_social_post_id_fkey"
            columns: ["social_post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
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
          writer_id: string | null
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
          writer_id?: string | null
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
          writer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_news_articles_rss_feed"
            columns: ["rss_feed_id"]
            isOneToOne: false
            referencedRelation: "rss_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_articles_writer_id_fkey"
            columns: ["writer_id"]
            isOneToOne: false
            referencedRelation: "authors"
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
      platform_accounts: {
        Row: {
          access_token_encrypted: string | null
          account_id: string | null
          account_name: string
          created_at: string
          id: string
          is_active: boolean
          platform: string
          settings: Json | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token_encrypted?: string | null
          account_id?: string | null
          account_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string | null
          account_id?: string | null
          account_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      policy_detector_runs: {
        Row: {
          details: Json | null
          detected: number
          duration_ms: number | null
          error_message: string | null
          errors: number
          id: string
          run_at: string
          scanned: number
          trigger: string | null
        }
        Insert: {
          details?: Json | null
          detected?: number
          duration_ms?: number | null
          error_message?: string | null
          errors?: number
          id?: string
          run_at?: string
          scanned?: number
          trigger?: string | null
        }
        Update: {
          details?: Json | null
          detected?: number
          duration_ms?: number | null
          error_message?: string | null
          errors?: number
          id?: string
          run_at?: string
          scanned?: number
          trigger?: string | null
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
      rss_article_queue: {
        Row: {
          created_at: string
          error_message: string | null
          excerpt: string | null
          extracted_country: string | null
          extracted_tags: string[] | null
          extracted_visa_type: string | null
          generated_image_url: string | null
          id: string
          news_article_id: string | null
          original_content: string | null
          original_image_url: string | null
          original_pub_date: string | null
          original_title: string
          original_url: string
          processed_at: string | null
          published_at: string | null
          retry_count: number | null
          rewritten_content: string | null
          rewritten_title: string | null
          rss_feed_id: string | null
          seo_description: string | null
          seo_title: string | null
          similarity_score: number | null
          source_author: string | null
          source_name: string | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          excerpt?: string | null
          extracted_country?: string | null
          extracted_tags?: string[] | null
          extracted_visa_type?: string | null
          generated_image_url?: string | null
          id?: string
          news_article_id?: string | null
          original_content?: string | null
          original_image_url?: string | null
          original_pub_date?: string | null
          original_title: string
          original_url: string
          processed_at?: string | null
          published_at?: string | null
          retry_count?: number | null
          rewritten_content?: string | null
          rewritten_title?: string | null
          rss_feed_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          similarity_score?: number | null
          source_author?: string | null
          source_name?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          excerpt?: string | null
          extracted_country?: string | null
          extracted_tags?: string[] | null
          extracted_visa_type?: string | null
          generated_image_url?: string | null
          id?: string
          news_article_id?: string | null
          original_content?: string | null
          original_image_url?: string | null
          original_pub_date?: string | null
          original_title?: string
          original_url?: string
          processed_at?: string | null
          published_at?: string | null
          retry_count?: number | null
          rewritten_content?: string | null
          rewritten_title?: string | null
          rss_feed_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          similarity_score?: number | null
          source_author?: string | null
          source_name?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rss_article_queue_news_article_id_fkey"
            columns: ["news_article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rss_article_queue_rss_feed_id_fkey"
            columns: ["rss_feed_id"]
            isOneToOne: false
            referencedRelation: "rss_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      rss_feeds: {
        Row: {
          articles_fetched: number | null
          auto_publish: boolean | null
          category: string | null
          created_at: string
          fetch_interval_minutes: number | null
          id: string
          is_active: boolean
          last_error: string | null
          last_fetched: string | null
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          articles_fetched?: number | null
          auto_publish?: boolean | null
          category?: string | null
          created_at?: string
          fetch_interval_minutes?: number | null
          id?: string
          is_active?: boolean
          last_error?: string | null
          last_fetched?: string | null
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          articles_fetched?: number | null
          auto_publish?: boolean | null
          category?: string | null
          created_at?: string
          fetch_interval_minutes?: number | null
          id?: string
          is_active?: boolean
          last_error?: string | null
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
      seo_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          message: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      settings_affiliates: {
        Row: {
          click_count: number
          created_at: string
          end_date: string | null
          exclude_countries: string[] | null
          html_embed: string | null
          id: string
          image_url: string | null
          impressions: number | null
          is_active: boolean
          name: string
          position: string
          positions: string[]
          priority: number | null
          start_date: string | null
          target_countries: string[] | null
          target_page_patterns: string[] | null
          target_url: string
          updated_at: string
        }
        Insert: {
          click_count?: number
          created_at?: string
          end_date?: string | null
          exclude_countries?: string[] | null
          html_embed?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          is_active?: boolean
          name: string
          position?: string
          positions?: string[]
          priority?: number | null
          start_date?: string | null
          target_countries?: string[] | null
          target_page_patterns?: string[] | null
          target_url: string
          updated_at?: string
        }
        Update: {
          click_count?: number
          created_at?: string
          end_date?: string | null
          exclude_countries?: string[] | null
          html_embed?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          is_active?: boolean
          name?: string
          position?: string
          positions?: string[]
          priority?: number | null
          start_date?: string | null
          target_countries?: string[] | null
          target_page_patterns?: string[] | null
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
      social_posts: {
        Row: {
          caption: string
          content_page_id: string | null
          content_type: string
          cooldown_until: string | null
          created_at: string
          engagement_count: number | null
          error_message: string | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          impressions: number | null
          link_clicks: number | null
          news_article_id: string | null
          platform: string
          platform_account_id: string | null
          post_id: string | null
          published_at: string | null
          reach: number | null
          retry_count: number
          scheduled_at: string | null
          short_url: string | null
          status: string
          tracked_url: string | null
          updated_at: string
        }
        Insert: {
          caption: string
          content_page_id?: string | null
          content_type: string
          cooldown_until?: string | null
          created_at?: string
          engagement_count?: number | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          link_clicks?: number | null
          news_article_id?: string | null
          platform: string
          platform_account_id?: string | null
          post_id?: string | null
          published_at?: string | null
          reach?: number | null
          retry_count?: number
          scheduled_at?: string | null
          short_url?: string | null
          status?: string
          tracked_url?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string
          content_page_id?: string | null
          content_type?: string
          cooldown_until?: string | null
          created_at?: string
          engagement_count?: number | null
          error_message?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          link_clicks?: number | null
          news_article_id?: string | null
          platform?: string
          platform_account_id?: string | null
          post_id?: string | null
          published_at?: string | null
          reach?: number | null
          retry_count?: number
          scheduled_at?: string | null
          short_url?: string | null
          status?: string
          tracked_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_content_page_id_fkey"
            columns: ["content_page_id"]
            isOneToOne: false
            referencedRelation: "content_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_news_article_id_fkey"
            columns: ["news_article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_platform_account_id_fkey"
            columns: ["platform_account_id"]
            isOneToOne: false
            referencedRelation: "platform_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      visa_policy_changes: {
        Row: {
          affected_country_ids: string[] | null
          announcement_date: string
          change_type: Database["public"]["Enums"]["visa_policy_change_type"]
          country_id: string | null
          created_at: string
          effective_date: string | null
          full_description: string | null
          id: string
          is_published: boolean
          is_verified: boolean
          metadata: Json | null
          news_article_id: string | null
          published_at: string | null
          rss_queue_id: string | null
          severity: Database["public"]["Enums"]["visa_policy_severity"]
          source_name: string | null
          source_type: Database["public"]["Enums"]["visa_policy_source_type"]
          source_url: string | null
          summary: string
          title: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          affected_country_ids?: string[] | null
          announcement_date?: string
          change_type: Database["public"]["Enums"]["visa_policy_change_type"]
          country_id?: string | null
          created_at?: string
          effective_date?: string | null
          full_description?: string | null
          id?: string
          is_published?: boolean
          is_verified?: boolean
          metadata?: Json | null
          news_article_id?: string | null
          published_at?: string | null
          rss_queue_id?: string | null
          severity?: Database["public"]["Enums"]["visa_policy_severity"]
          source_name?: string | null
          source_type?: Database["public"]["Enums"]["visa_policy_source_type"]
          source_url?: string | null
          summary: string
          title: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          affected_country_ids?: string[] | null
          announcement_date?: string
          change_type?: Database["public"]["Enums"]["visa_policy_change_type"]
          country_id?: string | null
          created_at?: string
          effective_date?: string | null
          full_description?: string | null
          id?: string
          is_published?: boolean
          is_verified?: boolean
          metadata?: Json | null
          news_article_id?: string | null
          published_at?: string | null
          rss_queue_id?: string | null
          severity?: Database["public"]["Enums"]["visa_policy_severity"]
          source_name?: string | null
          source_type?: Database["public"]["Enums"]["visa_policy_source_type"]
          source_url?: string | null
          summary?: string
          title?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visa_policy_changes_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_policy_changes_news_article_id_fkey"
            columns: ["news_article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_policy_changes_rss_queue_id_fkey"
            columns: ["rss_queue_id"]
            isOneToOne: false
            referencedRelation: "rss_article_queue"
            referencedColumns: ["id"]
          },
        ]
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
      get_analytics_distribution: {
        Args: { p_end: string; p_field: string; p_start: string }
        Returns: Json
      }
      get_analytics_summary: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      get_bot_traffic_breakdown: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      get_traffic_trend: {
        Args: { p_end: string; p_granularity?: string; p_start: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_affiliate_click: {
        Args: { p_banner_id: string }
        Returns: undefined
      }
      increment_banner_impression: {
        Args: { p_banner_id: string }
        Returns: undefined
      }
      increment_city_view_count: {
        Args: { p_city_id: string }
        Returns: undefined
      }
      increment_email_clicks: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
      increment_email_opens: {
        Args: { p_campaign_id: string }
        Returns: undefined
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
      visa_policy_change_type:
        | "visa_free_added"
        | "visa_free_removed"
        | "evisa_launched"
        | "fee_change"
        | "processing_time_change"
        | "entry_ban"
        | "requirement_change"
        | "policy_announcement"
      visa_policy_severity: "info" | "update" | "warning" | "critical"
      visa_policy_source_type: "official" | "news" | "manual"
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
      visa_policy_change_type: [
        "visa_free_added",
        "visa_free_removed",
        "evisa_launched",
        "fee_change",
        "processing_time_change",
        "entry_ban",
        "requirement_change",
        "policy_announcement",
      ],
      visa_policy_severity: ["info", "update", "warning", "critical"],
      visa_policy_source_type: ["official", "news", "manual"],
    },
  },
} as const

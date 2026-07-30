export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      city_requests: {
        Row: {
          city: string | null;
          consent: boolean;
          created_at: string;
          email: string;
          id: string;
          postal_code: string;
          source_path: string | null;
          treatment_slug: string | null;
        };
        Insert: {
          city?: string | null;
          consent?: boolean;
          created_at?: string;
          email: string;
          id?: string;
          postal_code: string;
          source_path?: string | null;
          treatment_slug?: string | null;
        };
        Update: {
          city?: string | null;
          consent?: boolean;
          created_at?: string;
          email?: string;
          id?: string;
          postal_code?: string;
          source_path?: string | null;
          treatment_slug?: string | null;
        };
        Relationships: [];
      };
      clinics: {
        Row: {
          address_line: string | null;
          clinic_slug: string;
          created_at: string;
          id: string;
          is_sample: boolean;
          location_id: string;
          name: string;
          publication_status: Database["public"]["Enums"]["publication_status"];
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          address_line?: string | null;
          clinic_slug: string;
          created_at?: string;
          id?: string;
          is_sample?: boolean;
          location_id: string;
          name: string;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          address_line?: string | null;
          clinic_slug?: string;
          created_at?: string;
          id?: string;
          is_sample?: boolean;
          location_id?: string;
          name?: string;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clinics_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      comparison_requests: {
        Row: {
          context: string | null;
          created_at: string;
          email: string | null;
          id: string;
          source_path: string | null;
          treatment_a: string;
          treatment_b: string;
        };
        Insert: {
          context?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          source_path?: string | null;
          treatment_a: string;
          treatment_b: string;
        };
        Update: {
          context?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          source_path?: string | null;
          treatment_a?: string;
          treatment_b?: string;
        };
        Relationships: [];
      };
      comparison_groups: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      comparison_markets: {
        Row: {
          comparison_id: string;
          country_code: string;
          created_at: string;
          sort_rank: number;
        };
        Insert: {
          comparison_id: string;
          country_code: string;
          created_at?: string;
          sort_rank?: number;
        };
        Update: {
          comparison_id?: string;
          country_code?: string;
          created_at?: string;
          sort_rank?: number;
        };
        Relationships: [
          {
            foreignKeyName: "comparison_markets_comparison_id_fkey";
            columns: ["comparison_id"];
            isOneToOne: false;
            referencedRelation: "comparisons";
            referencedColumns: ["id"];
          },
        ];
      };
      comparisons: {
        Row: {
          comparison_mode: Database["public"]["Enums"]["comparison_mode"];
          common_misconception: string | null;
          consider_a_when: string | null;
          consider_b_when: string | null;
          created_at: string;
          description_override: string | null;
          id: string;
          is_featured: boolean;
          is_indexable: boolean;
          is_sample: boolean;
          last_reviewed_at: string | null;
          last_verified_at: string | null;
          neither_when: string | null;
          one_sentence_difference: string | null;
          pair_key: string | null;
          publication_status: Database["public"]["Enums"]["publication_status"];
          row_template: string | null;
          slug: string;
          sort_rank: number;
          title_override: string | null;
          treatment_a_id: string;
          treatment_b_id: string;
          updated_at: string;
        };
        Insert: {
          comparison_mode?: Database["public"]["Enums"]["comparison_mode"];
          common_misconception?: string | null;
          consider_a_when?: string | null;
          consider_b_when?: string | null;
          created_at?: string;
          description_override?: string | null;
          id?: string;
          is_featured?: boolean;
          is_indexable?: boolean;
          is_sample?: boolean;
          last_reviewed_at?: string | null;
          last_verified_at?: string | null;
          neither_when?: string | null;
          one_sentence_difference?: string | null;
          pair_key?: string | null;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          row_template?: string | null;
          slug: string;
          sort_rank?: number;
          title_override?: string | null;
          treatment_a_id: string;
          treatment_b_id: string;
          updated_at?: string;
        };
        Update: {
          comparison_mode?: Database["public"]["Enums"]["comparison_mode"];
          common_misconception?: string | null;
          consider_a_when?: string | null;
          consider_b_when?: string | null;
          created_at?: string;
          description_override?: string | null;
          id?: string;
          is_featured?: boolean;
          is_indexable?: boolean;
          is_sample?: boolean;
          last_reviewed_at?: string | null;
          last_verified_at?: string | null;
          neither_when?: string | null;
          one_sentence_difference?: string | null;
          pair_key?: string | null;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          row_template?: string | null;
          slug?: string;
          sort_rank?: number;
          title_override?: string | null;
          treatment_a_id?: string;
          treatment_b_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comparisons_treatment_a_id_fkey";
            columns: ["treatment_a_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comparisons_treatment_b_id_fkey";
            columns: ["treatment_b_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      content_suggestions: {
        Row: {
          body: string;
          created_at: string;
          created_by: string;
          id: string;
          sources: string[];
          status: Database["public"]["Enums"]["suggestion_status"];
          target_slug: string | null;
          target_type: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          created_by: string;
          id?: string;
          sources?: string[];
          status?: Database["public"]["Enums"]["suggestion_status"];
          target_slug?: string | null;
          target_type: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          sources?: string[];
          status?: Database["public"]["Enums"]["suggestion_status"];
          target_slug?: string | null;
          target_type?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          city: string;
          city_slug: string;
          country_code: string;
          coverage_status: string;
          created_at: string;
          id: string;
          is_indexable: boolean;
          latitude: number | null;
          longitude: number | null;
          region_code: string;
          updated_at: string;
        };
        Insert: {
          city: string;
          city_slug: string;
          country_code: string;
          coverage_status?: string;
          created_at?: string;
          id?: string;
          is_indexable?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          region_code: string;
          updated_at?: string;
        };
        Update: {
          city?: string;
          city_slug?: string;
          country_code?: string;
          coverage_status?: string;
          created_at?: string;
          id?: string;
          is_indexable?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          region_code?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      offers: {
        Row: {
          clinic_id: string;
          created_at: string;
          currency: string;
          description: string | null;
          effective_unit_price: number | null;
          ends_at: string | null;
          id: string;
          intended_areas: string[];
          is_sample: boolean;
          location_id: string;
          membership_required: boolean;
          new_customer_only: boolean;
          observed_at: string | null;
          offer_amount: number | null;
          pricing_unit: string | null;
          publication_status: Database["public"]["Enums"]["publication_status"];
          quantity: number | null;
          regular_amount: number | null;
          restrictions: string | null;
          source_type: string | null;
          source_url: string | null;
          starts_at: string | null;
          title: string;
          treatment_id: string;
          updated_at: string;
          verification_status: Database["public"]["Enums"]["verification_status"];
        };
        Insert: {
          clinic_id: string;
          created_at?: string;
          currency?: string;
          description?: string | null;
          effective_unit_price?: number | null;
          ends_at?: string | null;
          id?: string;
          intended_areas?: string[];
          is_sample?: boolean;
          location_id: string;
          membership_required?: boolean;
          new_customer_only?: boolean;
          observed_at?: string | null;
          offer_amount?: number | null;
          pricing_unit?: string | null;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          quantity?: number | null;
          regular_amount?: number | null;
          restrictions?: string | null;
          source_type?: string | null;
          source_url?: string | null;
          starts_at?: string | null;
          title: string;
          treatment_id: string;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Update: {
          clinic_id?: string;
          created_at?: string;
          currency?: string;
          description?: string | null;
          effective_unit_price?: number | null;
          ends_at?: string | null;
          id?: string;
          intended_areas?: string[];
          is_sample?: boolean;
          location_id?: string;
          membership_required?: boolean;
          new_customer_only?: boolean;
          observed_at?: string | null;
          offer_amount?: number | null;
          pricing_unit?: string | null;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          quantity?: number | null;
          regular_amount?: number | null;
          restrictions?: string | null;
          source_type?: string | null;
          source_url?: string | null;
          starts_at?: string | null;
          title?: string;
          treatment_id?: string;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Relationships: [
          {
            foreignKeyName: "offers_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "offers_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      price_alert_interest: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          max_unit_price: number | null;
          postal_code: string;
          source_path: string | null;
          treatment_slug: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          max_unit_price?: number | null;
          postal_code: string;
          source_path?: string | null;
          treatment_slug: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          max_unit_price?: number | null;
          postal_code?: string;
          source_path?: string | null;
          treatment_slug?: string;
        };
        Relationships: [];
      };
      price_observations: {
        Row: {
          advertised_amount: number;
          clinic_id: string;
          conditions: string | null;
          created_at: string;
          currency: string;
          effective_unit_price: number | null;
          expires_at: string | null;
          id: string;
          is_sample: boolean;
          location_id: string;
          manufacturer_reward_required: boolean;
          membership_required: boolean;
          minimum_purchase: string | null;
          new_customer_only: boolean;
          observed_at: string | null;
          pricing_unit: string;
          publication_status: Database["public"]["Enums"]["publication_status"];
          quantity: number | null;
          regular_amount: number | null;
          source_type: string | null;
          source_url: string | null;
          starts_at_price: boolean;
          treatment_area: string | null;
          treatment_id: string;
          verification_status: Database["public"]["Enums"]["verification_status"];
        };
        Insert: {
          advertised_amount: number;
          clinic_id: string;
          conditions?: string | null;
          created_at?: string;
          currency?: string;
          effective_unit_price?: number | null;
          expires_at?: string | null;
          id?: string;
          is_sample?: boolean;
          location_id: string;
          manufacturer_reward_required?: boolean;
          membership_required?: boolean;
          minimum_purchase?: string | null;
          new_customer_only?: boolean;
          observed_at?: string | null;
          pricing_unit: string;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          quantity?: number | null;
          regular_amount?: number | null;
          source_type?: string | null;
          source_url?: string | null;
          starts_at_price?: boolean;
          treatment_area?: string | null;
          treatment_id: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Update: {
          advertised_amount?: number;
          clinic_id?: string;
          conditions?: string | null;
          created_at?: string;
          currency?: string;
          effective_unit_price?: number | null;
          expires_at?: string | null;
          id?: string;
          is_sample?: boolean;
          location_id?: string;
          manufacturer_reward_required?: boolean;
          membership_required?: boolean;
          minimum_purchase?: string | null;
          new_customer_only?: boolean;
          observed_at?: string | null;
          pricing_unit?: string;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          quantity?: number | null;
          regular_amount?: number | null;
          source_type?: string | null;
          source_url?: string | null;
          starts_at_price?: boolean;
          treatment_area?: string | null;
          treatment_id?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Relationships: [
          {
            foreignKeyName: "price_observations_clinic_id_fkey";
            columns: ["clinic_id"];
            isOneToOne: false;
            referencedRelation: "clinics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "price_observations_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "price_observations_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      submission_audit: {
        Row: {
          created_at: string;
          id: string;
          ip_hash: string | null;
          kind: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ip_hash?: string | null;
          kind: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          ip_hash?: string | null;
          kind?: string;
        };
        Relationships: [];
      };
      treatment_media: {
        Row: {
          alt_text: string;
          created_at: string;
          credit: string;
          id: string;
          is_sample: boolean;
          license: string;
          license_url: string | null;
          media_role: string;
          publication_status: Database["public"]["Enums"]["publication_status"];
          rights_verified_at: string | null;
          source_url: string;
          treatment_id: string;
          updated_at: string;
          url: string;
        };
        Insert: {
          alt_text: string;
          created_at?: string;
          credit: string;
          id?: string;
          is_sample?: boolean;
          license: string;
          license_url?: string | null;
          media_role?: string;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          rights_verified_at?: string | null;
          source_url: string;
          treatment_id: string;
          updated_at?: string;
          url: string;
        };
        Update: {
          alt_text?: string;
          created_at?: string;
          credit?: string;
          id?: string;
          is_sample?: boolean;
          license?: string;
          license_url?: string | null;
          media_role?: string;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          rights_verified_at?: string | null;
          source_url?: string;
          treatment_id?: string;
          updated_at?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treatment_media_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      treatment_sources: {
        Row: {
          claim_field: string;
          created_at: string;
          evidence_level: string | null;
          id: string;
          is_sample: boolean;
          notes: string | null;
          publication_date: string | null;
          retrieved_at: string;
          source_title: string;
          source_type: string;
          source_url: string;
          treatment_id: string;
        };
        Insert: {
          claim_field: string;
          created_at?: string;
          evidence_level?: string | null;
          id?: string;
          is_sample?: boolean;
          notes?: string | null;
          publication_date?: string | null;
          retrieved_at?: string;
          source_title: string;
          source_type: string;
          source_url: string;
          treatment_id: string;
        };
        Update: {
          claim_field?: string;
          created_at?: string;
          evidence_level?: string | null;
          id?: string;
          is_sample?: boolean;
          notes?: string | null;
          publication_date?: string | null;
          retrieved_at?: string;
          source_title?: string;
          source_type?: string;
          source_url?: string;
          treatment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treatment_sources_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      treatment_comparison_groups: {
        Row: {
          comparison_group_id: string;
          created_at: string;
          treatment_id: string;
        };
        Insert: {
          comparison_group_id: string;
          created_at?: string;
          treatment_id: string;
        };
        Update: {
          comparison_group_id?: string;
          created_at?: string;
          treatment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treatment_comparison_groups_comparison_group_id_fkey";
            columns: ["comparison_group_id"];
            isOneToOne: false;
            referencedRelation: "comparison_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "treatment_comparison_groups_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      treatment_markets: {
        Row: {
          country_code: string;
          created_at: string;
          treatment_id: string;
        };
        Insert: {
          country_code: string;
          created_at?: string;
          treatment_id: string;
        };
        Update: {
          country_code?: string;
          created_at?: string;
          treatment_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "treatment_markets_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      treatments: {
        Row: {
          adds_volume: string | null;
          appointment_time: string | null;
          at_a_glance: Json | null;
          brand_name: string | null;
          bruising_text: string | null;
          category: string;
          created_at: string;
          downtime_text: string | null;
          entity_type: Database["public"]["Enums"]["treatment_entity_type"];
          evidence_grade: string | null;
          exercise_restrictions: string | null;
          expected_result_magnitude: string | null;
          fda_status: string | null;
          canada_status: string | null;
          generic_name: string | null;
          id: string;
          is_sample: boolean;
          last_reviewed_at: string | null;
          longevity_text: string | null;
          major_risks: string | null;
          manufacturer: string | null;
          marketing_misconception: string | null;
          mechanism: string | null;
          most_likely_disappointment: string | null;
          name: string;
          pain_level: string | null;
          parent_id: string | null;
          primary_purpose: string | null;
          pricing_basis: string | null;
          provider_variables: string | null;
          publication_status: Database["public"]["Enums"]["publication_status"];
          result_timing: string | null;
          reversibility: string | null;
          sessions_text: string | null;
          skin_tone_notes: string | null;
          slug: string;
          sort_rank: number;
          summary: string | null;
          swelling_text: string | null;
          tightening_level: string | null;
          treatment_class: string;
          true_substitute_notes: string | null;
          updated_at: string;
          what_it_changes: string | null;
          what_it_does_not_change: string | null;
          when_not_appropriate: string | null;
        };
        Insert: {
          adds_volume?: string | null;
          appointment_time?: string | null;
          at_a_glance?: Json | null;
          brand_name?: string | null;
          bruising_text?: string | null;
          category: string;
          created_at?: string;
          downtime_text?: string | null;
          entity_type?: Database["public"]["Enums"]["treatment_entity_type"];
          evidence_grade?: string | null;
          exercise_restrictions?: string | null;
          expected_result_magnitude?: string | null;
          fda_status?: string | null;
          canada_status?: string | null;
          generic_name?: string | null;
          id?: string;
          is_sample?: boolean;
          last_reviewed_at?: string | null;
          longevity_text?: string | null;
          major_risks?: string | null;
          manufacturer?: string | null;
          marketing_misconception?: string | null;
          mechanism?: string | null;
          most_likely_disappointment?: string | null;
          name: string;
          pain_level?: string | null;
          parent_id?: string | null;
          primary_purpose?: string | null;
          pricing_basis?: string | null;
          provider_variables?: string | null;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          result_timing?: string | null;
          reversibility?: string | null;
          sessions_text?: string | null;
          skin_tone_notes?: string | null;
          slug: string;
          sort_rank?: number;
          summary?: string | null;
          swelling_text?: string | null;
          tightening_level?: string | null;
          treatment_class: string;
          true_substitute_notes?: string | null;
          updated_at?: string;
          what_it_changes?: string | null;
          what_it_does_not_change?: string | null;
          when_not_appropriate?: string | null;
        };
        Update: {
          adds_volume?: string | null;
          appointment_time?: string | null;
          at_a_glance?: Json | null;
          brand_name?: string | null;
          bruising_text?: string | null;
          category?: string;
          created_at?: string;
          downtime_text?: string | null;
          entity_type?: Database["public"]["Enums"]["treatment_entity_type"];
          evidence_grade?: string | null;
          exercise_restrictions?: string | null;
          expected_result_magnitude?: string | null;
          fda_status?: string | null;
          canada_status?: string | null;
          generic_name?: string | null;
          id?: string;
          is_sample?: boolean;
          last_reviewed_at?: string | null;
          longevity_text?: string | null;
          major_risks?: string | null;
          manufacturer?: string | null;
          marketing_misconception?: string | null;
          mechanism?: string | null;
          most_likely_disappointment?: string | null;
          name?: string;
          pain_level?: string | null;
          parent_id?: string | null;
          primary_purpose?: string | null;
          pricing_basis?: string | null;
          provider_variables?: string | null;
          publication_status?: Database["public"]["Enums"]["publication_status"];
          result_timing?: string | null;
          reversibility?: string | null;
          sessions_text?: string | null;
          skin_tone_notes?: string | null;
          slug?: string;
          sort_rank?: number;
          summary?: string | null;
          swelling_text?: string | null;
          tightening_level?: string | null;
          treatment_class?: string;
          true_substitute_notes?: string | null;
          updated_at?: string;
          what_it_changes?: string | null;
          what_it_does_not_change?: string | null;
          when_not_appropriate?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "treatments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "admin" | "editor";
      comparison_mode: "direct" | "different_approach";
      publication_status: "draft" | "review" | "published";
      suggestion_status: "new" | "accepted" | "rejected";
      treatment_entity_type: "class" | "brand_family" | "product" | "device" | "procedure";
      verification_status:
        "unverified" | "source_checked" | "clinic_confirmed" | "expired" | "publicly_listed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor"],
      comparison_mode: ["direct", "different_approach"],
      publication_status: ["draft", "review", "published"],
      suggestion_status: ["new", "accepted", "rejected"],
      treatment_entity_type: ["class", "brand_family", "product", "device", "procedure"],
      verification_status: [
        "unverified",
        "source_checked",
        "clinic_confirmed",
        "expired",
        "publicly_listed",
      ],
    },
  },
} as const;

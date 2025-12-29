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
      admin_seller_address: {
        Row: {
          address: string
          address_detail: string
          address_name: string
          address_type: Database["public"]["Enums"]["admin_address_type"]
          created_at: string
          id: number
          seller_id: number | null
          updated_at: string
          zone_code: string
        }
        Insert: {
          address: string
          address_detail: string
          address_name: string
          address_type: Database["public"]["Enums"]["admin_address_type"]
          created_at?: string
          id?: never
          seller_id?: number | null
          updated_at?: string
          zone_code: string
        }
        Update: {
          address?: string
          address_detail?: string
          address_name?: string
          address_type?: Database["public"]["Enums"]["admin_address_type"]
          created_at?: string
          id?: never
          seller_id?: number | null
          updated_at?: string
          zone_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_seller_address_seller_id_admin_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "admin_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_seller_members: {
        Row: {
          created_at: string
          id: number
          seller_id: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          seller_id?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          seller_id?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_seller_members_seller_id_admin_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "admin_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_seller_members_user_id_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      admin_sellers: {
        Row: {
          address: string
          address_detail: string
          bizr_no: string
          business: string
          created_at: string
          domain_id: number | null
          id: number
          name: string
          representative_name: string
          updated_at: string
          zone_code: string
        }
        Insert: {
          address: string
          address_detail: string
          bizr_no: string
          business: string
          created_at?: string
          domain_id?: number | null
          id?: never
          name: string
          representative_name: string
          updated_at?: string
          zone_code: string
        }
        Update: {
          address?: string
          address_detail?: string
          bizr_no?: string
          business?: string
          created_at?: string
          domain_id?: number | null
          id?: never
          name?: string
          representative_name?: string
          updated_at?: string
          zone_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_sellers_domain_id_domains_id_fk"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          code: string
          created_at: string
          id: number
          name: string
          updated_at: string
          use_yn: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: never
          name: string
          updated_at?: string
          use_yn: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: never
          name?: string
          updated_at?: string
          use_yn?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string | null
          following_id: string | null
        }
        Insert: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
        }
        Update: {
          created_at?: string
          follower_id?: string | null
          following_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_profiles_profile_id_fk"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "follows_following_id_profiles_profile_id_fk"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      main_categories: {
        Row: {
          code: string
          created_at: string
          domain_id: number | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          domain_id?: number | null
          id?: never
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          domain_id?: number | null
          id?: never
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "main_categories_domain_id_domains_id_fk"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      product_descriptions: {
        Row: {
          content: string | null
          created_at: string
          id: number
          product_id: number | null
          type: Database["public"]["Enums"]["description_type"]
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: never
          product_id?: number | null
          type?: Database["public"]["Enums"]["description_type"]
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: never
          product_id?: number | null
          type?: Database["public"]["Enums"]["description_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_descriptions_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_details: {
        Row: {
          brand: string | null
          created_at: string
          id: number
          maker: string
          product_id: number | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          id?: never
          maker: string
          product_id?: number | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          id?: never
          maker?: string
          product_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_details_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: number
          product_id: number | null
          sku_id: number | null
          type: Database["public"]["Enums"]["image_type"]
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: never
          product_id?: number | null
          sku_id?: number | null
          type?: Database["public"]["Enums"]["image_type"]
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: never
          product_id?: number | null
          sku_id?: number | null
          type?: Database["public"]["Enums"]["image_type"]
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_sku_id_product_stock_keepings_id_fk"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "product_stock_keepings"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string
          id: number
          option: string
          product_id: number | null
          system_option_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          option: string
          product_id?: number | null
          system_option_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          option?: string
          product_id?: number | null
          system_option_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_options_system_option_id_system_options_id_fk"
            columns: ["system_option_id"]
            isOneToOne: false
            referencedRelation: "system_options"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stock_keepings: {
        Row: {
          created_at: string
          id: number
          product_id: number | null
          regular_price: number | null
          sale_price: number | null
          sku_code: string
          status: Database["public"]["Enums"]["sales_status"]
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          product_id?: number | null
          regular_price?: number | null
          sale_price?: number | null
          sku_code: string
          status?: Database["public"]["Enums"]["sales_status"]
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          product_id?: number | null
          regular_price?: number | null
          sale_price?: number | null
          sku_code?: string
          status?: Database["public"]["Enums"]["sales_status"]
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_stock_keepings_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          domain_id: number | null
          gender: Database["public"]["Enums"]["gender_type"]
          id: number
          main_category: string
          name: string
          seller_id: number | null
          sub_category: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain_id?: number | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: never
          main_category: string
          name: string
          seller_id?: number | null
          sub_category: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain_id?: number | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: never
          main_category?: string
          name?: string
          seller_id?: number | null
          sub_category?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_domain_id_domains_id_fk"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_admin_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "admin_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          comment: string | null
          created_at: string
          introduction: string | null
          nickname: string
          profile_id: string
          role: Database["public"]["Enums"]["role"]
          stats: Json | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar?: string | null
          comment?: string | null
          created_at?: string
          introduction?: string | null
          nickname: string
          profile_id: string
          role?: Database["public"]["Enums"]["role"]
          stats?: Json | null
          updated_at?: string
          username: string
        }
        Update: {
          avatar?: string | null
          comment?: string | null
          created_at?: string
          introduction?: string | null
          nickname?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["role"]
          stats?: Json | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      sub_categories: {
        Row: {
          code: string
          created_at: string
          id: number
          main_category_code: number | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: never
          main_category_code?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: never
          main_category_code?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_categories_main_category_code_main_categories_id_fk"
            columns: ["main_category_code"]
            isOneToOne: false
            referencedRelation: "main_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      system_options: {
        Row: {
          code: string
          created_at: string
          domain_id: number | null
          id: number
          key: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          domain_id?: number | null
          id?: never
          key: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          domain_id?: number | null
          id?: never
          key?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_options_domain_id_domains_id_fk"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
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
      admin_address_type: "SHIPPING" | "RETURN"
      description_type: "IMAGE" | "HTML"
      gender_type: "MALE" | "FEMALE" | "UNISEX"
      image_type: "MAIN" | "ADDITIONAL"
      role: "customer" | "seller" | "administrator"
      sales_status: "PREPARE" | "SALE" | "SOLD_OUT" | "STOP" | "COMPLETE"
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
      admin_address_type: ["SHIPPING", "RETURN"],
      description_type: ["IMAGE", "HTML"],
      gender_type: ["MALE", "FEMALE", "UNISEX"],
      image_type: ["MAIN", "ADDITIONAL"],
      role: ["customer", "seller", "administrator"],
      sales_status: ["PREPARE", "SALE", "SOLD_OUT", "STOP", "COMPLETE"],
    },
  },
} as const

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
          id: string
          seller_id: string | null
          updated_at: string
          zone_code: string
        }
        Insert: {
          address: string
          address_detail: string
          address_name: string
          address_type: Database["public"]["Enums"]["admin_address_type"]
          created_at?: string
          id?: string
          seller_id?: string | null
          updated_at?: string
          zone_code: string
        }
        Update: {
          address?: string
          address_detail?: string
          address_name?: string
          address_type?: Database["public"]["Enums"]["admin_address_type"]
          created_at?: string
          id?: string
          seller_id?: string | null
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
          {
            foreignKeyName: "admin_seller_address_seller_id_admin_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_information_view"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_seller_members: {
        Row: {
          created_at: string
          id: string
          seller_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          seller_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          seller_id?: string | null
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
            foreignKeyName: "admin_seller_members_seller_id_admin_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_information_view"
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
          domain_id: string | null
          id: string
          name: string
          representative_name: string
          seller_code: string
          updated_at: string
          zone_code: string
        }
        Insert: {
          address: string
          address_detail: string
          bizr_no: string
          business: string
          created_at?: string
          domain_id?: string | null
          id?: string
          name: string
          representative_name: string
          seller_code: string
          updated_at?: string
          zone_code: string
        }
        Update: {
          address?: string
          address_detail?: string
          bizr_no?: string
          business?: string
          created_at?: string
          domain_id?: string | null
          id?: string
          name?: string
          representative_name?: string
          seller_code?: string
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
      carts: {
        Row: {
          created_at: string
          id: string
          quantity: number
          sku_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          sku_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          sku_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_sku_id_product_stock_keepings_id_fk"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "product_stock_keepings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carts_user_id_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      children: {
        Row: {
          birth_date: string
          code: number
          created_at: string
          gender: Database["public"]["Enums"]["child_gender"] | null
          id: string
          name: string | null
          nickname: string
          profile_image_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date: string
          code: number
          created_at?: string
          gender?: Database["public"]["Enums"]["child_gender"] | null
          id?: string
          name?: string | null
          nickname: string
          profile_image_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string
          code?: number
          created_at?: string
          gender?: Database["public"]["Enums"]["child_gender"] | null
          id?: string
          name?: string | null
          nickname?: string
          profile_image_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_user_id_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      common_code_group: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      common_codes: {
        Row: {
          code: string
          created_at: string
          group_id: string | null
          id: string
          name: string
          updated_at: string
          use_yn: string
        }
        Insert: {
          code: string
          created_at?: string
          group_id?: string | null
          id?: string
          name: string
          updated_at?: string
          use_yn?: string
        }
        Update: {
          code?: string
          created_at?: string
          group_id?: string | null
          id?: string
          name?: string
          updated_at?: string
          use_yn?: string
        }
        Relationships: [
          {
            foreignKeyName: "common_codes_group_id_common_code_group_id_fk"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "common_code_group"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          courier: string | null
          created_at: string
          delivered_at: string | null
          id: string
          order_id: string
          shipped_at: string | null
          shipping_fee: number
          status: Database["public"]["Enums"]["delivery_status"]
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          courier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          order_id: string
          shipped_at?: string | null
          shipping_fee?: number
          status?: Database["public"]["Enums"]["delivery_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          courier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          order_id?: string
          shipped_at?: string | null
          shipping_fee?: number
          status?: Database["public"]["Enums"]["delivery_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_orders_id_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_items: {
        Row: {
          created_at: string
          delivery_id: string
          id: string
          order_item_id: string
          quantity: number
          status: Database["public"]["Enums"]["delivery_item_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_id: string
          id?: string
          order_item_id: string
          quantity: number
          status?: Database["public"]["Enums"]["delivery_item_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_id?: string
          id?: string
          order_item_id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["delivery_item_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_items_delivery_id_deliveries_id_fk"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_items_order_item_id_order_items_id_fk"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
          use_yn: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          use_yn: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
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
      growth_records: {
        Row: {
          child_id: string
          created_at: string
          foot_size: number | null
          head_circumference: number | null
          height: number | null
          id: string
          measured_at: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          child_id: string
          created_at?: string
          foot_size?: number | null
          head_circumference?: number | null
          height?: number | null
          id?: string
          measured_at: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          child_id?: string
          created_at?: string
          foot_size?: number | null
          head_circumference?: number | null
          height?: number | null
          id?: string
          measured_at?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_records_child_id_children_id_fk"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      main_categories: {
        Row: {
          code: string
          created_at: string
          domain_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          domain_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          domain_id?: string
          id?: string
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
      order_groups: {
        Row: {
          address: string
          address_detail: string | null
          created_at: string
          id: string
          order_number: string
          paid_at: string | null
          payment_method:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          recipient_name: string
          recipient_phone: string
          status: Database["public"]["Enums"]["order_group_status"]
          total_amount: number
          total_discount_amount: number
          total_product_amount: number
          total_shipping_fee: number
          updated_at: string
          user_id: string
          zone_code: string
        }
        Insert: {
          address: string
          address_detail?: string | null
          created_at?: string
          id?: string
          order_number: string
          paid_at?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          recipient_name: string
          recipient_phone: string
          status?: Database["public"]["Enums"]["order_group_status"]
          total_amount: number
          total_discount_amount?: number
          total_product_amount: number
          total_shipping_fee: number
          updated_at?: string
          user_id: string
          zone_code: string
        }
        Update: {
          address?: string
          address_detail?: string | null
          created_at?: string
          id?: string
          order_number?: string
          paid_at?: string | null
          payment_method?:
            | Database["public"]["Enums"]["payment_method_type"]
            | null
          recipient_name?: string
          recipient_phone?: string
          status?: Database["public"]["Enums"]["order_group_status"]
          total_amount?: number
          total_discount_amount?: number
          total_product_amount?: number
          total_shipping_fee?: number
          updated_at?: string
          user_id?: string
          zone_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_groups_user_id_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      order_items: {
        Row: {
          base_shipping_fee: number
          created_at: string
          free_shipping_condition_value: number | null
          id: string
          main_image: string | null
          options: Json | null
          order_id: string
          product_code: string
          product_id: string | null
          product_name: string
          quantity: number
          regular_price: number
          sale_price: number
          ship_from_region: string | null
          shipping_fee_type: Database["public"]["Enums"]["shipping_fee_type"]
          sku_code: string
          sku_id: string | null
          subtotal: number
        }
        Insert: {
          base_shipping_fee?: number
          created_at?: string
          free_shipping_condition_value?: number | null
          id?: string
          main_image?: string | null
          options?: Json | null
          order_id: string
          product_code: string
          product_id?: string | null
          product_name: string
          quantity: number
          regular_price: number
          sale_price: number
          ship_from_region?: string | null
          shipping_fee_type: Database["public"]["Enums"]["shipping_fee_type"]
          sku_code: string
          sku_id?: string | null
          subtotal: number
        }
        Update: {
          base_shipping_fee?: number
          created_at?: string
          free_shipping_condition_value?: number | null
          id?: string
          main_image?: string | null
          options?: Json | null
          order_id?: string
          product_code?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          regular_price?: number
          sale_price?: number
          ship_from_region?: string | null
          shipping_fee_type?: Database["public"]["Enums"]["shipping_fee_type"]
          sku_code?: string
          sku_id?: string | null
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_orders_id_fk"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_sku_id_product_stock_keepings_id_fk"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "product_stock_keepings"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          order_group_id: string
          order_number: string
          product_amount: number
          seller_code: string
          seller_id: string
          seller_name: string
          shipping_fee: number
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_group_id: string
          order_number: string
          product_amount: number
          seller_code: string
          seller_id: string
          seller_name: string
          shipping_fee: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          order_group_id?: string
          order_number?: string
          product_amount?: number
          seller_code?: string
          seller_id?: string
          seller_name?: string
          shipping_fee?: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_order_group_id_order_groups_id_fk"
            columns: ["order_group_id"]
            isOneToOne: false
            referencedRelation: "order_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_admin_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "admin_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_admin_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_information_view"
            referencedColumns: ["id"]
          },
        ]
      }
      product_deliveries: {
        Row: {
          address_id: string
          bundle_delivery: Database["public"]["Enums"]["bundle_delivery_type"]
          courier_company: Database["public"]["Enums"]["courier_company"]
          created_at: string
          delivery_method: Database["public"]["Enums"]["delivery_method_type"]
          free_shipping_condition: number | null
          id: string
          island_delivery: Database["public"]["Enums"]["island_delivery_type"]
          product_id: string
          shipping_days: number
          shipping_fee: number
          shipping_fee_type: Database["public"]["Enums"]["shipping_fee_type"]
          updated_at: string
        }
        Insert: {
          address_id: string
          bundle_delivery?: Database["public"]["Enums"]["bundle_delivery_type"]
          courier_company?: Database["public"]["Enums"]["courier_company"]
          created_at?: string
          delivery_method?: Database["public"]["Enums"]["delivery_method_type"]
          free_shipping_condition?: number | null
          id?: string
          island_delivery?: Database["public"]["Enums"]["island_delivery_type"]
          product_id: string
          shipping_days?: number
          shipping_fee?: number
          shipping_fee_type?: Database["public"]["Enums"]["shipping_fee_type"]
          updated_at?: string
        }
        Update: {
          address_id?: string
          bundle_delivery?: Database["public"]["Enums"]["bundle_delivery_type"]
          courier_company?: Database["public"]["Enums"]["courier_company"]
          created_at?: string
          delivery_method?: Database["public"]["Enums"]["delivery_method_type"]
          free_shipping_condition?: number | null
          id?: string
          island_delivery?: Database["public"]["Enums"]["island_delivery_type"]
          product_id?: string
          shipping_days?: number
          shipping_fee?: number
          shipping_fee_type?: Database["public"]["Enums"]["shipping_fee_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_deliveries_address_id_admin_seller_address_id_fk"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "admin_seller_address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_deliveries_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_descriptions: {
        Row: {
          content: string | null
          created_at: string
          id: string
          product_id: string | null
          type: Database["public"]["Enums"]["description_type"]
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          type?: Database["public"]["Enums"]["description_type"]
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
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
          id: string
          maker: string
          product_id: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          id?: string
          maker: string
          product_id?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          id?: string
          maker?: string
          product_id?: string | null
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
          id: string
          product_id: string | null
          sku_id: string | null
          type: Database["public"]["Enums"]["image_type"]
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          sku_id?: string | null
          type?: Database["public"]["Enums"]["image_type"]
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          sku_id?: string | null
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
      product_likes: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_likes_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_likes_user_id_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string
          id: string
          option: string
          product_id: string | null
          system_option_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          option: string
          product_id?: string | null
          system_option_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          option?: string
          product_id?: string | null
          system_option_id?: string
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
      product_returns: {
        Row: {
          address_id: string
          created_at: string
          id: string
          initial_shipping_fee: number
          product_id: string
          return_shipping_fee: number
          updated_at: string
        }
        Insert: {
          address_id: string
          created_at?: string
          id?: string
          initial_shipping_fee?: number
          product_id: string
          return_shipping_fee?: number
          updated_at?: string
        }
        Update: {
          address_id?: string
          created_at?: string
          id?: string
          initial_shipping_fee?: number
          product_id?: string
          return_shipping_fee?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_returns_address_id_admin_seller_address_id_fk"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "admin_seller_address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_returns_product_id_products_id_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stock_keepings: {
        Row: {
          created_at: string
          id: string
          options: Json | null
          product_id: string | null
          regular_price: number | null
          sale_price: number | null
          sku_code: string
          status: Database["public"]["Enums"]["sales_status"]
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json | null
          product_id?: string | null
          regular_price?: number | null
          sale_price?: number | null
          sku_code: string
          status?: Database["public"]["Enums"]["sales_status"]
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
          product_id?: string | null
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
          domain_id: string | null
          id: string
          main_category: string
          name: string
          product_code: string
          seller_id: string | null
          status: Database["public"]["Enums"]["sales_status"]
          storage_folder: string
          sub_category: string
          target_age: Database["public"]["Enums"]["target_age_type"]
          target_gender: Database["public"]["Enums"]["target_gender_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain_id?: string | null
          id?: string
          main_category: string
          name: string
          product_code: string
          seller_id?: string | null
          status?: Database["public"]["Enums"]["sales_status"]
          storage_folder: string
          sub_category: string
          target_age?: Database["public"]["Enums"]["target_age_type"]
          target_gender?: Database["public"]["Enums"]["target_gender_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain_id?: string | null
          id?: string
          main_category?: string
          name?: string
          product_code?: string
          seller_id?: string | null
          status?: Database["public"]["Enums"]["sales_status"]
          storage_folder?: string
          sub_category?: string
          target_age?: Database["public"]["Enums"]["target_age_type"]
          target_gender?: Database["public"]["Enums"]["target_gender_type"]
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
            foreignKeyName: "products_main_category_main_categories_id_fk"
            columns: ["main_category"]
            isOneToOne: false
            referencedRelation: "main_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_admin_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "admin_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_admin_sellers_id_fk"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_information_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sub_category_sub_categories_id_fk"
            columns: ["sub_category"]
            isOneToOne: false
            referencedRelation: "sub_categories"
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
          phone: string | null
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
          phone?: string | null
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
          phone?: string | null
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
          id: string
          main_category_id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          main_category_id: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          main_category_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sub_categories_main_category_id_main_categories_id_fk"
            columns: ["main_category_id"]
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
          domain_id: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          domain_id: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          domain_id?: string
          id?: string
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
      user_addresses: {
        Row: {
          address: string
          address_detail: string | null
          created_at: string
          id: string
          is_default: boolean
          label: string
          recipient_name: string
          recipient_phone: string
          updated_at: string
          user_id: string
          zone_code: string
        }
        Insert: {
          address: string
          address_detail?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label: string
          recipient_name: string
          recipient_phone: string
          updated_at?: string
          user_id: string
          zone_code: string
        }
        Update: {
          address?: string
          address_detail?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          recipient_name?: string
          recipient_phone?: string
          updated_at?: string
          user_id?: string
          zone_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_profiles_profile_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
    }
    Views: {
      seller_information_view: {
        Row: {
          address: string | null
          address_detail: string | null
          bizr_no: string | null
          business: string | null
          created_at: string | null
          domain_id: string | null
          domain_name: string | null
          id: string | null
          name: string | null
          representative_name: string | null
          seller_code: string | null
          updated_at: string | null
          zone_code: string | null
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
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_address_type: "SHIPPING" | "RETURN"
      bundle_delivery_type: "AVAILABLE" | "UNAVAILABLE"
      child_gender: "boy" | "girl"
      courier_company:
        | "CJ"
        | "POST"
        | "HANJIN"
        | "LOGEN"
        | "LOTTE"
        | "KDEXP"
        | "DAESIN"
        | "GSM"
        | "ILYANG"
        | "HDEXP"
      delivery_item_status:
        | "normal"
        | "cancelled"
        | "return_requested"
        | "returned"
        | "exchange_requested"
        | "exchanged"
      delivery_method_type:
        | "STANDARD"
        | "FRESH_FROZEN"
        | "CUSTOM_ORDER"
        | "PURCHASE_AGENCY"
        | "INSTALLATION_DIRECT"
      delivery_status:
        | "pending"
        | "preparing"
        | "shipped"
        | "in_transit"
        | "delivered"
      description_type: "IMAGE" | "HTML"
      image_type: "MAIN" | "ADDITIONAL"
      island_delivery_type: "AVAILABLE" | "UNAVAILABLE"
      order_group_status:
        | "payment_in_progress"
        | "payment_pending"
        | "paid"
        | "partially_refunded"
        | "refunded"
        | "cancelled"
        | "failed"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_method_type:
        | "bank_transfer"
        | "credit_card"
        | "mobile_payment"
        | "easy_pay"
        | "virtual_account"
      role: "customer" | "seller" | "administrator"
      sales_status:
        | "REGISTERED"
        | "PREPARE"
        | "SALE"
        | "SOLD_OUT"
        | "STOP"
        | "END"
      shipping_fee_type: "FREE" | "PAID" | "COD" | "CONDITIONAL"
      target_age_type: "BABY" | "KIDS"
      target_gender_type: "GIRL" | "BOY" | "UNISEX"
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
      bundle_delivery_type: ["AVAILABLE", "UNAVAILABLE"],
      child_gender: ["boy", "girl"],
      courier_company: [
        "CJ",
        "POST",
        "HANJIN",
        "LOGEN",
        "LOTTE",
        "KDEXP",
        "DAESIN",
        "GSM",
        "ILYANG",
        "HDEXP",
      ],
      delivery_item_status: [
        "normal",
        "cancelled",
        "return_requested",
        "returned",
        "exchange_requested",
        "exchanged",
      ],
      delivery_method_type: [
        "STANDARD",
        "FRESH_FROZEN",
        "CUSTOM_ORDER",
        "PURCHASE_AGENCY",
        "INSTALLATION_DIRECT",
      ],
      delivery_status: [
        "pending",
        "preparing",
        "shipped",
        "in_transit",
        "delivered",
      ],
      description_type: ["IMAGE", "HTML"],
      image_type: ["MAIN", "ADDITIONAL"],
      island_delivery_type: ["AVAILABLE", "UNAVAILABLE"],
      order_group_status: [
        "payment_in_progress",
        "payment_pending",
        "paid",
        "partially_refunded",
        "refunded",
        "cancelled",
        "failed",
      ],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_method_type: [
        "bank_transfer",
        "credit_card",
        "mobile_payment",
        "easy_pay",
        "virtual_account",
      ],
      role: ["customer", "seller", "administrator"],
      sales_status: [
        "REGISTERED",
        "PREPARE",
        "SALE",
        "SOLD_OUT",
        "STOP",
        "END",
      ],
      shipping_fee_type: ["FREE", "PAID", "COD", "CONDITIONAL"],
      target_age_type: ["BABY", "KIDS"],
      target_gender_type: ["GIRL", "BOY", "UNISEX"],
    },
  },
} as const

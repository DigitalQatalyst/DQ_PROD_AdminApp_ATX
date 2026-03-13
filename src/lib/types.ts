export type Json = string | number | boolean | null | {
  [key: string]: Json | undefined;
} | Json[];
export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      comments: {
        Row: {
          content: string | null;
          created_at: string | null;
          created_by: string | null;
          id: string;
          post_id: string | null;
          status: Database["public"]["Enums"]["content_status"];
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          post_id?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          post_id?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
        };
        Relationships: [{
          foreignKeyName: "comments_created_by_fkey";
          columns: ["created_by"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "comments_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "comments_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_meta";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "comments_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_reactions";
          referencedColumns: ["id"];
        }];
      };
      communities: {
        Row: {
          activemembers: number | null;
          activitylevel: string | null;
          category: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          imageurl: string | null;
          isprivate: boolean | null;
          membercount: number | null;
          name: string;
          recentactivity: string | null;
          tags: string[] | null;
        };
        Insert: {
          activemembers?: number | null;
          activitylevel?: string | null;
          category?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          imageurl?: string | null;
          isprivate?: boolean | null;
          membercount?: number | null;
          name: string;
          recentactivity?: string | null;
          tags?: string[] | null;
        };
        Update: {
          activemembers?: number | null;
          activitylevel?: string | null;
          category?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          imageurl?: string | null;
          isprivate?: boolean | null;
          membercount?: number | null;
          name?: string;
          recentactivity?: string | null;
          tags?: string[] | null;
        };
        Relationships: [{
          foreignKeyName: "communities_created_by_fkey";
          columns: ["created_by"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      community_roles: {
        Row: {
          community_id: string | null;
          id: string;
          role: string | null;
          user_id: string | null;
        };
        Insert: {
          community_id?: string | null;
          id?: string;
          role?: string | null;
          user_id?: string | null;
        };
        Update: {
          community_id?: string | null;
          id?: string;
          role?: string | null;
          user_id?: string | null;
        };
        Relationships: [{
          foreignKeyName: "community_roles_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "community_roles_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "community_roles_user_id_fkey";
          columns: ["user_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          id: string;
          joined_at: string;
          left_at: string | null;
          role: string | null;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          id?: string;
          joined_at?: string;
          left_at?: string | null;
          role?: string | null;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          id?: string;
          joined_at?: string;
          left_at?: string | null;
          role?: string | null;
          user_id?: string;
        };
        Relationships: [{
          foreignKeyName: "conversation_participants_conversation_id_fkey";
          columns: ["conversation_id"];
          isOneToOne: false;
          referencedRelation: "conversations";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "conversation_participants_user_id_fkey";
          columns: ["user_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      conversations: {
        Row: {
          community_id: string | null;
          created_at: string;
          id: string;
          name: string | null;
          type: Database["public"]["Enums"]["conversation_type"];
        };
        Insert: {
          community_id?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          type?: Database["public"]["Enums"]["conversation_type"];
        };
        Update: {
          community_id?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          type?: Database["public"]["Enums"]["conversation_type"];
        };
        Relationships: [{
          foreignKeyName: "conversations_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "conversations_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }];
      };
      event_rsvps: {
        Row: {
          created_at: string;
          id: string;
          post_id: string;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          post_id: string;
          status: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          post_id?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [{
          foreignKeyName: "event_rsvps_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "event_rsvps_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_meta";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "event_rsvps_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_reactions";
          referencedColumns: ["id"];
        }];
      };
      events: {
        Row: {
          community_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          event_date: string;
          event_time: string | null;
          id: string;
          title: string;
        };
        Insert: {
          community_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          id?: string;
          title: string;
        };
        Update: {
          community_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          id?: string;
          title?: string;
        };
        Relationships: [{
          foreignKeyName: "events_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "events_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }];
      };
      media_files: {
        Row: {
          caption: string | null;
          created_at: string;
          display_order: number | null;
          file_size: number | null;
          file_type: string;
          file_url: string;
          id: string;
          post_id: string | null;
          user_id: string;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          display_order?: number | null;
          file_size?: number | null;
          file_type: string;
          file_url: string;
          id?: string;
          post_id?: string | null;
          user_id: string;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          display_order?: number | null;
          file_size?: number | null;
          file_type?: string;
          file_url?: string;
          id?: string;
          post_id?: string | null;
          user_id?: string;
        };
        Relationships: [{
          foreignKeyName: "media_files_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "media_files_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_meta";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "media_files_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_reactions";
          referencedColumns: ["id"];
        }];
      };
      member_relationships: {
        Row: {
          created_at: string;
          follower_id: string;
          following_id: string;
          id: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          following_id: string;
          id?: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          following_id?: string;
          id?: string;
          status?: string;
        };
        Relationships: [{
          foreignKeyName: "member_relationships_follower_id_fkey";
          columns: ["follower_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "member_relationships_following_id_fkey";
          columns: ["following_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      memberships: {
        Row: {
          community_id: string | null;
          id: string;
          joined_at: string | null;
          role: string | null;
          user_id: string | null;
        };
        Insert: {
          community_id?: string | null;
          id?: string;
          joined_at?: string | null;
          role?: string | null;
          user_id?: string | null;
        };
        Update: {
          community_id?: string | null;
          id?: string;
          joined_at?: string | null;
          role?: string | null;
          user_id?: string | null;
        };
        Relationships: [{
          foreignKeyName: "memberships_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "memberships_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "memberships_user_id_fkey";
          columns: ["user_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          is_read: boolean;
          receiver_id: string | null;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          receiver_id?: string | null;
          sender_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          receiver_id?: string | null;
          sender_id?: string;
        };
        Relationships: [{
          foreignKeyName: "messages_conversation_id_fkey";
          columns: ["conversation_id"];
          isOneToOne: false;
          referencedRelation: "conversations";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "messages_receiver_id_fkey";
          columns: ["receiver_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "messages_sender_id_fkey";
          columns: ["sender_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      moderation_actions: {
        Row: {
          action_type: string;
          community_id: string;
          created_at: string;
          description: string;
          id: string;
          moderator_id: string;
          reason: string | null;
          status: string | null;
          target_id: string | null;
          target_type: string;
        };
        Insert: {
          action_type: string;
          community_id: string;
          created_at?: string;
          description: string;
          id?: string;
          moderator_id: string;
          reason?: string | null;
          status?: string | null;
          target_id?: string | null;
          target_type: string;
        };
        Update: {
          action_type?: string;
          community_id?: string;
          created_at?: string;
          description?: string;
          id?: string;
          moderator_id?: string;
          reason?: string | null;
          status?: string | null;
          target_id?: string | null;
          target_type?: string;
        };
        Relationships: [{
          foreignKeyName: "moderation_actions_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "moderation_actions_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "moderation_actions_moderator_id_fkey";
          columns: ["moderator_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      notifications: {
        Row: {
          community_id: string | null;
          created_at: string;
          id: string;
          is_read: boolean;
          link: string | null;
          message: string;
          related_user_id: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Insert: {
          community_id?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link?: string | null;
          message: string;
          related_user_id?: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Update: {
          community_id?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          link?: string | null;
          message?: string;
          related_user_id?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string;
        };
        Relationships: [{
          foreignKeyName: "notifications_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "notifications_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "notifications_related_user_id_fkey";
          columns: ["related_user_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "notifications_user_id_fkey";
          columns: ["user_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      poll_options: {
        Row: {
          created_at: string;
          id: string;
          option_text: string;
          post_id: string;
          vote_count: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          option_text: string;
          post_id: string;
          vote_count?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          option_text?: string;
          post_id?: string;
          vote_count?: number;
        };
        Relationships: [{
          foreignKeyName: "poll_options_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "poll_options_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_meta";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "poll_options_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_reactions";
          referencedColumns: ["id"];
        }];
      };
      poll_votes: {
        Row: {
          created_at: string;
          id: string;
          option_id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          option_id: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          option_id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [{
          foreignKeyName: "poll_votes_option_id_fkey";
          columns: ["option_id"];
          isOneToOne: false;
          referencedRelation: "poll_options";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "poll_votes_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "poll_votes_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_meta";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "poll_votes_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_reactions";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "poll_votes_user_id_fkey";
          columns: ["user_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      posts: {
        Row: {
          attachments: Json | null;
          community_id: string | null;
          content: string | null;
          content_html: string | null;
          created_at: string | null;
          created_by: string | null;
          event_date: string | null;
          event_location: string | null;
          id: string;
          image_url: string | null;
          link_url: string | null;
          metadata: Json | null;
          post_type: string | null;
          status: Database["public"]["Enums"]["content_status"];
          tags: string[] | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          attachments?: Json | null;
          community_id?: string | null;
          content?: string | null;
          content_html?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          id?: string;
          image_url?: string | null;
          link_url?: string | null;
          metadata?: Json | null;
          post_type?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          tags?: string[] | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          attachments?: Json | null;
          community_id?: string | null;
          content?: string | null;
          content_html?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          id?: string;
          image_url?: string | null;
          link_url?: string | null;
          metadata?: Json | null;
          post_type?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          tags?: string[] | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [{
          foreignKeyName: "posts_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "posts_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "posts_created_by_fkey";
          columns: ["created_by"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          id: string;
          notification_settings: Json | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          id: string;
          notification_settings?: Json | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          notification_settings?: Json | null;
          username?: string | null;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          created_at: string;
          id: string;
          post_id: string;
          reaction_type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          post_id: string;
          reaction_type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          post_id?: string;
          reaction_type?: string;
          user_id?: string;
        };
        Relationships: [{
          foreignKeyName: "reactions_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reactions_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_meta";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reactions_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_reactions";
          referencedColumns: ["id"];
        }];
      };
      reports: {
        Row: {
          comment_id: string | null;
          community_id: string;
          created_at: string;
          id: string;
          post_id: string | null;
          reason: string | null;
          report_type: Database["public"]["Enums"]["report_type"];
          reported_by: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          status: Database["public"]["Enums"]["report_status"];
          target_type: string | null;
        };
        Insert: {
          comment_id?: string | null;
          community_id: string;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          reason?: string | null;
          report_type: Database["public"]["Enums"]["report_type"];
          reported_by?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          target_type?: string | null;
        };
        Update: {
          comment_id?: string | null;
          community_id?: string;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          reason?: string | null;
          report_type?: Database["public"]["Enums"]["report_type"];
          reported_by?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          target_type?: string | null;
        };
        Relationships: [{
          foreignKeyName: "reports_comment_id_fkey";
          columns: ["comment_id"];
          isOneToOne: false;
          referencedRelation: "comments";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_meta";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_reactions";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_reported_by_fkey";
          columns: ["reported_by"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_resolved_by_fkey";
          columns: ["resolved_by"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
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
      users_local: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          id: string;
          notification_settings: Json | null;
          password: string;
          role: Database["public"]["Enums"]["user_role"] | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          notification_settings?: Json | null;
          password: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          notification_settings?: Json | null;
          password?: string;
          role?: Database["public"]["Enums"]["user_role"] | null;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      communities_with_counts: {
        Row: {
          category: string | null;
          created_at: string | null;
          description: string | null;
          id: string | null;
          imageurl: string | null;
          member_count: number | null;
          name: string | null;
        };
        Relationships: [];
      };
      moderation_actions_with_details: {
        Row: {
          action_type: string | null;
          community_id: string | null;
          community_name: string | null;
          created_at: string | null;
          description: string | null;
          id: string | null;
          moderator_avatar: string | null;
          moderator_email: string | null;
          moderator_id: string | null;
          moderator_username: string | null;
          reason: string | null;
          status: string | null;
          target_id: string | null;
          target_type: string | null;
        };
        Relationships: [{
          foreignKeyName: "moderation_actions_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "moderation_actions_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "moderation_actions_moderator_id_fkey";
          columns: ["moderator_id"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      posts_with_meta: {
        Row: {
          author_username: string | null;
          community_id: string | null;
          community_name: string | null;
          content: string | null;
          created_at: string | null;
          id: string | null;
          title: string | null;
        };
        Relationships: [{
          foreignKeyName: "posts_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "posts_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }];
      };
      posts_with_reactions: {
        Row: {
          author_avatar: string | null;
          author_username: string | null;
          comment_count: number | null;
          community_id: string | null;
          community_name: string | null;
          content: string | null;
          created_at: string | null;
          created_by: string | null;
          helpful_count: number | null;
          id: string | null;
          insightful_count: number | null;
          status: Database["public"]["Enums"]["content_status"] | null;
          tags: string[] | null;
          title: string | null;
          // Additional fields for specialized post types
          post_type: string | null;
          event_date: string | null;
          event_location: string | null;
          metadata: Json | null;
          content_html: string | null;
          attachments: Json | null;
          link_url: string | null;
          image_url: string | null;
          updated_at: string | null;
        };
        Relationships: [{
          foreignKeyName: "posts_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "posts_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "posts_created_by_fkey";
          columns: ["created_by"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
      reports_with_details: {
        Row: {
          comment_id: string | null;
          community_id: string | null;
          community_image: string | null;
          community_name: string | null;
          created_at: string | null;
          id: string | null;
          post_id: string | null;
          reason: string | null;
          report_type: Database["public"]["Enums"]["report_type"] | null;
          reported_by: string | null;
          reporter_avatar: string | null;
          reporter_email: string | null;
          reporter_username: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          status: Database["public"]["Enums"]["report_status"] | null;
          target_type: string | null;
        };
        Relationships: [{
          foreignKeyName: "reports_comment_id_fkey";
          columns: ["comment_id"];
          isOneToOne: false;
          referencedRelation: "comments";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_community_id_fkey";
          columns: ["community_id"];
          isOneToOne: false;
          referencedRelation: "communities_with_counts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_meta";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_post_id_fkey";
          columns: ["post_id"];
          isOneToOne: false;
          referencedRelation: "posts_with_reactions";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_reported_by_fkey";
          columns: ["reported_by"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "reports_resolved_by_fkey";
          columns: ["resolved_by"];
          isOneToOne: false;
          referencedRelation: "users_local";
          referencedColumns: ["id"];
        }];
      };
    };
    Functions: {
      can_moderate: {
        Args: {
          community_id_param?: string;
          user_id: string;
        };
        Returns: boolean;
      };
      can_moderate_community: {
        Args: {
          community_id_param: string;
          user_id_param: string;
        };
        Returns: boolean;
      };
      create_moderation_action_secure: {
        Args: {
          p_action_type: string;
          p_community_id: string;
          p_description: string;
          p_moderator_email: string;
          p_reason: string;
          p_target_id: string;
          p_target_type: string;
        };
        Returns: Json;
      };
      create_report_secure: {
        Args: {
          p_comment_id?: string;
          p_community_id: string;
          p_post_id?: string;
          p_reason: string;
          p_target_id: string;
          p_target_type: string;
          p_user_email: string;
        };
        Returns: Json;
      };
      get_community_members: {
        Args: {
          p_community_id: string;
        };
        Returns: {
          avatar_url: string;
          email: string;
          id: string;
          joined_at: string;
          role: string;
          user_id: string;
          username: string;
        }[];
      };
      get_feed: {
        Args: {
          feed_tab: string;
          limit_count?: number;
          offset_count?: number;
          sort_by?: string;
          user_id_param?: string;
        };
        Returns: {
          author_avatar: string;
          author_username: string;
          comment_count: number;
          community_id: string;
          community_name: string;
          content: string;
          created_at: string;
          created_by: string;
          helpful_count: number;
          id: string;
          insightful_count: number;
          status: Database["public"]["Enums"]["content_status"];
          tags: string[];
          title: string;
          // Additional fields for specialized post types
          post_type: string | null;
          event_date: string | null;
          event_location: string | null;
          metadata: Json | null;
          content_html: string | null;
          attachments: Json | null;
          link_url: string | null;
          image_url: string | null;
          updated_at: string | null;
        }[];
      };
      get_mutual_communities: {
        Args: {
          p_profile_id: string;
          p_viewer_id: string;
        };
        Returns: {
          category: string;
          id: string;
          imageurl: string;
          member_count: number;
          name: string;
        }[];
      };
      get_relationship_status: {
        Args: {
          p_follower_id: string;
          p_following_id: string;
        };
        Returns: string;
      };
      get_trending_topics: {
        Args: {
          limit_count?: number;
        };
        Returns: {
          post_count: number;
          tag: string;
        }[];
      };
      has_conversation_role: {
        Args: {
          _conversation_id: string;
          _role: string;
          _user_id: string;
        };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      increment_poll_vote: {
        Args: {
          option_id_param: string;
        };
        Returns: undefined;
      };
      is_conversation_participant: {
        Args: {
          _conversation_id: string;
          _user_id: string;
        };
        Returns: boolean;
      };
      notify_moderators_on_report: {
        Args: {
          p_community_id: string;
          p_reason: string;
          p_report_id: string;
          p_target_type: string;
        };
        Returns: undefined;
      };
      notify_post_author_on_moderation: {
        Args: {
          p_action_type: string;
          p_community_id: string;
          p_reason: string;
          p_target_id: string;
          p_target_type: string;
        };
        Returns: undefined;
      };
      remove_community_member: {
        Args: {
          p_community_id: string;
          p_current_user_id: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
      search_users: {
        Args: {
          current_user_id?: string;
          query: string;
        };
        Returns: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          id: string;
          notification_settings: Json | null;
          password: string;
          role: Database["public"]["Enums"]["user_role"] | null;
          username: string | null;
        }[];
      };
      toggle_follow: {
        Args: {
          p_follower_id: string;
          p_following_id: string;
        };
        Returns: string;
      };
      update_member_role: {
        Args: {
          p_community_id: string;
          p_current_user_id: string;
          p_new_role: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
      update_report_status_secure: {
        Args: {
          p_report_id: string;
          p_resolved_by: string;
          p_status: Database["public"]["Enums"]["report_status"];
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "moderator" | "member";
      content_status: "active" | "flagged" | "deleted";
      conversation_type: "direct" | "group";
      moderation_action_type: "approve" | "reject" | "hide" | "warn" | "ban" | "restore" | "delete";
      notification_type: "reply" | "mention" | "comment" | "moderation_alert" | "community_update" | "system";
      report_status: "pending" | "resolved" | "dismissed";
      report_type: "post" | "comment";
      user_role: "admin" | "moderator" | "member";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];
export type Tables<DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | {
  schema: keyof DatabaseWithoutInternals;
}, TableName extends (DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) : never) = never> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
  Row: infer R;
} ? R : never : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
  Row: infer R;
} ? R : never : never;
export type TablesInsert<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
  schema: keyof DatabaseWithoutInternals;
}, TableName extends (DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never) = never> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
  Insert: infer I;
} ? I : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
  Insert: infer I;
} ? I : never : never;
export type TablesUpdate<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
  schema: keyof DatabaseWithoutInternals;
}, TableName extends (DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never) = never> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
  Update: infer U;
} ? U : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
  Update: infer U;
} ? U : never : never;
export type Enums<DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | {
  schema: keyof DatabaseWithoutInternals;
}, EnumName extends (DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never) = never> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName] : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never;
export type CompositeTypes<PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | {
  schema: keyof DatabaseWithoutInternals;
}, CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never) = never> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName] : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never;
export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "member"],
      content_status: ["active", "flagged", "deleted"],
      conversation_type: ["direct", "group"],
      moderation_action_type: ["approve", "reject", "hide", "warn", "ban", "restore", "delete"],
      notification_type: ["reply", "mention", "comment", "moderation_alert", "community_update", "system"],
      report_status: ["pending", "resolved", "dismissed"],
      report_type: ["post", "comment"],
      user_role: ["admin", "moderator", "member"]
    }
  }
} as const;
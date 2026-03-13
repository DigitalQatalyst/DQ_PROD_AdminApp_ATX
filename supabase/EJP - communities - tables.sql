--
-- PostgreSQL database dump
--

\restrict pH9uVGSDoJ7Uaeotg85k2JHHbdnWu6Vnr0fLhwQgayco56Fd0YSyfoxuAjDwozk

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

-- Started on 2025-12-03 11:19:22

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 94 (class 2615 OID 24812)
-- Name: communities; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA communities;


ALTER SCHEMA communities OWNER TO pg_database_owner;

--
-- TOC entry 5367 (class 0 OID 0)
-- Dependencies: 94
-- Name: SCHEMA communities; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA communities IS 'standard communities schema';


--
-- TOC entry 1454 (class 1247 OID 24814)
-- Name: app_role; Type: TYPE; Schema: communities; Owner: kfdevadmin
--

CREATE TYPE communities.app_role AS ENUM (
    'admin',
    'moderator',
    'member'
);


ALTER TYPE communities.app_role OWNER TO kfdevadmin;

--
-- TOC entry 1457 (class 1247 OID 24822)
-- Name: content_status; Type: TYPE; Schema: communities; Owner: kfdevadmin
--

CREATE TYPE communities.content_status AS ENUM (
    'active',
    'flagged',
    'deleted'
);


ALTER TYPE communities.content_status OWNER TO kfdevadmin;

--
-- TOC entry 1460 (class 1247 OID 24830)
-- Name: conversation_type; Type: TYPE; Schema: communities; Owner: kfdevadmin
--

CREATE TYPE communities.conversation_type AS ENUM (
    'direct',
    'group'
);


ALTER TYPE communities.conversation_type OWNER TO kfdevadmin;

--
-- TOC entry 1463 (class 1247 OID 24836)
-- Name: moderation_action_type; Type: TYPE; Schema: communities; Owner: kfdevadmin
--

CREATE TYPE communities.moderation_action_type AS ENUM (
    'approve',
    'reject',
    'hide',
    'warn',
    'ban',
    'restore',
    'delete'
);


ALTER TYPE communities.moderation_action_type OWNER TO kfdevadmin;

--
-- TOC entry 1466 (class 1247 OID 24852)
-- Name: notification_type; Type: TYPE; Schema: communities; Owner: kfdevadmin
--

CREATE TYPE communities.notification_type AS ENUM (
    'reply',
    'mention',
    'comment',
    'moderation_alert',
    'community_update',
    'system'
);


ALTER TYPE communities.notification_type OWNER TO kfdevadmin;

--
-- TOC entry 1469 (class 1247 OID 24866)
-- Name: report_status; Type: TYPE; Schema: communities; Owner: kfdevadmin
--

CREATE TYPE communities.report_status AS ENUM (
    'pending',
    'resolved',
    'dismissed'
);


ALTER TYPE communities.report_status OWNER TO kfdevadmin;

--
-- TOC entry 1472 (class 1247 OID 24874)
-- Name: report_type; Type: TYPE; Schema: communities; Owner: kfdevadmin
--

CREATE TYPE communities.report_type AS ENUM (
    'post',
    'comment'
);


ALTER TYPE communities.report_type OWNER TO kfdevadmin;

--
-- TOC entry 1475 (class 1247 OID 24880)
-- Name: user_role; Type: TYPE; Schema: communities; Owner: kfdevadmin
--

CREATE TYPE communities.user_role AS ENUM (
    'admin',
    'moderator',
    'member'
);


ALTER TYPE communities.user_role OWNER TO kfdevadmin;

--
-- TOC entry 734 (class 1255 OID 31211)
-- Name: auto_generate_slug(); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.auto_generate_slug() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := communities.generate_slug(NEW.name);
  ELSE
    -- Validate and normalize provided slug
    NEW.slug := lower(regexp_replace(NEW.slug, '[^a-z0-9-]+', '-', 'g'));
    NEW.slug := trim(both '-' from NEW.slug);
    NEW.slug := regexp_replace(NEW.slug, '-+', '-', 'g');
    
    -- Ensure uniqueness
    IF EXISTS (SELECT 1 FROM communities.communities WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := communities.generate_slug(NEW.name);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION communities.auto_generate_slug() OWNER TO kfdevadmin;

--
-- TOC entry 649 (class 1255 OID 24887)
-- Name: can_moderate(uuid, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.can_moderate(user_id uuid, community_id_param uuid DEFAULT NULL::uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
  SELECT 
    communities.has_role(user_id, 'admin'::app_role)
    OR (
      communities.has_role(user_id, 'moderator'::app_role)
      AND (
        community_id_param IS NULL 
        OR EXISTS (
          SELECT 1 FROM community_roles cr
          WHERE cr.user_id = user_id
          AND cr.community_id = community_id_param
          AND cr.role IN ('admin', 'moderator')
        )
      )
    );
$$;


ALTER FUNCTION communities.can_moderate(user_id uuid, community_id_param uuid) OWNER TO kfdevadmin;

--
-- TOC entry 775 (class 1255 OID 24888)
-- Name: can_moderate_community(uuid, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.can_moderate_community(user_id_param uuid, community_id_param uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
  SELECT 
    -- Check if user is platform admin
    communities.has_role(user_id_param, 'admin'::app_role)
    OR EXISTS (
      -- Check if user is community owner
      SELECT 1 FROM communities c
      WHERE c.id = community_id_param AND c.created_by = user_id_param
    ) OR EXISTS (
      -- Check if user has admin/moderator role in community
      SELECT 1 FROM community_roles cr
      WHERE cr.community_id = community_id_param 
      AND cr.user_id = user_id_param
      AND cr.role IN ('admin', 'moderator')
    );
$$;


ALTER FUNCTION communities.can_moderate_community(user_id_param uuid, community_id_param uuid) OWNER TO kfdevadmin;

--
-- TOC entry 705 (class 1255 OID 30269)
-- Name: check_duplicate_report(uuid, text, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.check_duplicate_report(p_user_id uuid, p_target_type text, p_target_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_report_count integer;
BEGIN
  -- Validate user_id
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Count existing reports by this user for this target
  IF p_target_type = 'post' THEN
    SELECT COUNT(*) INTO v_report_count
    FROM reports
    WHERE reported_by = p_user_id
    AND post_id = p_target_id;
  ELSIF p_target_type = 'comment' THEN
    SELECT COUNT(*) INTO v_report_count
    FROM reports
    WHERE reported_by = p_user_id
    AND comment_id = p_target_id;
  ELSE
    RETURN false;
  END IF;
  
  -- Return true if any reports found
  RETURN v_report_count > 0;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Error checking duplicate report: %', SQLERRM;
    RETURN false;
END;
$$;


ALTER FUNCTION communities.check_duplicate_report(p_user_id uuid, p_target_type text, p_target_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 774 (class 1255 OID 24889)
-- Name: create_moderation_action_secure(text, text, text, uuid, uuid, text, text); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.create_moderation_action_secure(p_moderator_email text, p_action_type text, p_target_type text, p_target_id uuid, p_community_id uuid, p_description text, p_reason text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
DECLARE
  v_moderator_id uuid;
  v_action_id uuid;
  v_is_authorized boolean := false;
BEGIN
  SELECT id INTO v_moderator_id
  FROM users_local
  WHERE email = p_moderator_email;
  
  IF v_moderator_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Moderator not found');
  END IF;
  
  SELECT EXISTS (
    SELECT 1 FROM communities
    WHERE id = p_community_id AND created_by = v_moderator_id
  ) INTO v_is_authorized;
  
  IF NOT v_is_authorized THEN
    SELECT EXISTS (
      SELECT 1 FROM community_roles
      WHERE community_id = p_community_id
      AND user_id = v_moderator_id
      AND role IN ('admin', 'moderator')
    ) INTO v_is_authorized;
  END IF;
  
  IF NOT v_is_authorized THEN
    SELECT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = v_moderator_id
      AND role = 'admin'
    ) INTO v_is_authorized;
  END IF;
  
  IF NOT v_is_authorized THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized to moderate this community');
  END IF;
  
  INSERT INTO moderation_actions (
    target_type,
    target_id,
    action_type,
    description,
    community_id,
    moderator_id,
    reason,
    status
  ) VALUES (
    p_target_type,
    p_target_id,
    p_action_type,
    p_description,
    p_community_id,
    v_moderator_id,
    COALESCE(p_reason, ''),
    'active'
  )
  RETURNING id INTO v_action_id;
  
  BEGIN
    PERFORM notify_post_author_on_moderation(
      p_action_type,
      p_target_type,
      p_target_id,
      p_community_id,
      COALESCE(p_reason, '')
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to send notification: %', SQLERRM;
  END;
  
  RETURN jsonb_build_object('success', true, 'action_id', v_action_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;


ALTER FUNCTION communities.create_moderation_action_secure(p_moderator_email text, p_action_type text, p_target_type text, p_target_id uuid, p_community_id uuid, p_description text, p_reason text) OWNER TO kfdevadmin;

--
-- TOC entry 810 (class 1255 OID 24890)
-- Name: create_report_secure(text, text, uuid, uuid, text, uuid, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.create_report_secure(p_user_email text, p_target_type text, p_target_id uuid, p_community_id uuid, p_reason text, p_post_id uuid DEFAULT NULL::uuid, p_comment_id uuid DEFAULT NULL::uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
DECLARE
  v_user_id uuid;
  v_report_id uuid;
BEGIN
  -- Look up user ID from users_local
  SELECT id INTO v_user_id
  FROM users_local
  WHERE email = p_user_email;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Insert the report
  INSERT INTO reports (
    community_id,
    reason,
    reported_by,
    report_type,
    target_type,
    post_id,
    comment_id
  ) VALUES (
    p_community_id,
    p_reason,
    v_user_id,
    p_target_type::report_type,
    p_target_type,
    p_post_id,
    p_comment_id
  )
  RETURNING id INTO v_report_id;
  
  -- Notify moderators about the new report
  PERFORM notify_moderators_on_report(
    p_community_id,
    v_report_id,
    p_target_type,
    p_reason
  );
  
  RETURN jsonb_build_object('success', true, 'report_id', v_report_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;


ALTER FUNCTION communities.create_report_secure(p_user_email text, p_target_type text, p_target_id uuid, p_community_id uuid, p_reason text, p_post_id uuid, p_comment_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 660 (class 1255 OID 24891)
-- Name: current_user_id(); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.current_user_id() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get user_id from custom header set by frontend
  BEGIN
    user_id := current_setting('request.headers', true)::json->>'x-user-id';
  EXCEPTION
    WHEN OTHERS THEN
      user_id := NULL;
  END;
  
  -- Fallback: try from JWT claims (if using Supabase Auth)
  IF user_id IS NULL THEN
    BEGIN
      user_id := (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
    EXCEPTION
      WHEN OTHERS THEN
        user_id := NULL;
    END;
  END IF;
  
  RETURN user_id;
END;
$$;


ALTER FUNCTION communities.current_user_id() OWNER TO kfdevadmin;

--
-- TOC entry 772 (class 1255 OID 31206)
-- Name: generate_slug(text); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.generate_slug(input_text text) RETURNS text
    LANGUAGE plpgsql
    AS $_$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Convert to lowercase and replace non-alphanumeric with hyphens
  base_slug := lower(regexp_replace(input_text, '[^a-zA-Z0-9]+', '-', 'g'));
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Limit length to 50 characters
  base_slug := substring(base_slug from 1 for 50);
  
  -- Remove trailing hyphen if substring cut in middle of word
  base_slug := regexp_replace(base_slug, '-+$', '');
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append number if needed
  WHILE EXISTS (SELECT 1 FROM communities.communities WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$_$;


ALTER FUNCTION communities.generate_slug(input_text text) OWNER TO kfdevadmin;

--
-- TOC entry 795 (class 1255 OID 24892)
-- Name: get_community_members(uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.get_community_members(p_community_id uuid) RETURNS TABLE(id uuid, user_id uuid, username text, email text, avatar_url text, role text, joined_at timestamp with time zone)
    LANGUAGE sql STABLE
    AS $$
  SELECT 
    m.id,
    m.user_id,
    u.username,
    u.email,
    u.avatar_url,
    COALESCE(m.role, 'member') as role,
    m.joined_at
  FROM memberships m
  LEFT JOIN users_local u ON m.user_id = u.id
  WHERE m.community_id = p_community_id
  ORDER BY 
    CASE 
      WHEN m.role = 'admin' THEN 1
      WHEN m.role = 'moderator' THEN 2
      ELSE 3
    END,
    m.joined_at DESC;
$$;


ALTER FUNCTION communities.get_community_members(p_community_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 829 (class 1255 OID 24893)
-- Name: get_feed(text, text, uuid, integer, integer); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.get_feed(feed_tab text, sort_by text DEFAULT 'recent'::text, user_id_param uuid DEFAULT NULL::uuid, limit_count integer DEFAULT 10, offset_count integer DEFAULT 0) RETURNS TABLE(id uuid, community_id uuid, title text, content text, tags text[], created_at timestamp with time zone, status communities.content_status, community_name text, author_username text, author_avatar text, helpful_count bigint, insightful_count bigint, comment_count bigint, created_by uuid)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.community_id,
    p.title,
    p.content,
    p.tags,
    p.created_at,
    p.status,
    p.community_name,
    p.author_username,
    p.author_avatar,
    p.helpful_count,
    p.insightful_count,
    p.comment_count,
    p.created_by
  FROM posts_with_reactions p
  WHERE 
    CASE 
      WHEN feed_tab = 'my_communities' THEN 
        p.community_id IN (
          SELECT m.community_id 
          FROM memberships m 
          WHERE m.user_id = user_id_param
        )
      WHEN feed_tab = 'trending' THEN 
        (p.helpful_count + p.insightful_count) > 0
      ELSE true -- global feed
    END
  ORDER BY
    CASE 
      WHEN sort_by = 'recent' THEN p.created_at
    END DESC,
    CASE 
      WHEN sort_by = 'most_reacted' THEN (p.helpful_count + p.insightful_count)
    END DESC,
    CASE 
      WHEN sort_by = 'most_commented' THEN p.comment_count
    END DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;


ALTER FUNCTION communities.get_feed(feed_tab text, sort_by text, user_id_param uuid, limit_count integer, offset_count integer) OWNER TO kfdevadmin;

--
-- TOC entry 667 (class 1255 OID 24894)
-- Name: get_mutual_communities(uuid, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.get_mutual_communities(p_viewer_id uuid, p_profile_id uuid) RETURNS TABLE(id uuid, name text, category text, imageurl text, member_count bigint)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
  SELECT 
    c.id,
    c.name,
    c.category,
    c.imageurl,
    COUNT(DISTINCT m.user_id) as member_count
  FROM communities c
  INNER JOIN memberships m1 ON m1.community_id = c.id AND m1.user_id = p_viewer_id
  INNER JOIN memberships m2 ON m2.community_id = c.id AND m2.user_id = p_profile_id
  LEFT JOIN memberships m ON m.community_id = c.id
  GROUP BY c.id, c.name, c.category, c.imageurl
  ORDER BY c.name;
$$;


ALTER FUNCTION communities.get_mutual_communities(p_viewer_id uuid, p_profile_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 823 (class 1255 OID 30270)
-- Name: get_post_warning_for_author(uuid, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.get_post_warning_for_author(p_post_id uuid, p_user_id uuid) RETURNS TABLE(has_warning boolean, reason text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Check if the user is the author of the post
  IF NOT EXISTS (
    SELECT 1 FROM posts 
    WHERE id = p_post_id 
    AND created_by = p_user_id
  ) THEN
    -- User is not the author, return no warning
    RETURN QUERY SELECT false, NULL::text;
    RETURN;
  END IF;

  -- User is the author, check for warnings
  RETURN QUERY
  SELECT 
    true as has_warning,
    ma.reason
  FROM moderation_actions ma
  WHERE ma.target_id = p_post_id
    AND ma.target_type = 'post'
    AND ma.action_type = 'warn'
  ORDER BY ma.created_at DESC
  LIMIT 1;

  -- If no warning found, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text;
  END IF;
END;
$$;


ALTER FUNCTION communities.get_post_warning_for_author(p_post_id uuid, p_user_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 661 (class 1255 OID 24895)
-- Name: get_relationship_status(uuid, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.get_relationship_status(p_follower_id uuid, p_following_id uuid) RETURNS text
    LANGUAGE sql STABLE
    AS $$
  SELECT status 
  FROM member_relationships
  WHERE follower_id = p_follower_id AND following_id = p_following_id
  LIMIT 1;
$$;


ALTER FUNCTION communities.get_relationship_status(p_follower_id uuid, p_following_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 708 (class 1255 OID 24896)
-- Name: get_trending_topics(integer); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.get_trending_topics(limit_count integer DEFAULT 5) RETURNS TABLE(tag text, post_count bigint)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unnest(p.tags) as tag,
    COUNT(*) as post_count
  FROM posts p
  WHERE p.status = 'active'
    AND p.tags IS NOT NULL
    AND array_length(p.tags, 1) > 0
  GROUP BY tag
  ORDER BY post_count DESC, tag
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION communities.get_trending_topics(limit_count integer) OWNER TO kfdevadmin;

--
-- TOC entry 729 (class 1255 OID 24897)
-- Name: handle_new_user(); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO communities.users_local (
    id,
    email,
    username,
    avatar_url,
    external_id,
    email_verified,
    raw_user_meta_data,
    created_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name' OR SPLIT_PART(NEW.email, '@', 1),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.id, -- Using Supabase auth ID as external_id for existing users
    NEW.email_confirmed_at IS NOT NULL,
    NEW.raw_user_meta_data,
    NEW.created_at
  )
  ON CONFLICT (email) 
  DO UPDATE SET
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    last_sign_in_at = NEW.last_sign_in_at,
    raw_user_meta_data = NEW.raw_user_meta_data
  RETURNING *;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION communities.handle_new_user() OWNER TO kfdevadmin;

--
-- TOC entry 694 (class 1255 OID 24898)
-- Name: handle_user_update(); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.handle_user_update() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  UPDATE communities.users_local
  SET 
    email = NEW.email,
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    last_sign_in_at = NEW.last_sign_in_at,
    raw_user_meta_data = NEW.raw_user_meta_data
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION communities.handle_user_update() OWNER TO kfdevadmin;

--
-- TOC entry 673 (class 1255 OID 24899)
-- Name: has_conversation_role(uuid, uuid, text); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.has_conversation_role(_conversation_id uuid, _user_id uuid, _role text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
      AND role = _role
  );
$$;


ALTER FUNCTION communities.has_conversation_role(_conversation_id uuid, _user_id uuid, _role text) OWNER TO kfdevadmin;

--
-- TOC entry 824 (class 1255 OID 24900)
-- Name: has_role(uuid, communities.app_role); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.has_role(_user_id uuid, _role communities.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM communities.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;


ALTER FUNCTION communities.has_role(_user_id uuid, _role communities.app_role) OWNER TO kfdevadmin;

--
-- TOC entry 778 (class 1255 OID 24901)
-- Name: increment_poll_vote(uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.increment_poll_vote(option_id_param uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
BEGIN
  -- Update vote_count in poll_options table
  UPDATE poll_options
  SET vote_count = vote_count + 1
  WHERE id = option_id_param;

  -- Raise exception if option not found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Poll option not found: %', option_id_param;
  END IF;
END;
$$;


ALTER FUNCTION communities.increment_poll_vote(option_id_param uuid) OWNER TO kfdevadmin;

--
-- TOC entry 5385 (class 0 OID 0)
-- Dependencies: 778
-- Name: FUNCTION increment_poll_vote(option_id_param uuid); Type: COMMENT; Schema: communities; Owner: kfdevadmin
--

COMMENT ON FUNCTION communities.increment_poll_vote(option_id_param uuid) IS 'Atomically increments the vote_count for a poll option. Raises exception if option not found.';


--
-- TOC entry 652 (class 1255 OID 24902)
-- Name: is_admin(); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM communities.users_local
  WHERE id = communities.current_user_id();
  
  RETURN user_role IN ('admin', 'moderator');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;


ALTER FUNCTION communities.is_admin() OWNER TO kfdevadmin;

--
-- TOC entry 785 (class 1255 OID 24903)
-- Name: is_conversation_participant(uuid, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.is_conversation_participant(_conversation_id uuid, _user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
  );
$$;


ALTER FUNCTION communities.is_conversation_participant(_conversation_id uuid, _user_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 718 (class 1255 OID 24904)
-- Name: notify_moderators_on_report(uuid, uuid, text, text); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.notify_moderators_on_report(p_community_id uuid, p_report_id uuid, p_target_type text, p_reason text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
DECLARE
  v_moderator_id uuid;
  v_community_name text;
BEGIN
  -- Get community name
  SELECT name INTO v_community_name
  FROM communities
  WHERE id = p_community_id;
  
  -- Notify community owner
  INSERT INTO notifications (user_id, type, title, message, link, community_id)
  SELECT 
    c.created_by,
    'moderation_alert',
    'New Report in ' || v_community_name,
    'A ' || p_target_type || ' was reported: ' || p_reason,
    '/moderation-dashboard',
    p_community_id
  FROM communities c
  WHERE c.id = p_community_id;
  
  -- Notify all community moderators and admins
  INSERT INTO notifications (user_id, type, title, message, link, community_id)
  SELECT 
    cr.user_id,
    'moderation_alert',
    'New Report in ' || v_community_name,
    'A ' || p_target_type || ' was reported: ' || p_reason,
    '/moderation-dashboard',
    p_community_id
  FROM community_roles cr
  WHERE cr.community_id = p_community_id
  AND cr.role IN ('admin', 'moderator')
  AND cr.user_id NOT IN (
    SELECT created_by FROM communities WHERE id = p_community_id
  );
END;
$$;


ALTER FUNCTION communities.notify_moderators_on_report(p_community_id uuid, p_report_id uuid, p_target_type text, p_reason text) OWNER TO kfdevadmin;

--
-- TOC entry 711 (class 1255 OID 24905)
-- Name: notify_post_author_on_moderation(text, text, uuid, uuid, text); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.notify_post_author_on_moderation(p_action_type text, p_target_type text, p_target_id uuid, p_community_id uuid, p_reason text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
DECLARE
  v_author_id uuid;
  v_community_name text;
  v_title_text text;
  v_message_text text;
  v_reason_text text;
BEGIN
  v_reason_text := COALESCE(NULLIF(TRIM(p_reason), ''), 'No reason provided');
  
  SELECT name INTO v_community_name
  FROM communities
  WHERE id = p_community_id;
  
  IF p_target_type = 'post' THEN
    SELECT created_by INTO v_author_id
    FROM posts
    WHERE id = p_target_id;
  ELSIF p_target_type = 'comment' THEN
    SELECT created_by INTO v_author_id
    FROM comments
    WHERE id = p_target_id;
  END IF;
  
  IF v_author_id IS NOT NULL THEN
    CASE p_action_type
      WHEN 'warn' THEN
        v_title_text := 'Warning: Content Moderated';
        v_message_text := 'Your ' || p_target_type || ' in ' || COALESCE(v_community_name, 'a community') || ' received a warning. Reason: ' || v_reason_text;
      WHEN 'hide' THEN
        v_title_text := 'Content Hidden';
        v_message_text := 'Your ' || p_target_type || ' in ' || COALESCE(v_community_name, 'a community') || ' has been hidden. Reason: ' || v_reason_text;
      WHEN 'delete' THEN
        v_title_text := 'Content Deleted';
        v_message_text := 'Your ' || p_target_type || ' in ' || COALESCE(v_community_name, 'a community') || ' has been deleted. Reason: ' || v_reason_text;
      WHEN 'approve' THEN
        v_title_text := 'Content Approved';
        v_message_text := 'Your ' || p_target_type || ' in ' || COALESCE(v_community_name, 'a community') || ' has been approved.';
      ELSE
        v_title_text := 'Moderation Action Taken';
        v_message_text := 'A moderation action was taken on your ' || p_target_type || ' in ' || COALESCE(v_community_name, 'a community');
    END CASE;
    
    BEGIN
      INSERT INTO notifications (user_id, type, title, message, link, community_id)
      VALUES (
        v_author_id,
        'moderation_alert',
        v_title_text,
        v_message_text,
        CASE 
          WHEN p_target_type = 'post' THEN '/post/' || p_target_id::text
          ELSE NULL
        END,
        p_community_id
      );
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to create notification: %', SQLERRM;
    END;
  END IF;
END;
$$;


ALTER FUNCTION communities.notify_post_author_on_moderation(p_action_type text, p_target_type text, p_target_id uuid, p_community_id uuid, p_reason text) OWNER TO kfdevadmin;

--
-- TOC entry 670 (class 1255 OID 24906)
-- Name: remove_community_member(uuid, uuid, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.remove_community_member(p_community_id uuid, p_user_id uuid, p_current_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin boolean;
  v_is_owner boolean;
  v_target_is_owner boolean;
BEGIN
  -- Check if current user is admin or owner
  SELECT EXISTS (
    SELECT 1 FROM memberships 
    WHERE community_id = p_community_id 
    AND user_id = p_current_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  SELECT EXISTS (
    SELECT 1 FROM communities 
    WHERE id = p_community_id 
    AND created_by = p_current_user_id
  ) INTO v_is_owner;
  
  -- Check if target user is the owner
  SELECT EXISTS (
    SELECT 1 FROM communities 
    WHERE id = p_community_id 
    AND created_by = p_user_id
  ) INTO v_target_is_owner;
  
  -- Only admins or owners can remove members
  IF NOT (v_is_admin OR v_is_owner) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can remove members';
  END IF;
  
  -- Cannot remove the community owner
  IF v_target_is_owner THEN
    RAISE EXCEPTION 'Cannot remove community owner';
  END IF;
  
  -- Remove the member
  DELETE FROM memberships
  WHERE community_id = p_community_id
  AND user_id = p_user_id;
  
  RETURN true;
END;
$$;


ALTER FUNCTION communities.remove_community_member(p_community_id uuid, p_user_id uuid, p_current_user_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 803 (class 1255 OID 24907)
-- Name: user_role_equals_text(communities.user_role, text); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.user_role_equals_text(communities.user_role, text) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
  SELECT $1::text = $2;
$_$;


ALTER FUNCTION communities.user_role_equals_text(communities.user_role, text) OWNER TO kfdevadmin;

--
-- TOC entry 2636 (class 2617 OID 24908)
-- Name: =; Type: OPERATOR; Schema: communities; Owner: kfdevadmin
--

CREATE OPERATOR communities.= (
    FUNCTION = communities.user_role_equals_text,
    LEFTARG = communities.user_role,
    RIGHTARG = text
);


ALTER OPERATOR communities.= (communities.user_role, text) OWNER TO kfdevadmin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 500 (class 1259 OID 24909)
-- Name: users_local; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.users_local (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text,
    username text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    role communities.user_role DEFAULT 'member'::communities.user_role,
    notification_settings jsonb DEFAULT '{"reply": true, "system": true, "comment": true, "mention": true, "community_update": true, "moderation_alert": true}'::jsonb,
    external_id text,
    last_sign_in_at timestamp with time zone,
    email_verified boolean DEFAULT false,
    raw_user_meta_data jsonb,
    auth_provider character varying(20) DEFAULT 'local'::character varying,
    CONSTRAINT users_local_role_check CHECK ((role OPERATOR(communities.=) ANY (ARRAY['member'::text, 'moderator'::text, 'admin'::text])))
);


ALTER TABLE communities.users_local OWNER TO kfdevadmin;

--
-- TOC entry 5393 (class 0 OID 0)
-- Dependencies: 500
-- Name: COLUMN users_local.password; Type: COMMENT; Schema: communities; Owner: kfdevadmin
--

COMMENT ON COLUMN communities.users_local.password IS 'Password hash - NULL for Entra users';


--
-- TOC entry 5394 (class 0 OID 0)
-- Dependencies: 500
-- Name: COLUMN users_local.external_id; Type: COMMENT; Schema: communities; Owner: kfdevadmin
--

COMMENT ON COLUMN communities.users_local.external_id IS 'MS Entra External Identity user ID (localAccountId) or Supabase auth ID';


--
-- TOC entry 5395 (class 0 OID 0)
-- Dependencies: 500
-- Name: COLUMN users_local.last_sign_in_at; Type: COMMENT; Schema: communities; Owner: kfdevadmin
--

COMMENT ON COLUMN communities.users_local.last_sign_in_at IS 'Last successful sign-in timestamp';


--
-- TOC entry 5396 (class 0 OID 0)
-- Dependencies: 500
-- Name: COLUMN users_local.email_verified; Type: COMMENT; Schema: communities; Owner: kfdevadmin
--

COMMENT ON COLUMN communities.users_local.email_verified IS 'Email verification status from auth provider';


--
-- TOC entry 5397 (class 0 OID 0)
-- Dependencies: 500
-- Name: COLUMN users_local.raw_user_meta_data; Type: COMMENT; Schema: communities; Owner: kfdevadmin
--

COMMENT ON COLUMN communities.users_local.raw_user_meta_data IS 'Raw user metadata from auth provider (JSONB)';


--
-- TOC entry 5398 (class 0 OID 0)
-- Dependencies: 500
-- Name: COLUMN users_local.auth_provider; Type: COMMENT; Schema: communities; Owner: kfdevadmin
--

COMMENT ON COLUMN communities.users_local.auth_provider IS 'Authentication provider: local (password) or entra (MS Entra ID)';


--
-- TOC entry 744 (class 1255 OID 24921)
-- Name: search_users(text, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.search_users(query text, current_user_id uuid DEFAULT NULL::uuid) RETURNS SETOF communities.users_local
    LANGUAGE sql STABLE
    AS $$
  SELECT id, email, password, username, avatar_url, created_at, role, notification_settings
  FROM users_local
  WHERE (username ILIKE '%' || query || '%' OR email ILIKE '%' || query || '%')
    AND (current_user_id IS NULL OR id != current_user_id)
  LIMIT 10;
$$;


ALTER FUNCTION communities.search_users(query text, current_user_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 737 (class 1255 OID 24922)
-- Name: toggle_follow(uuid, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.toggle_follow(p_follower_id uuid, p_following_id uuid) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_status TEXT;
BEGIN
  -- Prevent self-follow
  IF p_follower_id = p_following_id THEN
    RAISE EXCEPTION 'Cannot follow yourself';
  END IF;

  -- Check if relationship exists
  SELECT status INTO v_status
  FROM member_relationships
  WHERE follower_id = p_follower_id AND following_id = p_following_id;

  IF v_status IS NOT NULL THEN
    -- Unfollow
    DELETE FROM member_relationships
    WHERE follower_id = p_follower_id AND following_id = p_following_id;
    RETURN 'unfollowed';
  ELSE
    -- Follow
    INSERT INTO member_relationships (follower_id, following_id, status)
    VALUES (p_follower_id, p_following_id, 'follow');
    RETURN 'following';
  END IF;
END;
$$;


ALTER FUNCTION communities.toggle_follow(p_follower_id uuid, p_following_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 684 (class 1255 OID 30271)
-- Name: update_communities_updated_at(); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.update_communities_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION communities.update_communities_updated_at() OWNER TO kfdevadmin;

--
-- TOC entry 789 (class 1255 OID 24923)
-- Name: update_member_role(uuid, uuid, text, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.update_member_role(p_community_id uuid, p_user_id uuid, p_new_role text, p_current_user_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_is_admin boolean;
  v_is_owner boolean;
BEGIN
  -- Check if current user is admin or owner
  SELECT EXISTS (
    SELECT 1 FROM memberships 
    WHERE community_id = p_community_id 
    AND user_id = p_current_user_id 
    AND role = 'admin'
  ) INTO v_is_admin;
  
  SELECT EXISTS (
    SELECT 1 FROM communities 
    WHERE id = p_community_id 
    AND created_by = p_current_user_id
  ) INTO v_is_owner;
  
  -- Only admins or owners can update roles
  IF NOT (v_is_admin OR v_is_owner) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update member roles';
  END IF;
  
  -- Validate role
  IF p_new_role NOT IN ('admin', 'moderator', 'member') THEN
    RAISE EXCEPTION 'Invalid role: must be admin, moderator, or member';
  END IF;
  
  -- Update the role
  UPDATE memberships
  SET role = p_new_role
  WHERE community_id = p_community_id
  AND user_id = p_user_id;
  
  RETURN true;
END;
$$;


ALTER FUNCTION communities.update_member_role(p_community_id uuid, p_user_id uuid, p_new_role text, p_current_user_id uuid) OWNER TO kfdevadmin;

--
-- TOC entry 804 (class 1255 OID 24924)
-- Name: update_posts_updated_at(); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.update_posts_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION communities.update_posts_updated_at() OWNER TO kfdevadmin;

--
-- TOC entry 757 (class 1255 OID 24925)
-- Name: update_report_status_secure(uuid, communities.report_status, uuid); Type: FUNCTION; Schema: communities; Owner: kfdevadmin
--

CREATE FUNCTION communities.update_report_status_secure(p_report_id uuid, p_status communities.report_status, p_resolved_by uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'communities'
    AS $$
DECLARE
  v_updated boolean;
BEGIN
  UPDATE communities.reports
  SET 
    status = p_status,
    resolved_at = NOW(),
    resolved_by = p_resolved_by
  WHERE id = p_report_id;
  
  v_updated := FOUND;
  
  IF v_updated THEN
    RETURN jsonb_build_object('success', true);
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Report not found');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;


ALTER FUNCTION communities.update_report_status_secure(p_report_id uuid, p_status communities.report_status, p_resolved_by uuid) OWNER TO kfdevadmin;

--
-- TOC entry 501 (class 1259 OID 24926)
-- Name: abu_dhabi_businesses; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.abu_dhabi_businesses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_name text NOT NULL,
    sector_id uuid,
    description text,
    location text,
    website text,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE communities.abu_dhabi_businesses OWNER TO kfdevadmin;

--
-- TOC entry 502 (class 1259 OID 24934)
-- Name: business_map_data; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.business_map_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    type text,
    sector text,
    zone text,
    "position" jsonb NOT NULL,
    key_stats jsonb,
    highlights jsonb,
    opportunities jsonb,
    setup_time text,
    setup_cost text,
    suppliers jsonb,
    talent jsonb,
    success_stories jsonb,
    icon jsonb
);


ALTER TABLE communities.business_map_data OWNER TO kfdevadmin;

--
-- TOC entry 503 (class 1259 OID 24940)
-- Name: business_sectors; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.business_sectors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    icon_name text,
    businesses_count integer DEFAULT 0,
    growth_rate numeric(5,2),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE communities.business_sectors OWNER TO kfdevadmin;

--
-- TOC entry 504 (class 1259 OID 24948)
-- Name: business_statistics; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.business_statistics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stat_name text NOT NULL,
    stat_value text NOT NULL,
    stat_description text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE communities.business_statistics OWNER TO kfdevadmin;

--
-- TOC entry 505 (class 1259 OID 24957)
-- Name: comments; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid,
    content text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    status communities.content_status DEFAULT 'active'::communities.content_status NOT NULL
);


ALTER TABLE communities.comments OWNER TO kfdevadmin;

--
-- TOC entry 506 (class 1259 OID 24965)
-- Name: communities; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.communities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    category text,
    membercount integer DEFAULT 0,
    imageurl text,
    tags text[] DEFAULT '{}'::text[],
    activemembers integer DEFAULT 0,
    isprivate boolean DEFAULT false,
    activitylevel text,
    recentactivity text,
    slug text NOT NULL,
    CONSTRAINT communities_activitylevel_check CHECK ((activitylevel = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))),
    CONSTRAINT communities_slug_format_check CHECK (((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text) AND (length(slug) >= 3) AND (length(slug) <= 50)))
);


ALTER TABLE communities.communities OWNER TO kfdevadmin;

--
-- TOC entry 639 (class 1259 OID 30272)
-- Name: communities_backup; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.communities_backup (
    id uuid,
    name text,
    description text,
    created_by uuid,
    created_at timestamp with time zone,
    category text,
    membercount integer,
    imageurl text,
    tags text[],
    activemembers integer,
    isprivate boolean,
    activitylevel text,
    recentactivity text
);


ALTER TABLE communities.communities_backup OWNER TO kfdevadmin;

--
-- TOC entry 507 (class 1259 OID 24977)
-- Name: memberships; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    community_id uuid,
    joined_at timestamp with time zone DEFAULT now(),
    role text DEFAULT 'member'::text
);


ALTER TABLE communities.memberships OWNER TO kfdevadmin;

--
-- TOC entry 508 (class 1259 OID 24985)
-- Name: communities_with_counts; Type: VIEW; Schema: communities; Owner: kfdevadmin
--

CREATE VIEW communities.communities_with_counts AS
 SELECT c.id,
    c.name,
    c.description,
    c.created_at,
    c.imageurl,
    c.category,
    count(m.user_id) AS member_count
   FROM (communities.communities c
     LEFT JOIN communities.memberships m ON ((c.id = m.community_id)))
  GROUP BY c.id, c.name, c.description, c.created_at, c.imageurl, c.category;


ALTER VIEW communities.communities_with_counts OWNER TO kfdevadmin;

--
-- TOC entry 509 (class 1259 OID 24990)
-- Name: community_roles; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.community_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    community_id uuid,
    role text,
    CONSTRAINT community_roles_role_check CHECK ((role = ANY (ARRAY['moderator'::text, 'admin'::text])))
);


ALTER TABLE communities.community_roles OWNER TO kfdevadmin;

--
-- TOC entry 637 (class 1259 OID 30258)
-- Name: community_roles_backup; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.community_roles_backup (
    id uuid,
    user_id uuid,
    community_id uuid,
    role text
);


ALTER TABLE communities.community_roles_backup OWNER TO kfdevadmin;

--
-- TOC entry 510 (class 1259 OID 24997)
-- Name: conversation_participants; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.conversation_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    left_at timestamp with time zone
);

ALTER TABLE ONLY communities.conversation_participants REPLICA IDENTITY FULL;


ALTER TABLE communities.conversation_participants OWNER TO kfdevadmin;

--
-- TOC entry 511 (class 1259 OID 25005)
-- Name: conversations; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type communities.conversation_type DEFAULT 'direct'::communities.conversation_type NOT NULL,
    community_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text
);


ALTER TABLE communities.conversations OWNER TO kfdevadmin;

--
-- TOC entry 512 (class 1259 OID 25013)
-- Name: directory_items; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.directory_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    category text,
    description text,
    logo text,
    location text,
    address text,
    "contactEmail" text,
    "contactPhone" text,
    website text,
    "establishedYear" integer,
    employees text,
    revenue text,
    services jsonb
);


ALTER TABLE communities.directory_items OWNER TO kfdevadmin;

--
-- TOC entry 513 (class 1259 OID 25019)
-- Name: event_rsvps; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.event_rsvps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_rsvps_status_check CHECK ((status = ANY (ARRAY['going'::text, 'interested'::text, 'not_going'::text])))
);


ALTER TABLE communities.event_rsvps OWNER TO kfdevadmin;

--
-- TOC entry 514 (class 1259 OID 25027)
-- Name: events; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community_id uuid,
    title text NOT NULL,
    description text,
    event_date date NOT NULL,
    event_time time without time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE communities.events OWNER TO kfdevadmin;

--
-- TOC entry 515 (class 1259 OID 25034)
-- Name: growth_areas; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.growth_areas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    category text,
    growth text,
    investment text,
    "growthValue" numeric,
    "investmentValue" numeric,
    color text,
    key_opportunities jsonb,
    report_url text
);


ALTER TABLE communities.growth_areas OWNER TO kfdevadmin;

--
-- TOC entry 516 (class 1259 OID 25040)
-- Name: hero; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.hero (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text,
    subtitle text,
    stats jsonb
);


ALTER TABLE communities.hero OWNER TO kfdevadmin;

--
-- TOC entry 517 (class 1259 OID 25046)
-- Name: map_locations; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.map_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    address text,
    region text,
    type text,
    "contactPhone" text,
    "position" jsonb
);


ALTER TABLE communities.map_locations OWNER TO kfdevadmin;

--
-- TOC entry 518 (class 1259 OID 25052)
-- Name: media_files; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.media_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid,
    user_id uuid NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size integer,
    display_order integer DEFAULT 0,
    caption text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE communities.media_files OWNER TO kfdevadmin;

--
-- TOC entry 519 (class 1259 OID 25060)
-- Name: member_relationships; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.member_relationships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    status text DEFAULT 'follow'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT member_relationships_check CHECK ((follower_id <> following_id)),
    CONSTRAINT member_relationships_status_check CHECK ((status = ANY (ARRAY['follow'::text, 'requested'::text, 'connected'::text])))
);


ALTER TABLE communities.member_relationships OWNER TO kfdevadmin;

--
-- TOC entry 638 (class 1259 OID 30263)
-- Name: memberships_backup; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.memberships_backup (
    id uuid,
    user_id uuid,
    community_id uuid,
    joined_at timestamp with time zone,
    role text
);


ALTER TABLE communities.memberships_backup OWNER TO kfdevadmin;

--
-- TOC entry 520 (class 1259 OID 25070)
-- Name: messages; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY communities.messages REPLICA IDENTITY FULL;


ALTER TABLE communities.messages OWNER TO kfdevadmin;

--
-- TOC entry 521 (class 1259 OID 25078)
-- Name: moderation_actions; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.moderation_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    moderator_id uuid NOT NULL,
    action_type text NOT NULL,
    target_type text NOT NULL,
    target_id uuid,
    community_id uuid NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reason text,
    status text DEFAULT 'active'::text
);


ALTER TABLE communities.moderation_actions OWNER TO kfdevadmin;

--
-- TOC entry 522 (class 1259 OID 25086)
-- Name: moderation_actions_with_details; Type: VIEW; Schema: communities; Owner: kfdevadmin
--

CREATE VIEW communities.moderation_actions_with_details AS
 SELECT ma.id,
    ma.target_type,
    ma.target_id,
    ma.action_type,
    ma.description,
    ma.reason,
    ma.community_id,
    ma.moderator_id,
    ma.status,
    ma.created_at,
    u.username AS moderator_username,
    u.email AS moderator_email,
    u.avatar_url AS moderator_avatar,
    c.name AS community_name
   FROM ((communities.moderation_actions ma
     LEFT JOIN communities.users_local u ON ((ma.moderator_id = u.id)))
     LEFT JOIN communities.communities c ON ((ma.community_id = c.id)));


ALTER VIEW communities.moderation_actions_with_details OWNER TO kfdevadmin;

--
-- TOC entry 523 (class 1259 OID 25091)
-- Name: notifications; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type communities.notification_type NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    related_user_id uuid,
    community_id uuid,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE communities.notifications OWNER TO kfdevadmin;

--
-- TOC entry 524 (class 1259 OID 25099)
-- Name: poll_options; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.poll_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    option_text text NOT NULL,
    vote_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT poll_options_text_check CHECK ((char_length(option_text) <= 200))
);


ALTER TABLE communities.poll_options OWNER TO kfdevadmin;

--
-- TOC entry 5432 (class 0 OID 0)
-- Dependencies: 524
-- Name: TABLE poll_options; Type: COMMENT; Schema: communities; Owner: kfdevadmin
--

COMMENT ON TABLE communities.poll_options IS 'RLS disabled - security handled at application level via UnifiedAuthProvider. Only authenticated users can create posts and poll options.';


--
-- TOC entry 525 (class 1259 OID 25108)
-- Name: poll_votes; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.poll_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    option_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE communities.poll_votes OWNER TO kfdevadmin;

--
-- TOC entry 5434 (class 0 OID 0)
-- Dependencies: 525
-- Name: TABLE poll_votes; Type: COMMENT; Schema: communities; Owner: kfdevadmin
--

COMMENT ON TABLE communities.poll_votes IS 'Tracks individual user votes on polls. RLS disabled - security handled at application level. Foreign key constraints ensure data integrity.';


--
-- TOC entry 526 (class 1259 OID 25113)
-- Name: posts; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community_id uuid,
    title text NOT NULL,
    content text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    status communities.content_status DEFAULT 'active'::communities.content_status NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    content_html text,
    attachments jsonb,
    link_url text,
    event_location text,
    image_url text,
    event_date timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    post_type text DEFAULT 'text'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT posts_post_type_check CHECK ((post_type = ANY (ARRAY['text'::text, 'media'::text, 'poll'::text, 'event'::text])))
);


ALTER TABLE communities.posts OWNER TO kfdevadmin;

--
-- TOC entry 527 (class 1259 OID 25126)
-- Name: posts_with_meta; Type: VIEW; Schema: communities; Owner: kfdevadmin
--

CREATE VIEW communities.posts_with_meta AS
 SELECT p.id,
    p.title,
    p.content,
    p.created_at,
    p.community_id,
    c.name AS community_name,
    u.username AS author_username
   FROM ((communities.posts p
     LEFT JOIN communities.communities c ON ((c.id = p.community_id)))
     LEFT JOIN communities.users_local u ON ((u.id = p.created_by)));


ALTER VIEW communities.posts_with_meta OWNER TO kfdevadmin;

--
-- TOC entry 528 (class 1259 OID 25131)
-- Name: reactions; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    reaction_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reactions_reaction_type_check CHECK ((reaction_type = ANY (ARRAY['helpful'::text, 'insightful'::text])))
);


ALTER TABLE communities.reactions OWNER TO kfdevadmin;

--
-- TOC entry 529 (class 1259 OID 25139)
-- Name: posts_with_reactions; Type: VIEW; Schema: communities; Owner: kfdevadmin
--

CREATE VIEW communities.posts_with_reactions AS
 SELECT p.id,
    p.community_id,
    p.title,
    p.content,
    p.tags,
    p.created_at,
    p.status,
    p.created_by,
    c.name AS community_name,
    u.username AS author_username,
    u.avatar_url AS author_avatar,
    COALESCE(helpful.count, (0)::bigint) AS helpful_count,
    COALESCE(insightful.count, (0)::bigint) AS insightful_count,
    COALESCE(comments.count, (0)::bigint) AS comment_count
   FROM (((((communities.posts p
     LEFT JOIN communities.communities c ON ((p.community_id = c.id)))
     LEFT JOIN communities.users_local u ON ((p.created_by = u.id)))
     LEFT JOIN ( SELECT reactions.post_id,
            count(*) AS count
           FROM communities.reactions
          WHERE (reactions.reaction_type = 'helpful'::text)
          GROUP BY reactions.post_id) helpful ON ((p.id = helpful.post_id)))
     LEFT JOIN ( SELECT reactions.post_id,
            count(*) AS count
           FROM communities.reactions
          WHERE (reactions.reaction_type = 'insightful'::text)
          GROUP BY reactions.post_id) insightful ON ((p.id = insightful.post_id)))
     LEFT JOIN ( SELECT comments_1.post_id,
            count(*) AS count
           FROM communities.comments comments_1
          WHERE (comments_1.status = 'active'::communities.content_status)
          GROUP BY comments_1.post_id) comments ON ((p.id = comments.post_id)))
  WHERE (p.status = 'active'::communities.content_status);


ALTER VIEW communities.posts_with_reactions OWNER TO kfdevadmin;

--
-- TOC entry 530 (class 1259 OID 25144)
-- Name: profiles; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    username text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    notification_settings jsonb DEFAULT '{"reply": true, "system": true, "comment": true, "mention": true, "community_update": true, "moderation_alert": true}'::jsonb
);


ALTER TABLE communities.profiles OWNER TO kfdevadmin;

--
-- TOC entry 531 (class 1259 OID 25151)
-- Name: reports; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_type communities.report_type NOT NULL,
    reported_by uuid,
    post_id uuid,
    comment_id uuid,
    community_id uuid NOT NULL,
    reason text,
    status communities.report_status DEFAULT 'pending'::communities.report_status NOT NULL,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    target_type text DEFAULT 'post'::text,
    CONSTRAINT report_content_check CHECK ((((report_type = 'post'::communities.report_type) AND (post_id IS NOT NULL) AND (comment_id IS NULL)) OR ((report_type = 'comment'::communities.report_type) AND (comment_id IS NOT NULL) AND (post_id IS NULL))))
);


ALTER TABLE communities.reports OWNER TO kfdevadmin;

--
-- TOC entry 532 (class 1259 OID 25161)
-- Name: reports_with_details; Type: VIEW; Schema: communities; Owner: kfdevadmin
--

CREATE VIEW communities.reports_with_details AS
 SELECT r.id,
    r.community_id,
    r.reason,
    r.report_type,
    r.target_type,
    r.post_id,
    r.comment_id,
    r.status,
    r.created_at,
    r.resolved_at,
    r.reported_by,
    r.resolved_by,
    u.username AS reporter_username,
    u.email AS reporter_email,
    u.avatar_url AS reporter_avatar,
    c.name AS community_name,
    c.imageurl AS community_image
   FROM ((communities.reports r
     LEFT JOIN communities.users_local u ON ((r.reported_by = u.id)))
     LEFT JOIN communities.communities c ON ((r.community_id = c.id)));


ALTER VIEW communities.reports_with_details OWNER TO kfdevadmin;

--
-- TOC entry 533 (class 1259 OID 25166)
-- Name: user_roles; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role communities.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE communities.user_roles OWNER TO kfdevadmin;

--
-- TOC entry 534 (class 1259 OID 25171)
-- Name: videos; Type: TABLE; Schema: communities; Owner: kfdevadmin
--

CREATE TABLE communities.videos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    youtube_id text NOT NULL,
    title text,
    description text
);


ALTER TABLE communities.videos OWNER TO kfdevadmin;

--
-- TOC entry 4999 (class 2606 OID 25179)
-- Name: abu_dhabi_businesses abu_dhabi_businesses_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.abu_dhabi_businesses
    ADD CONSTRAINT abu_dhabi_businesses_pkey PRIMARY KEY (id);


--
-- TOC entry 5001 (class 2606 OID 25181)
-- Name: business_map_data business_map_data_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.business_map_data
    ADD CONSTRAINT business_map_data_pkey PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 25183)
-- Name: business_sectors business_sectors_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.business_sectors
    ADD CONSTRAINT business_sectors_pkey PRIMARY KEY (id);


--
-- TOC entry 5005 (class 2606 OID 25185)
-- Name: business_statistics business_statistics_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.business_statistics
    ADD CONSTRAINT business_statistics_pkey PRIMARY KEY (id);


--
-- TOC entry 5007 (class 2606 OID 25187)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5011 (class 2606 OID 33637)
-- Name: communities communities_name_key; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.communities
    ADD CONSTRAINT communities_name_key UNIQUE (name);


--
-- TOC entry 5013 (class 2606 OID 25189)
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 31208)
-- Name: communities communities_slug_unique; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.communities
    ADD CONSTRAINT communities_slug_unique UNIQUE (slug);


--
-- TOC entry 5024 (class 2606 OID 25191)
-- Name: community_roles community_roles_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.community_roles
    ADD CONSTRAINT community_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5026 (class 2606 OID 25193)
-- Name: community_roles community_roles_user_id_community_id_key; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.community_roles
    ADD CONSTRAINT community_roles_user_id_community_id_key UNIQUE (user_id, community_id);


--
-- TOC entry 5028 (class 2606 OID 25195)
-- Name: conversation_participants conversation_participants_conversation_id_user_id_key; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_user_id_key UNIQUE (conversation_id, user_id);


--
-- TOC entry 5030 (class 2606 OID 25197)
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (id);


--
-- TOC entry 5034 (class 2606 OID 25199)
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 5036 (class 2606 OID 25201)
-- Name: directory_items directory_items_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.directory_items
    ADD CONSTRAINT directory_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5038 (class 2606 OID 25203)
-- Name: event_rsvps event_rsvps_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.event_rsvps
    ADD CONSTRAINT event_rsvps_pkey PRIMARY KEY (id);


--
-- TOC entry 5040 (class 2606 OID 25205)
-- Name: event_rsvps event_rsvps_post_id_user_id_key; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.event_rsvps
    ADD CONSTRAINT event_rsvps_post_id_user_id_key UNIQUE (post_id, user_id);


--
-- TOC entry 5044 (class 2606 OID 25207)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 25209)
-- Name: growth_areas growth_areas_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.growth_areas
    ADD CONSTRAINT growth_areas_pkey PRIMARY KEY (id);


--
-- TOC entry 5049 (class 2606 OID 25211)
-- Name: hero hero_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.hero
    ADD CONSTRAINT hero_pkey PRIMARY KEY (id);


--
-- TOC entry 5051 (class 2606 OID 25213)
-- Name: map_locations map_locations_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.map_locations
    ADD CONSTRAINT map_locations_pkey PRIMARY KEY (id);


--
-- TOC entry 5055 (class 2606 OID 25215)
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- TOC entry 5057 (class 2606 OID 25217)
-- Name: member_relationships member_relationships_follower_id_following_id_key; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.member_relationships
    ADD CONSTRAINT member_relationships_follower_id_following_id_key UNIQUE (follower_id, following_id);


--
-- TOC entry 5059 (class 2606 OID 25219)
-- Name: member_relationships member_relationships_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.member_relationships
    ADD CONSTRAINT member_relationships_pkey PRIMARY KEY (id);


--
-- TOC entry 5020 (class 2606 OID 25221)
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 2606 OID 25223)
-- Name: memberships memberships_user_id_community_id_key; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.memberships
    ADD CONSTRAINT memberships_user_id_community_id_key UNIQUE (user_id, community_id);


--
-- TOC entry 5063 (class 2606 OID 25225)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5068 (class 2606 OID 25227)
-- Name: moderation_actions moderation_actions_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.moderation_actions
    ADD CONSTRAINT moderation_actions_pkey PRIMARY KEY (id);


--
-- TOC entry 5074 (class 2606 OID 25229)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5077 (class 2606 OID 25231)
-- Name: poll_options poll_options_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.poll_options
    ADD CONSTRAINT poll_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5082 (class 2606 OID 25233)
-- Name: poll_votes poll_votes_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.poll_votes
    ADD CONSTRAINT poll_votes_pkey PRIMARY KEY (id);


--
-- TOC entry 5084 (class 2606 OID 25235)
-- Name: poll_votes poll_votes_unique_user_post; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.poll_votes
    ADD CONSTRAINT poll_votes_unique_user_post UNIQUE (post_id, user_id);


--
-- TOC entry 5445 (class 0 OID 0)
-- Dependencies: 5084
-- Name: CONSTRAINT poll_votes_unique_user_post ON poll_votes; Type: COMMENT; Schema: communities; Owner: kfdevadmin
--

COMMENT ON CONSTRAINT poll_votes_unique_user_post ON communities.poll_votes IS 'Ensures each user can only vote once per poll';


--
-- TOC entry 5090 (class 2606 OID 25237)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 5099 (class 2606 OID 25239)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 5095 (class 2606 OID 25241)
-- Name: reactions reactions_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.reactions
    ADD CONSTRAINT reactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5097 (class 2606 OID 25243)
-- Name: reactions reactions_post_id_user_id_reaction_type_key; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.reactions
    ADD CONSTRAINT reactions_post_id_user_id_reaction_type_key UNIQUE (post_id, user_id, reaction_type);


--
-- TOC entry 5105 (class 2606 OID 25245)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 5107 (class 2606 OID 25247)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5109 (class 2606 OID 25249)
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- TOC entry 4993 (class 2606 OID 25251)
-- Name: users_local users_local_email_key; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.users_local
    ADD CONSTRAINT users_local_email_key UNIQUE (email);


--
-- TOC entry 4995 (class 2606 OID 25253)
-- Name: users_local users_local_external_id_key; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.users_local
    ADD CONSTRAINT users_local_external_id_key UNIQUE (external_id);


--
-- TOC entry 4997 (class 2606 OID 25255)
-- Name: users_local users_local_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.users_local
    ADD CONSTRAINT users_local_pkey PRIMARY KEY (id);


--
-- TOC entry 5111 (class 2606 OID 25257)
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 1259 OID 31160)
-- Name: idx_comments_post_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_comments_post_id ON communities.comments USING btree (post_id);


--
-- TOC entry 5009 (class 1259 OID 25258)
-- Name: idx_comments_status; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_comments_status ON communities.comments USING btree (status);


--
-- TOC entry 5016 (class 1259 OID 31210)
-- Name: idx_communities_slug; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_communities_slug ON communities.communities USING btree (slug);


--
-- TOC entry 5031 (class 1259 OID 25259)
-- Name: idx_conversation_participants_conversation; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_conversation_participants_conversation ON communities.conversation_participants USING btree (conversation_id);


--
-- TOC entry 5032 (class 1259 OID 25260)
-- Name: idx_conversation_participants_user; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_conversation_participants_user ON communities.conversation_participants USING btree (user_id);


--
-- TOC entry 5041 (class 1259 OID 25261)
-- Name: idx_event_rsvps_post_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_event_rsvps_post_id ON communities.event_rsvps USING btree (post_id);


--
-- TOC entry 5042 (class 1259 OID 25262)
-- Name: idx_event_rsvps_user_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_event_rsvps_user_id ON communities.event_rsvps USING btree (user_id);


--
-- TOC entry 5045 (class 1259 OID 25263)
-- Name: idx_events_date; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_events_date ON communities.events USING btree (event_date);


--
-- TOC entry 5052 (class 1259 OID 25264)
-- Name: idx_media_files_post_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_media_files_post_id ON communities.media_files USING btree (post_id);


--
-- TOC entry 5053 (class 1259 OID 25265)
-- Name: idx_media_files_user_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_media_files_user_id ON communities.media_files USING btree (user_id);


--
-- TOC entry 5017 (class 1259 OID 31157)
-- Name: idx_memberships_community_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_memberships_community_id ON communities.memberships USING btree (community_id);


--
-- TOC entry 5018 (class 1259 OID 31156)
-- Name: idx_memberships_user_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_memberships_user_id ON communities.memberships USING btree (user_id);


--
-- TOC entry 5060 (class 1259 OID 25266)
-- Name: idx_messages_conversation; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_messages_conversation ON communities.messages USING btree (conversation_id, created_at DESC);


--
-- TOC entry 5061 (class 1259 OID 25267)
-- Name: idx_messages_sender; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_messages_sender ON communities.messages USING btree (sender_id);


--
-- TOC entry 5064 (class 1259 OID 25268)
-- Name: idx_moderation_actions_community; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_moderation_actions_community ON communities.moderation_actions USING btree (community_id);


--
-- TOC entry 5065 (class 1259 OID 25269)
-- Name: idx_moderation_actions_community_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_moderation_actions_community_id ON communities.moderation_actions USING btree (community_id);


--
-- TOC entry 5066 (class 1259 OID 25270)
-- Name: idx_moderation_actions_created_at; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_moderation_actions_created_at ON communities.moderation_actions USING btree (created_at DESC);


--
-- TOC entry 5069 (class 1259 OID 25271)
-- Name: idx_notifications_created_at; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_notifications_created_at ON communities.notifications USING btree (created_at DESC);


--
-- TOC entry 5070 (class 1259 OID 25272)
-- Name: idx_notifications_is_read; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_notifications_is_read ON communities.notifications USING btree (is_read);


--
-- TOC entry 5071 (class 1259 OID 25273)
-- Name: idx_notifications_type; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_notifications_type ON communities.notifications USING btree (type);


--
-- TOC entry 5072 (class 1259 OID 25274)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_notifications_user_id ON communities.notifications USING btree (user_id);


--
-- TOC entry 5075 (class 1259 OID 25275)
-- Name: idx_poll_options_post_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_poll_options_post_id ON communities.poll_options USING btree (post_id);


--
-- TOC entry 5078 (class 1259 OID 25276)
-- Name: idx_poll_votes_option; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_poll_votes_option ON communities.poll_votes USING btree (option_id);


--
-- TOC entry 5079 (class 1259 OID 25277)
-- Name: idx_poll_votes_post_user; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_poll_votes_post_user ON communities.poll_votes USING btree (post_id, user_id);


--
-- TOC entry 5080 (class 1259 OID 25278)
-- Name: idx_poll_votes_user; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_poll_votes_user ON communities.poll_votes USING btree (user_id);


--
-- TOC entry 5085 (class 1259 OID 31158)
-- Name: idx_posts_community_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_posts_community_id ON communities.posts USING btree (community_id);


--
-- TOC entry 5086 (class 1259 OID 31159)
-- Name: idx_posts_created_by; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_posts_created_by ON communities.posts USING btree (created_by);


--
-- TOC entry 5087 (class 1259 OID 25279)
-- Name: idx_posts_post_type; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_posts_post_type ON communities.posts USING btree (post_type);


--
-- TOC entry 5088 (class 1259 OID 25280)
-- Name: idx_posts_status; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_posts_status ON communities.posts USING btree (status);


--
-- TOC entry 5091 (class 1259 OID 25281)
-- Name: idx_reactions_post_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_reactions_post_id ON communities.reactions USING btree (post_id);


--
-- TOC entry 5092 (class 1259 OID 31161)
-- Name: idx_reactions_user_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_reactions_user_id ON communities.reactions USING btree (user_id);


--
-- TOC entry 5093 (class 1259 OID 25282)
-- Name: idx_reactions_user_reaction; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_reactions_user_reaction ON communities.reactions USING btree (user_id, reaction_type);


--
-- TOC entry 5100 (class 1259 OID 25283)
-- Name: idx_reports_community; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_reports_community ON communities.reports USING btree (community_id);


--
-- TOC entry 5101 (class 1259 OID 25284)
-- Name: idx_reports_community_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_reports_community_id ON communities.reports USING btree (community_id);


--
-- TOC entry 5102 (class 1259 OID 25285)
-- Name: idx_reports_created_at; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_reports_created_at ON communities.reports USING btree (created_at DESC);


--
-- TOC entry 5103 (class 1259 OID 25286)
-- Name: idx_reports_status; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_reports_status ON communities.reports USING btree (status);


--
-- TOC entry 4989 (class 1259 OID 25287)
-- Name: idx_users_local_email; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_users_local_email ON communities.users_local USING btree (email);


--
-- TOC entry 4990 (class 1259 OID 25288)
-- Name: idx_users_local_external_id; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_users_local_external_id ON communities.users_local USING btree (external_id);


--
-- TOC entry 4991 (class 1259 OID 25289)
-- Name: idx_users_local_role; Type: INDEX; Schema: communities; Owner: kfdevadmin
--

CREATE INDEX idx_users_local_role ON communities.users_local USING btree (role);


--
-- TOC entry 5150 (class 2620 OID 25290)
-- Name: posts posts_updated_at_trigger; Type: TRIGGER; Schema: communities; Owner: kfdevadmin
--

CREATE TRIGGER posts_updated_at_trigger BEFORE UPDATE ON communities.posts FOR EACH ROW EXECUTE FUNCTION communities.update_posts_updated_at();


--
-- TOC entry 5149 (class 2620 OID 31212)
-- Name: communities trigger_auto_generate_slug; Type: TRIGGER; Schema: communities; Owner: kfdevadmin
--

CREATE TRIGGER trigger_auto_generate_slug BEFORE INSERT OR UPDATE OF name, slug ON communities.communities FOR EACH ROW EXECUTE FUNCTION communities.auto_generate_slug();


--
-- TOC entry 5112 (class 2606 OID 25291)
-- Name: abu_dhabi_businesses abu_dhabi_businesses_sector_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.abu_dhabi_businesses
    ADD CONSTRAINT abu_dhabi_businesses_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES communities.business_sectors(id);


--
-- TOC entry 5113 (class 2606 OID 25296)
-- Name: comments comments_created_by_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.comments
    ADD CONSTRAINT comments_created_by_fkey FOREIGN KEY (created_by) REFERENCES communities.users_local(id) ON DELETE SET NULL;


--
-- TOC entry 5114 (class 2606 OID 25301)
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES communities.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5115 (class 2606 OID 25306)
-- Name: communities communities_created_by_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.communities
    ADD CONSTRAINT communities_created_by_fkey FOREIGN KEY (created_by) REFERENCES communities.users_local(id) ON DELETE SET NULL;


--
-- TOC entry 5118 (class 2606 OID 25311)
-- Name: community_roles community_roles_community_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.community_roles
    ADD CONSTRAINT community_roles_community_id_fkey FOREIGN KEY (community_id) REFERENCES communities.communities(id) ON DELETE CASCADE;


--
-- TOC entry 5119 (class 2606 OID 25316)
-- Name: community_roles community_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.community_roles
    ADD CONSTRAINT community_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES communities.users_local(id) ON DELETE CASCADE;


--
-- TOC entry 5120 (class 2606 OID 25321)
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES communities.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5121 (class 2606 OID 25326)
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES communities.users_local(id) ON DELETE CASCADE;


--
-- TOC entry 5122 (class 2606 OID 25331)
-- Name: conversations conversations_community_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.conversations
    ADD CONSTRAINT conversations_community_id_fkey FOREIGN KEY (community_id) REFERENCES communities.communities(id) ON DELETE CASCADE;


--
-- TOC entry 5123 (class 2606 OID 25336)
-- Name: event_rsvps event_rsvps_post_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.event_rsvps
    ADD CONSTRAINT event_rsvps_post_id_fkey FOREIGN KEY (post_id) REFERENCES communities.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5124 (class 2606 OID 25341)
-- Name: events events_community_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.events
    ADD CONSTRAINT events_community_id_fkey FOREIGN KEY (community_id) REFERENCES communities.communities(id) ON DELETE CASCADE;


--
-- TOC entry 5125 (class 2606 OID 25346)
-- Name: media_files media_files_post_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.media_files
    ADD CONSTRAINT media_files_post_id_fkey FOREIGN KEY (post_id) REFERENCES communities.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5126 (class 2606 OID 25351)
-- Name: member_relationships member_relationships_follower_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.member_relationships
    ADD CONSTRAINT member_relationships_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES communities.users_local(id) ON DELETE CASCADE;


--
-- TOC entry 5127 (class 2606 OID 25356)
-- Name: member_relationships member_relationships_following_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.member_relationships
    ADD CONSTRAINT member_relationships_following_id_fkey FOREIGN KEY (following_id) REFERENCES communities.users_local(id) ON DELETE CASCADE;


--
-- TOC entry 5116 (class 2606 OID 25361)
-- Name: memberships memberships_community_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.memberships
    ADD CONSTRAINT memberships_community_id_fkey FOREIGN KEY (community_id) REFERENCES communities.communities(id) ON DELETE CASCADE;


--
-- TOC entry 5117 (class 2606 OID 25366)
-- Name: memberships memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.memberships
    ADD CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES communities.users_local(id) ON DELETE CASCADE;


--
-- TOC entry 5128 (class 2606 OID 25371)
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES communities.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5129 (class 2606 OID 25376)
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES communities.users_local(id) ON DELETE CASCADE;


--
-- TOC entry 5130 (class 2606 OID 25381)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES communities.users_local(id) ON DELETE CASCADE;


--
-- TOC entry 5131 (class 2606 OID 25386)
-- Name: moderation_actions moderation_actions_community_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.moderation_actions
    ADD CONSTRAINT moderation_actions_community_id_fkey FOREIGN KEY (community_id) REFERENCES communities.communities(id) ON DELETE CASCADE;


--
-- TOC entry 5132 (class 2606 OID 25391)
-- Name: moderation_actions moderation_actions_moderator_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.moderation_actions
    ADD CONSTRAINT moderation_actions_moderator_id_fkey FOREIGN KEY (moderator_id) REFERENCES communities.users_local(id) ON DELETE SET NULL;


--
-- TOC entry 5133 (class 2606 OID 25396)
-- Name: notifications notifications_community_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.notifications
    ADD CONSTRAINT notifications_community_id_fkey FOREIGN KEY (community_id) REFERENCES communities.communities(id) ON DELETE CASCADE;


--
-- TOC entry 5134 (class 2606 OID 25401)
-- Name: notifications notifications_related_user_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.notifications
    ADD CONSTRAINT notifications_related_user_id_fkey FOREIGN KEY (related_user_id) REFERENCES communities.users_local(id) ON DELETE SET NULL;


--
-- TOC entry 5135 (class 2606 OID 25406)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES communities.users_local(id) ON DELETE CASCADE;


--
-- TOC entry 5136 (class 2606 OID 25411)
-- Name: poll_options poll_options_post_exists; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.poll_options
    ADD CONSTRAINT poll_options_post_exists FOREIGN KEY (post_id) REFERENCES communities.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5137 (class 2606 OID 25416)
-- Name: poll_options poll_options_post_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.poll_options
    ADD CONSTRAINT poll_options_post_id_fkey FOREIGN KEY (post_id) REFERENCES communities.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5138 (class 2606 OID 25421)
-- Name: poll_votes poll_votes_option_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.poll_votes
    ADD CONSTRAINT poll_votes_option_id_fkey FOREIGN KEY (option_id) REFERENCES communities.poll_options(id) ON DELETE CASCADE;


--
-- TOC entry 5139 (class 2606 OID 25426)
-- Name: poll_votes poll_votes_post_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.poll_votes
    ADD CONSTRAINT poll_votes_post_id_fkey FOREIGN KEY (post_id) REFERENCES communities.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5140 (class 2606 OID 25431)
-- Name: poll_votes poll_votes_user_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.poll_votes
    ADD CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES communities.users_local(id) ON DELETE CASCADE;


--
-- TOC entry 5141 (class 2606 OID 25436)
-- Name: posts posts_community_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.posts
    ADD CONSTRAINT posts_community_id_fkey FOREIGN KEY (community_id) REFERENCES communities.communities(id) ON DELETE CASCADE;


--
-- TOC entry 5142 (class 2606 OID 25441)
-- Name: posts posts_created_by_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.posts
    ADD CONSTRAINT posts_created_by_fkey FOREIGN KEY (created_by) REFERENCES communities.users_local(id) ON DELETE SET NULL;


--
-- TOC entry 5143 (class 2606 OID 25446)
-- Name: reactions reactions_post_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.reactions
    ADD CONSTRAINT reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES communities.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5144 (class 2606 OID 25451)
-- Name: reports reports_comment_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.reports
    ADD CONSTRAINT reports_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES communities.comments(id) ON DELETE CASCADE;


--
-- TOC entry 5145 (class 2606 OID 25456)
-- Name: reports reports_community_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.reports
    ADD CONSTRAINT reports_community_id_fkey FOREIGN KEY (community_id) REFERENCES communities.communities(id) ON DELETE CASCADE;


--
-- TOC entry 5146 (class 2606 OID 25461)
-- Name: reports reports_post_id_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.reports
    ADD CONSTRAINT reports_post_id_fkey FOREIGN KEY (post_id) REFERENCES communities.posts(id) ON DELETE CASCADE;


--
-- TOC entry 5147 (class 2606 OID 25466)
-- Name: reports reports_reported_by_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.reports
    ADD CONSTRAINT reports_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES communities.users_local(id) ON DELETE SET NULL;


--
-- TOC entry 5148 (class 2606 OID 25471)
-- Name: reports reports_resolved_by_fkey; Type: FK CONSTRAINT; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE ONLY communities.reports
    ADD CONSTRAINT reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES communities.users_local(id) ON DELETE SET NULL;


--
-- TOC entry 5333 (class 3256 OID 25476)
-- Name: business_sectors Anyone can view business sectors; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY "Anyone can view business sectors" ON communities.business_sectors FOR SELECT USING (true);


--
-- TOC entry 5334 (class 3256 OID 25477)
-- Name: business_statistics Anyone can view business statistics; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY "Anyone can view business statistics" ON communities.business_statistics FOR SELECT USING (true);


--
-- TOC entry 5335 (class 3256 OID 25478)
-- Name: abu_dhabi_businesses Anyone can view businesses; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY "Anyone can view businesses" ON communities.abu_dhabi_businesses FOR SELECT USING (true);


--
-- TOC entry 5336 (class 3256 OID 25479)
-- Name: events Anyone can view events; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY "Anyone can view events" ON communities.events FOR SELECT USING (true);


--
-- TOC entry 5309 (class 0 OID 24926)
-- Dependencies: 501
-- Name: abu_dhabi_businesses; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.abu_dhabi_businesses ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5310 (class 0 OID 24934)
-- Dependencies: 502
-- Name: business_map_data; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.business_map_data ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5311 (class 0 OID 24940)
-- Dependencies: 503
-- Name: business_sectors; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.business_sectors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5312 (class 0 OID 24948)
-- Dependencies: 504
-- Name: business_statistics; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.business_statistics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5313 (class 0 OID 24957)
-- Dependencies: 505
-- Name: comments; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.comments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5355 (class 3256 OID 31150)
-- Name: comments comments_delete; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY comments_delete ON communities.comments FOR DELETE USING (((created_by = communities.current_user_id()) OR communities.is_admin()));


--
-- TOC entry 5353 (class 3256 OID 31148)
-- Name: comments comments_insert; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY comments_insert ON communities.comments FOR INSERT WITH CHECK ((communities.current_user_id() IS NOT NULL));


--
-- TOC entry 5352 (class 3256 OID 31147)
-- Name: comments comments_read; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY comments_read ON communities.comments FOR SELECT USING (((status = 'active'::communities.content_status) OR (created_by = communities.current_user_id()) OR communities.is_admin()));


--
-- TOC entry 5354 (class 3256 OID 31149)
-- Name: comments comments_update; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY comments_update ON communities.comments FOR UPDATE USING (((created_by = communities.current_user_id()) OR communities.is_admin()));


--
-- TOC entry 5344 (class 3256 OID 31138)
-- Name: communities communities_delete; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY communities_delete ON communities.communities FOR DELETE USING (((created_by = communities.current_user_id()) OR communities.is_admin()));


--
-- TOC entry 5342 (class 3256 OID 31136)
-- Name: communities communities_insert; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY communities_insert ON communities.communities FOR INSERT WITH CHECK ((communities.current_user_id() IS NOT NULL));


--
-- TOC entry 5341 (class 3256 OID 31135)
-- Name: communities communities_read_all; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY communities_read_all ON communities.communities FOR SELECT USING (true);


--
-- TOC entry 5343 (class 3256 OID 31137)
-- Name: communities communities_update; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY communities_update ON communities.communities FOR UPDATE USING (((created_by = communities.current_user_id()) OR communities.is_admin()));


--
-- TOC entry 5314 (class 0 OID 24990)
-- Dependencies: 509
-- Name: community_roles; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.community_roles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5360 (class 3256 OID 31155)
-- Name: community_roles community_roles_all; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY community_roles_all ON communities.community_roles USING (((EXISTS ( SELECT 1
   FROM communities.communities
  WHERE ((communities.id = community_roles.community_id) AND (communities.created_by = communities.current_user_id())))) OR communities.is_admin()));


--
-- TOC entry 5359 (class 3256 OID 31154)
-- Name: community_roles community_roles_read_all; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY community_roles_read_all ON communities.community_roles FOR SELECT USING (true);


--
-- TOC entry 5315 (class 0 OID 24997)
-- Dependencies: 510
-- Name: conversation_participants; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.conversation_participants ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5316 (class 0 OID 25005)
-- Dependencies: 511
-- Name: conversations; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.conversations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5317 (class 0 OID 25013)
-- Dependencies: 512
-- Name: directory_items; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.directory_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5318 (class 0 OID 25019)
-- Dependencies: 513
-- Name: event_rsvps; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.event_rsvps ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5319 (class 0 OID 25027)
-- Dependencies: 514
-- Name: events; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.events ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5320 (class 0 OID 25034)
-- Dependencies: 515
-- Name: growth_areas; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.growth_areas ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5321 (class 0 OID 25040)
-- Dependencies: 516
-- Name: hero; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.hero ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5322 (class 0 OID 25046)
-- Dependencies: 517
-- Name: map_locations; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.map_locations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5323 (class 0 OID 25052)
-- Dependencies: 518
-- Name: media_files; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.media_files ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5348 (class 3256 OID 31142)
-- Name: memberships memberships_delete_admin; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY memberships_delete_admin ON communities.memberships FOR DELETE USING (((EXISTS ( SELECT 1
   FROM communities.communities
  WHERE ((communities.id = memberships.community_id) AND (communities.created_by = communities.current_user_id())))) OR communities.is_admin()));


--
-- TOC entry 5347 (class 3256 OID 31141)
-- Name: memberships memberships_delete_own; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY memberships_delete_own ON communities.memberships FOR DELETE USING ((user_id = communities.current_user_id()));


--
-- TOC entry 5346 (class 3256 OID 31140)
-- Name: memberships memberships_insert; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY memberships_insert ON communities.memberships FOR INSERT WITH CHECK ((user_id = communities.current_user_id()));


--
-- TOC entry 5345 (class 3256 OID 31139)
-- Name: memberships memberships_read_all; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY memberships_read_all ON communities.memberships FOR SELECT USING (true);


--
-- TOC entry 5324 (class 0 OID 25070)
-- Dependencies: 520
-- Name: messages; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5325 (class 0 OID 25078)
-- Dependencies: 521
-- Name: moderation_actions; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.moderation_actions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5326 (class 0 OID 25091)
-- Dependencies: 523
-- Name: notifications; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.notifications ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5327 (class 0 OID 25113)
-- Dependencies: 526
-- Name: posts; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.posts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5351 (class 3256 OID 31146)
-- Name: posts posts_delete; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY posts_delete ON communities.posts FOR DELETE USING (((created_by = communities.current_user_id()) OR communities.is_admin()));


--
-- TOC entry 5349 (class 3256 OID 31144)
-- Name: posts posts_insert; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY posts_insert ON communities.posts FOR INSERT WITH CHECK (((communities.current_user_id() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM communities.memberships
  WHERE ((memberships.user_id = communities.current_user_id()) AND (memberships.community_id = posts.community_id))))));


--
-- TOC entry 5337 (class 3256 OID 31143)
-- Name: posts posts_read; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY posts_read ON communities.posts FOR SELECT USING (((status = 'active'::communities.content_status) OR (created_by = communities.current_user_id()) OR communities.is_admin()));


--
-- TOC entry 5350 (class 3256 OID 31145)
-- Name: posts posts_update; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY posts_update ON communities.posts FOR UPDATE USING (((created_by = communities.current_user_id()) OR communities.is_admin()));


--
-- TOC entry 5329 (class 0 OID 25144)
-- Dependencies: 530
-- Name: profiles; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5328 (class 0 OID 25131)
-- Dependencies: 528
-- Name: reactions; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.reactions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5358 (class 3256 OID 31153)
-- Name: reactions reactions_delete_own; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY reactions_delete_own ON communities.reactions FOR DELETE USING ((user_id = communities.current_user_id()));


--
-- TOC entry 5357 (class 3256 OID 31152)
-- Name: reactions reactions_insert; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY reactions_insert ON communities.reactions FOR INSERT WITH CHECK ((user_id = communities.current_user_id()));


--
-- TOC entry 5356 (class 3256 OID 31151)
-- Name: reactions reactions_read_all; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY reactions_read_all ON communities.reactions FOR SELECT USING (true);


--
-- TOC entry 5330 (class 0 OID 25151)
-- Dependencies: 531
-- Name: reports; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.reports ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5331 (class 0 OID 25166)
-- Dependencies: 533
-- Name: user_roles; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.user_roles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5340 (class 3256 OID 31134)
-- Name: users_local users_insert; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY users_insert ON communities.users_local FOR INSERT WITH CHECK (true);


--
-- TOC entry 5308 (class 0 OID 24909)
-- Dependencies: 500
-- Name: users_local; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.users_local ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5338 (class 3256 OID 31132)
-- Name: users_local users_read_all; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY users_read_all ON communities.users_local FOR SELECT USING (true);


--
-- TOC entry 5339 (class 3256 OID 31133)
-- Name: users_local users_update_own; Type: POLICY; Schema: communities; Owner: kfdevadmin
--

CREATE POLICY users_update_own ON communities.users_local FOR UPDATE USING ((id = communities.current_user_id()));


--
-- TOC entry 5332 (class 0 OID 25171)
-- Dependencies: 534
-- Name: videos; Type: ROW SECURITY; Schema: communities; Owner: kfdevadmin
--

ALTER TABLE communities.videos ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5368 (class 0 OID 0)
-- Dependencies: 94
-- Name: SCHEMA communities; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA communities TO kfdevadmin;
GRANT USAGE ON SCHEMA communities TO anon;
GRANT USAGE ON SCHEMA communities TO service_role;
GRANT USAGE ON SCHEMA communities TO PUBLIC;


--
-- TOC entry 5369 (class 0 OID 0)
-- Dependencies: 649
-- Name: FUNCTION can_moderate(user_id uuid, community_id_param uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.can_moderate(user_id uuid, community_id_param uuid) TO anon;
GRANT ALL ON FUNCTION communities.can_moderate(user_id uuid, community_id_param uuid) TO service_role;


--
-- TOC entry 5370 (class 0 OID 0)
-- Dependencies: 775
-- Name: FUNCTION can_moderate_community(user_id_param uuid, community_id_param uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.can_moderate_community(user_id_param uuid, community_id_param uuid) TO anon;
GRANT ALL ON FUNCTION communities.can_moderate_community(user_id_param uuid, community_id_param uuid) TO service_role;


--
-- TOC entry 5371 (class 0 OID 0)
-- Dependencies: 705
-- Name: FUNCTION check_duplicate_report(p_user_id uuid, p_target_type text, p_target_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.check_duplicate_report(p_user_id uuid, p_target_type text, p_target_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.check_duplicate_report(p_user_id uuid, p_target_type text, p_target_id uuid) TO service_role;


--
-- TOC entry 5372 (class 0 OID 0)
-- Dependencies: 774
-- Name: FUNCTION create_moderation_action_secure(p_moderator_email text, p_action_type text, p_target_type text, p_target_id uuid, p_community_id uuid, p_description text, p_reason text); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.create_moderation_action_secure(p_moderator_email text, p_action_type text, p_target_type text, p_target_id uuid, p_community_id uuid, p_description text, p_reason text) TO anon;
GRANT ALL ON FUNCTION communities.create_moderation_action_secure(p_moderator_email text, p_action_type text, p_target_type text, p_target_id uuid, p_community_id uuid, p_description text, p_reason text) TO service_role;


--
-- TOC entry 5373 (class 0 OID 0)
-- Dependencies: 810
-- Name: FUNCTION create_report_secure(p_user_email text, p_target_type text, p_target_id uuid, p_community_id uuid, p_reason text, p_post_id uuid, p_comment_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.create_report_secure(p_user_email text, p_target_type text, p_target_id uuid, p_community_id uuid, p_reason text, p_post_id uuid, p_comment_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.create_report_secure(p_user_email text, p_target_type text, p_target_id uuid, p_community_id uuid, p_reason text, p_post_id uuid, p_comment_id uuid) TO service_role;


--
-- TOC entry 5374 (class 0 OID 0)
-- Dependencies: 660
-- Name: FUNCTION current_user_id(); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.current_user_id() TO anon;
GRANT ALL ON FUNCTION communities.current_user_id() TO service_role;


--
-- TOC entry 5375 (class 0 OID 0)
-- Dependencies: 795
-- Name: FUNCTION get_community_members(p_community_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.get_community_members(p_community_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.get_community_members(p_community_id uuid) TO service_role;


--
-- TOC entry 5376 (class 0 OID 0)
-- Dependencies: 829
-- Name: FUNCTION get_feed(feed_tab text, sort_by text, user_id_param uuid, limit_count integer, offset_count integer); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.get_feed(feed_tab text, sort_by text, user_id_param uuid, limit_count integer, offset_count integer) TO anon;
GRANT ALL ON FUNCTION communities.get_feed(feed_tab text, sort_by text, user_id_param uuid, limit_count integer, offset_count integer) TO service_role;


--
-- TOC entry 5377 (class 0 OID 0)
-- Dependencies: 667
-- Name: FUNCTION get_mutual_communities(p_viewer_id uuid, p_profile_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.get_mutual_communities(p_viewer_id uuid, p_profile_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.get_mutual_communities(p_viewer_id uuid, p_profile_id uuid) TO service_role;


--
-- TOC entry 5378 (class 0 OID 0)
-- Dependencies: 823
-- Name: FUNCTION get_post_warning_for_author(p_post_id uuid, p_user_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.get_post_warning_for_author(p_post_id uuid, p_user_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.get_post_warning_for_author(p_post_id uuid, p_user_id uuid) TO service_role;


--
-- TOC entry 5379 (class 0 OID 0)
-- Dependencies: 661
-- Name: FUNCTION get_relationship_status(p_follower_id uuid, p_following_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.get_relationship_status(p_follower_id uuid, p_following_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.get_relationship_status(p_follower_id uuid, p_following_id uuid) TO service_role;


--
-- TOC entry 5380 (class 0 OID 0)
-- Dependencies: 708
-- Name: FUNCTION get_trending_topics(limit_count integer); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.get_trending_topics(limit_count integer) TO anon;
GRANT ALL ON FUNCTION communities.get_trending_topics(limit_count integer) TO service_role;


--
-- TOC entry 5381 (class 0 OID 0)
-- Dependencies: 729
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.handle_new_user() TO anon;
GRANT ALL ON FUNCTION communities.handle_new_user() TO service_role;


--
-- TOC entry 5382 (class 0 OID 0)
-- Dependencies: 694
-- Name: FUNCTION handle_user_update(); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.handle_user_update() TO anon;
GRANT ALL ON FUNCTION communities.handle_user_update() TO service_role;


--
-- TOC entry 5383 (class 0 OID 0)
-- Dependencies: 673
-- Name: FUNCTION has_conversation_role(_conversation_id uuid, _user_id uuid, _role text); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.has_conversation_role(_conversation_id uuid, _user_id uuid, _role text) TO anon;
GRANT ALL ON FUNCTION communities.has_conversation_role(_conversation_id uuid, _user_id uuid, _role text) TO service_role;


--
-- TOC entry 5384 (class 0 OID 0)
-- Dependencies: 824
-- Name: FUNCTION has_role(_user_id uuid, _role communities.app_role); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.has_role(_user_id uuid, _role communities.app_role) TO anon;
GRANT ALL ON FUNCTION communities.has_role(_user_id uuid, _role communities.app_role) TO service_role;


--
-- TOC entry 5386 (class 0 OID 0)
-- Dependencies: 778
-- Name: FUNCTION increment_poll_vote(option_id_param uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.increment_poll_vote(option_id_param uuid) TO anon;
GRANT ALL ON FUNCTION communities.increment_poll_vote(option_id_param uuid) TO service_role;


--
-- TOC entry 5387 (class 0 OID 0)
-- Dependencies: 652
-- Name: FUNCTION is_admin(); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.is_admin() TO anon;
GRANT ALL ON FUNCTION communities.is_admin() TO service_role;


--
-- TOC entry 5388 (class 0 OID 0)
-- Dependencies: 785
-- Name: FUNCTION is_conversation_participant(_conversation_id uuid, _user_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.is_conversation_participant(_conversation_id uuid, _user_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.is_conversation_participant(_conversation_id uuid, _user_id uuid) TO service_role;


--
-- TOC entry 5389 (class 0 OID 0)
-- Dependencies: 718
-- Name: FUNCTION notify_moderators_on_report(p_community_id uuid, p_report_id uuid, p_target_type text, p_reason text); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.notify_moderators_on_report(p_community_id uuid, p_report_id uuid, p_target_type text, p_reason text) TO anon;
GRANT ALL ON FUNCTION communities.notify_moderators_on_report(p_community_id uuid, p_report_id uuid, p_target_type text, p_reason text) TO service_role;


--
-- TOC entry 5390 (class 0 OID 0)
-- Dependencies: 711
-- Name: FUNCTION notify_post_author_on_moderation(p_action_type text, p_target_type text, p_target_id uuid, p_community_id uuid, p_reason text); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.notify_post_author_on_moderation(p_action_type text, p_target_type text, p_target_id uuid, p_community_id uuid, p_reason text) TO anon;
GRANT ALL ON FUNCTION communities.notify_post_author_on_moderation(p_action_type text, p_target_type text, p_target_id uuid, p_community_id uuid, p_reason text) TO service_role;


--
-- TOC entry 5391 (class 0 OID 0)
-- Dependencies: 670
-- Name: FUNCTION remove_community_member(p_community_id uuid, p_user_id uuid, p_current_user_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.remove_community_member(p_community_id uuid, p_user_id uuid, p_current_user_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.remove_community_member(p_community_id uuid, p_user_id uuid, p_current_user_id uuid) TO service_role;


--
-- TOC entry 5392 (class 0 OID 0)
-- Dependencies: 803
-- Name: FUNCTION user_role_equals_text(communities.user_role, text); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.user_role_equals_text(communities.user_role, text) TO anon;
GRANT ALL ON FUNCTION communities.user_role_equals_text(communities.user_role, text) TO service_role;


--
-- TOC entry 5399 (class 0 OID 0)
-- Dependencies: 500
-- Name: TABLE users_local; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.users_local TO anon;
GRANT ALL ON TABLE communities.users_local TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.users_local TO PUBLIC;


--
-- TOC entry 5400 (class 0 OID 0)
-- Dependencies: 744
-- Name: FUNCTION search_users(query text, current_user_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.search_users(query text, current_user_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.search_users(query text, current_user_id uuid) TO service_role;


--
-- TOC entry 5401 (class 0 OID 0)
-- Dependencies: 737
-- Name: FUNCTION toggle_follow(p_follower_id uuid, p_following_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.toggle_follow(p_follower_id uuid, p_following_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.toggle_follow(p_follower_id uuid, p_following_id uuid) TO service_role;


--
-- TOC entry 5402 (class 0 OID 0)
-- Dependencies: 684
-- Name: FUNCTION update_communities_updated_at(); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.update_communities_updated_at() TO anon;
GRANT ALL ON FUNCTION communities.update_communities_updated_at() TO service_role;


--
-- TOC entry 5403 (class 0 OID 0)
-- Dependencies: 789
-- Name: FUNCTION update_member_role(p_community_id uuid, p_user_id uuid, p_new_role text, p_current_user_id uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.update_member_role(p_community_id uuid, p_user_id uuid, p_new_role text, p_current_user_id uuid) TO anon;
GRANT ALL ON FUNCTION communities.update_member_role(p_community_id uuid, p_user_id uuid, p_new_role text, p_current_user_id uuid) TO service_role;


--
-- TOC entry 5404 (class 0 OID 0)
-- Dependencies: 804
-- Name: FUNCTION update_posts_updated_at(); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.update_posts_updated_at() TO anon;
GRANT ALL ON FUNCTION communities.update_posts_updated_at() TO service_role;


--
-- TOC entry 5405 (class 0 OID 0)
-- Dependencies: 757
-- Name: FUNCTION update_report_status_secure(p_report_id uuid, p_status communities.report_status, p_resolved_by uuid); Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT ALL ON FUNCTION communities.update_report_status_secure(p_report_id uuid, p_status communities.report_status, p_resolved_by uuid) TO anon;
GRANT ALL ON FUNCTION communities.update_report_status_secure(p_report_id uuid, p_status communities.report_status, p_resolved_by uuid) TO service_role;


--
-- TOC entry 5406 (class 0 OID 0)
-- Dependencies: 501
-- Name: TABLE abu_dhabi_businesses; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.abu_dhabi_businesses TO anon;
GRANT ALL ON TABLE communities.abu_dhabi_businesses TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.abu_dhabi_businesses TO PUBLIC;


--
-- TOC entry 5407 (class 0 OID 0)
-- Dependencies: 502
-- Name: TABLE business_map_data; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.business_map_data TO anon;
GRANT ALL ON TABLE communities.business_map_data TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.business_map_data TO PUBLIC;


--
-- TOC entry 5408 (class 0 OID 0)
-- Dependencies: 503
-- Name: TABLE business_sectors; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.business_sectors TO anon;
GRANT ALL ON TABLE communities.business_sectors TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.business_sectors TO PUBLIC;


--
-- TOC entry 5409 (class 0 OID 0)
-- Dependencies: 504
-- Name: TABLE business_statistics; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.business_statistics TO anon;
GRANT ALL ON TABLE communities.business_statistics TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.business_statistics TO PUBLIC;


--
-- TOC entry 5410 (class 0 OID 0)
-- Dependencies: 505
-- Name: TABLE comments; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.comments TO anon;
GRANT ALL ON TABLE communities.comments TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.comments TO PUBLIC;


--
-- TOC entry 5411 (class 0 OID 0)
-- Dependencies: 506
-- Name: TABLE communities; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.communities TO anon;
GRANT ALL ON TABLE communities.communities TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.communities TO PUBLIC;


--
-- TOC entry 5412 (class 0 OID 0)
-- Dependencies: 639
-- Name: TABLE communities_backup; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.communities_backup TO anon;
GRANT ALL ON TABLE communities.communities_backup TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.communities_backup TO PUBLIC;


--
-- TOC entry 5413 (class 0 OID 0)
-- Dependencies: 507
-- Name: TABLE memberships; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.memberships TO anon;
GRANT ALL ON TABLE communities.memberships TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.memberships TO PUBLIC;


--
-- TOC entry 5414 (class 0 OID 0)
-- Dependencies: 508
-- Name: TABLE communities_with_counts; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.communities_with_counts TO anon;
GRANT ALL ON TABLE communities.communities_with_counts TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.communities_with_counts TO PUBLIC;


--
-- TOC entry 5415 (class 0 OID 0)
-- Dependencies: 509
-- Name: TABLE community_roles; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.community_roles TO anon;
GRANT ALL ON TABLE communities.community_roles TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.community_roles TO PUBLIC;


--
-- TOC entry 5416 (class 0 OID 0)
-- Dependencies: 637
-- Name: TABLE community_roles_backup; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.community_roles_backup TO anon;
GRANT ALL ON TABLE communities.community_roles_backup TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.community_roles_backup TO PUBLIC;


--
-- TOC entry 5417 (class 0 OID 0)
-- Dependencies: 510
-- Name: TABLE conversation_participants; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.conversation_participants TO anon;
GRANT ALL ON TABLE communities.conversation_participants TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.conversation_participants TO PUBLIC;


--
-- TOC entry 5418 (class 0 OID 0)
-- Dependencies: 511
-- Name: TABLE conversations; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.conversations TO anon;
GRANT ALL ON TABLE communities.conversations TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.conversations TO PUBLIC;


--
-- TOC entry 5419 (class 0 OID 0)
-- Dependencies: 512
-- Name: TABLE directory_items; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.directory_items TO anon;
GRANT ALL ON TABLE communities.directory_items TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.directory_items TO PUBLIC;


--
-- TOC entry 5420 (class 0 OID 0)
-- Dependencies: 513
-- Name: TABLE event_rsvps; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.event_rsvps TO anon;
GRANT ALL ON TABLE communities.event_rsvps TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.event_rsvps TO PUBLIC;


--
-- TOC entry 5421 (class 0 OID 0)
-- Dependencies: 514
-- Name: TABLE events; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.events TO anon;
GRANT ALL ON TABLE communities.events TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.events TO PUBLIC;


--
-- TOC entry 5422 (class 0 OID 0)
-- Dependencies: 515
-- Name: TABLE growth_areas; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.growth_areas TO anon;
GRANT ALL ON TABLE communities.growth_areas TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.growth_areas TO PUBLIC;


--
-- TOC entry 5423 (class 0 OID 0)
-- Dependencies: 516
-- Name: TABLE hero; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.hero TO anon;
GRANT ALL ON TABLE communities.hero TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.hero TO PUBLIC;


--
-- TOC entry 5424 (class 0 OID 0)
-- Dependencies: 517
-- Name: TABLE map_locations; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.map_locations TO anon;
GRANT ALL ON TABLE communities.map_locations TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.map_locations TO PUBLIC;


--
-- TOC entry 5425 (class 0 OID 0)
-- Dependencies: 518
-- Name: TABLE media_files; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.media_files TO anon;
GRANT ALL ON TABLE communities.media_files TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.media_files TO PUBLIC;


--
-- TOC entry 5426 (class 0 OID 0)
-- Dependencies: 519
-- Name: TABLE member_relationships; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.member_relationships TO anon;
GRANT ALL ON TABLE communities.member_relationships TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.member_relationships TO PUBLIC;


--
-- TOC entry 5427 (class 0 OID 0)
-- Dependencies: 638
-- Name: TABLE memberships_backup; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.memberships_backup TO anon;
GRANT ALL ON TABLE communities.memberships_backup TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.memberships_backup TO PUBLIC;


--
-- TOC entry 5428 (class 0 OID 0)
-- Dependencies: 520
-- Name: TABLE messages; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.messages TO anon;
GRANT ALL ON TABLE communities.messages TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.messages TO PUBLIC;


--
-- TOC entry 5429 (class 0 OID 0)
-- Dependencies: 521
-- Name: TABLE moderation_actions; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.moderation_actions TO anon;
GRANT ALL ON TABLE communities.moderation_actions TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.moderation_actions TO PUBLIC;


--
-- TOC entry 5430 (class 0 OID 0)
-- Dependencies: 522
-- Name: TABLE moderation_actions_with_details; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.moderation_actions_with_details TO anon;
GRANT ALL ON TABLE communities.moderation_actions_with_details TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.moderation_actions_with_details TO PUBLIC;


--
-- TOC entry 5431 (class 0 OID 0)
-- Dependencies: 523
-- Name: TABLE notifications; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.notifications TO anon;
GRANT ALL ON TABLE communities.notifications TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.notifications TO PUBLIC;


--
-- TOC entry 5433 (class 0 OID 0)
-- Dependencies: 524
-- Name: TABLE poll_options; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.poll_options TO anon;
GRANT ALL ON TABLE communities.poll_options TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.poll_options TO PUBLIC;


--
-- TOC entry 5435 (class 0 OID 0)
-- Dependencies: 525
-- Name: TABLE poll_votes; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.poll_votes TO anon;
GRANT ALL ON TABLE communities.poll_votes TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.poll_votes TO PUBLIC;


--
-- TOC entry 5436 (class 0 OID 0)
-- Dependencies: 526
-- Name: TABLE posts; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.posts TO anon;
GRANT ALL ON TABLE communities.posts TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.posts TO PUBLIC;


--
-- TOC entry 5437 (class 0 OID 0)
-- Dependencies: 527
-- Name: TABLE posts_with_meta; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.posts_with_meta TO anon;
GRANT ALL ON TABLE communities.posts_with_meta TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.posts_with_meta TO PUBLIC;


--
-- TOC entry 5438 (class 0 OID 0)
-- Dependencies: 528
-- Name: TABLE reactions; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.reactions TO anon;
GRANT ALL ON TABLE communities.reactions TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.reactions TO PUBLIC;


--
-- TOC entry 5439 (class 0 OID 0)
-- Dependencies: 529
-- Name: TABLE posts_with_reactions; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.posts_with_reactions TO anon;
GRANT ALL ON TABLE communities.posts_with_reactions TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.posts_with_reactions TO PUBLIC;


--
-- TOC entry 5440 (class 0 OID 0)
-- Dependencies: 530
-- Name: TABLE profiles; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.profiles TO anon;
GRANT ALL ON TABLE communities.profiles TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.profiles TO PUBLIC;


--
-- TOC entry 5441 (class 0 OID 0)
-- Dependencies: 531
-- Name: TABLE reports; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.reports TO anon;
GRANT ALL ON TABLE communities.reports TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.reports TO PUBLIC;


--
-- TOC entry 5442 (class 0 OID 0)
-- Dependencies: 532
-- Name: TABLE reports_with_details; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.reports_with_details TO anon;
GRANT ALL ON TABLE communities.reports_with_details TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.reports_with_details TO PUBLIC;


--
-- TOC entry 5443 (class 0 OID 0)
-- Dependencies: 533
-- Name: TABLE user_roles; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.user_roles TO anon;
GRANT ALL ON TABLE communities.user_roles TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.user_roles TO PUBLIC;


--
-- TOC entry 5444 (class 0 OID 0)
-- Dependencies: 534
-- Name: TABLE videos; Type: ACL; Schema: communities; Owner: kfdevadmin
--

GRANT SELECT ON TABLE communities.videos TO anon;
GRANT ALL ON TABLE communities.videos TO service_role;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE communities.videos TO PUBLIC;


--
-- TOC entry 3035 (class 826 OID 25480)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: communities; Owner: kfdevadmin
--

ALTER DEFAULT PRIVILEGES FOR ROLE kfdevadmin IN SCHEMA communities GRANT ALL ON SEQUENCES TO kfdevadmin;
ALTER DEFAULT PRIVILEGES FOR ROLE kfdevadmin IN SCHEMA communities GRANT SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE kfdevadmin IN SCHEMA communities GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 3031 (class 826 OID 25481)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: communities; Owner: kfdevadmin
--

ALTER DEFAULT PRIVILEGES FOR ROLE kfdevadmin IN SCHEMA communities GRANT ALL ON FUNCTIONS TO kfdevadmin;


--
-- TOC entry 3034 (class 826 OID 25482)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: communities; Owner: kfdevadmin
--

ALTER DEFAULT PRIVILEGES FOR ROLE kfdevadmin IN SCHEMA communities GRANT ALL ON TABLES TO kfdevadmin;
ALTER DEFAULT PRIVILEGES FOR ROLE kfdevadmin IN SCHEMA communities GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE kfdevadmin IN SCHEMA communities GRANT ALL ON TABLES TO service_role;


-- Completed on 2025-12-03 11:19:44

--
-- PostgreSQL database dump complete
--

\unrestrict pH9uVGSDoJ7Uaeotg85k2JHHbdnWu6Vnr0fLhwQgayco56Fd0YSyfoxuAjDwozk


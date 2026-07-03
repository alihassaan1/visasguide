
-- 1. Audit log table
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  table_name text NOT NULL,
  record_id text,
  action text NOT NULL, -- insert | update | delete | ddl
  changed_by uuid,
  changed_by_email text,
  actor_role text,
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  ddl_command text,
  ddl_object text,
  ip_address text,
  user_agent text,
  notes text
);

CREATE INDEX idx_audit_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX idx_audit_table_name ON public.admin_audit_log (table_name, created_at DESC);
CREATE INDEX idx_audit_changed_by ON public.admin_audit_log (changed_by);

GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- No insert/update/delete policies: only SECURITY DEFINER triggers can write.

-- 2. Generic row-change audit function
CREATE OR REPLACE FUNCTION public.log_config_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_old jsonb;
  v_new jsonb;
  v_changed text[];
  v_record_id text;
BEGIN
  v_uid := auth.uid();

  BEGIN
    SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  EXCEPTION WHEN OTHERS THEN
    v_email := NULL;
  END;

  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_new := NULL;
    v_record_id := COALESCE((v_old->>'id'), '');
  ELSIF TG_OP = 'INSERT' THEN
    v_old := NULL;
    v_new := to_jsonb(NEW);
    v_record_id := COALESCE((v_new->>'id'), '');
  ELSE
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_record_id := COALESCE((v_new->>'id'), '');
    SELECT array_agg(key) INTO v_changed
    FROM jsonb_each(v_new)
    WHERE v_new->key IS DISTINCT FROM v_old->key
      AND key NOT IN ('updated_at');
    IF v_changed IS NULL OR array_length(v_changed, 1) IS NULL THEN
      RETURN NEW; -- nothing meaningful changed
    END IF;
  END IF;

  INSERT INTO public.admin_audit_log (
    table_name, record_id, action, changed_by, changed_by_email,
    actor_role, old_values, new_values, changed_fields
  ) VALUES (
    TG_TABLE_NAME,
    v_record_id,
    lower(TG_OP),
    v_uid,
    v_email,
    current_user,
    v_old,
    v_new,
    v_changed
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 3. Attach triggers to config tables
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'site_settings',
    'affiliate_programs',
    'settings_affiliates',
    'affiliate_widgets',
    'user_roles',
    'admin_users',
    'rss_feeds',
    'platform_accounts'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%1$s ON public.%1$I;', t);
    EXECUTE format(
      'CREATE TRIGGER audit_%1$s AFTER INSERT OR UPDATE OR DELETE ON public.%1$I
         FOR EACH ROW EXECUTE FUNCTION public.log_config_change();',
      t
    );
  END LOOP;
END$$;

-- 4. DDL event trigger for RLS / policy changes
CREATE OR REPLACE FUNCTION public.log_policy_ddl()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT * FROM pg_event_trigger_ddl_commands() LOOP
    IF r.command_tag IN (
      'CREATE POLICY','ALTER POLICY','DROP POLICY',
      'ALTER TABLE' -- may include ENABLE/DISABLE ROW LEVEL SECURITY
    ) THEN
      INSERT INTO public.admin_audit_log (
        table_name, action, actor_role, ddl_command, ddl_object, notes
      ) VALUES (
        COALESCE(r.schema_name || '.' || split_part(r.object_identity, '.', 2), r.object_identity),
        'ddl',
        session_user,
        r.command_tag,
        r.object_identity,
        r.object_type
      );
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_policy_ddl_drop()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT * FROM pg_event_trigger_dropped_objects() LOOP
    IF r.object_type IN ('policy','table row-level security') THEN
      INSERT INTO public.admin_audit_log (
        table_name, action, actor_role, ddl_command, ddl_object, notes
      ) VALUES (
        r.schema_name,
        'ddl',
        session_user,
        'DROP ' || r.object_type,
        r.object_identity,
        r.object_type
      );
    END IF;
  END LOOP;
END;
$$;

DROP EVENT TRIGGER IF EXISTS trg_log_policy_ddl;
CREATE EVENT TRIGGER trg_log_policy_ddl
  ON ddl_command_end
  EXECUTE FUNCTION public.log_policy_ddl();

DROP EVENT TRIGGER IF EXISTS trg_log_policy_ddl_drop;
CREATE EVENT TRIGGER trg_log_policy_ddl_drop
  ON sql_drop
  EXECUTE FUNCTION public.log_policy_ddl_drop();

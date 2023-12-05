DROP MATERIALIZED VIEW IF EXISTS "profiles"."venue_tree";
CREATE MATERIALIZED VIEW "profiles"."venue_tree"(child_id, parent_id, distance) AS (
  WITH RECURSIVE parent_query AS (
    SELECT
      profile_id AS child_id,
      parent_id,
      1 AS distance
    FROM profiles.venues
    WHERE parent_id IS NOT NULL
    UNION ALL
      SELECT
        parent_query.child_id AS child_id,
        profiles.venues.parent_id AS parent_id,
        parent_query.distance + 1 AS distance
      FROM parent_query, profiles.venues
      WHERE profiles.venues.parent_id IS NOT NULL
        AND profiles.venues.profile_id = parent_query.parent_id
  )
  SELECT child_id, parent_id, distance
  FROM parent_query
);
CREATE UNIQUE INDEX "venue_tree_child_parent_idx" ON "profiles"."venue_tree"(child_id, parent_id);
CREATE INDEX "venue_tree_child_idx" ON "profiles"."venue_tree"(child_id);
CREATE INDEX "venue_tree_parent_idx" ON "profiles"."venue_tree"(parent_id);
CREATE INDEX "venue_distance_idx" ON "profiles"."venue_tree"(distance);

DROP MATERIALIZED VIEW IF EXISTS "profiles"."venue_tree_root_nodes";
CREATE MATERIALIZED VIEW "profiles"."venue_tree_root_nodes"(venue_id) AS (
  SELECT profile_id AS venue_id
  FROM profiles.venues
  WHERE profile_id NOT IN (
    SELECT child_id
    FROM profiles.venue_tree
  )
);
CREATE UNIQUE INDEX "venue_tree_root_nodes_venue_id_idx" ON "profiles"."venue_tree_root_nodes"(venue_id);

DROP MATERIALIZED VIEW IF EXISTS "profiles"."venue_tree_leaf_nodes";
CREATE MATERIALIZED VIEW "profiles"."venue_tree_leaf_nodes"(venue_id) AS (
  SELECT profile_id AS venue_id
  FROM profiles.venues
  WHERE profile_id NOT IN (
    SELECT parent_id
    FROM profiles.venue_tree
  )
);
CREATE UNIQUE INDEX "venue_tree_leaf_nodes_venue_id_idx" ON "profiles"."venue_tree_leaf_nodes"(venue_id);

CREATE OR REPLACE FUNCTION "profiles"."trigger_func_refresh_venue_tree"() 
  RETURNS TRIGGER 
  VOLATILE
  PARALLEL UNSAFE
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW "profiles"."venue_tree";
  REFRESH MATERIALIZED VIEW "profiles"."venue_tree_root_nodes";
  REFRESH MATERIALIZED VIEW "profiles"."venue_tree_leaf_nodes";
  RETURN NULL;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE TRIGGER "refresh_venue_tree" 
  AFTER
    INSERT
      OR UPDATE OF "parent_id"
      OR DELETE
      OR TRUNCATE
  ON "profiles"."venues"
  FOR EACH STATEMENT
  EXECUTE FUNCTION "profiles"."trigger_func_refresh_venue_tree"();

CREATE OR REPLACE FUNCTION "profiles"."trigger_func_venue_enforce_non_circular_hierarchy"() 
  RETURNS TRIGGER 
  STABLE
  PARALLEL UNSAFE
AS $$
BEGIN
  IF NEW.profile_id = NEW.parent_id OR EXISTS(
    SELECT *
    FROM "profiles"."venue_tree"
    WHERE NEW.parent_id = child_id
      AND NEW.profile_id = parent_id
  ) THEN
    RAISE EXCEPTION 'Profile with id % is already present in the venue hierarchy', NEW.profile_id USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE PLPGSQL;

CREATE OR REPLACE TRIGGER "enforce_non_circular_hierarchy_insert" 
  BEFORE INSERT
  ON "profiles"."venues"
  FOR EACH ROW
  WHEN (NEW.parent_id IS DISTINCT FROM NULL)
  EXECUTE FUNCTION "profiles"."trigger_func_venue_enforce_non_circular_hierarchy"();

CREATE OR REPLACE TRIGGER "enforce_non_circular_hierarchy_update" 
  BEFORE UPDATE
  ON "profiles"."venues"
  FOR EACH ROW
  WHEN (
    NEW.parent_id IS DISTINCT FROM NULL
      AND (
        OLD.parent_id IS DISTINCT FROM NEW.parent_id
          OR NEW.profile_id IS DISTINCT FROM OLD.profile_id
      )
  )
  EXECUTE FUNCTION "profiles"."trigger_func_venue_enforce_non_circular_hierarchy"();

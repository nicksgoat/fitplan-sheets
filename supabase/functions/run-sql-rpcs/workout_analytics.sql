
-- Function to get workout counts grouped by date
CREATE OR REPLACE FUNCTION get_workout_log_counts(p_user_id UUID)
RETURNS TABLE (
  log_date DATE,
  workout_count BIGINT
) LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT 
    DATE_TRUNC('day', created_at)::DATE AS log_date, 
    COUNT(*) AS workout_count
  FROM workout_logs
  WHERE user_id = p_user_id
  GROUP BY log_date
  ORDER BY log_date DESC
  LIMIT 30;
$$;

-- Function to get most used exercises
CREATE OR REPLACE FUNCTION get_most_used_exercises(p_user_id UUID, p_limit INT)
RETURNS TABLE (
  exercise_name TEXT,
  usage_count BIGINT
) LANGUAGE SQL SECURITY DEFINER AS $$
  WITH exercise_counts AS (
    SELECT 
      e.name AS exercise_name,
      COUNT(*) AS usage_count
    FROM workout_logs wl
    JOIN exercise_logs el ON el.workout_log_id = wl.id
    JOIN exercises e ON e.id = el.exercise_id
    WHERE wl.user_id = p_user_id
    GROUP BY e.name
    ORDER BY usage_count DESC
    LIMIT p_limit
  )
  SELECT * FROM exercise_counts;
$$;

-- Function to calculate workout streak
CREATE OR REPLACE FUNCTION calculate_workout_streak(p_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER
) LANGUAGE PLPGSQL SECURITY DEFINER AS $$
DECLARE
  current_streak INTEGER := 0;
  longest_streak INTEGER := 0;
  last_date DATE := NULL;
  cur_date DATE;
  in_streak BOOLEAN := FALSE;
BEGIN
  -- Get all workout dates for the user
  FOR cur_date IN 
    SELECT DISTINCT DATE_TRUNC('day', created_at)::DATE 
    FROM workout_logs 
    WHERE user_id = p_user_id
    ORDER BY 1 DESC
  LOOP
    -- First date, initialize
    IF last_date IS NULL THEN
      last_date := cur_date;
      current_streak := 1;
      in_streak := TRUE;
    -- Date is consecutive with last one
    ELSIF last_date = cur_date + INTERVAL '1 day' THEN
      current_streak := current_streak + 1;
      last_date := cur_date;
      in_streak := TRUE;
    -- Date is not consecutive, streak broken
    ELSE
      IF in_streak THEN
        longest_streak := GREATEST(longest_streak, current_streak);
        current_streak := 1;
        in_streak := FALSE;
      END IF;
      last_date := cur_date;
    END IF;
  END LOOP;
  
  -- Check final streak
  longest_streak := GREATEST(longest_streak, current_streak);
  
  -- If last workout was not from today, current streak is 0
  IF last_date < CURRENT_DATE - INTERVAL '1 day' THEN
    current_streak := 0;
  END IF;
  
  RETURN QUERY SELECT current_streak, longest_streak;
END;
$$;

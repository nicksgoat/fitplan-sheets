
-- Function to get a user's subscriptions
CREATE OR REPLACE FUNCTION get_user_subscriptions()
RETURNS SETOF club_subscriptions
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM club_subscriptions
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Function to get a user's subscription for a specific club
CREATE OR REPLACE FUNCTION get_user_club_subscription(
  user_id_param UUID,
  club_id_param UUID
)
RETURNS SETOF club_subscriptions
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM club_subscriptions
  WHERE user_id = user_id_param AND club_id = club_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to get a subscription by Stripe session ID
CREATE OR REPLACE FUNCTION get_subscription_by_session(
  session_id_param TEXT
)
RETURNS SETOF club_subscriptions
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM club_subscriptions s
  JOIN club_members m ON s.user_id = m.user_id AND s.club_id = m.club_id
  WHERE m.stripe_subscription_id = session_id_param;
END;
$$ LANGUAGE plpgsql;

-- Add redeem_point to user_xp (separate from learning xp)
ALTER TABLE public.user_xp ADD COLUMN IF NOT EXISTS redeem_point integer NOT NULL DEFAULT 0;

-- Rewards catalog
CREATE TABLE IF NOT EXISTS public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  required_point integer NOT NULL DEFAULT 0,
  expired_at timestamptz,
  status text NOT NULL DEFAULT 'active', -- 'active' | 'inactive'
  stock integer, -- null = unlimited
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rewards_org ON public.rewards(org_id);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read rewards" ON public.rewards FOR SELECT TO authenticated USING (is_org_member(auth.uid(), org_id));
CREATE POLICY "members manage rewards" ON public.rewards FOR ALL TO authenticated USING (is_org_member(auth.uid(), org_id)) WITH CHECK (is_org_member(auth.uid(), org_id));

CREATE TRIGGER rewards_set_updated BEFORE UPDATE ON public.rewards FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Redemption history
CREATE TABLE IF NOT EXISTS public.user_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL,
  user_id uuid NOT NULL,
  reward_id uuid NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
  reward_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  point_spent integer NOT NULL,
  status text NOT NULL DEFAULT 'redeemed', -- 'redeemed'|'fulfilled'|'cancelled'
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON public.user_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_org ON public.user_redemptions(org_id);

ALTER TABLE public.user_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own redemptions" ON public.user_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_org_member(auth.uid(), org_id));
CREATE POLICY "users insert own redemptions" ON public.user_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Atomic redeem function
CREATE OR REPLACE FUNCTION public.redeem_reward(_reward_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_reward record;
  v_xp record;
  v_redemption_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized');
  END IF;

  SELECT * INTO v_reward FROM public.rewards WHERE id = _reward_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'reward_not_found');
  END IF;
  IF v_reward.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'reward_inactive');
  END IF;
  IF v_reward.expired_at IS NOT NULL AND v_reward.expired_at <= now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'reward_expired');
  END IF;
  IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'out_of_stock');
  END IF;

  SELECT * INTO v_xp FROM public.user_xp WHERE user_id = v_user AND org_id = v_reward.org_id FOR UPDATE;
  IF NOT FOUND OR COALESCE(v_xp.redeem_point, 0) < v_reward.required_point THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_points',
      'have', COALESCE(v_xp.redeem_point, 0), 'need', v_reward.required_point);
  END IF;

  UPDATE public.user_xp SET redeem_point = redeem_point - v_reward.required_point, updated_at = now()
    WHERE user_id = v_user AND org_id = v_reward.org_id;

  IF v_reward.stock IS NOT NULL THEN
    UPDATE public.rewards SET stock = stock - 1 WHERE id = v_reward.id;
  END IF;

  INSERT INTO public.user_redemptions (org_id, user_id, reward_id, reward_snapshot, point_spent, status)
  VALUES (v_reward.org_id, v_user, v_reward.id,
          jsonb_build_object('name', v_reward.name, 'description', v_reward.description, 'image_url', v_reward.image_url),
          v_reward.required_point, 'redeemed')
  RETURNING id INTO v_redemption_id;

  RETURN jsonb_build_object('ok', true, 'redemption_id', v_redemption_id);
END;
$$;
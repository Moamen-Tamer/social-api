-- Follows are joined with public profile data by the API, so these foreign keys
-- must target public.users rather than auth.users.
ALTER TABLE public.follows
    DROP CONSTRAINT IF EXISTS follows_follower_id_fkey,
    DROP CONSTRAINT IF EXISTS follows_following_id_fkey;

ALTER TABLE public.follows
    ADD CONSTRAINT follows_follower_id_fkey
        FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE,
    ADD CONSTRAINT follows_following_id_fkey
        FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;
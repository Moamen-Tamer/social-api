CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    BIO TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

comment on table public.users is 'Profile data for a Supabase Auth identity. Row created by the on_auth_user_created trigger; deleting the auth.users row cascades here.';

CREATE TABLE public.follows (
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT follows_pkey PRIMARY KEY(follower_id, following_id),
    CONSTRAINT follows_no_self_follow CHECK (follower_id <> following_id),
    CONSTRAINT follows_follower_id_fkey FOREIGN KEY(follower_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT follows_following_id_fkey FOREIGN KEY(following_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_follows_following ON public.follows(following_id);

CREATE TABLE public.likes (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT likes_pkey PRIMARY KEY(user_id, post_id)
);

CREATE INDEX idx_likes_post ON public.likes(post_id);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK( type in ('like', 'follow', 'comment')),
    payload JSONB NOT NULL DEFAULT '{}'::JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);

CREATE FUNCTION public.handle_new_user ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer 
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.users (id, username, email)
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data ->> 'username', 
        NEW.email
    );

    return NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
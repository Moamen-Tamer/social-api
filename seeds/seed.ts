import "dotenv/config";
import mongoose from "mongoose";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { connectMongo } from "../src/connections/mongo.js";
import { redis } from "../src/connections/redis.js";
import Post from "../src/models/post.model.js";
import Comment from "../src/models/comment.model.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables"
    );
}

const supabase: SupabaseClient = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

const SEED_PASSWORD = "password";

const people = [
    ["ahmed_mohamed", "ahmedmohamed@gmail.com", "Building a social API and drinking far too much coffee."],
    ["mariam_hassan", "mariamhassan@gmail.com", "Product designer, book lover, and Cairo walker."],
    ["omar_ali", "omarali@gmail.com", "Backend developer. Clean code, good food, long rides."],
    ["nour_adel", "nouradel@gmail.com", "Photography, plants, and quiet mornings."],
    ["youssef_samy", "youssefsamy@gmail.com", "Learning one useful thing every day."],
    ["sara_wael", "sarawael@gmail.com", "Marketing by day, amateur baker by night."],
    ["karim_fathy", "karimfathy@gmail.com", "Football, films, and weekend road trips."],
    ["salma_tarek", "salmatarek@gmail.com", "Data analyst with a weakness for a good chart."],
    ["mostafa_ahmed", "mostafaahmed@gmail.com", "Mobile developer and lifelong gamer."],
    ["dina_mohsen", "dinamohsen@gmail.com", "Writing small stories and taking big chances."],
    ["mahmoud_adel", "mahmoudadel@gmail.com", "DevOps engineer. Automate the boring stuff."],
    ["hana_ashraf", "hanaashraf@gmail.com", "Teacher, reader, and occasional runner."],
    ["amr_khaled", "amrkhaled@gmail.com", "Trying recipes from every city I visit."],
    ["laila_sherif", "lailasherif@gmail.com", "UX researcher interested in everyday habits."],
    ["tarek_said", "tareksaid@gmail.com", "Finance, fitness, and fresh mint tea."],
    ["aya_mamdouh", "ayamamdouh@gmail.com", "Illustrator sharing colors from ordinary days."],
    ["khaled_nabil", "khalednabil@gmail.com", "Security engineer. Curious by default."],
    ["rania_magdy", "raniamagdy@gmail.com", "Community builder and enthusiastic host."],
    ["ibrahim_saber", "ibrahimsaber@gmail.com", "Software engineer who enjoys explaining things."],
    ["farah_atef", "farahatef@gmail.com", "Architect collecting beautiful corners of the city."],
    ["hesham_atef", "heshamatef@gmail.com", "QA engineer. Details matter."],
    ["reham_essam", "rehamesam@gmail.com", "Law student, podcast listener, sunset chaser."],
    ["ziad_hamdy", "ziadhamdy@gmail.com", "Working on better habits and better software."],
    ["menna_hossam", "mennahossam@gmail.com", "HR specialist and plant parent."],
    ["walid_ramy", "walidramy@gmail.com", "Cycling through Cairo whenever I can."],
    ["doaa_ahmed", "doaaahmed@gmail.com", "Content creator with a love for local cafes."],
    ["sherif_emad", "sherifemad@gmail.com", "Avid reader and practical optimist."],
    ["esraa_ahmed", "esraaahmed@gmail.com", "Frontend developer making interfaces feel simple."],
    ["basma_wael", "basmawael@gmail.com", "Nutritionist, home cook, and sea lover."],
    ["adel_samir", "adelsamir@gmail.com", "Operations manager and early-morning swimmer."]
] as const;

const postMessages = [
    "Finally shipped a feature I have been working on all week. The small wins really add up.",
    "A walk after work fixes more problems than I expect every time.",
    "Today’s reminder: write the test before calling a bug fixed.",
    "Found a lovely little coffee shop with the calmest corner in the city.",
    "Learning to leave room in the schedule for thinking, not only doing.",
    "A good conversation can completely change the direction of a day."
];

type SeedUser = {
    id: string;
    username: string;
    email: string;
};

async function getExistingAuthUsers(): Promise<Map<string, string>> {
    const usersByEmail = new Map<string, string>();

    const { data, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
    });

    if (error) {
        throw new Error(`Failed to list Supabase Auth users: ${error.message}`);
    }

    for (const user of data.users) {
        if (user.email) {
            usersByEmail.set(user.email, user.id);
        }
    }

    return usersByEmail;
}

async function createSeedUsers(): Promise<SeedUser[]> {
    const existingUsers = await getExistingAuthUsers();
    const users: SeedUser[] = [];

    for (const [username, email, bio] of people) {
        let userId = existingUsers.get(email);

        if (!userId) {
            const { data, error } = await supabase.auth.admin.createUser({
                email,
                password: SEED_PASSWORD,
                email_confirm: true,
                user_metadata: {
                    username
                }
            });

            if (error) {
                throw new Error(
                    `Failed to create Auth user ${email}: ${error.message}`
                );
            }

            userId = data.user.id;
            existingUsers.set(email, userId);
        } else {
            const { error } = await supabase.auth.admin.updateUserById(userId, {
                password: SEED_PASSWORD,
                user_metadata: {
                    username
                }
            });

            if (error) {
                throw new Error(
                    `Failed to update Auth user ${email}: ${error.message}`
                );
            }
        }

        /*
         * The on_auth_user_created trigger creates this row for
         * newly-created Auth users.
         *
         * The upsert also makes the seed idempotent for users that
         * already existed before the seed was run.
         */
        const { data: profile, error: profileError } = await supabase
            .from("users")
            .upsert(
                {
                    id: userId,
                    username,
                    email,
                    bio
                },
                {
                    onConflict: "id"
                }
            )
            .select("id, username, email")
            .single();

        if (profileError) {
            throw new Error(
                `Failed to create profile for ${email}: ${profileError.message}`
            );
        }

        users.push(profile);
    }

    return users;
}

async function clearPreviousSeed(): Promise<void> {
    const { data: seededPosts, error: postsError } = await supabase
        .from("posts")
        .select("id")
        .contains("tags", ["seeded"]);

    /*
     * If posts are stored in MongoDB, this query is intentionally
     * not used. MongoDB is handled below.
     */
    void seededPosts;
    void postsError;

    const mongoSeededPosts = await Post.find(
        { tags: "seeded" },
        { _id: 1 }
    ).lean();

    const postIds = mongoSeededPosts.map((post) => post._id.toString());

    if (postIds.length > 0) {
        await Promise.all([
            Comment.deleteMany({
                postId: { $in: postIds }
            }),

            Post.deleteMany({
                _id: { $in: postIds }
            }),

            supabase
                .from("likes")
                .delete()
                .in("post_id", postIds),

            redis.del(
                ...postIds.flatMap((id) => [
                    `post:${id}`,
                    `comment:${id}`
                ])
            )
        ]);
    }

    const { error } = await supabase
        .from("notifications")
        .delete()
        .contains("payload", { seed: true });

    if (error) {
        throw new Error(
            `Failed to clear seeded notifications: ${error.message}`
        );
    }
}

async function seed(): Promise<void> {
    await connectMongo();
    await redis.ping();

    const { error: databaseError } = await supabase
        .from("users")
        .select("id")
        .limit(1);

    if (databaseError) {
        throw new Error(
            `Failed to connect to Supabase: ${databaseError.message}`
        );
    }

    await clearPreviousSeed();

    const users = await createSeedUsers();

    for (let index = 0; index < users.length; index += 1) {
        const follower = users[index]!;
        const following = users[(index + 1) % users.length]!;
        const extraFollowing = users[(index + 7) % users.length]!;

        const { error } = await supabase
            .from("follows")
            .upsert(
                [
                    {
                        follower_id: follower.id,
                        following_id: following.id
                    },
                    {
                        follower_id: follower.id,
                        following_id: extraFollowing.id
                    }
                ],
                {
                    onConflict: "follower_id,following_id",
                    ignoreDuplicates: true
                }
            );

        if (error) {
            throw new Error(
                `Failed to seed follows: ${error.message}`
            );
        }
    }

    const posts: Array<{
        id: string;
        authorId: string;
    }> = [];

    for (let index = 0; index < users.length; index += 1) {
        const author = users[index]!;

        for (let offset = 0; offset < 2; offset += 1) {
            const post = await Post.create({
                authorId: author.id,
                content:
                    postMessages[
                        (index + offset) % postMessages.length
                    ]!,
                tags: [
                    "seeded",
                    offset === 0 ? "daily-life" : "testing"
                ],
                mediaUrls:
                    offset === 0
                        ? [
                              `https://images.example.com/seed/${
                                  index + 1
                              }.jpg`
                          ]
                        : []
            });

            posts.push({
                id: post.id,
                authorId: author.id
            });
        }
    }

    for (let index = 0; index < posts.length; index += 1) {
        const post = posts[index]!;

        const firstCommenter =
            users[(index + 3) % users.length]!;

        const secondCommenter =
            users[(index + 11) % users.length]!;

        await Comment.insertMany([
            {
                postId: post.id,
                authorId: firstCommenter.id,
                content:
                    "This is exactly the kind of update I needed to read today."
            },
            {
                postId: post.id,
                authorId: secondCommenter.id,
                content:
                    "Love this. Keep sharing your progress!"
            }
        ]);

        for (const likerOffset of [2, 9, 16]) {
            const liker =
                users[(index + likerOffset) % users.length]!;

            if (liker.id === post.authorId) {
                continue;
            }

            const { error } = await supabase
                .from("likes")
                .upsert(
                    {
                        user_id: liker.id,
                        post_id: post.id
                    },
                    {
                        onConflict: "user_id,post_id",
                        ignoreDuplicates: true
                    }
                );

            if (error) {
                throw new Error(
                    `Failed to seed like: ${error.message}`
                );
            }
        }
    }

    for (let index = 0; index < users.length; index += 1) {
        const recipient = users[index]!;
        const actor = users[(index + 4) % users.length]!;

        const { error } = await supabase
            .from("notifications")
            .insert({
                user_id: recipient.id,
                type: "follow",
                payload: {
                    seed: true,
                    followerId: actor.id,
                    followerName: actor.username
                },
                is_read: index % 3 === 0
            });

        if (error) {
            throw new Error(
                `Failed to seed notification: ${error.message}`
            );
        }

        await redis.del(
            `user:${recipient.id}`,
            `feed:${recipient.id}`,
            `notifications:${recipient.id}`
        );
    }

    console.log(
        `Seed complete: ${users.length} users, ` +
        `${posts.length} posts, ` +
        `${posts.length * 2} comments, ` +
        `and sample likes/follows/notifications.`
    );

    console.log(
        `All seed accounts use password: ${SEED_PASSWORD}`
    );
}

try {
    await seed();
} finally {
    await Promise.allSettled([
        redis.quit(),
        mongoose.disconnect()
    ]);
}
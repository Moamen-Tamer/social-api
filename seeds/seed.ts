import mongoose from "mongoose";
import { db } from "../src/connections/knex.js";
import { connectMongo } from "../src/connections/mongo.js";
import { redis } from "../src/connections/redis.js";
import Post from "../src/models/post.model.js";
import Comment from "../src/models/comment.model.js";

const passwordHash = "$2a$12$uwi67H2Fkt52TX1j89M4zuMzyHEbWqId2BfRFHmJvbDGOrnys7wfu";

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

type SeedUser = { id: string; username: string; email: string };

async function clearPreviousSeed(): Promise<void> {
    const seededPosts = await Post.find({ tags: "seeded" }, { _id: 1 }).lean();
    const postIds = seededPosts.map((post) => post._id.toString());

    if (postIds.length > 0) {
        await Promise.all([
            Comment.deleteMany({ postId: { $in: postIds } }),
            Post.deleteMany({ _id: { $in: postIds } }),
            db("likes").whereIn("post_id", postIds).del(),
            redis.del(...postIds.flatMap((id) => [`post:${id}`, `comment:${id}`]))
        ]);
    }

    await db("notifications").whereRaw("payload->>'seed' = ?", ["true"]).del();
}

async function seed(): Promise<void> {
    await connectMongo();
    await redis.ping();
    await db.raw("SELECT 1");
    await clearPreviousSeed();

    const users: SeedUser[] = [];
    for (const [username, email, bio] of people) {
        const [user] = await db<SeedUser>("users")
            .insert({ username, email, password_hash: passwordHash, bio })
            .onConflict("email")
            .merge({ username, password_hash: passwordHash, bio })
            .returning(["id", "username", "email"]);
        users.push(user!);
    }

    for (let index = 0; index < users.length; index += 1) {
        const follower = users[index]!;
        const following = users[(index + 1) % users.length]!;
        const extraFollowing = users[(index + 7) % users.length]!;
        await db("follows")
            .insert([
                { follower_id: follower.id, following_id: following.id },
                { follower_id: follower.id, following_id: extraFollowing.id }
            ])
            .onConflict(["follower_id", "following_id"])
            .ignore();
    }

    const posts = [] as Array<{ id: string; authorId: string }>;
    for (let index = 0; index < users.length; index += 1) {
        const author = users[index]!;
        for (let offset = 0; offset < 2; offset += 1) {
            const post = await Post.create({
                authorId: author.id,
                content: postMessages[(index + offset) % postMessages.length]!,
                tags: ["seeded", offset === 0 ? "daily-life" : "testing"],
                mediaUrls: offset === 0 ? [`https://images.example.com/seed/${index + 1}.jpg`] : []
            });
            posts.push({ id: post.id, authorId: author.id });
        }
    }

    for (let index = 0; index < posts.length; index += 1) {
        const post = posts[index]!;
        const firstCommenter = users[(index + 3) % users.length]!;
        const secondCommenter = users[(index + 11) % users.length]!;
        await Comment.insertMany([
            { postId: post.id, authorId: firstCommenter.id, content: "This is exactly the kind of update I needed to read today." },
            { postId: post.id, authorId: secondCommenter.id, content: "Love this. Keep sharing your progress!" }
        ]);

        for (const likerOffset of [2, 9, 16]) {
            const liker = users[(index + likerOffset) % users.length]!;
            if (liker.id !== post.authorId) {
                await db("likes")
                    .insert({ user_id: liker.id, post_id: post.id })
                    .onConflict(["user_id", "post_id"])
                    .ignore();
            }
        }
    }

    for (let index = 0; index < users.length; index += 1) {
        const recipient = users[index]!;
        const actor = users[(index + 4) % users.length]!;
        await db("notifications").insert({
            user_id: recipient.id,
            type: "follow",
            payload: { seed: true, followerId: actor.id, followerName: actor.username },
            is_read: index % 3 === 0
        });
        await redis.del(`user:${recipient.id}`, `feed:${recipient.id}`, `notifications:${recipient.id}`);
    }

    console.log(`Seed complete: ${users.length} users, ${posts.length} posts, ${posts.length * 2} comments, and sample likes/follows/notifications.`);
    console.log("All seed accounts use password: password");
}

try {
    await seed();
} finally {
    await Promise.allSettled([db.destroy(), redis.quit(), mongoose.disconnect()]);
}

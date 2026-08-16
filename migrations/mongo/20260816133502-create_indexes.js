async function ensureIndex(collection, key, options) {
    const indexes = await collection.indexes();

    const exists = indexes.some(index => JSON.stringify(index.key) === JSON.stringify(key));

    if (!exists) await collection.createIndex(key, options);
}

export const up = async (db) => {
    await ensureIndex(
        db.collection("posts"),
        {
            authorId: 1,
            createdAt: -1
        },
        {
            name: "posts_authorId_createdAt"
        }
    );

    await ensureIndex(
        db.collection("comments"),
        {
            postId: 1,
            createdAt: -1
        },
        {
            name: "comments_postId_createdAt"
        }
    );
};

export const down = async (db) => {
    await db.collection("posts").dropIndex("posts_authorId_createdAt");

    await db.collection("comments").dropIndex("comments_postId_createdAt");
};

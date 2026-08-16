export const up = async (db) => {
    const collections = await db
        .listCollections({ name: "posts" })
        .toArray();

    if (collections.length === 0) await db.createCollection("posts");
};

export const down = async (db) => {
    await db.collection("posts").drop();
};

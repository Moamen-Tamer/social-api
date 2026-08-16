export const up = async (db) => {
    const collections = await db
        .listCollections({ name: "comments" })
        .toArray();

    if (collections.length === 0) await db.createCollection("comments");
};

export const down = async (db) => {
    await db.collection("comments").drop();
};

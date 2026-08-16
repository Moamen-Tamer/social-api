import "dotenv/config";

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) throw new Error("Missing required environment variable: MONGO_URI");

const config = {
    mongodb: {
        url: mongoUri,
        options: {}
    },

    migrationsDir: "./migrations/mongo",

    changelogCollectionName: "changelog",

    lockCollectionName: "changelog_lock",

    lockTtl: 0,

    migrationFileExtension: ".js",

    useFileHash: true,

    moduleSystem: "esm"
};

export default config;
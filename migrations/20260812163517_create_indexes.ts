import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable("follows", table => {
        table.index(
            ["following_id"],
            "idx_follows_following"
        );
    });

    await knex.schema.alterTable("likes", table => {
        table.index(
            ["post_id"],
            "idx_likes_post"
        );
    });

    await knex.schema.alterTable("notifications", table => {
        table.index(
            ["user_id", "is_read"],
            "idx_notifications_user"
        );
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable("follows", table => {
        table.dropIndex(
            ["following_id"],
            "idx_follows_following"
        );
    });

    await knex.schema.alterTable("likes", table => {
        table.dropIndex(
            ["post_id"],
            "idx_likes_post"
        );
    });

    await knex.schema.alterTable("notifications", table => {
        table.dropIndex(
            ["user_id", "is_read"],
            "idx_notifications_user"
        );
    });
}


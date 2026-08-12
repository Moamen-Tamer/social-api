import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("follows", table => {
        table.uuid("follower_id")
             .notNullable()
             .references("id")
             .inTable("users")
             .onDelete("CASCADE");

        table.uuid("following_id")
             .notNullable()
             .references("id")
             .inTable("users")
             .onDelete("CASCADE");

        table.timestamp("created_at", { useTz: true })
             .defaultTo(knex.fn.now());

        table.primary(["follower_id", "following_id"]);
        table.check("follower_id != following_id");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("follows");
}


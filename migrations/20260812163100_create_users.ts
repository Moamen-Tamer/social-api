import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw("CREATE EXTENSION IF NOT EXISTS pgcrypto");

    await knex.schema.createTable("users", table => {
        table.uuid("id")
             .primary()
             .defaultTo(knex.raw("gen_random_uuid()"));
        
        table.string("username", 50)
             .unique()
             .notNullable();

        table.string("email", 255)
             .unique()
             .notNullable();

        table.string("password_hash")
             .notNullable();

        table.text("bio");

        table.timestamp("created_at", { useTz: true })
             .defaultTo(knex.fn.now());
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("users");
}


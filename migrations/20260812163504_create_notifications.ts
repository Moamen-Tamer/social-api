import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("notifications", table => {
        table.uuid("id")
             .primary()
             .defaultTo(knex.raw("gen_random_uuid()"));

        table.uuid("user_id")
             .notNullable()
             .references("id")
             .inTable("users")
             .onDelete("CASCADE");

        table.string("type")
             .notNullable();

        table.jsonb("payload");

        table.boolean("is_read");

        table.timestamp("created_at", { useTz: true })
             .defaultTo(knex.fn.now());

        table.check("type IN ('like', 'follow', 'comment')");
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("notifications");
}


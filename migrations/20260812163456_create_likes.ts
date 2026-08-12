import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("likes", table => {
        table.uuid("user_id")
             .notNullable()
             .references("id")
             .inTable("users")
             .onDelete("CASCADE");

        table.text("post_id")
             .notNullable();

        table.timestamp("created_at", { useTz: true })
             .defaultTo(knex.fn.now());
            
        table.primary(["user_id", "post_id"]);
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("likes");
}


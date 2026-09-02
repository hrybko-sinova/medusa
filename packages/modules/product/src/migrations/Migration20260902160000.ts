import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260902160000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'alter table if exists "product" drop constraint if exists "product_status_check";'
    )
    this.addSql(
      "alter table if exists \"product\" add constraint \"product_status_check\" check (\"status\" in ('draft', 'proposed', 'published', 'rejected', 'archived'));"
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `update "product" set "status" = 'draft' where "status" = 'archived';`
    )
    this.addSql(
      'alter table if exists "product" drop constraint if exists "product_status_check";'
    )
    this.addSql(
      "alter table if exists \"product\" add constraint \"product_status_check\" check (\"status\" in ('draft', 'proposed', 'published', 'rejected'));"
    )
  }
}

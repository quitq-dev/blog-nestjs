import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDefaultFieldRefreshTokenUserTable1689151091525 implements MigrationInterface {
    name = 'ChangeDefaultFieldRefreshTokenUserTable1689151091525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refresh_token\` \`refresh_token\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refresh_token\` \`refresh_token\` varchar(255) NOT NULL`);
    }

}

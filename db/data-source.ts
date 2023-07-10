import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
  type: "mysql",
  host: "localhost",
  port: 33061,
  username: "root",
  password: "root",
  database: "blog_nestjs",
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/db/migrations/*.js"],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

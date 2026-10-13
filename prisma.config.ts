import path from "node:path";

const dbUrl = process.env.JN_DATABASE_URL || "file:/home/container/data/app.db";

export default {
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
};

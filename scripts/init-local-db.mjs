import { execSync } from "node:child_process";

function run(command) {
  execSync(command, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });
}

run("npx prisma db push --skip-generate");
run("npx prisma generate");
run("npm run db:seed");

console.log("Initialized the local database with the current Prisma schema and seed data.");

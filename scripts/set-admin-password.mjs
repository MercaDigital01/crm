// Run this yourself (never paste your password into chat): generates the
// ADMIN_USERNAME / ADMIN_PASSWORD_HASH lines to paste into .env.local.
// Usage: node scripts/set-admin-password.mjs
import { createHash, randomBytes, scryptSync } from "crypto";
import readline from "readline";

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer);
  }));
}

// Hides keystrokes on a real TTY; falls back to visible input if piped.
function askHidden(question) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      ask(question).then(resolve);
      return;
    }
    process.stdout.write(question);
    let value = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    const onData = (char) => {
      const code = char.charCodeAt(0);
      if (code === 0x03) process.exit(1); // Ctrl+C
      if (char === "\r" || char === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(value);
        return;
      }
      if (code === 0x7f || code === 0x08) {
        // Backspace / DEL
        value = value.slice(0, -1);
        return;
      }
      value += char;
    };
    process.stdin.on("data", onData);
  });
}

const username = (await ask("Usuario de administrador: ")).trim();
const password = await askHidden("Contraseña: ");
const confirm = await askHidden("Confirma la contraseña: ");

if (password !== confirm) {
  console.error("\nLas contraseñas no coinciden.");
  process.exit(1);
}
if (!username || password.length < 8) {
  console.error("\nUsuario vacío o contraseña muy corta (mínimo 8 caracteres).");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
const sessionSecret = createHash("sha256").update(randomBytes(32)).digest("hex");

console.log("\nAgrega esto a tu .env.local:\n");
console.log(`ADMIN_USERNAME=${username}`);
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`);
console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`);

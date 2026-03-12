import bcrypt from "bcrypt";

const password = process.argv[2];

if (!password) {
  console.error(
    "Por favor, forneça uma senha. Exemplo: npm run generate-hash minhaSenha",
  );
  process.exit(1);
}

const saltRounds = 10;
bcrypt.hash(password, saltRounds, function (err, hash) {
  if (err) {
    console.error("Erro ao gerar hash:", err);
    return;
  }
  console.log("\n=============================================");
  console.log("Senha original:", password);
  console.log("Hash bcrypt:", hash);
  console.log("Copie o hash acima para o arquivo data/user.json");
  console.log("=============================================\n");
});

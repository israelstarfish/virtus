// servidor/index.js <- Inicializador híbrido com geração automática via OpenSSL

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Detecta ambiente
const isProd = process.env.NODE_ENV === 'production';
const serverHost = process.env.SERVER_HOST || 'localhost';

// Caminhos
const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

// 🚀 Inicia o backend
const backend = spawn('go', ['run', 'main.go'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true,
});

// 🚀 Inicia o frontend via server.js (Next.js em HTTP)
const serverJsPath = path.join(frontendPath, 'server.js');
if (fs.existsSync(serverJsPath)) {
  const frontend = spawn('node', ['server.js'], {
    cwd: frontendPath,
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', () => {
    console.log('❌ Erro ao iniciar o frontend via server.js');
  });

  frontend.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Frontend iniciado via server.js');
    }
  });
} else {
  console.log('⚠️ server.js não encontrado no frontend. Certifique-se de que ele existe e está configurado.');
}

// Terminal principal
console.log(`🟢 Servidor principal executado. Virtus Cloud está online em: http://${serverHost}`);

//const { spawn, execSync } = require('child_process');
//const path = require('path');
//const fs = require('fs');
//
//// Detecta ambiente
//const isProd = process.env.NODE_ENV === 'production';
//const serverHost = process.env.SERVER_HOST || 'localhost';
//
//// Caminhos
//const backendPath = path.join(__dirname, 'backend');
//const frontendPath = path.join(__dirname, 'frontend');
//const certPath = path.join(backendPath, 'certs');
//
//// Arquivos de certificado
//const keyFile = path.join(certPath, 'dev.key');
//const certFile = path.join(certPath, 'dev.crt');
//const caFile = path.join(certPath, 'myCA.pem');
//const csrFile = path.join(certPath, 'dev.csr');
//const extFile = path.join(certPath, 'dev.ext');
//const caKeyFile = path.join(certPath, 'myCA.key');
//
//// 🔐 Geração automática com OpenSSL (apenas em desenvolvimento)
//if (!isProd) {
//  fs.mkdirSync(certPath, { recursive: true });
//
//  const keyExists = fs.existsSync(keyFile);
//  const certExists = fs.existsSync(certFile);
//  const caExists = fs.existsSync(caFile);
//
//  if (keyExists && certExists && caExists) {
//    console.log('🔐 Certificados OpenSSL já existentes.');
//  } else {
//    console.log('🔧 Gerando certificados com OpenSSL...');
//
//    try {
//      // Gera CA
//      execSync(`openssl genrsa -out "${caKeyFile}" 2048`);
//      execSync(`openssl req -x509 -new -nodes -key "${caKeyFile}" -sha256 -days 3650 -out "${caFile}" -subj "/C=BR/ST=Ceara/L=Fortaleza/O=VirtusCloud/OU=Dev/CN=VirtusCloud CA"`);
//
//      // Gera chave privada
//      execSync(`openssl genrsa -out "${keyFile}" 2048`);
//
//      // Gera CSR
//      execSync(`openssl req -new -key "${keyFile}" -out "${csrFile}" -subj "/C=BR/ST=Ceara/L=Fortaleza/O=VirtusCloud/OU=Dev/CN=172.30.28.73"`);
//
//      // Cria arquivo de extensão
//      fs.writeFileSync(extFile, `
//authorityKeyIdentifier=keyid,issuer
//basicConstraints=CA:FALSE
//keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
//subjectAltName = @alt_names
//
//[alt_names]
//DNS.1 = 172.30.28.73
//DNS.2 = localhost
//IP.1 = 172.30.28.73
//      `.trim());
//
//      // Assina certificado
//      execSync(`openssl x509 -req -in "${csrFile}" -CA "${caFile}" -CAkey "${caKeyFile}" -CAcreateserial -out "${certFile}" -days 365 -sha256 -extfile "${extFile}"`);
//
//      console.log('✅ Certificados gerados com sucesso via OpenSSL.');
//    } catch (err) {
//      console.error('❌ Erro ao gerar certificados com OpenSSL:', err.message);
//      process.exit(1);
//    }
//  }
//} else {
//  console.log('🚀 Ambiente de produção detectado. Certificados Let\'s Encrypt devem estar previamente configurados.');
//}
//
//// 🚀 Inicia o backend
//const backend = spawn('go', ['run', 'main.go'], {
//  cwd: backendPath,
//  stdio: 'inherit',
//  shell: true,
//});
//
//// 🚀 Inicia o frontend via server.js (Next.js com HTTPS)
//const serverJsPath = path.join(frontendPath, 'server.js');
//if (fs.existsSync(serverJsPath)) {
//  const frontend = spawn('node', ['server.js'], {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  frontend.on('error', () => {
//    console.log('❌ Erro ao iniciar o frontend via server.js');
//  });
//
//  frontend.on('exit', (code) => {
//    if (code === 0) {
//      console.log('✅ Frontend iniciado com HTTPS via server.js');
//    }
//  });
//} else {
//  console.log('⚠️ server.js não encontrado no frontend. Certifique-se de que ele existe e está configurado.');
//}
//// 🚀 Inicia redirecionador HTTP na porta 80
//const redirectorPath = path.join(frontendPath, 'redirect-http.js');
//if (fs.existsSync(redirectorPath)) {
//  const redirector = spawn('node', ['redirect-http.js'], {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  redirector.on('error', () => {
//    console.log('❌ Erro ao iniciar redirecionador HTTP na porta 80');
//  });
//
//  redirector.on('exit', (code) => {
//    if (code === 0) {
//      console.log('✅ Redirecionador HTTP encerrado com sucesso');
//    }
//  });
//} else {
//  console.log('⚠️ redirect-http.js não encontrado no frontend.');
//}
//
//// Terminal principal
//console.log(`🟢 Servidor principal executado. Virtus Cloud está online em: https://${serverHost}`);

// servidor/index.js <- Inicializador híbrido com suporte a OpenSSL

//const { spawn, execSync } = require('child_process');
//const path = require('path');
//const fs = require('fs');
//
//// Detecta ambiente
//const isProd = process.env.NODE_ENV === 'production';
//const serverHost = process.env.SERVER_HOST || 'localhost';
//
//// Caminhos
//const backendPath = path.join(__dirname, 'backend');
//const frontendPath = path.join(__dirname, 'frontend');
//const certPath = path.join(backendPath, 'certs');
//
//// Certificados locais
//const keyFile = path.join(certPath, 'dev.key');
//const certFile = path.join(certPath, 'dev.crt');
//const caFile = path.join(certPath, 'myCA.pem');
//
//// 🔐 Verificação de certificados gerados por OpenSSL
//if (!isProd) {
//  fs.mkdirSync(certPath, { recursive: true });
//
//  const keyExists = fs.existsSync(keyFile);
//  const certExists = fs.existsSync(certFile);
//  const caExists = fs.existsSync(caFile);
//
//  if (keyExists && certExists && caExists) {
//    console.log('🔐 Certificados gerados por OpenSSL detectados.');
//  } else {
//    console.log('⚠️ Certificados OpenSSL não encontrados. Você pode gerar com o script generate-local-cert.sh');
//  }
//} else {
//  console.log('🚀 Ambiente de produção detectado. Certificados Let\'s Encrypt devem estar previamente configurados.');
//}
//
//// 🚀 Inicia o backend
//const backend = spawn('go', ['run', 'main.go'], {
//  cwd: backendPath,
//  stdio: 'inherit',
//  shell: true,
//});
//
//// 🚀 Inicia o frontend via server.js (Next.js com HTTPS)
//const serverJsPath = path.join(frontendPath, 'server.js');
//if (fs.existsSync(serverJsPath)) {
//  const frontend = spawn('node', ['server.js'], {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  frontend.on('error', () => {
//    console.log('❌ Erro ao iniciar o frontend via server.js');
//  });
//
//  frontend.on('exit', (code) => {
//    if (code === 0) {
//      console.log('✅ Frontend iniciado com HTTPS via server.js');
//    }
//  });
//} else {
//  console.log('⚠️ server.js não encontrado no frontend. Certifique-se de que ele existe e está configurado.');
//}
//
//// Terminal principal
//console.log(`🟢 Servidor principal executado. Virtus Cloud está online em: https://${serverHost}`);

// servidor/index.js <- Inicializador híbrido do servidor

//const { spawn, execSync } = require('child_process');
//const path = require('path');
//const fs = require('fs');
//
//// Detecta ambiente
//const isProd = process.env.NODE_ENV === 'production';
//const serverHost = process.env.SERVER_HOST || 'localhost';
//
//// Caminhos
//const backendPath = path.join(__dirname, 'backend');
//const frontendPath = path.join(__dirname, 'frontend');
//const certPath = path.join(backendPath, 'certs');
//
//// Certificados locais (mkcert)
//const keyFile = path.join(certPath, 'dev.key');
//const certFile = path.join(certPath, 'dev.crt');
//
//// 🔐 Geração de certificado local (apenas em desenvolvimento)
//if (!isProd) {
//  fs.mkdirSync(certPath, { recursive: true });
//
//  if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
//    console.log(`🔐 Gerando certificado local com mkcert...`);
//    try {
//      execSync(`mkcert -key-file ${keyFile} -cert-file ${certFile} localhost 172.30.28.73 virtus.local`, {
//        stdio: 'inherit'
//      });
//      console.log(`✅ Certificado local gerado com sucesso.`);
//    } catch (err) {
//      console.error(`❌ Erro ao gerar certificado local:`, err.message);
//    }
//  }
//} else {
//  console.log('🚀 Ambiente de produção detectado. Certificados Let\'s Encrypt devem estar previamente configurados.');
//}
//
//// 🚀 Inicia o backend
//const backend = spawn('go', ['run', 'main.go'], {
//  cwd: backendPath,
//  stdio: 'inherit',
//  shell: true,
//});
//
//// 🚀 Inicia o frontend via server.js (Next.js com HTTPS)
//const serverJsPath = path.join(frontendPath, 'server.js');
//if (fs.existsSync(serverJsPath)) {
//  const frontend = spawn('node', ['server.js'], {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  frontend.on('error', () => {
//    console.log('❌ Erro ao iniciar o frontend via server.js');
//  });
//
//  frontend.on('exit', (code) => {
//    if (code === 0) {
//      console.log('✅ Frontend iniciado com HTTPS via server.js');
//    }
//  });
//} else {
//  console.log('⚠️ server.js não encontrado no frontend. Certifique-se de que ele existe e está configurado.');
//}
//
//// Terminal principal
//console.log(`Servidor principal executado. Virtus Cloud is Online em https://${serverHost}`);

//const { spawn, execSync } = require('child_process');
//const path = require('path');
//const fs = require('fs');
//
//// Host configurado via variável de ambiente ou padrão para localhost
//const serverHost = process.env.SERVER_HOST || 'localhost';
//
//// Caminhos
//const backendPath = path.join(__dirname, 'backend');
//const frontendPath = path.join(__dirname, 'frontend');
//const certPath = path.join(backendPath, 'certs');
//
//// Certificado combinado
//const keyFile = path.join(certPath, 'dev.key');
//const certFile = path.join(certPath, 'dev.crt');
//
//// Gera certificado combinado se não existir
//fs.mkdirSync(certPath, { recursive: true });
//
//if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
//  console.log(`🔐 Gerando certificado combinado com mkcert...`);
//  try {
//    execSync(`mkcert -key-file ${keyFile} -cert-file ${certFile} localhost 172.30.28.73`, { stdio: 'inherit' });
//    console.log(`✅ Certificado combinado gerado com sucesso.`);
//  } catch (err) {
//    console.error(`❌ Erro ao gerar certificado combinado:`, err.message);
//  }
//}

// 🔒 Linhas individuais comentadas para referência futura:
// const certsToGenerate = [
//   { host: 'localhost', key: 'localhost.key', cert: 'localhost.crt' },
//   { host: '172.30.28.73', key: '172.30.28.73.key', cert: '172.30.28.73.crt' }
// ];
// for (const { host, key, cert } of certsToGenerate) {
//   const keyFile = path.join(certPath, key);
//   const certFile = path.join(certPath, cert);
//   if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
//     console.log(`🔐 Gerando certificado para ${host} com mkcert...`);
//     try {
//       execSync(`mkcert -key-file ${keyFile} -cert-file ${certFile} ${host}`, { stdio: 'inherit' });
//       console.log(`✅ Certificado para ${host} gerado com sucesso.`);
//     } catch (err) {
//       console.error(`❌ Erro ao gerar certificado para ${host}:`, err.message);
//     }
//   }
// }

// Inicia o backend
//const backend = spawn('go', ['run', 'main.go'], {
//  cwd: backendPath,
//  stdio: 'inherit',
//  shell: true,
//});
//
//// Inicia o frontend via server.js (Next.js com HTTPS)
//const serverJsPath = path.join(frontendPath, 'server.js');
//if (fs.existsSync(serverJsPath)) {
//  const frontend = spawn('node', ['server.js'], {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  frontend.on('error', () => {
//    console.log('❌ Erro ao iniciar o frontend via server.js');
//  });
//
//  frontend.on('exit', (code) => {
//    if (code === 0) {
//      console.log('✅ Frontend iniciado com HTTPS via server.js');
//    }
//  });
//} else {
//  console.log('⚠️ server.js não encontrado no frontend. Certifique-se de que ele existe e está configurado.');
//}
//
//// Terminal principal
//console.log(`Servidor principal executado. Virtus Cloud is Online em https://${serverHost}`);

//servidor/index.js <- Arquivo inicializador do servidor

//const { spawn, execSync } = require('child_process');
//const path = require('path');
//const fs = require('fs');
//
//// Host configurado via variável de ambiente ou padrão para localhost
//const serverHost = process.env.SERVER_HOST || 'localhost';
//
//// Caminhos
//const backendPath = path.join(__dirname, 'backend');
//const frontendPath = path.join(__dirname, 'frontend');
//const certPath = path.join(backendPath, 'certs');
//
//// Certificados individuais
//const certsToGenerate = [
//  { host: 'localhost', key: 'localhost.key', cert: 'localhost.crt' },
//  { host: '172.30.28.73', key: '172.30.28.73.key', cert: '172.30.28.73.crt' }
//];
//
//// Gera certificados se não existirem
//fs.mkdirSync(certPath, { recursive: true });
//
//for (const { host, key, cert } of certsToGenerate) {
//  const keyFile = path.join(certPath, key);
//  const certFile = path.join(certPath, cert);
//
//  if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
//    console.log(`🔐 Gerando certificado para ${host} com mkcert...`);
//    try {
//      execSync(`mkcert -key-file ${keyFile} -cert-file ${certFile} ${host}`, { stdio: 'inherit' });
//      console.log(`✅ Certificado para ${host} gerado com sucesso.`);
//    } catch (err) {
//      console.error(`❌ Erro ao gerar certificado para ${host}:`, err.message);
//    }
//  }
//}
//
//// 🔒 Linha combinada para uso futuro:
//// mkcert -key-file backend/certs/dev.key -cert-file backend/certs/dev.crt localhost 172.30.28.73
//
//// Inicia o backend
//const backend = spawn('go', ['run', 'main.go'], {
//  cwd: backendPath,
//  stdio: 'inherit',
//  shell: true,
//});
//
//// Inicia o frontend (tenta os três comandos)
//const tryFrontendCommands = ['npm run dev', 'npm run build', 'npm start'];
//let frontendStarted = false;
//
//for (const cmd of tryFrontendCommands) {
//  const [command, ...args] = cmd.split(' ');
//  const frontend = spawn(command, args, {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  frontend.on('error', () => {
//    console.log(`Erro ao tentar: ${cmd}`);
//  });
//
//  frontend.on('exit', (code) => {
//    if (code === 0 && !frontendStarted) {
//      frontendStarted = true;
//      console.log(`Client-Side iniciado com: ${cmd}`);
//    }
//  });
//
//  if (frontendStarted) break;
//}
//
//// Terminal principal
//console.log(`Servidor principal executado. Virtus Cloud is Online em https://${serverHost}`);

//const { spawn, execSync } = require('child_process');
//const path = require('path');
//const fs = require('fs');
//
//// Host configurado via variável de ambiente ou padrão para localhost
//const serverHost = process.env.SERVER_HOST || 'localhost';
//
//// Caminhos
//const backendPath = path.join(__dirname, 'backend');
//const frontendPath = path.join(__dirname, 'frontend');
//const certPath = path.join(backendPath, 'certs');
//
//// Certificados individuais
//const certsToGenerate = [
//  { host: 'localhost', key: 'localhost.key', cert: 'localhost.crt' },
//  { host: '172.30.28.73', key: '172.30.28.73.key', cert: '172.30.28.73.crt' }
//];
//
//// Gera certificados se não existirem
//fs.mkdirSync(certPath, { recursive: true });
//
//for (const { host, key, cert } of certsToGenerate) {
//  const keyFile = path.join(certPath, key);
//  const certFile = path.join(certPath, cert);
//
//  if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
//    console.log(`🔐 Gerando certificado para ${host} com mkcert...`);
//    try {
//      execSync(`mkcert -key-file ${keyFile} -cert-file ${certFile} ${host}`, { stdio: 'inherit' });
//      console.log(`✅ Certificado para ${host} gerado com sucesso.`);
//    } catch (err) {
//      console.error(`❌ Erro ao gerar certificado para ${host}:`, err.message);
//    }
//  }
//}
//
//// 🔒 Linha combinada para uso futuro:
//// mkcert -key-file backend/certs/dev.key -cert-file backend/certs/dev.crt localhost 172.30.28.73
//
//// Inicia o backend
//const backend = spawn('go', ['run', 'main.go'], {
//  cwd: backendPath,
//  stdio: 'inherit',
//  shell: true,
//});
//
//// Inicia o frontend via server.js (Next.js com HTTPS)
//const serverJsPath = path.join(frontendPath, 'server.js');
//if (fs.existsSync(serverJsPath)) {
//  const frontend = spawn('node', ['server.js'], {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  frontend.on('error', () => {
//    console.log('❌ Erro ao iniciar o frontend via server.js');
//  });
//
//  frontend.on('exit', (code) => {
//    if (code === 0) {
//      console.log('✅ Frontend iniciado com HTTPS via server.js');
//    }
//  });
//} else {
//  console.log('⚠️ server.js não encontrado no frontend. Certifique-se de que ele existe e está configurado.');
//}
//
//// Terminal principal
//console.log(`Servidor principal executado. Virtus Cloud is Online em https://${serverHost}`);

//const { spawn, execSync } = require('child_process');
//const path = require('path');
//const fs = require('fs');
//
//// Host configurado via variável de ambiente ou padrão para localhost
//const serverHost = process.env.SERVER_HOST || 'localhost';
//
//// Caminhos
//const backendPath = path.join(__dirname, 'backend');
//const frontendPath = path.join(__dirname, 'frontend');
//const certPath = path.join(backendPath, 'certs');
//
//// Certificados individuais
//const certsToGenerate = [
//  { host: 'localhost', key: 'localhost.key', cert: 'localhost.crt' },
//  { host: '172.30.28.73', key: '172.30.28.73.key', cert: '172.30.28.73.crt' }
//];
//
//// Gera certificados se não existirem
//fs.mkdirSync(certPath, { recursive: true });
//
//for (const { host, key, cert } of certsToGenerate) {
//  const keyFile = path.join(certPath, key);
//  const certFile = path.join(certPath, cert);
//
//  if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
//    console.log(`🔐 Gerando certificado para ${host} com mkcert...`);
//    try {
//      execSync(`mkcert -key-file ${keyFile} -cert-file ${certFile} ${host}`, { stdio: 'inherit' });
//      console.log(`✅ Certificado para ${host} gerado com sucesso.`);
//    } catch (err) {
//      console.error(`❌ Erro ao gerar certificado para ${host}:`, err.message);
//    }
//  }
//}
//
//// 🔒 Linha combinada para uso futuro:
//// mkcert -key-file backend/certs/dev.key -cert-file backend/certs/dev.crt localhost 172.30.28.73
//
//// Inicia o backend
//const backend = spawn('go', ['run', 'main.go'], {
//  cwd: backendPath,
//  stdio: 'inherit',
//  shell: true,
//});
//
//// Inicia o frontend (tenta os três comandos)
//const tryFrontendCommands = ['npm run dev', 'npm run build', 'npm start'];
//let frontendStarted = false;
//
//for (const cmd of tryFrontendCommands) {
//  const [command, ...args] = cmd.split(' ');
//  const frontend = spawn(command, args, {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  frontend.on('error', () => {
//    console.log(`Erro ao tentar: ${cmd}`);
//  });
//
//  frontend.on('exit', (code) => {
//    if (code === 0 && !frontendStarted) {
//      frontendStarted = true;
//      console.log(`Client-Side iniciado com: ${cmd}`);
//    }
//  });
//
//  if (frontendStarted) break;
//}
//
//// Terminal principal
//console.log(`Servidor principal executado. Virtus Cloud is Online em https://${serverHost}`);

//servidor/index.js <- Arquivo inicializador do servidor

//const { spawn, execSync } = require('child_process');
//const path = require('path');
//const fs = require('fs');
//
//// Host configurado via variável de ambiente ou padrão para localhost
//const serverHost = process.env.SERVER_HOST || 'localhost';
//
//// Caminhos
//const backendPath = path.join(__dirname, 'backend');
//const frontendPath = path.join(__dirname, 'frontend');
//const certPath = path.join(backendPath, 'certs');
//const keyFile = path.join(certPath, `${serverHost}.key`);
//const certFile = path.join(certPath, `${serverHost}.crt`);
//
//// Gera certificado se não existir
//if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
//  console.log(`🔐 Gerando certificado para ${serverHost} com mkcert...`);
//  fs.mkdirSync(certPath, { recursive: true });
//
//  try {
//    execSync(`mkcert -key-file ${keyFile} -cert-file ${certFile} ${serverHost}`, { stdio: 'inherit' });
//    console.log('✅ Certificado gerado com sucesso.');
//  } catch (err) {
//    console.error('❌ Erro ao gerar certificado com mkcert:', err.message);
//  }
//}
//
//// Inicia o backend
//const backend = spawn('go', ['run', 'main.go'], {
//  cwd: backendPath,
//  stdio: 'inherit',
//  shell: true,
//});
//
//// Inicia o frontend (tenta os três comandos)
//const tryFrontendCommands = ['npm run dev', 'npm run build', 'npm start'];
//let frontendStarted = false;
//
//for (const cmd of tryFrontendCommands) {
//  const [command, ...args] = cmd.split(' ');
//  const frontend = spawn(command, args, {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  frontend.on('error', () => {
//    console.log(`Erro ao tentar: ${cmd}`);
//  });
//
//  frontend.on('exit', (code) => {
//    if (code === 0 && !frontendStarted) {
//      frontendStarted = true;
//      console.log(`Client-Side iniciado com: ${cmd}`);
//    }
//  });
//
//  if (frontendStarted) break;
//}
//
//// Terminal principal
//console.log(`Servidor principal executado. Virtus Cloud is Online em https://${serverHost}`);

//const { spawn, execSync } = require('child_process');
//const path = require('path');
//const fs = require('fs');
//
//// Caminhos
//const backendPath = path.join(__dirname, 'backend');
//const frontendPath = path.join(__dirname, 'frontend');
//const certPath = path.join(backendPath, 'certs');
//const keyFile = path.join(certPath, 'localhost.key');
//const certFile = path.join(certPath, 'localhost.crt');
//
//// Gera certificado se não existir
//if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
//  console.log('🔐 Gerando certificado com mkcert...');
//  fs.mkdirSync(certPath, { recursive: true });
//
//  try {
//    execSync(`mkcert -key-file ${keyFile} -cert-file ${certFile} localhost`, { stdio: 'inherit' });
//    console.log('✅ Certificado gerado com sucesso.');
//  } catch (err) {
//    console.error('❌ Erro ao gerar certificado com mkcert:', err.message);
//  }
//}
//
//// Inicia o backend
//const backend = spawn('go', ['run', 'main.go'], {
//  cwd: backendPath,
//  stdio: 'inherit',
//  shell: true,
//});
//
//// Inicia o frontend (tenta os três comandos)
//const tryFrontendCommands = ['npm run dev', 'npm run build', 'npm start'];
//let frontendStarted = false;
//
//for (const cmd of tryFrontendCommands) {
//  const [command, ...args] = cmd.split(' ');
//  const frontend = spawn(command, args, {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  frontend.on('error', () => {
//    console.log(`Erro ao tentar: ${cmd}`);
//  });
//
//  frontend.on('exit', (code) => {
//    if (code === 0 && !frontendStarted) {
//      frontendStarted = true;
//      console.log(`Client-Side iniciado com: ${cmd}`);
//    }
//  });
//
//  if (frontendStarted) break;
//}
//
//// Terminal principal
//console.log('Servidor principal executado. Virtus Cloud is Online.');

//const { spawn } = require('child_process');
//const path = require('path');
//
//// Caminhos
//const backendPath = path.join(__dirname, 'backend');
//const frontendPath = path.join(__dirname, 'frontend');
//
//// Inicia o backend
//const backend = spawn('go', ['run', 'main.go'], {
//  cwd: backendPath,
//  stdio: 'inherit',
//  shell: true,
//});
//
//// Inicia o frontend (tenta os três comandos)
//const tryFrontendCommands = ['npm run dev', 'npm run build', 'npm start'];
//let frontendStarted = false;
//
//for (const cmd of tryFrontendCommands) {
//  const [command, ...args] = cmd.split(' ');
//  const frontend = spawn(command, args, {
//    cwd: frontendPath,
//    stdio: 'inherit',
//    shell: true
//  });
//
//  frontend.on('error', () => {
//    console.log(`Erro ao tentar: ${cmd}`);
//  });
//
//  frontend.on('exit', (code) => {
//    if (code === 0 && !frontendStarted) {
//      frontendStarted = true;
//      console.log(`Client-Side iniciado com: ${cmd}`);
//    }
//  });
//
//  if (frontendStarted) break;
//}
//
//// Terminal principal
//console.log('Servidor principal executado. Virtus Cloud is Online.');
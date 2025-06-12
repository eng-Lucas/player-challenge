# player-challenge

## Descrição

Projeto desenvolvido como parte do processo seletivo da empresa 4YouSee(Eletromidia), visando atender os requisitos funcionais, técnicos e bônus que foram propostos:
https://bitbucket.org/4yousee/4yousee-player-challenge/src/main/

**Player Challenge** é uma aplicação desktop feita com Electron para reproduzir vídeos em sequência a partir de uma playlist JSON local. Ela oferece transições suaves, fallback automático em caso de erro de reprodução, e uma camada opcional de diagnóstico de sistema.

## Funcionalidades

- Reprodução contínua de vídeos a partir de um arquivo `playlist.json`
- Pré-carregamento e transição suave entre vídeos
- Watchdog para detectar travamentos e pular vídeos com falha
- Diagnóstico opcional do ambiente (SO, memória, etc.)
- Empacotamento para Windows, Linux e macOS

---


## Requisitos

- Node.js (versão 18 ou superior recomendada)
- npm (gerenciador de pacotes do Node.js)

---

## Como executar o projeto

1. **Clone o repositório:**

```bash
git clone https://github.com/eng-Lucas/player-challenge.git
cd player-challenge
```

1. **Instale as dependências:**

```bash
npm install
```

2. **Inicie a aplicação em modo de desenvolvimento:**

```bash
npm start
```

## Build

- Build sem especificar o sistema (só será feito o build para o OS atual):

```bash
npm run build
```
- Build para Windows:

```bash
npm run build:win
```

- Build para Linux:
  
```bash
npm run build:linux
```

- Build para macOS:

```bash
npm run build:mac
```

Os executáveis serão gerados na pasta `release/.`

---

## Testes unitários

Foram implementados testes com `jest` para algumas classes. Para testar, execute:

```bash
npm run test
```

---

## Diretório do app

A aplicação armazena automaticamente os arquivos de log e o cache dos vídeos em uma pasta específica do sistema operacional, dentro do diretório de dados da aplicação:

- Windows
`C:\Users\<seu-usuário>\AppData\Local\player-challenge`

- Linux
`/home/<seu-usuário>/.config/player-challenge`

- macOS
`/Users/<seu-usuário>/Library/Application Support/player-challenge`

---

## Logs e Diagnóstico

O log será salvo no arquivo definido pela variável LOG_FILENAME no diretório base.

Logs de debug só são exibidos se LOG_DEBUG estiver como true.

Ao iniciar, se DIAGNOSTICS_ENABLED_ON_START estiver como true, uma sobreposição de diagnóstico do sistema será exibida.

Você também pode ativar/desativar manualmente o diagnóstico pressionando F2 durante a execução.


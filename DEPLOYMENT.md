# Server Hosting

Recommended setup: a small Linux VPS, Node.js 22, and systemd keeping the bot
online.

## Before Moving

- Run `npm run preflight` locally and fix any failures.
- Stop the local bot before copying `database.db`.
- Back up `database.db` before moving it.
- Do not delete `database.db` to pick up new features. Missing tables are
  created by the schema/migration path when the bot starts or preflight runs.
- Copy these private files to the server by hand:
  - `.env`
  - `database.db`
- Do not commit `.env`, `database.db`, `node_modules`, or `backups`.
- Rotate the Discord bot token before final hosting.

Current schema-backed systems include daily quests, achievements, pregnancy,
relationships, Spank Dilli, Daily WYR, activity Moments, and profile likes.

## Install On Ubuntu/Debian

```bash
sudo apt update
sudo apt install -y git build-essential python3 pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

Install Node.js 22, then clone the repo and install packages:

```bash
git clone <repo-url> /opt/mpc-maid
cd /opt/mpc-maid
npm install
```

Create `/opt/mpc-maid/.env` from `.env.example`, then copy the live
`database.db` into `/opt/mpc-maid/database.db`.

Test once in the foreground:

```bash
npm run preflight
npm start
```

Preflight should pass before the service is enabled. It validates commands,
JSON data, GIF pools, scene titles, Daily WYR questions, and the database
schema.

## systemd Service

Create `/etc/systemd/system/mpc-maid.service`:

```ini
[Unit]
Description=MPC Maid Discord Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/opt/mpc-maid
Environment=NODE_ENV=production
Environment=MPC_PROCESS_MANAGER=systemd
ExecStart=/usr/bin/node /opt/mpc-maid/index.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/mpc-maid.log
StandardError=append:/var/log/mpc-maid.err.log

[Install]
WantedBy=multi-user.target
```

Enable and start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mpc-maid
sudo systemctl status mpc-maid
```

View logs:

```bash
sudo journalctl -u mpc-maid -f
```

## Updating

```bash
cd /opt/mpc-maid
git pull
npm install
npm run preflight
sudo systemctl restart mpc-maid
```

`/botcontrol restart` is safe under systemd because
`MPC_PROCESS_MANAGER=systemd` tells the bot to let systemd restart it instead of
spawning a second copy.

## Backups

Back up `database.db` before updates and before moving hosts. The bot also keeps
its own `backups/` folder locally, but a server-level backup is still the safer
copy.

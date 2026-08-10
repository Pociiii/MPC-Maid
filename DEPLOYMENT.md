# Server Hosting

Recommended setup: a small Linux VPS, Node.js 22, and systemd keeping the bot
online.

## Before Moving

- Run `npm run preflight:nodb` locally and fix non-database failures while the
  bot can stay online on your PC.
- Stop the local bot before copying `database.db`.
- Back up `database.db` before moving it.
- Run the full `npm run preflight` only after the live database is ready to move
  or already copied into place.
- Do not delete `database.db` to pick up new features. Missing tables are
  created by the schema/migration path when the bot starts or preflight runs.
- Copy these private files to the server by hand:
  - `.env`
  - `database.db`
- Set `MPC_DATA_DIR` in `.env` to an absolute persistent folder outside the
  repo, for example `/opt/mpc-maid-data`.
- Do not commit `.env`, `database.db`, `node_modules`, or `backups`.
- Rotate the Discord bot token before final hosting.

Current schema-backed systems include daily quests, achievements, pregnancy,
relationships, Daily WYR, activity Moments, and profile likes.

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

Create `/opt/mpc-maid/.env` from `.env.example`, set
`MPC_DATA_DIR=/opt/mpc-maid-data`, then copy the live `database.db` into
`/opt/mpc-maid/database.db`.

The bot seeds missing GIF files from repo `data/` into `MPC_DATA_DIR` on
startup. Existing runtime files are never overwritten, so GIFs added through
Discord survive `git pull` updates.

Test once in the foreground:

```bash
npm run preflight:nodb
npm run preflight
npm start
```

The no-database preflight can run before the live database move. The full
preflight should pass before the service is enabled; it validates commands, JSON
data, GIF pools, scene titles, Daily WYR questions, and the database schema.

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

Back up the persistent `MPC_DATA_DIR` folder too. It contains live GIF pools
added or changed through Discord.

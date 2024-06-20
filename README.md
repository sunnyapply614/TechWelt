# Social Experience App

## Tech needed to install

- NodeJS

## Pre-requisite (need to signup for these accounts and setup API keys)

- Twilio
- AWS EC2
- AWS S3

## Setup

1. Copy `.envsample` and Paste as `.env`
2. Set all the needed fields in `.env` file

## Installation Dependencies

```sh
npm install
```

## Run MongoDB Server (run in 1st terminal/cmd)

```sh
docker-compose --env-file .env up --build
```

## Run App (run in 2nd terminal/cmd)

```sh
npm run start
```

tmux new -s Backend
tmux attach-session -t Backend

tmux new -s Tel
tmux attach-session -t Tel

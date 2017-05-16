# NATS + Docker + Websockets + React example

- a NATS server with a websocket tcp relay server proxy
- a create-react-app that pub / subs from the proxy

## Requirements

- Docker + Docker Compose

## Running

- `docker-compose up` to spin up the websocket backend
- `cd frontend; yarn start` to spin up the React frontend

^ assumes `dockerhost` points to your `docker-machine ip`

# NATS + Docker + Websockets + React example

- [NATS server](http://nats.io/) with a [websocket tcp relay](https://github.com/isobit/ws-tcp-relay) proxy
- [create-react-app](https://github.com/facebookincubator/create-react-app) demo that pub / subs from the proxy

## Requirements

- Docker + Docker Compose

## Running

- `docker-compose up` to spin up the websocket backend
- `cd frontend; yarn start` to spin up the React frontend

\* assumes `dockerhost` points to your `docker-machine ip`. if not, then update
`frontend/package.json` and override the `REACT_APP_NATS_HOST` value

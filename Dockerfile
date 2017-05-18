FROM formalibre/ws-tcp-relay

CMD /go/bin/ws-tcp-relay nats:4222 -p 4223

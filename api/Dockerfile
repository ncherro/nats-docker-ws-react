FROM golang:1.6.2

COPY . /go

RUN go get github.com/nats-io/nats
RUN go build api-server.go

EXPOSE 8080
ENTRYPOINT ["/go/api-server"]

package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/nats-io/nats"
)

func healthz(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "OK")
}

func main() {
	uri := os.Getenv("NATS_URI")
	var err error
	var nc *nats.Conn

	for i := 0; i < 5; i++ {
		nc, err = nats.Connect(uri)
		if err == nil {
			break
		}

		fmt.Println("Waiting before connecting to NATS at:", uri)
		time.Sleep(1 * time.Second)
	}
	if err != nil {
		log.Fatal("Error establishing connection to NATS:", err)
	}
	fmt.Println("Connected to NATS at:", nc.ConnectedUrl())
	nc.Subscribe("tasks", func(m *nats.Msg) {
		fmt.Println("Got task request on:", m.Subject)
		nc.Publish(m.Reply, []byte("Done!"))
	})

	fmt.Println("Worker subscribed to 'tasks' for processing requests...")
	fmt.Println("Server listening on port 8181...")

	http.HandleFunc("/healthz", healthz)
	if err := http.ListenAndServe(":8181", nil); err != nil {
		log.Fatal(err)
	}
}

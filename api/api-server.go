package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/nats-io/nats"
)

type server struct {
	nc *nats.Conn
}

func (s server) baseRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Basic NATS based microservice example v0.0.1")
}

func (s server) createTask(w http.ResponseWriter, r *http.Request) {
	requestAt := time.Now()
	response, err := s.nc.Request("tasks", []byte("help please"), 5*time.Second)
	if err != nil {
		log.Println("Error making NATS request:", err)
	}
	duration := time.Since(requestAt)

	fmt.Fprintf(w, "Task scheduled in %+v\nResponse: %v\n", duration, string(response.Data))
}

func (s server) healthz(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "OK")
}

func main() {
	var s server
	var err error
	uri := os.Getenv("NATS_URI")

	for i := 0; i < 5; i++ {
		nc, err := nats.Connect(uri)
		if err == nil {
			s.nc = nc
			break
		}

		fmt.Println("Waiting before connecting to NATS at:", uri)
		time.Sleep(1 * time.Second)
	}
	if err != nil {
		log.Fatal("Error establishing connection to NATS:", err)
	}

	fmt.Println("Connected to NATS at:", s.nc.ConnectedUrl())
	http.HandleFunc("/", s.baseRoot)
	http.HandleFunc("/createTask", s.createTask)
	http.HandleFunc("/healthz", s.healthz)

	fmt.Println("Server listening on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

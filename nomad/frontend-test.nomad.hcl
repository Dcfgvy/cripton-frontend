job "frontend-test" {
  datacenters = ["dc1"]
  type = "service"

  group "frontend" {
    count = 1

    network {
      port "http" {
        to = 4000
      }
    }

    service {
      name = "frontend-test"
      port = "http"  // References the "http" port from the network stanza
      tags = ["test", "frontend"]
    }

    task "frontend" {
      driver = "docker"
      
      config {
        image = "dcfgvy/cripton-frontend:${NOMAD_META_VERSION}"
        ports = ["http"]  // This tells Nomad to map the Docker container to the "http" port
      }

      env {
      }

      resources {
        cpu    = 100
        memory = 256
      }
    }
  }
}
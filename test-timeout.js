const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1OGY0YzIyNy02YjM0LTQ2NDctYTczOC0zZTdmYjIyMTQxNDciLCJvcmciOiI1YWFhOTQyYS0zZjJlLTQ3N2EtOWE2My1lNTAwOTU3ZTQ0MmYiLCJyb2xlIjoib3duZXIiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzg4MjUxMzU1LCJleHAiOjE3ODgyNTQ5NTV9.Ge3eFDKzl9VLAy3kRv0Ee-BPr28eT-T4LkS4SAPBhio";

fetch("http://localhost/api/v1/jobs", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    type: "docker",
    priority: "normal",
    workloadId: "timeout-demo"
  })
}).then(r => r.json()).then(console.log);

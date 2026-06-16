import React, { useEffect, useState } from "react";

export default function InstitutionRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/platform-admin/institution-requests")
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Institution Requests
      </h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Institution</th>
            <th>Code</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((r) => (
            <tr key={r.request_id}>
              <td>{r.institution_name}</td>
              <td>{r.institution_code}</td>
              <td>{r.contact_person}</td>
              <td>{r.email}</td>
              <td>{r.status}</td>
            </tr>



          ))}

          
        </tbody>
                            <th>Action</th>
                    <td>
                        <button>
                            Approve
                        </button>
                    </td>
                    <td>
                        <button>
                            Reject
                        </button>
                    </td>

      </table>
    </div>
  );
}
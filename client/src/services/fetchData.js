// function fetchData(model) {
//   const url = "http://localhost:3000/";
  

//   // Sort data based on the model type in alphabetical order.
//   function sortData(data, model) {
//     if (model !== "subjects") {
//       return data.sort((a, b) => a.firstName.localeCompare(b.firstName));
//     } else if (model === "subjects") {
//       return data.sort((a, b) => a.name.localeCompare(b.name));
//     }
//   }

//   // Fetch data from the server and apply filtering and sorting.
//   return fetch(`${url}${model}`)
//     .then((res) => res.json())
//     .then((data) => {
//       return sortData(data, model);
//     })
//     .catch((error) => {
//       console.error("Error fetching data:", error);
//       throw error;
//     });
// }

// export default fetchData;

// const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";

// export default async function fetchData(endpoint) {
//   const res = await fetch(`${API_BASE}/${endpoint}`, {
//     credentials: "include",            // keep this if you rely on sessions
//     headers: { "Content-Type": "application/json" },
//   });
//   if (!res.ok) {
//     const txt = await res.text();
//     throw new Error(`HTTP ${res.status} ${txt}`);
//   }
//   return res.json();
// }

// import { API_BASE } from "../config";

// export default function fetchData(model) {
//   return fetch(`${API_BASE}/${model}`, { credentials: "include" })
//     .then(r => {
//       if (!r.ok) throw new Error(`HTTP ${r.status}`);
//       return r.json();
//     });
// }


const API_BASE =
  (process.env.REACT_APP_API_BASE || "").replace(/\/+$/, "");

export default async function fetchData(endpoint, options = {}) {
  if (!API_BASE) {
    throw new Error("REACT_APP_API_BASE is not set");
  }

  const url = `${API_BASE}/${endpoint.replace(/^\/+/, "")}`;

  const res = await fetch(url, {
    // include credentials only if you actually need cookies/sessions cross-origin
    credentials: "include",
    headers: { "Accept": "application/json" },
    ...options,
  });

  // Network/CORS failures never reach here; they throw above.
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} at ${url} – ${text.slice(0, 200)}`);
  }

  try {
    return await res.json();
  } catch (e) {
    const text = await res.text().catch(() => "");
    throw new Error(`JSON parse failed at ${url}. Body: ${text.slice(0, 200)}`);
  }
}

import API_URL from "./apiBase.js";
// Fetch data from the server based on the model type (students, teachers, subjects).

async function fetchData(model) {
  const url = `${API_URL}/${model}`;

  // Sort data based on the model type in alphabetical order.
  function sortData(data, model) {
    if (model !== "subjects") {
      return data.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (model === "subjects") {
      return data.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  // Fetch data from the server and apply filtering and sorting.
  return await fetch(url, {
    credentials: "include", // Include cookies for session authentication
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      return sortData(data, model);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export default fetchData;

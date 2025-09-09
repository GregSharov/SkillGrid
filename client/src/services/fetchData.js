import API_URL from "./apiBase.js";
// Fetch data from the server based on the model type (students, teachers, subjects).

function fetchData(model) {
  const url = `${API_URL}/api/${model}`;

  // Sort data based on the model type in alphabetical order.
  function sortData(data, model) {
    if (model !== "subjects") {
      return data.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (model === "subjects") {
      return data.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  // Fetch data from the server and apply filtering and sorting.
  return fetch(url, {
    credentials: "include", // Include cookies for session authentication
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

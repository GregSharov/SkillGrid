import filterData from "./filterData.js";

function fetchData(model, filterTerm = null) {
  const url = "http://localhost:3000/";

  // Sort data based on the model type in alphabetical order.
  function sortData(data, model) {
    if (model !== "subjects") {
      return data.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (model === "subjects") {
      return data.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  // Fetch data from the server and apply filtering and sorting.
  return fetch(`${url}${model}`)
    .then((res) => res.json())
    .then((data) => {
      const filteredData = filterData(data, filterTerm);
      return sortData(filteredData, model);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export default fetchData;

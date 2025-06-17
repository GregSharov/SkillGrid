function fetchData(model, filterTerm = null) {
  const url = "http://localhost:3000/";

  // Search data by filter term using recursion subfunction to be able to search nested databases.
  function searchData(object, filterTerm) {

    // recursion function.
    function recursion(item) {
      if (typeof item === "string") {
        return item.includes(filterTerm);
      } else if (Array.isArray(item)) {
        return item.some(recursion);
      } else if (typeof item === "object" && item !== null) {
        return Object.values(item).some(recursion);
      }
      return false;
    }
    return recursion(object);
  }

  // Filter data based on the search term.
  function filterSearchedData(data, filterTerm) {
    if (!filterTerm) {
      return data;
    }
    return data.filter((item) => item && searchData(item, filterTerm));
  }

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
      const filteredData = filterSearchedData(data, filterTerm);
      return sortData(filteredData, model);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export default fetchData;

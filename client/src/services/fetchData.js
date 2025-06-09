function fetchData(model, filterById) {
  const url = "http://localhost:3000/";

  function filterData(data, filterById = null) {
    if (filterById === null) {
      return data;
    }
    return data.filter((item) => Object.values(item).includes(filterById));
  }

  return fetch(`${url}${model}`)
    .then((res) => res.json())
    .then((data) => {
      const filteredData = filterData(data, filterById);

      if (model !== "subjects") {
        return filteredData.sort((a, b) => a.firstName.localeCompare(b.firstName));
      } else if (model === "subjects") {
        return filteredData.sort((a, b) => a.name.localeCompare(b.name));
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export default fetchData;

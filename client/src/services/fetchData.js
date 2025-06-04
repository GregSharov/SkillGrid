function fetchData(model) {
  const url = "http://localhost:3000/";

  return fetch(`${url}${model}`)
    .then((res) => res.json())
    .then((data) => {
      if (model !== "subjects") {
        return data.sort((a, b) => a.firstName.localeCompare(b.firstName));
      } else if (model === "subjects") {
        return data.sort((a, b) => a.name.localeCompare(b.name));
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export default fetchData;

function fetchData(model, filterById) {
  const url = "http://localhost:3000/";
  console.log("CHECK: ", filterById);

  function deepSearch(obj, searchTerm) {
    const term = searchTerm.toLowerCase();

    function recurse(value) {
      if (typeof value === "string") {
        return value.toLowerCase().includes(term);
      } else if (typeof value === "number") {
        return value.toString().includes(term);
      } else if (Array.isArray(value)) {
        return value.some(recurse);
      } else if (typeof value === "object" && value !== null) {
        return Object.values(value).some(recurse);
      }
      return false;
    }

    return recurse(obj);
  }

  function filterData(data, filterById = null) {
    if (!filterById) return data;
    return data.filter((item) => deepSearch(item, filterById));
  }

  return fetch(`${url}${model}`)
    .then((res) => res.json())
    .then((data) => {
      const filteredData = filterData(data, filterById);

      if (model !== "subjects") {
        return filteredData.sort((a, b) =>
          a.firstName?.localeCompare(b.firstName)
        );
      } else {
        return filteredData.sort((a, b) => a.name?.localeCompare(b.name));
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

export default fetchData;

// function fetchData(model, filterById) {
//   const url = "http://localhost:3000/";
//   console.log("CHECK: ", filterById);

//   function filterData(data, filterById = null) {
//     if (filterById === null) {
//       return data;
//     }
//     return data.filter((item) => Object.values(item).includes(filterById));
//   }

//   return fetch(`${url}${model}`)
//     .then((res) => res.json())
//     .then((data) => {
//       const filteredData = filterData(data, filterById);

//       if (model !== "subjects") {
//         return filteredData.sort((a, b) => a.firstName.localeCompare(b.firstName));
//       } else if (model === "subjects") {
//         return filteredData.sort((a, b) => a.name.localeCompare(b.name));
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching data:", error);
//       throw error;
//     });
// }

// export default fetchData;

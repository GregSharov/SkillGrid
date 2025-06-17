// Filter data based on the search term.
function filterData(data, filterTerm) {
  if (!filterTerm) {
    return data;
  }
  return data.filter((item) => item && searchData(item, filterTerm));
}

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

export default filterData;

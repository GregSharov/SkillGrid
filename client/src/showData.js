import { useState, useEffect } from "react";

// Show data to main page
function ShowData() {
    const [userData, setUserData] = useState([]);
    const url = 'http://localhost:3000/';

    function fetchData() {
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const sortedData = data.flatMap(item => item.firstNames.map(firstName => ({
                    student: item.firstName
                }))).sort((a, b) => a.firstName - b.firstName);

                setUserData(sortedData);
            })
            .catch(err => console.log('Error fetching data', err));
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            {userData}
        </div>
    )
}

export default ShowData;
import { useState, useEffect } from "react";

// Show data to main page
function ShowData() {
    const [userData, setUserData] = useState([]);
    const url = 'http://localhost:3000/';

    useEffect(() => {
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const sortedData = data.sort((a, b) => a.firstName.localeCompare(b.firstName));
                setUserData(sortedData);
            })
            .catch(err => console.log('Error fetching data', err));
    }, []);

    return (
        <div>
            {userData.map((item, index) => (
                <div key={index}>
                    <p>{item._id}</p>
                    <p>{item.firstName} {item.lastName}</p>
                </div>
            ))}
        </div>
    )
}

export default ShowData;
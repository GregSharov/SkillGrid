// import { useState, useEffect } from "react";

function addNewUser() {

    return (
        <div>
            <h2>I am a new user</h2>
            <form>
                <lable>Name</lable>
                <input type="text" placeholder="Enter a first name"></input>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default addNewUser;
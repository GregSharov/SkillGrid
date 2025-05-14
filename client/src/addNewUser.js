// import { useState, useEffect } from "react";

function addNewUser() {

    return (
        <div>
            <h2>Welcome</h2>
            <form>
                <lable for="firstName">First name</lable>
                <input type="text" id="firstName" placeholder="Enter a first name" required></input>
                <lable for="secondName">Second name</lable>
                <input type="text" id="secondName" placeholder="Enter a second name" required></input>
                <lable for="dateOfBirth">Date of birth</lable>
                <input type="date" id="dateOfBirth" placeholder="Enter your date of birth" required></input>
                <lable for="email">Email</lable>
                <input type="email" id="email" placeholder="Enter an email" required></input>
                <lable for="phone">Phone</lable>
                <input type="tel" id="phone" pattern="[0-9]{10}" placeholder="Enter phone number" required></input>
                <label for="password">Password</label>
                <input type="text" id="password" placeholder="Enter a password" required></input>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default addNewUser;
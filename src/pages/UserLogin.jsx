import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { articleContext } from "../context/articleContext";
import { useNavigate } from "react-router-dom";

const UserLogin = () => {
  // Access from the article context
  const {
    userArray,
    setuserArray,
    regionAvailable,
    setisUserLoggedIn,
    setLoggedUserId,
    setLoggedUser,
  } = useContext(articleContext);

  const navigate = useNavigate();

  // State to manage the current mode (signup or signin)
  const [mode, setMode] = useState("signup");

  // Initialize form methods from react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm();

  // Function to handle new user data during sign-up
  const newData = (data) => {
    const userObj = {
      userId: Date.now(), // unique id
      name: data.name,
      email: data.email,
      password: data.password,
      preferredRegions: (data.preferredRegions || []).map((r) => r.value),
    };

    setuserArray((prevUsers) => [...prevUsers, userObj]);
    setisUserLoggedIn(true); // Set user as logged in
    setLoggedUserId(userObj.userId); // Set logged user id
    setLoggedUser(userObj); // Set logged user object
    console.log("New User Data:", userObj);
    navigate("/"); // Redirect to home
  };

  // Function to validate user data during sign-in
  const validateData = (data) => {
    const matchedUser = userArray.find((user) => user.email === data.email);
    if (matchedUser) {
      if (data.password === matchedUser.password) {
        setisUserLoggedIn(true); // Set user as logged in
        setLoggedUserId(matchedUser.userId); // Set logged user id
        setLoggedUser(matchedUser); // Set logged user object
        console.log("Validation Data:", data);
        navigate("/"); // Redirect to home
      } else {
        console.log("Incorrect password");
      }
    } else {
      console.log("User does not exist, please sign up");
    }
  };

  useEffect(() => {
    console.log("Updated User Array:", userArray);
  }, [userArray]);

  return (
    <>
      <h1>User Login</h1>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setMode("signup")}
          style={{
            fontWeight: mode === "signup" ? "bold" : "normal",
            marginRight: "1rem",
          }}
        >
          Sign Up
        </button>
        <button
          onClick={() => setMode("signin")}
          style={{ fontWeight: mode === "signin" ? "bold" : "normal" }}
        >
          Sign In
        </button>
      </div>
      {mode === "signup" && (
        <form onSubmit={handleSubmit(newData)}>
          <input
            type="text"
            placeholder="Enter your Name"
            {...register("name", {
              required: { value: true, message: "This field is required" },
              maxLength: {
                value: 20,
                message: "Name should be less then 20  characters",
              },
            })}
          />
          {errors.name && (
            <span className="text-red-600">{errors.name.message}</span>
          )}
          <input
            type="text"
            placeholder="Enter Email"
            {...register("email", {
              required: { value: true, message: "This field is required" },
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <span className="text-red-600">{errors.email.message}</span>
          )}
          <input
            type="password"
            placeholder="Enter Your Password"
            {...register("password", {
              required: { value: true, message: "This field is required" },
              minLength: {
                value: 4,
                message: "Password too samall, should be at least 4 characters",
              },
            })}
          />
          {errors.password && (
            <span className="text-red-600">{errors.password.message}</span>
          )}
          <Controller
            name="preferredRegions"
            control={control}
            rules={{ required: "Select at least one region" }}
            render={({ field }) => (
              <Select
                {...field}
                options={regionAvailable}
                isMulti
                placeholder="Select Preferred Regions"
              />
            )}
          />
          {errors.preferredRegions && (
            <span className="text-red-600">
              {errors.preferredRegions.message}
            </span>
          )}

          <input type="submit" />
        </form>
      )}
      {mode === "signin" && (
        <form onSubmit={handleSubmit(validateData)}>
          <input
            type="text"
            placeholder="Enter Email"
            {...register("email", {
              required: { value: true, message: "This field is required" },
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && (
            <span className="text-red-600">{errors.email.message}</span>
          )}
          <input
            type="password"
            placeholder="Enter Your Password"
            {...register("password", {
              required: { value: true, message: "This field is required" },
            })}
          />
          {errors.password && (
            <span className="text-red-600">{errors.password.message}</span>
          )}
          <input type="submit" />
        </form>
      )}
    </>
  );
};

export default UserLogin;

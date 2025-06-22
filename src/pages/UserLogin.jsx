import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { articleContext } from "../context/articleContext";

const UserLogin = () => {
  // Access user array from the article context
  const [userArray, setuserArray] = useContext(articleContext);
  // Access region options from the article context
  const { regionOptions } = useContext(articleContext);

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
    console.log("Form Data:", data);
    // Here you can handle the form submission, e.g., send data to an API
    setuserArray((prevUsers) => [...prevUsers, data]);
  };

  // Function to validate user data during sign-in
  const validateData = (data) => {
    console.log("Validation Data:", data);
    // Here you can validate the data, e.g., check if user exists
    const userExists = userArray.some(  (user) => user.email === data.email);
    if (userExists) {
      console.log("User exists, proceed with sign-in");
      if (data.password === userArray.find(user => user.email === data.email).password) 
        console.log("Sign-in successful");
      else
        console.log("Incorrect password");
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
                options={regionOptions}
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

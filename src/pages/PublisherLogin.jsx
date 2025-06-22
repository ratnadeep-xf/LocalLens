import React, { useState, useContext, useEffect } from "react";
import Select from "react-select";
import { useForm, Controller, useWatch } from "react-hook-form";
import { articleContext } from "../context/articleContext";

const PublisherLogin = () => {
  
  // Access publisher array from the article context
  const [publisherArray, setpublisherArray] = useContext(articleContext);
  // Access region options from the article context
  const { regionOptions, setregionOptions } = useContext(articleContext);

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

  const selectedRegions = useWatch({
    control,
    name: "preferredRegions",
  });

  // Function to handle new user data during sign-up
  const newData = (data) => {
    const selectedValues = data.preferredRegions?.map((opt) => opt.value) || [];

    if (selectedValues.includes("other") && data.newRegion) {
      const newRegion = data.newRegion.trim();

      // Avoid duplicates
      const alreadyExists = regionOptions.some(
        (opt) => opt.value.toLowerCase() === newRegion.toLowerCase()
      );

      if (!alreadyExists) {
        const newOption = {
          value: newRegion,
          label: newRegion.charAt(0).toUpperCase() + newRegion.slice(1),
        };

        // Add new region to the options list
        setregionOptions((prev) => [...prev, newOption]);
      }
    }

    console.log("Form Data:", data);
    // Here you can handle the form submission, e.g., send data to an API
    setpublisherArray((prevUsers) => [...prevUsers, data]);
  };

  // Function to validate user data during sign-in
  const validateData = (data) => {
    console.log("Validation Data:", data);
    // Here you can validate the data, e.g., check if user exists
    const userExists = publisherArray.some(
      (publisher) => publisher.email === data.email
    );
    if (userExists) {
      console.log("User exists, proceed with sign-in");
      if (
        data.password ===
        publisherArray.find((publisher) => publisher.email === data.email)
          .password
      )
        console.log("Sign-in successful");
      else console.log("Incorrect password");
    } else {
      console.log("User does not exist, please sign up");
    }
  };

  useEffect(() => {
    console.log("Updated Publisher Array:", publisherArray);
    console.log("Updated regionOptions:", regionOptions)
  }, [publisherArray, regionOptions]);

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
            placeholder="Enter Agency Name"
            {...register("agency_name", {
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
                options={[
                  ...regionOptions.filter((opt) => opt.value !== "all"),
                  { value: "other", label: "Other" },
                ]}
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
          {selectedRegions?.some((option) => option.value === "other") && (
            <input
              type="text"
              {...register("newRegion", {
                required: "Please specify a region",
              })}
              placeholder="Enter your region"
              className="mt-2 p-2 border border-gray-300 rounded"
            />
          )}
          <input
            type="text"
            placeholder="Enter Contact Person name"
            {...register("contact_person_name", {
              required: { value: true, message: "This field is required" },
              maxLength: {
                value: 20,
                message: "Name should be less than 20 characters",
              },
            })}
          />
          {errors.contact_person_name && (
            <span className="text-red-600">
              {errors.contact_person_name.message}
            </span>
          )}
          <input
            type="phone"
            placeholder="Enter Contact Person Phone Number"
            {...register("phone", {
              required: { value: true, message: "This field is required" },
              pattern: {
                value: /^\d{10}$/,
                message: "Phone number must be 10 digits",
              },
            })}
          />
          {errors.phone && (
            <span className="text-red-600">{errors.phone.message}</span>
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

export default PublisherLogin;

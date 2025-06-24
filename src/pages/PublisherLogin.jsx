import React, { useState, useContext, useEffect } from "react";
import Select from "react-select";
import { useForm, Controller, useWatch } from "react-hook-form";
import { articleContext } from "../context/articleContext";
import { useNavigate } from "react-router-dom";
import { set } from "date-fns";

const PublisherLogin = () => {
  const navigate = useNavigate();

  // Access region options and publisherArray from the article context
  const {
    regionAvailable,
    setregionAvailable,
    publisherArray,
    setpublisherArray,
    isPublisherLoggedIn,
    setisPublisherLoggedIn,
    publisherId,
    setloggedPublisherId,
    loggedPublisher,
    setloggedPublisher,
  } = useContext(articleContext);

  // State to manage the current mode (signup or signin)
  const [mode, setMode] = useState("signup");

  // Add error message state
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize form methods from react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue, // <-- add this
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
      const alreadyExists = regionAvailable.some(
        (opt) => opt.value.toLowerCase() === newRegion.toLowerCase()
      );

      if (!alreadyExists) {
        const newOption = {
          value: newRegion,
          label: newRegion.charAt(0).toUpperCase() + newRegion.slice(1),
        };

        // Add new region to the options list
        setregionAvailable((prev) => [...prev, newOption]);
      }
    }

    console.log("Form Data:", data);
    // Here you can handle the form submission, e.g., send data to an API
    const publisherObj = {
      id: Date.now(), // or a better unique id
      agencyName: data.agency_name,
      email: data.email,
      password: data.password,
      contactPerson: data.contact_person_name,
      phone: data.phone,
      regions: (data.preferredRegions || []).map((r) =>
        r.value === "other" ? data.newRegion : r.value
      ),
    };

    setpublisherArray((prev) => [...prev, publisherObj]);

    setisPublisherLoggedIn(true); // Set publisher as logged in
    setloggedPublisherId(publisherObj.id); // Set publisher id
    setloggedPublisher(publisherObj); // Set logged publisher object
    navigate("/"); // Redirect to home page
  };

  // Function to validate user data during sign-in
  const validateData = (data) => {
    const matchedPublisher = publisherArray.find(
      (publisher) => publisher.email === data.email
    );
    if (matchedPublisher) {
      if (data.password === matchedPublisher.password) {
        setisPublisherLoggedIn(true);
        setloggedPublisherId(matchedPublisher.id);
        setloggedPublisher(matchedPublisher);
        setErrorMsg("");
        navigate("/");
      } else {
        setErrorMsg("Incorrect password");
        setValue("password", ""); // Reset only password field
      }
    } else {
      setErrorMsg("User does not exist, please sign up");
      setValue("email", "");     // Reset email field
      setValue("password", "");  // Reset password field
    }
  };

  return (
    <>
      <h1>User Login</h1>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => {
            setMode("signup");
            setErrorMsg("");
          }}
          style={{
            fontWeight: mode === "signup" ? "bold" : "normal",
            marginRight: "1rem",
          }}
        >
          Sign Up
        </button>
        <button
          onClick={() => {
            setMode("signin");
            setErrorMsg("");
          }}
          style={{ fontWeight: mode === "signin" ? "bold" : "normal" }}
        >
          Sign In
        </button>
      </div>
      {/* Show error message on screen */}
      {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}
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
                  ...regionAvailable.filter((opt) => opt.value !== "all"),
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

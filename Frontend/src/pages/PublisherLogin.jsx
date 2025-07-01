import React, { useState, useContext, useEffect } from "react";
import Select from "react-select";
import { useForm, Controller, useWatch } from "react-hook-form";
import { articleContext } from "../context/articleContext";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, MapPin, User, Phone } from "lucide-react";
import { AUTH_ENDPOINTS } from "../utils/api";

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
    updateToken,
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
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const selectedRegions = useWatch({
    control,
    name: "preferredRegions",
  });

  // Function to handle new publisher data during sign-up
  const newData = async (data) => {
    try {
      setErrorMsg(''); // Clear any previous errors
      console.log("Publisher Signup: Attempting registration", { 
        email: data.email,
        agencyName: data.agency_name 
      });

      // Validate regions
      if (!data.preferredRegions || data.preferredRegions.length === 0) {
        throw new Error('Please select at least one region');
      }

      const selectedValues = data.preferredRegions.map((opt) => opt.value);
      let regions = selectedValues;

      // Handle new region if "other" is selected
      if (selectedValues.includes("other")) {
        if (!data.newRegion || !data.newRegion.trim()) {
          throw new Error('Please enter a name for the new region');
        }
        const newRegion = data.newRegion.trim();
        regions = selectedValues.map(r => r === "other" ? newRegion : r);

        // Add new region to the options list if it doesn't exist
        const alreadyExists = regionAvailable.some(
          (opt) => opt.value.toLowerCase() === newRegion.toLowerCase()
        );

        if (!alreadyExists) {
          const newOption = {
            value: newRegion,
            label: newRegion.charAt(0).toUpperCase() + newRegion.slice(1),
          };
          setregionAvailable((prev) => [...prev, newOption]);
        }
      }

      // Validate phone number
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(data.phone)) {
        throw new Error('Phone number must be exactly 10 digits');
      }

      const response = await fetch(AUTH_ENDPOINTS.publisherRegister, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agencyName: data.agency_name,
          email: data.email,
          password: data.password,
          regions: regions.filter(r => r !== 'other'), // Remove 'other' from regions
          contactPerson: data.contact_person_name,
          phone: data.phone
        }),
      });

      // First check if the response is ok
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Join multiple validation errors into a single message
          throw new Error(errorData.errors.join(', '));
        }
        throw new Error(errorData.message || 'Error during registration');
      }

      const result = await response.json();
      console.log("Publisher Signup: Registration successful", {
        publisherId: result.publisher.id,
        agencyName: result.publisher.agencyName
      });

      // First update the token - this will trigger the auth check effect
      updateToken(result.token);
      
      // Then update publisher states
      setloggedPublisherId(result.publisher.id);
      setloggedPublisher(result.publisher);
      setisPublisherLoggedIn(true);
      
      console.log("Publisher Signup: States updated", {
        isPublisherLoggedIn: true,
        publisherId: result.publisher.id,
        publisher: result.publisher,
        hasToken: !!result.token
      });
      
      navigate('/');
    } catch (error) {
      console.error('Publisher Signup: Error during registration:', error);
      setErrorMsg(error.message || 'Error connecting to the server. Please try again.');
    }
  };

  // Function to validate publisher data during sign-in
  const validateData = async (data) => {
    try {
      setErrorMsg(''); // Clear any previous errors
      console.log("Publisher Login: Attempting login", { email: data.email });
      
      const response = await fetch(AUTH_ENDPOINTS.publisherLogin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      // First check if the response is ok
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const result = await response.json();
      console.log("Publisher Login: Login successful", {
        publisherId: result.publisher.id,
        agencyName: result.publisher.agencyName
      });

      // First update the token - this will trigger the auth check effect
      updateToken(result.token);
      
      // Then update publisher states
      setloggedPublisherId(result.publisher.id);
      setloggedPublisher(result.publisher);
      setisPublisherLoggedIn(true);
      
      console.log("Publisher Login: States updated", {
        isPublisherLoggedIn: true,
        publisherId: result.publisher.id,
        publisher: result.publisher,
        hasToken: !!result.token
      });
      
      navigate('/');
    } catch (error) {
      console.error('Publisher Login: Error during login:', error);
      setErrorMsg(error.message || 'Error connecting to the server. Please try again.');
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrorMsg("");
    reset();
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: '1px solid #e5e5e5',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(14, 165, 233, 0.1)' : 'none',
      borderColor: state.isFocused ? '#0ea5e9' : '#e5e5e5',
      '&:hover': {
        borderColor: '#0ea5e9',
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e0f2fe',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#0369a1',
      fontWeight: '500',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#0369a1',
      '&:hover': {
        backgroundColor: '#0ea5e9',
        color: 'white',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Publisher Access</h1>
          <p className="mt-2 text-neutral-600">Share your stories with the community</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => handleModeChange("signup")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              mode === "signup"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => handleModeChange("signin")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
              mode === "signin"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Sign In
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-card p-8">
          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg">
              <p className="text-accent-700 text-sm">{errorMsg}</p>
            </div>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSubmit(newData)} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  Agency Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your news agency name"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  {...register("agency_name", {
                    required: { value: true, message: "Agency name is required" },
                    maxLength: {
                      value: 50,
                      message: "Agency name should be less than 50 characters",
                    },
                  })}
                />
                {errors.agency_name && (
                  <p className="text-accent-600 text-sm mt-1">{errors.agency_name.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  {...register("email", {
                    required: { value: true, message: "Email is required" },
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-accent-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create a secure password"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  {...register("password", {
                    required: { value: true, message: "Password is required" },
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-accent-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Coverage Regions
                </label>
                <Controller
                  name="preferredRegions"
                  control={control}
                  rules={{ required: "Please select at least one region" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={[
                        ...regionAvailable.filter((opt) => opt.value !== "all"),
                        { value: "other", label: "Other (Add New Region)" },
                      ]}
                      isMulti
                      placeholder="Select regions you cover"
                      styles={customSelectStyles}
                    />
                  )}
                />
                {errors.preferredRegions && (
                  <p className="text-accent-600 text-sm mt-1">{errors.preferredRegions.message}</p>
                )}
              </div>

              {selectedRegions?.some((option) => option.value === "other") && (
                <div>
                  <label className="text-sm font-semibold text-neutral-700 mb-2 block">
                    New Region Name
                  </label>
                  <input
                    type="text"
                    {...register("newRegion", {
                      required: "Please specify the region name",
                    })}
                    placeholder="Enter the new region name"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  />
                  {errors.newRegion && (
                    <p className="text-accent-600 text-sm mt-1">{errors.newRegion.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <User className="w-4 h-4" />
                  Contact Person Name
                </label>
                <input
                  type="text"
                  placeholder="Enter contact person's name"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  {...register("contact_person_name", {
                    required: { value: true, message: "Contact person name is required" },
                    maxLength: {
                      value: 50,
                      message: "Name should be less than 50 characters",
                    },
                  })}
                />
                {errors.contact_person_name && (
                  <p className="text-accent-600 text-sm mt-1">{errors.contact_person_name.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter contact phone number"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  {...register("phone", {
                    required: { value: true, message: "Phone number is required" },
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Phone number must be 10 digits",
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-accent-600 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Create Publisher Account
              </button>
            </form>
          )}

          {mode === "signin" && (
            <form onSubmit={handleSubmit(validateData)} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  {...register("email", {
                    required: { value: true, message: "Email is required" },
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-accent-600 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  {...register("password", {
                    required: { value: true, message: "Password is required" },
                  })}
                />
                {errors.password && (
                  <p className="text-accent-600 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublisherLogin;
import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { articleContext } from "../context/articleContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, MapPin } from "lucide-react";
import { AUTH_ENDPOINTS } from "../utils/api";

const UserLogin = () => {
  // Access from the article context
  const {
    userArray,
    setuserArray,
    regionAvailable,
    setisUserLoggedIn,
    setLoggedUserId,
    setLoggedUser,
    updateToken,
  } = useContext(articleContext);

  const navigate = useNavigate();

  // State to manage the current mode (signup or signin)
  const [mode, setMode] = useState("signup");
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize form methods from react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm();

  // Function to handle new user data during sign-up
  const newData = async (data) => {
    try {
      setErrorMsg(''); // Clear any previous errors
      console.log("User Signup: Attempting registration", { email: data.email });
      
      const response = await fetch(AUTH_ENDPOINTS.userRegister, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          preferredRegions: data.preferredRegions ? data.preferredRegions.map((r) => r.value) : [],
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
      console.log("User Signup: Registration successful", {
        userId: result.user.id,
        name: result.user.name
      });

      // First update the token - this will trigger the auth check effect
      updateToken(result.token);
      
      // Then update user states
      setLoggedUserId(result.user.id);
      setLoggedUser(result.user);
      setisUserLoggedIn(true);
      
      console.log("User Signup: States updated", {
        isUserLoggedIn: true,
        userId: result.user.id,
        user: result.user,
        hasToken: !!result.token
      });
      
      navigate('/');
    } catch (error) {
      console.error('User Signup: Error during registration:', error);
      setErrorMsg(error.message || 'Error connecting to the server. Please try again.');
    }
  };

  // Function to validate user data during sign-in
  const validateData = async (data) => {
    try {
      setErrorMsg(''); // Clear any previous errors
      console.log("User Login: Attempting login", { email: data.email });
      
      const response = await fetch(AUTH_ENDPOINTS.userLogin, {
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
      console.log("User Login: Login successful", {
        userId: result.user.id,
        name: result.user.name
      });

      // First update the token - this will trigger the auth check effect
      updateToken(result.token);
      
      // Then update user states
      setLoggedUserId(result.user.id);
      setLoggedUser(result.user);
      setisUserLoggedIn(true);
      
      console.log("User Login: States updated", {
        isUserLoggedIn: true,
        userId: result.user.id,
        user: result.user,
        hasToken: !!result.token
      });
      
      navigate('/');
    } catch (error) {
      console.error('User Login: Error during login:', error);
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

  useEffect(() => {
    console.log("Updated User Array:", userArray);
  }, [userArray]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Reader Access</h1>
          <p className="mt-2 text-neutral-600">Join our community of local news readers</p>
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
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  {...register("name", {
                    required: { value: true, message: "Name is required" },
                    maxLength: {
                      value: 50,
                      message: "Name should be less than 50 characters",
                    },
                  })}
                />
                {errors.name && (
                  <p className="text-accent-600 text-sm mt-1">{errors.name.message}</p>
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
                  Preferred Regions (Optional)
                </label>
                <Controller
                  name="preferredRegions"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={regionAvailable.filter(opt => opt.value !== "all")}
                      isMulti
                      placeholder="Select regions you're interested in"
                      styles={customSelectStyles}
                    />
                  )}
                />
                <p className="text-neutral-500 text-sm mt-1">
                  You can select regions to customize your news feed
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Create Account
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

export default UserLogin;
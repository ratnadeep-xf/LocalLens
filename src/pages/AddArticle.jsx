import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Select from "react-select";
import { useForm, Controller, useWatch  } from "react-hook-form";
import { articleContext } from "../context/articleContext";
import { useNavigate } from "react-router-dom";

const AddArticle = () => {

  const navigate = useNavigate();

  const { articles, setArticles, regionAvailable, setregionAvailable, loggedPublisher } = useContext(articleContext);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm();

  const selectedRegions = useWatch({
    control,
    name: "regionOfArticle",
  });

  const onSubmit = (data) => {
    // If user selected "other" region, add it to regionAvailable
    let region = data.regionOfArticle?.value;
    if (region === "other" && data.newRegion) {
      region = data.newRegion;
      // Optionally add new region to regionAvailable if not already present
      if (!regionAvailable.some(opt => opt.value === region)) {
        setregionAvailable(prev => [
          ...prev,
          { value: region, label: region.charAt(0).toUpperCase() + region.slice(1) }
        ]);
      }
    }

    // Build the new article object
    const newArticle = {
      id: Date.now(), // or use a better unique id
      img: "/default-image.png", // or handle uploaded image
      title: data.title,
      region: region,
      date: new Date().toLocaleDateString("en-GB").split('/').join('-'), // dd-mm-yyyy
      publisher: loggedPublisher?.agencyName || "Unknown Publisher",
      content: data.content,
      engagement: {
        upVotes: 0,
        downVotes: 0,
        comments: 0,
        votesArray: [],
        commentsArray: [],
      },
    };

    // Add the new article to articles state
    setArticles(prev => [newArticle, ...prev]);
    console.log("Updated Articles" + articles);
    navigate("/"); // Redirect to home or another page after submission
  };
  

  return (
    <>
      <Navbar />
      <h1>Enter Article Information here!</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Enter Title of the Article"
          {...register("title", {
            required: { value: true, message: "This field is required" },
            maxLength: {
              value: 50,
              message: "Title should be less then 50  characters",
            },
          })}
        />
        {errors.title && (
          <span className="text-red-600">{errors.title.message}</span>
        )}
        <textarea
          placeholder="Enter content"
          {...register("content", {
            required: { value: true, message: "This field is required" },
          })}
        />
        {errors.content && (
          <span className="text-red-600">{errors.content.message}</span>
        )}
        <Controller
          name="regionOfArticle"
          control={control}
          rules={{
            required: "Select at a region or click Other and add a new one",
          }}
          render={({ field }) => (
            <Select
              {...field}
              options={[
                ...regionAvailable.filter((opt) => opt.value !== "all"),
                { value: "other", label: "Other" },
              ]}
              placeholder="Select Region of the Article"
            />
          )}
        />
        {errors.regionOfArticle && (
          <span className="text-red-600">{errors.regionOfArticle.message}</span>
        )}
        {selectedRegions?.value === "other" && (
          <input
            type="text"
            {...register("newRegion", {
              required: "Please specify a region",
            })}
            placeholder="Enter your region"
            className="mt-2 p-2 border border-gray-300 rounded"
          />
        )}
        {errors.newRegion && (
          <span className="text-red-600">{errors.newRegion.message}</span>
        )}
        <div>
        <label>Image:</label>
        <input
          type="file"
          accept="image/*"
          {...register("image", { required: false })}
        />
      </div>
      
        <input type="submit" />
      </form>
    </>
  );
};

export default AddArticle;

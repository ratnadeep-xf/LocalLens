import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Select from "react-select";
import { useForm, Controller, useWatch } from "react-hook-form";
import { articleContext } from "../context/articleContext";
import { useNavigate } from "react-router-dom";
import { FileText, Image, MapPin, Save } from "lucide-react";

const AddArticle = () => {
  const navigate = useNavigate();

  const {
    articles,
    setArticles,
    regionAvailable,
    setregionAvailable,
    loggedPublisher,
    publisherArray,
    setpublisherArray, // <-- make sure this is in your context
  } = useContext(articleContext);

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
      if (!regionAvailable.some((opt) => opt.value === region)) {
        setregionAvailable((prev) => [
          ...prev,
          {
            value: region,
            label: region.charAt(0).toUpperCase() + region.slice(1),
          },
        ]);
      }
      // Add new region to the loggedPublisher's regions in publisherArray
      setpublisherArray((prev) =>
        prev.map((pub) =>
          pub.id === loggedPublisher.id && !pub.regions.includes(region)
            ? { ...pub, regions: [...pub.regions, region] }
            : pub
        )
      );
    }

    // Build the new article object
    const newArticle = {
      id: Date.now(), // or use a better unique id
      img: "/default-image.png", // or handle uploaded image
      title: data.title,
      region: region,
      date: new Date().toLocaleDateString("en-GB").split("/").join("-"), // dd-mm-yyyy
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
    setArticles((prev) => [newArticle, ...prev]);
    console.log("Updated Articles" + articles);
    navigate("/dashboard"); // Redirect to dashboard after submission
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: "1px solid #e5e5e5",
      borderRadius: "0.5rem",
      padding: "0.5rem",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(14, 165, 233, 0.1)" : "none",
      borderColor: state.isFocused ? "#0ea5e9" : "#e5e5e5",
      "&:hover": {
        borderColor: "#0ea5e9",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-card p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Create New Article
            </h1>
            <p className="text-neutral-600">
              Share your story with the community
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                <FileText className="w-4 h-4" />
                Article Title
              </label>
              <input
                type="text"
                placeholder="Enter a compelling title for your article"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                {...register("title", {
                  required: { value: true, message: "Title is required" },
                  maxLength: {
                    value: 100,
                    message: "Title should be less than 100 characters",
                  },
                })}
              />
              {errors.title && (
                <p className="text-accent-600 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                <FileText className="w-4 h-4" />
                Article Content
              </label>
              <textarea
                placeholder="Write your article content here..."
                rows="8"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
                {...register("content", {
                  required: { value: true, message: "Content is required" },
                  minLength: {
                    value: 50,
                    message: "Content should be at least 50 characters long",
                  },
                })}
              />
              {errors.content && (
                <p className="text-accent-600 text-sm mt-1">
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Region Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                <MapPin className="w-4 h-4" />
                Region
              </label>
              <Controller
                name="regionOfArticle"
                control={control}
                rules={{
                  required: "Please select a region or add a new one",
                }}
                render={({ field }) => {
                  // Only show regions assigned to the logged-in publisher
                  const publisherRegions = (loggedPublisher?.regions || []).map(
                    (region) => ({
                      value: region,
                      label: region.charAt(0).toUpperCase() + region.slice(1),
                    })
                  );

                  return (
                    <Select
                      {...field}
                      options={[
                        ...publisherRegions,
                        { value: "other", label: "Other (Add New Region)" },
                      ]}
                      placeholder="Select the region for your article"
                      styles={customSelectStyles}
                    />
                  );
                }}
              />
              {errors.regionOfArticle && (
                <p className="text-accent-600 text-sm mt-1">
                  {errors.regionOfArticle.message}
                </p>
              )}
            </div>

            {/* New Region Input */}
            {selectedRegions?.value === "other" && (
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
                  <p className="text-accent-600 text-sm mt-1">
                    {errors.newRegion.message}
                  </p>
                )}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                <Image className="w-4 h-4" />
                Featured Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                {...register("image", { required: false })}
              />
              <p className="text-neutral-500 text-sm mt-1">
                Upload an image to make your article more engaging
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Save className="w-4 h-4" />
                Publish Article
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddArticle;

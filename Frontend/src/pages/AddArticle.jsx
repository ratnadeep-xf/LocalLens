import React, { useContext, useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Select from "react-select";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { articleContext } from "../context/articleContext";
import { useNavigate } from "react-router-dom";
import { FileText, Image, MapPin, Save } from "lucide-react";
import { ARTICLE_ENDPOINTS, apiCall } from "../utils/api";
import { formatDateDDMMYYYY } from "../utils/date";
import { updateDraftField, clearDraft } from "../store/draftSlice";

const draftHasContent = (draft) =>
  Boolean(draft.title?.trim()) ||
  Boolean(draft.content?.trim()) ||
  Boolean(draft.newRegion?.trim()) ||
  (draft.regionOfArticle &&
    typeof draft.regionOfArticle === "object" &&
    draft.regionOfArticle.value) ||
  (typeof draft.regionOfArticle === "string" && draft.regionOfArticle.trim());

const AddArticle = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const draft = useSelector((state) => state.draft);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setisSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const debounceRef = useRef(null);
  const skipDebounceRef = useRef(true);
  const hasRestoredRef = useRef(false);

  const {
    articles,
    setArticles,
    regionAvailable,
    setregionAvailable,
    loggedPublisher,
    loggedPublisherId,
    publisherArray,
    setpublisherArray,
    token,
    isPublisherLoggedIn,
    fetchArticles
  } = useContext(articleContext);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  const selectedRegions = useWatch({
    control,
    name: "regionOfArticle",
  });

  const watchedTitle = useWatch({ control, name: "title" });
  const watchedContent = useWatch({ control, name: "content" });
  const watchedNewRegion = useWatch({ control, name: "newRegion" });

  useEffect(() => {
    if (hasRestoredRef.current) {
      return;
    }
    hasRestoredRef.current = true;

    if (draftHasContent(draft)) {
      if (draft.title) {
        setValue("title", draft.title);
      }
      if (draft.content) {
        setValue("content", draft.content);
      }
      if (
        draft.regionOfArticle &&
        typeof draft.regionOfArticle === "object" &&
        draft.regionOfArticle.value
      ) {
        setValue("regionOfArticle", draft.regionOfArticle);
      }
      if (draft.newRegion) {
        setValue("newRegion", draft.newRegion);
      }
      setDraftRestored(true);
    }

    const enableSaveTimer = setTimeout(() => {
      skipDebounceRef.current = false;
    }, 100);

    return () => clearTimeout(enableSaveTimer);
    // Restore once on mount; PersistGate ensures draft is rehydrated first.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (skipDebounceRef.current) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      dispatch(updateDraftField({ field: "title", value: watchedTitle ?? "" }));
      dispatch(
        updateDraftField({ field: "content", value: watchedContent ?? "" })
      );
      dispatch(
        updateDraftField({
          field: "regionOfArticle",
          value: selectedRegions || "",
        })
      );
      dispatch(
        updateDraftField({ field: "newRegion", value: watchedNewRegion ?? "" })
      );
    }, 2000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    watchedTitle,
    watchedContent,
    selectedRegions,
    watchedNewRegion,
    dispatch,
  ]);

  const onSubmit = async (data) => {
    try {
      setSubmitError(null);
      setisSubmitting(true)
      if (!isPublisherLoggedIn) {
        throw new Error('Only publishers can create articles');
      }

      // Handle region selection
      let region;
      if (data.regionOfArticle?.value === "other" && data.newRegion) {
        region = data.newRegion.trim().toLowerCase();
        if (!region) {
          throw new Error('New region name is required');
        }
      } else if (data.regionOfArticle?.value) {
        region = data.regionOfArticle.value;
      } else {
        throw new Error('Region selection is required');
      }

      // Validate title and content
      if (!data.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!data.content?.trim()) {
        throw new Error('Content is required');
      }
      if (data.title.length > 100) {
        throw new Error('Title should be less than 100 characters');
      }
      if (data.content.length < 50) {
        throw new Error('Content should be at least 50 characters long');
      }

      // Create FormData for article submission
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('content', data.content.trim());
      formData.append('region', region);
      formData.append('date', formatDateDDMMYYYY(new Date()));
      
      // Append image if provided
      if (data.image && data.image[0]) {
        const imageFile = data.image[0];
        const maxBytes = 3.5 * 1024 * 1024;
        if (imageFile.size > maxBytes) {
          throw new Error('Image must be smaller than 3.5MB');
        }
        formData.append('image', imageFile);
      }

      // Send request without Content-Type header (browser will set it automatically with boundary)
      const response = await fetch(ARTICLE_ENDPOINTS.create, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(
            errorData.message ||
              errorData.error ||
              "Too many articles created. Please wait and try again."
          );
        }
        throw new Error(errorData.message || errorData.error || "Error creating article");
      }

      const result = await response.json();

      // If using "other" region, update available regions
      if (data.regionOfArticle?.value === "other") {
        const newOption = {
          value: region,
          label: region.charAt(0).toUpperCase() + region.slice(1),
        };
        
        // Update available regions if not already present
        if (!regionAvailable.some(opt => opt.value === region)) {
          setregionAvailable(prev => [...prev, newOption]);
        }
        
        // Update publisher's regions if not already present
        setpublisherArray(prev =>
          prev.map(pub =>
            pub.id === loggedPublisherId && !pub.regions.includes(region)
              ? { ...pub, regions: [...pub.regions, region] }
              : pub
          )
        );
      }

      // Add the new article to articles state
      setArticles(prev => [result, ...prev]);

      // Refresh the articles list after successful creation
      await fetchArticles();

      dispatch(clearDraft());

      navigate("/dashboard");
    } catch (error) {
      console.error('Error creating article:', error);
      setSubmitError(error.message || 'Error creating article. Please try again.');
    } finally {
      setisSubmitting(false)
    }
  };

  // If not authenticated as publisher, redirect
  if (!isPublisherLoggedIn || !loggedPublisher) {
    navigate('/');
    return null;
  }

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

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{submitError}</p>
            </div>
          )}

          {draftRestored && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                Draft restored — please re-attach your image if needed.
              </p>
            </div>
          )}

          <form 
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-6"
            encType="multipart/form-data"
          >
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
                Optional. JPEG, PNG, or GIF under 3.5MB.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200 ${
                  isSubmitting 
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-primary-700"
                }`}
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddArticle;

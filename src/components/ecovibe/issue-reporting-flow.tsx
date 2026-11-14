"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Upload,
  Sparkles,
  Navigation,
  CheckCircle2,
  Loader2,
  Camera,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CommunityIssue,
  GeminiAnalysisResult,
  IssueCategory,
  IssueSeverity,
  UserProfile,
} from "@/types/ecovibe";
import { useStorage } from "@/hooks/use-storage";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useAriaFormValidation } from "@/hooks/use-aria-validation";
import { formatCoordinates } from "@/lib/utils";

const ISSUE_CATEGORIES: IssueCategory[] = [
  "Waste",
  "Road Hazard",
  "Broken Facility",
  "Flooding & Drainage",
  "Streetlight Outage",
  "Illegal Dumping",
  "Other",
];

const SEVERITY_LEVELS: IssueSeverity[] = ["Low", "Medium", "High", "Critical"];

interface IssueReportingFlowProps {
  user: UserProfile;
  onIssueCreated: (newIssue: CommunityIssue) => void;
}

export function IssueReportingFlow({
  user,
  onIssueCreated,
}: IssueReportingFlowProps) {
  const prefersReducedMotion = useReducedMotion();
  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useAriaFormValidation(formRef);

  const { uploadPhoto, isUploading } = useStorage();
  const {
    coordinates,
    isLocating,
    geoStatus,
    captureGeolocation,
  } = useGeolocation();

  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string>("");
  const [analysisResult, setAnalysisResult] =
    useState<GeminiAnalysisResult | null>(null);

  const [category, setCategory] = useState<IssueCategory>("Waste");
  const [severity, setSeverity] = useState<IssueSeverity>("Medium");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [submittedIssue, setSubmittedIssue] = useState<CommunityIssue | null>(
    null
  );

  const analyzeImage = async (params: { fileName?: string }) => {
    setIsAnalyzing(true);
    setSubmittedIssue(null);
    setScanMessage("Analyzing photo...");

    const stageTimer = setTimeout(() => {
      setScanMessage("Selecting matching category...");
    }, 500);

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: params.fileName,
        }),
      });

      await new Promise((r) => setTimeout(r, 950));
      const data = (await response.json()) as GeminiAnalysisResult;

      setCategory(data.category);
      setSeverity(data.severity);
      setTitle(data.suggestedTitle);
      setDescription(data.suggestedDescription);
      setAnalysisResult(data);
    } finally {
      clearTimeout(stageTimer);
      setIsAnalyzing(false);
      setScanMessage("");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreviewUrl(String(reader.result));
    };
    reader.readAsDataURL(file);

    await analyzeImage({ fileName: file.name });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector<HTMLElement>(":invalid");
      firstInvalid?.focus();
      return;
    }

    let finalPhotoUrl = photoPreviewUrl;
    let storagePath = `issues/${user.uid}/${Date.now()}_photo.jpg`;

    if (uploadedFile) {
      const storageRes = await uploadPhoto(uploadedFile, user.uid);
      finalPhotoUrl = storageRes.downloadUrl;
      storagePath = storageRes.storagePath;
    }

    const issueId = `ILG-${Math.floor(200 + Math.random() * 799)}`;
    const createdAt = new Date().toISOString();

    const newIssue: CommunityIssue = {
      id: issueId,
      title,
      description,
      category,
      severity,
      status: "Verified",
      photoUrl: finalPhotoUrl,
      storagePath,
      coordinates,
      createdAt,
      reporterName: user.displayName,
      reporterUid: user.uid,
      upvotes: 1,
      aiConfidence: analysisResult?.confidence ?? 0.95,
      recommendedAgency:
        analysisResult?.recommendedAgency ||
        "Iligan City Environment & Management Office",
    };

    setSubmittedIssue(newIssue);
    onIssueCreated(newIssue);
  };

  return (
    <section
      id="report-issue"
      aria-labelledby="report-form-heading"
      className="py-14 border-b border-m3-outline-variant bg-m3-surface-container-lowest transition-colors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 max-w-2xl">
          <h2
            id="report-form-heading"
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-m3-on-surface"
          >
            Report a community issue
          </h2>
          <p className="mt-2 text-sm sm:text-base text-m3-on-surface-variant">
            Upload a photo of an issue in your barangay. We automatically scan
            the image to suggest the right category and fill in the details for
            you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (5 cols): Photo Uploader & Sample Photos */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera
                      className="h-4 w-4 text-m3-primary-text"
                      aria-hidden="true"
                    />
                    <span>1. Issue photo</span>
                  </CardTitle>
                  {isAnalyzing ? (
                    <Badge variant="secondary">Analyzing...</Badge>
                  ) : analysisResult ? (
                    <Badge variant="default">Category suggested</Badge>
                  ) : (
                    <Badge variant="outline">Ready to upload</Badge>
                  )}
                </div>
                <CardDescription>
                  Upload a photo of the community issue from your phone or
                  computer.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Image Preview + Clean Scanning State */}
                <div className="relative overflow-hidden rounded-m3-md border border-m3-outline-variant bg-m3-surface-container aspect-[16/10]">
                  {photoPreviewUrl ? (
                    <img
                      src={photoPreviewUrl}
                      alt={`Issue preview categorized as ${category}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-m3-on-surface-variant hover:bg-m3-surface-container-high transition-colors"
                    >
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-m3-primary-container text-m3-on-primary-container">
                        <Upload className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-medium text-m3-on-surface">
                        Click to choose a photo
                      </span>
                      <span className="text-xs text-m3-on-surface-variant">
                        JPG, PNG, or WEBP • Automatically suggests category &
                        details
                      </span>
                    </button>
                  )}

                  <AnimatePresence>
                    {isAnalyzing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        role="status"
                        aria-live="polite"
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs p-6 text-center text-white"
                      >
                        <Loader2
                          className="h-8 w-8 animate-spin text-white mb-3"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-medium">{scanMessage}</p>
                        <div className="mt-3 w-40 overflow-hidden rounded-full bg-white/25 h-1.5">
                          {!prefersReducedMotion && (
                            <motion.div
                              initial={{ width: "15%" }}
                              animate={{ width: "92%" }}
                              transition={{ duration: 0.9, ease: "easeOut" }}
                              className="h-full bg-white"
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isAnalyzing && analysisResult && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-m3-sm bg-m3-surface px-3 py-2 backdrop-blur-md shadow-m3-1">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-m3-on-surface">
                        <Sparkles
                          className="h-3.5 w-3.5 text-m3-primary-text shrink-0"
                          aria-hidden="true"
                        />
                        Suggested: {analysisResult.category}
                      </span>
                      <span className="text-xs text-m3-on-surface-variant">
                        {analysisResult.severity} priority
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div>
                  <input
                    ref={fileInputRef}
                    id="issue-photo-upload"
                    name="issuePhoto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="visually-hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {photoPreviewUrl ? "Change photo" : "Upload a photo"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (7 cols): Clean Form Details & Location */}
          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  2. Issue details & location
                </CardTitle>
                <CardDescription>
                  Review the suggested category, confirm the location in Iligan
                  City, and submit your report.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  aria-label="Report a community issue"
                >
                  {/* Category & Priority */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="issue-category-select">
                          Category{" "}
                          <span
                            aria-hidden="true"
                            className="text-m3-primary-text"
                          >
                            *
                          </span>
                        </Label>
                        <span className="inline-flex items-center gap-1 text-xs text-m3-primary-text">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          Auto-filled
                        </span>
                      </div>
                      <span
                        id="category-hint"
                        className="block text-xs text-m3-on-surface-variant"
                      >
                        Suggested from your photo; change anytime.
                      </span>
                      <Select
                        value={category}
                        onValueChange={(val) =>
                          setCategory(val as IssueCategory)
                        }
                        disabled={isAnalyzing}
                      >
                        <SelectTrigger
                          id="issue-category-select"
                          aria-describedby="category-hint"
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ISSUE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="issue-severity-select">
                        Priority level{" "}
                        <span
                          aria-hidden="true"
                          className="text-m3-primary-text"
                        >
                          *
                        </span>
                      </Label>
                      <span
                        id="severity-hint"
                        className="block text-xs text-m3-on-surface-variant"
                      >
                        Helps city teams prioritize urgent hazards.
                      </span>
                      <Select
                        value={severity}
                        onValueChange={(val) =>
                          setSeverity(val as IssueSeverity)
                        }
                        disabled={isAnalyzing}
                      >
                        <SelectTrigger
                          id="issue-severity-select"
                          aria-describedby="severity-hint"
                        >
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITY_LEVELS.map((lvl) => (
                            <SelectItem key={lvl} value={lvl}>
                              {lvl}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Summary Title */}
                  <div className="space-y-1.5">
                    <Label htmlFor="issue-title">
                      Title{" "}
                      <span aria-hidden="true" className="text-m3-primary-text">
                        *
                      </span>
                    </Label>
                    <span
                      id="title-hint"
                      className="block text-xs text-m3-on-surface-variant"
                    >
                      Short summary of the issue (at least 5 characters).
                    </span>
                    <Input
                      id="issue-title"
                      name="title"
                      type="text"
                      required
                      minLength={5}
                      maxLength={120}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      aria-describedby="title-hint"
                      data-error="title-error"
                      placeholder="e.g., Overflowing trash bins near Pala-o Market"
                    />
                    <div
                      id="title-error"
                      className="field-error-msg items-center gap-1.5 text-xs font-medium text-m3-error pt-1"
                    >
                      <span role="img" aria-label="Error">
                        ❌
                      </span>
                      <span>
                        Please enter a short summary of at least 5 characters.
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="issue-description">
                      Description & nearby landmark{" "}
                      <span aria-hidden="true" className="text-m3-primary-text">
                        *
                      </span>
                    </Label>
                    <span
                      id="desc-hint"
                      className="block text-xs text-m3-on-surface-variant"
                    >
                      Mention street names, barangay, or nearby landmarks in
                      Iligan City.
                    </span>
                    <Textarea
                      id="issue-description"
                      name="description"
                      required
                      minLength={15}
                      maxLength={600}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      aria-describedby="desc-hint"
                      data-error="desc-error"
                      placeholder="Describe the issue and nearest street or landmark..."
                    />
                    <div
                      id="desc-error"
                      className="field-error-msg items-center gap-1.5 text-xs font-medium text-m3-error pt-1"
                    >
                      <span role="img" aria-label="Error">
                        ❌
                      </span>
                      <span>
                        Please provide at least 15 characters so responders can
                        find the spot.
                      </span>
                    </div>
                  </div>

                  {/* Location Box */}
                  <div className="rounded-m3-md border border-m3-outline-variant bg-m3-surface p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-medium text-m3-on-surface flex items-center gap-1.5">
                        <MapPin
                          className="h-4 w-4 text-m3-primary-text shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">
                          {coordinates.addressLabel ||
                            "Location in Iligan City"}
                        </span>
                      </p>
                      <p className="text-xs text-m3-on-surface-variant pl-5 truncate">
                        {formatCoordinates(coordinates.lat, coordinates.lng)} •{" "}
                        {geoStatus}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={captureGeolocation}
                      disabled={isLocating}
                      aria-label={
                        isLocating ? "Finding location..." : "Use my location"
                      }
                      title="Use my location"
                      className="h-9 w-9 shrink-0 aspect-square p-0 sm:aspect-auto sm:w-auto sm:px-4"
                    >
                      {isLocating ? (
                        <Loader2
                          className="h-4 w-4 animate-spin shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Navigation className="h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                      <span className="hidden sm:inline">
                        {isLocating ? "Finding location..." : "Use my location"}
                      </span>
                    </Button>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isAnalyzing || isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          <span>Submitting report...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          <span>Submit report</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Clean Confirmation Banner */}
                <AnimatePresence>
                  {submittedIssue && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      role="status"
                      aria-live="polite"
                      className="mt-4 rounded-m3-md bg-m3-primary-container p-4 text-sm text-m3-on-primary-container flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2
                          className="h-5 w-5 shrink-0"
                          aria-hidden="true"
                        />
                        <div>
                          <p className="font-medium">
                            Report submitted ({submittedIssue.id})
                          </p>
                          <p className="text-xs opacity-90">
                            Pinned to the Iligan City map at{" "}
                            {submittedIssue.coordinates.addressLabel}.
                          </p>
                        </div>
                      </div>
                      <a
                        href="#map-dashboard"
                        className="shrink-0 rounded-m3-full bg-m3-primary px-3.5 py-1.5 text-xs font-medium text-m3-on-primary hover:brightness-105"
                      >
                        View on map
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

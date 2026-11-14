"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  UploadCloud,
  Sparkles,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Camera,
  FileSpreadsheet,
  Database,
  Wand2,
  RefreshCw,
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
  SheetsSyncResponse,
  UserProfile,
} from "@/types/ecovibe";
import { SAMPLE_ISSUE_PRESETS, SampleIssuePreset } from "@/lib/seed-data";
import { useStorage } from "@/hooks/use-storage";
import { useSheetsSync } from "@/hooks/use-sheets-sync";
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

  // Synchronize CSS :user-invalid with aria-invalid & aria-describedby
  useAriaFormValidation(formRef);

  // Firebase Storage, Google Sheets API, and Geolocation hooks
  const { uploadPhoto, isUploading, uploadProgress } = useStorage();
  const { logIssueToSheets, isSyncing, lastSyncReceipt } = useSheetsSync();
  const {
    coordinates,
    setCoordinates,
    isLocating,
    geoStatus,
    captureGeolocation,
  } = useGeolocation();

  // Form & AI analysis state
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>(
    SAMPLE_ISSUE_PRESETS[0].photoUrl
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>(
    SAMPLE_ISSUE_PRESETS[0].id
  );

  const [isAnalyzingAi, setIsAnalyzingAi] = useState<boolean>(false);
  const [aiScanStage, setAiScanStage] = useState<string>("");
  const [aiResult, setAiResult] = useState<GeminiAnalysisResult | null>({
    category: SAMPLE_ISSUE_PRESETS[0].expectedCategory,
    confidence: SAMPLE_ISSUE_PRESETS[0].confidence,
    severity: SAMPLE_ISSUE_PRESETS[0].expectedSeverity,
    suggestedTitle: SAMPLE_ISSUE_PRESETS[0].suggestedTitle,
    suggestedDescription: SAMPLE_ISSUE_PRESETS[0].suggestedDescription,
    detectedObjects: SAMPLE_ISSUE_PRESETS[0].detectedObjects,
    recommendedAgency: SAMPLE_ISSUE_PRESETS[0].recommendedAgency,
    analysisLatencyMs: 840,
    modelVersion: "gemini-2.5-flash (Vision Placeholder)",
  });

  const [category, setCategory] = useState<IssueCategory>(
    SAMPLE_ISSUE_PRESETS[0].expectedCategory
  );
  const [severity, setSeverity] = useState<IssueSeverity>(
    SAMPLE_ISSUE_PRESETS[0].expectedSeverity
  );
  const [title, setTitle] = useState<string>(
    SAMPLE_ISSUE_PRESETS[0].suggestedTitle
  );
  const [description, setDescription] = useState<string>(
    SAMPLE_ISSUE_PRESETS[0].suggestedDescription
  );
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    issue: CommunityIssue;
    sheetsReceipt: SheetsSyncResponse;
  } | null>(null);

  // Trigger simulated Gemini Vision API image analysis
  const runGeminiImageAnalysis = async (params: {
    fileName?: string;
    preset?: SampleIssuePreset;
  }) => {
    setIsAnalyzingAi(true);
    setSubmissionReceipt(null);
    setAiScanStage("Uploading image frames to Gemini Vision pipeline...");

    const stageTimer1 = setTimeout(() => {
      setAiScanStage("Detecting civic hazard patterns & object bounding boxes...");
    }, 420);

    const stageTimer2 = setTimeout(() => {
      setAiScanStage("Auto-populating Category dropdown & severity telemetry...");
    }, 860);

    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: params.fileName,
          presetId: params.preset?.id,
          imageHint: params.preset?.expectedCategory,
        }),
      });

      await new Promise((r) => setTimeout(r, 1250));
      const data = (await response.json()) as GeminiAnalysisResult;

      const resolvedCategory = params.preset
        ? params.preset.expectedCategory
        : data.category;
      const resolvedSeverity = params.preset
        ? params.preset.expectedSeverity
        : data.severity;
      const resolvedTitle = params.preset
        ? params.preset.suggestedTitle
        : data.suggestedTitle;
      const resolvedDesc = params.preset
        ? params.preset.suggestedDescription
        : data.suggestedDescription;

      setCategory(resolvedCategory);
      setSeverity(resolvedSeverity);
      setTitle(resolvedTitle);
      setDescription(resolvedDesc);
      setAiResult({
        ...data,
        category: resolvedCategory,
        severity: resolvedSeverity,
        suggestedTitle: resolvedTitle,
        suggestedDescription: resolvedDesc,
        detectedObjects: params.preset
          ? params.preset.detectedObjects
          : data.detectedObjects,
        recommendedAgency: params.preset
          ? params.preset.recommendedAgency
          : data.recommendedAgency,
        confidence: params.preset ? params.preset.confidence : data.confidence,
      });

      if (params.preset) {
        setCoordinates(params.preset.coordinates);
      }
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsAnalyzingAi(false);
      setAiScanStage("");
    }
  };

  // Handle user uploading a local image file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setActivePresetId("");

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreviewUrl(String(reader.result));
    };
    reader.readAsDataURL(file);

    await runGeminiImageAnalysis({ fileName: file.name });
  };

  // Handle clicking one of the sample presets
  const handleSelectPreset = async (preset: SampleIssuePreset) => {
    setActivePresetId(preset.id);
    setUploadedFile(null);
    setPhotoPreviewUrl(preset.photoUrl);
    await runGeminiImageAnalysis({ preset });
  };

  // Handle form submission (Firebase Storage + Google Sheets API + Map Pin)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector<HTMLElement>(":invalid");
      firstInvalid?.focus();
      return;
    }

    let finalPhotoUrl = photoPreviewUrl;
    let storagePath = `issues/${user.uid}/${Date.now()}_preset.jpg`;

    if (uploadedFile) {
      const storageRes = await uploadPhoto(uploadedFile, user.uid);
      finalPhotoUrl = storageRes.downloadUrl;
      storagePath = storageRes.storagePath;
    }

    const issueId = `ECO-2026-${Math.floor(200 + Math.random() * 799)}`;
    const createdAt = new Date().toISOString();

    const sheetsReceipt = await logIssueToSheets({
      issueId,
      title,
      category,
      severity,
      lat: coordinates.lat,
      lng: coordinates.lng,
      addressLabel:
        coordinates.addressLabel ||
        formatCoordinates(coordinates.lat, coordinates.lng),
      photoUrl: finalPhotoUrl,
      reporterUid: user.uid,
      reporterName: user.displayName,
      aiConfidence: aiResult?.confidence ?? 0.95,
      createdAt,
    });

    const newIssue: CommunityIssue = {
      id: issueId,
      title,
      description,
      category,
      severity,
      status: "AI Verified",
      photoUrl: finalPhotoUrl,
      storagePath,
      coordinates,
      createdAt,
      reporterName: user.displayName,
      reporterUid: user.uid,
      upvotes: 1,
      aiConfidence: aiResult?.confidence ?? 0.95,
      recommendedAgency:
        aiResult?.recommendedAgency || "EcoVibe Rapid Response Task Force",
      sheetsRowRef: sheetsReceipt.updatedRange,
    };

    setSubmissionReceipt({ issue: newIssue, sheetsReceipt });
    onIssueCreated(newIssue);
  };

  return (
    <section
      id="report-issue"
      aria-labelledby="report-form-heading"
      className="py-16 border-b border-purple-400/20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="default" className="mb-3">
              <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
              Gemini Vision Auto-Classification
            </Badge>
            <h2
              id="report-form-heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
            >
              AI-Assisted Issue Reporting Flow
            </h2>
            <p className="mt-2 max-w-2xl text-purple-200/85">
              Upload a photo of an infrastructure issue or test with a field sample below.
              Our Gemini Vision placeholder inspects the image and auto-populates the{" "}
              <strong className="text-white">Category</strong>, severity, and agency dispatch routing.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-purple-200 bg-[#1b0240] border border-purple-400/30 rounded-m3-lg px-4 py-2.5">
            <Database className="h-4 w-4 text-[#ff4d73] shrink-0" aria-hidden="true" />
            <span>
              Pipeline:{" "}
              <strong className="text-white">
                Firebase Storage → Gemini Vision → Google Sheets API
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column (5 cols): Photo Uploader + AI Vision Scanner Overlay + Sample Presets */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="overflow-hidden border-purple-400/35 bg-[#1b0240]/95">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5 text-[#ff4d73]" aria-hidden="true" />
                    1. Evidence Photo & AI Scan
                  </CardTitle>
                  <Badge variant="secondary" className="text-[11px]">
                    {isAnalyzingAi ? "Scanning..." : "AI Ready"}
                  </Badge>
                </div>
                <CardDescription>
                  Upload your own photo or tap a sample preset to trigger Gemini Vision analysis.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Image Preview + Animated Gemini AI Scanning State */}
                <div className="relative overflow-hidden rounded-m3-lg border-2 border-purple-400/35 bg-[#12002b] aspect-[16/10]">
                  <img
                    src={photoPreviewUrl}
                    alt={`Uploaded community issue preview classified as ${category}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Gemini AI Loading State Overlay */}
                  <AnimatePresence>
                    {isAnalyzingAi && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        role="status"
                        aria-live="polite"
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#12002b]/85 backdrop-blur-sm p-6 text-center"
                      >
                        {/* Animated Laser Scan Bar */}
                        {!prefersReducedMotion && (
                          <motion.div
                            initial={{ top: "5%" }}
                            animate={{ top: ["8%", "88%", "8%"] }}
                            transition={{
                              duration: 1.6,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="pointer-events-none absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff4d73] to-transparent shadow-glow-red"
                          />
                        )}
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#A8002D] text-white shadow-glow-red mb-3">
                          <Loader2
                            className="h-7 w-7 animate-spin"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-sm font-bold text-white tracking-wide">
                          Gemini Vision AI Analyzing Photo...
                        </p>
                        <p className="mt-1 text-xs text-purple-200 max-w-xs">
                          {aiScanStage}
                        </p>
                        <div className="mt-4 w-48 overflow-hidden rounded-full bg-[#2c0468] h-2">
                          <motion.div
                            initial={{ width: "15%" }}
                            animate={{ width: "95%" }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[#5101be] to-[#A8002D]"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI Classification Badge Overlay when Idle */}
                  {!isAnalyzingAi && aiResult && (
                    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-m3-md bg-[#12002b]/90 border border-purple-400/35 px-3 py-2 backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <Sparkles
                          className="h-4 w-4 text-[#ff4d73] shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-xs font-bold text-white">
                          AI Match: {aiResult.category}
                        </span>
                      </div>
                      <span className="rounded-full bg-[#A8002D] px-2.5 py-0.5 text-[11px] font-bold text-white">
                        {Math.round(aiResult.confidence * 100)}% Confidence
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload File Control */}
                <div className="flex flex-col sm:flex-row gap-2.5">
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
                    variant="default"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzingAi}
                    className="w-full"
                  >
                    <UploadCloud className="h-4 w-4" aria-hidden="true" />
                    <span>Upload Issue Photo</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      runGeminiImageAnalysis({
                        fileName: uploadedFile?.name || activePresetId,
                        preset: SAMPLE_ISSUE_PRESETS.find(
                          (p) => p.id === activePresetId
                        ),
                      })
                    }
                    disabled={isAnalyzingAi}
                    className="shrink-0"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    <span>Re-Run AI Scan</span>
                  </Button>
                </div>

                {/* Instant Sample Presets to Test AI Auto-Population */}
                <div className="pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-200/90 mb-2.5">
                    Or Test AI Auto-Classification With Field Presets:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_ISSUE_PRESETS.map((preset) => {
                      const isSelected = activePresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          disabled={isAnalyzingAi}
                          onClick={() => handleSelectPreset(preset)}
                          className={`group flex flex-col items-start rounded-m3-md border p-2.5 text-left transition-all ${
                            isSelected
                              ? "border-[#AB1E2C] bg-[#A8002D]/25 text-white shadow-sm"
                              : "border-purple-400/25 bg-[#12002b]/70 text-purple-200 hover:border-purple-300/50 hover:bg-[#20034d]"
                          }`}
                        >
                          <span className="text-xs font-bold text-white group-hover:text-[#ff859d]">
                            {preset.label}
                          </span>
                          <span className="mt-0.5 text-[11px] text-purple-300 line-clamp-1">
                            Auto-sets: {preset.expectedCategory}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detected Visual Tags from Gemini Vision */}
                {aiResult && (
                  <div className="rounded-m3-md border border-purple-400/25 bg-[#12002b]/80 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-200">
                        Gemini Vision Telemetry
                      </span>
                      <span className="font-mono text-[11px] text-purple-300">
                        {aiResult.analysisLatencyMs}ms • {aiResult.modelVersion}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.detectedObjects.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-purple-400/30 bg-[#5101be]/40 px-2.5 py-0.5 text-[11px] font-medium text-purple-100"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-purple-200/85">
                      Recommended Dispatch:{" "}
                      <strong className="text-[#ff859d]">
                        {aiResult.recommendedAgency}
                      </strong>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (7 cols): Categorized Issue Form & Geolocation Capture */}
          <div className="lg:col-span-7">
            <Card className="border-purple-400/35 bg-[#1b0240]/95">
              <CardHeader>
                <CardTitle className="text-xl">
                  2. Issue Details & Geolocation Dispatch
                </CardTitle>
                <CardDescription>
                  Review the AI-populated category and description, lock your GPS coordinates,
                  and submit to log directly to the municipal Google Sheet and live map.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  aria-label="Community Issue Reporting Form"
                >
                  {/* Row 1: Auto-Populated Category Dropdown & Severity */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="issue-category-select">
                          Issue Category <span aria-hidden="true" className="text-[#ff4d73]">*</span>
                        </Label>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ff859d]">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          AI Auto-Populated
                        </span>
                      </div>
                      <span
                        id="category-hint"
                        className="block text-xs text-purple-200/75"
                      >
                        Auto-detected by Gemini Vision; you can override if needed.
                      </span>
                      <Select
                        value={category}
                        onValueChange={(val) => setCategory(val as IssueCategory)}
                        disabled={isAnalyzingAi}
                      >
                        <SelectTrigger
                          id="issue-category-select"
                          aria-describedby="category-hint"
                          className={
                            isAnalyzingAi
                              ? "animate-pulse border-[#AB1E2C]"
                              : "border-[#AB1E2C]/80 bg-[#12002b]"
                          }
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
                        Urgency / Severity <span aria-hidden="true" className="text-[#ff4d73]">*</span>
                      </Label>
                      <span
                        id="severity-hint"
                        className="block text-xs text-purple-200/75"
                      >
                        Prioritizes emergency road & flood response crews.
                      </span>
                      <Select
                        value={severity}
                        onValueChange={(val) => setSeverity(val as IssueSeverity)}
                        disabled={isAnalyzingAi}
                      >
                        <SelectTrigger
                          id="issue-severity-select"
                          aria-describedby="severity-hint"
                        >
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {SEVERITY_LEVELS.map((lvl) => (
                            <SelectItem key={lvl} value={lvl}>
                              {lvl} Priority
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 2: Issue Title with Accessible Deferred Validation */}
                  <div className="space-y-1.5">
                    <Label htmlFor="issue-title">
                      Issue Summary Title <span aria-hidden="true" className="text-[#ff4d73]">*</span>
                    </Label>
                    <span
                      id="title-hint"
                      className="block text-xs text-purple-200/75"
                    >
                      Provide a concise headline (5 to 120 characters).
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
                      placeholder="e.g., Overflowing waste bins blocking sidewalk"
                    />
                    <div
                      id="title-error"
                      className="field-error-msg items-center gap-1.5 text-xs font-semibold text-[#ff859d] pt-1"
                    >
                      <span role="img" aria-label="Error">
                        ❌
                      </span>
                      <span>
                        Please enter a descriptive issue title of at least 5 characters.
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Detailed Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="issue-description">
                      Field Description & Landmarks{" "}
                      <span aria-hidden="true" className="text-[#ff4d73]">*</span>
                    </Label>
                    <span
                      id="desc-hint"
                      className="block text-xs text-purple-200/75"
                    >
                      Include nearby landmarks, safety risks, or duration of the problem (at least 15 characters).
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
                      placeholder="Describe the issue and nearby landmarks..."
                    />
                    <div
                      id="desc-error"
                      className="field-error-msg items-center gap-1.5 text-xs font-semibold text-[#ff859d] pt-1"
                    >
                      <span role="img" aria-label="Error">
                        ❌
                      </span>
                      <span>
                        Please provide at least 15 characters describing the issue so crews can locate it.
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Geolocation Capture Panel */}
                  <fieldset className="rounded-m3-lg border border-purple-400/35 bg-[#12002b]/90 p-4 space-y-3">
                    <legend className="px-2 text-xs font-bold uppercase tracking-wider text-[#ff859d]">
                      Geolocation Telemetry
                    </legend>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          <Navigation
                            className="h-4 w-4 text-[#ff4d73]"
                            aria-hidden="true"
                          />
                          {coordinates.addressLabel || "Field Coordinates Locked"}
                        </p>
                        <p className="font-mono text-xs text-purple-200">
                          {formatCoordinates(coordinates.lat, coordinates.lng)}{" "}
                          {coordinates.district ? `• ${coordinates.district}` : ""}
                        </p>
                        <p className="text-[11px] text-emerald-300">{geoStatus}</p>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={captureGeolocation}
                        disabled={isLocating}
                        className="shrink-0 border border-[#AB1E2C]/60"
                      >
                        {isLocating ? (
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Navigation className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span>
                          {isLocating ? "Locating GPS..." : "Capture Geolocation"}
                        </span>
                      </Button>
                    </div>
                  </fieldset>

                  {/* Submit Button & Upload/Sync Progress */}
                  <div className="pt-2 space-y-3">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isAnalyzingAi || isUploading || isSyncing}
                      className="w-full text-base font-extrabold shadow-glow-red"
                    >
                      {isUploading || isSyncing ? (
                        <>
                          <Loader2
                            className="h-5 w-5 animate-spin"
                            aria-hidden="true"
                          />
                          <span>
                            {isUploading
                              ? `Uploading Photo to Firebase Storage (${uploadProgress}%)...`
                              : "Appending Row to Google Sheets API..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                          <span>
                            Submit Verified Report & Pin to Map (+50 EcoPoints)
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Live Submission Confirmation & Google Sheets API Receipt */}
                <AnimatePresence>
                  {submissionReceipt && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      role="status"
                      aria-live="polite"
                      className="mt-5 rounded-m3-lg border-2 border-emerald-400/50 bg-emerald-950/40 p-4 text-sm text-emerald-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-2">
                          <CheckCircle2
                            className="h-5 w-5 text-emerald-400"
                            aria-hidden="true"
                          />
                          Issue #{submissionReceipt.issue.id} Dispatched & Pinned!
                        </span>
                        <Badge variant="success">
                          <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                          {submissionReceipt.sheetsReceipt.updatedRange}
                        </Badge>
                      </div>
                      <p className="text-xs text-emerald-200/90">
                        Logged to Google Workspace Sheet{" "}
                        <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[11px]">
                          {submissionReceipt.sheetsReceipt.spreadsheetId.slice(0, 18)}...
                        </code>{" "}
                        and added as an interactive pin on the Map Dashboard below.
                      </p>
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

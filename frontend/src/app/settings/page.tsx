"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  UserProfileService,
  UserProfile,
} from "@/lib/services/user-profile.service";
import { AuthRequired } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.addr) return;

      try {
        const userProfile = await UserProfileService.getUserProfile(user.addr);
        setProfile(userProfile);

        if (userProfile) {
          setFormData({
            email: userProfile.email || "",
            name: userProfile.name || "",
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setResult({
          type: "error",
          message: "Failed to load user profile",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.addr]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setResult({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setResult({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsSaving(true);
    setResult({ type: null, message: "" });

    try {
      const transactionId = await UserProfileService.setupUserProfile(
        formData.email,
        formData.name
      );

      setResult({
        type: "success",
        message: `Profile updated successfully! Transaction ID: ${transactionId}`,
      });

      // Reload profile data
      if (user?.addr) {
        const updatedProfile = await UserProfileService.getUserProfile(
          user.addr
        );
        setProfile(updatedProfile);
      }
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      setResult({
        type: "error",
        message: `Failed to update profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AuthRequired>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 pt-12 pb-24">
            <div className="max-w-2xl mx-auto">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
                  <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthRequired>
    );
  }

  return (
    <AuthRequired>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 pt-12 pb-24">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => router.push("/my-wills")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Wills
              </Button>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your profile and notification preferences
              </p>
            </div>

            {/* Result Message */}
            {result.type && (
              <Alert
                className={`mb-6 ${
                  result.type === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                {result.type === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription
                  className={
                    result.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }
                >
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Profile Form */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Update your profile to receive email notifications for
                  inheritance events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Wallet Address (Read-only) */}
                    <div className="space-y-2">
                      <Label htmlFor="wallet-address">Wallet Address</Label>
                      <Input
                        id="wallet-address"
                        value={user?.addr || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your Flow wallet address (cannot be changed)
                      </p>
                    </div>

                    {/* Owner Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Display Name (Optional)
                      </Label>
                      <Input
                        id="name"
                        placeholder="Your display name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        disabled={isSaving}
                      />
                      <p className="text-xs text-muted-foreground">
                        This name will be displayed in your inheritance settings
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email Address (Optional)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        disabled={isSaving}
                      />
                      <p className="text-xs text-muted-foreground">
                        You&apos;ll receive notifications when your inheritance
                        will expires or when beneficiaries claim assets
                      </p>
                    </div>
                  </div>

                  {/* Profile Status */}
                  {profile && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Current Status</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Email:</strong> {profile.email || "Not set"}
                        </p>
                        <p>
                          <strong>Name:</strong> {profile.name || "Not set"}
                        </p>
                        <p>
                          <strong>Last Updated:</strong>{" "}
                          {new Date(profile.updatedAt * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/my-wills")}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="min-w-[120px]"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Email Testing Card */}
            {profile?.email && (
              <Card className="mt-6 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-green-600" />
                    <span className="text-green-800">
                      Test Email Functionality
                    </span>
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Send a test email to verify your email configuration is
                    working correctly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!profile.email) return;

                        setIsSaving(true);
                        try {
                          const { emailService } = await import(
                            "@/lib/services/email.service"
                          );

                          const success = await emailService.sendTestEmail(
                            profile.email
                          );

                          if (success) {
                            setResult({
                              type: "success",
                              message: `Test email sent successfully to ${profile.email}! Check your inbox.`,
                            });
                          } else {
                            setResult({
                              type: "error",
                              message:
                                "Failed to send test email. Please check your email configuration.",
                            });
                          }
                        } catch (error) {
                          console.error("Test email error:", error);
                          setResult({
                            type: "error",
                            message: `Failed to send test email: ${
                              error instanceof Error
                                ? error.message
                                : "Unknown error"
                            }`,
                          });
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending Test Email...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Test Email
                        </>
                      )}
                    </Button>
                    <div className="text-sm text-green-700">
                      to <strong>{profile.email}</strong>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Information Card */}
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">
                      Email Notifications
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>
                        • Get notified when your inheritance will is about to
                        expire
                      </li>
                      <li>
                        • Receive alerts when beneficiaries claim their
                        inheritance
                      </li>
                      <li>
                        • Stay informed about important inheritance events
                      </li>
                      <li>
                        • All data is stored securely on the Flow blockchain
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthRequired>
  );
}

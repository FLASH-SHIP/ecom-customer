"use client";

import { Button } from "@flash-ship/ecom-ui/components/button";
import { FacebookIcon } from "@flash-ship/ecom-ui/components/icon-component/FacebookIcon";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function OAuthFacebook() {
  const [loading, setLoading] = useState(false);

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("just_logged_in", "true");
      }
      await signIn("facebook", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      onClick={handleFacebookLogin}
      className="flex items-center justify-center gap-2 h-10 rounded-xl bg-background/50 hover:bg-muted text-xs font-bold text-foreground transition-all border-border cursor-pointer disabled:opacity-60"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      ) : (
        <FacebookIcon />
      )}
      <span>Facebook</span>
    </Button>
  );
}

"use client";

import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">⚡</span>
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">
                Last Tx
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Secure your digital assets with inactivity-based inheritance
              contracts. Powered by Flow blockchain for ultimate security and
              transparency.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/create-will"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create Wills
                </Link>
              </li>
              <li>
                <Link
                  href="/my-wills"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Wills
                </Link>
              </li>
              <li>
                <Link
                  href="/claim-will"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Notifications
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">
              Project
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/your-repo/last-tx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  Repository <Github className="h-4 w-4 mx-2" />
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://onflow.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
                >
                  Built on Flow
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2 md:mb-0">
                © 2025 Last Tx. All rights reserved.
              </p>
              <p className="text-xs">
                Developed by:{" "}
                <Link
                  href="https://github.com/m-azzam-azis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-600 transition-colors hover:underline font-bold px-2"
                >
                  M Azzam
                </Link>{" "}
                &{" "}
                <Link
                  href="https://github.com/developer2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-600 transition-colors hover:underline font-bold px-2"
                >
                  Daffa Rafi
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { useToast } from "../ui/Toast";
import { useResumeBuilder } from "../../contexts/ResumeBuilderContext";

const ExternalLatexImporter = ({ onImport }) => {
  const [latexContent, setLatexContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!latexContent.trim()) {
      toast.error("Please paste your LaTeX content first");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/resume/validate-latex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latex: latexContent,
          isExternal: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to validate LaTeX");
      }

      // If validation passes, call the onImport callback
      onImport(latexContent);
      toast.success("LaTeX template imported successfully");
    } catch (error) {
      console.error("LaTeX validation error:", error);
      toast.error(`LaTeX Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle>Import External LaTeX</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <textarea
            className="w-full h-48 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono"
            placeholder="Paste your LaTeX template here..."
            value={latexContent}
            onChange={(e) => setLatexContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleImport}
              disabled={isLoading || !latexContent.trim()}
              variant="gradient"
            >
              {isLoading ? "Importing..." : "Import Template"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExternalLatexImporter;

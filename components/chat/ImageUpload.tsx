"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadDropzone } from "@/utils/uploadthing";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

interface ImageUploadProps {
  onImageUpload: (urls: string[]) => void;
  disabled?: boolean;
}

export function ImageUpload({ onImageUpload, disabled }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload logic here
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          // Handle pasted image
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setImages((prev) => [...prev, result]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (images.length > 0) {
      onImageUpload(images);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon size={20} />
        <span className="font-medium">Upload Images</span>
      </div>

      <UploadDropzone
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          const urls = res.map((file) => file.url);
          setImages((prev) => [...prev, ...urls]);
        }}
        onUploadError={(error: Error) => {
          console.error("Upload error:", error);
        }}
        className={`ut-button:bg-primary ut-button:ut-readying:bg-primary/50`}
      />

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          Drag & drop images here, or paste from clipboard (Ctrl+V)
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={() => removeImage(index)}
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <Button onClick={handleUpload} disabled={disabled} className="w-full">
          Analyze Images
        </Button>
      )}
    </Card>
  );
}

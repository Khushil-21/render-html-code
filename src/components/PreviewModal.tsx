import React from "react";
import FullscreenPreview from "./FullscreenPreview";

interface PreviewModalProps {
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewModal({ code, isOpen, onClose }: PreviewModalProps) {
  if (!isOpen) return null;

  return <FullscreenPreview output={code} onClose={onClose} initialPage="index.html" />;
}

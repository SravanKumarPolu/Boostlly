/**
 * Quote Image Customizer Component
 * 
 * Provides a UI for customizing quote images with:
 * - Gradient backgrounds
 * - Font selection
 * - Watermark options
 * - Real-time preview
 * - Export PNG
 */

import React, { useState, useCallback } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@boostlly/ui';
import { 
  generateEnhancedQuoteImage, 
  downloadImage,
  type FontFamily,
  type GradientPreset,
  type WatermarkOptions,
  type EnhancedQuoteImageOptions,
} from '@boostlly/core';
import { 
  Download, 
  Image as ImageIcon, 
  Palette, 
  Type, 
  Droplet,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';

interface QuoteImageCustomizerProps {
  quoteText: string;
  author: string;
  onClose?: () => void;
}

const GRADIENT_OPTIONS: Array<{ value: GradientPreset; label: string; preview: string }> = [
  { value: "purple-blue", label: "Purple Blue", preview: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { value: "orange-pink", label: "Sunset", preview: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { value: "teal-green", label: "Ocean", preview: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { value: "sunset", label: "Golden Sunset", preview: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { value: "ocean", label: "Deep Ocean", preview: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)" },
  { value: "forest", label: "Forest", preview: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)" },
  { value: "lavender", label: "Lavender", preview: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { value: "golden", label: "Golden", preview: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)" },
  { value: "midnight", label: "Midnight", preview: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)" },
  { value: "rose", label: "Rose", preview: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
];

const FONT_OPTIONS: Array<{ value: FontFamily; label: string }> = [
  { value: "sans-serif", label: "Sans Serif" },
  { value: "serif", label: "Serif" },
  { value: "playfair", label: "Playfair Display" },
  { value: "montserrat", label: "Montserrat" },
  { value: "lora", label: "Lora" },
  { value: "merriweather", label: "Merriweather" },
  { value: "opensans", label: "Open Sans" },
  { value: "cursive", label: "Cursive" },
  { value: "monospace", label: "Monospace" },
];

export function QuoteImageCustomizer({ quoteText, author, onClose }: QuoteImageCustomizerProps) {
  const [backgroundType, setBackgroundType] = useState<"gradient" | "solid">("gradient");
  const [gradientPreset, setGradientPreset] = useState<GradientPreset>("purple-blue");
  const [backgroundColor, setBackgroundColor] = useState("#1e293b");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState<FontFamily>("sans-serif");
  const [fontWeight, setFontWeight] = useState<"normal" | "bold" | "300" | "400" | "500" | "600" | "700">("600");
  const [watermark, setWatermark] = useState<WatermarkOptions>({
    enabled: false,
    text: "Boostlly",
    position: "bottom-right",
    opacity: 0.3,
    fontSize: 14,
  });
  const [showLogo, setShowLogo] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleGeneratePreview = useCallback(async () => {
    setIsGenerating(true);
    try {
      const options: EnhancedQuoteImageOptions = {
        width: 800,
        height: 600,
        backgroundType,
        gradientPreset: backgroundType === "gradient" ? gradientPreset : undefined,
        backgroundColor: backgroundType === "solid" ? backgroundColor : undefined,
        textColor,
        fontSize,
        fontFamily,
        fontWeight,
        watermark,
        showLogo,
      };

      const dataUrl = await generateEnhancedQuoteImage(quoteText, author, options);
      setPreviewUrl(dataUrl);
    } catch (error) {
      console.error("Failed to generate preview:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [
    quoteText,
    author,
    backgroundType,
    gradientPreset,
    backgroundColor,
    textColor,
    fontSize,
    fontFamily,
    fontWeight,
    watermark,
    showLogo,
  ]);

  const handleExport = useCallback(async () => {
    setIsGenerating(true);
    try {
      const options: EnhancedQuoteImageOptions = {
        width: 1200,
        height: 800,
        backgroundType,
        gradientPreset: backgroundType === "gradient" ? gradientPreset : undefined,
        backgroundColor: backgroundType === "solid" ? backgroundColor : undefined,
        textColor,
        fontSize,
        fontFamily,
        fontWeight,
        watermark,
        showLogo,
      };

      const dataUrl = await generateEnhancedQuoteImage(quoteText, author, options);
      const filename = `boostlly-quote-${Date.now()}.png`;
      downloadImage(dataUrl, filename);
    } catch (error) {
      console.error("Failed to export image:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [
    quoteText,
    author,
    backgroundType,
    gradientPreset,
    backgroundColor,
    textColor,
    fontSize,
    fontFamily,
    fontWeight,
    watermark,
    showLogo,
  ]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl shadow-2xl border-2 max-h-[90vh] overflow-y-auto">
        <CardHeader className="sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Customize Quote Image
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close customizer">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Preview
              </h3>
              <Button
                onClick={handleGeneratePreview}
                disabled={isGenerating}
                size="sm"
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Preview"
                )}
              </Button>
            </div>
            {previewUrl && (
              <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/30">
                <img
                  src={previewUrl}
                  alt="Quote preview"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Background Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Background
            </h3>
            <div className="flex gap-2 mb-4">
              <Button
                variant={backgroundType === "gradient" ? "default" : "outline"}
                onClick={() => setBackgroundType("gradient")}
                size="sm"
              >
                Gradient
              </Button>
              <Button
                variant={backgroundType === "solid" ? "default" : "outline"}
                onClick={() => setBackgroundType("solid")}
                size="sm"
              >
                Solid Color
              </Button>
            </div>

            {backgroundType === "gradient" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {GRADIENT_OPTIONS.map((gradient) => (
                  <button
                    key={gradient.value}
                    onClick={() => setGradientPreset(gradient.value)}
                    className={`
                      h-20 rounded-lg border-2 transition-all
                      ${gradientPreset === gradient.value
                        ? "border-primary scale-105 shadow-lg"
                        : "border-border hover:border-primary/50"
                      }
                    `}
                    style={{ background: gradient.preview }}
                    title={gradient.label}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Color:</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="px-3 py-2 border rounded w-32"
                  placeholder="#1e293b"
                />
              </div>
            )}
          </div>

          {/* Text Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Type className="w-5 h-5" />
              Typography
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                  className="w-full px-3 py-2 border rounded bg-background"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Font Weight</label>
                <select
                  value={fontWeight}
                  onChange={(e) => setFontWeight(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded bg-background"
                >
                  <option value="300">Light (300)</option>
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi Bold (600)</option>
                  <option value="700">Bold (700)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="60"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="px-3 py-2 border rounded flex-1"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Watermark Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Droplet className="w-5 h-5" />
              Watermark
            </h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watermark.enabled}
                  onChange={(e) =>
                    setWatermark({ ...watermark, enabled: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span>Enable Watermark</span>
              </label>
            </div>
            {watermark.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Watermark Text</label>
                  <input
                    type="text"
                    value={watermark.text || ""}
                    onChange={(e) =>
                      setWatermark({ ...watermark, text: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Boostlly"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Position</label>
                  <select
                    value={watermark.position}
                    onChange={(e) =>
                      setWatermark({
                        ...watermark,
                        position: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border rounded bg-background"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="center">Center</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Opacity: {((watermark.opacity || 0.3) * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={watermark.opacity || 0.3}
                    onChange={(e) =>
                      setWatermark({
                        ...watermark,
                        opacity: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Logo Options */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Show Boostlly Logo</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button
              onClick={handleExport}
              disabled={isGenerating}
              className="min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export PNG
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


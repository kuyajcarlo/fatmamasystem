import { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  RefreshCw,
  Send,
  Lock,
  CheckCircle,
  ScanSearch,
  Eye,
  EyeOff,
  RotateCcw,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useCakeDesign } from '../context/CakeDesignContext';
import { useSubmitLock } from '../hooks/useSubmitLock';

const cakeSizes = [
  { id: 'small', name: 'Small', inches: '6"', serves: 'Serves 8–10', price: 450, layerPrice: 75 },
  { id: 'medium', name: 'Medium', inches: '8"', serves: 'Serves 12–15', price: 650, layerPrice: 100 },
  { id: 'large', name: 'Large', inches: '10"', serves: 'Serves 20–25', price: 850, layerPrice: 150 },
  { id: 'xl', name: 'XL', inches: '12"', serves: 'Serves 30–35', price: 1100, layerPrice: 200 },
];

const layerOptions = [
  { value: '1', label: '1 Layer' },
  { value: '2', label: '2 Layers' },
  { value: '3', label: '3 Layers' },
  { value: '4', label: '4 Layers' },
];

const cakeToppers = [
  { id: 'keep-original', name: 'Keep Original', description: 'Keep toppings from your photo' },
  { id: 'none', name: 'None', description: 'Remove toppers/candles' },
  { id: 'flowers', name: 'Flowers', description: 'Fresh or sugar flowers' },
  { id: 'candles', name: 'Candles', description: 'Classic birthday candles' },
  { id: 'figurines', name: 'Fondant Figurines', description: 'Custom fondant art' },
  { id: 'fruit', name: 'Fresh Fruit', description: 'Seasonal fresh fruit' },
  { id: 'macarons', name: 'Macarons', description: 'Colorful macaron stack' },
  { id: 'gold-leaf', name: 'Gold Leaf', description: 'Luxe edible gold' },
  { id: 'sprinkles', name: 'Sprinkles', description: 'Fun colorful sprinkles' },
  { id: 'other', name: 'Other', description: 'Describe your own topper' },
];

const cakeColors = [
  { name: 'Pink', value: '#FFB6C1' },
  { name: 'Blue', value: '#87CEEB' },
  { name: 'Purple', value: '#DDA0DD' },
  { name: 'Green', value: '#90EE90' },
  { name: 'Yellow', value: '#FFD700' },
  { name: 'Orange', value: '#FFA07A' },
  { name: 'Red', value: '#FF6B6B' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Brown', value: '#D2691E' },
];

const flavorOptions = [
  'Same as Photo',
  'Chocolate',
  'Ube',
  'Vanilla',
  'Mocha',
  'Red Velvet',
  'Lemon',
  'Carrot',
  'Strawberry',
];

const frostingOptions = [
  'Same as Photo',
  'Buttercream',
  'Cream Cheese',
  'Fondant',
  'Whipped Cream',
];

function calcPrice(sizeId, layers) {
  const size = cakeSizes.find((s) => s.id === sizeId) || cakeSizes[1];
  const extraLayers = Math.max(0, parseInt(layers, 10) - 1);
  return size.price + extraLayers * size.layerPrice;
}

function snapToStep(val, step = 16, min = 512, max = 1024) {
  return Math.max(min, Math.min(max, Math.round(val / step) * step));
}

function prepareImageForAI(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported image format.'));
      img.onload = () => {
        const maxSide = 1024;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: String(reader.result),
            mimeType: file.type || 'image/jpeg',
            outputWidth: 768,
            outputHeight: 768,
          });
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        let dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        if (dataUrl.length > 2_500_000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        }

        const aiBase = 768;
        const aspect = targetW / targetH;
        const outputWidth = aspect >= 1 ? aiBase : snapToStep(aiBase * aspect);
        const outputHeight = aspect >= 1 ? snapToStep(aiBase / aspect) : aiBase;

        resolve({
          dataUrl,
          mimeType: 'image/jpeg',
          outputWidth,
          outputHeight,
        });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function parseJsonResponse(res, fallbackMessage) {
  const text = await res.text();
  if (!text || !text.trim()) {
    if (res.status === 404 || res.status === 405) {
      throw new Error(
        `AI backend endpoint is not reachable (HTTP ${res.status}). Make sure the Node server is running.`
      );
    }
    throw new Error(
      `${fallbackMessage} (Server returned an empty HTTP ${res.status || 'unknown'} response.)`
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    const preview = text.trim().slice(0, 120);
    if (preview.startsWith('<')) {
      throw new Error(
        `AI backend returned HTML instead of JSON (HTTP ${res.status}). Make sure the Node server is running.`
      );
    }
    throw new Error(`${fallbackMessage} (HTTP ${res.status}: invalid server response)`);
  }
}

export default function Design() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { submitRequest } = useCakeDesign();
  const detailInputRef = useRef(null);

  const [submitted, setSubmitted] = useState(false);
  const [originalImage, setOriginalImage] = useState('');
  const [imageMeta, setImageMeta] = useState({
    mimeType: 'image/jpeg',
    outputWidth: 768,
    outputHeight: 768,
  });
  const [generatedImage, setGeneratedImage] = useState('');
  const [previewMode, setPreviewMode] = useState('original');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showBoxes, setShowBoxes] = useState(true);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [detailDraft, setDetailDraft] = useState('');
  const [detailEdits, setDetailEdits] = useState([]);

  const [customization, setCustomization] = useState({
    text: '',
    sizeId: 'medium',
    flavor: 'Same as Photo',
    frosting: 'Same as Photo',
    layers: '1',
    topper: 'keep-original',
    otherTopper: '',
    color: 'keep-original',
    occasion: 'Birthday',
    decorations: '',
  });

  const selectedSize = cakeSizes.find((s) => s.id === customization.sizeId) || cakeSizes[1];
  const totalPrice = calcPrice(customization.sizeId, customization.layers);
  const extraLayers = Math.max(0, parseInt(customization.layers, 10) - 1);
  const layerSurcharge = extraLayers * selectedSize.layerPrice;

  const activeImage =
    previewMode === 'edited' && generatedImage ? generatedImage : originalImage;

  const selectedDetail =
    analysis?.details?.find((d) => d.id === selectedDetailId) || null;

  const runAnalyzeCake = async (dataUrl, mimeType) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setSelectedDetailId(null);
    setDetailDraft('');
    try {
      const res = await fetch('/api/analyze-cake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl, mimeType }),
      });
      const data = await parseJsonResponse(res, 'Could not scan cake details.');
      if (!res.ok) {
        throw new Error(data?.error || 'Could not scan cake details.');
      }
      setAnalysis(data);
      setShowBoxes(true);
      if (data.fallback) {
        toast.info('Cake photo ready! Click any cake area or use the options to customize.');
      } else {
        toast.success(
          data.details?.length
            ? `Scanned ${data.details.length} editable cake details!`
            : 'Cake photo scanned!'
        );
      }
    } catch (err) {
      console.error('Cake scan failed:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to scan cake photo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const prepared = await prepareImageForAI(file);
      setOriginalImage(prepared.dataUrl);
      setImageMeta({
        mimeType: prepared.mimeType,
        outputWidth: prepared.outputWidth,
        outputHeight: prepared.outputHeight,
      });
      setGeneratedImage('');
      setPreviewMode('original');
      setDetailEdits([]);
      setSubmitted(false);
      await runAnalyzeCake(prepared.dataUrl, prepared.mimeType);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load image.');
    }
  };

  const handleSelectDetail = (detail) => {
    setSelectedDetailId(detail.id);
    const existing = detailEdits.find((item) => item.id === detail.id);
    setDetailDraft(existing ? existing.edit : '');
    setTimeout(() => detailInputRef.current?.focus(), 50);
  };

  const handleSaveDetailEdit = () => {
    if (!selectedDetail) return;
    const trimmed = detailDraft.trim();
    if (!trimmed) {
      setDetailEdits((prev) => prev.filter((item) => item.id !== selectedDetail.id));
      toast.info(`Cleared edit for ${selectedDetail.label}`);
      return;
    }
    setDetailEdits((prev) => {
      const idx = prev.findIndex((item) => item.id === selectedDetail.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { id: selectedDetail.id, label: selectedDetail.label, edit: trimmed };
        return next;
      }
      return [...prev, { id: selectedDetail.id, label: selectedDetail.label, edit: trimmed }];
    });
    toast.success(`Queued edit for ${selectedDetail.label}`);
  };

  const handleRemoveDetailEdit = (id) => {
    setDetailEdits((prev) => prev.filter((item) => item.id !== id));
    if (selectedDetailId === id) {
      setDetailDraft('');
    }
  };

  const handleResetGenerated = () => {
    setGeneratedImage('');
    setPreviewMode('original');
    toast.info('Reverted preview to original photo.');
  };

  const generateCake = async () => {
    if (!originalImage) {
      toast.error('Please upload a cake photo first.');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedTopperObj = cakeToppers.find((t) => t.id === customization.topper);
      const topperValue =
        customization.topper === 'keep-original'
          ? 'Keep Original'
          : customization.topper === 'other'
          ? customization.otherTopper.trim() || 'Custom Topper'
          : selectedTopperObj?.name || 'Keep Original';

      const selectedColorObj = cakeColors.find((c) => c.value === customization.color);
      const colorName =
        customization.color === 'keep-original'
          ? 'Keep Original'
          : selectedColorObj?.name || customization.color;

      const payload = {
        imageBase64: originalImage,
        mimeType: imageMeta.mimeType,
        outputWidth: imageMeta.outputWidth,
        outputHeight: imageMeta.outputHeight,
        icingType:
          customization.frosting === 'Same as Photo' ? null : customization.frosting,
        flavor: customization.flavor === 'Same as Photo' ? null : customization.flavor,
        size: `${selectedSize.name} ${selectedSize.inches}`,
        layers: parseInt(customization.layers, 10),
        colorName,
        topper: topperValue,
        cakeText: customization.text,
        detailEdits: detailEdits.map((d) => ({ label: d.label, edit: d.edit })),
        instructions: customization.decorations,
      };

      const res = await fetch('/api/generate-cake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await parseJsonResponse(res, 'Failed to generate custom cake.');
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to generate custom cake.');
      }
      if (!data.generatedImage) {
        throw new Error('No image was returned by the generator.');
      }

      setGeneratedImage(data.generatedImage);
      setPreviewMode('edited');
      setSubmitted(false);
      toast.success('Your custom cake design is ready!');
    } catch (err) {
      console.error('Cake generation failed:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to generate custom cake.');
    } finally {
      setIsGenerating(false);
    }
  };

  const [handleSubmitForApproval, submitting] = useSubmitLock(async () => {
    if (!isLoggedIn) {
      navigate('/account?redirect=design');
      return;
    }
    if (!originalImage) {
      toast.error('Please upload a reference cake photo before submitting.');
      return;
    }

    const detailSummary =
      detailEdits.length > 0
        ? `Detail edits: ${detailEdits.map((d) => `${d.label} (${d.edit})`).join('; ')}`
        : '';
    const combinedDecorations = [customization.decorations.trim(), detailSummary]
      .filter(Boolean)
      .join(' | ');

    const resolvedFlavor =
      customization.flavor === 'Same as Photo'
        ? analysis?.flavor || 'Same as Photo'
        : customization.flavor;
    const resolvedFrosting =
      customization.frosting === 'Same as Photo'
        ? analysis?.icingType || 'Same as Photo'
        : customization.frosting;

    await submitRequest({
      customerEmail: user.email,
      customerName: user.name,
      sizeId: customization.sizeId,
      sizeName: `${selectedSize.name} ${selectedSize.inches}`,
      layers: customization.layers,
      flavor: resolvedFlavor,
      frosting: resolvedFrosting,
      topper: customization.topper === 'keep-original' ? 'Keep Original' : customization.topper,
      otherTopper: customization.otherTopper,
      color: customization.color === 'keep-original' ? 'As in Photo' : customization.color,
      occasion: customization.occasion,
      text: customization.text,
      decorations: combinedDecorations,
      imageUrl: generatedImage || originalImage,
      basePrice: totalPrice,
    });

    setSubmitted(true);
    toast.success('Design submitted for review! Track it under My Orders.');
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#2C5F4F] to-[#1F4437] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8 text-[#D4A843]" />
          </div>
          <h1 className="text-4xl sm:text-5xl text-white mb-2 font-bold">AI Cake Designer</h1>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
            Upload your cake photo, click any scanned detail to customize, and preview your edits with AI
          </p>
        </div>
      </section>

      {/* Main Design Interface */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Guest wall */}
          {!isLoggedIn && (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[#2C5F4F]/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-9 h-9 text-[#2C5F4F]" />
              </div>
              <h2 className="text-2xl font-bold text-[#2C5F4F] mb-3">Sign in to Design Your Cake</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Create an account or sign in to access our AI Cake Designer and place your custom cake order.
              </p>
              <button
                onClick={() => navigate('/account?redirect=design')}
                className="w-full bg-[#D4A843] hover:bg-[#B8923A] text-white py-3 rounded-lg font-semibold text-base transition-colors"
              >
                Sign In / Create Account
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Already browsing?{' '}
                <button onClick={() => navigate(-1)} className="underline hover:text-gray-600">
                  Go back
                </button>
              </p>
            </div>
          )}

          {isLoggedIn && (
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Left — Preview & Scanned Details */}
              <div className="bg-white rounded-xl shadow-sm border border-black/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-[#2C5F4F]">Preview</h2>

                  <div className="flex items-center gap-2">
                    {generatedImage && (
                      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setPreviewMode('original')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                            previewMode === 'original'
                              ? 'bg-white text-[#2C5F4F] shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Original
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode('edited')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                            previewMode === 'edited'
                              ? 'bg-white text-[#2C5F4F] shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          AI Edited
                        </button>
                      </div>
                    )}

                    {analysis?.details?.length > 0 && previewMode === 'original' && (
                      <button
                        type="button"
                        onClick={() => setShowBoxes((v) => !v)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2C5F4F] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {showBoxes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showBoxes ? 'Hide Boxes' : 'Show Boxes'}
                      </button>
                    )}

                    {generatedImage && (
                      <button
                        type="button"
                        onClick={handleResetGenerated}
                        title="Clear AI edit"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Stage */}
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-200">
                  {!activeImage ? (
                    <label className="w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="w-14 h-14 rounded-full bg-[#D4A843]/15 flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-[#D4A843]" />
                      </div>
                      <p className="text-base font-semibold text-[#2C5F4F] mb-1">
                        Upload your cake photo
                      </p>
                      <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                        Your exact cake stays intact—AI only edits the flavor, layers, topper, details, or text you choose.
                      </p>
                    </label>
                  ) : (
                    <>
                      <img
                        src={activeImage}
                        alt="Custom Cake Design"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />

                      {/* Clickable 2D Bounding Boxes from Gemini Scanner */}
                      {previewMode === 'original' &&
                        showBoxes &&
                        !isAnalyzing &&
                        !isGenerating &&
                        analysis?.details?.map((detail) => {
                          const [ymin, xmin, ymax, xmax] = detail.box_2d;
                          const isSelected = selectedDetailId === detail.id;
                          const hasEdit = detailEdits.some((d) => d.id === detail.id);
                          return (
                            <button
                              key={detail.id}
                              type="button"
                              onClick={() => handleSelectDetail(detail)}
                              aria-label={`Edit ${detail.label}`}
                              style={{
                                top: `${ymin / 10}%`,
                                left: `${xmin / 10}%`,
                                height: `${Math.max(4, (ymax - ymin) / 10)}%`,
                                width: `${Math.max(4, (xmax - xmin) / 10)}%`,
                              }}
                              className={`absolute rounded transition-all text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                                isSelected
                                  ? 'border-2 border-[#D4A843] bg-[#D4A843]/20 z-20 shadow-md'
                                  : hasEdit
                                  ? 'border-2 border-[#2C5F4F] bg-[#2C5F4F]/15 z-10'
                                  : 'border-2 border-dashed border-white/90 hover:border-[#D4A843] hover:bg-[#D4A843]/15 z-10'
                              }`}
                            >
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-br shadow-sm whitespace-nowrap ${
                                  isSelected
                                    ? 'bg-[#D4A843] text-white'
                                    : hasEdit
                                    ? 'bg-[#2C5F4F] text-white'
                                    : 'bg-black/70 text-white group-hover:bg-[#D4A843]'
                                }`}
                              >
                                {hasEdit && <Check className="w-3 h-3" />}
                                {detail.label}
                              </span>
                            </button>
                          );
                        })}

                      {/* Live Cake Text Preview (shown on original before AI bakes lettering in) */}
                      {previewMode === 'original' && customization.text.trim() !== '' && (
                        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[90%] z-30">
                          <div
                            className="text-lg sm:text-xl font-bold px-4 py-1.5 rounded-lg shadow-md text-center truncate"
                            style={{
                              color:
                                customization.color === 'keep-original' ||
                                customization.color === '#FFFFFF'
                                  ? '#2C5F4F'
                                  : customization.color,
                              backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            }}
                          >
                            {customization.text}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Scanning / Generating Scrim */}
                  {(isAnalyzing || isGenerating) && (
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-6 z-40">
                      <Loader2 className="w-9 h-9 animate-spin text-[#D4A843] mb-3" />
                      <p className="font-semibold text-base">
                        {isAnalyzing
                          ? 'Scanning cake details…'
                          : 'Generating custom cake with AI…'}
                      </p>
                      <p className="text-xs text-white/80 mt-1 text-center">
                        {isAnalyzing
                          ? 'Detecting frosting, flavor, and editable parts'
                          : 'Preserving your exact cake shape, lighting, and plate'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Preview Action Row */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <label className="flex-1 min-w-[130px] cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-4 rounded-lg transition-colors font-medium text-sm whitespace-nowrap">
                      <Upload className="w-4 h-4" />
                      <span>{originalImage ? 'Change Photo' : 'Upload Image'}</span>
                    </div>
                  </label>

                  {originalImage && (
                    <button
                      type="button"
                      onClick={() => runAnalyzeCake(originalImage, imageMeta.mimeType)}
                      disabled={isAnalyzing || isGenerating}
                      className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-[#2C5F4F] py-2.5 px-4 rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
                    >
                      <ScanSearch className={`w-4 h-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
                      <span>{isAnalyzing ? 'Scanning…' : 'Re-scan'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={generateCake}
                    disabled={!originalImage || isGenerating || isAnalyzing}
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-[#D4A843] hover:bg-[#B8923A] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg transition-colors font-semibold text-sm whitespace-nowrap"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? 'Generating…' : 'Generate with AI'}</span>
                  </button>
                </div>

                {/* Scanned Cake Details & Targeted Edits */}
                {analysis && (
                  <div className="mb-5 pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      <span className="font-semibold text-[#2C5F4F]">Detected</span>
                      <span aria-hidden="true">·</span>
                      <span>{analysis.cakeType}</span>
                      <span aria-hidden="true">·</span>
                      <span>{analysis.icingType}</span>
                      <span aria-hidden="true">·</span>
                      <span>{analysis.flavor}</span>
                    </div>

                    {analysis.summary && (
                      <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>
                    )}

                    {analysis.details?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">
                          Click a detected detail to customize it:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.details.map((detail) => {
                            const isSelected = selectedDetailId === detail.id;
                            const hasEdit = detailEdits.some((d) => d.id === detail.id);
                            return (
                              <button
                                key={detail.id}
                                type="button"
                                onClick={() => handleSelectDetail(detail)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                                  isSelected
                                    ? 'border-[#D4A843] bg-amber-50 text-[#2C5F4F]'
                                    : hasEdit
                                    ? 'border-[#2C5F4F] bg-emerald-50 text-[#2C5F4F]'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                }`}
                              >
                                {hasEdit && <Check className="w-3 h-3 text-[#2C5F4F]" />}
                                {detail.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Inline Editor for Selected Detail */}
                    {selectedDetail && (
                      <div className="bg-amber-50/70 border border-[#D4A843]/40 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-[#2C5F4F]">
                            Edit "{selectedDetail.label}"
                          </label>
                          <button
                            type="button"
                            onClick={() => setSelectedDetailId(null)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Close detail editor"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            ref={detailInputRef}
                            type="text"
                            value={detailDraft}
                            onChange={(e) => setDetailDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveDetailEdit();
                              }
                            }}
                            placeholder={`Describe what to change on ${selectedDetail.label}…`}
                            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleSaveDetailEdit}
                            className="px-4 py-2 bg-[#2C5F4F] hover:bg-[#1F4437] text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Active Detail Edits Queue */}
                    {detailEdits.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-500">Queued detail edits:</p>
                        {detailEdits.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs"
                          >
                            <div className="truncate">
                              <span className="font-semibold text-[#2C5F4F]">{item.label}:</span>{' '}
                              <span className="text-gray-700">{item.edit}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveDetailEdit(item.id)}
                              className="text-gray-400 hover:text-red-600 shrink-0"
                              aria-label={`Remove edit for ${item.label}`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Live price breakdown */}
                <div className="bg-[#2C5F4F]/5 border border-[#2C5F4F]/20 rounded-lg p-4 space-y-2 tabular-nums">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Price Breakdown
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Base — {selectedSize.name} {selectedSize.inches} ({selectedSize.serves})
                    </span>
                    <span className="font-medium">₱{selectedSize.price.toLocaleString()}</span>
                  </div>
                  {layerSurcharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        +{extraLayers} extra layer{extraLayers > 1 ? 's' : ''} (₱{selectedSize.layerPrice}/layer)
                      </span>
                      <span className="font-medium">₱{layerSurcharge.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-[#2C5F4F]/20 pt-2 flex justify-between">
                    <span className="font-semibold text-[#2C5F4F]">Total</span>
                    <span className="font-bold text-[#D4A843]">₱{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Right — Options */}
              <div className="bg-white rounded-xl shadow-sm border border-black/10 p-6 space-y-6">
                <h2 className="text-2xl font-bold text-[#2C5F4F]">Customize Your Cake</h2>

                {/* Cake Text */}
                <div>
                  <label className="block mb-2 font-medium text-sm">
                    Cake Text <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customization.text}
                    onChange={(e) => setCustomization({ ...customization, text: e.target.value })}
                    placeholder="e.g. Happy Birthday!"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none"
                  />
                </div>

                {/* Cake Size */}
                <div>
                  <label className="block mb-2 font-medium text-sm">Cake Size</label>
                  <div className="grid grid-cols-2 gap-3 tabular-nums">
                    {cakeSizes.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => setCustomization({ ...customization, sizeId: size.id })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          customization.sizeId === size.id
                            ? 'border-[#D4A843] bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-semibold text-sm">
                            {size.name} {size.inches}
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              customization.sizeId === size.id ? 'text-[#D4A843]' : 'text-[#2C5F4F]'
                            }`}
                          >
                            ₱{size.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{size.serves}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          +₱{size.layerPrice}/extra layer
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layers */}
                <div>
                  <label className="block mb-2 font-medium text-sm">
                    Layers
                    <span className="ml-2 font-normal text-gray-500 tabular-nums">
                      {extraLayers > 0
                        ? `(+₱${layerSurcharge.toLocaleString()} for ${extraLayers} extra layer${
                            extraLayers > 1 ? 's' : ''
                          })`
                        : '(1 layer included)'}
                    </span>
                  </label>
                  <div className="grid grid-cols-4 gap-2 tabular-nums">
                    {layerOptions.map((opt) => {
                      const extra = Math.max(0, parseInt(opt.value, 10) - 1);
                      const surcharge = extra * selectedSize.layerPrice;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCustomization({ ...customization, layers: opt.value })}
                          className={`p-2.5 rounded-lg border-2 text-center transition-all ${
                            customization.layers === opt.value
                              ? 'border-[#D4A843] bg-amber-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold text-sm">{opt.value}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {surcharge > 0 ? `+₱${surcharge.toLocaleString()}` : 'Included'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Flavor and Frosting */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-sm">Flavor</label>
                    <select
                      value={customization.flavor}
                      onChange={(e) => setCustomization({ ...customization, flavor: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none"
                    >
                      {flavorOptions.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-sm">Frosting</label>
                    <select
                      value={customization.frosting}
                      onChange={(e) =>
                        setCustomization({ ...customization, frosting: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none"
                    >
                      {frostingOptions.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Occasion */}
                <div>
                  <label className="block mb-2 font-medium text-sm">Occasion</label>
                  <select
                    value={customization.occasion}
                    onChange={(e) =>
                      setCustomization({ ...customization, occasion: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none"
                  >
                    <option>Birthday</option>
                    <option>Wedding</option>
                    <option>Anniversary</option>
                    <option>Baby Shower</option>
                    <option>Graduation</option>
                    <option>Other</option>
                  </select>
                </div>

                {/* Cake Toppers */}
                <div>
                  <label className="block mb-2 font-medium text-sm">Cake Topper</label>
                  <div className="grid grid-cols-2 gap-2">
                    {cakeToppers.map((topper) => (
                      <button
                        key={topper.id}
                        type="button"
                        onClick={() => setCustomization({ ...customization, topper: topper.id })}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          customization.topper === topper.id
                            ? 'border-[#D4A843] bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{topper.name}</div>
                        <div className="text-xs text-gray-500">{topper.description}</div>
                      </button>
                    ))}
                  </div>

                  {customization.topper === 'other' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={customization.otherTopper}
                        onChange={(e) =>
                          setCustomization({ ...customization, otherTopper: e.target.value })
                        }
                        placeholder="e.g. Butterfly wings, Edible photo, Balloon arch..."
                        className="w-full border border-[#D4A843] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none bg-amber-50"
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Describe your topper and our team will do their best to accommodate it.
                      </p>
                    </div>
                  )}
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block mb-2 font-medium text-sm">Primary Color</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCustomization({ ...customization, color: 'keep-original' })
                      }
                      className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all whitespace-nowrap ${
                        customization.color === 'keep-original'
                          ? 'border-[#D4A843] bg-amber-50 text-[#2C5F4F]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Keep Original
                    </button>
                    {cakeColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setCustomization({ ...customization, color: color.value })}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${
                          customization.color === color.value
                            ? 'border-[#D4A843] scale-110 ring-2 ring-[#D4A843]/30'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                        aria-label={`Select ${color.name} frosting`}
                      />
                    ))}
                  </div>
                </div>

                {/* Decorations */}
                <div>
                  <label className="block mb-2 font-medium text-sm">Decorations & Notes</label>
                  <textarea
                    value={customization.decorations}
                    onChange={(e) =>
                      setCustomization({ ...customization, decorations: e.target.value })
                    }
                    placeholder="Add special details, dedications, or notes..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 focus:ring-2 focus:ring-[#D4A843] focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Submit for Approval Button */}
                {submitted ? (
                  <div className="w-full bg-green-50 border border-green-200 rounded-lg py-4 px-5 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800 text-sm">
                        Design submitted for approval!
                      </p>
                      <p className="text-green-600 text-xs mt-0.5">
                        Check{' '}
                        <button
                          onClick={() => navigate('/my-orders')}
                          className="underline font-medium"
                        >
                          My Orders → Design Requests
                        </button>{' '}
                        for updates.
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitForApproval}
                    disabled={submitting || !originalImage}
                    className="w-full bg-[#D4A843] hover:bg-[#B8923A] text-white py-3 rounded-lg transition-colors font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed tabular-nums"
                  >
                    <Send className="w-5 h-5" />
                    {submitting
                      ? 'Submitting…'
                      : `Submit Design for Approval — ₱${totalPrice.toLocaleString()}`}
                  </button>
                )}
                <p className="text-xs text-gray-400 text-center">
                  Our team will review your design and confirm feasibility before you place the order.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

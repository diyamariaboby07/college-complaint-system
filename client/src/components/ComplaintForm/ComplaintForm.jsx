import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UploadCloud,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Loader2,
  X,
  ArrowRight,
} from 'lucide-react';
import { complaintAPI, aiAPI } from '../../services/api';

const categories = [
  'Classroom',
  'Laboratory',
  'Hostel',
  'Wi-Fi / Internet',
  'Infrastructure',
  'Transportation',
  'Cleanliness',
  'Other',
];

export const ComplaintForm = ({ onSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Other',
    description: '',
    location: '',
    priority: 'Low',
    customImageUrl: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI Category Suggestion State
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Duplicate Warning Modal State
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isBypassingDuplicate, setIsBypassingDuplicate] = useState(false);

  // Auto AI Category Suggestion on typing title/description
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.title.length > 5 || formData.description.length > 10) {
        try {
          setIsSuggesting(true);
          const res = await aiAPI.categorize({
            title: formData.title,
            description: formData.description,
          });
          if (res.data && res.data.data) {
            setAiSuggestion(res.data.data.category);
          }
        } catch (err) {
          console.warn('AI suggestion silent error:', err);
        } finally {
          setIsSuggesting(false);
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, customImageUrl: '' }));
  };

  const handleSubmit = async (e, forceSubmit = false) => {
    if (e) e.preventDefault();
    setError('');

    if (!formData.title.trim()) return setError('Please enter a complaint title.');
    if (!formData.description.trim()) return setError('Please provide a detailed description.');
    if (!formData.location.trim()) return setError('Please specify where this issue occurred.');

    try {
      // 1. Perform Duplicate Check before submitting if not forced
      if (!forceSubmit && !isBypassingDuplicate) {
        setSubmitting(true);
        const dupRes = await aiAPI.checkDuplicate({
          category: formData.category,
          location: formData.location,
          title: formData.title,
          description: formData.description,
        });

        if (dupRes.data?.data?.isDuplicate) {
          setDuplicateWarning(dupRes.data.data.matchedComplaint);
          setSubmitting(false);
          return;
        }
      }

      setSubmitting(true);

      const submissionData = new FormData();
      submissionData.append('title', formData.title);
      submissionData.append('category', formData.category);
      submissionData.append('description', formData.description);
      submissionData.append('location', formData.location);
      submissionData.append('priority', formData.priority);
      if (formData.customImageUrl) {
        submissionData.append('customImageUrl', formData.customImageUrl);
      }
      if (imageFile) {
        submissionData.append('image', imageFile);
      }

      const res = await complaintAPI.submit(submissionData);

      if (res.data && res.data.data) {
        const createdComplaint = res.data.data;
        if (onSuccess) {
          onSuccess(createdComplaint);
        } else {
          navigate(`/student/complaints/${createdComplaint.complaintId || createdComplaint._id}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Complaint Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Wi-Fi not working in Computer Lab 2"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Category & AI Suggestion */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Category <span className="text-rose-500">*</span>
            </label>

            {/* AI Suggestion Chip */}
            {aiSuggestion && (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  AI Suggested:
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: aiSuggestion })}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                    formData.category === aiSuggestion
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  {aiSuggestion} {formData.category === aiSuggestion ? '✓' : '(Apply)'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((cat) => {
              const isSelected = formData.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-200 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Location on Campus <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Main Block Room 204, Hostel Block A, Bus #4"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the issue in detail (when did it start, equipment affected, urgency)..."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400 leading-relaxed resize-none"
          />
        </div>

        {/* Image Attachment (Upload or URL) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Attach Photo of Problem (Optional)
          </label>

          {imagePreview ? (
            <div className="relative inline-block border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <img
                src={imagePreview}
                alt="Complaint attachment preview"
                className="w-full max-w-xs h-36 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-brand-50/30">
                <UploadCloud className="w-7 h-7 text-brand-500 mb-1" />
                <span className="text-xs font-bold text-slate-700">Click to upload photo</span>
                <span className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Or image URL:</span>
                <input
                  type="url"
                  value={formData.customImageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, customImageUrl: e.target.value });
                    if (e.target.value) setImagePreview(e.target.value);
                  }}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 text-xs font-bold text-white shadow-sm shadow-brand-500/25 transition-all flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Ticket...
              </>
            ) : (
              <>
                Submit Complaint
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Duplicate Warning Modal */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Similar Complaint Detected</h3>
                <p className="text-xs text-slate-500">A complaint in this location is already registered</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 my-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {duplicateWarning.complaintId}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  {duplicateWarning.status}
                </span>
              </div>
              <p className="font-bold text-slate-800">{duplicateWarning.title}</p>
              <p className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {duplicateWarning.location}
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              If your issue is distinct or a different occurrence, you can continue submitting this complaint.
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Go Back & Review
              </button>
              <button
                type="button"
                onClick={() => {
                  setDuplicateWarning(null);
                  setIsBypassingDuplicate(true);
                  handleSubmit(null, true);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
              >
                Yes, Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

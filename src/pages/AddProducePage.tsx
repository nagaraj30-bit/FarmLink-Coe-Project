import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDemoUser } from '../hooks/useDemoUser';
import { createListing } from '../data/dataAccess';
import { getUrgency } from '../utils/calculations';
import { UrgencyBadge } from '../components/common/Badge';

export const AddProducePage: React.FC = () => {
  const { currentProfile, isFarmer, switchRole } = useDemoUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    produceName: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    quality: 'Grade A',
    location: currentProfile.location || 'Madurai, Tamil Nadu',
    harvestDate: new Date().toISOString().split('T')[0],
    sellWithinDays: '3',
    expectedPrice: '',
    description: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation
  const errors = {
    produceName: !formData.produceName.trim() ? 'Produce name is required.' : '',
    category: !formData.category.trim() ? 'Category is required.' : '',
    quantity:
      !formData.quantity || Number(formData.quantity) <= 0
        ? 'Quantity must be greater than 0.'
        : '',
    unit: !formData.unit.trim() ? 'Unit is required.' : '',
    quality: !formData.quality.trim() ? 'Quality grade is required.' : '',
    location: !formData.location.trim() ? 'Farm location is required.' : '',
    harvestDate: !formData.harvestDate ? 'Harvest date is required.' : '',
    sellWithinDays:
      !formData.sellWithinDays || Number(formData.sellWithinDays) < 1
        ? 'Stated deadline must be at least 1 day.'
        : '',
    expectedPrice:
      !formData.expectedPrice || Number(formData.expectedPrice) <= 0
        ? 'Expected price must be greater than 0.'
        : '',
  };

  const isValid = !Object.values(errors).some(err => err.length > 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    createListing({
      farmerId: currentProfile.id,
      produceName: formData.produceName,
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      quality: formData.quality,
      location: formData.location,
      harvestDate: formData.harvestDate,
      sellWithinDays: Number(formData.sellWithinDays),
      expectedPrice: Number(formData.expectedPrice),
      description: formData.description,
    });

    navigate('/farmer/listings');
  };

  if (!isFarmer) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-3">
          <h2 className="text-base font-bold text-amber-900">Farmer role required</h2>
          <p className="text-xs text-amber-700">
            Switch to a farmer profile to list new agricultural produce.
          </p>
          <button
            onClick={() => switchRole('farmer')}
            className="px-4 py-2 bg-emerald-800 text-white rounded text-xs font-semibold"
          >
            Switch to farmer mode
          </button>
        </div>
      </div>
    );
  }

  const currentUrgency = getUrgency(Number(formData.sellWithinDays) || 3);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-xs text-stone-500">
        <Link to="/farmer" className="hover:underline">Dashboard</Link> &gt; <span>Add produce</span>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Add produce listing</h1>
          <p className="text-xs text-stone-500 mt-1">
            Specify produce quantity, target price, and your stated selling deadline to start receiving transparent buyer offers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Produce Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="produceName" className="block text-xs font-semibold text-stone-700 mb-1">
                Produce name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                id="produceName"
                name="produceName"
                value={formData.produceName}
                onChange={handleChange}
                onBlur={() => handleBlur('produceName')}
                placeholder="e.g. Country Tomatoes, Shallots"
                className={`w-full px-3 py-2 text-sm rounded-md border ${
                  touched.produceName && errors.produceName
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-stone-300 focus:border-emerald-700'
                } focus:outline-hidden`}
              />
              {touched.produceName && errors.produceName && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.produceName}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-stone-700 mb-1">
                Category <span className="text-rose-600">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border border-stone-300 focus:border-emerald-700 focus:outline-hidden bg-white"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Grains & Pulses">Grains & Pulses</option>
                <option value="Spices">Spices</option>
                <option value="Plantation">Plantation</option>
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-xs font-semibold text-stone-700 mb-1">
                Available quantity <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                step="any"
                value={formData.quantity}
                onChange={handleChange}
                onBlur={() => handleBlur('quantity')}
                placeholder="e.g. 1000"
                className={`w-full px-3 py-2 text-sm rounded-md border ${
                  touched.quantity && errors.quantity
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-stone-300 focus:border-emerald-700'
                } focus:outline-hidden`}
              />
              {touched.quantity && errors.quantity && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label htmlFor="unit" className="block text-xs font-semibold text-stone-700 mb-1">
                Measurement unit <span className="text-rose-600">*</span>
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border border-stone-300 focus:border-emerald-700 focus:outline-hidden bg-white"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="quintal">quintal (100 kg)</option>
                <option value="tonne">tonne</option>
                <option value="crate">crate (approx 25 kg)</option>
                <option value="nuts">nuts (for coconut/areca)</option>
              </select>
              <p className="text-[10px] text-stone-500 mt-1">
                All buyer offers on this listing will be required to use this exact unit.
              </p>
            </div>
          </div>

          {/* Quality & Expected Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quality" className="block text-xs font-semibold text-stone-700 mb-1">
                Quality grade <span className="text-rose-600">*</span>
              </label>
              <select
                id="quality"
                name="quality"
                value={formData.quality}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border border-stone-300 focus:border-emerald-700 focus:outline-hidden bg-white"
              >
                <option value="Grade A (Premium / Export)">Grade A (Premium / Export)</option>
                <option value="Grade A (Firm & Ripe)">Grade A (Firm & Ripe)</option>
                <option value="Grade B (Standard Market)">Grade B (Standard Market)</option>
                <option value="Commercial Processing">Commercial Processing</option>
              </select>
            </div>

            <div>
              <label htmlFor="expectedPrice" className="block text-xs font-semibold text-stone-700 mb-1">
                Target price per {formData.unit} (₹) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-stone-500 text-sm">₹</span>
                <input
                  type="number"
                  id="expectedPrice"
                  name="expectedPrice"
                  min="0.5"
                  step="any"
                  value={formData.expectedPrice}
                  onChange={handleChange}
                  onBlur={() => handleBlur('expectedPrice')}
                  placeholder="e.g. 40"
                  className={`w-full pl-7 pr-3 py-2 text-sm rounded-md border ${
                    touched.expectedPrice && errors.expectedPrice
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-stone-300 focus:border-emerald-700'
                  } focus:outline-hidden`}
                />
              </div>
              {touched.expectedPrice && errors.expectedPrice && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.expectedPrice}</p>
              )}
            </div>
          </div>

          {/* Location & Harvest Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-xs font-semibold text-stone-700 mb-1">
                Farm pickup location <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={() => handleBlur('location')}
                className={`w-full px-3 py-2 text-sm rounded-md border ${
                  touched.location && errors.location
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-stone-300 focus:border-emerald-700'
                } focus:outline-hidden`}
              />
              {touched.location && errors.location && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label htmlFor="harvestDate" className="block text-xs font-semibold text-stone-700 mb-1">
                Harvest date <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                id="harvestDate"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                onBlur={() => handleBlur('harvestDate')}
                className={`w-full px-3 py-2 text-sm rounded-md border ${
                  touched.harvestDate && errors.harvestDate
                    ? 'border-rose-500 bg-rose-50/20'
                    : 'border-stone-300 focus:border-emerald-700'
                } focus:outline-hidden`}
              />
              {touched.harvestDate && errors.harvestDate && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.harvestDate}</p>
              )}
            </div>
          </div>

          {/* Stated Selling Deadline & Urgency Indicator */}
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label htmlFor="sellWithinDays" className="block text-xs font-semibold text-stone-800">
                  Stated selling deadline (in days) <span className="text-rose-600">*</span>
                </label>
                <p className="text-[11px] text-stone-500">
                  How many days do you plan to sell this batch within?
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Calculated urgency:</span>
                <UrgencyBadge urgency={currentUrgency} sellWithinDays={Number(formData.sellWithinDays) || 0} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                id="sellWithinDays"
                name="sellWithinDays"
                min="1"
                max="60"
                value={formData.sellWithinDays}
                onChange={handleChange}
                onBlur={() => handleBlur('sellWithinDays')}
                className="w-24 px-3 py-1.5 text-sm rounded-md border border-stone-300 focus:border-emerald-700 bg-white"
              />
              <span className="text-xs text-stone-600">days</span>
            </div>
            {touched.sellWithinDays && errors.sellWithinDays && (
              <p className="text-[11px] text-rose-600">{errors.sellWithinDays}</p>
            )}

            <p className="text-[11px] text-stone-500 border-t border-stone-200 pt-2">
              Note: Urgency is a deadline-based indicator derived only from your entered days (1 day = High, 2–3 days = Medium, &gt;3 days = Normal). It is not an AI or predictive spoilage calculation.
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-stone-700 mb-1">
              Produce details or dispatch notes (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Harvested early morning, packed in standard crates. Farm gate accessible by truck."
              className="w-full px-3 py-2 text-sm rounded-md border border-stone-300 focus:border-emerald-700 focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <Link
              to="/farmer/listings"
              className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={!isValid}
              className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-xs transition-all ${
                isValid
                  ? 'bg-emerald-800 hover:bg-emerald-900 cursor-pointer'
                  : 'bg-stone-300 text-stone-500 cursor-not-allowed'
              }`}
            >
              Save listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

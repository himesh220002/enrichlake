import re

path = "/home/himesh/MYProjects/Nextjs/Enricher/enricher-app/src/app/page.tsx"
with open(path) as f:
    content = f.read()

start_marker = "{/* View Mode 2: B2B Seller & Procurement Hub Table            */}"
end_marker = "{/* ============================================================== */}\n        {/* Tab 2: Saved Profiles Workspace (Filter, Search, Merge, Rate, Remarks) */}"

start_pos = content.find(start_marker)
end_pos = content.find(end_marker)

if start_pos == -1 or end_pos == -1:
    print(f"Markers not found! start_pos: {start_pos}, end_pos: {end_pos}")
    exit(1)

new_sellers_view = """{/* View Mode 2: B2B Seller & Procurement Hub Table            */}
            {/* ========================================================== */}
            {productViewMode === 'sellers' && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <ShoppingBag className="w-5 h-5 text-emerald-400" />
                        <span>B2B Seller & Procurement Hub Directory</span>
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                        {productSellerResults.length} Enterprise Channels (Max {productMaxResults})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct corporate contacts, operational health ratings, and volume trade credit terms across up to 50 verified enterprise channels.
                    </p>
                  </div>

                  {/* Verification Filter */}
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-slate-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-slate-400" />
                      <span>Verification:</span>
                    </label>
                    <select
                      value={productVerificationFilter}
                      onChange={(e) => setProductVerificationFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Verifications ({productSellerResults.length})</option>
                      <option value="Google Maps Verified">Google Maps Verified</option>
                      <option value="Unverified Listing">Unverified Listing</option>
                      <option value="GSTIN Verified">GSTIN Verified</option>
                      <option value="PAN Verified">PAN Verified</option>
                      <option value="ISO Certified">ISO Certified</option>
                      <option value="Chamber Registered">Chamber Registered</option>
                      <option value="Certified Organic">Certified Organic</option>
                      <option value="Verified Partner">Verified Partner</option>
                    </select>
                  </div>
                </div>

                {/* Batch Action Toolbar */}
                {selectedSellerIds.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl animate-in fade-in duration-200">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-300">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span>{selectedSellerIds.length} Channels Selected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleBatchImportSellers}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Import Selected ({selectedSellerIds.length})</span>
                      </button>
                      <button
                        onClick={handleBatchExportSelectedSellersCSV}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Selected CSV</span>
                      </button>
                      <button
                        onClick={() => setSelectedSellerIds([])}
                        className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="p-3.5 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={selectedSellerIds.length === productSellerResults.length && productSellerResults.length > 0}
                            onChange={handleToggleSelectAllSellers}
                            className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                            title="Select / Deselect All"
                          />
                        </th>
                        <th className="p-3.5 whitespace-nowrap">Business Name</th>
                        <th className="p-3.5 whitespace-nowrap">Category</th>
                        <th className="p-3.5 whitespace-nowrap">Products / Services</th>
                        <th className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-teal-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>B2B Pricing & Sourcing Terms</span>
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">Procurement</span>
                          </div>
                        </th>
                        <th className="p-3.5 whitespace-nowrap">Website</th>
                        <th className="p-3.5 whitespace-nowrap">Phone & Direct Outreach</th>
                        <th className="p-3.5 whitespace-nowrap">Email</th>
                        <th className="p-3.5 whitespace-nowrap">Address</th>
                        <th className="p-3.5 whitespace-nowrap">Lat/Long</th>
                        <th className="p-3.5 whitespace-nowrap">Business Status</th>
                        <th className="p-3.5 whitespace-nowrap">Verification Status</th>
                        <th className="p-3.5 whitespace-nowrap text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {productLoading ? (
                        <tr>
                          <td colSpan={13} className="p-8 text-center bg-slate-950/60">
                            <div className="flex flex-col items-center justify-center space-y-3 py-6">
                              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                              <div className="text-sm font-semibold text-white">
                                Scanning B2B Network across {searchCoverage.areasSearchedCount} commercial zones ({productScope === 'radius' ? `${productRangeKm}km Radius` : 'Pan-India'})...
                              </div>
                              <p className="text-xs text-slate-400 max-w-md">
                                Resolving verified commercial suppliers, geocoding distances, verifying GSTIN / ISO compliance, and extracting wholesale volume terms.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : productSellerResults.filter((s) => productVerificationFilter === 'all' || s.verificationStatus === productVerificationFilter).length === 0 ? (
                        <tr>
                          <td colSpan={13} className="p-8 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center space-y-2 py-4">
                              <AlertCircle className="w-6 h-6 text-slate-500" />
                              <div className="text-sm font-semibold text-slate-300">No supplier records found</div>
                              <p className="text-xs text-slate-500">Try expanding your sourcing radius or resetting the verification filter.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        productSellerResults
                          .filter((s) => productVerificationFilter === 'all' || s.verificationStatus === productVerificationFilter)
                          .map((seller) => (
                          <tr key={seller.id} className={`hover:bg-slate-800/30 transition ${selectedSellerIds.includes(seller.id) ? 'bg-emerald-950/20' : ''}`}>
                            {/* Checkbox */}
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={selectedSellerIds.includes(seller.id)}
                                onChange={() => handleToggleSelectSeller(seller.id)}
                                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                              />
                            </td>

                            {/* Business Name */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="font-bold text-white text-sm">{seller.businessName}</div>
                              {seller.rating ? (
                                <div className="flex items-center space-x-1.5 mt-1 text-xs">
                                  <span className="flex items-center text-amber-400 font-semibold font-mono text-[11px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    ★ {seller.rating.toFixed(1)}
                                  </span>
                                  {seller.reviewsCount !== undefined && seller.reviewsCount > 0 && (
                                    <span className="text-slate-400 text-[11px] font-mono">
                                      ({seller.reviewsCount.toLocaleString()} reviews)
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </td>

                            {/* Category */}
                            <td className="p-3.5 text-slate-300 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                                {seller.category}
                              </span>
                            </td>

                            {/* Products / Services */}
                            <td className="p-3.5 text-slate-300 max-w-xs truncate" title={seller.productsServices}>
                              {seller.productsServices}
                            </td>

                            {/* B2B Sourcing & Pricing Terms */}
                            <td className="p-3.5 whitespace-nowrap">
                              {seller.b2bPricing ? (
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-teal-300 font-mono text-xs">
                                      {seller.b2bPricing.wholesalePrice}
                                    </span>
                                    {seller.b2bPricing.bulkDiscountTier && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                                        {seller.b2bPricing.bulkDiscountTier}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-1.5">
                                    {seller.b2bPricing.moq && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 text-[10px] font-mono">
                                        {seller.b2bPricing.moq}
                                      </span>
                                    )}
                                    {seller.b2bPricing.meetingRequired ? (
                                      <span
                                        className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-semibold"
                                      >
                                        <span>🤝 Post-Meeting RFP</span>
                                      </span>
                                    ) : (
                                      <span
                                        className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[9px] font-semibold"
                                      >
                                        <span>📊 Volume Lot</span>
                                      </span>
                                    )}
                                  </div>
                                  {seller.b2bPricing.paymentTerms && (
                                    <div className="text-[10px] text-slate-400 max-w-xs truncate" title={seller.b2bPricing.paymentTerms}>
                                      <span className="text-slate-500">Terms:</span> {seller.b2bPricing.paymentTerms}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="text-slate-500 italic text-xs block">Direct In-Store / Quote on Request</span>
                                  <span className="text-[10px] text-slate-400">Offline Procurement</span>
                                </div>
                              )}
                            </td>

                            {/* Website */}
                            <td className="p-3.5 whitespace-nowrap">
                              {seller.website ? (
                                <a
                                  href={seller.website.startsWith('http') ? seller.website : `https://${seller.website}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center space-x-1"
                                >
                                  <span>{seller.website.replace(/^https?:\\/\\//, '').replace(/\\/$/, '')}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="text-slate-500 italic text-xs">Unlisted / In-Store Only</span>
                              )}
                            </td>

                            {/* Phone & Direct Outreach */}
                            <td className="p-3.5 text-slate-300 whitespace-nowrap font-mono">
                              {seller.phone ? (
                                <div className="flex items-center space-x-1.5">
                                  <a href={`tel:${seller.phone}`} className="hover:text-emerald-400 transition" title="Direct Phone Call">
                                    {seller.phone}
                                  </a>
                                  <a
                                    href={getWhatsAppUrl(seller.phone, seller.businessName)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Launch WhatsApp B2B RFP Inquiry"
                                    className="p-1 rounded bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition inline-flex items-center"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                  </a>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic text-xs">—</span>
                              )}
                            </td>

                            {/* Email */}
                            <td className="p-3.5 text-slate-300 whitespace-nowrap font-mono">
                              {seller.email ? (
                                <a href={`mailto:${seller.email}`} className="text-indigo-400 hover:text-indigo-300">
                                  {seller.email}
                                </a>
                              ) : (
                                <span className="text-slate-500 italic text-xs">—</span>
                              )}
                            </td>

                            {/* Address */}
                            <td className="p-3.5 text-slate-300 max-w-xs truncate" title={seller.address}>
                              {seller.address}
                            </td>

                            {/* Lat/Long */}
                            <td className="p-3.5 font-mono text-[11px] whitespace-nowrap text-slate-400">
                              <a
                                href={`https://www.google.com/maps?q=${seller.latitude},${seller.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-amber-400 underline"
                              >
                                {seller.latitude.toFixed(4)}, {seller.longitude.toFixed(4)}
                              </a>
                            </td>

                            {/* Business Status */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  seller.businessStatus === 'Active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : seller.businessStatus === 'Closed'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    : seller.businessStatus === 'Expanding'
                                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                }`}
                              >
                                {seller.businessStatus === 'Active' ? 'Operational' : seller.businessStatus}
                              </span>
                            </td>

                            {/* Verification Status */}
                            <td className="p-3.5 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border inline-flex items-center space-x-1 ${
                                  seller.verificationStatus === 'Google Maps Verified'
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                                    : seller.verificationStatus === 'GSTIN Verified'
                                    ? 'bg-teal-950/60 text-teal-300 border-teal-500/30'
                                    : seller.verificationStatus === 'ISO Certified'
                                    ? 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                                    : seller.verificationStatus === 'Unverified Listing'
                                    ? 'bg-slate-900 text-slate-400 border-slate-700'
                                    : 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                                }`}
                              >
                                {seller.verificationStatus === 'Google Maps Verified' && (
                                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                )}
                                <span>{seller.verificationStatus}</span>
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => setInspectingSeller(seller)}
                                  title="Inspect Enterprise Sourcing Card & Trade Terms"
                                  className="p-1.5 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleSaveSeller(seller)}
                                  className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/60 border border-emerald-500/40 text-emerald-300 hover:text-white text-[11px] font-semibold flex items-center space-x-1 transition"
                                >
                                  <Bookmark className="w-3 h-3" />
                                  <span>Import</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Enterprise Sourcing Details Modal Drawer */}
            {inspectingSeller && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                          {inspectingSeller.businessStatus === 'Active' ? 'Operational Channel' : inspectingSeller.businessStatus}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium">
                          {inspectingSeller.verificationStatus}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-1.5">{inspectingSeller.businessName}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{inspectingSeller.category} • {inspectingSeller.productsServices}</p>
                      {inspectingSeller.rating && (
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="flex items-center text-amber-400 font-bold font-mono text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            ★ {inspectingSeller.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {inspectingSeller.reviewsCount ? `${inspectingSeller.reviewsCount.toLocaleString()} Verified Customer Reviews` : 'Verified Google Maps Listing'}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setInspectingSeller(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Omnichannel Direct Outreach Action Hub */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {inspectingSeller.phone ? (
                      <a
                        href={`tel:${inspectingSeller.phone}`}
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center group transition"
                      >
                        <Phone className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-slate-400 font-medium">Direct Call</span>
                        <span className="text-xs text-white font-mono mt-0.5 truncate max-w-[120px]">{inspectingSeller.phone}</span>
                      </a>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-center opacity-50">
                        <Phone className="w-4 h-4 text-slate-500 mb-1" />
                        <span className="text-[10px] text-slate-500">Phone</span>
                        <span className="text-xs text-slate-600">Unlisted</span>
                      </div>
                    )}

                    {inspectingSeller.phone ? (
                      <a
                        href={getWhatsAppUrl(inspectingSeller.phone, inspectingSeller.businessName)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 flex flex-col items-center justify-center text-center group transition"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-emerald-300 font-medium">WhatsApp RFP</span>
                        <span className="text-xs text-emerald-200 font-mono mt-0.5">Send Inquiry</span>
                      </a>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-center opacity-50">
                        <MessageCircle className="w-4 h-4 text-slate-500 mb-1" />
                        <span className="text-[10px] text-slate-500">WhatsApp</span>
                        <span className="text-xs text-slate-600">Unavailable</span>
                      </div>
                    )}

                    {inspectingSeller.website ? (
                      <a
                        href={inspectingSeller.website.startsWith('http') ? inspectingSeller.website : `https://${inspectingSeller.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center group transition"
                      >
                        <Globe className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-slate-400 font-medium">Website</span>
                        <span className="text-xs text-cyan-300 font-mono mt-0.5 truncate max-w-[120px]">Visit Portal</span>
                      </a>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center text-center opacity-50">
                        <Globe className="w-4 h-4 text-slate-500 mb-1" />
                        <span className="text-[10px] text-slate-500">Website</span>
                        <span className="text-xs text-slate-600">In-Store Only</span>
                      </div>
                    )}

                    <a
                      href={`https://www.google.com/maps?q=${inspectingSeller.latitude},${inspectingSeller.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-center group transition"
                    >
                      <Navigation className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] text-slate-400 font-medium">Maps Navigation</span>
                      <span className="text-xs text-amber-300 font-mono mt-0.5">{inspectingSeller.distanceKm} km away</span>
                    </a>
                  </div>

                  {/* Address & Geodesic Coordinates */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Physical Storefront & Showroom Location</span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">{inspectingSeller.address}</p>
                    <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-500 font-mono">
                      <span>Coordinates: {inspectingSeller.latitude.toFixed(4)}, {inspectingSeller.longitude.toFixed(4)}</span>
                      <span>Radial Distance: {inspectingSeller.distanceKm} km</span>
                    </div>
                  </div>

                  {/* B2B Procurement Terms */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                        <span>B2B Volume Pricing & Commercial Sourcing Terms</span>
                      </span>
                      <span className="text-[10px] text-teal-300 font-mono bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        Corporate Quotation
                      </span>
                    </div>

                    {inspectingSeller.b2bPricing ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Wholesale Price</span>
                          <span className="text-sm font-bold text-teal-300 font-mono">{inspectingSeller.b2bPricing.wholesalePrice}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Minimum Order (MOQ)</span>
                          <span className="text-sm font-bold text-amber-300 font-mono">{inspectingSeller.b2bPricing.moq}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Trade Credit Terms</span>
                          <span className="text-xs font-semibold text-slate-300">{inspectingSeller.b2bPricing.paymentTerms || 'Net 30 on PO'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
                        <p className="font-semibold text-slate-300">Direct In-Store / Showroom Quote on Request</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Physical showroom channels provide direct negotiated discount lots, GST invoice generation (18% input credit), and local dispatch warranty.</p>
                      </div>
                    )}
                  </div>

                  {/* Deep Technographic Scan (If Website Exists) */}
                  {inspectingSeller.website && (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-xs font-semibold text-white">Technographic & Web Intelligence</span>
                        </div>
                        <button
                          onClick={() => handleDeepEnrichSeller(inspectingSeller)}
                          disabled={deepEnrichingId === inspectingSeller.id}
                          className="px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold flex items-center space-x-1 transition disabled:opacity-50"
                        >
                          {deepEnrichingId === inspectingSeller.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Scanning Web...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3" />
                              <span>Scan Tech Stack</span>
                            </>
                          )}
                        </button>
                      </div>

                      {sellerEnrichData[inspectingSeller.id] ? (
                        <div className="space-y-2 pt-1">
                          <div className="text-[11px] text-slate-300">
                            {sellerEnrichData[inspectingSeller.id].description || 'Active Web Commercial Portal'}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {sellerEnrichData[inspectingSeller.id].technographics?.technologies?.map((tech: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono"
                              >
                                {tech.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          Click "Scan Tech Stack" to run a zero-cost headless stealth crawl on {inspectingSeller.website.replace(/^https?:\\/\\//, '')} to detect CMS, payment gateways, analytics, and contact channels.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Drawer Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setInspectingSeller(null)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleSaveSeller(inspectingSeller);
                        setInspectingSeller(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-emerald-900/30 transition"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Save Channel to Account Graph</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* Tab 2: Saved Profiles Workspace (Filter, Search, Merge, Rate, Remarks) */}"""

content = content[:start_pos] + new_sellers_view + content[end_pos:]
with open(path, "w") as f:
    f.write(content)

print("Applied upgraded seller table with WhatsApp, Multi-Select Batch Actions, and Enterprise Drawer!")

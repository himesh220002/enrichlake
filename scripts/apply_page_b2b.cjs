const fs = require('fs');
const path = require('path');

const pagePath = path.resolve('../Enricher/enricher-app/src/app/page.tsx');
let code = fs.readFileSync(pagePath, 'utf8');

// 1. UPDATE INITIAL_PRODUCT_SPECS
const oldSpec1 = `  {
    id: 'spec_1',
    product: 'Acer Nitro V15',
    specs: 'i5-12450H, 16GB DDR5, RTX 3050, 144Hz',
    price: '₹89,990',
    sellerBusiness: 'Acer Official Store',`;

const newSpec1 = `  {
    id: 'spec_1',
    product: 'Acer Nitro V15',
    specs: 'i5-12450H, 16GB DDR5, RTX 3050, 144Hz',
    price: '₹89,990',
    b2bPricing: {
      wholesalePrice: '₹73,990',
      bulkDiscountTier: '18%–24% off (10+ units)',
      moq: 'MOQ: 5 units',
      b2bStrategy: 'Exposed post-meeting RFP via Acer Commercial Partner Desk; 18% GST ITC pass-through offset',
      sellingStrategyType: 'post_meeting_rfp',
      paymentTerms: 'Net 30 Corporate PO / Escrow',
      meetingRequired: true,
    },
    sellerBusiness: 'Acer Official Store',`;

code = code.replace(oldSpec1, newSpec1);

const oldSpec2 = `  {
    id: 'spec_2',
    product: 'ASUS TUF F15',
    specs: 'i5-12500H, 16GB DDR5, RTX 3050, 144Hz',
    price: '₹94,500',
    sellerBusiness: 'ASUS Exclusive',`;

const newSpec2 = `  {
    id: 'spec_2',
    product: 'ASUS TUF F15',
    specs: 'i5-12500H, 16GB DDR5, RTX 3050, 144Hz',
    price: '₹94,500',
    b2bPricing: {
      wholesalePrice: '₹76,500',
      bulkDiscountTier: '19%–26% off (15+ units)',
      moq: 'MOQ: 5 units',
      b2bStrategy: 'Tiered volume slabs exposed via ASUS Commercial Portal after dealer onboarding meeting',
      sellingStrategyType: 'volume_slabs',
      paymentTerms: 'Net 30 / Bank LC',
      meetingRequired: true,
    },
    sellerBusiness: 'ASUS Exclusive',`;

code = code.replace(oldSpec2, newSpec2);

const oldSpec3 = `  {
    id: 'spec_3',
    product: 'HP Victus 15',
    specs: 'i5-13420H, 16GB DDR5, RTX 3050, 144Hz',
    price: '₹92,999',
    sellerBusiness: 'HP World',`;

const newSpec3 = `  {
    id: 'spec_3',
    product: 'HP Victus 15',
    specs: 'i5-13420H, 16GB DDR5, RTX 3050, 144Hz',
    price: '₹92,999',
    b2bPricing: {
      wholesalePrice: '₹75,200',
      bulkDiscountTier: '17%–23% off (10+ units)',
      moq: 'MOQ: 4 units',
      b2bStrategy: 'Hidden institutional discount; exposed during procurement meeting with HP enterprise sales team',
      sellingStrategyType: 'post_meeting_rfp',
      paymentTerms: 'Corporate GST Invoicing / Net 45',
      meetingRequired: true,
    },
    sellerBusiness: 'HP World',`;

code = code.replace(oldSpec3, newSpec3);

const oldSpec4 = `  {
    id: 'spec_4',
    product: 'Lenovo IdeaPad Gaming 3',
    specs: 'i5-12450H, 16GB DDR5, RTX 3050, 144Hz',
    price: '₹95,000',
    sellerBusiness: 'Lenovo Authorized',`;

const newSpec4 = `  {
    id: 'spec_4',
    product: 'Lenovo IdeaPad Gaming 3',
    specs: 'i5-12450H, 16GB DDR5, RTX 3050, 144Hz',
    price: '₹95,000',
    b2bPricing: {
      wholesalePrice: '₹77,000',
      bulkDiscountTier: '18%–25% off (10+ units)',
      moq: 'MOQ: 5 units',
      b2bStrategy: 'Enterprise bid desk discount; custom pricing exposed on bulk RFP submission',
      sellingStrategyType: 'corporate_dealer',
      paymentTerms: 'Net 30 with Trade Credit verification',
      meetingRequired: true,
    },
    sellerBusiness: 'Lenovo Authorized',`;

code = code.replace(oldSpec4, newSpec4);

const oldSpec5 = `  {
    id: 'spec_5',
    product: 'MSI GF63 Thin',
    specs: 'i5-12450H, 16GB DDR5, RTX 3050, 144Hz',
    price: '₹97,499',
    sellerBusiness: 'MSI Partner',`;

const newSpec5 = `  {
    id: 'spec_5',
    product: 'MSI GF63 Thin',
    specs: 'i5-12450H, 16GB DDR5, RTX 3050, 144Hz',
    price: '₹97,499',
    b2bPricing: {
      wholesalePrice: '₹78,900',
      bulkDiscountTier: '19%–27% off (12+ units)',
      moq: 'MOQ: 6 units',
      b2bStrategy: 'Distributor direct margin; exposed after B2B dealer meeting with regional distributor',
      sellingStrategyType: 'post_meeting_rfp',
      paymentTerms: 'Escrow / Advance + 15 days credit',
      meetingRequired: true,
    },
    sellerBusiness: 'MSI Partner',`;

code = code.replace(oldSpec5, newSpec5);

// 2. UPDATE INITIAL_PRODUCT_SELLERS
const oldSeller1 = `  {
    id: 'seller_1',
    businessName: 'TechWorld Computers',
    category: 'Electronics Retail',
    productsServices: 'Laptops, Desktops, Accessories (i5 12th/13th Gen, 16GB DDR5, RTX 3050)',
    website: 'https://www.techworldwb.com',`;

const newSeller1 = `  {
    id: 'seller_1',
    businessName: 'TechWorld Computers',
    category: 'Electronics Retail',
    productsServices: 'Laptops, Desktops, Accessories (i5 12th/13th Gen, 16GB DDR5, RTX 3050)',
    b2bPricing: {
      wholesalePrice: '₹73,500 / unit (Bulk Tier)',
      bulkDiscountTier: '20% off on 10+ workstations',
      moq: 'MOQ: 5 units',
      b2bStrategy: 'Corporate IT Procurement Discount; exposed after vendor onboarding meeting',
      sellingStrategyType: 'post_meeting_rfp',
      paymentTerms: 'Net 30 / Corporate GST Invoice',
      meetingRequired: true,
    },
    website: 'https://www.techworldwb.com',`;

code = code.replace(oldSeller1, newSeller1);

const oldSeller2 = `  {
    id: 'seller_2',
    businessName: 'AgroMart WB',
    category: 'Agriculture Supply',
    productsServices: 'Rice, Wheat, Fertilizers (Moisture: <12%, Basmati 50kg Bags, NPK 19:19:19)',
    website: 'https://www.agromartwb.in',`;

const newSeller2 = `  {
    id: 'seller_2',
    businessName: 'AgroMart WB',
    category: 'Agriculture Supply',
    productsServices: 'Rice, Wheat, Fertilizers (Moisture: <12%, Basmati 50kg Bags, NPK 19:19:19)',
    b2bPricing: {
      wholesalePrice: '₹1,950 / 50kg bag',
      bulkDiscountTier: '18%–24% off on 50+ bags',
      moq: 'MOQ: 25 bags (1.25 MT)',
      b2bStrategy: 'Mandi Direct Wholesaler Slab; exposed via wholesale trade inquiry with Mandi Cess exemption',
      sellingStrategyType: 'volume_slabs',
      paymentTerms: 'Advance + Weighbridge slip settlement',
      meetingRequired: false,
    },
    website: 'https://www.agromartwb.in',`;

code = code.replace(oldSeller2, newSeller2);

const oldSeller3 = `  {
    id: 'seller_3',
    businessName: 'Malda Textiles',
    category: 'Textile Wholesale',
    productsServices: 'Cotton, Polyester, Blends (220 GSM Heavy-Duty, 100% Combed Cotton)',
    website: 'https://www.maldafabrics.com',`;

const newSeller3 = `  {
    id: 'seller_3',
    businessName: 'Malda Textiles',
    category: 'Textile Wholesale',
    productsServices: 'Cotton, Polyester, Blends (220 GSM Heavy-Duty, 100% Combed Cotton)',
    b2bPricing: {
      wholesalePrice: '₹165 / meter',
      bulkDiscountTier: '22% off on 500m+ bolt orders',
      moq: 'MOQ: 100 meters',
      b2bStrategy: 'B2B Trade account tiered matrix; hidden to general shoppers',
      sellingStrategyType: 'volume_slabs',
      paymentTerms: 'Net 30 after credit check',
      meetingRequired: false,
    },
    website: 'https://www.maldafabrics.com',`;

code = code.replace(oldSeller3, newSeller3);

const oldSeller4 = `  {
    id: 'seller_4',
    businessName: 'GreenHarvest Organics',
    category: 'Organic Produce',
    productsServices: 'Certified Organic Grains, Bio-Fertilizers, Non-GMO Rice',
    website: 'https://www.greenharvest.org',`;

const newSeller4 = `  {
    id: 'seller_4',
    businessName: 'GreenHarvest Organics',
    category: 'Organic Produce',
    productsServices: 'Certified Organic Grains, Bio-Fertilizers, Non-GMO Rice',
    b2bPricing: {
      wholesalePrice: '₹2,100 / 50kg bag',
      bulkDiscountTier: '15%–20% off for verified cooperatives',
      moq: 'MOQ: 20 bags',
      b2bStrategy: 'NPOP organic producer direct rate; negotiated during farm-gate aggregator meeting',
      sellingStrategyType: 'post_meeting_rfp',
      paymentTerms: 'Direct bank transfer / Escrow',
      meetingRequired: true,
    },
    website: 'https://www.greenharvest.org',`;

code = code.replace(oldSeller4, newSeller4);

const oldSeller5 = `  {
    id: 'seller_5',
    businessName: 'Digital Hub WB',
    category: 'IT Services & Hardware',
    productsServices: 'Web Dev, Hosting, Workstations, Enterprise Hardware Supply',
    website: 'https://www.digitalhubwb.com',`;

const newSeller5 = `  {
    id: 'seller_5',
    businessName: 'Digital Hub WB',
    category: 'IT Services & Hardware',
    productsServices: 'Web Dev, Hosting, Workstations, Enterprise Hardware Supply',
    b2bPricing: {
      wholesalePrice: 'Custom Contract Quote',
      bulkDiscountTier: '25% off annual managed hardware retainer',
      moq: 'MOQ: 10 seats',
      b2bStrategy: 'Bespoke enterprise SLA margin; unlocked post-RFP discovery meeting',
      sellingStrategyType: 'corporate_dealer',
      paymentTerms: 'Monthly Net 30 billing',
      meetingRequired: true,
    },
    website: 'https://www.digitalhubwb.com',`;

code = code.replace(oldSeller5, newSeller5);

// 3. UPDATE Product Specs Table Headers & Rows
const oldSpecHeader = `<th className="p-3.5 whitespace-nowrap">Price</th>
                        <th className="p-3.5 whitespace-nowrap">Seller / Business</th>`;

const newSpecHeader = `<th className="p-3.5 whitespace-nowrap">Retail Price</th>
                        <th className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-emerald-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>B2B Volume Pricing & Discounts</span>
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">Hidden Strategies</span>
                          </div>
                        </th>
                        <th className="p-3.5 whitespace-nowrap">Seller / Business</th>`;

code = code.replace(oldSpecHeader, newSpecHeader);

const oldSpecRowPrice = `                            {/* Price */}
                            <td className="p-3.5 font-bold text-emerald-400 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                                {item.price}
                              </span>
                            </td>

                            {/* Seller/Business */}`;

const newSpecRowPrice = `                            {/* Retail Price */}
                            <td className="p-3.5 font-bold text-emerald-400 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                                {item.price}
                              </span>
                            </td>

                            {/* B2B Volume Pricing & Discounts */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-bold text-teal-300 font-mono text-xs">
                                    {item.b2bPricing?.wholesalePrice || 'Request Quote'}
                                  </span>
                                  {item.b2bPricing?.bulkDiscountTier && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                                      {item.b2bPricing.bulkDiscountTier}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center space-x-1.5">
                                  {item.b2bPricing?.moq && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 text-[10px] font-mono">
                                      {item.b2bPricing.moq}
                                    </span>
                                  )}

                                  {item.b2bPricing?.meetingRequired ? (
                                    <span
                                      className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-semibold cursor-help"
                                      title={\`Hidden to retail users: \${item.b2bPricing.b2bStrategy} (Terms: \${item.b2bPricing.paymentTerms})\`}
                                    >
                                      <span>🤝 Post-Meeting RFP</span>
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[9px] font-semibold cursor-help"
                                      title={item.b2bPricing?.b2bStrategy || 'Volume tier pricing'}
                                    >
                                      <span>📊 Volume Slabs</span>
                                    </span>
                                  )}
                                </div>

                                <div className="text-[10px] text-slate-400 max-w-xs truncate" title={item.b2bPricing?.b2bStrategy}>
                                  <span className="text-slate-500">Strategy:</span> {item.b2bPricing?.b2bStrategy}
                                </div>
                              </div>
                            </td>

                            {/* Seller/Business */}`;

code = code.replace(oldSpecRowPrice, newSpecRowPrice);

// 4. UPDATE B2B Sellers Table Headers & Rows
const oldSellerHeader = `<th className="p-3.5 whitespace-nowrap">Products / Services</th>
                        <th className="p-3.5 whitespace-nowrap">Website</th>`;

const newSellerHeader = `<th className="p-3.5 whitespace-nowrap">Products / Services</th>
                        <th className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5 text-teal-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>B2B Pricing & Sourcing Terms</span>
                            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded border border-amber-500/20">Procurement</span>
                          </div>
                        </th>
                        <th className="p-3.5 whitespace-nowrap">Website</th>`;

code = code.replace(oldSellerHeader, newSellerHeader);

const oldSellerRowProducts = `                            {/* Products / Services */}
                            <td className="p-3.5 text-slate-300 max-w-xs truncate" title={seller.productsServices}>
                              {seller.productsServices}
                            </td>

                            {/* Website */}`;

const newSellerRowProducts = `                            {/* Products / Services */}
                            <td className="p-3.5 text-slate-300 max-w-xs truncate" title={seller.productsServices}>
                              {seller.productsServices}
                            </td>

                            {/* B2B Sourcing & Pricing Terms */}
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-bold text-teal-300 font-mono text-xs">
                                    {seller.b2bPricing?.wholesalePrice || 'B2B Catalog'}
                                  </span>
                                  {seller.b2bPricing?.bulkDiscountTier && (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold font-mono">
                                      {seller.b2bPricing.bulkDiscountTier}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  {seller.b2bPricing?.moq && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 text-[10px] font-mono">
                                      {seller.b2bPricing.moq}
                                    </span>
                                  )}
                                  <span
                                    className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[9px] font-semibold cursor-help"
                                    title={seller.b2bPricing?.b2bStrategy}
                                  >
                                    {seller.b2bPricing?.meetingRequired ? '🤝 Post-Meeting RFP' : '📊 Volume Slabs'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 max-w-xs truncate" title={seller.b2bPricing?.paymentTerms}>
                                  <span className="text-slate-500">Terms:</span> {seller.b2bPricing?.paymentTerms}
                                </div>
                              </div>
                            </td>

                            {/* Website */}`;

code = code.replace(oldSellerRowProducts, newSellerRowProducts);

// 5. UPDATE CSV EXPORT
const oldCsvExport = `    if (productViewMode === 'specs') {
      csvContent += 'Product,Specs,Price,Seller/Business,Website/Source,Business Details,Location,Logistics,Status/Tags\\n';
      productSpecResults.forEach((r) => {
        csvContent += \`"\${r.product.replace(/"/g, '""')}","\${r.specs.replace(/"/g, '""')}","\${r.price}","\${r.sellerBusiness.replace(/"/g, '""')}","\${r.websiteSource}","\${r.businessDetails.replace(/"/g, '""')}","\${r.location}","\${r.logistics.replace(/"/g, '""')}","\${r.statusTag}"\\n\`;
      });
    } else {
      csvContent += 'Business Name,Category,Products/Services,Website,Phone,Email,Address,Lat/Long,Business Status,Verification Status\\n';
      productSellerResults.forEach((s) => {
        csvContent += \`"\${s.businessName.replace(/"/g, '""')}","\${s.category.replace(/"/g, '""')}","\${s.productsServices.replace(/"/g, '""')}","\${s.website}","\${s.phone}","\${s.email}","\${s.address.replace(/"/g, '""')}","\${s.latitude}, \${s.longitude}","\${s.businessStatus}","\${s.verificationStatus}"\\n\`;
      });
    }`;

const newCsvExport = `    if (productViewMode === 'specs') {
      csvContent += 'Product,Specs,Price,B2B Wholesale Price,Bulk Discount Tier,MOQ,B2B Selling Strategy,Payment Terms,Seller/Business,Website/Source,Business Details,Location,Logistics,Status/Tags\\n';
      productSpecResults.forEach((r) => {
        csvContent += \`"\${r.product.replace(/"/g, '""')}","\${r.specs.replace(/"/g, '""')}","\${r.price}","\${r.b2bPricing?.wholesalePrice || ''}","\${r.b2bPricing?.bulkDiscountTier || ''}","\${r.b2bPricing?.moq || ''}","\${(r.b2bPricing?.b2bStrategy || '').replace(/"/g, '""')}","\${(r.b2bPricing?.paymentTerms || '').replace(/"/g, '""')}","\${r.sellerBusiness.replace(/"/g, '""')}","\${r.websiteSource}","\${r.businessDetails.replace(/"/g, '""')}","\${r.location}","\${r.logistics.replace(/"/g, '""')}","\${r.statusTag}"\\n\`;
      });
    } else {
      csvContent += 'Business Name,Category,Products/Services,B2B Wholesale Price,Bulk Discount Tier,MOQ,B2B Selling Strategy,Payment Terms,Website,Phone,Email,Address,Lat/Long,Business Status,Verification Status\\n';
      productSellerResults.forEach((s) => {
        csvContent += \`"\${s.businessName.replace(/"/g, '""')}","\${s.category.replace(/"/g, '""')}","\${s.productsServices.replace(/"/g, '""')}","\${s.b2bPricing?.wholesalePrice || ''}","\${s.b2bPricing?.bulkDiscountTier || ''}","\${s.b2bPricing?.moq || ''}","\${(s.b2bPricing?.b2bStrategy || '').replace(/"/g, '""')}","\${(s.b2bPricing?.paymentTerms || '').replace(/"/g, '""')}","\${s.website}","\${s.phone}","\${s.email}","\${s.address.replace(/"/g, '""')}","\${s.latitude}, \${s.longitude}","\${s.businessStatus}","\${s.verificationStatus}"\\n\`;
      });
    }`;

code = code.replace(oldCsvExport, newCsvExport);

// 6. UPDATE handleSaveSpecMerchant
const oldSaveSpec = `      remarks: \`Product: \${item.product} (\${item.price}) | Details: \${item.businessDetails} | Location: \${item.location} (\${item.distanceKm}km)\`,`;
const newSaveSpec = `      remarks: \`Product: \${item.product} (\${item.price}) | B2B Wholesale: \${item.b2bPricing?.wholesalePrice || 'N/A'} (\${item.b2bPricing?.bulkDiscountTier || ''}, \${item.b2bPricing?.moq || ''}) | Strategy: \${item.b2bPricing?.b2bStrategy || ''} | Details: \${item.businessDetails} | Location: \${item.location} (\${item.distanceKm}km)\`,`;
code = code.replace(oldSaveSpec, newSaveSpec);

fs.writeFileSync(pagePath, code, 'utf8');
console.log('Successfully updated page.tsx with B2B pricing & discount strategy columns!');

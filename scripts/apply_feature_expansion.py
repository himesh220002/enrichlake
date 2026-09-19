import re

path = "/home/himesh/MYProjects/Nextjs/Enricher/enricher-app/src/app/page.tsx"
with open(path) as f:
    content = f.read()

# 1. Update lucide imports
if "MessageCircle," not in content:
    content = content.replace(
        "  AlertTriangle,\n} from 'lucide-react';",
        "  AlertTriangle,\n  MessageCircle,\n  Eye,\n  Share2,\n} from 'lucide-react';"
    )

# 2. Add state variables
state_target = "  const [productVerificationFilter, setProductVerificationFilter] = useState('all');"
state_addition = """  const [productVerificationFilter, setProductVerificationFilter] = useState('all');
  const [inspectingSeller, setInspectingSeller] = useState<ProductSellerRecord | null>(null);
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>([]);
  const [deepEnrichingId, setDeepEnrichingId] = useState<string | null>(null);
  const [sellerEnrichData, setSellerEnrichData] = useState<Record<string, any>>({});"""

if state_target in content and "inspectingSeller" not in content:
    content = content.replace(state_target, state_addition)

# 3. Add handler functions right before handleSaveSeller
handler_target = "  const handleSaveSeller = (seller: ProductSellerRecord) => {"
handlers = """  const getWhatsAppUrl = (phone: string, businessName: string) => {
    const cleanDigits = phone.replace(/[^\\d]/g, '');
    let intl = cleanDigits;
    if (cleanDigits.length === 10) {
      intl = `91${cleanDigits}`;
    } else if (cleanDigits.startsWith('0') && cleanDigits.length === 11) {
      intl = `91${cleanDigits.slice(1)}`;
    }
    const queryTerm = productQuery || 'Hardware & IT Sourcing';
    const text = encodeURIComponent(
      `Hello ${businessName}, we are reaching out via ENRICHER.AI regarding commercial bulk procurement for ${queryTerm}. Please share your current wholesale availability, MOQ, and corporate pricing terms.`
    );
    return `https://wa.me/${intl}?text=${text}`;
  };

  const handleToggleSelectSeller = (id: string) => {
    setSelectedSellerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllSellers = () => {
    if (selectedSellerIds.length === productSellerResults.length) {
      setSelectedSellerIds([]);
    } else {
      setSelectedSellerIds(productSellerResults.map((s) => s.id));
    }
  };

  const handleBatchImportSellers = () => {
    const toImport = productSellerResults.filter((s) => selectedSellerIds.includes(s.id));
    if (toImport.length === 0) return;
    toImport.forEach((seller) => {
      let cleanDomain = '';
      if (seller.website) {
        try {
          cleanDomain = new URL(seller.website).hostname.replace(/^www\\./, '');
        } catch {}
      }
      ProfileStorageService.saveProfile({
        domain: cleanDomain,
        url: seller.website || '',
        companyName: seller.businessName,
        category: seller.category,
        description: seller.productsServices,
        rating: seller.rating ? Math.round(seller.rating) : 5,
        mark: 'Qualified',
        remarks: `Search Scope: ${searchCoverage.coveragePerimeter} | Location: ${seller.address} | Lat/Long: ${seller.latitude}, ${seller.longitude} (${seller.distanceKm}km) | Status: ${seller.businessStatus} | Verification: ${seller.verificationStatus}`,
        listName: 'Supplier Directory',
        tags: [seller.businessStatus, seller.verificationStatus, 'Product Finder'],
        contactInfo: {
          emails: seller.email ? [seller.email] : [],
          phones: seller.phone ? [seller.phone] : [],
          addresses: [seller.address],
          socialLinks: {},
        },
        technographics: {
          technologies: [],
          rawDetectionsCount: 0,
        },
      });
    });
    setSavedProfiles(ProfileStorageService.getProfiles());
    setProductSaveMessage(`Imported ${toImport.length} suppliers to Account Graph!`);
    setSelectedSellerIds([]);
    setTimeout(() => setProductSaveMessage(null), 3500);
  };

  const handleBatchExportSelectedSellersCSV = () => {
    const targets = productSellerResults.filter((s) => selectedSellerIds.includes(s.id));
    if (targets.length === 0) return;
    let csv = 'Business Name,Rating,Reviews,Category,Products/Services,Phone,Email,Address,Lat,Long,Status,Verification,Website\\n';
    targets.forEach((s) => {
      csv += `"${s.businessName.replace(/"/g, '""')}","${s.rating || ''}","${s.reviewsCount || ''}","${s.category.replace(/"/g, '""')}","${s.productsServices.replace(/"/g, '""')}","${s.phone}","${s.email}","${s.address.replace(/"/g, '""')}","${s.latitude}","${s.longitude}","${s.businessStatus}","${s.verificationStatus}","${s.website}"\\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `b2b_sellers_selected_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeepEnrichSeller = async (seller: ProductSellerRecord) => {
    if (!seller.website) return;
    setDeepEnrichingId(seller.id);
    try {
      let domain = '';
      try {
        domain = new URL(seller.website).hostname.replace(/^www\\./, '');
      } catch {
        domain = seller.website.replace(/^https?:\\/\\//, '').replace(/\\/.*$/, '');
      }
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (data?.data) {
        setSellerEnrichData((prev) => ({ ...prev, [seller.id]: data.data }));
        const enrichedEmails = data.data.contactInfo?.emails || [];
        const enrichedPhones = data.data.contactInfo?.phones || [];
        if (enrichedEmails.length > 0 || enrichedPhones.length > 0) {
          setProductSellerResults((prev) =>
            prev.map((s) =>
              s.id === seller.id
                ? {
                    ...s,
                    email: s.email || enrichedEmails[0] || '',
                    phone: s.phone || enrichedPhones[0] || '',
                  }
                : s
            )
          );
        }
      }
    } catch (err) {
      console.error('Deep enrich error:', err);
    } finally {
      setDeepEnrichingId(null);
    }
  };

  const handleSaveSeller = (seller: ProductSellerRecord) => {"""

if handler_target in content and "getWhatsAppUrl" not in content:
    content = content.replace(handler_target, handlers)

# 4. Update the Verification select to include Google Maps options
old_opts = """                      <option value="all">All Verifications ({productSellerResults.length})</option>
                      <option value="GSTIN Verified">GSTIN Verified</option>"""
new_opts = """                      <option value="all">All Verifications ({productSellerResults.length})</option>
                      <option value="Google Maps Verified">Google Maps Verified</option>
                      <option value="Unverified Listing">Unverified Listing</option>
                      <option value="GSTIN Verified">GSTIN Verified</option>"""

if old_opts in content:
    content = content.replace(old_opts, new_opts)

with open(path, "w") as f:
    f.write(content)

print("Applied feature expansion step 1 successfully")

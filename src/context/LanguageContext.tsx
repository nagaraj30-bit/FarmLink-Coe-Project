import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Tagline
    'brand.name': 'FarmLink',
    'brand.tagline': 'Sell smarter. Earn better.',
    'brand.sub': 'Agricultural marketplace & net-return decision support for farmers and produce buyers.',

    // Navigation
    'nav.home': 'Home',
    'nav.farmerDashboard': 'Farmer Dashboard',
    'nav.marketplace': 'Buyer Marketplace',
    'nav.addProduce': 'Add Produce',
    'nav.roles': 'Switch Role',
    'nav.resetData': 'Reset Demo Data',
    'nav.resetSuccess': 'Demo data reset successfully!',

    // Common actions
    'action.compareOffers': 'Compare Offers',
    'action.makeOffer': 'Make an Offer',
    'action.acceptOffer': 'Accept Offer',
    'action.declineOffer': 'Decline',
    'action.viewDetails': 'View Details',
    'action.back': 'Back',
    'action.submit': 'Submit',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.filter': 'Filter',
    'action.all': 'All',

    // Core concepts
    'term.netReturn': 'Estimated Net Return',
    'term.grossTotal': 'Gross Offer Amount',
    'term.transportCost': 'Transportation Cost',
    'term.packagingCost': 'Packaging Cost',
    'term.otherCosts': 'Other Selling Costs',
    'term.totalCosts': 'Total Deductions',
    'term.offeredPrice': 'Offered Unit Price',
    'term.expectedPrice': 'Expected Price',
    'term.quantity': 'Quantity',
    'term.unit': 'Unit',
    'term.deadline': 'Selling Deadline',
    'term.urgency': 'Selling Urgency',
    'term.harvestDate': 'Harvest Date',
    'term.district': 'District',
    'term.mandiBenchmark': 'Mandi Benchmark',
    'term.benchmarkDate': 'Benchmark Date',
    'term.storageCondition': 'Storage Condition',
    'term.status': 'Status',
    'term.bestReturn': 'Best Estimated Return',

    // Urgency levels
    'urgency.high': 'High Urgency (≤ 1 day)',
    'urgency.medium': 'Medium Urgency (2-3 days)',
    'urgency.normal': 'Normal Urgency (> 3 days)',
    'urgency.highDesc': 'Must be sold within 24 hours to match farmer schedule.',
    'urgency.mediumDesc': 'Sell within 2 to 3 days to avoid distress selling.',
    'urgency.normalDesc': 'Listing has more than 3 days remaining.',

    // Statuses
    'status.active': 'Active',
    'status.negotiating': 'Negotiating',
    'status.sold': 'Sold',
    'status.declined': 'Declined',
    'status.pending': 'Pending Review',

    // Disclaimers & notices
    'disclaimer.netReturn': 'Estimated net return, based on entered costs — not a guaranteed profit.',
    'disclaimer.transparency': 'Prices and benchmarks reflect regional mandi records for farmer reference. FarmLink does not claim biological spoilage prediction or guaranteed margins.',

    // Unsold guidance
    'unsold.heading': 'Unsold Produce Decision Support',
    'unsold.sub': 'Practical next-step avenues when offers are low or deadline is approaching.',
    'unsold.viewOptions': 'View Unsold Produce Options',

    // Authentication & Identity
    'auth.signIn': 'Sign In',
    'auth.register': 'Register',
    'auth.signOut': 'Sign Out',
    'auth.loginTitle': 'Sign In to FarmLink',
    'auth.loginSubtitle': 'Choose your role and sign in to access your customized dashboard or marketplace.',
    'auth.registerTitle': 'Create FarmLink Account',
    'auth.registerSubtitle': 'Join the decision-support marketplace as a Farmer or Agricultural Produce Buyer.',
    'auth.selectRole': 'Select Role',
    'auth.farmerRole': 'Farmer',
    'auth.buyerRole': 'Produce Buyer',
    'auth.mobileNumber': 'Mobile Number',
    'auth.otpCode': 'OTP Code (6-digit demo code)',
    'auth.sendOtp': 'Get Demo OTP',
    'auth.verifySignIn': 'Verify & Sign In',
    'auth.quickDemoHeader': 'Instant Demo Profile Access',
    'auth.quickDemoSub': 'Select a pre-configured verified persona to test the platform instantly:',
    'auth.noAccount': "Don't have an account?",
    'auth.alreadyAccount': 'Already have an account?',
    'auth.demoNotice': 'Frontend Demonstration Only — no real SMS is sent. Enter any 6-digit code or choose a demo persona.',
    'auth.localRegisterNotice': 'Local Prototype Registration: Your profile is saved in browser storage for this evaluation session.',
    'auth.fullName': 'Full Name',
    'auth.district': 'District',
    'auth.taluk': 'Local Area / Taluk',
    'auth.fpoMember': 'FPO (Farmer Producer Organization) Member',
    'auth.businessName': 'Business / Firm Name',
    'auth.businessClassification': 'Business Classification',
    'auth.profileDetails': 'Profile Details',
    'auth.guest': 'Guest User',
    'auth.guestBadge': 'Guest Mode',
    'auth.guestPrompt': 'You are currently browsing as Guest. Sign in to access your farmer tools or make buyer offers.',
    'auth.roleMismatchFarmer': 'You are currently logged in as a Buyer. Switch to a Farmer profile to manage listings.',
    'auth.roleMismatchBuyer': 'You are currently logged in as a Farmer. Switch to a Buyer profile to submit purchase offers.',

    // Profile Management
    'profile.title': 'Farmer Profile Management',
    'profile.subtitle': 'Update your agricultural district, contact details, and FPO membership status.',
    'profile.saveSuccess': 'Profile details updated successfully!',
    'profile.fpoBenefit': 'FPO membership links you with regional aggregation groups, reducing freight overhead by up to 60%.',
    'profile.buyerPreview': 'Farmer Badge Preview for Buyers',
    'profile.manageProfile': 'Manage Profile',
    'profile.editNotice': 'Changes are saved in your active session and applied to your marketplace listings.',

    // Marketplace search & filters
    'marketplace.searchPlaceholder': 'Search produce by crop name, variety, farmer, or district...',
    'marketplace.searchLabel': 'Search Produce',
    'marketplace.clearSearch': 'Clear Search',
    'marketplace.activeFilters': 'Active filters',
    'marketplace.clearAllFilters': 'Clear All',
    'marketplace.noResultsTitle': 'No produce found matching your search',
    'marketplace.noResultsDesc': 'No active produce listings matched your keywords and filter criteria. Try adjusting your query or resetting filters.',
    'marketplace.myOffersLink': 'My Submitted Offers',

    // Buyer Offers
    'buyerOffers.title': 'My Submitted Purchase Offers',
    'buyerOffers.subtitle': 'Track your structured price bids, freight deductions, and review status from farmers.',
    'buyerOffers.badge': 'Procurement Pipeline',
    'buyerOffers.emptyTitle': 'No Offers Submitted Yet',
    'buyerOffers.emptyDesc': "You haven't placed any purchase offers on available produce lots. Browse the active marketplace to find fresh lots and submit competitive bids.",
    'buyerOffers.browseMarketplace': 'Browse Marketplace Catalog',
    'buyerOffers.filterAll': 'All Offers',
    'buyerOffers.filterPending': 'Pending Review',
    'buyerOffers.filterAccepted': 'Accepted Offers',
    'buyerOffers.filterDeclined': 'Declined Offers',
    'buyerOffers.offeredUnit': 'Offered Rate',
    'buyerOffers.grossTotal': 'Gross Value',
    'buyerOffers.deductions': 'Selling Cost Deductions',
    'buyerOffers.estNetReturn': 'Est. Net Return to Farmer',
    'buyerOffers.pickupAt': 'Pickup Location',
    'buyerOffers.paymentTerms': 'Payment Settlement',
    'buyerOffers.notes': 'Buyer Notes',
    'buyerOffers.viewProduce': 'View Produce Details',
    'buyerOffers.listingSoldNotice': 'Deal Finalized: Produce accepted! Contact farmer to finalize pickup and dispatch.',
    'buyerOffers.roleMismatchNotice': 'You are currently in Farmer mode. This page tracks purchase offers submitted by wholesale produce buyers.',

    // Offer Decline & Listing Edit
    'offer.declineConfirmTitle': 'Decline Buyer Offer?',
    'offer.declineConfirmDesc': 'Are you sure you want to decline this purchase offer? This offer will be marked as declined and will no longer count towards your best net-return recommendations.',
    'offer.declineSuccess': 'Buyer offer declined successfully.',
    'offer.declineErrorOwner': 'Only the farmer who listed this produce can decline or accept offers.',
    'offer.declineErrorAlreadyDecided': 'This offer has already been accepted or declined and cannot be changed.',

    'listing.editTitle': 'Edit Produce Listing',
    'listing.editSubtitle': 'Update target price, minimum floor price, and selling deadline for this produce lot.',
    'listing.targetPrice': 'Target Expected Price',
    'listing.floorPrice': 'Minimum Acceptable Floor Price',
    'listing.deadlineDays': 'Selling Deadline (Days Remaining)',
    'listing.editSuccess': 'Listing updated successfully!',
    'listing.preserveOffersNotice': 'Existing buyer offers are preserved with their original agreed rates. Updating your target and floor price refines future bids and marketplace visibility.',
    'listing.errorFloorExceedsTarget': 'Minimum floor price cannot exceed target expected price.',
    'listing.errorPositivePrices': 'Prices must be greater than zero.',
    'listing.errorDeadline': 'Selling deadline must be at least 1 day.',
    'listing.errorNotOwner': 'Only the owner of this listing can edit it.',
    'listing.errorSold': 'Sold produce listings cannot be edited.',

    // 404 Not Found
    'notFound.title': 'Page Not Found',
    'notFound.code': '404',
    'notFound.subtitle': "The page you are looking for doesn't exist, has been removed, or the link may be broken.",
    'notFound.home': 'Back to Home',
    'notFound.marketplace': 'Browse Marketplace',
    'notFound.dashboard': 'Farmer Dashboard',
    'notFound.signIn': 'Sign In / Choose Persona',

    // Route Guards & Ownership
    'guard.guestTitle': 'Authentication Required',
    'guard.guestDesc': 'Guests must sign in or select a demo persona before accessing this workspace.',
    'guard.farmerOnlyTitle': 'Farmer Workspace Only',
    'guard.farmerOnlyDesc': 'This section is reserved for farmers managing produce listings and evaluating net-return bids.',
    'guard.buyerOnlyTitle': 'Buyer Workspace Only',
    'guard.buyerOnlyDesc': 'This section is reserved for wholesale produce buyers submitting and managing purchase offers.',
    'guard.ownershipTitle': 'Private Listing Access Restricted',
    'guard.ownershipDesc': 'You do not have permission to view or manage offers for another farmer’s produce lot. Only the listing farmer can review private offers.',
    'guard.quickFarmer': 'Continue as Demo Farmer (Murugan)',
    'guard.quickBuyer': 'Continue as Demo Buyer (Priya Wholesale)',
    'guard.switchPersona': 'Switch Demo Persona',

    // Categories
    'category.vegetables': 'Vegetables',
    'category.fruits': 'Fruits',
    'category.grains': 'Grains',
    'category.spices': 'Spices',
    'category.oilseeds': 'Oilseeds',

    // Units
    'unit.kg': 'kg (Kilogram)',
    'unit.quintal': 'quintal (100 kg)',
    'unit.box': 'box',
    'unit.bags': 'bags',
    'unit.nuts': 'nuts (Coconuts)',

    // Showcase
    'showcase.optionA': 'Option A',
    'showcase.optionB': 'Option B',
    'showcase.buyerA': 'Buyer A (Higher Unit Price)',
    'showcase.buyerB': 'Buyer B (Lower Unit Price, Low Costs)',
    'showcase.takeHome': 'take-home',
  },
  ta: {
    // Brand & Tagline
    'brand.name': 'பார்ம்லிங்க் (FarmLink)',
    'brand.tagline': 'விவேகமாக விற்கவும். அதிக வருவாய் ஈட்டவும்.',
    'brand.sub': 'விவசாயிகளுக்கான நிகர வருவாய் ஒப்பீடு மற்றும் விற்பனை முடிவு ஆதரவு தளம்.',

    // Navigation
    'nav.home': 'முகப்பு',
    'nav.farmerDashboard': 'விவசாயி டாஷ்போர்டு',
    'nav.marketplace': 'கொள்முதல் சந்தை',
    'nav.addProduce': 'விளைபொருள் சேர்க்க',
    'nav.roles': 'பயனர் மாற்று',
    'nav.resetData': 'டெமோ தரவை மீட்டமை',
    'nav.resetSuccess': 'டெமோ தரவு வெற்றிகரமாக மீட்டமைக்கப்பட்டது!',

    // Common actions
    'action.compareOffers': 'விலை வாய்ப்புகளை ஒப்பிடுக',
    'action.makeOffer': 'விலை சமர்ப்பிக்க',
    'action.acceptOffer': 'ஏற்றுக்கொள்',
    'action.declineOffer': 'நிராகரி',
    'action.viewDetails': 'விவரங்கள் பார்க்க',
    'action.back': 'பின்செல்ல',
    'action.submit': 'சமர்ப்பிக்க',
    'action.save': 'சேமிக்க',
    'action.cancel': 'ரத்து செய்',
    'action.filter': 'வடிகட்டு',
    'action.all': 'அனைத்தும்',

    // Core concepts
    'term.netReturn': 'மதிப்பிடப்பட்ட நிகர வருவாய்',
    'term.grossTotal': 'மொத்த விலை மதிப்பு',
    'term.transportCost': 'போக்குவரத்து செலவு',
    'term.packagingCost': 'பேக்கிங் செலவு',
    'term.otherCosts': 'இதர விற்பனை செலவுகள்',
    'term.totalCosts': 'மொத்த பிடித்தங்கள்',
    'term.offeredPrice': 'வழங்கப்பட்ட அலகு விலை',
    'term.expectedPrice': 'எதிர்பார்க்கும் விலை',
    'term.quantity': 'அளவு',
    'term.unit': 'அலகு',
    'term.deadline': 'விற்பனை காலக்கெடு',
    'term.urgency': 'விற்பனை அவசரம்',
    'term.harvestDate': 'அறுவடை தேதி',
    'term.district': 'மாவட்டம்',
    'term.mandiBenchmark': 'மண்டி சந்தை நிலவரம்',
    'term.benchmarkDate': 'மண்டி பதிவு தேதி',
    'term.storageCondition': 'சேமிப்பு நிலை',
    'term.status': 'நிலை',
    'term.bestReturn': 'சிறந்த நிகர வருவாய்',

    // Urgency levels
    'urgency.high': 'அதிக அவசரம் (≤ 1 நாள்)',
    'urgency.medium': 'நடுத்தர அவசரம் (2-3 நாட்கள்)',
    'urgency.normal': 'இயல்பான நிலை (> 3 நாட்கள்)',
    'urgency.highDesc': 'விவசாயியின் திட்டமிட்ட காலக்கெடுவுக்குள் 24 மணி நேரத்திற்குள் விற்கப்பட வேண்டும்.',
    'urgency.mediumDesc': 'அவசர விற்பனையைத் தவிர்க்க 2 முதல் 3 நாட்களுக்குள் விற்கவும்.',
    'urgency.normalDesc': 'விற்பனைக்கு 3 நாட்களுக்கு மேல் உள்ளது.',

    // Statuses
    'status.active': 'செயலில் உள்ளது',
    'status.negotiating': 'பேச்சுவார்த்தையில்',
    'status.sold': 'விற்கப்பட்டது',
    'status.declined': 'நிராகரிக்கப்பட்டது',
    'status.pending': 'பரிசீலனையில்',

    // Disclaimers & notices
    'disclaimer.netReturn': 'உள்ளீடு செய்யப்பட்ட செலவுகளின் அடிப்படையில் கணக்கிடப்பட்ட நிகர வருவாய் — உத்தரவாதமான லாபம் அல்ல.',
    'disclaimer.transparency': 'விலை நிலவரங்கள் தமிழ்நாடு ஒழுங்குமுறை விற்பனைக்கூட பதிவுகளின் அடிப்படையிலானவை. இது உயிரியல் அழுகல் கணிப்பு அல்ல.',

    // Unsold guidance
    'unsold.heading': 'விற்கப்படாத விளைபொருள் முடிவு வழிகாட்டி',
    'unsold.sub': 'குறைந்த விலை அல்லது காலக்கெடு நெருங்கும் போது விவசாயிக்கான நடைமுறை தீர்வுகள்.',
    'unsold.viewOptions': 'விற்கப்படாத விளைபொருள் வழிகாட்டல் பார்க்க',

    // Authentication & Identity
    'auth.signIn': 'உள்நுழைக',
    'auth.register': 'பதிவு செய்க',
    'auth.signOut': 'வெளியேறு',
    'auth.loginTitle': 'பார்ம்லிங்க் உள்நுழைவு',
    'auth.loginSubtitle': 'உங்கள் பங்கினைத் தேர்ந்தெடுத்து, உங்கள் டாஷ்போர்டு அல்லது சந்தையை அணுக உள்நுழையவும்.',
    'auth.registerTitle': 'புதிய கணக்கை உருவாக்கவும்',
    'auth.registerSubtitle': 'விவசாயி அல்லது வேளாண் விளைபொருள் வாங்குபவராக முடிவு ஆதரவு தளத்தில் இணையுங்கள்.',
    'auth.selectRole': 'பங்கைத் தேர்ந்தெடுக்கவும்',
    'auth.farmerRole': 'விவசாயி',
    'auth.buyerRole': 'கொள்முதல் வியாபாரி',
    'auth.mobileNumber': 'கைபேசி எண்',
    'auth.otpCode': 'OTP குறியீடு (6 இலக்க டெமோ குறியீடு)',
    'auth.sendOtp': 'டெமோ OTP பெறுக',
    'auth.verifySignIn': 'சரிபார்த்து உள்நுழைக',
    'auth.quickDemoHeader': 'உடனடி டெமோ பயனர் அணுகல்',
    'auth.quickDemoSub': 'தளத்தை உடனடியாகச் சோதிக்க முன்-அமைக்கப்பட்ட பயனரைத் தேர்ந்தெடுக்கவும்:',
    'auth.noAccount': 'கணக்கு இல்லையா?',
    'auth.alreadyAccount': 'ஏற்கனவே கணக்கு உள்ளதா?',
    'auth.demoNotice': 'முன்னணி டெமோ மட்டுமே — உண்மையான SMS அனுப்பப்படாது. ஏதேனும் 6 இலக்க எண்ணை உள்ளிடவும் அல்லது டெமோ பயனரைத் தேர்ந்தெடுக்கவும்.',
    'auth.localRegisterNotice': 'உள்ளூர் டெமோ பதிவு: உங்கள் விவரங்கள் இந்த மதிப்பீட்டு அமர்விற்காக உங்கள் உலாவியில் சேமிக்கப்படும்.',
    'auth.fullName': 'முழுப் பெயர்',
    'auth.district': 'மாவட்டம்',
    'auth.taluk': 'வட்டம் / பகுதி',
    'auth.fpoMember': 'FPO (உழவர் உற்பத்தியாளர் நிறுவனம்) உறுப்பினர்',
    'auth.businessName': 'நிறுவனத்தின் பெயர்',
    'auth.businessClassification': 'வணிக வகைப்பாடு',
    'auth.profileDetails': 'பயனர் விவரங்கள்',
    'auth.guest': 'விருந்தினர்',
    'auth.guestBadge': 'விருந்தினர் பயன்முறை',
    'auth.guestPrompt': 'நீங்கள் தற்போது விருந்தினராக உலாவுகிறீர்கள். உங்கள் விவசாயக் கருவிகளை அணுக அல்லது விலை வாய்ப்புகளைச் சமர்ப்பிக்க உள்நுழையவும்.',
    'auth.roleMismatchFarmer': 'நீங்கள் தற்போது வியாபாரியாக உள்நுழைந்துள்ளீர்கள். பதிவுகளை நிர்வகிக்க விவசாயி சுயவிவரத்திற்கு மாறவும்.',
    'auth.roleMismatchBuyer': 'நீங்கள் தற்போது விவசாயியாக உள்நுழைந்துள்ளீர்கள். கொள்முதல் வாய்ப்புகளைச் சமர்ப்பிக்க வியாபாரி சுயவிவரத்திற்கு மாறவும்.',

    // Profile Management
    'profile.title': 'விவசாயி சுயவிவர மேலாண்மை',
    'profile.subtitle': 'உங்கள் வேளாண் மாவட்டம், தொடர்பு விவரங்கள் மற்றும் FPO உறுப்பினர் நிலையை புதுப்பிக்கவும்.',
    'profile.saveSuccess': 'சுயவிவர விவரங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!',
    'profile.fpoBenefit': 'FPO உறுப்பினர் பதிவு உங்களை குழுவாக இணைத்து லாரி வாடகையை 60% வரை குறைக்க உதவுகிறது.',
    'profile.buyerPreview': 'வாங்குபவர்கள் பார்க்கும் விவசாயி சுயவிவர முன்னோட்டம்',
    'profile.manageProfile': 'சுயவிவரத்தை நிர்வகிக்க',
    'profile.editNotice': 'மாற்றங்கள் உங்கள் அமர்வில் சேமிக்கப்பட்டு சந்தை பதிவுகளில் பயன்படுத்தப்படும்.',

    // Marketplace search & filters
    'marketplace.searchPlaceholder': 'பயிர் பெயர், ரகம், விவசாயி அல்லது மாவட்டம் வாரியாக தேடவும்...',
    'marketplace.searchLabel': 'விளைபொருட்களை தேடுக',
    'marketplace.clearSearch': 'தேடலை அழிக்கவும்',
    'marketplace.activeFilters': 'செயலில் உள்ள வடிகட்டிகள்',
    'marketplace.clearAllFilters': 'அனைத்தையும் அழிக்கவும்',
    'marketplace.noResultsTitle': 'தேடலுக்குரிய விளைபொருட்கள் கிடைக்கவில்லை',
    'marketplace.noResultsDesc': 'உங்கள் தேடல் மற்றும் வடிகட்டிகளுக்கு பொருந்தும் விளைபொருட்கள் இல்லை. தேடல் சொல்லை மாற்றவும் அல்லது "அனைத்து மாவட்டங்கள்" தேர்ந்தெடுக்கவும்.',
    'marketplace.myOffersLink': 'எனது கொள்முதல் சலுகைகள்',

    // Buyer Offers
    'buyerOffers.title': 'எனது சமர்ப்பிக்கப்பட்ட கொள்முதல் சலுகைகள்',
    'buyerOffers.subtitle': 'உங்கள் விலை வாய்ப்புகள், போக்குவரத்து கழிவுகள் மற்றும் விவசாயியின் ஒப்புதல் நிலையை கண்காணிக்கவும்.',
    'buyerOffers.badge': 'கொள்முதல் கண்காணிப்பு',
    'buyerOffers.emptyTitle': 'இதுவரை சலுகைகள் சமர்ப்பிக்கப்படவில்லை',
    'buyerOffers.emptyDesc': 'நீங்கள் எந்த விளைபொருட்களுக்கும் கொள்முதல் சலுகைகளை சமர்ப்பிக்கவில்லை. சந்தையை உலாவவும், நேரடி விலை சலுகைகளை வழங்கவும்.',
    'buyerOffers.browseMarketplace': 'கொள்முதல் சந்தைக்கு செல்லவும்',
    'buyerOffers.filterAll': 'அனைத்து சலுகைகள்',
    'buyerOffers.filterPending': 'பரிசீலனையில் உள்ளவை',
    'buyerOffers.filterAccepted': 'ஏற்றுக்கொள்ளப்பட்டவை',
    'buyerOffers.filterDeclined': 'நிராகரிக்கப்பட்டவை',
    'buyerOffers.offeredUnit': 'வழங்கப்பட்ட விலை',
    'buyerOffers.grossTotal': 'மொத்த மதிப்பு',
    'buyerOffers.deductions': 'விற்பனை செலவு கழிவுகள்',
    'buyerOffers.estNetReturn': 'விவசாயிக்கான நிகர வருவாய்',
    'buyerOffers.pickupAt': 'எடுத்துச்செல்லும் இடம்',
    'buyerOffers.paymentTerms': 'பணப்பட்டுவாடா முறை',
    'buyerOffers.notes': 'குறிப்புகள்',
    'buyerOffers.viewProduce': 'விளைபொருள் விவரம்',
    'buyerOffers.listingSoldNotice': 'ஒப்பந்தம் முடிந்தது: சலுகை ஏற்றுக்கொள்ளப்பட்டது! லாரி மற்றும் சரக்கு ஏற்றுமதிக்கு விவசாயியை தொடர்பு கொள்ளவும்.',
    'buyerOffers.roleMismatchNotice': 'நீங்கள் தற்போது விவசாயி முறையில் உள்ளீர்கள். இந்த பக்கம் மொத்த கொள்முதலாளர்கள் சமர்ப்பித்த சலுகைகளை காட்டுகிறது.',

    // Offer Decline & Listing Edit
    'offer.declineConfirmTitle': 'வாங்குபவர் சலுகையை நிராகரிக்கவா?',
    'offer.declineConfirmDesc': 'இந்த கொள்முதல் சலுகையை நிராகரிக்க விரும்புகிறீர்களா? இது நிராகரிக்கப்பட்டதாக குறிக்கப்படும் மற்றும் இனி உங்கள் சிறந்த நிகர வருவாய் பரிந்துரைகளில் கணக்கிடப்படாது.',
    'offer.declineSuccess': 'கொள்முதல் சலுகை வெற்றிகரமாக நிராகரிக்கப்பட்டது.',
    'offer.declineErrorOwner': 'பட்டியலிட்ட விவசாயி மட்டுமே இந்த சலுகையை நிராகரிக்க அல்லது ஏற்க முடியும்.',
    'offer.declineErrorAlreadyDecided': 'இந்த சலுகை ஏற்கனவே ஏற்கப்பட்டது அல்லது நிராகரிக்கப்பட்டது, மாற்ற முடியாது.',

    'listing.editTitle': 'விளைபொருள் விவரங்களை திருத்தவும்',
    'listing.editSubtitle': 'எதிர்பார்க்கும் விலை, குறைந்தபட்ச விலை மற்றும் காலக்கெடுவை புதுப்பிக்கவும்.',
    'listing.targetPrice': 'எதிர்பார்க்கும் இலக்கு விலை',
    'listing.floorPrice': 'குறைந்தபட்ச ஏற்புடைய விலை',
    'listing.deadlineDays': 'விற்பனை காலக்கெடு (மீதமுள்ள நாட்கள்)',
    'listing.editSuccess': 'விளைபொருள் விவரங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!',
    'listing.preserveOffersNotice': 'வாங்குபவர்களால் ஏற்கனவே அளிக்கப்பட்ட சலுகைகள் அவற்றின் அசல் விலையில் பாதுகாக்கப்படும். இலக்கு விலையை மாற்றுவது புதிய சலுகைகளை வழிநடத்தும்.',
    'listing.errorFloorExceedsTarget': 'குறைந்தபட்ச விலை எதிர்பார்க்கும் விலையை விட அதிகமாக இருக்க முடியாது.',
    'listing.errorPositivePrices': 'விலை பூஜ்ஜியத்தை விட அதிகமாக இருக்க வேண்டும்.',
    'listing.errorDeadline': 'விற்பனை காலக்கெடு குறைந்தபட்சம் 1 நாளாக இருக்க வேண்டும்.',
    'listing.errorNotOwner': 'பட்டியலிட்ட விவசாயி மட்டுமே இந்த விளைபொருளை திருத்த முடியும்.',
    'listing.errorSold': 'விற்கப்பட்ட விளைபொருட்களை திருத்த முடியாது.',

    // 404 Not Found
    'notFound.title': 'பக்கம் கிடைக்கவில்லை',
    'notFound.code': '404',
    'notFound.subtitle': 'நீங்கள் தேடும் பக்கம் இல்லை, அகற்றப்பட்டிருக்கலாம் அல்லது இணைப்பு தவறாக இருக்கலாம்.',
    'notFound.home': 'முகப்புக்குச் செல்க',
    'notFound.marketplace': 'சந்தைக்குச் செல்க',
    'notFound.dashboard': 'விவசாயி டாஷ்போர்டு',
    'notFound.signIn': 'உள்நுழைய / பயனர் மாற்று',

    // Route Guards & Ownership
    'guard.guestTitle': 'உள்நுழைவு தேவை',
    'guard.guestDesc': 'இந்த பகுதியை அணுக விருந்தினர்கள் உள்நுழைய வேண்டும் அல்லது டெமோ பாத்திரத்தைத் தேர்ந்தெடுக்க வேண்டும்.',
    'guard.farmerOnlyTitle': 'விவசாயி பயன்முறை மட்டுமே',
    'guard.farmerOnlyDesc': 'இந்த பகுதி விளைபொருட்களை பட்டியலிடவும் பெறப்பட்ட விலை சலுகைகளை மதிப்பிடவும் விவசாயிகளுக்கு மட்டுமே ஒதுக்கப்பட்டுள்ளது.',
    'guard.buyerOnlyTitle': 'வாங்குபவர் பயன்முறை மட்டுமே',
    'guard.buyerOnlyDesc': 'இந்த பகுதி கொள்முதல் சலுகைகளை சமர்ப்பிக்கவும் கண்காணிக்கவும் மொத்த வியாபாரிகளுக்கு மட்டுமே ஒதுக்கப்பட்டுள்ளது.',
    'guard.ownershipTitle': 'தனிப்பட்ட விளைபொருள் அணுகல் கட்டுப்பாடு',
    'guard.ownershipDesc': 'மற்றொரு விவசாயியின் விளைபொருளுக்கான விலை வாய்ப்புகளைப் பார்க்க அல்லது நிர்வகிக்க உங்களுக்கு அனுமதி இல்லை. பட்டியலிட்ட விவசாயி மட்டுமே இந்த சலுகைகளை ஆய்வு செய்ய முடியும்.',
    'guard.quickFarmer': 'டெமோ விவசாயியாக தொடரவும் (முருகன்)',
    'guard.quickBuyer': 'டெமோ வியாபாரியாக தொடரவும் (பிரியா ஹோல்சேல்)',
    'guard.switchPersona': 'டெமோ பாத்திரத்தை மாற்றுக',

    // Categories
    'category.vegetables': 'காய்கறிகள்',
    'category.fruits': 'பழங்கள்',
    'category.grains': 'தானியங்கள்',
    'category.spices': 'மசாலாப் பொருட்கள்',
    'category.oilseeds': 'எண்ணெய் வித்துக்கள்',

    // Units
    'unit.kg': 'கிலோ (kg)',
    'unit.quintal': 'குவிண்டால் (100 கிலோ)',
    'unit.box': 'பெட்டிகள் (box)',
    'unit.bags': 'மூட்டைகள் (bags)',
    'unit.nuts': 'எண்ணிக்கை (தேங்காய்)',

    // Showcase
    'showcase.optionA': 'விருப்பம் A',
    'showcase.optionB': 'விருப்பம் B',
    'showcase.buyerA': 'வாங்குபவர் A (அதிக அலகு விலை)',
    'showcase.buyerB': 'வாங்குபவர் B (குறைந்த விலை, குறைந்த செலவு)',
    'showcase.takeHome': 'கையில் கிடைக்கும் நிகர வருவாய்',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('farmlink_language');
    return saved === 'ta' ? 'ta' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('farmlink_language', lang);
  };

  const t = (key: string, defaultText?: string): string => {
    return translations[language][key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

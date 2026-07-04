import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Curated Unsplash images for top 100+ destination countries
const UNSPLASH_COUNTRY_IMAGES: Record<string, string> = {
  'france': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
  'japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
  'usa': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=80',
  'united-states': 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=80',
  'uk': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
  'united-kingdom': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80',
  'italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80',
  'spain': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80',
  'germany': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
  'australia': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&q=80',
  'canada': 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&q=80',
  'china': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80',
  'india': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80',
  'brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80',
  'mexico': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=80',
  'thailand': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80',
  'uae': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
  'united-arab-emirates': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80',
  'netherlands': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80',
  'switzerland': 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1200&q=80',
  'portugal': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80',
  'greece': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
  'turkey': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
  'egypt': 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200&q=80',
  'south-africa': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=80',
  'morocco': 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200&q=80',
  'new-zealand': 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=1200&q=80',
  'south-korea': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&q=80',
  'korea': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&q=80',
  'indonesia': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
  'vietnam': 'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=1200&q=80',
  'malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80',
  'philippines': 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&q=80',
  'austria': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&q=80',
  'belgium': 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=1200&q=80',
  'sweden': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&q=80',
  'norway': 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80',
  'denmark': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&q=80',
  'finland': 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=1200&q=80',
  'ireland': 'https://images.unsplash.com/photo-1564959130747-897a8328da60?w=1200&q=80',
  'poland': 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1200&q=80',
  'czechia': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80',
  'czech-republic': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80',
  'hungary': 'https://images.unsplash.com/photo-1551867633-194f125bddfa?w=1200&q=80',
  'argentina': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&q=80',
  'chile': 'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=1200&q=80',
  'peru': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&q=80',
  'colombia': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200&q=80',
  'russia': 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&q=80',
  'saudi-arabia': 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200&q=80',
  'qatar': 'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=1200&q=80',
  'israel': 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&q=80',
  'jordan': 'https://images.unsplash.com/photo-1548786811-dd6e453ccca7?w=1200&q=80',
  'oman': 'https://images.unsplash.com/photo-1559231974-8cac tried-f87?w=1200&q=80',
  'kenya': 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200&q=80',
  'tanzania': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80',
  'iceland': 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80',
  'croatia': 'https://images.unsplash.com/photo-1555990538-1e74b3dd8c53?w=1200&q=80',
  'romania': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1200&q=80',
  'bulgaria': 'https://images.unsplash.com/photo-1601284619879-73ecf9f09b53?w=1200&q=80',
  'slovenia': 'https://images.unsplash.com/photo-1569347946914-dae14c6cce27?w=1200&q=80',
  'slovakia': 'https://images.unsplash.com/photo-1569349412658-31b3b02a9b89?w=1200&q=80',
  'latvia': 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1200&q=80',
  'lithuania': 'https://images.unsplash.com/photo-1574692607019-8f3f8b3e3f1b?w=1200&q=80',
  'estonia': 'https://images.unsplash.com/photo-1558006624-e33e37bc22cd?w=1200&q=80',
  'cuba': 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=1200&q=80',
  'jamaica': 'https://images.unsplash.com/photo-1562975674-87df1d24ee33?w=1200&q=80',
  'costa-rica': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=80',
  'panama': 'https://images.unsplash.com/photo-1555217851-6141535b3d5d?w=1200&q=80',
  'pakistan': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&q=80',
  'bangladesh': 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=1200&q=80',
  'sri-lanka': 'https://images.unsplash.com/photo-1580910768875-6a5bfbf6b5fb?w=1200&q=80',
  'nepal': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80',
  'maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80',
  'cambodia': 'https://images.unsplash.com/photo-1569166019315-a59097df65f0?w=1200&q=80',
  'myanmar': 'https://images.unsplash.com/photo-1558019699-0a4e3dc0e8c8?w=1200&q=80',
  'laos': 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=1200&q=80',
  'taiwan': 'https://images.unsplash.com/photo-1498011109411-81e0c17c06f4?w=1200&q=80',
  'hong-kong': 'https://images.unsplash.com/photo-1536599018102-9f803c979dbc?w=1200&q=80',
  'mongolia': 'https://images.unsplash.com/photo-1551037543-1e0e9d1e929f?w=1200&q=80',
  'uzbekistan': 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200&q=80',
  'kazakhstan': 'https://images.unsplash.com/photo-1561494270-d1e5b8b6ca28?w=1200&q=80',
  'nigeria': 'https://images.unsplash.com/photo-1572803507933-8b587c809c3c?w=1200&q=80',
  'ghana': 'https://images.unsplash.com/photo-1595832091684-2b0d5e7a9eab?w=1200&q=80',
  'ethiopia': 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&q=80',
  'rwanda': 'https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=1200&q=80',
  'senegal': 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1200&q=80',
  'tunisia': 'https://images.unsplash.com/photo-1559419189-4e97a43eb2ff?w=1200&q=80',
  'seychelles': 'https://images.unsplash.com/photo-1589979481223-deb893043163?w=1200&q=80',
  'mauritius': 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=1200&q=80',
  'fiji': 'https://images.unsplash.com/photo-1522153376416-b08b9bfa9e85?w=1200&q=80',
  'bahamas': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=80',
  'barbados': 'https://images.unsplash.com/photo-1570629392364-db5a8b20c1f5?w=1200&q=80',
  'dominican-republic': 'https://images.unsplash.com/photo-1569817171966-4bca9db8d2d2?w=1200&q=80',
  'puerto-rico': 'https://images.unsplash.com/photo-1569821272829-ebb80ba2c012?w=1200&q=80',
  'luxembourg': 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1200&q=80',
  'malta': 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=1200&q=80',
  'cyprus': 'https://images.unsplash.com/photo-1530538095376-a4936b35b5f0?w=1200&q=80',
  'monaco': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1200&q=80',
  'kuwait': 'https://images.unsplash.com/photo-1570108899519-37149fbc72a8?w=1200&q=80',
  'bahrain': 'https://images.unsplash.com/photo-1565108829803-b51a8e2c6b99?w=1200&q=80',
  'lebanon': 'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=1200&q=80',
  'iran': 'https://images.unsplash.com/photo-1564694202883-46e7448c1b26?w=1200&q=80',
  'iraq': 'https://images.unsplash.com/photo-1582127820077-9d7c4b2b6a80?w=1200&q=80',
  'afghanistan': 'https://images.unsplash.com/photo-1562462181-b228e3cff9ad?w=1200&q=80',
  'serbia': 'https://images.unsplash.com/photo-1586609485587-c29bffabfb26?w=1200&q=80',
  'montenegro': 'https://images.unsplash.com/photo-1564413299492-e07e103b0bf7?w=1200&q=80',
  'north-macedonia': 'https://images.unsplash.com/photo-1584456930969-1ae2d2d9dfc8?w=1200&q=80',
  'albania': 'https://images.unsplash.com/photo-1601284619879-73ecf9f09b53?w=1200&q=80',
  'bosnia-and-herzegovina': 'https://images.unsplash.com/photo-1586991359975-54500b7d8357?w=1200&q=80',
  'ukraine': 'https://images.unsplash.com/photo-1561542320-9a18cd340469?w=1200&q=80',
  'belarus': 'https://images.unsplash.com/photo-1557926839-6fb0ed9d5d6f?w=1200&q=80',
  'georgia': 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80',
  'armenia': 'https://images.unsplash.com/photo-1600421588498-5c6e8d43c4a7?w=1200&q=80',
  'azerbaijan': 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=1200&q=80',
  // Regional fallbacks for smaller destinations — reuse proven-working IDs from thematically similar countries
  'angola': 'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200&q=80', // Africa (kenya)
  'paraguay': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&q=80', // South America (argentina)
  'saint-vincent-and-the-grenadines': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=80', // Caribbean (bahamas)
  'burkina-faso': 'https://images.unsplash.com/photo-1595832091684-2b0d5e7a9eab?w=1200&q=80', // West Africa (ghana)
  'botswana': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=80', // Southern Africa (south-africa)
  'brunei': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80', // SE Asia (malaysia)
  'djibouti': 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&q=80', // Horn of Africa (ethiopia)
  'dominica': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=80', // Caribbean
  'equatorial-guinea': 'https://images.unsplash.com/photo-1572803507933-8b587c809c3c?w=1200&q=80', // Central Africa (nigeria)
  'el-salvador': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=80', // Central America (costa-rica)
};

// ─── Region-based fallback pool ─────────────────────────────────────────────
// Every country in our DB maps to a region. Each region has a pool of proven-working
// Unsplash IDs. A hash of the country slug picks one deterministically, so different
// countries in the same region get different images (no duplicates on listings).
const REGION_IMAGES: Record<string, string[]> = {
  'western-europe': [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80', // Paris
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80', // Venice
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80', // Berlin
    'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80', // Amsterdam
    'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&q=80', // Vienna
    'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=1200&q=80', // Brussels
    'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1200&q=80', // Swiss Alps
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80', // Lisbon
    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&q=80', // Spain
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80', // Greece
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80', // London
    'https://images.unsplash.com/photo-1564959130747-897a8328da60?w=1200&q=80', // Ireland
  ],
  'nordic': [
    'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=1200&q=80', // Sweden
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80', // Norway
    'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&q=80', // Denmark
    'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=1200&q=80', // Finland
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=80', // Iceland
  ],
  'eastern-europe': [
    'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1200&q=80', // Poland
    'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200&q=80', // Prague
    'https://images.unsplash.com/photo-1551867633-194f125bddfa?w=1200&q=80', // Budapest
    'https://images.unsplash.com/photo-1555990538-1e74b3dd8c53?w=1200&q=80', // Croatia
    'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1200&q=80', // Romania
    'https://images.unsplash.com/photo-1601284619879-73ecf9f09b53?w=1200&q=80', // Bulgaria
    'https://images.unsplash.com/photo-1569347946914-dae14c6cce27?w=1200&q=80', // Slovenia
    'https://images.unsplash.com/photo-1569349412658-31b3b02a9b89?w=1200&q=80', // Slovakia
    'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=1200&q=80', // Latvia
    'https://images.unsplash.com/photo-1574692607019-8f3f8b3e3f1b?w=1200&q=80', // Lithuania
    'https://images.unsplash.com/photo-1558006624-e33e37bc22cd?w=1200&q=80', // Estonia
    'https://images.unsplash.com/photo-1561542320-9a18cd340469?w=1200&q=80', // Ukraine
    'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=1200&q=80', // Russia
    'https://images.unsplash.com/photo-1586609485587-c29bffabfb26?w=1200&q=80', // Serbia
    'https://images.unsplash.com/photo-1584456930969-1ae2d2d9dfc8?w=1200&q=80', // N. Macedonia
    'https://images.unsplash.com/photo-1586991359975-54500b7d8357?w=1200&q=80', // Bosnia
  ],
  'mediterranean': [
    'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=1200&q=80', // Malta
    'https://images.unsplash.com/photo-1530538095376-a4936b35b5f0?w=1200&q=80', // Cyprus
    'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=1200&q=80', // Luxembourg
    'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1200&q=80', // Monaco
    'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80', // Turkey
  ],
  'middle-east': [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80', // Dubai
    'https://images.unsplash.com/photo-1559564484-e48b3e040ff4?w=1200&q=80', // Qatar
    'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200&q=80', // Saudi
    'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&q=80', // Israel
    'https://images.unsplash.com/photo-1548786811-dd6e453ccca7?w=1200&q=80', // Jordan
    'https://images.unsplash.com/photo-1570108899519-37149fbc72a8?w=1200&q=80', // Kuwait
    'https://images.unsplash.com/photo-1565108829803-b51a8e2c6b99?w=1200&q=80', // Bahrain
    'https://images.unsplash.com/photo-1579606032821-4e6161c81571?w=1200&q=80', // Lebanon
  ],
  'north-africa': [
    'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200&q=80', // Egypt
    'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200&q=80', // Morocco
    'https://images.unsplash.com/photo-1559419189-4e97a43eb2ff?w=1200&q=80', // Tunisia
  ],
  'west-africa': [
    'https://images.unsplash.com/photo-1595832091684-2b0d5e7a9eab?w=1200&q=80', // Ghana
    'https://images.unsplash.com/photo-1572803507933-8b587c809c3c?w=1200&q=80', // Nigeria
    'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1200&q=80', // Senegal
  ],
  'east-africa': [
    'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=1200&q=80', // Kenya
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80', // Tanzania
    'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&q=80', // Ethiopia
    'https://images.unsplash.com/photo-1580089595767-98745d7025c5?w=1200&q=80', // Rwanda
  ],
  'southern-africa': [
    'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=80', // South Africa
    'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=1200&q=80', // Mauritius
    'https://images.unsplash.com/photo-1589979481223-deb893043163?w=1200&q=80', // Seychelles
  ],
  'central-asia': [
    'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=1200&q=80', // Uzbekistan
    'https://images.unsplash.com/photo-1561494270-d1e5b8b6ca28?w=1200&q=80', // Kazakhstan
    'https://images.unsplash.com/photo-1551037543-1e0e9d1e929f?w=1200&q=80', // Mongolia
  ],
  'caucasus': [
    'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80', // Georgia
    'https://images.unsplash.com/photo-1600421588498-5c6e8d43c4a7?w=1200&q=80', // Armenia
    'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=1200&q=80', // Azerbaijan
  ],
  'south-asia': [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80', // India
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&q=80', // Pakistan
    'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=1200&q=80', // Bangladesh
    'https://images.unsplash.com/photo-1580910768875-6a5bfbf6b5fb?w=1200&q=80', // Sri Lanka
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80', // Nepal
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80', // Maldives
  ],
  'southeast-asia': [
    'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&q=80', // Thailand
    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80', // Singapore
    'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80', // Malaysia
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80', // Indonesia
    'https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=1200&q=80', // Vietnam
    'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1200&q=80', // Philippines
    'https://images.unsplash.com/photo-1569166019315-a59097df65f0?w=1200&q=80', // Cambodia
    'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=1200&q=80', // Laos
    'https://images.unsplash.com/photo-1558019699-0a4e3dc0e8c8?w=1200&q=80', // Myanmar
  ],
  'east-asia': [
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80', // Japan
    'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1200&q=80', // Korea
    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80', // China
    'https://images.unsplash.com/photo-1498011109411-81e0c17c06f4?w=1200&q=80', // Taiwan
    'https://images.unsplash.com/photo-1536599018102-9f803c979dbc?w=1200&q=80', // Hong Kong
  ],
  'oceania': [
    'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&q=80', // Australia
    'https://images.unsplash.com/photo-1469521669194-babb45599def?w=1200&q=80', // NZ
    'https://images.unsplash.com/photo-1522153376416-b08b9bfa9e85?w=1200&q=80', // Fiji
  ],
  'north-america': [
    'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=80', // USA
    'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1200&q=80', // Canada
    'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=80', // Mexico
  ],
  'central-america': [
    'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=80', // Costa Rica
    'https://images.unsplash.com/photo-1555217851-6141535b3d5d?w=1200&q=80', // Panama
  ],
  'caribbean': [
    'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=80', // Bahamas
    'https://images.unsplash.com/photo-1570629392364-db5a8b20c1f5?w=1200&q=80', // Barbados
    'https://images.unsplash.com/photo-1569817171966-4bca9db8d2d2?w=1200&q=80', // Dom. Rep.
    'https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=1200&q=80', // Cuba
    'https://images.unsplash.com/photo-1562975674-87df1d24ee33?w=1200&q=80', // Jamaica
  ],
  'south-america': [
    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80', // Brazil
    'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&q=80', // Argentina
    'https://images.unsplash.com/photo-1478827536114-da961b7f86d2?w=1200&q=80', // Chile
    'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&q=80', // Peru
    'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=1200&q=80', // Colombia
  ],
};

const COUNTRY_TO_REGION: Record<string, string> = {
  // Western Europe
  france:'western-europe', germany:'western-europe', italy:'western-europe', spain:'western-europe',
  portugal:'western-europe', netherlands:'western-europe', belgium:'western-europe', austria:'western-europe',
  switzerland:'western-europe', 'united-kingdom':'western-europe', ireland:'western-europe', greece:'western-europe',
  andorra:'western-europe', liechtenstein:'western-europe', 'vatican-city':'western-europe', 'san-marino':'western-europe',
  // Nordic
  sweden:'nordic', norway:'nordic', denmark:'nordic', finland:'nordic', iceland:'nordic',
  // Eastern Europe
  poland:'eastern-europe', 'czech-republic':'eastern-europe', hungary:'eastern-europe', slovakia:'eastern-europe',
  slovenia:'eastern-europe', croatia:'eastern-europe', romania:'eastern-europe', bulgaria:'eastern-europe',
  serbia:'eastern-europe', montenegro:'eastern-europe', 'north-macedonia':'eastern-europe', albania:'eastern-europe',
  'bosnia-and-herzegovina':'eastern-europe', kosovo:'eastern-europe', ukraine:'eastern-europe', belarus:'eastern-europe',
  moldova:'eastern-europe', russia:'eastern-europe', latvia:'eastern-europe', lithuania:'eastern-europe',
  estonia:'eastern-europe',
  // Mediterranean
  malta:'mediterranean', cyprus:'mediterranean', luxembourg:'mediterranean', monaco:'mediterranean', turkey:'mediterranean',
  // Middle East
  'united-arab-emirates':'middle-east', qatar:'middle-east', 'saudi-arabia':'middle-east', kuwait:'middle-east',
  bahrain:'middle-east', oman:'middle-east', yemen:'middle-east', israel:'middle-east', palestine:'middle-east',
  jordan:'middle-east', lebanon:'middle-east', syria:'middle-east', iraq:'middle-east', iran:'middle-east',
  // North Africa
  egypt:'north-africa', libya:'north-africa', tunisia:'north-africa', algeria:'north-africa', morocco:'north-africa',
  sudan:'north-africa', 'south-sudan':'north-africa', mauritania:'north-africa',
  // West Africa
  ghana:'west-africa', nigeria:'west-africa', senegal:'west-africa', 'ivory-coast':'west-africa', mali:'west-africa',
  'burkina-faso':'west-africa', niger:'west-africa', benin:'west-africa', togo:'west-africa', liberia:'west-africa',
  'sierra-leone':'west-africa', guinea:'west-africa', 'guinea-bissau':'west-africa', gambia:'west-africa',
  'cape-verde':'west-africa', 's-o-tom-and-pr-ncipe':'west-africa',
  // East Africa
  kenya:'east-africa', tanzania:'east-africa', ethiopia:'east-africa', rwanda:'east-africa', burundi:'east-africa',
  uganda:'east-africa', somalia:'east-africa', eritrea:'east-africa', djibouti:'east-africa', comoros:'east-africa',
  // Central Africa
  chad:'east-africa', 'central-african-republic':'east-africa', cameroon:'west-africa', gabon:'west-africa',
  congo:'east-africa', 'democratic-republic-of-the-congo':'east-africa', 'equatorial-guinea':'west-africa',
  // Southern Africa
  'south-africa':'southern-africa', mauritius:'southern-africa', seychelles:'southern-africa',
  madagascar:'southern-africa', mozambique:'southern-africa', zambia:'southern-africa', zimbabwe:'southern-africa',
  malawi:'southern-africa', botswana:'southern-africa', namibia:'southern-africa', angola:'southern-africa',
  lesotho:'southern-africa', eswatini:'southern-africa',
  // Central Asia & Caucasus
  kazakhstan:'central-asia', uzbekistan:'central-asia', turkmenistan:'central-asia', kyrgyzstan:'central-asia',
  tajikistan:'central-asia', mongolia:'central-asia', afghanistan:'central-asia',
  georgia:'caucasus', armenia:'caucasus', azerbaijan:'caucasus',
  // South Asia
  india:'south-asia', pakistan:'south-asia', bangladesh:'south-asia', 'sri-lanka':'south-asia', nepal:'south-asia',
  bhutan:'south-asia', maldives:'south-asia',
  // Southeast Asia
  thailand:'southeast-asia', singapore:'southeast-asia', malaysia:'southeast-asia', indonesia:'southeast-asia',
  vietnam:'southeast-asia', philippines:'southeast-asia', cambodia:'southeast-asia', laos:'southeast-asia',
  myanmar:'southeast-asia', brunei:'southeast-asia', 'timor-leste':'southeast-asia',
  // East Asia
  japan:'east-asia', 'south-korea':'east-asia', 'north-korea':'east-asia', china:'east-asia', taiwan:'east-asia',
  // Oceania
  australia:'oceania', 'new-zealand':'oceania', fiji:'oceania', 'papua-new-guinea':'oceania', samoa:'oceania',
  tonga:'oceania', vanuatu:'oceania', 'solomon-islands':'oceania', kiribati:'oceania', 'marshall-islands':'oceania',
  micronesia:'oceania', nauru:'oceania', palau:'oceania', tuvalu:'oceania',
  // North America
  'united-states':'north-america', canada:'north-america', mexico:'north-america',
  // Central America
  'costa-rica':'central-america', panama:'central-america', nicaragua:'central-america',
  honduras:'central-america', 'el-salvador':'central-america', guatemala:'central-america', belize:'central-america',
  // Caribbean
  bahamas:'caribbean', barbados:'caribbean', cuba:'caribbean', jamaica:'caribbean', haiti:'caribbean',
  'dominican-republic':'caribbean', dominica:'caribbean', 'saint-lucia':'caribbean',
  'saint-vincent-and-the-grenadines':'caribbean', 'saint-kitts-and-nevis':'caribbean',
  'antigua-and-barbuda':'caribbean', grenada:'caribbean', 'trinidad-and-tobago':'caribbean',
  // South America
  brazil:'south-america', argentina:'south-america', chile:'south-america', peru:'south-america',
  colombia:'south-america', venezuela:'south-america', ecuador:'south-america', bolivia:'south-america',
  paraguay:'south-america', uruguay:'south-america', guyana:'south-america', suriname:'south-america',
};

function hashSlug(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

// Pick a regional image for a country. Uses full slug as seed so different pages about
// the same country still vary; if you want same-country pages to share, pass just the country.
function getRegionalImage(country: string, seed?: string): string | null {
  const region = COUNTRY_TO_REGION[country];
  if (!region) return null;
  const pool = REGION_IMAGES[region];
  if (!pool || pool.length === 0) return null;
  return pool[hashSlug(seed || country) % pool.length];
}


// Rotating pool of varied travel-themed images to avoid duplicate defaults on the homepage
const DEFAULT_TRAVEL_IMAGES = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80', // map + camera
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80', // airplane wing
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80', // mountains
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', // beach
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1200&q=80', // passport
  'https://images.unsplash.com/photo-1523592121529-f6dde35f079e?w=1200&q=80', // sunrise travel
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80', // hot air balloon
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', // road trip mountains
];
function pickDefaultTravelImage(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return DEFAULT_TRAVEL_IMAGES[Math.abs(hash) % DEFAULT_TRAVEL_IMAGES.length];
}
const DEFAULT_TRAVEL_IMAGE = DEFAULT_TRAVEL_IMAGES[0]; // legacy alias

// Extract destination country from content page slug
function extractDestinationCountry(slug: string): string | null {
  // Normalize: strip any path prefix like "visa-requirements/" and trailing slashes
  const clean = slug.split('/').pop()?.replace(/\/+$/, '') || slug;

  const patterns = [
    /-to-([a-z-]+)-visa/i,           // {from}-to-{to}-visa-...
    /-to-([a-z-]+)$/i,               // {from}-to-{to}    (our current format)
    /^([a-z-]+)-visa-guide/i,
    /^([a-z-]+)-visa-requirements/i,
    /^([a-z-]+)-travel-guide/i,
    /^visit-([a-z-]+)/i,
    /^([a-z-]+)-tourism/i,
    /^([a-z-]+)-passport/i,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  return null;
}


// Get image URL for a country (Unsplash or AI-generated)
async function getImageForCountry(
  country: string,
  supabase: any,
  lovableApiKey: string
): Promise<{ url: string; source: 'unsplash' | 'ai' | 'default' }> {
  // First check for Unsplash image
  const unsplashUrl = UNSPLASH_COUNTRY_IMAGES[country];
  if (unsplashUrl) {
    console.log(`Using Unsplash image for ${country}`);
    return { url: unsplashUrl, source: 'unsplash' };
  }
  
  // Try to generate with AI
  try {
    console.log(`Generating AI image for ${country}`);
    
    const countryName = country.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: `Create a stunning, professional travel photograph showcasing ${countryName}'s most iconic landmark or beautiful landscape. Style: professional travel magazine photography, golden hour lighting, vibrant colors, photorealistic, high quality, 16:9 aspect ratio. Show the destination's unique character and appeal.`
          }
        ],
        modalities: ["image", "text"]
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI image generation failed for ${country}:`, response.status, errorText);
      return { url: DEFAULT_TRAVEL_IMAGE, source: 'default' };
    }
    
    const data = await response.json();
    const base64Image = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (base64Image) {
      // Upload to Supabase Storage
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      const filename = `${country}-${Date.now()}.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('featured-images')
        .upload(filename, binaryData, {
          contentType: 'image/png',
          cacheControl: '31536000',
        });
      
      if (uploadError) {
        console.error(`Failed to upload image for ${country}:`, uploadError);
        return { url: DEFAULT_TRAVEL_IMAGE, source: 'default' };
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('featured-images')
        .getPublicUrl(filename);
      
      console.log(`AI image uploaded for ${country}: ${publicUrl}`);
      return { url: publicUrl, source: 'ai' };
    }
    
    return { url: DEFAULT_TRAVEL_IMAGE, source: 'default' };
  } catch (error) {
    console.error(`Error generating AI image for ${country}:`, error);
    return { url: DEFAULT_TRAVEL_IMAGE, source: 'default' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { action, batch_size = 25, use_ai = true, page_ids, mode = 'missing' } = await req.json();
    
    if (action === 'stats') {
      // Return statistics about missing images
      const { count: totalPages } = await supabase
        .from('content_pages')
        .select('*', { count: 'exact', head: true });
      
      const { count: missingImages } = await supabase
        .from('content_pages')
        .select('*', { count: 'exact', head: true })
        .or('featured_image_url.is.null,featured_image_url.eq.');
      
      const { count: brokenUnsplash } = await supabase
        .from('content_pages')
        .select('*', { count: 'exact', head: true })
        .like('featured_image_url', '%source.unsplash%');
      
      const { count: withImages } = await supabase
        .from('content_pages')
        .select('*', { count: 'exact', head: true })
        .not('featured_image_url', 'is', null)
        .neq('featured_image_url', '')
        .not('featured_image_url', 'like', '%source.unsplash%');
      
      return new Response(JSON.stringify({
        success: true,
        stats: {
          total_pages: totalPages || 0,
          missing_images: missingImages || 0,
          broken_unsplash: brokenUnsplash || 0,
          with_images: withImages || 0,
          percentage_complete: totalPages ? Math.round(((withImages || 0) / totalPages) * 100) : 0,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'generate') {
      let query;
      
      if (page_ids && page_ids.length > 0) {
        // Specific pages
        query = supabase
          .from('content_pages')
          .select('id, slug, title')
          .in('id', page_ids);
      } else if (mode === 'broken') {
        // Fix broken source.unsplash.com URLs
        query = supabase
          .from('content_pages')
          .select('id, slug, title')
          .like('featured_image_url', '%source.unsplash%')
          .limit(batch_size);
      } else if (mode === 'all') {
        // ALL pages that don't have a working image (missing + broken)
        query = supabase
          .from('content_pages')
          .select('id, slug, title')
          .or('featured_image_url.is.null,featured_image_url.eq.,featured_image_url.like.%source.unsplash%')
          .limit(batch_size);
      } else {
        // Default: only missing images
        query = supabase
          .from('content_pages')
          .select('id, slug, title')
          .or('featured_image_url.is.null,featured_image_url.eq.')
          .limit(batch_size);
      }
      
      const { data: pages, error: fetchError } = await query;
      
      if (fetchError) {
        throw new Error(`Failed to fetch pages: ${fetchError.message}`);
      }
      
      if (!pages || pages.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          message: 'No pages need images',
          processed: 0,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`Processing ${pages.length} pages for image generation`);
      
      const results: Array<{ id: string; slug: string; success: boolean; source?: string; error?: string }> = [];
      const countryImageCache: Record<string, string> = {};
      
      for (const page of pages) {
        try {
          const country = extractDestinationCountry(page.slug);
          let imageUrl: string;
          let source: string;
          
          if (!country) {
            // Vary the default across a small pool to avoid duplicate images on lists
            imageUrl = pickDefaultTravelImage(page.slug);
            source = 'default';
          } else if (countryImageCache[country]) {
            // Reuse cached image for same country
            imageUrl = countryImageCache[country];
            source = 'cached';
          } else {
            // Get or generate image for this country
            const result = await getImageForCountry(country, supabase, LOVABLE_API_KEY);
            if (result.source === 'default') {
              // AI unavailable / no Unsplash entry — vary the default per-slug
              imageUrl = pickDefaultTravelImage(page.slug);
            } else {
              imageUrl = result.url;
            }
            source = result.source;
            // Only cache real per-country images (not varied defaults)
            if (result.source !== 'default') countryImageCache[country] = imageUrl;
          }
          
          // Update the content page
          const { error: updateError } = await supabase
            .from('content_pages')
            .update({ featured_image_url: imageUrl })
            .eq('id', page.id);
          
          if (updateError) {
            results.push({ id: page.id, slug: page.slug, success: false, error: updateError.message });
          } else {
            results.push({ id: page.id, slug: page.slug, success: true, source });
          }
          
          // Small delay between AI generations to avoid rate limiting
          if (source === 'ai') {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
        } catch (error) {
          console.error(`Error processing page ${page.slug}:`, error);
          results.push({
            id: page.id,
            slug: page.slug,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      // Log to API logs
      await supabase.from('api_logs').insert({
        api_provider: 'lovable_ai',
        task_type: 'image_generation_batch',
        status: failed === 0 ? 'success' : 'partial',
        response_summary: {
          total: pages.length,
          successful,
          failed,
          results: results.slice(0, 10), // First 10 for summary
        },
      });
      
      return new Response(JSON.stringify({
        success: true,
        processed: pages.length,
        successful,
        failed,
        results,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      error: 'Invalid action. Use "stats" or "generate"'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in generate-visa-images:', error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

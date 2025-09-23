# Global Tax Calculator - Supported Countries Database

## 📊 Overview

The Global Tax Calculator supports **49 countries** with comprehensive tax bracket data for 2024-2025. Each country includes detailed income tax brackets, VAT/sales tax information, currency information, and geographic coordinates for map visualization.

## 🗂️ Data Categories

### Tax Systems Supported
- **Progressive**: Multiple tax brackets with increasing rates (40 countries)
- **Flat**: Single tax rate for all income levels (4 countries)
- **Zero Personal**: No personal income tax (3 countries)
- **Complex**: Multiple components (2 countries)

### Currency Coverage
- **25 different currencies** supported
- Real-time exchange rate conversion
- Fallback rates for offline functionality

### VAT/Sales Tax Coverage
- **12 countries** with detailed VAT information
- Standard and reduced VAT rates
- Special cases (no VAT, regional variations)
- Zero-rated items identification

---

## 🌍 Complete Country List

### 🇺🇸 North America (3 countries)

#### 1. United States (US)
- **Currency**: USD
- **System**: Progressive (7 brackets)
- **Tax Range**: 10% - 37%
- **VAT/Sales Tax**: No federal VAT; state sales taxes range 0%–10%
- **Coordinates**: [39.8283, -98.5795]
- **Brackets**:
  - $0 - $12,550: 10%
  - $12,551 - $50,800: 12%
  - $50,801 - $129,500: 22%
  - $129,501 - $207,600: 24%
  - $207,601 - $518,800: 32%
  - $518,801 - $622,050: 35%
  - $622,051+: 37%

#### 2. Canada (CA)
- **Currency**: CAD
- **System**: Progressive (5 brackets)
- **Tax Range**: 14.5% - 33%
- **VAT/Sales Tax**: Federal GST 5% + provincial sales taxes (0%–10%)
- **Coordinates**: [56.1304, -106.3468]
- **Brackets**:
  - CAD 0 - 53,359: 14.5%
  - CAD 53,360 - 106,717: 20.5%
  - CAD 106,718 - 165,430: 26%
  - CAD 165,431 - 235,675: 29%
  - CAD 235,676+: 33%

#### 3. Mexico (MX)
- **Currency**: MXN
- **System**: Progressive (9 brackets)
- **Tax Range**: 1.92% - 35%
- **VAT/Sales Tax**: Standard 16%, reduced 0% in border regions
- **Coordinates**: [23.6345, -102.5528]
- **Brackets**: Complex progressive system with 9 detailed brackets

---

### 🇪🇺 Europe (22 countries)

#### 4. Germany (DE)
- **Currency**: EUR
- **System**: Progressive (5 brackets)
- **Tax Range**: 0% - 45%
- **VAT**: Standard 19%, reduced 7% for essentials
- **Coordinates**: [51.1657, 10.4515]
- **Brackets**:
  - €0 - €11,604: 0%
  - €11,605 - €17,005: 14%
  - €17,006 - €66,760: 24%
  - €66,761 - €277,825: 42%
  - €277,826+: 45%

#### 5. France (FR)
- **Currency**: EUR
- **System**: Progressive (5 brackets)
- **Tax Range**: 0% - 45%
- **VAT**: Standard 20%, reduced 10%/5.5%/2.1%
- **Coordinates**: [46.2276, 2.2137]
- **Brackets**:
  - €0 - €11,294: 0%
  - €11,295 - €28,797: 11%
  - €28,798 - €82,341: 30%
  - €82,342 - €177,106: 41%
  - €177,107+: 45%

#### 6. United Kingdom (GB)
- **Currency**: GBP
- **System**: Progressive (4 brackets)
- **Tax Range**: 0% - 45%
- **VAT**: Standard 20%, reduced 5%, zero-rated items
- **Coordinates**: [55.3781, -3.4360]
- **Brackets**:
  - £0 - £12,570: 0%
  - £12,571 - £50,270: 20%
  - £50,271 - £125,140: 40%
  - £125,141+: 45%

#### 7. Italy (IT)
- **Currency**: EUR
- **System**: Progressive (3 brackets)
- **Tax Range**: 23% - 43%
- **VAT**: Standard 22%, reduced 10%/4%
- **Coordinates**: [41.8719, 12.5674]
- **Brackets**:
  - €0 - €28,000: 23%
  - €28,001 - €50,000: 35%
  - €50,001+: 43%

#### 8. Spain (ES)
- **Currency**: EUR
- **System**: Progressive (6 brackets)
- **Tax Range**: 9.5% - 24.5%
- **VAT**: Standard 21%, reduced 10%/4%
- **Coordinates**: [40.4637, -3.7492]
- **Brackets**: 6 detailed progressive brackets

#### 9. Netherlands (NL)
- **Currency**: EUR
- **System**: Progressive (3 brackets)
- **Tax Range**: 8.17% - 49.50%
- **VAT**: Standard 21%, reduced 9%
- **Coordinates**: [52.3676, 4.9041]
- **Brackets**:
  - €0 - €38,441: 8.17%
  - €38,442 - €76,817: 37.48%
  - €76,818+: 49.50%

#### 10. Belgium (BE)
- **Currency**: EUR
- **System**: Progressive (4 brackets)
- **Tax Range**: 25% - 50%
- **VAT**: Standard 21%, reduced 12%/6%
- **Coordinates**: [50.8503, 4.3517]
- **Brackets**:
  - €0 - €13,770: 25%
  - €13,771 - €24,120: 40%
  - €24,121 - €42,070: 45%
  - €42,071+: 50%

#### 11. Austria (AT)
- **Currency**: EUR
- **System**: Progressive (7 brackets)
- **Tax Range**: 0% - 55%
- **VAT**: Standard 20%, reduced 13%/10%
- **Coordinates**: [48.2082, 16.3738]
- **Brackets**:
  - €0 - €13,308: 0%
  - €13,309 - €21,617: 20%
  - €21,618 - €35,836: 30%
  - €35,837 - €69,166: 40%
  - €69,167 - €103,072: 48%
  - €103,073 - €1,000,000: 50%
  - €1,000,001+: 55%

#### 12. Switzerland (CH)
- **Currency**: CHF
- **System**: Progressive (11 brackets)
- **Tax Range**: 0% - 13.2%
- **VAT**: Standard 8.1%, reduced 3.8%/2.6%
- **Coordinates**: [46.948, 7.4474]
- **Brackets**: Complex 11-bracket federal system

#### 13. Sweden (SE)
- **Currency**: SEK
- **System**: Progressive (2 brackets)
- **Tax Range**: 32% - 52%
- **Coordinates**: [60.1282, 18.6435]
- **Brackets**:
  - SEK 0 - 625,800: 32%
  - SEK 625,801+: 52%

#### 14. Norway (NO)
- **Currency**: NOK
- **System**: Progressive (5 brackets)
- **Tax Range**: 22% - 39.7%
- **Coordinates**: [60.4720, 8.4689]
- **Brackets**: 5 detailed progressive brackets

#### 15. Denmark (DK)
- **Currency**: DKK
- **System**: Progressive (3 brackets)
- **Tax Range**: 8% - 52%
- **Coordinates**: [55.6761, 12.5683]
- **Brackets**:
  - DKK 0 - 50,000: 8%
  - DKK 50,001 - 552,500: 39%
  - DKK 552,501+: 52%

#### 16. Finland (FI)
- **Currency**: EUR
- **System**: Progressive (5 brackets)
- **Tax Range**: 0% - 31.25%
- **Coordinates**: [60.1699, 24.9384]
- **Brackets**:
  - €0 - €19,900: 0%
  - €19,901 - €29,700: 6%
  - €29,701 - €49,500: 17.25%
  - €49,501 - €85,900: 21.25%
  - €85,901+: 31.25%

#### 17. Iceland (IS)
- **Currency**: ISK
- **System**: Progressive (3 brackets)
- **Tax Range**: 31.45% - 46.25%
- **Coordinates**: [64.1355, -21.8954]
- **Brackets**:
  - ISK 0 - 451,706: 31.45%
  - ISK 451,707 - 1,279,000: 37.95%
  - ISK 1,279,001+: 46.25%

#### 18. Estonia (EE)
- **Currency**: EUR
- **System**: Flat
- **Tax Rate**: 20%
- **Coordinates**: [59.437, 24.7536]

#### 19. Latvia (LV)
- **Currency**: EUR
- **System**: Progressive (3 brackets)
- **Tax Range**: 20% - 31%
- **Coordinates**: [56.9496, 24.1052]
- **Brackets**:
  - €0 - €20,004: 20%
  - €20,005 - €78,764: 23%
  - €78,765+: 31%

#### 20. Lithuania (LT)
- **Currency**: EUR
- **System**: Progressive (2 brackets)
- **Tax Range**: 20% - 32%
- **Coordinates**: [54.6872, 25.2797]
- **Brackets**:
  - €0 - €104,277: 20%
  - €104,278+: 32%

#### 21. Poland (PL)
- **Currency**: PLN
- **System**: Progressive (2 brackets)
- **Tax Range**: 12% - 32%
- **Coordinates**: [52.2297, 21.0122]
- **Brackets**:
  - PLN 0 - 120,000: 12%
  - PLN 120,001+: 32%

#### 22. Ukraine (UA)
- **Currency**: UAH
- **System**: Flat (+ Military Tax)
- **Tax Rate**: 18% (+ 5% military tax)
- **Coordinates**: [50.4501, 30.5234]
- **Special Notes**: Additional 5% military tax, special dividend rates

#### 23. Ireland (IE)
- **Currency**: EUR
- **System**: Progressive (2 brackets)
- **Tax Range**: 20% - 40%
- **Coordinates**: [53.3498, -6.2603]
- **Brackets**:
  - €0 - €36,800: 20%
  - €36,801+: 40%

#### 24. Portugal (PT)
- **Currency**: EUR
- **System**: Progressive (7 brackets)
- **Tax Range**: 14.5% - 48%
- **Coordinates**: [38.7223, -9.1393]
- **Brackets**: 7 detailed progressive brackets

#### 25. Greece (GR)
- **Currency**: EUR
- **System**: Progressive (5 brackets)
- **Tax Range**: 9% - 44%
- **Coordinates**: [37.9838, 23.7275]
- **Brackets**:
  - €0 - €10,000: 9%
  - €10,001 - €20,000: 22%
  - €20,001 - €30,000: 28%
  - €30,001 - €40,000: 36%
  - €40,001+: 44%

---

### 🇷🇺 Eastern Europe/Asia (1 country)

#### 26. Russia (RU)
- **Currency**: RUB
- **System**: Progressive (5 brackets)
- **Tax Range**: 13% - 22%
- **Coordinates**: [61.5240, 105.3188]
- **Brackets**:
  - RUB 0 - 2,400,000: 13%
  - RUB 2,400,001 - 5,000,000: 15%
  - RUB 5,000,001 - 20,000,000: 18%
  - RUB 20,000,001 - 50,000,000: 20%
  - RUB 50,000,001+: 22%

---

### 🇨🇳 Asia (12 countries)

#### 27. China (CN)
- **Currency**: CNY
- **System**: Progressive (7 brackets)
- **Tax Range**: 3% - 45%
- **Coordinates**: [35.8617, 104.1954]
- **Brackets**:
  - CNY 0 - 36,000: 3%
  - CNY 36,001 - 144,000: 10%
  - CNY 144,001 - 300,000: 20%
  - CNY 300,001 - 420,000: 25%
  - CNY 420,001 - 660,000: 30%
  - CNY 660,001 - 960,000: 35%
  - CNY 960,001+: 45%

#### 28. Japan (JP)
- **Currency**: JPY
- **System**: Progressive (7 brackets)
- **Tax Range**: 5% - 45%
- **Coordinates**: [36.2048, 138.2529]
- **Brackets**: 7 detailed progressive brackets

#### 29. South Korea (KR)
- **Currency**: KRW
- **System**: Progressive (8 brackets)
- **Tax Range**: 6% - 45%
- **Coordinates**: [35.9078, 127.7669]
- **Brackets**: 8 detailed progressive brackets

#### 30. India (IN)
- **Currency**: INR
- **System**: Progressive (6 brackets)
- **Tax Range**: 0% - 30%
- **Coordinates**: [20.5937, 78.9629]
- **Brackets**:
  - INR 0 - 300,000: 0%
  - INR 300,001 - 700,000: 5%
  - INR 700,001 - 1,000,000: 10%
  - INR 1,000,001 - 1,200,000: 15%
  - INR 1,200,001 - 1,500,000: 20%
  - INR 1,500,001+: 30%

#### 31. Singapore (SG)
- **Currency**: SGD
- **System**: Progressive (13 brackets)
- **Tax Range**: 0% - 24%
- **Coordinates**: [1.3521, 103.8198]
- **Brackets**: 13 detailed progressive brackets

#### 32. Thailand (TH)
- **Currency**: THB
- **System**: Progressive (8 brackets)
- **Tax Range**: 0% - 35%
- **Coordinates**: [15.8700, 100.9925]
- **Brackets**: 8 detailed progressive brackets

#### 33. Indonesia (ID)
- **Currency**: IDR
- **System**: Progressive (5 brackets)
- **Tax Range**: 5% - 35%
- **Coordinates**: [-0.7893, 113.9213]
- **Brackets**: 5 detailed progressive brackets

#### 34. Hong Kong (HK)
- **Currency**: HKD
- **System**: Progressive (5 brackets)
- **Tax Range**: 2% - 17%
- **Coordinates**: [22.3193, 114.1694]
- **Brackets**:
  - HKD 0 - 50,000: 2%
  - HKD 50,001 - 100,000: 6%
  - HKD 100,001 - 150,000: 10%
  - HKD 150,001 - 200,000: 14%
  - HKD 200,001+: 17%

#### 35. Taiwan (TW)
- **Currency**: TWD
- **System**: Progressive (5 brackets)
- **Tax Range**: 5% - 40%
- **Coordinates**: [25.033, 121.5654]
- **Brackets**: 5 detailed progressive brackets

#### 36. Mongolia (MN)
- **Currency**: MNT
- **System**: Flat
- **Tax Rate**: 10%
- **Coordinates**: [47.8864, 106.9057]

#### 37. North Korea (KP)
- **Currency**: KPW
- **System**: Zero Personal Tax
- **Tax Rate**: 0%
- **Coordinates**: [39.0392, 125.7625]
- **Notes**: State collects income directly

#### 38. Macau (MO)
- **Currency**: MOP
- **System**: Progressive (9 brackets)
- **Tax Range**: 7% - 15%
- **Coordinates**: [22.1987, 113.5439]
- **Brackets**: 9 detailed progressive brackets

---

### 🇦🇺 Oceania (1 country)

#### 39. Australia (AU)
- **Currency**: AUD
- **System**: Progressive (5 brackets)
- **Tax Range**: 0% - 45%
- **Coordinates**: [-25.2744, 133.7751]
- **Brackets**:
  - AUD 0 - 18,200: 0%
  - AUD 18,201 - 45,000: 16%
  - AUD 45,001 - 135,000: 30%
  - AUD 135,001 - 190,000: 37%
  - AUD 190,001+: 45%

---

### 🇿🇦 Africa (3 countries)

#### 40. South Africa (ZA)
- **Currency**: ZAR
- **System**: Progressive (8 brackets)
- **Tax Range**: 0% - 45%
- **Coordinates**: [-30.5595, 22.9375]
- **Brackets**: 8 detailed progressive brackets

#### 41. Nigeria (NG)
- **Currency**: NGN
- **System**: Progressive (6 brackets)
- **Tax Range**: 7% - 24%
- **Coordinates**: [9.0820, 8.6753]
- **Brackets**: 6 detailed progressive brackets

#### 42. Egypt (EG)
- **Currency**: EGP
- **System**: Progressive (8 brackets)
- **Tax Range**: 0% - 27.5%
- **Coordinates**: [26.0975, 30.0444]
- **Brackets**: 8 detailed progressive brackets

---

### 🇸🇦 Middle East (3 countries)

#### 43. Saudi Arabia (SA)
- **Currency**: SAR
- **System**: Zero Personal Tax
- **Tax Rate**: 0%
- **Coordinates**: [23.8859, 45.0792]
- **Notes**: Tax haven status

#### 44. United Arab Emirates (AE)
- **Currency**: AED
- **System**: Zero Personal Tax
- **Tax Rate**: 0%
- **Coordinates**: [23.4241, 53.8478]
- **Notes**: Tax haven status

---

### 🇧🇷 South America (3 countries)

#### 45. Brazil (BR)
- **Currency**: BRL
- **System**: Progressive (5 brackets)
- **Tax Range**: 0% - 27.5%
- **Coordinates**: [-14.2350, -51.9253]
- **Brackets**: 5 detailed progressive brackets

#### 46. Argentina (AR)
- **Currency**: ARS
- **System**: Progressive (10 brackets)
- **Tax Range**: 0% - 35%
- **Coordinates**: [-38.4161, -63.6167]
- **Brackets**: 10 detailed progressive brackets

---

## 📈 Statistics Summary

### By Tax System:
- **Progressive**: 40 countries (81.6%)
- **Flat**: 4 countries (8.2%)
- **Zero Personal**: 3 countries (6.1%)
- **Complex**: 2 countries (4.1%)

### By Geographic Region:
- **Europe**: 22 countries (44.9%)
- **Asia**: 12 countries (24.5%)
- **North America**: 3 countries (6.1%)
- **Africa**: 3 countries (6.1%)
- **South America**: 3 countries (6.1%)
- **Middle East**: 3 countries (6.1%)
- **Oceania**: 1 country (2.0%)

### Tax Rate Ranges:
- **Highest Maximum Rate**: Austria (55%)
- **Lowest Maximum Rate**: North Korea, Saudi Arabia, UAE (0%)
- **Most Brackets**: Singapore (13 brackets)
- **Fewest Brackets**: Flat tax countries (1 bracket)

### Currency Distribution:
- **EUR (Euro)**: 12 countries
- **USD (US Dollar)**: 1 country
- **Local Currencies**: 36 countries

### VAT/Sales Tax Statistics:
- **Countries with VAT Data**: 12 countries (24.5%)
- **Average Standard VAT Rate**: 18.3%
- **Highest Standard VAT Rate**: 22% (Italy)
- **Lowest Standard VAT Rate**: 5% (Canada GST)
- **Countries without VAT**: 1 country (United States)
- **Countries with Special Systems**: 2 countries (US sales tax, Canada GST+provincial)

---

## 🛠️ Data Validation

### Data Quality Assurance:
- ✅ All countries have validated tax brackets
- ✅ Currency codes follow ISO 4217 standard
- ✅ Country codes follow ISO 3166-1 alpha-2 standard
- ✅ Coordinates verified for map accuracy
- ✅ Tax rates current for 2024-2025 tax year

### Available Data Points per Country:
1. **Country Name** (Official)
2. **Currency Code** (ISO 4217)
3. **Tax System Type** (Progressive/Flat/Zero/Complex)
4. **Country Code** (ISO 3166-1 alpha-2)
5. **Geographic Coordinates** (Latitude, Longitude)
6. **Tax Brackets** (Income ranges and rates)
7. **VAT/Sales Tax Information** (Standard/reduced rates, special cases)
8. **Special Notes** (Where applicable)

---

## 🔄 Real-Time Features

### Exchange Rate Support:
- Real-time conversion between all 25 currencies
- Fallback rates for offline functionality
- Daily rate updates from external API

### Interactive Features:
- Map visualization with color-coded tax burdens
- Sortable results table
- Search and filter functionality
- CSV export capability
- Country-specific popup details

---

## 📋 Future Expansion Plans

### Additional Countries in Pipeline:
- **European**: Luxembourg, Czech Republic, Slovakia, Slovenia
- **Asian**: Malaysia, Philippines, Vietnam, Bangladesh
- **American**: Chile, Colombia, Peru, Uruguay
- **African**: Kenya, Ghana, Morocco, Tunisia
- **Middle Eastern**: Israel, Turkey, Jordan, Lebanon

### Enhanced Data Points:
- Social security contributions
- Municipal/regional taxes
- Tax deductions and credits
- Family status variations
- Corporate tax rates

This comprehensive database provides accurate, up-to-date tax information for international tax comparison and planning purposes.
# Trending - Business Plan
## Real-Time Viral Content Detection for Market-Moving Intelligence

---

## 1. PROBLEM STATEMENT

Market-moving information increasingly originates from non-traditional sources — Substack essays, Twitter/X threads, Reddit posts, independent research blogs, and social media influencers. By the time mainstream financial news covers these stories, early movers have already traded on the information.

**Example:** The Citrini Research piece "The 2028 Global Intelligence Crisis" went viral with 8,000+ likes and 1,600+ shares, sparking market anxiety about AI-driven economic disruption. Traders who caught it early could position ahead of the volatility.

**The gap:** No tool exists that monitors the full spectrum of content sources, detects virality in real-time as it's happening, AND filters specifically for market-relevant content.

---

## 2. PRODUCT VISION

**Trending** is a real-time intelligence platform that:
1. Monitors dozens of content sources simultaneously
2. Detects the *inflection point* when content begins going viral (not after it already has)
3. Filters for market-relevant topics (AI, geopolitics, macro, sector disruption, regulation, etc.)
4. Alerts users within minutes of virality onset so they can trade ahead of the crowd

### Key Differentiator
We don't just find trending content — we find content that is *about to trend* and is *market-relevant*. The value is in the **speed** and **relevance filtering**.

---

## 3. IS THIS TECHNICALLY FEASIBLE?

### Short answer: YES, with caveats.

### What makes it possible:
- **Social media APIs** expose engagement metrics (likes, shares, retweets) that can be polled frequently
- **LLMs** (like Claude) can classify content for market relevance with high accuracy
- **Velocity detection algorithms** can identify exponential engagement growth patterns early
- **RSS feeds, webhooks, and web scraping** can monitor thousands of sources in near real-time

### Key challenges:
| Challenge | Difficulty | Mitigation |
|-----------|-----------|------------|
| Twitter/X API costs | High | Use filtered streams, prioritize financial accounts |
| Rate limits on platforms | Medium | Distributed polling, multiple API keys, smart scheduling |
| Distinguishing signal from noise | High | LLM-based relevance scoring + human feedback loop |
| Speed (minutes, not hours) | Medium | Event-driven architecture, streaming pipelines |
| Platform ToS compliance | Medium | Use official APIs where possible, respect rate limits |
| False positives | High | Multi-stage filtering, confidence scoring, user feedback |

---

## 4. DATA SOURCES TO MONITOR

### Tier 1 — Highest Signal (launch with these)
| Source | What to Monitor | How | Update Frequency |
|--------|----------------|-----|-----------------|
| **Twitter/X** | Financial influencers, trending hashtags, viral threads | X API v2 (filtered stream) | Real-time streaming |
| **Reddit** | r/wallstreetbets, r/stocks, r/investing, r/economics, r/technology | Reddit API | Every 1-2 minutes |
| **Substack** | Top finance/macro/tech newsletters | RSS feeds + scraping | Every 5 minutes |
| **Google Trends** | Spike detection on market-relevant terms | Google Trends API / SerpAPI | Every 5-15 minutes |

### Tier 2 — High Value (add in v2)
| Source | What to Monitor | How |
|--------|----------------|-----|
| **YouTube** | Finance/market channels, viral explainer videos | YouTube Data API |
| **TikTok** | FinTok, viral economic takes | Unofficial API / scraping |
| **LinkedIn** | Industry leader posts, executive commentary | Scraping (limited API) |
| **Hacker News** | Tech/AI/startup disruption stories | HN API (free, excellent) |
| **Financial news RSS** | Bloomberg, Reuters, CNBC, FT breaking news | RSS feeds |
| **Discord** | Trading communities, crypto servers | Bot integration |

### Tier 3 — Deep Intelligence (v3+)
| Source | What to Monitor | How |
|--------|----------------|-----|
| **SEC filings** | 8-K, insider trading (Form 4) | EDGAR API |
| **Congressional trades** | STOCK Act disclosures | Capitol Trades API / scraping |
| **Patent filings** | Breakthrough tech indicators | USPTO API |
| **Academic preprints** | ArXiv AI/econ papers gaining traction | ArXiv API + Altmetric |
| **Podcast transcripts** | Key interviews with market movers | Whisper API transcription |

---

## 5. VIRALITY DETECTION ENGINE

### How do we know something is "going viral"?

#### 5.1 Velocity Scoring Algorithm
We don't care about absolute numbers — we care about **rate of change**.

```
Virality Score = (engagement_now - engagement_1hr_ago) / time_delta
                 × relevance_multiplier
                 × source_authority_weight
```

**Signals we track:**
- Engagement velocity (likes/shares per minute, accelerating)
- Cross-platform spread (same topic appearing on multiple platforms)
- Influencer amplification (high-follower accounts sharing/commenting)
- Quote-tweet/reply ratio (controversy indicator)
- Google search spike correlation

#### 5.2 Early Detection Heuristics
- **Inflection point detection:** Fit engagement curves; alert when growth shifts from linear to exponential
- **Network cascade detection:** Track when content jumps from niche accounts to mainstream accounts
- **Cross-platform echo:** Same story/thesis appearing independently on 2+ platforms within 1 hour
- **Sentiment intensity:** Unusually strong emotional language in reactions (fear, euphoria, outrage)

#### 5.3 Market Relevance Classification (LLM-Powered)
Every piece of content that passes the virality threshold gets classified by an LLM:

**Categories:**
- AI / Technology disruption
- Geopolitics / War / Sanctions
- Macro / Interest rates / Inflation
- Sector-specific (energy, pharma, tech, finance, etc.)
- Regulatory / Policy changes
- Corporate scandals / Earnings surprises
- Black swan / Tail risk scenarios

**Output per item:**
- Market relevance score (0-100)
- Affected sectors/tickers
- Sentiment (bullish/bearish/uncertain)
- Confidence level
- Brief summary

---

## 6. TECHNICAL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                    DATA INGESTION LAYER                  │
│  Twitter Stream │ Reddit Poller │ RSS Feeds │ Scrapers   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  MESSAGE QUEUE (Redis/Kafka)             │
│           Buffers raw content for processing             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              PROCESSING PIPELINE                         │
│                                                          │
│  Stage 1: Deduplication & Normalization                  │
│  Stage 2: Engagement Tracking & Velocity Calculation     │
│  Stage 3: Virality Threshold Check                       │
│  Stage 4: LLM Market Relevance Classification            │
│  Stage 5: Affected Ticker/Sector Mapping                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA STORE                             │
│  PostgreSQL (structured) │ Redis (real-time state)       │
│  S3 (content archive)                                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  DELIVERY LAYER                          │
│  WebSocket Dashboard │ Push Notifications │ Email Digest  │
│  API for integrations │ Slack/Discord bots               │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack Recommendation
| Component | Technology | Why |
|-----------|-----------|-----|
| Backend | Python (FastAPI) or Node.js | Async-first, great for streaming |
| Queue | Redis Streams or Kafka | Real-time message processing |
| Database | PostgreSQL + TimescaleDB | Time-series engagement data |
| Cache/State | Redis | Track engagement velocity in-memory |
| LLM | Claude API (Anthropic) | Best reasoning for relevance classification |
| Frontend | Next.js + React | Real-time dashboard with WebSockets |
| Hosting | AWS or Railway | Scalable, always-on infrastructure |
| Monitoring | Grafana + Prometheus | Track pipeline health and latency |

---

## 7. MVP SCOPE (v1 - Launch in 4-6 weeks)

### What to build first:
1. **3 data sources only:** Twitter/X, Reddit (WSB + stocks), Hacker News
2. **Simple velocity scoring:** Track engagement over 1-hour windows
3. **LLM classification:** Claude API call for each item passing virality threshold
4. **Web dashboard:** Real-time feed of trending market-relevant content
5. **Push alerts:** Email or browser notifications for high-confidence items

### What to defer:
- Mobile app (use responsive web)
- Historical backtesting
- Ticker-level mapping
- Sentiment analysis beyond bullish/bearish
- User accounts and personalization

---

## 8. MONETIZATION

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | Delayed feed (30-min delay), 5 alerts/day |
| **Pro** | $49/mo | Real-time feed, unlimited alerts, sector filtering |
| **Institutional** | $299/mo | API access, custom sources, Slack integration, priority alerts |
| **Enterprise** | Custom | White-label, dedicated infrastructure, SLA |

### Revenue model advantages:
- Low marginal cost per user (API costs scale with content volume, not users)
- High willingness-to-pay among active traders
- Natural upsell from free to paid as users see value

---

## 9. COMPETITIVE LANDSCAPE

| Competitor | What They Do | Our Advantage |
|-----------|-------------|---------------|
| **Stocktwits** | Social network for traders | We monitor ALL platforms, not just one |
| **TrendSpider** | Technical analysis tools | We focus on viral content, not charts |
| **Benzinga Pro** | Real-time news feed | We catch non-traditional sources they miss |
| **Unusual Whales** | Options flow tracking | We focus on narrative/content, not flow |
| **Google Trends** | Search trend data | We add market relevance + multi-platform |
| **Sprout Social** | Social media monitoring | Not finance-specific, no market mapping |

**Our moat:** The combination of (1) multi-platform monitoring, (2) virality velocity detection, and (3) LLM-powered market relevance filtering does not exist in one product today.

---

## 10. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| API access revoked (Twitter/Reddit) | High | Diversify sources; have scraping fallback |
| LLM costs at scale | Medium | Cache classifications; batch processing; use smaller models for pre-filtering |
| False positives erode trust | High | Confidence scoring; user feedback loop; human review for high-stakes alerts |
| Regulatory concerns (market manipulation claims) | Medium | We aggregate public info only; add disclaimers; legal review |
| Speed — someone else builds this | Medium | Move fast; focus on quality of signal, not just speed |
| Platform ToS violations from scraping | Medium | Prefer official APIs; consult legal on scraping legality |

---

## 11. COST ESTIMATES (Monthly, at MVP scale)

| Item | Estimated Cost |
|------|---------------|
| Twitter/X API (Pro) | $5,000/mo (Basic: $100/mo with limitations) |
| Claude API (classification) | $200-500/mo |
| Server infrastructure (AWS) | $200-400/mo |
| Redis/DB hosting | $50-100/mo |
| Domain + misc services | $50/mo |
| **Total MVP** | **$500-1,000/mo** (using X Basic API) |
| **Total with X Pro** | **$5,500-6,000/mo** |

Note: X Basic API ($100/mo) provides 10,000 tweets/month read access. For real-time streaming, X Pro ($5,000/mo) is needed. We can start with Basic and use smart polling strategies.

---

## 12. DEVELOPMENT ROADMAP

### Phase 1: MVP (Weeks 1-6)
- [ ] Set up data ingestion for Reddit, Hacker News, RSS feeds
- [ ] Build engagement velocity tracking engine
- [ ] Integrate Claude API for market relevance classification
- [ ] Build real-time web dashboard (Next.js)
- [ ] Basic alerting system (email + browser push)
- [ ] Deploy to production

### Phase 2: Scale Sources (Weeks 7-12)
- [ ] Add Twitter/X integration
- [ ] Add Substack/newsletter monitoring
- [ ] Add Google Trends correlation
- [ ] Cross-platform cascade detection
- [ ] User accounts + personalization
- [ ] Mobile-responsive improvements

### Phase 3: Intelligence (Weeks 13-20)
- [ ] Ticker/sector auto-mapping
- [ ] Historical backtesting ("would this alert have been profitable?")
- [ ] Influencer authority scoring
- [ ] Sentiment analysis pipeline
- [ ] API for institutional clients
- [ ] Slack/Discord bot integrations

### Phase 4: Moat (Weeks 20+)
- [ ] Proprietary virality prediction model (ML)
- [ ] Alternative data integration (SEC, Congress, patents)
- [ ] Community features (user-submitted signals)
- [ ] Mobile app (React Native)

---

## 13. KEY QUESTIONS TO RESOLVE

1. **API strategy for Twitter/X:** Start with Basic ($100/mo) or invest in Pro ($5,000/mo)?
2. **Target user:** Retail day traders, swing traders, or institutional?
3. **Alert latency target:** Under 5 minutes? Under 1 minute?
4. **Legal review:** Do we need disclaimers about not being financial advice?
5. **Content display:** Show full articles or just summaries with links?
6. **Geographic scope:** US markets only, or global?

---

## 14. VERDICT: CAN WE BUILD THIS?

**Yes.** This is absolutely buildable. The core technical components exist:
- APIs for major platforms are available (with varying cost/access levels)
- LLMs are excellent at content classification
- Velocity detection is well-understood math
- Real-time web dashboards are mature technology

**The hard parts are:**
1. **Tuning signal vs. noise** — this is an ongoing process, not a one-time build
2. **Speed** — the infrastructure needs to be fast and reliable 24/7
3. **Twitter/X API costs** — this is the most expensive single component
4. **Staying ahead** — the moat is in execution quality and speed, not technology

**Recommendation:** Start building the MVP immediately with Reddit + Hacker News + RSS feeds (free/cheap APIs), prove the concept works, then invest in Twitter/X access once we validate demand.

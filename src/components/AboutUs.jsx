import aboutBg from '../assets/about-bg.jpg'

export default function AboutUs() {
  return (
    <section
      className='abt-page'
      id='abt-page'
      style={{ backgroundImage: `url(${aboutBg})` }}
    >
      <div className='abt-layout'>
        <div className='abt-msg'>
          <div className='abt-msg-header'>
            <span className='abt-tag'>About Us</span>
            <h2>Crafting Spaces You Are Proud to Call Home</h2>
          </div>
          <p className='abt-lead'>
            At C and J Real Estate, we turn the search for your dream property into a seamless experience. We curate quality residential estates and vast prime parcels across Central Luzon—combining strategic locations, pristine titles, and honest guidance so your family can build lasting legacies.
          </p>
          <div className='abt-stats-row'>
            <div className='abt-stat-item'>
              <span className='abt-stat-val'>18+</span>
              <span className='abt-stat-lbl'>Hectares Curated</span>
            </div>
            <div className='abt-stat-divider'></div>
            <div className='abt-stat-item'>
              <span className='abt-stat-val'>100%</span>
              <span className='abt-stat-lbl'>Clean Titles</span>
            </div>
            <div className='abt-stat-divider'></div>
            <div className='abt-stat-item'>
              <span className='abt-stat-val'>2</span>
              <span className='abt-stat-lbl'>Key Provinces</span>
            </div>
          </div>
        </div>

        <div className='abt-facts-container'>
          <div className='abt-facts-list'>
            <div className='abt-fact-card'>
              <div className='abt-fact-num'>
                <svg className='abt-service-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
              </div>
              <div className='abt-fact-content'>
                <h4>Title Verification and Due Diligence</h4>
                <p>Comprehensive title checks, Registry of Deeds validation, and tax clearance to ensure 100% clean, risk-free ownership before you commit.</p>
              </div>
            </div>

            <div className='abt-fact-card'>
              <div className='abt-fact-num'>
                <svg className='abt-service-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
              </div>
              <div className='abt-fact-content'>
                <h4>Prime Estate and Land Acquisition</h4>
                <p>Exclusive access to expansive agricultural, commercial, and residential parcels spanning Central Luzon’s fastest-growing corridors.</p>
              </div>
            </div>

            <div className='abt-fact-card'>
              <div className='abt-fact-num'>
                <svg className='abt-service-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="m9 16 2 2 4-4" />
                </svg>
              </div>
              <div className='abt-fact-content'>
                <h4>Guided Property Inspections and Site Visits</h4>
                <p>Personalized on-ground walkthroughs, boundary line verifications, and road accessibility checks facilitated by knowledgeable local specialists.</p>
              </div>
            </div>

            <div className='abt-fact-card'>
              <div className='abt-fact-num'>
                <svg className='abt-service-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className='abt-fact-content'>
                <h4>Flexible Financing and Direct Negotiations</h4>
                <p>Tailored payment terms, transparent per-square-meter direct landowner pricing, and assistance in securing workable payment milestones.</p>
              </div>
            </div>

            <div className='abt-fact-card'>
              <div className='abt-fact-num'>
                <svg className='abt-service-icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <polyline points="16 11 18 13 22 9" />
                </svg>
              </div>
              <div className='abt-fact-content'>
                <h4>End-to-End Transfer and Documentation</h4>
                <p>Full support handling notarized Deeds of Absolute Sale, Bureau of Internal Revenue (BIR) processing, transfer taxes, and certificate issuance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

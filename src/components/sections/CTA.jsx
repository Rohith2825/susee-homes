export default function CTA({ lang }) {
  return (
    <>
      <section className="cta-section" id="cta">
        <div className="container">
          <p className="eyebrow" style={{ color: 'rgba(255,255,255,.55)', marginBottom: '.75rem' }}>
            {lang === 'ta' ? 'தொடர்பு கொள்ளுங்கள்' : 'Get in Touch'}
          </p>
          <h2>
            {lang === 'ta'
              ? 'உங்கள் மனையை\nஇன்றே பதிவு செய்யுங்கள்.'
              : 'Reserve your plot.\nVisit the site today.'}
          </h2>
          <p>
            {lang === 'ta'
              ? 'எங்கள் குழு உங்களுடன் தனிப்பட்ட தள வருகையை ஏற்பாடு செய்ய தயாராக உள்ளது.'
              : 'Our team is ready to arrange a private site visit and walk you through available plots.'}
          </p>
          <div className="cta-buttons">
            <a
              href="https://wa.me/919626855553?text=Hi%2C%20I%27m%20interested%20in%20Project%20ALIGHT%20plots."
              className="btn btn-whatsapp"
              target="_blank" rel="noopener noreferrer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.552 4.1 1.518 5.828L.057 23.5l5.818-1.526A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.877 9.877 0 01-5.03-1.376l-.361-.214-3.733.98.995-3.643-.235-.374A9.885 9.885 0 012.118 12C2.118 6.525 6.525 2.118 12 2.118S21.882 6.525 21.882 12 17.475 21.882 12 21.882z"/>
              </svg>
              {lang === 'ta' ? 'WhatsApp அனுப்பு' : 'WhatsApp Us'}
            </a>
            <a href="tel:+919626855553" className="btn btn-call">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              {lang === 'ta' ? 'அழைக்கவும்: +91 96268 55553' : 'Call +91 96268 55553'}
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>
            © {new Date().getFullYear()} Susee Homes
            <span>·</span>
            {lang === 'ta' ? 'DTCP & RERA சான்றளிக்கப்பட்டது' : 'DTCP & RERA Certified'}
            <span>·</span>
            Poonamallee, Chennai
          </p>
        </div>
      </footer>
    </>
  );
}

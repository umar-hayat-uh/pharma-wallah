export function MedicalDisclaimerBanner() {
    return (
        <div className="banner" role="note">
            <span className="icon" aria-hidden="true">
                ⚠
            </span>
            <p>
                <strong>For reference only — not medical advice.</strong> This tool
                surfaces public US drug data (RxNorm, openFDA). It does not know your
                health history, current medications, or local (Pakistan) formulations.
                Always confirm with a pharmacist or physician before making any
                medication decision.
            </p>

            <style jsx>{`
        .banner {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          gap: 0.6rem;
          align-items: flex-start;
          background: #fff8ea;
          border: 1px solid #ecd8a2;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          line-height: 1.5;
          color: #5c4a1e;
        }
        .icon {
          flex-shrink: 0;
          font-size: 1rem;
          line-height: 1.5;
        }
        p {
          margin: 0;
        }
      `}</style>
        </div>
    );
}
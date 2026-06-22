/**
 * Public-site splash only — do not mount under /admin (blocks the panel at z-index 99999).
 */
export default function SitePreloader() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #mvr-preloader {
              position: fixed;
              inset: 0;
              z-index: 99999;
              background: #1a2f5e;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              transition: opacity 0.45s ease;
              pointer-events: none;
            }
            #mvr-preloader.hide {
              opacity: 0;
            }
            .mvr-preloader-logo {
              width: 96px;
              height: 96px;
              object-fit: contain;
              animation: mvrPulse 1.3s ease-in-out infinite;
            }
            .mvr-preloader-tagline {
              color: rgba(255,255,255,0.45);
              font-size: 12px;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              font-family: sans-serif;
              margin-top: 16px;
              font-weight: 300;
            }
            .mvr-bar {
              width: 160px;
              height: 2px;
              background: rgba(255,255,255,0.12);
              border-radius: 99px;
              margin-top: 20px;
              overflow: hidden;
            }
            .mvr-bar-fill {
              height: 100%;
              background: linear-gradient(90deg, transparent, #c9a84c, transparent);
              border-radius: 99px;
              animation: mvrLoading 1.5s ease-in-out infinite;
            }
            @keyframes mvrPulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.06); opacity: 0.88; }
            }
            @keyframes mvrLoading {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `,
        }}
      />
      <div id="mvr-preloader" aria-hidden="true" suppressHydrationWarning>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/web-app-manifest-512x512.png"
          alt=""
          className="mvr-preloader-logo"
          width={96}
          height={96}
        />
        <p className="mvr-preloader-tagline">Dream · Plan · Achieve</p>
        <div className="mvr-bar">
          <div className="mvr-bar-fill" />
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var el = document.getElementById('mvr-preloader');
              var alreadySeen = sessionStorage.getItem('mvr_preloader_shown');
              if (alreadySeen) {
                if (el) el.style.display = 'none';
                return;
              }
              function hide() {
                if (!el) return;
                el.classList.add('hide');
                setTimeout(function() { if (el) el.style.display = 'none'; }, 500);
                sessionStorage.setItem('mvr_preloader_shown', '1');
              }
              if (document.readyState === 'complete') {
                setTimeout(hide, 250);
              } else {
                window.addEventListener('load', function() { setTimeout(hide, 250); });
              }
              setTimeout(hide, 4000);
            })();
          `,
        }}
      />
    </>
  );
}

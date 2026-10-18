import Script from 'next/script'

/**
 * Yandex Metrika, only when YANDEX_METRIKA_ID is set (invariant 7: the id
 * lives in the environment, not in git) and only on the live site. The
 * standard counter snippet, loaded after the page is interactive so it never
 * competes with the content; the <noscript> pixel counts visits without JS.
 * Webvisor is off: it records sessions, which the privacy notice would have
 * to mention first.
 */
export function YandexMetrika() {
  const id = process.env.YANDEX_METRIKA_ID
  if (!id || !/^\d+$/.test(id)) return null

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
ym(${id},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- a tracking pixel, not content */}
          <img src={`https://mc.yandex.ru/watch/${id}`} style={{ position: 'absolute', left: '-9999px' }} alt="Счётчик посещений Яндекс Метрики" />
        </div>
      </noscript>
    </>
  )
}
